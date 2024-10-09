use crate::{ErrorCode, Escrow, EscrowState};
use anchor_lang::prelude::*;

/// Accounts required for the buyer to confirm receipt of goods
#[derive(Accounts)]
pub struct BuyerConfirm<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(
        mut,
        has_one = buyer @ ErrorCode::InvalidBuyer,
        constraint = escrow.state == EscrowState::MarkedAsShipped @ ErrorCode::InvalidEscrowState,
        seeds = [b"escrow", escrow.seller.as_ref(), escrow.id.to_le_bytes().as_ref()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, Escrow>,
}

impl<'info> BuyerConfirm<'info> {
    /// Confirms receipt of goods by the buyer
    ///
    /// # Errors
    ///
    /// This function will return an error if the escrow state is not MarkedAsShipped
    pub fn confirm_receipt(&mut self) -> Result<()> {
        // 1. Checks (see account constraints)

        // 2. Effects
        self.escrow.state = EscrowState::BuyerConfirmed;

        // 3. Interactions (none)

        Ok(())
    }
}
