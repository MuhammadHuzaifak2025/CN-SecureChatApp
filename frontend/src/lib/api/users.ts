// Mock API functions for user data
import type { User } from "../types"

export async function getUserProfile(userId: number): Promise<User> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: userId,
        email: "user@example.com",
        username: "user1",
        fullname: "John Doe",
        is_online: true,
      })
    }, 300)
  })
}

export async function getUserSettings(userId: number): Promise<{ notifications: boolean; darkMode: boolean }> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        notifications: true,
        darkMode: false,
      })
    }, 300)
  })
}

export async function updateUserProfile(userId: number, data: Partial<User>): Promise<User> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: userId,
        email: data.email || "user@example.com",
        username: data.username || "user1",
        fullname: data.fullname || "John Doe",
        is_online: true,
      })
    }, 500)
  })
}

export async function getAllUsers(): Promise<User[]> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 2,
          email: "jane@example.com",
          username: "jane",
          fullname: "Jane Smith",
          is_online: true,
        },
        {
          id: 3,
          email: "bob@example.com",
          username: "bob",
          fullname: "Bob Johnson",
          is_online: false,
        },
        {
          id: 4,
          email: "alice@example.com",
          username: "alice",
          fullname: "Alice Williams",
          is_online: true,
        },
      ])
    }, 300)
  })
}
