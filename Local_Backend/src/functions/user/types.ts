import { z } from "zod";

export const User = z.object({
  pk: z.string(),
  salary: z.string(),
  rent: z.string(),
  debt: z.string(),
  savings: z.string()
})

export type User = z.infer<typeof User>;


export const UserRequestBody = User.omit( { pk: true } )
