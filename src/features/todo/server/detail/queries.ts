import { supabaseTodo } from '@/lib/supabaseTodoClient'
import type { TodoItem } from '@/lib/todoTypes'

import { todoCollectionSchema } from '../../detail/types'

export async function fetchTodoItems(userId: string, listId: string) {
  const { data, error } = await supabaseTodo
    .from('todo_items')
    .select('*')
    .eq('user_id', userId)
    .eq('list_id', listId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return todoCollectionSchema.parse(data) as TodoItem[]
}
