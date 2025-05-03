import { cookies } from "next/headers"
import { ChatContainer } from "./_components/chat-container"
import { redirect } from "next/navigation"
import axios, { AxiosError } from "axios"

interface ChatRoomPageProps {
  params: Promise<{ 'room-name': string }>
}

const fetchUserInfo = async (access_token:string) => {
  try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user`,
          {
              headers: {
                  Authorization: `Bearer ${access_token}`
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

const ChatRoomPage = async ({ params }: ChatRoomPageProps) => {
  const param = await params
  const roomName = param['room-name']
  

  const cookieStore = await cookies()
  const access_token = cookieStore.get('access_token')
  if (!access_token) {
      redirect('/auth/login')
  }

  // Fetch user data from the backend
  const userData = await fetchUserInfo(access_token.value)
  console.log(userData)
  
  
  return (
    <ChatContainer 
      receiverUsername={roomName} 
      currentUser={userData} 
      accessToken={access_token.value}
    />
  )
}

export default ChatRoomPage