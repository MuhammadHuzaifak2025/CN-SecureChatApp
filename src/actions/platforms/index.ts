"use server";

import axios, { AxiosError } from "axios";
import { createSafeAction } from "@/lib/create-safe-action";
import { AddPlatformType, DeletePlatformType, EditPlatformType } from "./type";
import {
  addPlatformSchema,
  deletePlatformSchema,
  editPlatformSchema,
} from "./schema";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export const addPlatformHandler = async (formData: AddPlatformType) => {
  try {
    
    const cookieStore = await cookies();
    //Getting the token from the cookies
    const session = await cookieStore.get("session");
    if (!session) {
      throw new Error("Session not found");
    }
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/platforms/add`,
      {
        ...formData,
      },
      {
        headers: {
          Authorization: `Bearer ${session.value}`,
        },
      }
    );
    if (formData.file && typeof formData.file != "string") {
      const id = response.data[0].id;
      const imageData = new FormData();

      imageData.append("id", id);
      imageData.append("file", formData.file);

      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/platforms/logo`,
        imageData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${session.value}`,
          },
        }
      );
    }
    revalidatePath("/firms/configuration/platforms");
    return { data: { success: "Platforms added successfully" } };
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

export const editPlatformHandler = async (formData: EditPlatformType) => {
  try {
    const cookieStore = await cookies();
    //Getting the token from the cookies
    const session = await cookieStore.get("session");

    if (!session) {
      throw new Error("Session not found");
    }
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/platforms/update`,
      {
        ...formData,
      },
      {
        headers: {
          Authorization: `Bearer ${session.value}`,
        },
      }
    );
    if (formData.file && typeof formData.file != "string") {
      const id = formData.id;
      const imageData = new FormData();

      imageData.append("id", id);
      imageData.append("file", formData.file);

      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/platforms/logo/update`,
        imageData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${session.value}`,
          },
        }
      );
    }
    revalidatePath("/firms/configuration/platforms");
    return { data: { success: "Platforms edited successfully" } };
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

export const deletePlatformHandler = async (formData: DeletePlatformType) => {
  try {
    const cookieStore = await cookies();
    //Getting the token from the cookies
    const session = await cookieStore.get("session");

    if (!session) {
      throw new Error("Session not found");
    }
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/platforms/delete`,
      {
        headers: {
          Authorization: `Bearer ${session.value}`,
        },
        data: {
          id: formData.id,
        },
      }
    );
  
    revalidatePath("/firms/configuration/platforms");
    return { data: { success: "Platforms Deleted Successfully" } };
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

export const addPlatform = createSafeAction(
  addPlatformSchema,
  addPlatformHandler
);
export const editPlatform = createSafeAction(
  editPlatformSchema,
  editPlatformHandler
);
export const deletePlatform = createSafeAction(
  deletePlatformSchema,
  deletePlatformHandler
);
