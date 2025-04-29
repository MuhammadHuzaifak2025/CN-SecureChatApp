// Mock API functions for messages
import type { Message, TypingIndicator } from "../types"

export async function getMessages(roomId: number): Promise<Message[]> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const now = new Date()

      resolve([
        {
          id: 1,
          sender: {
            id: 1,
            email: "user@example.com",
            username: "user1",
            fullname: "John Doe",
            is_online: true,
          },
          chat_room: {
            id: roomId,
            is_group: false,
            created_at: new Date().toISOString(),
          },
          content: "Hello there!",
          timestamp: new Date(now.getTime() - 3600000).toISOString(),
          is_read: true,
          is_delivered: true,
        },
        {
          id: 2,
          sender: {
            id: 2,
            email: "jane@example.com",
            username: "jane",
            fullname: "Jane Smith",
            is_online: true,
          },
          chat_room: {
            id: roomId,
            is_group: false,
            created_at: new Date().toISOString(),
          },
          content: "Hi! How are you doing?",
          timestamp: new Date(now.getTime() - 3500000).toISOString(),
          is_read: true,
          is_delivered: true,
        },
        {
          id: 3,
          sender: {
            id: 1,
            email: "user@example.com",
            username: "user1",
            fullname: "John Doe",
            is_online: true,
          },
          chat_room: {
            id: roomId,
            is_group: false,
            created_at: new Date().toISOString(),
          },
          content: "I'm doing well, thanks for asking! How about you?",
          timestamp: new Date(now.getTime() - 3400000).toISOString(),
          is_read: true,
          is_delivered: true,
        },
      ])
    }, 300)
  })
}

export async function sendMessage(roomId: number, content: string): Promise<Message> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: Math.floor(Math.random() * 1000) + 10,
        sender: {
          id: 1,
          email: "user@example.com",
          username: "user1",
          fullname: "John Doe",
          is_online: true,
        },
        chat_room: {
          id: roomId,
          is_group: false,
          created_at: new Date().toISOString(),
        },
        content,
        timestamp: new Date().toISOString(),
        is_read: false,
        is_delivered: true,
      })
    }, 300)
  })
}

export async function updateTypingIndicator(roomId: number, isTyping: boolean): Promise<void> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, 100)
  })
}

// Mock subscription functions
export function subscribeToMessages(roomId: number, callback: (message: Message) => void): () => void {
  // In a real app, this would use WebSockets or SSE
  // For demo, we'll simulate a new message every 15 seconds
  const interval = setInterval(() => {
    const newMessage: Message = {
      id: Math.floor(Math.random() * 1000) + 100,
      sender: {
        id: 2,
        email: "jane@example.com",
        username: "jane",
        fullname: "Jane Smith",
        is_online: true,
      },
      chat_room: {
        id: roomId,
        is_group: false,
        created_at: new Date().toISOString(),
      },
      content: "This is a simulated message. How's it going?",
      timestamp: new Date().toISOString(),
      is_read: false,
      is_delivered: true,
    }

    callback(newMessage)
  }, 15000)

  return () => clearInterval(interval)
}

export function subscribeToTypingIndicators(
  roomId: number,
  callback: (indicators: TypingIndicator[]) => void,
): () => void {
  // In a real app, this would use WebSockets or SSE
  // For demo, we'll simulate typing indicators randomly
  const interval = setInterval(() => {
    const isTyping = Math.random() > 0.7

    if (isTyping) {
      const indicators: TypingIndicator[] = [
        {
          id: 1,
          chat_room: {
            id: roomId,
            is_group: false,
            created_at: new Date().toISOString(),
          },
          user: {
            id: 2,
            email: "jane@example.com",
            username: "jane",
            fullname: "Jane Smith",
            is_online: true,
          },
          is_typing: true,
          last_updated: new Date().toISOString(),
        },
      ]

      callback(indicators)

      // Clear typing indicator after 3 seconds
      setTimeout(() => {
        callback([])
      }, 3000)
    }
  }, 20000)

  return () => clearInterval(interval)
}
