"use server";

import axios, { AxiosError } from "axios";
import { createSafeAction } from "@/lib/create-safe-action";
import {
  CreateFirmTypeType,
  DeleteFirmTypeType,
  EditFirmTypeType,
} from "./type";
import {
  createFirmTypeSchema,
  deleteFirmTypeSchema,
  editFirmTypeSchema,
} from "./schema";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export const addFirmTypeHandler = async (formData: CreateFirmTypeType) => {
  try {
    const cookieStore = await cookies();
    //Getting the token from the cookies
    const session = await cookieStore.get("session");
    if (!session) {
      throw new Error("Session not found");
    }
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/firm-types/add`,
      {
        ...formData,
      },
      {
        headers: {
          Authorization: `Bearer ${session.value}`,
        },
      }
    );
    revalidatePath("/firms/configuration/firm-types");
    return { data: { success: "Firm type added successfully" } };
  } catch (error) {
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

export const editFirmTypeHandler = async (formData: EditFirmTypeType) => {
  try {
    const cookieStore = await cookies();
    //Getting the token from the cookies
    const session = await cookieStore.get("session");

    if (!session) {
      throw new Error("Session not found");
    }
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/firm-types/update`,
      {
        ...formData,
      },
      {
        headers: {
          Authorization: `Bearer ${session.value}`,
        },
      }
    );
    revalidatePath("/firms/configuration/firm-types");
    return { data: { success: "Firm type edited successfully" } };
  } catch (error) {
    console.error("Error occurred:", error);

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

export const deleteFirmTypeHandler = async (formData: DeleteFirmTypeType) => {
  try {
    const cookieStore = await cookies();
    //Getting the token from the cookies
    const session = await cookieStore.get("session");

    if (!session) {
      throw new Error("Session not found");
    }
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/firm-types/delete`,
      {
        headers: {
          Authorization: `Bearer ${session.value}`,
        },
        data: {
          id: formData.id,
        },
      }
    );
    revalidatePath("/firms/configuration/firm-types");

    return { data: { success: "Firm types Deleted Successfully" } };
  } catch (error) {
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

export const addFirmType = createSafeAction(
  createFirmTypeSchema,
  addFirmTypeHandler
);
export const editFirmType = createSafeAction(
  editFirmTypeSchema,
  editFirmTypeHandler
);
export const deleteFirmType = createSafeAction(
  deleteFirmTypeSchema,
  deleteFirmTypeHandler
);
