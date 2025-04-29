"use server";

import axios, { AxiosError } from "axios";
import { createSafeAction } from "@/lib/create-safe-action";
import { AddBrokerType, DeleteBrokerType, EditBrokerType } from "./type";
import {
  addBrokerSchema,
  deleteBrokerSchema,
  editBrokerSchema,
} from "./schema";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export const addBrokerHandler = async (formData: AddBrokerType) => {
  try {
    const cookieStore = await cookies();
    //Getting the token from the cookies
    const session = await cookieStore.get("session");
    if (!session) {
      throw new Error("Session not found");
    }
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/brokers/add`,
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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/brokers/logo`,
        imageData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${session.value}`,
          },
        }
      );
    }
    revalidatePath("/firms/configuration/Brokers");
    return { data: { success: "Brokers added successfully" } };
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

export const editBrokerHandler = async (formData: EditBrokerType) => {
  try {
    const cookieStore = await cookies();
    //Getting the token from the cookies
    const session = await cookieStore.get("session");

    if (!session) {
      throw new Error("Session not found");
    }
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/brokers/update`,
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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/brokers/logo/update`,
        imageData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${session.value}`,
          },
        }
      );
    }
    revalidatePath("/firms/configuration/Brokers");
    return { data: { success: "Brokers edited successfully" } };
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

export const deleteBrokerHandler = async (formData: DeleteBrokerType) => {
  try {
    const cookieStore = await cookies();
    //Getting the token from the cookies
    const session = await cookieStore.get("session");

    if (!session) {
      throw new Error("Session not found");
    }
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/brokers/delete`,
      {
        headers: {
          Authorization: `Bearer ${session.value}`,
        },
        data: {
          id: formData.id,
        },
      }
    );
    revalidatePath("/firms/configuration/Brokers");
    return { data: { success: "Brokers Deleted Successfully" } };
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

export const addBroker = createSafeAction(addBrokerSchema, addBrokerHandler);
export const editBroker = createSafeAction(editBrokerSchema, editBrokerHandler);
export const deleteBroker = createSafeAction(
  deleteBrokerSchema,
  deleteBrokerHandler
);
