import React, { useEffect } from "react";
import Link from "next/link";
import { WalletConnectButton } from "./WalletConnectButton";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function Navbar() {
  const { publicKey, connected } = useWallet();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkAndAddUser = async () => {
      if (connected && publicKey) {
        const walletAddress = publicKey.toBase58();

        console.log("Wallet address:", walletAddress);
        const { data, error } = await supabase
          .from("users")
          .select("wallet_address, profile_photo")
          .eq("wallet_address", walletAddress)
          .single();

        if (error || !data) {
          const defaultProfileImage =
            "https://efxzijoqtrphnulfehuq.supabase.co/storage/v1/object/public/listing-images/1-24-3-11-6-12-29m.jpg";
          const { data: newUser, error: insertError } = await supabase
            .from("users")
            .insert({
              wallet_address: walletAddress,
              role: "user",
              name: `User ${walletAddress.slice(0, 8)}`,
              profile_photo: [defaultProfileImage],
            })
            .single();

          if (insertError) {
            console.error("Error adding new user:", insertError);
          } else {
            console.log("New user added:", newUser);
          }
        } else if (!data.profile_photo) {
          const defaultProfileImage =
            "https://efxzijoqtrphnulfehuq.supabase.co/storage/v1/object/public/listing-images/1-24-3-11-6-12-29m.jpg";
          const { error: updateError } = await supabase
            .from("users")
            .update({ profile_photo: [defaultProfileImage] })
            .eq("wallet_address", walletAddress);

          if (updateError) {
            console.error("Error updating user profile photo:", updateError);
          }
        } else {
          console.log("User already exists:", data.id);
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
          className="flex items-center gap-2 font-bold text-xl text-[#2b2b2b]"
          prefetch={false}
        >
          <span>DegenBaazar</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/escrow"
            className="flex items-center gap-2 text-sm  text-[#2b2b2b] hover:text-primary"
            prefetch={false}
          >
            <svg
              width="25"
              height="25"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M15.4 0.6H0.6V15.4H15.4V0.6ZM0.6 0H0V0.6V15.4V16H0.6H15.4H16V15.4V0.6V0H15.4H0.6ZM12.7 3.3H3V2.7H13H13.3V3V13H12.7V3.3ZM3 7.3H8.7V13H9.3V7V6.7H9H3V7.3Z"
                fill="#8A8A8A"
              />
            </svg>
            My Escrows
          </Link>
          <Link
            href="/create-listing"
            className="flex items-center gap-2 text-sm  text-[#2b2b2b] hover:text-primary"
            prefetch={false}
          >
            <svg
              width="25"
              height="25"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M15.4 0.6H0.6V15.4H15.4V0.6ZM0.6 0H0V0.6V15.4V16H0.6H15.4H16V15.4V0.6V0H15.4H0.6ZM12.7 3.3H3V2.7H13H13.3V3V13H12.7V3.3ZM3 7.3H8.7V13H9.3V7V6.7H9H3V7.3Z"
                fill="#8A8A8A"
              />
            </svg>
            Create Listing
          </Link>
          <Link
            href="/my-listings"
            className="flex items-center gap-2 text-sm  text-[#2b2b2b]hover:text-primary"
            prefetch={false}
          >
            <svg
              width="25"
              height="25"
              viewBox="0 0 18 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M8.99968 1.25234C11.725 1.25234 13.9607 3.34936 14.1815 6.01777H3.8179C4.03869 3.34936 6.27434 1.25234 8.99968 1.25234ZM17.3955 6.01777H14.7833C14.5611 3.01766 12.0566 0.652344 8.99968 0.652344C5.94276 0.652344 3.43827 3.01766 3.21604 6.01777H0.604395H0.00439453V6.61777V9.91804V10.518H0.604395H1V10.6178V19.4V20H1.6H16.4H17V19.4V10.6178V10.518H17.3955H17.9955V9.91804V6.61777V6.01777H17.3955ZM0.604395 6.61777H17.3955V9.91804H0.604395V6.61777ZM1.6 10.6178H16.4V19.4H1.6V10.6178ZM14 16.0178H10V16.5178H14V16.0178Z"
                fill="#8A8A8A"
              />
            </svg>
            My Listings
          </Link>
          <Link
            href="/profile"
            className="flex items-center gap-2 text-sm text-[#2b2b2b]hover:text-primary"
            prefetch={false}
          >
            <svg
              width="25"
              height="25"
              viewBox="0 0 20 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M1.1 0.505263L5.25 4L10 0L14.75 4L18.9 0.505264L19.5 0V0.784405V8.7V9.3V13.4V14H18.9H1.1H0.5V13.4V9.3V8.7V0.784405V0L1.1 0.505263ZM1.1 9.3V13.4H18.9V9.3H1.1ZM18.9 8.7H1.1V1.28967L4.86352 4.45895L5.25 4.7844L5.63648 4.45895L10 0.784405L14.3635 4.45895L14.75 4.7844L15.1365 4.45895L18.9 1.28967V8.7Z"
                fill="#8A8A8A"
              />
            </svg>
            Profile
          </Link>
          <Link
            href="/inbox"
            className="flex items-center gap-2 text-sm  text-[#2b2b2b] hover:text-primary"
            prefetch={false}
          >
            <svg
              width="25"
              height="25"
              viewBox="0 0 18 13"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M0.6 0.6H17.4V4H0.6V0.6ZM0 4.5V4V0.6V0H0.6H17.4H18V0.6V4V4.5V12.4V13H17.4H0.6H0V12.4V4.5ZM17.4 4.5V12.4H0.6V4.5H17.4Z"
                fill="#8A8A8A"
              />
            </svg>
            Messages
          </Link>

          <WalletMultiButton
            style={{
              backgroundColor: "#FFFFFF",
              color: "#030712",
              fontFamily: "Inter",
              fontSize: "14px",
            }}
          />
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <MenuIcon className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="md:hidden">
            <Link href="/escrow" className="block py-2">
              My Escrows
            </Link>
            <Link href="/create-listing" className="block py-2">
              Create Listing
            </Link>
            <Link href="/my-listings" className="block py-2">
              My Listings
            </Link>
            <Link href="/inbox" className="block py-2">
              Messages
            </Link>
            <Link href="/profile" className="block py-2">
              Profile
            </Link>
            <WalletMultiButton
              style={{
                backgroundColor: "#FFFFFF",
                color: "#030712",
                fontFamily: "Inter",
                fontSize: "14px",
              }}
            />
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
