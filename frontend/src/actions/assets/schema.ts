import { z } from "zod";

export const addAssetSchema = z.object({
  name: z.string().nonempty({ message: "asset name is required" }),
});

export const editAssetSchema = z.object({
  id: z.string().nonempty(),
  name: z.string().nonempty({ message: "asset name is required" }),
});

export const deleteAssetSchema = z.object({
  id: z.string().nonempty(),
});
