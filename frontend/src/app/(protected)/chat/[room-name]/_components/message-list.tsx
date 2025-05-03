"use client"

import { useEffect, useRef, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Message, TypingIndicator, User } from "@/lib/types"
import { getInitials, formatMessageTime } from "@/lib/utils"
import { Check, CheckCheck } from "lucide-react"
import { webSocketService } from "@/utils/web-socket"

interface MessageListProps {
  initialMessages: Message[]
  roomId: number
  currentUser: User
}

export function MessageList({ initialMessages, roomId, currentUser }: MessageListProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Update messages when initialMessages changes
  useEffect(() => {
    setMessages(initialMessages)
  }, [initialMessages])

  useEffect(() => {
    // Subscribe to typing indicators
    // This could be implemented in the webSocketService if needed
    
    // Scroll to bottom on initial load
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [])

  // Scroll to bottom on new message
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const getSenderInfo = (message: Message) => {
    if (typeof message.sender === 'string') {
      return {
        id: message.sender,
        username: message.sender,
        fullname: message.sender
      }; 
    }
    return message.sender as User;
  }

  const isCurrentUser = (message: Message) => {
    const sender = getSenderInfo(message);
    return sender.id === currentUser.id || 
           sender.username === currentUser.username;
  }

  return (
    <div className="flex-1 overflow-hidden">
      <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => {
            const isSent = isCurrentUser(message);
            const sender = getSenderInfo(message);

            return (
              <div key={message.id} className={`flex ${isSent ? "justify-end" : "justify-start"}`}>
                <div className={`flex max-w-[70%] ${isSent ? "flex-row-reverse" : "flex-row"}`}>
                  <Avatar className={`h-8 w-8 ${isSent ? "ml-2" : "mr-2"}`}>
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>{getInitials(sender.fullname || sender.username)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div
                      className={`rounded-lg px-3 py-2 ${
                        isSent ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-900"
                      }`}
                    >
                      {message.content}
                    </div>
                    <div className="mt-1 flex items-center text-xs text-gray-500">
                      <span>{formatMessageTime(message.timestamp)}</span>
                      {isSent && (
                        <span className="ml-1">
                          {message.is_read ? (
                            <CheckCheck className="h-3 w-3 text-blue-500" />
                          ) : message.is_delivered ? (
                            <CheckCheck className="h-3 w-3" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {typingUsers.length > 0 && (
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>
                  {getInitials(typingUsers[0])}
                </AvatarFallback>
              </Avatar>
              <div className="rounded-lg bg-gray-200 px-3 py-2 text-sm text-gray-900">
                {typingUsers.length === 1
                  ? `${typingUsers[0]} is typing...`
                  : "Multiple people are typing..."}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}