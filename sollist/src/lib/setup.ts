import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { IdlAccounts, Program } from "@coral-xyz/anchor";
import type { SolanaEscrow } from "./solana_escrow";
import idl from "./solana_escrow.json";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

export const program = new Program(idl as SolanaEscrow, {
  connection,
});

export const [mintPDA] = PublicKey.findProgramAddressSync(
  [Buffer.from("mint")],
  program.programId
);

export const [counterPDA] = PublicKey.findProgramAddressSync(
  [Buffer.from("counter")],
  program.programId
);

export type CounterData = IdlAccounts<SolanaEscrow>["escrow"];
