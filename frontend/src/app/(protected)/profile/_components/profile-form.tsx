"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
// import { updateUserProfile } from "@/lib/api/users"
import type { User } from "@/lib/types"
import { useAction } from "@/hooks/useAction"
import { updateProfile } from "@/actions/profile"
import { toast } from "sonner"
import { redirect } from "next/navigation"
import { UpdateProfileType } from "@/actions/profile/type"
import { UpdateProfileSchema } from "@/actions/profile/schema"


// Define the form schema with Zod
const profileFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }).min(1, { message: "Email is required" }),
  username: z.string().min(3, { message: "Username must be at least 3 characters" }).max(50),
  fullname: z.string().min(2, { message: "Full name must be at least 2 characters" }).max(100).optional(),
})

// Infer the type from the schema
type ProfileFormValues = z.infer<typeof profileFormSchema>

interface ProfileFormProps {
  initialData: User
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const { isLoading, execute: updateProfileAction } = useAction(updateProfile, {
    onSuccess: () => {
      toast.success("Logged in successfully");
      redirect("/chat");
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const form = useForm<UpdateProfileType>({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues: {
      fullname: initialData.fullname,
      username: initialData.username
    },
  });

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(updateProfileAction)}>
          <CardContent className="space-y-6 pt-6">
            
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input value={initialData.email} disabled />
                  </FormControl>
                  <FormDescription>Email cannot be changed</FormDescription>
                  <FormMessage />
                

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fullname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save changes"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}