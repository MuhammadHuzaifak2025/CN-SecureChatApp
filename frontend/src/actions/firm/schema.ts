import { z } from "zod";

export const leverageSchema = z.object({
  assetName: z.string().nonempty({ message: "Asset name is required" }),
  instant: z.string().optional(),
  firstStep: z.string().optional(),
  secondStep: z.string().optional(),
  thirdStep: z.string().optional(),
});

export const commissionSchema = z.object({
  assetName: z.string().nonempty({ message: "Asset name is required" }),
  commission: z.string().nonempty(),
});

const fileSchema = z
  .instanceof(File)
  .refine((file) => file.type.startsWith("image/"), {
    message: "Only image files are allowed",
  });

export const createFirmSchema = z.object({
  name: z.string().nonempty({ message: "Firm name is required" }),
  ceoName: z.string().optional(),
  country: z.string().nonempty({ message: "Country is required" }),
  trustpilotRating: z.string().optional(),
  createAt: z.coerce.date(),
  yearsInOperation: z.coerce.number({
    message: "Years in operation is required",
  }),
  brokerTypeName: z.string({ message: "Broker is required" }),
  firmTypeName: z.string().nonempty({ message: "Firm type is required" }),
  firmRules: z.string().optional(),
  payoutPolicy: z.string().optional(),
  platformNames: z
    .array(z.string())
    .nonempty({ message: "Platform name is required" }),
  paymentMethods: z
    .array(z.string())
    .nonempty({ message: "Payment method is required" }),
  payoutMethods: z
    .array(z.string())
    .nonempty({ message: "Payout method is required" }),
  assetNames: z
    .array(z.string())
    .nonempty({ message: "Asset name is required" }),
  leverageNames: leverageSchema
    .array()
    .nonempty({ message: "Leverage is required" }),
  commissionNames: commissionSchema
    .array()
    .nonempty({ message: "Commission is required" }),
  file: z.union([fileSchema, z.string()]).optional().nullable(),
  filePreview: z.string().url().optional().nullable(),
  maxAllocations: z.coerce.number(),
});

export const editFirmSchema = createFirmSchema.extend({
  id: z.string().nonempty(),
});

export const deleteFirmSchema = z.object({
  id: z.string().nonempty(),
});
