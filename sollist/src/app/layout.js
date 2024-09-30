'use client'

import { Inter } from "next/font/google";
import "./globals.css";
import { SolanaWalletProvider } from '@/components/SolanaWalletProvider';
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });



export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
       
        <SolanaWalletProvider>
        <Navbar />
          {children}
        </SolanaWalletProvider>
      </body>
    </html>
  );
}
