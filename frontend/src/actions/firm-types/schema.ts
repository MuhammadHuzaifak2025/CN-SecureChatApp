import { z } from "zod";

export const createFirmTypeSchema = z.object({
  name: z.string().nonempty({ message: "firm type name is required" }),
});

export const editFirmTypeSchema = z.object({
  id: z.string().nonempty(),
  name: z.string().nonempty({ message: "firm type name is required" }),
});

export const deleteFirmTypeSchema = z.object({
  id: z.string().nonempty(),
});
