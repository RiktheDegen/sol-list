"use client";

import React, { ChangeEventHandler, FormEventHandler, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { BN } from "@coral-xyz/anchor";
import { createEscrow } from "@/lib/client";
import { useEscrowProgram } from "@/lib/useEscrowProgram";
import { PublicKey } from "@solana/web3.js";
import { toast } from "react-toastify";

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

  const handleChange: ChangeEventHandler<
    HTMLInputElement | HTMLSelectElement
  > = (e) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handleSubmit: FormEventHandler = async (e) => {
    e.preventDefault();
    if (!program) {
      toast.error("Program not initialized. Please connect your wallet.");
      return;
    }

    // Basic validation
    if (
      !formValues.id ||
      !formValues.buyer ||
      !formValues.amount ||
      !formValues.duration
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);

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

      toast.success("Escrow created successfully.");

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
      if ((error as Error).message.includes("User rejected the request")) {
        toast.warn("Transaction canceled.");
      } else {
        toast.error(`Error: ${(error as Error).message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Create Escrow</h2>

      {/* Create Escrow Form */}
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Escrow ID
            </label>
            <input
              type="text"
              name="id"
              placeholder="Enter a unique escrow ID"
              value={formValues.id}
              onChange={handleChange}
              className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Buyer Address
            </label>
            <input
              type="text"
              name="buyer"
              placeholder="Enter buyer's public key"
              value={formValues.buyer}
              onChange={handleChange}
              className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Arbiter Address (Optional)
            </label>
            <input
              type="text"
              name="arbiter"
              placeholder="Enter arbiter's public key"
              value={formValues.arbiter}
              onChange={handleChange}
              className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Token Selector */}
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label className="block text-gray-700 font-medium mb-2">
                Token
              </label>
              <select
                name="token"
                value={formValues.token}
                onChange={handleChange}
                className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TOKEN_OPTIONS.map((token) => (
                  <option key={token.label} value={token.label}>
                    {token.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-1/2">
              <label className="block text-gray-700 font-medium mb-2">
                Amount ({formValues.token})
              </label>
              <input
                type="number"
                name="amount"
                placeholder="Enter amount"
                value={formValues.amount}
                onChange={handleChange}
                className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="any"
                required
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Auto Complete Duration (seconds)
            </label>
            <input
              type="number"
              name="duration"
              placeholder="Enter duration in seconds"
              value={formValues.duration}
              onChange={handleChange}
              className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          className={`mt-6 w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
