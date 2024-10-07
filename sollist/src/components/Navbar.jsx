import React, { useEffect } from 'react';
import Link from 'next/link';
import { WalletConnectButton } from './WalletConnectButton';
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import { MenuIcon } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function Navbar() {
  const { publicKey, connected } = useWallet()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkAndAddUser = async () => {
      if (connected && publicKey) {
        const walletAddress = publicKey.toBase58();
        
        console.log('Wallet address:', walletAddress)
        const { data, error } = await supabase
          .from('users')
          .select('wallet_address, profile_photo')
          .eq('wallet_address', walletAddress)
          .single();

        if (error || !data) {
          const defaultProfileImage = "https://efxzijoqtrphnulfehuq.supabase.co/storage/v1/object/public/listing-images/1-24-3-11-6-12-29m.jpg";
          const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert({
              wallet_address: walletAddress,
              role: 'user',
              name: `User ${walletAddress.slice(0, 8)}`,
              profile_photo: [defaultProfileImage]
            })
            .single();

          if (insertError) {
            console.error('Error adding new user:', insertError);
          } else {
            console.log('New user added:', newUser);
          }
        } else if (!data.profile_photo) {
          const defaultProfileImage = "https://efxzijoqtrphnulfehuq.supabase.co/storage/v1/object/public/listing-images/1-24-3-11-6-12-29m.jpg";
          const { error: updateError } = await supabase
            .from('users')
            .update({ profile_photo: [defaultProfileImage] })
            .eq('wallet_address', walletAddress);

          if (updateError) {
            console.error('Error updating user profile photo:', updateError);
          }
        } else {
          console.log('User already exists:', data.id);
        }
      }
    };

    checkAndAddUser();
  }, [connected, publicKey, supabase]);

  return (
    <header className="bg-background">
      <div className="px-4 md:px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-xl text-[#2b2b2b]"
          prefetch={false}>
          <span>DegenBaazar</span>
        </Link>
       
        <div className="hidden md:flex items-center gap-4">
          <Link href="/create-listing" className="text-sm font-semibold text-[#2b2b2b] hover:text-primary" prefetch={false}>
            Create Listing
          </Link>
          <Link href="/my-listings" className="text-sm font-semibold text-[#2b2b2b]hover:text-primary" prefetch={false}>
              My Listings
          </Link>
          <Link href="/profile" className="text-sm font-semibold text-[#2b2b2b]hover:text-primary" prefetch={false}>
              Profile
          </Link>
          <Link href="/inbox" className="text-sm font-semibold text-[#2b2b2b] hover:text-primary" prefetch={false}>
              Messages
          </Link>
          <Link href="/swap" className="text-sm font-semibold text-[#2b2b2b] hover:text-primary" prefetch={false}>
              Swap
          </Link>
          <WalletMultiButton style={{ backgroundColor: '#FFFFFF', color: '#030712',fontFamily:'Inter', fontSize:'14px'}} />
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <MenuIcon className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="md:hidden">
              <Link href="/create-listing" className="block py-2">Create Listing</Link>
            <Link href="/my-listings" className="block py-2">My Listings</Link>
            <Link href="/inbox" className="block py-2">Messages</Link>
            <Link href="/profile" className="block py-2">Profile</Link>
            <Link href="/swap" className="block py-2">Swap</Link>
            <WalletMultiButton style={{ backgroundColor: '#FFFFFF', color: '#030712',fontFamily:'Inter', fontSize:'14px'}} />
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

