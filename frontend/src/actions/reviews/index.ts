"use server";

import axios, { AxiosError } from "axios";
import { createSafeAction } from "@/lib/create-safe-action";
import { ScrapeReviewsType, ValidateReviewType } from "./type";
import {
  scrapeReviewsSchema,
  validateReviewSchema
} from "./schema";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export const validateReviewHandler = async (formData: ValidateReviewType) => {
  try {
    const cookieStore = await cookies();
    //Getting the token from the cookies
    
    const session = await cookieStore.get("session");
    if (!session) {
      throw new Error("Session not found");
    }
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/firm-reviews/validate`,
      {
        ...formData,
      },
      {
        headers: {
          Authorization: `Bearer ${session.value}`,
        },
      }
    );
    
    return { data: { success: "Review actions performed successfully" } };
  } catch (error) {
    console.log(error)
    if (error instanceof AxiosError && error.response?.data?.errors) {
      const firstKey = Object.keys(error.response.data.errors)[0];
      const firstErrorMessage = error.response.data.errors[firstKey][0];
      return { error: firstErrorMessage, data: null };
    } else if (error instanceof Error) {
      return { error: error.message };
    } else {
      return { error: "An unknown error occurred" };
    }
  }
};

export const scrapeReviewsHandler = async (formData: ScrapeReviewsType) => {
  try{
    const cookieStore = await cookies();
    const session = cookieStore.get("session");
    if (!session) {
      throw new Error("Session not found");
    }
    
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/firms/scrap`,
      {
        ...formData,
      },
      {
        headers: {
          Authorization: `Bearer ${session.value}`,
        },
      }
    );
    revalidatePath("/user-reviews/trustpilot");
    return { data: { success: "Reviews scraped successfully" } };
  }catch(error){
    console.log(error)
    if (error instanceof AxiosError && error.response?.data?.errors) {
      const firstKey = Object.keys(error.response.data.errors)[0];
      const firstErrorMessage = error.response.data.errors[firstKey][0];
      return { error: firstErrorMessage, data: null };
    } else if (error instanceof Error) {
      return { error: error.message };
    } else {
      return { error: "An unknown error occurred" };
    }
  }
}


export const validateReview = createSafeAction(
  validateReviewSchema,
  validateReviewHandler
);

export const scrapeReviews = createSafeAction(
  scrapeReviewsSchema,
  scrapeReviewsHandler
);

