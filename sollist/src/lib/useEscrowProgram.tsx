import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import * as anchor from "@coral-xyz/anchor";

import idl from "./solana_escrow.json";
import { SolanaEscrow } from "./solana_escrow"; // Make sure this type is correctly defined
import { useEffect, useState } from "react";

export const useEscrowProgram = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const [program, setProgram] = useState<anchor.Program<SolanaEscrow>>();

  useEffect(() => {
    if (!wallet) {
      return;
    }

    let provider: anchor.Provider;

    try {
      provider = anchor.getProvider();
    } catch {
      provider = new anchor.AnchorProvider(connection, wallet, {});
      anchor.setProvider(provider);
    }

    const program = new anchor.Program(
      idl as SolanaEscrow
    ) as anchor.Program<SolanaEscrow>;
    setProgram(program);
  }, [connection, wallet]);

  return {
    program,
  };
};
