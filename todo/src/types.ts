export type TodoStatus = '未着手' | '着手中' | '完了'

export type TodoPriority = 'low' | 'medium' | 'high' | null

export interface TodoItem {
  id: string
  user_id: string
  list_id: string
  title: string
  status: TodoStatus
  priority: TodoPriority
  group_id: string | null
  tags: string[]
  branch_names: string[]
  pr_links: string[]
  markdown_text: string | null
  due_date: string | null
  done_date: string | null
  created_at: string | null
  updated_at: string | null
}

export interface TodoGroup {
  id: string
  user_id: string
  list_id: string
  name: string
  color: string | null
  emoji: string | null
  sort_order: number | null
  created_at: string | null
}

export interface TodoList {
  id: string
  user_id: string
  name: string
  description: string | null
  created_at: string | null
  updated_at: string | null
}

export interface TodoXpLog {
  id: string
  user_id: string
  todo_id: string
  xp: number
  created_at: string | null
}

export type RecentXpGain = {
  amount: number
  todoId: string
}
