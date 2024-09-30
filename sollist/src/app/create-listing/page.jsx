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

  const handleImageUpload = async (e) => {
    console.log('handleImageUpload called')
    const files = Array.from(e.target.files)
    console.log('Files selected:', files)
    if (files.length > 0) {
      const newImageFiles = [...imageFiles, ...files].slice(0, 5)
      setImageFiles(newImageFiles)
      console.log('New image files:', newImageFiles)
      
      const newImagePreviews = newImageFiles.map(file => URL.createObjectURL(file))
      setImagePreviews(newImagePreviews)
      console.log('New image previews:', newImagePreviews)
    }
  }

  const deleteImage = (index) => {
    console.log('deleteImage called with index:', index)
    const newImageFiles = [...imageFiles]
    const newImagePreviews = [...imagePreviews]
    newImageFiles.splice(index, 1)
    newImagePreviews.splice(index, 1)
    setImageFiles(newImageFiles)
    setImagePreviews(newImagePreviews)
    console.log('Updated image files:', newImageFiles)
    console.log('Updated image previews:', newImagePreviews)
    if (currentPreviewIndex >= newImagePreviews.length) {
      setCurrentPreviewIndex(Math.max(0, newImagePreviews.length - 1))
    }
  }

  const uploadImages = async () => {
    console.log('uploadImages called')
  
    if (imageFiles.length === 0) {
      console.log('No image files to upload')
      return []
    }
  
    console.log('Image files:', imageFiles)
  
    const uploadPromises = imageFiles.map(async (file) => {
      const fileName = `${Date.now()}-${file.name}`
      console.log('Uploading file:', fileName)
  
      const { data, error } = await supabase.storage
        .from('new-bucket')
        .upload(fileName, file)
  
      if (error) {
        console.error('Error uploading image:', error)
        return null
      }
  
      console.log('Image uploaded successfully:', fileName)
  
      const { data: publicUrlData } = supabase.storage
        .from('listing-images')
        .getPublicUrl(fileName)
  
      if (!publicUrlData || !publicUrlData.publicUrl) {
        console.error('Error getting public URL for image')
        return null
      }
  
      console.log('Public URL created:', publicUrlData.publicUrl)
      return publicUrlData.publicUrl
    })
  
    console.log('Upload promises:', uploadPromises)
  
    const uploadedUrls = await Promise.all(uploadPromises)
    console.log('Uploaded URLs:', uploadedUrls)
    return uploadedUrls.filter(url => url !== null)
  }
  

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('handleSubmit called')
    setError(null)

    if (!connected || !publicKey || !userId) {
      setError('Please connect your wallet to create a listing')
      return
    }

    if (!title || !description || !price || !categoryId || !condition || !location || 
        !transactionType ) {
      setError('Please fill in all required fields and upload at least one image')
      return
    }

    console.log('Uploading images...')
    //const imageUrls = await uploadImages()
    //if (imageUrls.length === 0) {
      //console.error('No image URLs returned')
      //setError('Error uploading images')
      //return
    //}
    //console.log('Image URLs:', imageUrls)

    console.log('Creating listing...')
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
        },
      ])

    if (error) {
      setError('Error creating listing')
      console.error('Error creating listing:', error)
    } else {
      console.log('Listing created successfully')
      router.push('/my-listings')
    }
  }

  if (!connected) {
    return <div>Please connect your wallet to create a listing.</div>
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-5">Create Crypto Listing</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
       
        {imagePreviews.length > 0 && (
          <div className="mt-4">
            <Label>Image Preview</Label>
            <div className="relative w-full aspect-video">
              <Image
                src={imagePreviews[currentPreviewIndex]}
                alt={`Preview ${currentPreviewIndex + 1}`}
                layout="fill"
                objectFit="contain"
              />
              <Button
                type="button"
                className="absolute top-2 right-2 p-1 bg-white bg-opacity-70 hover:bg-opacity-100"
                onClick={() => deleteImage(currentPreviewIndex)}
              >
                <X size={20} />
              </Button>
            </div>
            <div className="flex justify-between items-center mt-2">
              <Button
                type="button"
                onClick={() => setCurrentPreviewIndex((prev) => (prev > 0 ? prev - 1 : imagePreviews.length - 1))}
                className="p-1"
              >
                <ChevronLeft size={20} />
              </Button>
              <span>{currentPreviewIndex + 1} / {imagePreviews.length}</span>
              <Button
                type="button"
                onClick={() => setCurrentPreviewIndex((prev) => (prev < imagePreviews.length - 1 ? prev + 1 : 0))}
                className="p-1"
              >
                <ChevronRight size={20} />
              </Button>
            </div>
          </div>
        )}
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
        
        
        {error && <p className="text-red-500">{error}</p>}
        <Button type="submit">Create Crypto Listing</Button>
      </form>
    </div>
  )
}