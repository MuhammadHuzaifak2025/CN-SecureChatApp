import type React from "react"
import ChatSidebar  from "./_components/chat-sidebar"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import axios, { AxiosError } from "axios"


interface UserInfo{
    id: number,
    email: string,
    username: string,
    fullname: string,
}

const fetchData = async () => {
    try {
        const cookieStore = await cookies()
        const access_token = cookieStore.get('access_token')
        if (!access_token) {
            redirect('/auth/login')
        }
        console.log(access_token)
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chatroom`,
            {
                headers: {
                    Authorization: `Bearer ${access_token.value}`
                }
            }
        )
        console.log(response.data)
        return response.data || []
    } catch (err) {
        if(err instanceof AxiosError){
            console.log(err.response?.data)
        }
        console.log(err)
        return []
    }
}

const fetchUserInfo = async () => {
    try {
        const cookieStore = await cookies()
        const access_token = cookieStore.get('access_token')
        if (!access_token) {
            redirect('/auth/login')
        }
        console.log(access_token)
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


export default async function ChatLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const data = await fetchData()
    const userInfoData:UserInfo = await fetchUserInfo()
    return (
        <div className="flex h-screen overflow-hidden">
            <ChatSidebar chatRooms={data} username={userInfoData.username}/>
            <main className="flex-1 overflow-hidden">{children}</main>
        </div>
    )
}
