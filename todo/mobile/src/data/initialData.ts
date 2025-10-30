import { createId } from '../utils/id'
import type { TodoGroup, TodoItem, TodoList, TodoXpLog } from '../types'

const userId = 'demo-user'

const listBacklogId = createId('list')
const listPersonalId = createId('list')

export const initialLists: TodoList[] = [
  {
    id: listBacklogId,
    user_id: userId,
    name: 'プロダクト開発',
    description: '進行中のプロジェクトとタスクを管理',
    created_at: new Date().toISOString(),
    updated_at: null
  },
  {
    id: listPersonalId,
    user_id: userId,
    name: '個人タスク',
    description: '生活や学習に関するメモ',
    created_at: new Date().toISOString(),
    updated_at: null
  }
]

const groupUiId = createId('group')
const groupInfraId = createId('group')
const groupLearningId = createId('group')

export const initialGroups: TodoGroup[] = [
  {
    id: groupUiId,
    user_id: userId,
    list_id: listBacklogId,
    name: 'UI/UX',
    color: '#38bdf8',
    emoji: '🎨',
    sort_order: 1,
    created_at: new Date().toISOString()
  },
  {
    id: groupInfraId,
    user_id: userId,
    list_id: listBacklogId,
    name: 'インフラ',
    color: '#22c55e',
    emoji: '🛠',
    sort_order: 2,
    created_at: new Date().toISOString()
  },
  {
    id: groupLearningId,
    user_id: userId,
    list_id: listPersonalId,
    name: '学習',
    color: '#a855f7',
    emoji: '📚',
    sort_order: 1,
    created_at: new Date().toISOString()
  }
]

function createTodo(partial: Partial<TodoItem>): TodoItem {
  return {
    id: createId('todo'),
    user_id: userId,
    list_id: listBacklogId,
    title: '',
    status: '未着手',
    priority: null,
    group_id: null,
    tags: [],
    branch_names: [],
    pr_links: [],
    markdown_text: null,
    due_date: null,
    done_date: null,
    created_at: new Date().toISOString(),
    updated_at: null,
    ...partial
  }
}

export const initialTodos: TodoItem[] = [
  createTodo({
    list_id: listBacklogId,
    title: 'モバイル用レイアウトの再調整',
    status: '着手中',
    priority: 'high',
    group_id: groupUiId,
    tags: ['mobile', 'design']
  }),
  createTodo({
    list_id: listBacklogId,
    title: 'Todo API のスロットリング対策',
    status: '未着手',
    priority: 'medium',
    group_id: groupInfraId,
    tags: ['backend', 'supabase']
  }),
  createTodo({
    list_id: listBacklogId,
    title: 'QA からのフィードバック対応',
    status: '未着手',
    priority: null,
    group_id: null,
    tags: ['bugfix']
  }),
  createTodo({
    list_id: listPersonalId,
    title: 'Expo Router の調査',
    status: '着手中',
    priority: 'medium',
    group_id: groupLearningId,
    tags: ['study']
  }),
  createTodo({
    list_id: listPersonalId,
    title: '週末の料理計画を作成',
    status: '完了',
    priority: 'low',
    group_id: null,
    tags: ['life'],
    done_date: new Date().toISOString()
  })
]

export const initialXpLogs: TodoXpLog[] = [
  {
    id: createId('xp'),
    user_id: userId,
    todo_id: initialTodos[initialTodos.length - 1].id,
    xp: 30,
    created_at: new Date().toISOString()
  }
]

export const initialUserId = userId
