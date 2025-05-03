"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Paperclip, Send, Smile } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

interface ChatInputProps {
  roomId: number
  onSendMessage: (message: string) => boolean
  onTypingIndicator: (isTyping: boolean) => void
  isConnected: boolean
}

export function ChatInput({ roomId, onSendMessage, onTypingIndicator, isConnected }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showError, setShowError] = useState(false)
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
      onTypingIndicator(true)
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      onTypingIndicator(false)
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
      const success = onSendMessage(message);
      
      if (!success) {
        setShowError(true);
        return;
      }
      
      setMessage("")
      setIsTyping(false)
      onTypingIndicator(false)

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      if (textareaRef.current) {
        textareaRef.current.focus()
      }
    } catch (error) {
      console.error("Failed to send message:", error)
      setShowError(true)
    }
  }

  return (
    <>
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
            placeholder={isConnected ? "Type a message..." : "Connecting..."}
            className="min-h-10 flex-1 resize-none"
            disabled={!isConnected}
            rows={1}
          />
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <Smile className="h-5 w-5" />
            <span className="sr-only">Emoji</span>
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={!message.trim() || !isConnected} 
            size="icon" 
            className="h-8 w-8 shrink-0"
          >
            <Send className="h-5 w-5" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
        {!isConnected && (
          <div className="mt-2 flex items-center justify-center text-xs text-red-500">
            <AlertCircle className="mr-1 h-3 w-3" />
            <span>Connecting to chat server...</span>
          </div>
        )}
      </div>

      <AlertDialog open={showError} onOpenChange={setShowError}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Connection Error</AlertDialogTitle>
            <AlertDialogDescription>
              Failed to send your message. Please check your internet connection and try again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}