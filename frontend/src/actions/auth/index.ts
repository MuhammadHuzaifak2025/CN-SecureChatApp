"use server";
import { LoginType, SignupType } from "./type";
import axios, { AxiosError } from "axios";
import { createSafeAction } from "@/lib/create-safe-action";
import { LoginSchema, SignupSchema } from "./schema";
import { cookies } from "next/headers";

export const loginHandler = async (formData: LoginType) => {
  try {
    const cookieStore = await cookies();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/login/`,
      formData,
    );

    let session = response.headers["authorization"];
    session = session.replace("Bearer ", "");

    cookieStore.set("session", session, {
      httpOnly: true,
    });
    return { data: { message: "login successfully" } };

  } catch (error) {
    console.log(error);

    if (error instanceof AxiosError) {
      return {
        error: error.response?.data?.error || "Login request failed",
      };
    } else if (error instanceof Error) {
      return { error: error.message };
    } else {
      return { error: "An unknown error occurred" };
    }
  }
};

export const signupHandler = async (formData: SignupType) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/signup/`,
      formData,
    );

    return { data: { message: "signup successfully" } };

  } catch (error) {
    console.log(error);

    if (error instanceof AxiosError) {
      return {
        error: error.response?.data?.error || "Login request failed",
      };
    } else if (error instanceof Error) {
      return { error: error.message };
    } else {
      return { error: "An unknown error occurred" };
    }
  }
};

export const logout = async (str: string) => {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  return { data: { success: true } };
};

export const login = createSafeAction(LoginSchema, loginHandler);
export const signup = createSafeAction(SignupSchema, signupHandler);