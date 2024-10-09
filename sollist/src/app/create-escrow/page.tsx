"use client";

import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEscrowProgram } from "@/lib/useEscrowProgram";
import {
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { BN, ProgramAccount } from "@coral-xyz/anchor";
import {
  fundEscrow,
  markEscrowAsShipped,
  buyerConfirm,
  withdrawEscrow,
} from "@/lib/client";
import CreateEscrowForm from "@/components/CreateEscrowForm";
import {
  TOKEN_PROGRAM_ID,
  NATIVE_MINT,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createSyncNativeInstruction,
  createCloseAccountInstruction,
} from "@solana/spl-token";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";

type EscrowData = ProgramAccount<{
  version: number;
  state: any;
  id: BN;
  seller: PublicKey;
  buyer: PublicKey;
  arbiter: PublicKey;
  tokenMint: PublicKey;
  amount: BN;
  autoCompleteDuration: BN;
  termsUpdateSlot: BN;
  markedShippedAt: any;
  bump: number;
}>;

const TOKEN_INFO: { [key: string]: { symbol: string; decimals: number } } = {
  "9vxL9ZauTmHe55H4sXZoWvxJVyFdrzaqNBawBmtDx1ww": {
    symbol: "USDC",
    decimals: 6,
  },
  [NATIVE_MINT.toBase58()]: { symbol: "SOL", decimals: 9 },
};

const EscrowApp = () => {
  const { publicKey, signTransaction } = useWallet();
  const { program } = useEscrowProgram();
  const [escrows, setEscrows] = useState<EscrowData[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch escrows where the user is the buyer or seller
  const fetchEscrows = async () => {
    if (!program || !publicKey) {
      setEscrows([]); // Clear escrows when wallet is disconnected
      return;
    }

    try {
      // Fetch all escrows
      const escrowAccounts = await program.account.escrow.all();

      // Filter escrows where the user is the buyer or seller
      const userEscrows = escrowAccounts.filter((account) => {
        const escrow = account.account;
        return (
          escrow.buyer.equals(publicKey) || escrow.seller.equals(publicKey)
        );
      });

      setEscrows(userEscrows);
    } catch (error) {
      console.error("Error fetching escrows:", error);
    }
  };

  useEffect(() => {
    fetchEscrows();
  }, [program, publicKey]);

  // Handle actions like fund, markShipped, confirm, withdraw
  const handleAction = async (
    escrow: EscrowData["account"],
    action: string
  ) => {
    if (!program || !publicKey) {
      toast.error("Program not initialized. Please connect your wallet.");
      return;
    }

    const isSeller = escrow.seller.equals(publicKey);
    const isBuyer = escrow.buyer.equals(publicKey);

    // Authorization checks
    if (action === "fund" && !isBuyer) {
      toast.error("Only the buyer can fund the escrow.");
      return;
    }

    if (action === "markShipped" && !isSeller) {
      toast.error("Only the seller can mark the escrow as shipped.");
      return;
    }

    if (action === "confirm" && !isBuyer) {
      toast.error("Only the buyer can confirm receipt.");
      return;
    }

    if (action === "withdraw" && !isSeller) {
      toast.error("Only the seller can withdraw the funds.");
      return;
    }

    setLoading(true);

    try {
      const connection = program.provider.connection;
      const tokenMintAddress = escrow.tokenMint.toBase58();
      const tokenInfo = TOKEN_INFO[tokenMintAddress] || {
        symbol: "TOKEN",
        decimals: 6,
      };

      // If the action is 'fund' and the token is SOL, wrap SOL to WSOL
      if (action === "fund" && tokenInfo.symbol === "SOL") {
        let blockhash = (await connection.getLatestBlockhash("finalized"))
          .blockhash;
        // Compute the buyer's associated token account for WSOL
        const ata = await getAssociatedTokenAddress(
          NATIVE_MINT,
          publicKey,
          false
        );

        // Check if the ATA exists
        const ataInfo = await connection.getAccountInfo(ata);

        const instructions = [];

        // If the ATA doesn't exist, create it
        if (!ataInfo) {
          instructions.push(
            createAssociatedTokenAccountInstruction(
              publicKey,
              ata,
              publicKey,
              NATIVE_MINT
            )
          );
        }

        // Transfer SOL to the WSOL ATA (wrapping SOL)
        instructions.push(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: ata,
            lamports: escrow.amount.toNumber(),
          })
        );

        // Sync the native account
        instructions.push(createSyncNativeInstruction(ata));

        const transaction = new Transaction().add(...instructions);
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = publicKey;

        // Sign and send the transaction
        const signedTransaction = await signTransaction(transaction);
        const txid = await connection.sendRawTransaction(
          signedTransaction.serialize()
        );
        await connection.confirmTransaction(txid, "confirmed");
      }

      // Proceed with the action
      switch (action) {
        case "fund":
          await fundEscrow(
            program,
            escrow.seller.toBase58(),
            new BN(escrow.id)
          );
          toast.success("Escrow funded successfully.");
          toast.info("Waiting for the seller to mark the item as shipped.");
          break;
        case "markShipped":
          await markEscrowAsShipped(program, new BN(escrow.id));
          toast.success("Escrow marked as shipped successfully.");
          toast.info("Waiting for the buyer to confirm receipt.");
          break;
        case "confirm":
          await buyerConfirm(
            program,
            escrow.seller.toBase58(),
            new BN(escrow.id)
          );
          toast.success("You have confirmed receipt.");
          toast.info("Seller can now withdraw the funds.");
          break;
        case "withdraw":
          await withdrawEscrow(program, new BN(escrow.id));
          toast.success("Withdrawal successful.");
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      const errorMessage = (error as Error).message;

      if (errorMessage.includes("User rejected the request")) {
        toast.warn("Transaction canceled.");
      } else if (errorMessage.includes("insufficient funds")) {
        toast.error("Insufficient funds to complete the transaction.");
      } else {
        toast.error(`Error: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
      // Refresh escrows after action
      await fetchEscrows();
    }
  };

  // Function to display the escrow state as a string and get color classes
  const getEscrowState = (state: any) => {
    const stateKey = Object.keys(state).find((key) => state[key]);
    const stateColors: { [key: string]: string } = {
      created: "bg-gray-200 text-gray-800",
      funded: "bg-blue-200 text-blue-800",
      markedAsShipped: "bg-orange-200 text-orange-800",
      buyerConfirmed: "bg-green-200 text-green-800",
      fundsReleased: "bg-purple-200 text-purple-800",
      cancelled: "bg-red-200 text-red-800",
    };
    return {
      name: stateKey,
      colorClass: stateColors[stateKey] || "bg-gray-200 text-gray-800",
    };
  };

  // Action button colors
  const actionButtonColors: { [key: string]: string } = {
    fund: "bg-blue-600",
    markShipped: "bg-orange-600",
    confirm: "bg-green-600",
    withdraw: "bg-purple-600",
  };

  const actionButtonHoverColors: { [key: string]: string } = {
    fund: "bg-blue-700",
    markShipped: "bg-orange-700",
    confirm: "bg-green-700",
    withdraw: "bg-purple-700",
  };

  return (
    <div className="max-w-5xl mx-auto bg-white">
      {/* Create Escrow Form */}
      {publicKey && (
        <div className="shadow-lg ">
          <CreateEscrowForm />
        </div>
      )}
    </div>
  );
};

export default EscrowApp;
