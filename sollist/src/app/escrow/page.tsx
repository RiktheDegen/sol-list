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
  const [message, setMessage] = useState({ type: "", content: "" });
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
      setMessage({
        type: "error",
        content: "Program not initialized. Please connect your wallet.",
      });
      return;
    }

    setLoading(true);
    setMessage({ type: "", content: "" });

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
          setMessage({
            type: "success",
            content: "Escrow funded successfully.",
          });
          break;
        case "markShipped":
          await markEscrowAsShipped(program, new BN(escrow.id));
          setMessage({
            type: "success",
            content: "Escrow marked as shipped successfully.",
          });
          break;
        case "confirm":
          await buyerConfirm(
            program,
            escrow.seller.toBase58(),
            new BN(escrow.id)
          );
          setMessage({
            type: "success",
            content: "Escrow confirmed successfully.",
          });
          break;
        case "withdraw":
          await withdrawEscrow(program, new BN(escrow.id));
          setMessage({ type: "success", content: "Withdrawal successful." });
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      setMessage({
        type: "error",
        content: `Error: ${(error as Error).message}`,
      });
    } finally {
      setLoading(false);
      // Refresh escrows after action
      await fetchEscrows();
    }
  };

  // Function to display the escrow state as a string
  const getEscrowState = (state: any) => {
    const stateKeys = Object.keys(state);
    return stateKeys.find((key) => state[key]);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-6">
          Solana Escrow App
        </h1>

        {/* Wallet Connection Status */}
        <div className="flex justify-center mb-6">
          {publicKey ? (
            <p className="text-green-600">Connected: {publicKey.toBase58()}</p>
          ) : (
            <p className="text-red-600">Wallet not connected</p>
          )}
        </div>

        {/* Display Messages */}
        {message.content && (
          <div
            className={`mb-4 p-4 rounded ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.content}
          </div>
        )}

        {/* Create Escrow Form */}
        {publicKey && (
          <div className="mb-8">
            <CreateEscrowForm />
          </div>
        )}

        {/* Escrows List */}
        <h2 className="text-2xl font-semibold mb-4">Your Escrows</h2>
        {publicKey ? (
          escrows.length > 0 ? (
            <div className="overflow-auto">
              <table className="min-w-full bg-white border">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border">Escrow ID</th>
                    <th className="py-2 px-4 border">Role</th>
                    <th className="py-2 px-4 border">State</th>
                    <th className="py-2 px-4 border">Buyer</th>
                    <th className="py-2 px-4 border">Seller</th>
                    <th className="py-2 px-4 border">Amount</th>
                    <th className="py-2 px-4 border">Token</th>
                    <th className="py-2 px-4 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {escrows.map((escrowData) => {
                    const escrow = escrowData.account;
                    const isSeller = publicKey
                      ? escrow.seller.equals(publicKey)
                      : false;
                    const isBuyer = publicKey
                      ? escrow.buyer.equals(publicKey)
                      : false;
                    const role = isSeller ? "Seller" : "Buyer";
                    const state = getEscrowState(escrow.state);

                    // Get token info
                    const tokenInfo = TOKEN_INFO[
                      escrow.tokenMint.toBase58()
                    ] || {
                      symbol: "TOKEN",
                      decimals: 6,
                    };

                    // Format amount
                    const amountFormatted = (
                      escrow.amount.toNumber() /
                      Math.pow(10, tokenInfo.decimals)
                    ).toFixed(tokenInfo.decimals);

                    // Shorten buyer and seller addresses for display
                    const buyerAddressShort = `${escrow.buyer
                      .toBase58()
                      .slice(0, 4)}...${escrow.buyer.toBase58().slice(-4)}`;
                    const sellerAddressShort = `${escrow.seller
                      .toBase58()
                      .slice(0, 4)}...${escrow.seller.toBase58().slice(-4)}`;

                    // Determine available actions based on role and state
                    const actions = [];
                    if (isBuyer && state === "created") {
                      actions.push("fund");
                    }
                    if (isSeller && state === "funded") {
                      actions.push("markShipped");
                    }
                    if (isBuyer && state === "markedAsShipped") {
                      actions.push("confirm");
                    }
                    if (isSeller && state === "buyerConfirmed") {
                      actions.push("withdraw");
                    }
                    return (
                      <tr key={escrowData.publicKey.toBase58()}>
                        <td className="py-2 px-4 text-center border">
                          {escrow.id.toString()}
                        </td>
                        <td className="py-2 px-4 text-center border">{role}</td>
                        <td className="py-2 px-4 text-center border">
                          {state}
                        </td>
                        <td className="py-2 px-4 text-center border">
                          {buyerAddressShort}
                        </td>
                        <td className="py-2 px-4 text-center border">
                          {sellerAddressShort}
                        </td>
                        <td className="py-2 px-4 text-center border">
                          {amountFormatted} {tokenInfo.symbol}
                        </td>
                        <td className="py-2 px-4 text-center border">
                          {tokenInfo.symbol}
                        </td>
                        <td className="py-2 px-4 text-center border">
                          {actions.map((action) => (
                            <button
                              key={action}
                              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-2 ${
                                loading ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                              onClick={() => handleAction(escrow, action)}
                              disabled={loading}
                            >
                              {loading ? "Processing..." : action}
                            </button>
                          ))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No escrows found.</p>
          )
        ) : (
          <p>Please connect your wallet to view your escrows.</p>
        )}
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded">
            <p className="text-lg">Processing transaction...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EscrowApp;
