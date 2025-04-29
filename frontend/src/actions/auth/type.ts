import { z } from "zod";
import { LoginSchema, SignupSchema } from "./schema";

export type LoginType = z.infer<typeof LoginSchema>;
export type SignupType = z.infer<typeof SignupSchema>;