pub mod contexts;
pub mod error;
pub mod state;

use anchor_lang::prelude::*;

use contexts::*;
pub use error::ErrorCode;
use state::*;

declare_id!("8t7UeXfcxPMC8pzZVhhKzAqvFWCBq8pC2QGdCegctVmr");

#[program]
pub mod solana_escrow {
    use super::*;

    pub fn create(ctx: Context<Create>, id: u64, params: CreateParams) -> Result<()> {
        msg!("Create function called");
        msg!("ID: {}", id);
        msg!("Buyer: {:?}", params.buyer);
        msg!("Amount: {}", params.amount);

        ctx.accounts.create_escrow(id, &params, &ctx.bumps)
    }

    pub fn fund(ctx: Context<Fund>, terms_update_slot: u64) -> Result<()> {
        msg!("Fund function called");
        msg!("Terms update slot: {}", terms_update_slot);

        ctx.accounts.fund_escrow()
    }

    pub fn mark_shipped(ctx: Context<MarkShipped>) -> Result<()> {
        msg!("Mark shipped function called");

        ctx.accounts.mark_escrow_shipped()
    }

    pub fn buyer_confirm(ctx: Context<BuyerConfirm>) -> Result<()> {
        msg!("Buyer confirm function called");

        ctx.accounts.confirm_receipt()
    }

    pub fn withdraw(ctx: Context<Withdraw>) -> Result<()> {
        msg!("Withdraw function called");

        ctx.accounts.withdraw_from_escrow()
    }
}
