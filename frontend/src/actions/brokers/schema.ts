import { z } from "zod";

const fileSchema = z
  .instanceof(File)
  .refine((file) => file.type.startsWith("image/"), {
    message: "Only image files are allowed",
  });

export const addBrokerSchema = z.object({
  name: z.string().nonempty({ message: "broker name is required" }),
  file: z.union([fileSchema, z.string()]).optional().nullable(),
  filePreview: z.string().url().optional().nullable(),
});

export const editBrokerSchema = z.object({
  id: z.string().nonempty(),
  name: z.string().nonempty({ message: "broker name is required" }),
  file: z.union([fileSchema, z.string()]).optional().nullable(),
  filePreview: z.string().url().optional().nullable(),
});

export const deleteBrokerSchema = z.object({
  id: z.string().nonempty(),
});
