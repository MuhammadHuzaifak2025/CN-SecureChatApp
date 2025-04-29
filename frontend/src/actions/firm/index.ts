"use server";

import axios, { AxiosError } from "axios";
import { createSafeAction } from "@/lib/create-safe-action";
import { CreateFirmType, DeleteFirmType, EditFirmType } from "./type";
import { createFirmSchema, deleteFirmSchema, editFirmSchema } from "./schema";
import { cookies } from "next/headers";

export const addFirmHandler = async (formData: CreateFirmType) => {
  try {
    const cookieStore = await cookies();
    //Getting the token from the cookies
    const session = await cookieStore.get("session");
    if (!session) {
      throw new Error("Session not found");
    }
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/firms/add`,
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
      const id = response.data.id;
      const imageData = new FormData();

      imageData.append("id", id);
      imageData.append("file", formData.file);

      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/firms/logo`,
        imageData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${session.value}`,
          },
        }
      );
    }

    return { data: { success: "Firm added successfully" } };
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

export const editFirmHandler = async (formData: EditFirmType) => {
  try {
    const cookieStore = await cookies();
    //Getting the token from the cookies
    const session = await cookieStore.get("session");

    if (!session) {
      throw new Error("Session not found");
    }
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/firms/edit`,
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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/firms/logo/update`,
        imageData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${session.value}`,
          },
        }
      );
    }

    return { data: { success: "Firm edited successfully" } };
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

export const deleteFirmHandler = async (formData: DeleteFirmType) => {
  try {
    const cookieStore = await cookies();
    //Getting the token from the cookies
    const session = await cookieStore.get("session");

    if (!session) {
      throw new Error("Session not found");
    }
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/firms/delete`,
      {
        headers: {
          Authorization: `Bearer ${session.value}`,
        },
        data: {
          id: formData.id,
        },
      }
    );
    return { data: { success: "Firm Deleted Successfully" } };
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

export const addFirm = createSafeAction(createFirmSchema, addFirmHandler);
export const editFirm = createSafeAction(editFirmSchema, editFirmHandler);
export const deleteFirm = createSafeAction(deleteFirmSchema, deleteFirmHandler);
