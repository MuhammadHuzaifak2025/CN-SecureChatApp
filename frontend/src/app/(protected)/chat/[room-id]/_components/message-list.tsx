"use client"

import { useEffect, useRef, useState } from "react"
import { useSession } from "@/lib/hooks/use-session"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Message, TypingIndicator as TypingIndicatorType } from "@/lib/types"
import { getInitials, formatMessageTime } from "@/lib/utils"
import { subscribeToMessages, subscribeToTypingIndicators } from "@/lib/api/messages"

interface MessageListProps {
  initialMessages: Message[]
  roomId: number
}

export function MessageList({ initialMessages, roomId }: MessageListProps) {
  const { session } = useSession()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [typingUsers, setTypingUsers] = useState<TypingIndicatorType[]>([])
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const messageSubscription = subscribeToMessages(roomId, (newMessage) => {
      setMessages((prev) => [...prev, newMessage])

      // Scroll to bottom on new message
      setTimeout(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
        }
      }, 0)
    })

    const typingSubscription = subscribeToTypingIndicators(roomId, (indicators) => {
      setTypingUsers(indicators.filter((i) => i.user.id !== session?.user.id))
    })

    return () => {
      messageSubscription()
      typingSubscription()
    }
  }, [roomId, session?.user.id])

  useEffect(() => {
    // Scroll to bottom on initial load
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [])

  return (
    <div className="flex-1 overflow-hidden">
      <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => {
            const isCurrentUser = message.sender.id === session?.user.id

            return (
              <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                <div className={`flex max-w-[70%] ${isCurrentUser ? "flex-row-reverse" : "flex-row"}`}>
                  <Avatar className={`h-8 w-8 ${isCurrentUser ? "ml-2" : "mr-2"}`}>
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>{getInitials(message.sender.fullname || message.sender.username)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div
                      className={`rounded-lg px-3 py-2 ${
                        isCurrentUser ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-900"
                      }`}
                    >
                      {message.content}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {formatMessageTime(message.timestamp)}
                      {isCurrentUser && <span className="ml-1">{message.is_delivered ? "Delivered" : "Sent"}</span>}
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
                  {getInitials(typingUsers[0].user.fullname || typingUsers[0].user.username)}
                </AvatarFallback>
              </Avatar>
              <div className="rounded-lg bg-gray-200 px-3 py-2 text-sm text-gray-900">
                {typingUsers.length === 1
                  ? `${typingUsers[0].user.username} is typing...`
                  : "Multiple people are typing..."}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
