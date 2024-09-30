'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import { Card, CardContent } from "@/components/ui/card"
import SearchBar from "@/components/ui/searchbar"
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useWallet } from '@solana/wallet-adapter-react'
import { MenuIcon, Package2Icon, SearchIcon, ShuffleIcon, LayoutDashboardIcon, InboxIcon, ShoppingBagIcon } from 'lucide-react'

export default function HomePageContent({ user, listings }) {
  
  return (
    <div className="flex flex-col min-h-screen">
     
      <main className="flex-1 px-4 md:px-6 py-8">
        <div>
          <div>
            <h1 className="text-xl font-semibold mt-8 text-center">Buy and Sell anything with Stablecoins</h1>
            <SearchBar />
            <div className="px-16">
              <h3 className="text-lg font-semibold my-4">Recent Listings</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-6">
                {listings && listings.map((listing) => (
                  <Link href={`/listing/${listing.id}`} key={listing.id}>
                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                      <img
                        src={listing.image_urls[0]}
                        alt={listing.title}
                        width={400}
                        height={300}
                        className="rounded-t-lg object-cover w-full aspect-[4/3]" />
                      <CardContent className="p-4">
                        <div className="text-primary font-semibold">${listing.price} USDC</div>
                        <h3 className="text-lg font-semibold">{listing.title}</h3>
                        <p className="text-muted-foreground text-sm">{listing.location}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}