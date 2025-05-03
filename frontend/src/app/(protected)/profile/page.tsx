import { ProfileForm } from "./_components/profile-form"
import { getServerSession } from "@/lib/auth"
// import { getUserProfile } from "@/lib/api/users"
import { redirect } from "next/navigation"
import axios, { AxiosError } from "axios"
import { cookies } from "next/headers"

const fetchUserInfo = async () => {
  try {
      const cookieStore = await cookies()
      const access_token = cookieStore.get('access_token')
      if (!access_token) {
          redirect('/auth/login')
      }
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user`,
          {
              headers: {
                  Authorization: `Bearer ${access_token.value}`
              }
          }
      )
      console.log(response.data)
      return response.data
  } catch (err) {
      if(err instanceof AxiosError){
          console.log(err.response?.data)
      }
      console.log(err)
      return {}
  }
}

export default async function ProfilePage() {
  
  const userProfile = await fetchUserInfo()

  

  


  return (
    <div className="container mx-auto max-w-4xl py-12">
      <h1 className="mb-8 text-3xl font-bold">Your Profile</h1>
      <ProfileForm initialData={userProfile} />
    </div>
  )
}
