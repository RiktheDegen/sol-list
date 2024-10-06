import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'

export default async function handler(req, res) {
  const supabase = createServerSupabaseClient({ req, res })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return res.status(401).json({
      error: 'not_authenticated',
      description: 'The user does not have an active session or is not authenticated',
    })
  }

  // Get user ID from the session
  const userId = session.user.id

  switch (req.method) {
    case 'GET':
      if (req.query.action === 'fetchChats') {
        await handleFetchChats(supabase, userId, res)
      } else if (req.query.action === 'fetchMessages') {
        await handleFetchMessages(supabase, userId, req.query.chatId, res)
      }
      break
    case 'POST':
      if (req.body.action === 'sendMessage') {
        await handleSendMessage(supabase, userId, req.body, res)
      } else if (req.body.action === 'createChat') {
        await handleCreateChat(supabase, userId, req.body, res)
      }
      break
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

async function handleFetchChats(supabase, userId, res) {
  const { data, error } = await supabase
    .from('chats')
    .select(`
      *,
      listing(*)
    `)
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)

  if (error) {
    return res.status(400).json({ error: error.message })
  }
  res.status(200).json(data)
}

async function handleFetchMessages(supabase, userId, chatId, res) {
  // First, verify that the user is part of this chat
  const { data: chatData, error: chatError } = await supabase
    .from('chats')
    .select('*')
    .eq('id', chatId)
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .single()

  if (chatError || !chatData) {
    return res.status(403).json({ error: 'Not authorized to access this chat' })
  }

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true })

  if (error) {
    return res.status(400).json({ error: error.message })
  }
  res.status(200).json(data)
}

async function handleSendMessage(supabase, userId, body, res) {
  const { chatId, content } = body

  // Verify that the user is part of this chat
  const { data: chatData, error: chatError } = await supabase
    .from('chats')
    .select('*')
    .eq('id', chatId)
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .single()

  if (chatError || !chatData) {
    return res.status(403).json({ error: 'Not authorized to send messages in this chat' })
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      chat_id: chatId,
      sender_id: userId,
      content: content
    })
    .select()
    .single()

  if (error) {
    return res.status(400).json({ error: error.message })
  }
  res.status(200).json(data)
}

async function handleCreateChat(supabase, userId, body, res) {
  const { listingId } = body

  const { data: listing, error: listingError } = await supabase
    .from('listing')
    .select('user_id, title, price')
    .eq('id', listingId)
    .single()

  if (listingError) {
    return res.status(400).json({ error: listingError.message })
  }

  const { data: existingChat, error: chatError } = await supabase
    .from('chats')
    .select('*')
    .eq('listing_id', listingId)
    .eq('buyer_id', userId)
    .single()

  if (existingChat) {
    return res.status(200).json(existingChat)
  }

  const { data: newChat, error } = await supabase
    .from('chats')
    .insert({
      listing_id: listingId,
      buyer_id: userId,
      seller_id: listing.user_id
    })
    .select()
    .single()

  if (error) {
    return res.status(400).json({ error: error.message })
  }
  res.status(200).json(newChat)
}