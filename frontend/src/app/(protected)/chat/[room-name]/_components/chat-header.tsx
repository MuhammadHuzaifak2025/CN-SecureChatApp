"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Phone, Video } from "lucide-react"
import type { ChatRoom } from "@/lib/types"
import { getInitials } from "@/lib/utils"

interface ChatHeaderProps {
  chatRoom: ChatRoom
  isOnline: boolean
}

export function ChatHeader({ chatRoom, isOnline }: ChatHeaderProps) {
  return (
    <div className="flex h-14 items-center justify-between border-b px-4">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <Avatar>
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback>
              {chatRoom.is_group ? chatRoom.name?.substring(0, 2).toUpperCase() : getInitials(chatRoom.name || "")}
            </AvatarFallback>
          </Avatar>
          {!chatRoom.is_group && (
            <span 
              className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                isOnline ? 'bg-green-500' : 'bg-gray-400'
              }`}
            />
          )}
        </div>
        <div>
          <div className="font-medium">{chatRoom.name || "Chat"}</div>
          {!chatRoom.is_group && <div className="text-xs text-gray-500">{isOnline ? "Online" : "Offline"}</div>}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon">
          <Phone className="h-5 w-5" />
          <span className="sr-only">Call</span>
        </Button>
        <Button variant="ghost" size="icon">
          <Video className="h-5 w-5" />
          <span className="sr-only">Video Call</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View profile</DropdownMenuItem>
            <DropdownMenuItem>Mute notifications</DropdownMenuItem>
            <DropdownMenuItem>Search</DropdownMenuItem>
            {chatRoom.is_group && <DropdownMenuItem>Group info</DropdownMenuItem>}
            <DropdownMenuItem className="text-red-500">Delete chat</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}