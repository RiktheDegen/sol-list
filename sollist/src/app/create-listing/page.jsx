'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import Image from 'next/image'

export default function CreateListing() {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [location, setLocation] = useState('')
  const [condition, setCondition] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [error, setError] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const uploadImage = async () => {
    if (!imageFile) return null

    const fileName = `${Date.now()}-${imageFile.name}`
    const { data, error } = await supabase.storage
      .from('listing-images')
      .upload(fileName, imageFile)

    if (error) {
      console.error('Error uploading image:', error)
      return null
    }

    const { data: publicUrlData } = supabase.storage
      .from('listing-images')
      .getPublicUrl(fileName)

    return publicUrlData.publicUrl
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!title || !category || !description || !price || !location || !condition || !imageFile) {
      setError('Please fill in all fields and upload an image')
      return
    }

    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError) {
      setError('Error fetching user data')
      return
    }

    const imageUrl = await uploadImage()
    if (!imageUrl) {
      setError('Error uploading image')
      return
    }

    const { data, error } = await supabase
      .from('listing')
      .insert([
        {
          title,
          category,
          description,
          price: parseFloat(price),
          location,
          condition,
          image_url: imageUrl,
          user_id: userData.user.id,
        },
      ])

    if (error) {
      setError('Error creating listing')
      console.error(error)
    } else {
      router.push('/')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-5">Create Listing</h1>
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
          <Label htmlFor="category">Category</Label>
          <Select onValueChange={setCategory} required>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="clothing">Clothing</SelectItem>
              <SelectItem value="books">Books</SelectItem>
              <SelectItem value="home">Home & Garden</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
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
          <Label htmlFor="price">Price (USDC)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Select onValueChange={setLocation} required>
            <SelectTrigger>
              <SelectValue placeholder="Select a location type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="physical">Physical</SelectItem>
              <SelectItem value="online">Online</SelectItem>
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
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="like-new">Like New</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="fair">Fair</SelectItem>
              <SelectItem value="poor">Poor</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="image">Image</Label>
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            required
          />
        </div>
        {imagePreview && (
          <div className="mt-4">
            <Label>Image Preview</Label>
            <div className="relative w-full h-48">
              <Image
                src={imagePreview}
                alt="Preview"
                layout="fill"
                objectFit="contain"
              />
            </div>
          </div>
        )}
        {error && <p className="text-red-500">{error}</p>}
        <Button type="submit">Create Listing</Button>
      </form>
    </div>
  )
}