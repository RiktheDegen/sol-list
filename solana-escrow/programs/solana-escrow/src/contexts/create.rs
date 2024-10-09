use crate::{ErrorCode, Escrow, EscrowState};
use anchor_lang::prelude::*;

/// Accounts required for creating an escrow
#[derive(Accounts)]
#[instruction(id: u64, params: CreateParams)]
pub struct Create<'info> {
    #[account(mut)]
    pub seller: Signer<'info>,

    #[account(
        init,
        payer = seller,
        space = 8 + Escrow::INIT_SPACE,
        seeds = [b"escrow", seller.key().as_ref(), id.to_le_bytes().as_ref()],
        bump,
    )]
    pub escrow: Account<'info, Escrow>,

    pub system_program: Program<'info, System>,
}

/// Parameters for creating an escrow
#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateParams {
    pub buyer: Pubkey,
    pub arbiter: Pubkey,
    pub token_mint: Pubkey,
    pub amount: u64,
    pub auto_complete_duration: i64,
}

impl<'info> Create<'info> {
    /// Creates a new escrow account
    ///
    /// # Errors
    ///
    /// This function will return an error if:
    /// - The amount is zero
    /// - The buyer is the same as the seller
    /// - The buyer or arbiter address is the default public key
    /// - The auto-complete duration is negative
    pub fn create_escrow(
        &mut self,
        id: u64,
        params: &CreateParams,
        bumps: &CreateBumps,
    ) -> Result<()> {
        // 1. Checks
        require!(params.amount > 0, ErrorCode::InvalidAmount);
        require!(
            params.buyer != self.seller.key(),
            ErrorCode::BuyerCannotBeSeller
        );
        require!(
            params.buyer != Pubkey::default(),
            ErrorCode::InvalidBuyerAddress
        );
        require!(
            params.arbiter != Pubkey::default(),
            ErrorCode::InvalidArbiterAddress
        );
        require!(
            params.auto_complete_duration >= 0,
            ErrorCode::InvalidDuration
        );

        // 2. Effects
        self.escrow.set_inner(Escrow {
            version: 1,
            state: EscrowState::Created,
            id,
            seller: self.seller.key(),
            buyer: params.buyer,
            arbiter: params.arbiter,
            token_mint: params.token_mint,
            amount: params.amount,
            auto_complete_duration: params.auto_complete_duration,
            terms_update_slot: Clock::get()?.slot,
            marked_shipped_at: None,
            bump: bumps.escrow,
        });

        // 3. Interactions (none)

        Ok(())
    }
}
