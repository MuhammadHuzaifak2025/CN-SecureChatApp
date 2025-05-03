import { SettingsForm } from "./_components/settings-form"
import { getServerSession } from "@/lib/auth"
// import { getUserSettings } from "@/lib/api/users"
import { redirect } from "next/navigation"

export default async function SettingsPage() {
  const session = await getServerSession()

  if (!session) {
    redirect("/login")
  }

  // const userSettings = await getUserSettings(session.user.id)

  return (
    <div className="container mx-auto max-w-4xl py-12">
      <h1 className="mb-8 text-3xl font-bold">Settings</h1>
      {/* <SettingsForm initialData={userSettings} /> */}
    </div>
  )
}
