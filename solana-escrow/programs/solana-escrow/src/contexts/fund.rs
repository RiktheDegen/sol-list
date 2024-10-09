use crate::{ErrorCode, Escrow, EscrowState};
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked},
};

/// Accounts required for funding an escrow
#[derive(Accounts)]
#[instruction(terms_update_slot: u64)]
pub struct Fund<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(
        mut,
        has_one = buyer @ ErrorCode::InvalidBuyer,
        constraint = escrow.state == EscrowState::Created @ ErrorCode::InvalidEscrowState,
        constraint = escrow.token_mint == token_mint.key() @ ErrorCode::InvalidTokenMint,
        constraint = escrow.terms_update_slot == terms_update_slot @ ErrorCode::TermsChanged,
        seeds = [b"escrow", escrow.seller.as_ref(), escrow.id.to_le_bytes().as_ref()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, Escrow>,

    pub token_mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::authority = buyer,
        associated_token::token_program = token_program,
    )]
    pub buyer_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init,
        payer = buyer,
        associated_token::mint = token_mint,
        associated_token::authority = escrow,
        associated_token::token_program = token_program,
    )]
    pub vault: Box<InterfaceAccount<'info, TokenAccount>>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

impl<'info> Fund<'info> {
    /// Funds the escrow by transferring tokens from the buyer to the vault
    ///
    /// # Errors
    ///
    /// This function will return an error if:
    /// - The buyer has insufficient funds
    /// - The token transfer fails
    pub fn fund_escrow(&mut self) -> Result<()> {
        // 1. Checks
        require!(
            self.buyer_token_account.amount >= self.escrow.amount,
            ErrorCode::InsufficientFunds
        );

        // 2. Effects
        self.escrow.state = EscrowState::Funded;

        // 3. Interactions
        let transfer_accounts = TransferChecked {
            from: self.buyer_token_account.to_account_info(),
            mint: self.token_mint.to_account_info(),
            to: self.vault.to_account_info(),
            authority: self.buyer.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(self.token_program.to_account_info(), transfer_accounts);
        transfer_checked(cpi_ctx, self.escrow.amount, self.token_mint.decimals)?;

        Ok(())
    }
}
