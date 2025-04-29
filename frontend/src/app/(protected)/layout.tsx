import type React from "react"
import { ChatSidebar } from "./_components/chat-sidebar"
import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function ChatLayout({
    children,
}: {
    children: React.ReactNode
}) {

    return (
        <div className="flex h-screen overflow-hidden">
            <ChatSidebar />
            <main className="flex-1 overflow-hidden">{children}</main>
        </div>
    )
}
