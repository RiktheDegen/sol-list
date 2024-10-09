import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { SolanaEscrow } from "../target/types/solana_escrow";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  createInitializeMint2Instruction,
  createMintToInstruction,
  getAssociatedTokenAddressSync,
  getMinimumBalanceForRentExemptMint,
} from "@solana/spl-token";
import { randomBytes } from "crypto";

describe("Solana Escrow Program", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SolanaEscrow as Program<SolanaEscrow>;
  const connection = provider.connection;
  const tokenProgram = TOKEN_2022_PROGRAM_ID;

  const [seller, buyer, arbiter] = [
    Keypair.generate(),
    Keypair.generate(),
    Keypair.generate(),
  ];
  const [mintA, mintB] = [Keypair.generate(), Keypair.generate()];
  const [buyerAtaA, buyerAtaB] = [mintA, mintB].map((mint) =>
    getAssociatedTokenAddressSync(
      mint.publicKey,
      buyer.publicKey,
      false,
      tokenProgram
    )
  );

  let escrowPda: PublicKey;
  let escrowSeed: BN;

  const logTransaction = (signature: string) => {
    console.log(
      `Transaction: https://explorer.solana.com/tx/${signature}?cluster=custom&customUrl=${connection.rpcEndpoint}`
    );
  };

  const setupMintAndTokenAccounts = async () => {
    const lamports = await getMinimumBalanceForRentExemptMint(connection);
    const setupTx = new Transaction();

    setupTx.add(
      SystemProgram.transfer({
        fromPubkey: provider.publicKey,
        toPubkey: seller.publicKey,
        lamports: 2 * LAMPORTS_PER_SOL,
      }),
      SystemProgram.transfer({
        fromPubkey: provider.publicKey,
        toPubkey: buyer.publicKey,
        lamports: 2 * LAMPORTS_PER_SOL,
      })
    );

    [mintA, mintB].forEach((mint) => {
      setupTx.add(
        SystemProgram.createAccount({
          fromPubkey: provider.publicKey,
          newAccountPubkey: mint.publicKey,
          lamports,
          space: 82,
          programId: tokenProgram,
        }),
        createInitializeMint2Instruction(
          mint.publicKey,
          6,
          buyer.publicKey,
          null,
          tokenProgram
        )
      );
    });

    [
      { mint: mintA.publicKey, ata: buyerAtaA },
      { mint: mintB.publicKey, ata: buyerAtaB },
    ].forEach(({ mint, ata }) => {
      setupTx.add(
        createAssociatedTokenAccountIdempotentInstruction(
          provider.publicKey,
          ata,
          buyer.publicKey,
          mint,
          tokenProgram
        ),
        createMintToInstruction(
          mint,
          ata,
          buyer.publicKey,
          1e9,
          undefined,
          tokenProgram
        )
      );
    });

    const signature = await provider.sendAndConfirm(setupTx, [
      mintA,
      mintB,
      buyer,
    ]);
    logTransaction(signature);
  };

  before(async () => {
    await setupMintAndTokenAccounts();
  });

  it("should create escrow", async () => {
    escrowSeed = new BN(randomBytes(8));
    escrowPda = PublicKey.findProgramAddressSync(
      [
        Buffer.from("escrow"),
        seller.publicKey.toBuffer(),
        escrowSeed.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    )[0];

    const createEscrowAccounts = {
      seller: seller.publicKey,
      escrowPda,
      systemProgram: SystemProgram.programId,
    };

    const signature = await program.methods
      .create(escrowSeed, {
        buyer: buyer.publicKey,
        arbiter: arbiter.publicKey,
        tokenMint: mintA.publicKey,
        amount: new BN(69e6),
        autoCompleteDuration: new BN(0),
      })
      .accounts(createEscrowAccounts)
      .signers([seller])
      .rpc();

    logTransaction(signature);
    console.log("Escrow created successfully");
  });

  it("should fund escrow", async () => {
    const escrowAccount = await program.account.escrow.fetch(escrowPda);
    const vaultAddress = getAssociatedTokenAddressSync(
      mintA.publicKey,
      escrowPda,
      true,
      tokenProgram
    );

    const fundEscrowAccounts = {
      buyer: buyer.publicKey,
      escrow: escrowPda,
      tokenMint: mintA.publicKey,
      buyerTokenAccount: buyerAtaA,
      vault: vaultAddress,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      tokenProgram,
      systemProgram: SystemProgram.programId,
    };

    const signature = await program.methods
      .fund(new BN(escrowAccount.termsUpdateSlot))
      .accounts(fundEscrowAccounts)
      .signers([buyer])
      .rpc();

    logTransaction(signature);
    console.log("Escrow funded successfully");
  });

  it("should mark escrow as shipped", async () => {
    const markShippedAccounts = {
      seller: seller.publicKey,
      escrow: escrowPda,
    };

    const signature = await program.methods
      .markShipped()
      .accounts(markShippedAccounts)
      .signers([seller])
      .rpc();
    logTransaction(signature);
    console.log("Escrow marked as shipped");
  });

  it("should confirm receipt", async () => {
    const buyerConfirmAccounts = {
      buyer: buyer.publicKey,
      escrow: escrowPda,
    };

    const signature = await program.methods
      .buyerConfirm()
      .accounts(buyerConfirmAccounts)
      .signers([buyer])
      .rpc();
    logTransaction(signature);
    console.log("Buyer confirmed receipt");
  });

  it("should allow seller to withdraw funds", async () => {
    const escrowAccount = await program.account.escrow.fetch(escrowPda);
    const vaultAddress = getAssociatedTokenAddressSync(
      escrowAccount.tokenMint,
      escrowPda,
      true,
      tokenProgram
    );

    const withdrawAccounts = {
      seller: seller.publicKey,
      escrow: escrowPda,
      vault: vaultAddress,
      sellerTokenAccount: getAssociatedTokenAddressSync(
        escrowAccount.tokenMint,
        seller.publicKey,
        false,
        tokenProgram
      ),
      tokenMint: escrowAccount.tokenMint,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      tokenProgram,
      systemProgram: SystemProgram.programId,
    };

    const signature = await program.methods
      .withdraw()
      .accounts(withdrawAccounts)
      .signers([seller])
      .rpc();
    logTransaction(signature);
    console.log("Seller withdrew funds");
  });
});
