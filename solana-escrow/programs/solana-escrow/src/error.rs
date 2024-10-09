use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Buyer cannot be the seller")]
    BuyerCannotBeSeller,
    #[msg("Invalid buyer address")]
    InvalidBuyerAddress,
    #[msg("Invalid arbiter address")]
    InvalidArbiterAddress,
    #[msg("Invalid buyer")]
    InvalidBuyer,
    #[msg("Invalid escrow state")]
    InvalidEscrowState,
    #[msg("Invalid token mint")]
    InvalidTokenMint,
    #[msg("Terms have changed")]
    TermsChanged,
    #[msg("Insufficient funds")]
    InsufficientFunds,
    #[msg("Invalid seller")]
    InvalidSeller,
    #[msg("Escrow not shipped")]
    EscrowNotShipped,
    #[msg("Withdraw too early")]
    WithdrawTooEarly,
    #[msg("Invalid duration")]
    InvalidDuration,
    #[msg("Invalid vault balance")]
    InvalidVaultBalance,
}
