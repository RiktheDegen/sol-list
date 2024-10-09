use anchor_lang::prelude::*;

/// Escrow account structure
#[account]
#[derive(InitSpace)]
pub struct Escrow {
    /// Version for potential upgrades
    pub version: u8,
    pub state: EscrowState,

    /// id and seller are seeds for PDA
    pub id: u64,
    pub seller: Pubkey,

    // Escrow terms (modifiable by seller before funding)
    pub buyer: Pubkey,
    pub arbiter: Pubkey,
    pub token_mint: Pubkey,
    pub amount: u64,
    /// Duration (in seconds) after shipping before seller can mark as completed if not disputed
    pub auto_complete_duration: i64,

    /// Slot at which the escrow terms were last updated
    pub terms_update_slot: u64,
    /// Unix timestamp when the item was marked as shipped (None if not shipped)
    pub marked_shipped_at: Option<i64>,

    /// PDA bump
    pub bump: u8,
}

/// Represents the current state of the escrow
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum EscrowState {
    Created,
    Funded,
    MarkedAsShipped,
    BuyerConfirmed,
    FundsReleased,
    Cancelled,
}
