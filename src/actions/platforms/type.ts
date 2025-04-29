import { z } from "zod";
import { addPlatformSchema, deletePlatformSchema, editPlatformSchema } from "./schema";

export type AddPlatformType = z.infer<typeof addPlatformSchema>;

export type EditPlatformType = z.infer<typeof editPlatformSchema>;

export type DeletePlatformType = z.infer<typeof deletePlatformSchema>;

