"use client"

import { useState, useEffect } from "react"
import type { Session } from "../auth"

export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadSession() {
      try {
        // In a real app, this would fetch the session from an API endpoint
        const response = await fetch("/api/auth/session")
        if (response.ok) {
          const data = await response.json()
          setSession(data)
        }
      } catch (error) {
        console.error("Failed to load session:", error)
      } finally {
        setIsLoading(false)
      }
    }

    // Mock session data for demo
    setSession({
      user: {
        id: 1,
        email: "user@example.com",
        username: "user1",
        fullname: "John Doe",
        is_online: true,
      },
    })
    setIsLoading(false)

    // Uncomment to fetch real session
    // loadSession();
  }, [])

  return { session, isLoading }
}
