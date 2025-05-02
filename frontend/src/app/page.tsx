import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import React from 'react'

const Page = async () => {
  
    const cookieStore = await cookies()
    const access_token = cookieStore.get('access_token')
    if(access_token){
        redirect('/chat')
    } else{
        redirect('/auth/login')
    }
    return (
    <div>page</div>
  )
}

export default Page