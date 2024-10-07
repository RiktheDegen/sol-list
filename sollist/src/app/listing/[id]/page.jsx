'use client'

import { useState, useEffect, useRef } from 'react'
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Image from 'next/image'
import { ChevronLeft, ChevronRight, MessageSquare, ShoppingCart, Edit, Send } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useWallet } from '@solana/wallet-adapter-react'
import Link from 'next/link'


export default function ListingPage({ params }) {
  const [listing, setListing] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [editedDescription, setEditedDescription] = useState('')
  const [editedPrice, setEditedPrice] = useState('')
  const [newImages, setNewImages] = useState([])
  const [isOwner, setIsOwner] = useState(false)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef(null)
  const supabase = createClientComponentClient()
  const { publicKey, connected } = useWallet()

  useEffect(() => {
    fetchListing()
    if (connected && publicKey) {
      subscribeToMessages()
    }
  }, [connected, publicKey])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`listing_${params.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `listing_id=eq.${params.id}` }, 
        payload => {
          setMessages(prevMessages => [...prevMessages, payload.new])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('listing_id', params.id)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching messages:', error)
    } else {
      setMessages(data)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    const { data, error } = await supabase
      .from('messages')
      .insert({
        listing_id: params.id,
        sender_id: publicKey.toString(),
        content: newMessage
      })

    if (error) {
      console.error('Error sending message:', error)
    } else {
      setNewMessage('')
    }
  }

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
                <p className="text-3xl font-semibold mb-4 flex my-auto"> <svg width="25" height="25" className='mr-1 mt-1' viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
<ellipse cx="17.6695" cy="18.2302" rx="17.6695" ry="18.2302" transform="matrix(-1 0 0 1 39.3833 2.16992)" fill="#144CC7" stroke="#0D0D0D" stroke-width="0.4" stroke-linejoin="round"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.8145 36.8012C16.1482 37.9736 18.7696 38.6313 21.5398 38.6313C28.0514 38.6313 33.7403 34.9972 36.8052 29.5877L16.7147 24.752L13.8145 36.8012Z" fill="#699CFF"/>
<path d="M13.8145 36.8012L13.7247 36.9799C13.6417 36.9382 13.5983 36.8448 13.6201 36.7544L13.8145 36.8012ZM36.8052 29.5877L36.852 29.3932C36.913 29.4079 36.9636 29.4504 36.9886 29.508C37.0136 29.5656 37.0101 29.6316 36.9792 29.6862L36.8052 29.5877ZM16.7147 24.752L16.5203 24.7052C16.5327 24.6536 16.5651 24.6091 16.6103 24.5814C16.6556 24.5537 16.7099 24.5451 16.7615 24.5575L16.7147 24.752ZM13.9043 36.6225C16.2109 37.7813 18.8016 38.4313 21.5398 38.4313V38.8313C18.7375 38.8313 16.0855 38.1659 13.7247 36.9799L13.9043 36.6225ZM21.5398 38.4313C27.9743 38.4313 33.5993 34.8405 36.6312 29.4891L36.9792 29.6862C33.8813 35.154 28.1284 38.8313 21.5398 38.8313V38.4313ZM16.7615 24.5575L36.852 29.3932L36.7584 29.7821L16.6679 24.9464L16.7615 24.5575ZM13.6201 36.7544L16.5203 24.7052L16.9092 24.7988L14.0089 36.848L13.6201 36.7544Z" fill="#0D0D0D"/>
<ellipse cx="17.2005" cy="18.2302" rx="17.2005" ry="18.2302" transform="matrix(-1 0 0 1 35.0176 1.36914)" fill="white" stroke="#0D0D0D" stroke-width="0.4" stroke-linejoin="round"/>
<ellipse cx="13.6177" cy="14.6159" rx="13.6177" ry="14.6159" transform="matrix(-1 0 0 1 31.2797 4.98242)" stroke="#0D0D0D" stroke-width="0.4" stroke-linejoin="round"/>
<ellipse cx="17.6695" cy="18.2302" rx="17.6695" ry="18.2302" transform="matrix(-1 0 0 1 39.3833 2.16992)" fill="#144CC7" stroke="#0D0D0D" stroke-width="0.4" stroke-linejoin="round"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.8145 36.8012C16.1482 37.9736 18.7696 38.6313 21.5398 38.6313C28.0514 38.6313 33.7403 34.9972 36.8052 29.5877L16.7147 24.752L13.8145 36.8012Z" fill="#699CFF"/>
<path d="M13.8145 36.8012L13.7247 36.9799C13.6417 36.9382 13.5983 36.8448 13.6201 36.7544L13.8145 36.8012ZM36.8052 29.5877L36.852 29.3932C36.913 29.4079 36.9636 29.4504 36.9886 29.508C37.0136 29.5656 37.0101 29.6316 36.9792 29.6862L36.8052 29.5877ZM16.7147 24.752L16.5203 24.7052C16.5327 24.6536 16.5651 24.6091 16.6103 24.5814C16.6556 24.5537 16.7099 24.5451 16.7615 24.5575L16.7147 24.752ZM13.9043 36.6225C16.2109 37.7813 18.8016 38.4313 21.5398 38.4313V38.8313C18.7375 38.8313 16.0855 38.1659 13.7247 36.9799L13.9043 36.6225ZM21.5398 38.4313C27.9743 38.4313 33.5993 34.8405 36.6312 29.4891L36.9792 29.6862C33.8813 35.154 28.1284 38.8313 21.5398 38.8313V38.4313ZM16.7615 24.5575L36.852 29.3932L36.7584 29.7821L16.6679 24.9464L16.7615 24.5575ZM13.6201 36.7544L16.5203 24.7052L16.9092 24.7988L14.0089 36.848L13.6201 36.7544Z" fill="#0D0D0D"/>
<ellipse cx="17.2005" cy="18.2302" rx="17.2005" ry="18.2302" transform="matrix(-1 0 0 1 35.0176 1.36914)" fill="white" stroke="#0D0D0D" stroke-width="0.4" stroke-linejoin="round"/>
<ellipse cx="13.6177" cy="14.6159" rx="13.6177" ry="14.6159" transform="matrix(-1 0 0 1 31.2797 4.98242)" stroke="#0D0D0D" stroke-width="0.4" stroke-linejoin="round"/>
<path d="M22.2013 21.1022C22.7857 23.275 21.6368 24.9634 19.6338 25.7631L20.0453 27.2928L18.8285 27.62L18.4218 26.1078C16.4202 26.4971 14.6889 25.8817 13.6143 24.3813L15.639 22.3455C16.2284 23.0817 16.8634 23.4328 17.683 23.3614L17.0378 20.9627C16.9589 20.9466 16.8673 20.9526 16.7884 20.9366C15.1125 20.735 13.0757 20.3695 12.4492 18.0403C11.8413 15.7806 13.2315 14.1578 15.0273 13.4884L14.6205 11.9761L15.8372 11.6488L16.2534 13.1958C17.7997 12.9849 19.2663 13.4479 20.3556 14.7952L18.3784 16.7996C17.9888 16.252 17.5476 15.9978 16.9968 15.9596L17.628 18.3062C19.3132 18.5426 21.5186 18.5644 22.2013 21.1022ZM15.235 17.3096C15.3238 17.6398 15.5551 17.8759 16.257 18.0599L15.766 16.2347C15.2947 16.492 15.1228 16.8924 15.235 17.3096ZM18.8904 22.9994C19.4393 22.684 19.5277 22.2501 19.4295 21.8851C19.3126 21.4505 18.9817 21.2599 18.3901 21.1395L18.8904 22.9994Z" fill="#2D2D2D"/>
</svg>{listing.price}</p>
                <p className="mb-3"><strong>Condition:</strong> {listing.condition}</p>
                <p className="mb-3"><strong>Location:</strong> {listing.location}</p>
                <p className="mb-6">{listing.description}</p>

                <div className="flex space-x-4 mb-4">
                  {isOwner ? (
                    <Button onClick={handleEdit} className="flex items-center justify-center py-3">
                      <Edit className="mr-2" size={20} />
                      Edit Listing
                    </Button>
                  ) : connected ? (
                    <>
                      <Button className="flex-1 flex items-center justify-center py-3">
                        
                       
                        Buy Now
                        <svg width="22" height="8" viewBox="0 0 22 8" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-2">
<path d="M1.53174 3.24996H0.781738L0.781738 4.74996L1.53174 4.74996L1.53174 3.24996ZM1.53174 4.74996L20.5317 4.74996V3.24996L1.53174 3.24996L1.53174 4.74996ZM16.9108 3.1726e-08C16.9108 2.59998 18.9567 4.75 21.5317 4.75V3.25C19.8311 3.25 18.4108 1.8183 18.4108 -3.1726e-08L16.9108 3.1726e-08ZM21.5317 3.25C18.9567 3.25 16.9107 5.39999 16.9107 8H18.4107C18.4107 6.18172 19.831 4.75 21.5317 4.75V3.25Z" fill="white"/>
</svg>

                      </Button>
                      <Link href={`/inbox?listing=${params.id}`} passHref>
                        <Button variant="outline" className="flex-1 flex items-center justify-center py-3">
                          
                          Message Seller
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <p>Please connect your wallet to interact with this listing.</p>
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