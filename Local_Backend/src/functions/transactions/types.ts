import { z } from "zod";

export const User = z.object({
  pk: z.string(),
  userId: z.string(),
  expense: z.string(),
  amount: z.string(),
})

export type User = z.infer<typeof User>;


export const UserRequestBody = User.omit( { pk: true } )
