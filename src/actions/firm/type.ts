import { z } from "zod";
import { createFirmSchema, deleteFirmSchema, editFirmSchema} from "./schema";

export type CreateFirmType = z.infer<typeof createFirmSchema>;

export type EditFirmType = z.infer<typeof editFirmSchema>;

export type DeleteFirmType = z.infer<typeof deleteFirmSchema>;

