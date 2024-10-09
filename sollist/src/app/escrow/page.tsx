"use client";

import React, { ChangeEventHandler, FormEventHandler, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { BN } from "@coral-xyz/anchor";
import { createEscrow } from "../../lib/client";
import { useEscrowProgram } from "@/lib/useEscrowProgram";

const TestCreateEscrow = () => {
  const { publicKey } = useWallet();
  const { program } = useEscrowProgram();

  const [formValues, setFormValues] = useState({
    id: "",
    buyer: "",
    arbiter: "",
    tokenMint: "9vxL9ZauTmHe55H4sXZoWvxJVyFdrzaqNBawBmtDx1ww", // Pre-filled with USDC Devnet Address
    amount: "",
    duration: "",
  });
  const [message, setMessage] = useState({ type: "", content: "" });

  const handleChange: ChangeEventHandler<any> = (e) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handleSubmit: FormEventHandler = async (e) => {
    e.preventDefault();
    if (!program) {
      setMessage({
        type: "error",
        content: "Program not initialized. Please connect your wallet.",
      });
      return;
    }

    try {
      await createEscrow(program, new BN(formValues.id), {
        buyer: formValues.buyer,
        arbiter: formValues.arbiter,
        tokenMint: formValues.tokenMint,
        amount: new BN(formValues.amount),
        duration: new BN(formValues.duration),
      });
      setMessage({ type: "success", content: "Escrow created successfully." });
    } catch (error) {
      console.error("Error creating escrow:", error);
      setMessage({
        type: "error",
        content: `Error: ${(error as Error).message}`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-6">
          Create Solana Escrow
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
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              type="text"
              name="id"
              placeholder="Escrow ID"
              value={formValues.id}
              onChange={handleChange}
              className="border border-gray-300 p-2 rounded w-full"
            />
            <input
              type="text"
              name="buyer"
              placeholder="Buyer Address"
              value={formValues.buyer}
              onChange={handleChange}
              className="border border-gray-300 p-2 rounded w-full"
            />
            <input
              type="text"
              name="arbiter"
              placeholder="Arbiter Address"
              value={formValues.arbiter}
              onChange={handleChange}
              className="border border-gray-300 p-2 rounded w-full"
            />
            <input
              type="text"
              name="tokenMint"
              placeholder="Token Mint Address"
              value={formValues.tokenMint}
              onChange={handleChange}
              className="border border-gray-300 p-2 rounded w-full"
              disabled
            />
            <input
              type="number"
              name="amount"
              placeholder="Amount (in smallest unit)"
              value={formValues.amount}
              onChange={handleChange}
              className="border border-gray-300 p-2 rounded w-full"
            />
            <input
              type="number"
              name="duration"
              placeholder="Duration (seconds)"
              value={formValues.duration}
              onChange={handleChange}
              className="border border-gray-300 p-2 rounded w-full"
            />
          </div>
          <button
            type="submit"
            className="mt-6 w-full px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={!publicKey}
          >
            Create Escrow
          </button>
        </form>
      </div>
    </div>
  );
};

export default TestCreateEscrow;
