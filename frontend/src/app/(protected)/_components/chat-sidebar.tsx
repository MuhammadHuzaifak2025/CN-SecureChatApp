"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PlusIcon, Settings, User } from "lucide-react"
import { getInitials } from "@/lib/utils"


interface ChatRoom {
  id: number,
  name: string,
  is_group: boolean,
  created_at: string,
  members: string[]
}

interface Props {
  chatRooms: ChatRoom[]
  username: string
}

const ChatSidebar = ({ chatRooms, username }: Props) => {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-r bg-gray-50">
      <div className="flex h-14 items-center border-b px-4">
        <h1 className="text-lg font-semibold">Chat App</h1>
      </div>
      <div className="flex-1 overflow-auto">
        <ScrollArea className="h-full">
          <div className="space-y-1 p-2">
            {chatRooms.map((room) => {
              const isActive = pathname === `/chat/${room.id}`
              return (
                <Link
                  key={room.id}
                  href={room.is_group ? `/chat/${room.name}` : (room.members[0] != username ? `/chat/${room.members[0]}` : `/chat/${room.members[1]}`)}
                  className={`flex items-center space-x-3 rounded-md px-3 py-2 ${isActive ? "bg-gray-200" : "hover:bg-gray-100"
                    }`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>
                      {room.is_group ? room.name?.substring(0, 2).toUpperCase() : getInitials(room.name || "")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 truncate">
                    <div className="font-medium">{room.is_group ? room.name : (room.members[0] != username ? room.members[0] : room.members[1]) || "Chat"}</div>
                  </div>
                </Link>
              )
            })}
          </div>
        </ScrollArea>
      </div>
      <div className="border-t p-4">
        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" size="icon" asChild className="h-10 w-full">
            <Link href="/profile">
              <User className="h-5 w-5" />
              <span className="sr-only">Profile</span>
            </Link>
          </Button>
          <Button variant="outline" size="icon" asChild className="h-10 w-full">
            <Link href="/new-chat">
              <PlusIcon className="h-5 w-5" />
              <span className="sr-only">New Chat</span>
            </Link>
          </Button>
          <Button variant="outline" size="icon" asChild className="h-10 w-full">
            <Link href="/settings">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ChatSidebar