"use server";
import { UpdateProfileType } from "./type";
import axios, { AxiosError } from "axios";
import { createSafeAction } from "@/lib/create-safe-action";
import { UpdateProfileSchema } from "./schema";
import { cookies } from "next/headers";

const upadateProfileHandler = async (formData: UpdateProfileType) => {
  try {
    const cookieStore = await cookies();
    const access_token = cookieStore.get('access_token')
    if (!access_token) {
      throw new Error("No token found. Please login again.")
    }
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${access_token.value}`
        }
      }
    );
    return { data: { message: "user profile updated successfully" } };
  } catch (error) {
    console.log(error);

    if (error instanceof AxiosError) {
      return {
        error: error.response?.data?.non_field_errors[0] || "Login request failed",
      };
    } else if (error instanceof Error) {
      return { error: error.message };
    } else {
      return { error: "An unknown error occurred" };
    }
  }
};

export const updateProfile = createSafeAction(UpdateProfileSchema, upadateProfileHandler);

