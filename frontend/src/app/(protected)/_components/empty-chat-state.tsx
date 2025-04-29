import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"
import Link from "next/link"

export function EmptyChatState() {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
        <MessageSquare className="h-10 w-10 text-gray-500" />
      </div>
      <h2 className="mt-6 text-2xl font-semibold">No chat selected</h2>
      <p className="mt-2 max-w-md text-gray-500">
        Select an existing conversation or start a new chat to begin messaging.
      </p>
      <Button asChild className="mt-6">
        <Link href="/new-chat">Start a new chat</Link>
      </Button>
    </div>
  )
}
