import { clsx, type ClassValue } from "clsx";
import { setCookie, getCookie } from "cookies-next";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

//Functions to set and get the cookies from client-side
export function setCookies(jwt: string) {
  setCookie("jwt", jwt, { maxAge: 60 * 60 });
}

export function getInitials(name: string): string {
  if (!name) return ""

  const parts = name.split(" ")
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase()
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function formatMessageTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) {
    // Today, show time only
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  } else if (diffInDays === 1) {
    // Yesterday
    return "Yesterday"
  } else if (diffInDays < 7) {
    // Within a week, show day name
    return date.toLocaleDateString([], { weekday: "short" })
  } else {
    // Older, show date
    return date.toLocaleDateString([], { month: "short", day: "numeric" })
  }
}
