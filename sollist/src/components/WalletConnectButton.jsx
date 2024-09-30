'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Button } from "@/components/ui/button"

export function WalletConnectButton() {
  const { wallet, connect, disconnect, connecting, connected } = useWallet()

  if (connected) {
    return (
      <Button onClick={disconnect} size="sm" variant="outline">
        Disconnect Wallet
      </Button>
    )
  }

  if (connecting) {
    return (
      <Button size="sm" variant="outline" disabled>
        Connecting...
      </Button>
    )
  }

  if (wallet) {
    return (
      <Button onClick={connect} size="sm" variant="outline">
        Connect {wallet.adapter.name}
      </Button>
    )
  }

  return <WalletMultiButton />
}