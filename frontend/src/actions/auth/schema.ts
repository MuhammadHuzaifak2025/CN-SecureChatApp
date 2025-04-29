import { z } from "zod";

export const LoginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email({ message: "Invalid email address" }),
  password: z.string().nonempty({ message: "Password is required" }),
});

export const SignupSchema = z.object({
  username: z.string().nonempty({message: "Username cannot be empty"}).max(100, "Username can be atmost 100 characters long"),
  fullname: z.string().nonempty({message: "Fullname cannot be empty"}).max(300, "Fullname can be atmost 100 characters long"),
  email: z
    .string({ required_error: "Email is required" })
    .email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(9, { message: "Password should contain atleast 9 characters" })
    .max(50, { message: "Password should contain atmost 50 characters" }),
});
