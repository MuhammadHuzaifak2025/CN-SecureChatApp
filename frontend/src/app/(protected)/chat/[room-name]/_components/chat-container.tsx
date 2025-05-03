"use client"

import { useEffect, useState } from "react"
import { ChatHeader } from "./chat-header"
import { ChatInput } from "./chat-input"
import { MessageList } from "./message-list"
import { useChatWebSocket } from "@/lib/hooks/use-chat-web-socket"
import { ChatRoom, Message, User } from "@/lib/types"

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
    setMessages,
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

  const handleSendMessage = (content: string): boolean => {
    try {
      console.log(currentUser)
      const newMessage: Message = {
        id: Date.now(), // temporary client-side ID
        sender:  currentUser.username,
        content,
        timestamp: new Date().toISOString(),
        is_read: false,
        is_delivered: false,
        chat_room: chatRoom.id
      }
  
      // // Immediately append message to UI
      // messageListRef.current?.addMessage(newMessage)
  
      // Send it to server
      setMessages(prev => [...prev, newMessage])

      sendMessage(newMessage.content)

  
      return true // success
    } catch (error) {
      console.error("Send message failed:", error)
      return false // failure
    }
  }

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
        onSendMessage={handleSendMessage}
        onTypingIndicator={sendTypingIndicator}
        isConnected={isConnected}
      />
    </div>
  )
}