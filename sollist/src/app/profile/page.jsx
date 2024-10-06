'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Image from 'next/image'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Camera, Edit } from 'lucide-react'

export default function ProfilePage() {
  const { publicKey, connected } = useWallet()
  const [profilePhoto, setProfilePhoto] = useState('https://efxzijoqtrphnulfehuq.supabase.co/storage/v1/object/public/listing-images/1-24-3-11-6-12-29m.jpg')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [editingProfile, setEditingProfile] = useState(false)
  const [editedUsername, setEditedUsername] = useState('')
  const [editedBio, setEditedBio] = useState('')
  const [shippingAddresses, setShippingAddresses] = useState([])
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false)
  const [currentAddress, setCurrentAddress] = useState(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (connected && publicKey) {
      fetchUserProfile()
    }
  }, [connected, publicKey])

  const fetchUserProfile = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('profile_photo, name, bio, shipping_address')
      .eq('wallet_address', publicKey.toString())
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
    } else if (data) {
      setProfilePhoto(data.profile_photo?.[0] || 'https://efxzijoqtrphnulfehuq.supabase.co/storage/v1/object/public/listing-images/1-24-3-11-6-12-29m.jpg')
      setUsername(data.name || `User ${publicKey.toString().slice(0, 8)}`)
      setBio(data.bio || '')
      setEditedUsername(data.name || `User ${publicKey.toString().slice(0, 8)}`)
      setEditedBio(data.bio || '')
      setShippingAddresses(data.shipping_address || [])
    }
  }

  const handleProfilePhotoChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      const { data, error } = await supabase.storage
        .from('new-bucket')  // Make sure this matches your actual bucket name
        .upload(`${publicKey.toString()}/${file.name}`, file)

      if (error) {
        console.error('Error uploading profile photo:', error)
      } else {
        const newProfilePhotoUrl = supabase.storage
          .from('new-bucket')  // Make sure this matches your actual bucket name
          .getPublicUrl(data.path).data.publicUrl

        const { error: updateError } = await supabase
          .from('users')
          .update({ profile_photo: [newProfilePhotoUrl] })
          .eq('wallet_address', publicKey.toString())

        if (updateError) {
          console.error('Error updating user profile:', updateError)
        } else {
          setProfilePhoto(newProfilePhotoUrl)
        }
      }
    }
  }

  const handleProfileChange = async () => {
    const { error } = await supabase
      .from('users')
      .update({ name: editedUsername, bio: editedBio })
      .eq('wallet_address', publicKey.toString())

    if (error) {
      console.error('Error updating profile:', error)
    } else {
      setUsername(editedUsername)
      setBio(editedBio)
      setEditingProfile(false)
    }
  }

  const handleAddressDialogOpen = (address = null) => {
    setCurrentAddress(address)
    setIsAddressDialogOpen(true)
  }

  const handleShippingAddressSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const newAddress = Object.fromEntries(formData.entries())

    let updatedAddresses
    if (currentAddress) {
      updatedAddresses = shippingAddresses.map(addr => 
        addr.id === currentAddress.id ? { ...addr, ...newAddress } : addr
      )
    } else {
      newAddress.id = Date.now().toString()
      updatedAddresses = [...shippingAddresses, newAddress]
    }

    const { error } = await supabase
      .from('users')
      .update({ shipping_address: updatedAddresses })
      .eq('wallet_address', publicKey.toString())

    if (error) {
      console.error('Error updating shipping address:', error)
    } else {
      setShippingAddresses(updatedAddresses)
      setIsAddressDialogOpen(false)
    }
  }

  const handleDeleteAddress = async (addressId) => {
    const updatedAddresses = shippingAddresses.filter(addr => addr.id !== addressId)
    const { error } = await supabase
      .from('users')
      .update({ shipping_address: updatedAddresses })
      .eq('wallet_address', publicKey.toString())

    if (error) {
      console.error('Error deleting shipping address:', error)
    } else {
      setShippingAddresses(updatedAddresses)
    }
  }

  if (!connected) {
    return <div>Please connect your wallet to view your profile.</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
      <div className="flex items-start mb-6">
        <div className="relative group mr-6">
          <Image
            src={profilePhoto}
            alt="Profile"
            width={96}
            height={96}
            className="rounded-full"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <label htmlFor="profile-photo-upload" className="cursor-pointer">
              <Camera className="text-white" size={24} />
            </label>
            <input
              id="profile-photo-upload"
              type="file"
              className="hidden"
              onChange={handleProfilePhotoChange}
              accept="image/*"
            />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">{username}</h2>
          {editingProfile ? (
            <div>
              <Input
                value={editedUsername}
                onChange={(e) => setEditedUsername(e.target.value)}
                className="mb-2"
                placeholder="Username"
              />
              <Textarea
                value={editedBio}
                onChange={(e) => setEditedBio(e.target.value)}
                className="mb-2"
                placeholder="Bio"
              />
              <Button onClick={handleProfileChange} className="mr-2">Save</Button>
              <Button variant="outline" onClick={() => setEditingProfile(false)}>Cancel</Button>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-2">{bio || "No bio yet."}</p>
              <Button onClick={() => setEditingProfile(true)}>
                <Edit className="mr-2 h-4 w-4" /> Edit Profile
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Shipping Addresses</h2>
        {shippingAddresses.length > 0 ? (
          <div className="space-y-4">
            {shippingAddresses.map((address) => (
              <div key={address.id} className="border p-4 rounded-md">
                <p>{address.street}</p>
                <p>{address.city}, {address.state} {address.zipCode}</p>
                <p>{address.country}</p>
                <div className="mt-2">
                  <Button onClick={() => handleAddressDialogOpen(address)} className="mr-2">Edit</Button>
                  <Button onClick={() => handleDeleteAddress(address.id)} variant="destructive">Delete</Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No shipping addresses added yet.</p>
        )}
        <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4">Add New Address</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{currentAddress ? 'Edit' : 'Add'} Shipping Address</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleShippingAddressSubmit} className="space-y-4">
              <Input name="street" defaultValue={currentAddress?.street} placeholder="Street Address" required />
              <Input name="city" defaultValue={currentAddress?.city} placeholder="City" required />
              <Input name="state" defaultValue={currentAddress?.state} placeholder="State" required />
              <Input name="zipCode" defaultValue={currentAddress?.zipCode} placeholder="Zip Code" required />
              <Input name="country" defaultValue={currentAddress?.country} placeholder="Country" required />
              <Button type="submit">Save Address</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}