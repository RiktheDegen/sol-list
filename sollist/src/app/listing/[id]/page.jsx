'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Image from 'next/image'
import { ChevronLeft, ChevronRight, MessageSquare, ShoppingCart, Edit } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Link from 'next/link'
import { useWallet } from '@solana/wallet-adapter-react'

export default function ListingPage({ params }) {
  const [listing, setListing] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [editedDescription, setEditedDescription] = useState('')
  const [editedPrice, setEditedPrice] = useState('')
  const [newImages, setNewImages] = useState([])
  const [isOwner, setIsOwner] = useState(false)
  const supabase = createClientComponentClient()
  const { publicKey } = useWallet()

  useEffect(() => {
    fetchListing()
  }, [])

  const fetchListing = async () => {
    const { data, error } = await supabase
      .from('listing')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching listing:', error)
    } else {
      setListing(data)
      setEditedTitle(data.title)
      setEditedDescription(data.description)
      setEditedPrice(data.price.toString())
      
      // Check if the current user is the owner of the listing
      if (publicKey) {
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('wallet_address', publicKey.toString())
          .single()
        
        setIsOwner(userData && userData.id === data.user_id)
      }
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = async () => {
    const updatedListing = {
      title: editedTitle,
      description: editedDescription,
      price: parseFloat(editedPrice),
    }

    if (newImages.length > 0) {
      const uploadedUrls = await Promise.all(newImages.map(uploadImage))
      updatedListing.image_urls = [...listing.image_urls, ...uploadedUrls.filter(Boolean)]
    }

    const { error } = await supabase
      .from('listing')
      .update(updatedListing)
      .eq('id', listing.id)

    if (error) {
      console.error('Error updating listing:', error)
    } else {
      setListing({ ...listing, ...updatedListing })
      setIsEditing(false)
      setNewImages([])
    }
  }

  const uploadImage = async (file) => {
    const { data, error } = await supabase.storage
      .from('listing-images')
      .upload(`${listing.id}/${file.name}`, file)

    if (error) {
      console.error('Error uploading image:', error)
      return null
    }

    return supabase.storage.from('listing-images').getPublicUrl(data.path).publicUrl
  }

  const handleImageChange = (e) => {
    setNewImages([...newImages, ...e.target.files])
  }

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === listing.image_urls.length - 1 ? 0 : prevIndex + 1
    )
  }

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? listing.image_urls.length - 1 : prevIndex - 1
    )
  }

  if (!listing) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="max-w-6xl w-full">
        <div className="md:flex md:space-x-20">
          {/* Image carousel */}
          <div className="md:w-1/2 relative">
            <div className="aspect-w-1 aspect-h-1 relative">
              <Image
                src={listing.image_urls[currentImageIndex]}
                alt={listing.title}
                layout="responsive"
                width={400}
                height={400}
                objectFit="cover"
                className="rounded-lg"
              />
              <button 
                onClick={prevImage} 
                className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-l-lg h-full"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={nextImage} 
                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-r-lg h-full"
              >
                <ChevronRight size={24} />
              </button>
            </div>
            <div className="flex mt-4 space-x-4 overflow-x-auto">
              {listing.image_urls.map((url, index) => (
                <Image
                  key={index}
                  src={url}
                  alt={`Thumbnail ${index + 1}`}
                  width={100}
                  height={100}
                  className={`rounded-md cursor-pointer ${index === currentImageIndex ? 'border-2 border-blue-500' : ''}`}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </div>
          </div>

          {/* Listing details */}
          <div className="md:w-1/2 mt-8 md:mt-0">
            {isEditing ? (
              <>
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="text-3xl font-bold mb-4"
                />
                <Input
                  type="number"
                  value={editedPrice}
                  onChange={(e) => setEditedPrice(e.target.value)}
                  className="text-2xl font-semibold mb-4"
                />
                <Textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  className="mb-6"
                />
                <Input
                  type="file"
                  multiple
                  onChange={handleImageChange}
                  className="mb-4"
                />
                <Button onClick={handleSave}>Save Changes</Button>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold mb-4">{listing.title}</h1>
                <p className="text-2xl font-semibold mb-4">{listing.price} USDC</p>
                <p className="mb-3"><strong>Condition:</strong> {listing.condition}</p>
                <p className="mb-3"><strong>Location:</strong> {listing.location}</p>
                <p className="mb-6">{listing.description}</p>

                <div className="flex space-x-4 mb-4">
                  {isOwner ? (
                    <Button onClick={handleEdit} className="flex items-center justify-center py-3">
                      <Edit className="mr-2" size={20} />
                      Edit Listing
                    </Button>
                  ) : (
                    <>
                      <Button className="flex-1 flex items-center justify-center py-3">
                        <ShoppingCart className="mr-2" size={20} />
                        Buy Now
                      </Button>
                      <Button variant="outline" className="flex-1 flex items-center justify-center py-3">
                        <MessageSquare className="mr-2" size={20} />
                        Message Seller
                      </Button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}