"use client"

import type React from "react"
import { useState } from "react"
import { redirect, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAction } from "@/hooks/useAction"
import { signup } from "@/actions/auth"
import { toast } from 'sonner'
import { useForm } from "react-hook-form"
import { SignupType } from "@/actions/auth/type"
import { SignupSchema } from "@/actions/auth/schema"
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link"
import { Eye, EyeOff, Loader } from "lucide-react"

const SignupForm = () => {
  const [showPassword, setShowPassword] = useState(false)
  const { isLoading, execute: signupAction } = useAction(signup, {
    onSuccess: () => {
      toast.success("Logged in successfully");
      redirect("/login");
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const form = useForm<SignupType>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      email: "",
      password: "",
      fullname: "",
      username: ""
    },
  });

  return (
    <Card>
      <CardHeader className="gap-2">
        <div>
          <CardTitle>Create a new account</CardTitle>
          <CardDescription className="font-medium">
            or <Link href={'/login'}>sign in to your existing account</Link>
          </CardDescription>
        </div>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(signupAction)}>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <FormField
                name="username"
                control={form.control}
                render={({ field }) => {
                  return (
                    <FormItem className="w-full">
                      <div className=" flex flex-col gap-2">
                        <FormLabel className="">Username</FormLabel>
                        <Input {...field} />
                      </div>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  );
                }}
              />
              <FormField
                name="fullname"
                control={form.control}
                render={({ field }) => {
                  return (
                    <FormItem className="w-full">
                      <div className=" flex flex-col gap-2">
                        <FormLabel className="">Fullname</FormLabel>
                        <Input {...field} />
                      </div>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  );
                }}
              />
              <FormField
                name="email"
                control={form.control}
                render={({ field }) => {
                  return (
                    <FormItem className="w-full">
                      <div className=" flex flex-col gap-2">
                        <FormLabel className="">Email</FormLabel>
                        <Input {...field} />
                      </div>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  );
                }}
              />
              <FormField
                name="password"
                control={form.control}
                render={({ field }) => {
                  return (
                    <FormItem className="w-full">
                      <div className=" flex flex-col gap-2">
                        <FormLabel className=" ">Password</FormLabel>
                        <div className="relative">
                          <Input
                            className="w-full pr-10"
                            type={showPassword ? "text" : "password"}
                            {...field}
                          />

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            tabIndex={-1}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 " />
                            ) : (
                              <Eye className="h-4 w-4 " />
                            )}
                            <span className="sr-only">
                              {showPassword ? "Hide password" : "Show password"}
                            </span>
                          </Button>
                        </div>
                      </div>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  );
                }}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button disabled={isLoading} className="w-full">
              {isLoading ? (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Sign up"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}

export default SignupForm
