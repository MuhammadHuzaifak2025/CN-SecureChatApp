export interface User {
    id: number
    email: string
    username: string
    fullname?: string
    is_online: boolean
    last_seen?: string
  }
  
  export interface ChatRoom {
    id: number
    name?: string
    is_group: boolean
    created_at: string
    members?: User[]
  }
  
  export interface ChatRoomMembership {
    user: User
    chat_room: ChatRoom
    joined_at: string
  }
  
  export interface Message {
    id: number
    sender: User
    chat_room: ChatRoom
    content: string
    timestamp: string
    is_read: boolean
    is_delivered: boolean
  }
  
  export interface TypingIndicator {
    id: number
    chat_room: ChatRoom
    user: User
    is_typing: boolean
    last_updated: string
  }
  
  export interface EncryptionKey {
    id: number
    user: User
    public_key: string
    created_at: string
  }
  