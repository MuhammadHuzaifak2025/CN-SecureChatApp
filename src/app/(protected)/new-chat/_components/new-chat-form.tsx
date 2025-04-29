"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { User } from "@/lib/types"
import { createChatRoom } from "@/lib/api/chat-room"

interface NewChatFormProps {
  users: User[]
}

export function NewChatForm({ users }: NewChatFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isGroup, setIsGroup] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [groupName, setGroupName] = useState("")

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    try {
      const roomData = {
        is_group: isGroup,
        name: isGroup ? groupName : undefined,
        user_ids: selectedUsers.map((id) => Number.parseInt(id)),
      }

      const newRoom = await createChatRoom(roomData)
      router.push(`/chat/${newRoom.id}`)
    } catch (error) {
      console.error("Failed to create chat room:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUserSelect = (userId: string) => {
    if (isGroup) {
      setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
    } else {
      setSelectedUsers([userId])
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isGroup"
              checked={isGroup}
              onCheckedChange={(checked) => {
                setIsGroup(!!checked)
                setSelectedUsers([])
              }}
            />
            <Label htmlFor="isGroup">Create a group chat</Label>
          </div>

          {isGroup && (
            <div className="space-y-2">
              <Label htmlFor="groupName">Group Name</Label>
              <Input
                id="groupName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name"
                required={isGroup}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>{isGroup ? "Select group members" : "Select a user to chat with"}</Label>

            {isGroup ? (
              <div className="space-y-2">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`user-${user.id}`}
                      checked={selectedUsers.includes(user.id.toString())}
                      onCheckedChange={() => handleUserSelect(user.id.toString())}
                    />
                    <Label htmlFor={`user-${user.id}`}>
                      {user.fullname || user.username} ({user.email})
                    </Label>
                  </div>
                ))}
              </div>
            ) : (
              <Select onValueChange={handleUserSelect} value={selectedUsers[0]}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.fullname || user.username} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || selectedUsers.length === 0 || (isGroup && !groupName)}
          >
            {isLoading ? "Creating..." : "Create Chat"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
