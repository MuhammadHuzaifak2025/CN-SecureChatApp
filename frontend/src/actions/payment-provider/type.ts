import { z } from "zod";
import { createPaymentProviderSchema, deletePaymentProviderSchema, editPaymentProviderSchema } from "./schema";

export type CreatePaymentProviderType = z.infer<typeof createPaymentProviderSchema>;

export type EditPaymentProviderType = z.infer<typeof editPaymentProviderSchema>;

export type DeletePaymentProviderType = z.infer<typeof deletePaymentProviderSchema>;

