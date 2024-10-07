'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { Trash2 } from 'lucide-react'

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

    const { data, error } = await supabase
      .from('listing')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching listings:', error)
    } else {
      setListings(data)
    }
    setLoading(false)
  }

  const deleteListing = async (listingId) => {
    const { error } = await supabase
      .from('listing')
      .delete()
      .eq('id', listingId)

    if (error) {
      console.error('Error deleting listing:', error)
    } else {
      setListings(listings.filter(listing => listing.id !== listingId))
    }
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
            <Card key={listing.id} className="relative">
              <Link href={`/listing/${listing.id}`}>
                <img
                  src={listing.image_urls[0]}
                  alt={listing.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <CardContent className="p-4">
                  <div className="text-primary font-semibold">${listing.price} USDC</div>
                  <h3 className="text-lg font-semibold truncate">{listing.title}</h3>
                  <p className="text-muted-foreground text-sm">{listing.location}</p>
                </CardContent>
              </Link>
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => deleteListing(listing.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}