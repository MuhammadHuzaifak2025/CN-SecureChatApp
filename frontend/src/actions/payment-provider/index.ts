"use server";

import axios, { AxiosError } from "axios";
import { createSafeAction } from "@/lib/create-safe-action";
import {
  CreatePaymentProviderType,
  DeletePaymentProviderType,
  EditPaymentProviderType,
} from "./type";
import {
  createPaymentProviderSchema,
  deletePaymentProviderSchema,
  editPaymentProviderSchema,
} from "./schema";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export const addPaymentProviderHandler = async (
  formData: CreatePaymentProviderType
) => {
  try {
    const cookieStore = await cookies();
    //Getting the token from the cookies
    const session = await cookieStore.get("session");
    if (!session) {
      throw new Error("Session not found");
    }
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payment-providers/add`,
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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payment-providers/logo`,
        imageData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${session.value}`,
          },
        }
      );
    }
    revalidatePath("/firms/configuration/payment-providers");
    return { data: { success: "Payment provider added successfully" } };
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

export const editPaymentProviderHandler = async (
  formData: EditPaymentProviderType
) => {
  try {
    const cookieStore = await cookies();
    //Getting the token from the cookies
    const session = await cookieStore.get("session");

    if (!session) {
      throw new Error("Session not found");
    }
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payment-providers/update`,
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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payment-providers/logo/update`,
        imageData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${session.value}`,
          },
        }
      );
    }
    revalidatePath("/firms/configuration/payment-providers");
    return { data: { success: "Payment provider edited successfully" } };
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

export const deletePaymentProviderHandler = async (
  formData: DeletePaymentProviderType
) => {
  try {
    const cookieStore = await cookies();
    //Getting the token from the cookies
    const session = await cookieStore.get("session");

    if (!session) {
      throw new Error("Session not found");
    }
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payment-providers/delete`,
      {
        headers: {
          Authorization: `Bearer ${session.value}`,
        },
        data: {
          id: formData.id,
        },
      }
    );

    revalidatePath("/firms/configuration/payment-providers");
    return { data: { success: "Payment provider Deleted Successfully" } };
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

export const addPaymentProvider = createSafeAction(
  createPaymentProviderSchema,
  addPaymentProviderHandler
);
export const editPaymentProvider = createSafeAction(
  editPaymentProviderSchema,
  editPaymentProviderHandler
);
export const deletePaymentProvider = createSafeAction(
  deletePaymentProviderSchema,
  deletePaymentProviderHandler
);
