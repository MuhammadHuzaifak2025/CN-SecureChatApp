"use server";

import axios, { AxiosError } from "axios";
import { createSafeAction } from "@/lib/create-safe-action";
import { AddAssetType, DeleteAssetType, EditAssetType } from "./type";
import { addAssetSchema, deleteAssetSchema, editAssetSchema } from "./schema";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export const addAssetHandler = async (formData: AddAssetType) => {
  try {
    const cookieStore = await cookies();
    //Getting the token from the cookies
    const session = await cookieStore.get("session");
    if (!session) {
      throw new Error("Session not found");
    }
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/assets/add`,
      {
        ...formData,
      },
      {
        headers: {
          Authorization: `Bearer ${session.value}`,
        },
      }
    );
    revalidatePath("/firms/configuration/assets");
    return { data: { success: "Assets added successfully" } };
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

export const editAssetHandler = async (formData: EditAssetType) => {
  try {
    const cookieStore = await cookies();
    //Getting the token from the cookies
    const session = await cookieStore.get("session");

    if (!session) {
      throw new Error("Session not found");
    }
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/assets/update`,
      {
        ...formData,
      },
      {
        headers: {
          Authorization: `Bearer ${session.value}`,
        },
      }
    );
    revalidatePath("/firms/configuration/assets");
    return { data: { success: "Assets edited successfully" } };
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

export const deleteAssetHandler = async (formData: DeleteAssetType) => {
  try {
    const cookieStore = await cookies();
    //Getting the token from the cookies
    const session = await cookieStore.get("session");

    if (!session) {
      throw new Error("Session not found");
    }
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/assets/delete`,
      {
        headers: {
          Authorization: `Bearer ${session.value}`,
        },
        data: {
          id: formData.id,
        },
      }
    );
    revalidatePath("/firms/configuration/assets");
    return { data: { success: "Assets Deleted Successfully" } };
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

export const addAsset = createSafeAction(addAssetSchema, addAssetHandler);
export const editAsset = createSafeAction(editAssetSchema, editAssetHandler);
export const deleteAsset = createSafeAction(
  deleteAssetSchema,
  deleteAssetHandler
);
