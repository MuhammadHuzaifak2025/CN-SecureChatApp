import { z } from "zod";

export const UpdateProfileSchema = z.object({
  username: z.string().nonempty({message: "Username cannot be empty"}).max(100, "Username can be atmost 100 characters long"),
  fullname: z.string().nonempty({message: "Fullname cannot be empty"}).max(300, "Fullname can be atmost 100 characters long"),
});
