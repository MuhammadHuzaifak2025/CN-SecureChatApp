"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Paperclip, Send, Smile } from "lucide-react"
import { sendMessage, updateTypingIndicator } from "@/lib/api/messages"

interface ChatInputProps {
  roomId: number
}

export function ChatInput({ roomId }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true)
      updateTypingIndicator(roomId, true)
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      updateTypingIndicator(roomId, false)
    }, 3000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    handleTyping()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSend = async () => {
    if (!message.trim()) return

    try {
      await sendMessage(roomId, message)
      setMessage("")
      setIsTyping(false)
      updateTypingIndicator(roomId, false)

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      if (textareaRef.current) {
        textareaRef.current.focus()
      }
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  return (
    <div className="border-t p-4">
      <div className="flex items-end space-x-2">
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
          <Paperclip className="h-5 w-5" />
          <span className="sr-only">Attach file</span>
        </Button>
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="min-h-10 flex-1 resize-none"
          rows={1}
        />
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
          <Smile className="h-5 w-5" />
          <span className="sr-only">Emoji</span>
        </Button>
        <Button onClick={handleSend} disabled={!message.trim()} size="icon" className="h-8 w-8 shrink-0">
          <Send className="h-5 w-5" />
          <span className="sr-only">Send</span>
        </Button>
      </div>
    </div>
  )
}
