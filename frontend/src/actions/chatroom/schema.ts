import z from 'zod'

export const AddUsersSchema = z.object({
    name: z.string().nullable().optional(),
    is_group: z.boolean(),
    members: z.array(z.object({ user: z.string().nonempty({ message: "username cannot be empty" }) }))
})