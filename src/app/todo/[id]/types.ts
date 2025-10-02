import { z } from 'zod'

export const simpleStatusSchema = z.union([z.literal('未着手'), z.literal('完了')])

export const todoStatusSchema = z.union([
  z.literal('未着手'),
  z.literal('着手中'),
  z.literal('完了')
])

export const editFormSchema = z.object({
  title: z.string().default(''),
  status: simpleStatusSchema.default('未着手'),
  priority: z.union([z.literal('low'), z.literal('medium'), z.literal('high'), z.null()]).default(null),
  tags: z.string().default(''),
  markdown_text: z.string().default('')
})

export type SimpleStatus = z.infer<typeof simpleStatusSchema>
export type EditFormState = z.infer<typeof editFormSchema>

export const todoItemSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  list_id: z.string().nullable(),
  title: z.string(),
  status: todoStatusSchema,
  priority: z.union([z.literal('low'), z.literal('medium'), z.literal('high'), z.null()]),
  tags: z.array(z.string()),
  branch_names: z.array(z.string()).default([]),
  pr_links: z.array(z.string()).default([]),
  markdown_text: z.string().nullable(),
  due_date: z.string().nullable(),
  done_date: z.string().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable()
})

export const todoCollectionSchema = z.array(todoItemSchema)
