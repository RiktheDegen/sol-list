"use client";

import { gilroy } from "../../fonts"; // Import the gilroy font
import "./globals.css";
import { SolanaWalletProvider } from "@/components/SolanaWalletProvider";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${gilroy.variable} font-sans`}>
      <body className={gilroy.className}>
        <div className="flex flex-col min-h-screen">
          <SolanaWalletProvider>
            <Navbar />
            <main className="flex-grow">{children}</main>
            {/* Bottom Navigation Bar */}
       
          </SolanaWalletProvider>
          <ToastContainer position="top-right" autoClose={5000} />
        </div>
      </body>
    </html>
  );
}
