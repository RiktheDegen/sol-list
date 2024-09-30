'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent } from "@/components/ui/card"
import Link from 'next/link'

export default function MyListings() {
  const { publicKey, connected } = useWallet()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (connected && publicKey) {
      fetchMyListings()
    }
  }, [connected, publicKey])

  const fetchMyListings = async () => {
    setLoading(true)
    // First, fetch the user's id based on their wallet address
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', publicKey.toString())

    if (userError) {
      console.error('Error fetching user data:', userError)
      setLoading(false)
      return
    }

    const userId = userData[0].id

    // Then, fetch the user's active listings based on their id
    const { data, error } = await supabase
      .from('listing')
      .select('*')
      .eq('user_id', userId)// Assuming there's a status field to filter active listings
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching listings:', error)
    } else {
      setListings(data)
    }
    setLoading(false)
  }

  if (!connected) {
    return <div>Please connect your wallet to view your listings.</div>
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Listings</h1>
      {listings.length === 0 ? (
        <p>You haven't created any listings yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <Link href={`/listing/${listing.id}`} key={listing.id}>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <img
                  src={listing.image_urls[0]}
                  alt={listing.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <CardContent className="p-4">
                  <div className="text-primary font-semibold">${listing.price} USDC</div>
                  <h3 className="text-lg font-semibold">{listing.title}</h3>
                  <p className="text-muted-foreground text-sm">{listing.location}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}