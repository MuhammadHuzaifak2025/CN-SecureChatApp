import { ProfileForm } from "./_components/profile-form"
import { getServerSession } from "@/lib/auth"
import { getUserProfile } from "@/lib/api/users"
import { redirect } from "next/navigation"

export default async function ProfilePage() {
  const session = await getServerSession()

  if (!session) {
    redirect("/login")
  }

  const userProfile = await getUserProfile(session.user.id)

  return (
    <div className="container mx-auto max-w-4xl py-12">
      <h1 className="mb-8 text-3xl font-bold">Your Profile</h1>
      <ProfileForm initialData={userProfile} />
    </div>
  )
}
