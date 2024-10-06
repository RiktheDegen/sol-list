'use client'

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import SearchBar from "@/components/ui/searchbar"

export default function HomePageContent({ user, listings }) {
  return (
    <div className="flex flex-col">
      <main className="flex-1 px-4 md:px-6 py-8">
        <div>
          <div>
            <h1 className="text-xl font-semibold mt-8 text-center">Buy and Sell anything with Stablecoins</h1>
            <SearchBar/>
            <div className="px-4 md:px-16">
              <h3 className="text-lg font-semibold my-4">Recent Listings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {listings && listings.map((listing) => (
                  <Link href={`/listing/${listing.id}`} key={listing.id}>
                    <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                      <div className="aspect-square relative overflow-hidden">
                        <img
                          src={listing.image_urls[0]}
                          alt={listing.title}
                          className="w-full h-full object-cover absolute inset-0"
                        />
                      </div>
                      <CardContent className="p-4">
                        <div className="text-primary font-semibold text-lg">${listing.price} USDC</div>
                        <h3 className="text-base font-semibold truncate">{listing.title}</h3>
                        <p className="text-muted-foreground text-sm truncate">{listing.location}</p>
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