"use client"

import { useEffect, useRef, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Message, User } from "@/lib/types"
import { getInitials, formatMessageTime } from "@/lib/utils"
import { Check, CheckCheck } from "lucide-react"

interface MessageListProps {
  initialMessages: Message[]
  roomId: number
  currentUser: User
}

export function MessageList({ initialMessages, roomId, currentUser }: MessageListProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setMessages(initialMessages)
  }, [initialMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, typingUsers])

  const isMessageFromCurrentUser = (message: Message) => {
    return message.sender === currentUser.username
  }

  return (
    <div className="flex-1 overflow-hidden">
      <ScrollArea className="h-full p-4">
        <div className="space-y-4">
          {messages.map((message, index) => {
            const isSentByCurrentUser = isMessageFromCurrentUser(message)

            return (
              <div
                key={message.id || index}
                className={`flex ${isSentByCurrentUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex max-w-[75%] items-end space-x-2 ${isSentByCurrentUser
                    ? "flex-row-reverse space-x-reverse"
                    : "flex-row"
                    }`}
                >
                  <div className="flex item-center h-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>
                        {getInitials(isSentByCurrentUser ? currentUser.username : message.sender as string)}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div>
                    <div
                      className={`rounded-lg px-3 py-2 text-sm ${isSentByCurrentUser
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-900"
                        }`}
                    >
                      {message.content}
                    </div>
                    <div
                      className={`mt-1 flex items-center text-xs text-gray-500 ${isSentByCurrentUser ? "justify-end" : "justify-start"
                        }`}
                    >
                      <span>{formatMessageTime(message.timestamp)}</span>
                      {isSentByCurrentUser && (
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
                <AvatarFallback>{getInitials(typingUsers[0])}</AvatarFallback>
              </Avatar>
              <div className="rounded-lg bg-gray-200 px-3 py-2 text-sm text-gray-900">
                {typingUsers.length === 1
                  ? `${typingUsers[0]} is typing...`
                  : "Multiple people are typing..."}
              </div>
            </div>
          )}

          {/* Auto-scroll anchor */}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
    </div>
  )
}
