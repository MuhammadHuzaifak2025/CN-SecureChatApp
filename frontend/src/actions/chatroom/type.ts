import { z } from "zod";
import { AddUsersSchema } from "./schema";

export type AddUsersType = z.infer<typeof AddUsersSchema>;
