use crate::{ErrorCode, Escrow, EscrowState};
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{
        close_account, transfer_checked, CloseAccount, Mint, TokenAccount, TokenInterface,
        TransferChecked,
    },
};

/// Accounts required for withdrawing from an escrow
#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub seller: Signer<'info>,

    #[account(
        mut,
        has_one = seller @ ErrorCode::InvalidSeller,
        has_one = token_mint @ ErrorCode::InvalidTokenMint,
        close = seller,
        constraint = (escrow.state == EscrowState::MarkedAsShipped || escrow.state == EscrowState::BuyerConfirmed) @ ErrorCode::InvalidEscrowState,
        seeds = [b"escrow", escrow.seller.as_ref(), escrow.id.to_le_bytes().as_ref()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, Escrow>,

    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::authority = escrow,
        associated_token::token_program = token_program,
    )]
    pub vault: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = seller,
        associated_token::mint = token_mint,
        associated_token::authority = seller,
        associated_token::token_program = token_program,
    )]
    pub seller_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    pub token_mint: InterfaceAccount<'info, Mint>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

impl<'info> Withdraw<'info> {
    /// Withdraws funds from the escrow to the seller
    ///
    /// # Errors
    ///
    /// This function will return an error if:
    /// - The escrow is not in the MarkedAsShipped or BuyerConfirmed state
    /// - The withdrawal is attempted too early (for MarkedAsShipped state)
    /// - The vault balance does not match the escrow amount
    /// - The token transfer or account closing fails
    pub fn withdraw_from_escrow(&mut self) -> Result<()> {
        // 1. Checks
        let clock = Clock::get()?;
        let current_time = clock.unix_timestamp;

        match self.escrow.state {
            EscrowState::MarkedAsShipped => {
                let marked_shipped_at = self
                    .escrow
                    .marked_shipped_at
                    .ok_or(ErrorCode::EscrowNotShipped)?;
                require!(
                    current_time >= marked_shipped_at + self.escrow.auto_complete_duration,
                    ErrorCode::WithdrawTooEarly
                );
            }
            EscrowState::BuyerConfirmed => {}
            _ => return Err(ErrorCode::InvalidEscrowState.into()),
        }

        require!(
            self.vault.amount == self.escrow.amount,
            ErrorCode::InvalidVaultBalance
        );

        // 2. Effects
        self.escrow.state = EscrowState::FundsReleased;

        // 3. Interactions
        let seller_key = self.seller.key();
        let escrow_seeds = &[
            b"escrow",
            seller_key.as_ref(),
            &self.escrow.id.to_le_bytes(),
            &[self.escrow.bump],
        ];
        let signer_seeds = &[&escrow_seeds[..]];

        // Transfer tokens from vault to seller
        let transfer_accounts = TransferChecked {
            from: self.vault.to_account_info(),
            mint: self.token_mint.to_account_info(),
            to: self.seller_token_account.to_account_info(),
            authority: self.escrow.to_account_info(),
        };
        let cpi_ctx = CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            transfer_accounts,
            signer_seeds,
        );
        transfer_checked(cpi_ctx, self.escrow.amount, self.token_mint.decimals)?;

        // Close the vault account
        let close_accounts = CloseAccount {
            account: self.vault.to_account_info(),
            destination: self.seller.to_account_info(),
            authority: self.escrow.to_account_info(),
        };
        let cpi_ctx = CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            close_accounts,
            signer_seeds,
        );
        close_account(cpi_ctx)?;

        Ok(())
    }
}
