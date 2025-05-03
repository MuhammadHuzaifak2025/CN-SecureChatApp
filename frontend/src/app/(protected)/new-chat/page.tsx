import { NewChatForm } from "./_components/new-chat-form"
// import { getAllUsers } from "@/lib/api/users"
import { redirect } from "next/navigation"

export default async function NewChatPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12">
      <h1 className="mb-8 text-3xl font-bold">Start a New Chat</h1>
      <NewChatForm/>
    </div>
  )
}
