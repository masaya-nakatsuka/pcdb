export interface TodoItem {
  id: string
  user_id: string
  list_id: string | null
  title: string
  status: '未着手' | '着手中' | '完了'
  priority: 'low' | 'medium' | 'high' | null
  group: string | null
  tags: string[]
  branch_names: string[]
  pr_links: string[]
  markdown_text: string | null
  due_date: string | null
  done_date: string | null
  created_at: string | null
  updated_at: string | null
}

export interface TodoList {
  id: string
  user_id: string
  name: string
  description: string | null
  created_at: string | null
  updated_at: string | null
}

export interface TodoItemWithList extends TodoItem {
  list_name?: string
}
