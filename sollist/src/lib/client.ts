import { PublicKey } from "@solana/web3.js";
import { Program, BN } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";

import { SolanaEscrow } from "./solana_escrow"; // Make sure this type is correctly defined

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
  await program.methods
    .create(escrowId, {
      buyer: new PublicKey(params.buyer),
      arbiter: new PublicKey(params.arbiter),
      tokenMint: new PublicKey(params.tokenMint),
      amount: params.amount,
      autoCompleteDuration: params.duration,
    })
    .accounts({
      seller: program.provider.publicKey,
    })
    .rpc();
};

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

  await program.methods
    .fund(new BN(escrowAccount.termsUpdateSlot))
    .accounts({
      tokenMint,
      tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
    })
    .rpc();
};

export const markEscrowAsShipped = async (
  program: Program<SolanaEscrow>,
  escrowId: BN
) => {
  const [escrowPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("escrow"),
      program.provider.publicKey!.toBuffer(),
      escrowId.toArrayLike(Buffer, "le", 8),
    ],
    program.programId
  );

  await program.methods
    .markShipped()
    .accounts({
      seller: program.provider.publicKey,
      escrow: escrowPda,
    })
    .rpc();
};

export const buyerConfirm = async (
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

  await program.methods
    .buyerConfirm()
    .accounts({
      buyer: program.provider.publicKey,
      escrow: escrowPda,
    })
    .rpc();
};

export const withdrawEscrow = async (
  program: Program<SolanaEscrow>,
  escrowId: BN
) => {
  const [escrowPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("escrow"),
      program.provider.publicKey!.toBuffer(),
      escrowId.toArrayLike(Buffer, "le", 8),
    ],
    program.programId
  );

  const escrowAccount = await program.account.escrow.fetch(escrowPda);
  const tokenMint = escrowAccount.tokenMint as PublicKey;

  const vaultPda = await anchor.utils.token.associatedAddress({
    mint: tokenMint,
    owner: escrowPda,
  });

  const sellerTokenAccount = await anchor.utils.token.associatedAddress({
    mint: tokenMint,
    owner: program.provider.publicKey!,
  });

  await program.methods
    .withdraw()
    .accounts({
      tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
    })
    .rpc();
};
