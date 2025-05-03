"use client"

import { useEffect, useState } from "react"
import { ChatHeader } from "./chat-header"
import { ChatInput } from "./chat-input"
import { MessageList } from "./message-list"
import { useChatWebSocket } from "@/lib/hooks/use-chat-web-socket"
import { ChatRoom, User } from "@/lib/types"

interface ChatContainerProps {
  receiverUsername: string
  currentUser: User
  accessToken: string
}

export function ChatContainer({ receiverUsername, currentUser, accessToken }: ChatContainerProps) {
  const [chatRoom, setChatRoom] = useState<ChatRoom>({
    id: 0,
    name: receiverUsername,
    is_group: false
  })
  
  const {
    messages,
    isConnected,
    isReceiverOnline,
    isLoading,
    sendMessage,
    sendTypingIndicator
  } = useChatWebSocket(receiverUsername, currentUser, accessToken)

  // If we get message data with a chatroom ID, update our chatroom
  useEffect(() => {
    if (messages.length > 0 && messages[0].chat_room) {
      setChatRoom(prev => ({
        ...prev,
        id: messages[0].chat_room
      }))
    }
  }, [messages])

  return (
    <div className="flex h-full flex-col">
      <ChatHeader 
        chatRoom={chatRoom} 
        isOnline={isReceiverOnline} 
      />
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-gray-500">Loading messages...</div>
        </div>
      ) : (
        <MessageList 
          initialMessages={messages} 
          roomId={chatRoom.id} 
          currentUser={currentUser}
        />
      )}
      <ChatInput 
        roomId={chatRoom.id} 
        onSendMessage={sendMessage}
        onTypingIndicator={sendTypingIndicator}
        isConnected={isConnected}
      />
    </div>
  )
}