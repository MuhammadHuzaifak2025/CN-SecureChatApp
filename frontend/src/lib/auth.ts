import { cookies } from "next/headers"
import type { User } from "./types"

export interface Session {
  user: User
}

export async function getServerSession() {
  // In a real app, this would verify the session cookie with your backend
  //const sessionCookie = await cookies().get("session")

//   if (!sessionCookie) {
//     return null
//   }

  try {
    // Mock session data
    return {
      user: {
        id: 1,
        email: "user@example.com",
        username: "user1",
        fullname: "John Doe",
        is_online: true,
      },
    }
  } catch (error) {
    console.error("Failed to parse session:", error)
    return null
  }
}
