import { z } from "zod";
import { scrapeReviewsSchema, validateReviewSchema } from "./schema";


export type ValidateReviewType = z.infer<typeof validateReviewSchema>;

export type ScrapeReviewsType = z.infer<typeof scrapeReviewsSchema>;