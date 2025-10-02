import { z } from 'zod'

export const listSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  name: z.string(),
  sort_order: z.number().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable().optional()
})

export type TodoListDTO = z.infer<typeof listSchema>

export const statusCountsSchema = z.object({
  total: z.number(),
  未着手: z.number(),
  着手中: z.number(),
  完了: z.number()
})

export type StatusCounts = z.infer<typeof statusCountsSchema>
