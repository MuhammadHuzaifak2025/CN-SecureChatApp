import { z } from "zod";
import { createFirmTypeSchema, deleteFirmTypeSchema, editFirmTypeSchema } from "./schema";

export type CreateFirmTypeType = z.infer<typeof createFirmTypeSchema>;

export type EditFirmTypeType = z.infer<typeof editFirmTypeSchema>;

export type DeleteFirmTypeType = z.infer<typeof deleteFirmTypeSchema>;

