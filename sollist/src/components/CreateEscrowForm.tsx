"use client";

import React, { ChangeEventHandler, FormEventHandler, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { BN } from "@coral-xyz/anchor";
import { createEscrow } from "@/lib/client";
import { useEscrowProgram } from "@/lib/useEscrowProgram";
import { PublicKey } from "@solana/web3.js";

const TOKEN_OPTIONS = [
  {
    label: "USDC",
    mintAddress: "9vxL9ZauTmHe55H4sXZoWvxJVyFdrzaqNBawBmtDx1ww", // USDC Devnet
    decimals: 6,
  },
  {
    label: "SOL",
    mintAddress: "So11111111111111111111111111111111111111112", // WSOL
    decimals: 9,
  },
];

const CreateEscrowForm = () => {
  const { publicKey } = useWallet();
  const { program } = useEscrowProgram();

  const [formValues, setFormValues] = useState({
    id: "",
    buyer: "",
    arbiter: "",
    token: TOKEN_OPTIONS[0].label, // Default to USDC
    amount: "",
    duration: "",
  });
  const [loading, setLoading] = useState(false);
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

    // Basic validation
    if (
      !formValues.id ||
      !formValues.buyer ||
      !formValues.amount ||
      !formValues.duration
    ) {
      setMessage({
        type: "error",
        content: "Please fill in all required fields.",
      });
      return;
    }

    setLoading(true);
    setMessage({ type: "", content: "" });

    try {
      const selectedToken = TOKEN_OPTIONS.find(
        (token) => token.label === formValues.token
      );
      if (!selectedToken) {
        throw new Error("Invalid token selected");
      }

      // Convert amount to smallest unit
      const amountInSmallestUnit = new BN(
        Number(formValues.amount) * Math.pow(10, selectedToken.decimals)
      );

      await createEscrow(program, new BN(formValues.id), {
        buyer: formValues.buyer,
        arbiter: formValues.arbiter,
        tokenMint: selectedToken.mintAddress,
        amount: amountInSmallestUnit,
        duration: new BN(formValues.duration),
      });
      setMessage({ type: "success", content: "Escrow created successfully." });

      // Reset form after success
      setFormValues({
        id: "",
        buyer: "",
        arbiter: "",
        token: TOKEN_OPTIONS[0].label,
        amount: "",
        duration: "",
      });
    } catch (error) {
      console.error("Error creating escrow:", error);
      setMessage({
        type: "error",
        content: `Error: ${(error as Error).message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-xl font-bold mb-4">Create Escrow</h2>

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

          {/* Token Selector */}
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label className="block text-gray-700">Token</label>
              <select
                name="token"
                value={formValues.token}
                onChange={handleChange}
                className="border border-gray-300 p-2 rounded w-full"
              >
                {TOKEN_OPTIONS.map((token) => (
                  <option key={token.label} value={token.label}>
                    {token.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-1/2">
              <label className="block text-gray-700">
                Amount ({formValues.token})
              </label>
              <input
                type="number"
                name="amount"
                placeholder="Amount"
                value={formValues.amount}
                onChange={handleChange}
                className="border border-gray-300 p-2 rounded w-full"
                step="any"
              />
            </div>
          </div>

          {/* Duration */}
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
          className={`mt-6 w-full px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={!publicKey || loading}
        >
          {loading ? "Creating Escrow..." : "Create Escrow"}
        </button>
      </form>
    </div>
  );
};

export default CreateEscrowForm;
