import { z } from "zod";
import { addAssetSchema, deleteAssetSchema, editAssetSchema } from "./schema";

export type AddAssetType = z.infer<typeof addAssetSchema>;

export type EditAssetType = z.infer<typeof editAssetSchema>;

export type DeleteAssetType = z.infer<typeof deleteAssetSchema>;

