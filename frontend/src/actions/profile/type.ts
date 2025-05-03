import { z } from "zod";
import { UpdateProfileSchema } from "./schema";

export type UpdateProfileType = z.infer<typeof UpdateProfileSchema>;
