// Mock API functions for chat rooms
import { ChatRoom } from "../types"

export async function getChatRooms(): Promise<ChatRoom[]> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          name: "Jane Smith",
          is_group: false,
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          name: "Project Team",
          is_group: true,
          created_at: new Date().toISOString(),
        },
        {
          id: 3,
          name: "Bob Johnson",
          is_group: false,
          created_at: new Date().toISOString(),
        },
      ])
    }, 300)
  })
}

export async function getChatRoom(roomId: number): Promise<ChatRoom | null> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      if (roomId === 1) {
        resolve({
          id: 1,
          name: "Jane Smith",
          is_group: false,
          created_at: new Date().toISOString(),
        })
      } else if (roomId === 2) {
        resolve({
          id: 2,
          name: "Project Team",
          is_group: true,
          created_at: new Date().toISOString(),
        })
      } else if (roomId === 11) {
        resolve({
          id: 3,
          name: "Bob Johnson",
          is_group: false,
          created_at: new Date().toISOString(),
        })
      } else {
        resolve(null)
      }
    }, 300)
  })
}

interface CreateChatRoomParams {
  is_group: boolean
  name?: string
  user_ids: number[]
}

export async function createChatRoom(params: CreateChatRoomParams): Promise<ChatRoom> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: Math.floor(Math.random() * 1000) + 10,
        name: params.name || (params.is_group ? "New Group" : "New Chat"),
        is_group: params.is_group,
        created_at: new Date().toISOString(),
      })
    }, 500)
  })
}
