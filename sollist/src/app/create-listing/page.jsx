'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

export default function CreateListing() {
  const { publicKey, connected } = useWallet()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [condition, setCondition] = useState('')
  const [location, setLocation] = useState('')
  const [transactionType, setTransactionType] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0)
  const [error, setError] = useState(null)
  const [categories, setCategories] = useState([])
  const [cryptoCurrency, setCryptoCurrency] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    if (connected) {
      fetchCategories()
      fetchUserId()
    }
  }, [connected])

  const supabase = createClientComponentClient()

  



  async function uploadImage(imageFile) {
    try {
      // Upload the image file to the 'listing-images' bucket in Supabase
      const { data, error } = await supabase.storage
        .from('listing-images')
        .upload(imageFile.name, imageFile)
  
      if (error) {
        console.error('Error uploading image:', error)
        return null
      }
  
      // Get the public URL of the uploaded image
      const publicUrl = supabase.storage
        .from('listing-images')
        .getPublicUrl(data.path)
  
      console.log('Public URL:', publicUrl.publicUrl)
      return publicUrl.publicUrl
    } catch (err) {
      console.error('Error occurred:', err)
      return null
    }
  }


  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .order('name', { ascending: true })
    if (error) {
      console.error('Error fetching categories:', error)
    } else {
      setCategories(data)
    }
  }

  const fetchUserId = async () => {
    if (publicKey) {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', publicKey.toString())
        .single()
      
      if (error) {
        console.error('Error fetching user ID:', error)
      } else if (data) {
        setUserId(data.id)
      }
    }
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    const images = files.map(file => URL.createObjectURL(file))
    setImageFiles(files)
    setImagePreviews(images)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
  
    if (!connected || !publicKey || !userId) {
      setError('Please connect your wallet to create a listing')
      return
    }
  
    if (!title || !description || !price || !categoryId || !condition || !location || 
        !transactionType || imageFiles.length === 0) {
      setError('Please fill in all required fields and upload at least one image')
      return
    }
  
    console.log('Uploading images...')
  
    try {
      // Upload images and wait for all uploads to complete before continuing
      const imageUrls = await Promise.all(imageFiles.map(async (file) => {
        const { data, error } = await supabase.storage
          .from('new-bucket')
          .upload(file.name, file)
  
        if (error) {
          console.error('Error uploading image:', error)
          return null
        }
  
        // Get the public URL of the uploaded image
        const { data: publicUrlData, error: urlError } = supabase.storage
      .from('new-bucket')
      .getPublicUrl(data.path)

    if (urlError) {
      console.error('Error fetching public URL:', urlError)
      return null
    }

    console.log(publicUrlData.publicUrl); // Correct access to publicUrl
    return publicUrlData.publicUrl
      }))
  
      // Ensure at least one image was uploaded successfully
      const validImageUrls = imageUrls.filter(Boolean)
      if (validImageUrls.length === 0) {
        setError('Failed to upload images')
        return
      }
  
      console.log('Image URLs:', validImageUrls)
  
      // Now create the listing with the valid image URLs
      const { data, error } = await supabase
        .from('listing')
        .insert([
          {
            user_id: userId,
            title,
            description,
            price: parseFloat(price),
            category_id: parseInt(categoryId),
            condition,
            location,
            transaction_type: transactionType,
            contact_email: contactEmail,
            contact_phone: contactPhone,
            image_urls: validImageUrls, // Use valid image URLs
          },
        ])
  
      if (error) {
        setError('Error creating listing')
        console.error('Error creating listing:', error)
      } else {
        console.log('Listing created successfully')
        router.push('/my-listings')
      }
    } catch (error) {
      setError('An error occurred during the upload process')
      console.error('Error:', error)
    }
  }
  

  if (!connected) {
    return <div>Please connect your wallet to create a listing.</div>
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-5">Create Crypto Listing</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
     
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            step="0.000001"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select onValueChange={setCategoryId} required>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="condition">Condition</Label>
          <Select onValueChange={setCondition} required>
            <SelectTrigger>
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Used">Used</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="transactionType">Transaction Type</Label>
          <Select onValueChange={setTransactionType} required>
            <SelectTrigger>
              <SelectValue placeholder="Select transaction type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Delivery">Delivery</SelectItem>
              <SelectItem value="Pickup">Pickup</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="contactEmail">Contact Email</Label>
          <Input
            id="contactEmail"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="contactPhone">Contact Phone</Label>
          <Input
            id="contactPhone"
            type="tel"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="image">Image</Label>
          <Input
            id="image"
            type="file"
            multiple
            onChange={handleImageChange}
            required
          />
          {imagePreviews.length > 0 && (
            <div className="flex space-x-4">
              {imagePreviews.map((preview, index) => (
                <Image
                  key={index}
                  src={preview}
                  alt={`Image ${index + 1}`}
                  width={100}
                  height={100}
                  objectFit="cover"
                  className="rounded-lg"
                />
              ))}
            </div>
          )}
        </div>
        
        {error && <p className="text-red-500">{error}</p>}
        <Button type="submit">Create Crypto Listing</Button>
      </form>
    </div>
  )
}