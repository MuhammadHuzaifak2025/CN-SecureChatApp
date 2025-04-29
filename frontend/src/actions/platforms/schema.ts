import { z } from "zod";

const fileSchema = z
  .instanceof(File)
  .refine((file) => file.type.startsWith("image/"), {
    message: "Only image files are allowed",
  });

export const addPlatformSchema = z.object({
  name: z.string().nonempty({ message: "platform name is required" }),
  file: z.union([fileSchema, z.string()]).optional().nullable(),
  filePreview: z.string().url().optional().nullable(),
});

export const editPlatformSchema = z.object({
  id: z.string().nonempty(),
  name: z.string().nonempty({ message: "platform name is required" }),
  file: z.union([fileSchema, z.string()]).optional().nullable(),
  filePreview: z.string().url().optional().nullable(),
});

export const deletePlatformSchema = z.object({
  id: z.string().nonempty(),
});
