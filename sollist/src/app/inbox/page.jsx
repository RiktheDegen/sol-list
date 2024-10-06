'use client'

import { useState, useEffect, useRef } from 'react'
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useWallet } from '@solana/wallet-adapter-react'
import { useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from 'lucide-react'

export default function InboxPage() {
  const [chats, setChats] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [error, setError] = useState(null)
  const [userId, setUserId] = useState(null)
  const messagesEndRef = useRef(null)
  const supabase = createClientComponentClient()
  const { publicKey, connected } = useWallet()
  const searchParams = useSearchParams()
  const listingId = searchParams.get('listing')

  useEffect(() => {
    if (connected && publicKey) {
      fetchUserId()
    }
  }, [connected, publicKey])

  useEffect(() => {
    if (userId) {
      fetchChats()
      if (listingId) {
        fetchOrCreateChat(listingId)
      }
    }
  }, [userId, listingId])

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.id)
      const channel = subscribeToMessages(selectedChat.id)
      return () => {
        channel.unsubscribe()
      }
    }
  }, [selectedChat])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchUserId = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', publicKey.toString())
        .single()

      if (error) throw error

      setUserId(data.id)
    } catch (error) {
      console.error('Error fetching user ID:', error)
      setError('Failed to load user data')
    }
  }

  const fetchChats = async () => {
    try {
      if (!userId) {
        throw new Error('User ID not available')
      }

      console.log('Fetching chats for user ID:', userId)

      const { data, error } = await supabase
        .from('chats')
        .select(`
          *,
          listing(*)
        `)
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)

      if (error) throw error

      console.log('Fetched chats:', data)
      if (data.length === 0) {
        console.log('No chats found for this user')
      }
      setChats(data || [])
    } catch (error) {
      console.error('Error fetching chats:', error)
      setError('Failed to load chats')
    }
  }

  const fetchOrCreateChat = async (listingId) => {
    try {
      const { data: listing, error: listingError } = await supabase
        .from('listing')
        .select('user_id, title, price')
        .eq('id', listingId)
        .single()

      if (listingError) throw listingError

      const { data: existingChat, error: chatError } = await supabase
        .from('chats')
        .select('*')
        .eq('listing_id', listingId)
        .eq('buyer_id', userId)
        .single()

      if (existingChat) {
        console.log('Existing chat found:', existingChat)
        setSelectedChat({...existingChat, listing})
      } else {
        const { data: newChat, error } = await supabase
          .from('chats')
          .insert({
            listing_id: listingId,
            buyer_id: userId,
            seller_id: listing.user_id
          })
          .select()
          .single()

        if (error) throw error

        console.log('New chat created:', newChat)
        setSelectedChat({...newChat, listing})
        setChats(prevChats => [...prevChats, {...newChat, listing}])
      }
    } catch (error) {
      console.error('Error fetching or creating chat:', error)
      setError('Failed to load or create chat')
    }
  }

  const fetchMessages = async (chatId) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })

      if (error) throw error

      console.log('Fetched messages:', data)
      setMessages(data)
    } catch (error) {
      console.error('Error fetching messages:', error)
      setError('Failed to load messages')
    }
  }

  const subscribeToMessages = (chatId) => {
    const channel = supabase
      .channel(`chat_${chatId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` }, 
        payload => {
          console.log('New message received:', payload.new)
          setMessages(prevMessages => [...prevMessages, payload.new])
        }
      )
      .subscribe()

    return channel
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedChat) return

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          chat_id: selectedChat.id,
          sender_id: userId,
          content: newMessage
        })
        .select()
        .single()

      if (error) throw error

      console.log('Message sent successfully:', data)
      setMessages(prevMessages => [...prevMessages, data])
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
      setError('Failed to send message')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(e)
    }
  }

  const isSeller = (chat) => chat.seller_id === userId

  if (!connected) {
    return <div>Please connect your wallet to view messages.</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="flex h-screen">
      {/* Chat list */}
      <div className="w-1/4 border-r">
        <h2 className="text-xl font-bold p-4">Chats</h2>
        {chats.map(chat => (
          <div
            key={chat.id}
            className={`p-4 cursor-pointer ${selectedChat?.id === chat.id ? 'bg-gray-200' : ''}`}
            onClick={() => setSelectedChat(chat)}
          >
            <p className="font-semibold">{chat.listing?.title || 'Untitled Listing'}</p>
            <p className="text-sm text-gray-500">{chat.listing?.price || 'N/A'} USDC</p>
            <p className="text-xs text-gray-400">
              {isSeller(chat) ? 'You are selling' : 'You are buying'}
            </p>
          </div>
        ))}
      </div>

      {/* Chat area */}
      <div className="w-3/4 flex flex-col">
        {selectedChat ? (
          <>
            <div className="p-4 border-b">
              <h3 className="font-bold">{selectedChat.listing?.title || 'Untitled Listing'}</h3>
              <p>{selectedChat.listing?.price || 'N/A'} USDC</p>
              <p className="text-sm text-gray-500">
                {isSeller(selectedChat) ? 'You are selling' : 'You are buying'}
              </p>
            </div>
            <div className="flex-grow overflow-y-auto p-4">
              {messages.map((message, index) => (
                <div key={index} className={`mb-2 ${message.sender_id === userId ? 'text-right' : 'text-left'}`}>
                  <span className="inline-block bg-gray-200 rounded px-2 py-1">
                    {message.content}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMessage} className="p-4 border-t flex">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-grow mr-2"
              />
              <Button type="submit">
                <Send size={20} />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>Select a chat or start a new conversation</p>
          </div>
        )}
      </div>
    </div>
  )
}