"use client"

import type React from "react"

import { useState } from "react"
import { redirect, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { updateUserSettings } from "@/lib/api/auth"
import { toast } from "sonner"
import { useAction } from "@/hooks/useAction"
import { logout } from "@/actions/auth"
import { Loader } from "lucide-react"

interface SettingsFormProps {
  initialData: {
    notifications: boolean
    darkMode: boolean
  }
}

export function SettingsForm({ initialData }: SettingsFormProps) {
  const [formData, setFormData] = useState({
    notifications: initialData.notifications,
    darkMode: initialData.darkMode,
  })

  const { isLoading, execute: logoutAction } = useAction(logout, {
    onSuccess() {
      toast.success("Logged out successfully");
      redirect("/auth/login");
    },
    onError(error) {
      toast.error(error);
    },
  });

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }


  return (
    <Card>
      <form>
        <CardContent className="space-y-6 pt-6">
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

          <div className="space-y-4 flex justify-end">
            <Button
              disabled={isLoading}
              onClick={() => logoutAction("logout")}
            >
              {isLoading ? (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Logout"
              )}
            </Button>
          </div>
        </CardContent>
        <CardFooter>
        </CardFooter>
      </form>
    </Card>
  )
}
