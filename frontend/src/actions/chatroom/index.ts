"use server";

import axios, { AxiosError } from "axios";
import { AddUsersType } from "./type";
import { cookies } from "next/headers";
import { createSafeAction } from "@/lib/create-safe-action";
import { AddUsersSchema } from "./schema";
import { revalidatePath } from "next/cache";

const addUserHandler = async (formData: AddUsersType) => {
    try {
        const cookieStore = await cookies();
        const access_token = cookieStore.get('access_token')
        console.log(formData)
        console.log(access_token)
        if(!access_token){
            throw new Error("No token found. Please login again.")
        }
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chatroom`,
            formData,
            {headers: {
                Authorization: `Bearer ${access_token.value}`
            }}
        );
        console.log(response.data)
        revalidatePath('/chat')
        return { data: { message: "user added successfully" } };
    } catch (error) {
        
        if (error instanceof AxiosError) {
            console.log(error.response?.data);
            return {
                error: error.response?.data?.error || "Failed to add user. Please try again later",
            };
        } else if (error instanceof Error) {
            return { error: error.message };
        } else {
            return { error: "An unknown error occurred" };
        }
    }
}

export const addUser = createSafeAction(AddUsersSchema, addUserHandler);