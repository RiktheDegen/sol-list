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
            <footer className="bg-background border-t">
              <div className="container mx-auto px-4 py-4">
                <nav className="flex flex-wrap justify-center items-center text-sm">
                  <span className="text-muted-foreground mr-4">
                    © 2024 kora
                  </span>
                  <Link
                    href="/help"
                    className="text-muted-foreground hover:text-primary mx-2"
                  >
                    Help
                  </Link>
                  <Link
                    href="/safety"
                    className="text-muted-foreground hover:text-primary mx-2"
                  >
                    Safety
                  </Link>
                  <Link
                    href="/privacy"
                    className="text-muted-foreground hover:text-primary mx-2"
                  >
                    Privacy
                  </Link>
                  <Link
                    href="/terms"
                    className="text-muted-foreground hover:text-primary mx-2"
                  >
                    Terms
                  </Link>
                  <Link
                    href="/about"
                    className="text-muted-foreground hover:text-primary mx-2"
                  >
                    About
                  </Link>
                </nav>
              </div>
            </footer>
          </SolanaWalletProvider>
          <ToastContainer position="top-right" autoClose={5000} />
        </div>
      </body>
    </html>
  );
}
