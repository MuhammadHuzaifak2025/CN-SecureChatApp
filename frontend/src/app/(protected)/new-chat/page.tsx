import { NewChatForm } from "./_components/new-chat-form"
import { getServerSession } from "@/lib/auth"
import { getAllUsers } from "@/lib/api/users"
import { redirect } from "next/navigation"

export default async function NewChatPage() {
  const session = await getServerSession()

  if (!session) {
    redirect("/login")
  }

  const users = await getAllUsers()
  const filteredUsers = users.filter((user) => user.id !== session.user.id)

  return (
    <div className="container mx-auto max-w-4xl py-12">
      <h1 className="mb-8 text-3xl font-bold">Start a New Chat</h1>
      <NewChatForm users={filteredUsers} />
    </div>
  )
}
