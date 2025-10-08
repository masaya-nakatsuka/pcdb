import { z } from 'zod'

export const simpleStatusSchema = z.union([
  z.literal('未着手'),
  z.literal('着手中'),
  z.literal('完了')
])

export const todoStatusSchema = z.union([
  z.literal('未着手'),
  z.literal('着手中'),
  z.literal('完了')
])

export const editFormSchema = z.object({
  title: z.string().default(''),
  status: simpleStatusSchema.default('未着手'),
  priority: z.union([z.literal('low'), z.literal('medium'), z.literal('high'), z.null()]).default(null),
  group_id: z.union([z.string().uuid(), z.null()]).default(null),
  tags: z.string().default(''),
  markdown_text: z.string().default('')
})

export type SimpleStatus = z.infer<typeof simpleStatusSchema>
export type TodoStatus = z.infer<typeof todoStatusSchema>
export type EditFormState = z.infer<typeof editFormSchema>

const stringArrayOrNull = z.array(z.string()).nullish().transform((value) => value ?? [])
const stringOrNull = z.string().nullable().optional().transform((value) => value ?? null)

export const todoItemSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  list_id: z.string().nullable(),
  title: z.string(),
  status: todoStatusSchema,
  priority: z.union([z.literal('low'), z.literal('medium'), z.literal('high'), z.null()]),
  group_id: z.string().uuid().nullable(),
  tags: stringArrayOrNull,
  branch_names: stringArrayOrNull,
  pr_links: stringArrayOrNull,
  markdown_text: stringOrNull,
  due_date: stringOrNull,
  done_date: stringOrNull,
  created_at: stringOrNull,
  updated_at: stringOrNull
})

export const todoCollectionSchema = z.array(todoItemSchema)

export const todoGroupSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string(),
  list_id: z.string(),
  name: z.string(),
  color: z.string().nullable(),
  emoji: z.string().nullable(),
  sort_order: z.number().nullable(),
  created_at: z.string().nullable()
})

export type TodoGroupDTO = z.infer<typeof todoGroupSchema>

export const todoGroupCollectionSchema = z.array(todoGroupSchema)
