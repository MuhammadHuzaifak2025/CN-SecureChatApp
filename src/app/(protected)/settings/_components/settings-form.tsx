"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { updateUserSettings, logout } from "@/lib/api/auth"

interface SettingsFormProps {
  initialData: {
    notifications: boolean
    darkMode: boolean
  }
}

export function SettingsForm({ initialData }: SettingsFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    notifications: initialData.notifications,
    darkMode: initialData.darkMode,
  })

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setSuccess(false)

    try {
      await updateUserSettings(formData)
      setSuccess(true)
    } catch (error) {
      console.error("Failed to update settings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleLogout() {
    try {
      await logout()
      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Failed to logout:", error)
    }
  }

  async function handleChangePassword() {
    router.push("/change-password")
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 pt-6">
          {success && (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-500">Settings updated successfully</div>
          )}

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Preferences</h2>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications">Notifications</Label>
                <p className="text-sm text-gray-500">Receive notifications for new messages</p>
              </div>
              <Switch
                id="notifications"
                checked={formData.notifications}
                onCheckedChange={(checked) => handleSwitchChange("notifications", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="darkMode">Dark Mode</Label>
                <p className="text-sm text-gray-500">Use dark theme for the application</p>
              </div>
              <Switch
                id="darkMode"
                checked={formData.darkMode}
                onCheckedChange={(checked) => handleSwitchChange("darkMode", checked)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Security</h2>

            <Button type="button" variant="outline" className="w-full" onClick={handleChangePassword}>
              Change Password
            </Button>

            <Button type="button" variant="destructive" className="w-full" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
