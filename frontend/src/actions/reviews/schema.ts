import z from 'zod'

export const validateReviewSchema = z.object({
    reviewId: z.string().nonempty(),
    action: z.enum(["APPROVED", "REJECTED"])
  })

  export const scrapeReviewsSchema = z.object({
    firmId: z.string().nonempty(),
    companyName: z.string().nonempty("Firm URL is required")
  })
  