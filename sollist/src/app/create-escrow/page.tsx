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
