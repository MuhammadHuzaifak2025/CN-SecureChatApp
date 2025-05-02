"use server";
import { LoginType, SignupType } from "./type";
import axios, { AxiosError } from "axios";
import { createSafeAction } from "@/lib/create-safe-action";
import { LoginSchema, SignupSchema } from "./schema";
import { cookies } from "next/headers";

const loginHandler = async (formData: LoginType) => {
  try {
    const cookieStore = await cookies();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/login`,
      formData,
      { withCredentials: true }
    );

    const cookieHeader = response.headers["set-cookie"];
    if (cookieHeader) {
      const parts = cookieHeader[0].split(";").map((part) => part.trim());
      const [nameValue, ...attrParts] = parts;
      const [name, value] = nameValue.split("=");

      const cookieOptions: any = {
        httpOnly: true,
      };

      attrParts.forEach((attr) => {
        const [key, val] = attr.includes("=") ? attr.split("=") : [attr, true];
        const attrKey = key.toLowerCase();

        switch (attrKey) {
          case "path":
            cookieOptions.path = val || "/";
            break;
          case "max-age":
            cookieOptions.maxAge = parseInt(
              typeof val === "string" ? val : "0"
            );
            break;
          case "expires":
            cookieOptions.expires = new Date(
              typeof val === "string" ? val : Date.now()
            );
            break;
          case "secure":
            cookieOptions.secure = true;
            break;
          case "httponly":
            cookieOptions.httpOnly = true;
            break;
          case "samesite":
            cookieOptions.sameSite = val;
            break;
          default:
            break;
        }
      });

      cookieStore.set(name, value, cookieOptions);
    }
    return { data: { message: "login successfully" } };
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

export const signupHandler = async (formData: SignupType) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user`,
      formData
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
  cookieStore.delete("access_token");
  return { data: { success: true } };
};

export const login = createSafeAction(LoginSchema, loginHandler);
export const signup = createSafeAction(SignupSchema, signupHandler);
