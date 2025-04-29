import { ChatHeader } from "./_components/chat-header"
import { ChatInput } from "./_components/chat-input"
import { MessageList } from "./_components/message-list"
import { getChatRoom } from "@/lib/api/chat-room"
import { getMessages } from "@/lib/api/messages"
import { notFound } from "next/navigation"

export default async function ChatRoomPage({
  params,
}: {
  params: { roomId: string }
}) {
  const roomId = Number.parseInt(params.roomId)

  if (isNaN(roomId)) {
    notFound()
  }

  const chatRoom = await getChatRoom(roomId)

  if (!chatRoom) {
    notFound()
  }

  const initialMessages = await getMessages(roomId)

  return (
    <div className="flex h-full flex-col">
      <ChatHeader chatRoom={chatRoom} />
      <MessageList initialMessages={initialMessages} roomId={roomId} />
      <ChatInput roomId={roomId} />
    </div>
  )
}
