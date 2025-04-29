import { z } from "zod";
import { addBrokerSchema, deleteBrokerSchema, editBrokerSchema } from "./schema";

export type AddBrokerType = z.infer<typeof addBrokerSchema>;

export type EditBrokerType = z.infer<typeof editBrokerSchema>;

export type DeleteBrokerType = z.infer<typeof deleteBrokerSchema>;

