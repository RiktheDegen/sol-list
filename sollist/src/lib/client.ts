import { PublicKey } from "@solana/web3.js";
import { Program, BN } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import { SolanaEscrow } from "./solana_escrow";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";

/**
 * Creates a new escrow.
 * @param program - The Anchor program instance.
 * @param escrowId - The unique ID for the escrow.
 * @param params - Parameters required to create the escrow.
 */
export const createEscrow = async (
  program: Program<SolanaEscrow>,
  escrowId: BN,
  params: {
    buyer: string;
    arbiter: string;
    tokenMint: string;
    amount: BN;
    duration: BN;
  }
) => {
  const sellerPubKey = program.provider.publicKey;
  if (!sellerPubKey) {
    throw new Error("Seller's public key is not available.");
  }

  // Compute the escrow PDA
  const [escrowPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("escrow"),
      sellerPubKey.toBuffer(),
      escrowId.toArrayLike(Buffer, "le", 8),
    ],
    program.programId
  );

  await program.methods
    .create(escrowId, {
      buyer: new PublicKey(params.buyer),
      arbiter: new PublicKey(params.arbiter),
      tokenMint: new PublicKey(params.tokenMint),
      amount: params.amount,
      autoCompleteDuration: params.duration,
    })
    .accountsPartial({
      seller: sellerPubKey,
      escrow: escrowPda,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();
};

/**
 * Funds an existing escrow.
 * @param program - The Anchor program instance.
 * @param sellerPublicKey - The public key of the seller.
 * @param escrowId - The unique ID for the escrow.
 */
export const fundEscrow = async (
  program: Program<SolanaEscrow>,
  sellerPublicKey: string,
  escrowId: BN
) => {
  const sellerPubKey = new PublicKey(sellerPublicKey);

  const [escrowPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("escrow"),
      sellerPubKey.toBuffer(),
      escrowId.toArrayLike(Buffer, "le", 8),
    ],
    program.programId
  );

  const escrowAccount = await program.account.escrow.fetch(escrowPda);

  const tokenMint = escrowAccount.tokenMint as PublicKey;

  const buyerPubKey = program.provider.publicKey;
  if (!buyerPubKey) {
    throw new Error("Buyer public key is not available.");
  }

  // Compute the buyer's associated token account
  const buyerTokenAccount = getAssociatedTokenAddressSync(
    tokenMint,
    buyerPubKey
  );

  // Compute the vault (escrow's associated token account)
  const vault = getAssociatedTokenAddressSync(
    tokenMint,
    escrowPda,
    true // allowOwnerOffCurve for PDAs
  );

  await program.methods
    .fund(new BN(escrowAccount.termsUpdateSlot))
    .accountsPartial({
      buyer: buyerPubKey,
      escrow: escrowPda,
      tokenMint: tokenMint,
      buyerTokenAccount: buyerTokenAccount,
      vault: vault,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();
};

/**
 * Marks an escrow as shipped.
 * @param program - The Anchor program instance.
 * @param escrowId - The unique ID for the escrow.
 */
export const markEscrowAsShipped = async (
  program: Program<SolanaEscrow>,
  escrowId: BN
) => {
  const sellerPubKey = program.provider.publicKey;
  if (!sellerPubKey) {
    throw new Error("Seller's public key is not available.");
  }

  const [escrowPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("escrow"),
      sellerPubKey.toBuffer(),
      escrowId.toArrayLike(Buffer, "le", 8),
    ],
    program.programId
  );

  await program.methods
    .markShipped()
    .accounts({
      seller: sellerPubKey,
      escrow: escrowPda,
    })
    .rpc();
};

/**
 * Confirms receipt of the item by the buyer.
 * @param program - The Anchor program instance.
 * @param sellerPublicKey - The public key of the seller.
 * @param escrowId - The unique ID for the escrow.
 */
export const buyerConfirm = async (
  program: Program<SolanaEscrow>,
  sellerPublicKey: string,
  escrowId: BN
) => {
  const sellerPubKey = new PublicKey(sellerPublicKey);

  const buyerPubKey = program.provider.publicKey;
  if (!buyerPubKey) {
    throw new Error("Buyer public key is not available.");
  }

  const [escrowPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("escrow"),
      sellerPubKey.toBuffer(),
      escrowId.toArrayLike(Buffer, "le", 8),
    ],
    program.programId
  );

  await program.methods
    .buyerConfirm()
    .accounts({
      buyer: buyerPubKey,
      escrow: escrowPda,
    })
    .rpc();
};

/**
 * Withdraws funds from the escrow by the seller.
 * @param program - The Anchor program instance.
 * @param escrowId - The unique ID for the escrow.
 */
export const withdrawEscrow = async (
  program: Program<SolanaEscrow>,
  escrowId: BN
) => {
  const sellerPubKey = program.provider.publicKey;
  if (!sellerPubKey) {
    throw new Error("Seller's public key is not available.");
  }

  const [escrowPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("escrow"),
      sellerPubKey.toBuffer(),
      escrowId.toArrayLike(Buffer, "le", 8),
    ],
    program.programId
  );

  const escrowAccount = await program.account.escrow.fetch(escrowPda);
  const tokenMint = escrowAccount.tokenMint as PublicKey;

  // Compute the vault (escrow's associated token account)
  const vault = getAssociatedTokenAddressSync(
    tokenMint,
    escrowPda,
    true // allowOwnerOffCurve for PDAs
  );

  // Compute the seller's associated token account
  const sellerTokenAccount = getAssociatedTokenAddressSync(
    tokenMint,
    sellerPubKey
  );

  await program.methods
    .withdraw()
    .accountsPartial({
      seller: sellerPubKey,
      escrow: escrowPda,
      vault: vault,
      sellerTokenAccount: sellerTokenAccount,
      tokenMint: tokenMint,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();
};
