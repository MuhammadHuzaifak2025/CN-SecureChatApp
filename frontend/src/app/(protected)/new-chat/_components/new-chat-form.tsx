"use client"

import type React from "react"
import { redirect, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useAction } from "@/hooks/useAction"
import { addUser } from "@/actions/chatroom"
import { toast } from "sonner"
import { useFieldArray, useForm } from "react-hook-form"
import { AddUsersType } from "@/actions/chatroom/type"
import { zodResolver } from "@hookform/resolvers/zod"
import { AddUsersSchema } from "@/actions/chatroom/schema"
import { Loader, PlusIcon, X } from "lucide-react"

export function NewChatForm() {
  const { isLoading, execute: addUserAction } = useAction(addUser, {
    onSuccess: () => {
      toast.success("User added successfully");
      redirect("/chat");
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const form = useForm<AddUsersType>({
    resolver: zodResolver(AddUsersSchema),
    defaultValues: {
      is_group: false,
      members: [{user: ""}],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "members",
  })

  // Add a new username field to the group chat form
  const addUsernameField = () => {
    append({ user: "" })
  }

  console.log(form.formState.errors)

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(addUserAction)}>
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center space-x-2">
              <FormField
                name="is_group"
                control={form.control}
                render={({ field }) => {
                  return (
                    <FormItem className="w-full">
                      <div className="flex gap-4 items-center">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <FormLabel>Create a group chat</FormLabel>
                      </div>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  );
                }}
              />
            </div>


            {form.watch("is_group") ? (
              <>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Group Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter group name"
                          value={field.value || ""}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4 flex flex-col ">
                  <Label>Enter usernames for group members</Label>
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center space-x-2">
                      <FormField
                        control={form.control}
                        name={`members.${index}.user`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input placeholder="Enter username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {fields.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}

                  <div>
                    <Button type="button" variant="outline" size="sm" onClick={addUsernameField}>
                      <PlusIcon className="mr-2 h-4 w-4" />
                      Add another user
                    </Button>

                  </div>
                </div>
              </>
            ) : (
              <FormField
                control={form.control}
                name="members.0.user"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter username to chat with" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}


          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "create chat"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
