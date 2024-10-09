use crate::{ErrorCode, Escrow, EscrowState};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct MarkShipped<'info> {
    #[account(mut)]
    pub seller: Signer<'info>,

    #[account(
        mut,
        has_one = seller @ ErrorCode::InvalidSeller,
        constraint = escrow.state == EscrowState::Funded @ ErrorCode::InvalidEscrowState,
        seeds = [b"escrow", escrow.seller.as_ref(), escrow.id.to_le_bytes().as_ref()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, Escrow>,
}

impl<'info> MarkShipped<'info> {
    pub fn mark_escrow_shipped(&mut self) -> Result<()> {
        // 1. Checks (see account constraints)

        // 2. Effects
        self.escrow.state = EscrowState::MarkedAsShipped;
        self.escrow.marked_shipped_at = Some(Clock::get()?.unix_timestamp);

        // 3. Interactions (none)

        Ok(())
    }
}
