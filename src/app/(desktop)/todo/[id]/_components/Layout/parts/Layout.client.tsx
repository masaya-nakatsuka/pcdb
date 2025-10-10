"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import LoadingOverlay from '@/components/LoadingOverlay'
import { supabaseTodo } from '@/lib/supabaseTodoClient'
import type { TodoGroup, TodoItem } from '@/lib/todoTypes'
import type { LevelProgress } from '@/lib/todoXp'
import { rollXpReward, summarizeLevelProgress } from '@/lib/todoXp'

import {
  editFormSchema,
  type EditFormState,
  type SimpleStatus,
  type TodoStatus
} from '@/features/todo/detail/types'
import LoginPromptCard from '../_shared/LoginPromptCard.client'
import Header from './Header.client'
import SummaryHeader from './SummaryHeader.client'
import TodoList from './TodoList'
import GroupCreateModal from './TodoList/GroupCreateModal.client'
import XpProgressCard from './XpProgressCard'
import XpRewardPopup from './XpRewardPopup'

type LayoutProps = {
  listId: string
}

const STATUS_RANK: Record<TodoStatus, number> = {
  未着手: 0,
  着手中: 0,
  完了: 1,
}

const PRIORITY_RANK: Record<NonNullable<TodoItem['priority']> | 'none', number> = {
  high: 0,
  medium: 1,
  low: 2,
  none: 3,
}

export default function LayoutClient({ listId }: LayoutProps) {
  const [userId, setUserId] = useState<string | null>(null)
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [editingTodo, setEditingTodo] = useState<string | null>(null)
  const [editingMarkdown, setEditingMarkdown] = useState<string | null>(null)
  const [showNewTodo, setShowNewTodo] = useState<boolean>(false)
  const [updatingTodo, setUpdatingTodo] = useState<string | null>(null)
  const [overlayMessage, setOverlayMessage] = useState<string>("")
  const [expandedTodos, setExpandedTodos] = useState<Set<string>>(new Set())
  const [tempMarkdown, setTempMarkdown] = useState<string>("")
  const [deletingTodos, setDeletingTodos] = useState<Set<string>>(new Set())
  const [newlyCreatedTodos, setNewlyCreatedTodos] = useState<Set<string>>(new Set())
  const [groups, setGroups] = useState<TodoGroup[]>([])
  const [sortField, setSortField] = useState<string>('default')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [showCompleted, setShowCompleted] = useState<boolean>(false)
  const [recentlyMovedTodoId, setRecentlyMovedTodoId] = useState<string | null>(null)
  const [disappearingTodos, setDisappearingTodos] = useState<Set<string>>(new Set())
  const [reappearingTodos, setReappearingTodos] = useState<Set<string>>(new Set())
  const [showGroupCreateModal, setShowGroupCreateModal] = useState<boolean>(false)
  const [pendingGroupSelectionCallback, setPendingGroupSelectionCallback] = useState<((groupId: string) => void) | null>(null)
  const [xpLogsByTodo, setXpLogsByTodo] = useState<Record<string, number>>({})
  const [xpTotal, setXpTotal] = useState<number>(0)
  const [xpProgress, setXpProgress] = useState<LevelProgress>(() => summarizeLevelProgress(0))
  const [recentXpGain, setRecentXpGain] = useState<{ amount: number; todoId: string } | null>(null)

  const [editForm, setEditForm] = useState<EditFormState>(editFormSchema.parse({}))
  const previousStatusRef = useRef<Map<string, TodoStatus>>(new Map())
  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const disappearingTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map())
  const reappearingTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map())
  const disappearingMetaRef = useRef<
    Map<
      string,
      {
        status: TodoStatus
        group_id: string | null
        priority: TodoItem['priority']
        tags: string[]
      }
    >
  >(new Map())

  const redirectTo = useMemo(() => {
    if (typeof window === 'undefined') return undefined
    const baseUrl = window.location.origin
    return `${baseUrl}/todo`
  }, [])

  const groupsById = useMemo(() => {
    const map: Record<string, TodoGroup> = {}
    for (const group of groups) {
      map[group.id] = group
    }
    return map
  }, [groups])

  const loadTodos = useCallback(async (uid: string, lId: string) => {
    const { data, error } = await supabaseTodo
      .from('todo_items')
      .select('*')
      .eq('user_id', uid)
      .eq('list_id', lId)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setTodos(data as TodoItem[])
    }
  }, [])

  const loadGroups = useCallback(async (uid: string, lId: string) => {
    const { data, error } = await supabaseTodo
      .from('todo_groups')
      .select('*')
      .eq('user_id', uid)
      .eq('list_id', lId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (!error && data) {
      setGroups(data as TodoGroup[])
    }
  }, [])

  const loadXpLogs = useCallback(async (uid: string) => {
    const { data, error } = await supabaseTodo
      .from('todo_xp_logs')
      .select('todo_id, xp')
      .eq('user_id', uid)

    if (!error && data) {
      const mapped: Record<string, number> = {}
      let total = 0
      for (const row of data) {
        if (row.todo_id) {
          mapped[row.todo_id] = row.xp ?? 0
        }
        total += row.xp ?? 0
      }
      setXpLogsByTodo(mapped)
      setXpTotal(total)
      setXpProgress(summarizeLevelProgress(total))
    }
  }, [])

  const awardXpForTodoCompletion = useCallback(async (todo: TodoItem) => {
    if (!userId) return
    if (xpLogsByTodo[todo.id]) return

    const reward = rollXpReward()
    const { data, error } = await supabaseTodo
      .from('todo_xp_logs')
      .insert({
        user_id: userId,
        todo_id: todo.id,
        xp: reward,
      })
      .select('todo_id, xp')
      .single()

    if (!error && data) {
      setXpLogsByTodo((prev) => ({ ...prev, [data.todo_id]: data.xp ?? reward }))
      setXpTotal((prev) => {
        const nextTotal = prev + (data.xp ?? reward)
        setXpProgress(summarizeLevelProgress(nextTotal))
        return nextTotal
      })
      setRecentXpGain({ amount: data.xp ?? reward, todoId: todo.id })
      return
    }

    if (error?.code === '23505') {
      // Unique constraint violation -> XP already awarded for this TODO
      return
    }

    console.error('Failed to award XP', error)
  }, [userId, xpLogsByTodo])

  const createGroup = useCallback(
    async (name: string, color?: string) => {
      if (!userId) return null
      const trimmed = name.trim()
      if (!trimmed) return null

      const payload = {
        user_id: userId,
        list_id: listId,
        name: trimmed,
        color: color || null,
        sort_order: groups.length,
      }

      const { data, error } = await supabaseTodo
        .from('todo_groups')
        .insert(payload)
        .select('*')
        .single()

      if (error || !data) {
        return null
      }

      setGroups((prev) => {
        const next = [...prev, data as TodoGroup]
        next.sort((a, b) => {
          if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order
          return (a.created_at ?? '').localeCompare(b.created_at ?? '')
        })
        return next
      })
      return data as TodoGroup
    },
    [userId, listId, groups]
  )

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      const { data } = await supabaseTodo.auth.getUser()
      const uid = data.user?.id ?? null
      if (!isMounted) return

      setUserId(uid)
      if (uid) {
        await Promise.all([loadTodos(uid, listId), loadGroups(uid, listId), loadXpLogs(uid)])
      }
      setLoading(false)
    })()

    return () => {
      isMounted = false
    }
  }, [listId, loadGroups, loadTodos, loadXpLogs])

  const handleSignIn = useCallback(async () => {
    await supabaseTodo.auth.signInWithOAuth({
      provider: 'google',
      options: redirectTo ? { redirectTo } : undefined
    })
  }, [redirectTo])

  const handleSignOut = useCallback(async () => {
    await supabaseTodo.auth.signOut()
    setUserId(null)
    setTodos([])
    setGroups([])
    setXpLogsByTodo({})
    setXpTotal(0)
    setXpProgress(summarizeLevelProgress(0))
    setRecentXpGain(null)
  }, [])

  const resetEditForm = useCallback(() => {
    setEditForm(editFormSchema.parse({}))
  }, [])

  const updateEditForm = useCallback((values: Partial<EditFormState>) => {
    setEditForm((prev) => ({ ...prev, ...values }))
  }, [])

  const startEditing = useCallback((todo: TodoItem) => {
    setEditingTodo(todo.id)
    setEditForm({
      title: todo.title,
      status: todo.status,
      priority: todo.priority,
      group_id: todo.group_id,
      tags: todo.tags.join(', '),
      markdown_text: todo.markdown_text || ''
    })
  }, [])

  const startCreating = useCallback(() => {
    setShowNewTodo(true)
    resetEditForm()
  }, [resetEditForm])

  const cancelEditing = useCallback(() => {
    setEditingTodo(null)
    setShowNewTodo(false)
    resetEditForm()
  }, [resetEditForm])

  const startEditingMarkdown = useCallback((todoId: string, currentMarkdown: string) => {
    setEditingMarkdown(todoId)
    setTempMarkdown(currentMarkdown || '')
  }, [])

  const handleTempMarkdownChange = useCallback((value: string) => {
    setTempMarkdown(value)
  }, [])

  const saveMarkdown = useCallback(async () => {
    if (!editingMarkdown || !userId) return

    setUpdatingTodo(editingMarkdown)
    setOverlayMessage('マークダウン更新中...')

    const { error } = await supabaseTodo
      .from('todo_items')
      .update({
        markdown_text: tempMarkdown.trim() || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', editingMarkdown)
      .eq('user_id', userId)
      .eq('list_id', listId)

    if (!error) {
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === editingMarkdown ? { ...todo, markdown_text: tempMarkdown.trim() || null } : todo
        )
      )
    }

    setEditingMarkdown(null)
    setTempMarkdown('')
    setUpdatingTodo(null)
    setOverlayMessage('')
  }, [editingMarkdown, tempMarkdown, userId, listId])

  const saveTodo = useCallback(async (isNew: boolean) => {
    if (!userId || !editForm.title.trim()) return

    const currentTodo = isNew ? null : todos.find((t) => t.id === editingTodo)

    // 変更がない場合は保存せずに終了（新規作成は除く）
    if (!isNew && currentTodo) {
      const currentTags = currentTodo.tags.join(',')
      const newTags = editForm.tags
        ? editForm.tags.split(',').map((tag) => tag.trim()).filter(Boolean).join(',')
        : ''

      const hasChanges =
        currentTodo.title !== editForm.title.trim() ||
        currentTodo.status !== editForm.status ||
        currentTodo.priority !== editForm.priority ||
        currentTodo.group_id !== (editForm.group_id ?? null) ||
        currentTags !== newTags ||
        (currentTodo.markdown_text ?? '') !== (editForm.markdown_text.trim() || '')

      if (!hasChanges) {
        setEditingTodo(null)
        resetEditForm()
        return
      }
    }

    setUpdatingTodo(isNew ? 'new' : editingTodo || '')
    setOverlayMessage(isNew ? 'TODO作成中...' : 'TODO更新中...')

    const isCompletingNow = editForm.status === '完了' && currentTodo?.status !== '完了'
    const isReopening = editForm.status !== '完了' && currentTodo?.status === '完了'

    const todoData = {
      title: editForm.title.trim(),
      status: editForm.status,
      priority: editForm.priority,
      group_id: editForm.group_id ?? null,
      tags: editForm.tags
        ? editForm.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
        : [],
      markdown_text: editForm.markdown_text.trim() || null,
      done_date: isCompletingNow
        ? new Date().toISOString()
        : isReopening
          ? null
          : currentTodo?.done_date || null,
      user_id: userId,
      list_id: listId,
      updated_at: new Date().toISOString()
    }

    if (isNew) {
      const { data, error } = await supabaseTodo
        .from('todo_items')
        .insert(todoData)
        .select('*')
        .single()

      if (!error && data) {
        const newTodo = data as TodoItem
        setTodos((prev) => [newTodo, ...prev])
        previousStatusRef.current.set(newTodo.id, newTodo.status)
        setNewlyCreatedTodos((prev) => new Set(prev).add(newTodo.id))
        setTimeout(() => {
          setNewlyCreatedTodos((prev) => {
            const next = new Set(prev)
            next.delete(newTodo.id)
            return next
          })
        }, 500)
        setShowNewTodo(false)
        resetEditForm()
      }
    } else if (editingTodo) {
      const { error } = await supabaseTodo
        .from('todo_items')
        .update(todoData)
        .eq('id', editingTodo)
        .eq('user_id', userId)
        .eq('list_id', listId)

      if (!error) {
        setTodos((prev) =>
          prev.map((todo) => (todo.id === editingTodo ? ({ ...todo, ...todoData } as TodoItem) : todo))
        )
        previousStatusRef.current.set(editingTodo, todoData.status as TodoStatus)

        if (highlightTimeoutRef.current) {
          clearTimeout(highlightTimeoutRef.current)
        }
        setRecentlyMovedTodoId(editingTodo)
        highlightTimeoutRef.current = setTimeout(() => {
          setRecentlyMovedTodoId(null)
          highlightTimeoutRef.current = null
        }, 1400)

        setEditingTodo(null)
        resetEditForm()
      }
    }

    setUpdatingTodo(null)
    setOverlayMessage('')
  }, [userId, editForm, editingTodo, listId, todos, resetEditForm])

  const handleOverlayClick = useCallback(() => {
    if (editingTodo || showNewTodo) {
      if (editForm.title.trim()) {
        saveTodo(showNewTodo)
      } else {
        cancelEditing()
      }
    }
  }, [editingTodo, showNewTodo, editForm.title, saveTodo, cancelEditing])

  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current)
      }
      disappearingTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout))
      disappearingTimeoutsRef.current.clear()
      reappearingTimeoutRef.current.forEach((timeout) => clearTimeout(timeout))
      reappearingTimeoutRef.current.clear()
      disappearingMetaRef.current.clear()
    }
  }, [])

  const toggleTodoCompletion = useCallback(async (todo: TodoItem) => {
    if (updatingTodo || !userId) return

    const wasCompleted = todo.status === '完了'
    const fallbackStatus = wasCompleted
      ? previousStatusRef.current.get(todo.id) ?? '未着手'
      : todo.status
    const nextStatus: TodoStatus = wasCompleted ? fallbackStatus : '完了'
    const nextDoneDate = nextStatus === '完了' ? new Date().toISOString() : null

    if (!wasCompleted) {
      previousStatusRef.current.set(todo.id, todo.status)
    }

    setUpdatingTodo(todo.id)
    setOverlayMessage(
      nextStatus === '完了'
        ? '完了に更新中...'
        : nextStatus === '着手中'
          ? '着手中に戻しています...'
          : '未着手に戻しています...'
    )

    const { error } = await supabaseTodo
      .from('todo_items')
      .update({
        status: nextStatus,
        done_date: nextDoneDate,
        updated_at: new Date().toISOString()
      })
      .eq('id', todo.id)
      .eq('user_id', userId)
      .eq('list_id', listId)

    if (!error) {
      setTodos((prev) =>
        prev.map((item) =>
          item.id === todo.id ? { ...item, status: nextStatus, done_date: nextDoneDate } : item
        )
      )

      if (nextStatus === '完了') {
        await awardXpForTodoCompletion(todo)
      }

      if (nextStatus !== '完了') {
        previousStatusRef.current.set(todo.id, nextStatus)
        if (disappearingTimeoutsRef.current.has(todo.id)) {
          clearTimeout(disappearingTimeoutsRef.current.get(todo.id)!)
          disappearingTimeoutsRef.current.delete(todo.id)
        }
        setDisappearingTodos((prev) => {
          if (!prev.has(todo.id)) return prev
          const next = new Set(prev)
          next.delete(todo.id)
          return next
        })
        disappearingMetaRef.current.delete(todo.id)
        if (todo.status === '完了') {
          setReappearingTodos((prev) => {
            const next = new Set(prev)
            next.add(todo.id)
            return next
          })

          const timeout = setTimeout(() => {
            setReappearingTodos((prev) => {
              if (!prev.has(todo.id)) return prev
              const next = new Set(prev)
              next.delete(todo.id)
              return next
            })
            reappearingTimeoutRef.current.delete(todo.id)
          }, 1500)

          if (reappearingTimeoutRef.current.has(todo.id)) {
            clearTimeout(reappearingTimeoutRef.current.get(todo.id)!)
          }
          reappearingTimeoutRef.current.set(todo.id, timeout)
        }
      } else if (!showCompleted) {
        setDisappearingTodos((prev) => {
          const next = new Set(prev)
          next.add(todo.id)
          return next
        })

        disappearingMetaRef.current.set(todo.id, {
          status: todo.status,
          group_id: todo.group_id ?? null,
          priority: todo.priority,
          tags: [...todo.tags],
        })

        const timeout = setTimeout(() => {
          setDisappearingTodos((prev) => {
            if (!prev.has(todo.id)) return prev
            const next = new Set(prev)
            next.delete(todo.id)
            return next
          })
          disappearingTimeoutsRef.current.delete(todo.id)
          disappearingMetaRef.current.delete(todo.id)
        }, 500)

        if (disappearingTimeoutsRef.current.has(todo.id)) {
          clearTimeout(disappearingTimeoutsRef.current.get(todo.id)!)
        }
        disappearingTimeoutsRef.current.set(todo.id, timeout)
      }
    }

    setUpdatingTodo(null)
    setOverlayMessage('')
  }, [updatingTodo, userId, listId, showCompleted, awardXpForTodoCompletion])

  const toggleTodoInProgress = useCallback(async (todo: TodoItem) => {
    if (updatingTodo || !userId) return

    const nextStatus: TodoStatus = todo.status === '着手中' ? '未着手' : '着手中'

    setUpdatingTodo(todo.id)
    setOverlayMessage(nextStatus === '着手中' ? '着手中に更新中...' : '未着手に戻しています...')

    const { error } = await supabaseTodo
      .from('todo_items')
      .update({
        status: nextStatus,
        done_date: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', todo.id)
      .eq('user_id', userId)
      .eq('list_id', listId)

    if (!error) {
      setTodos((prev) =>
        prev.map((item) =>
          item.id === todo.id ? { ...item, status: nextStatus, done_date: null } : item
        )
      )
      previousStatusRef.current.set(todo.id, nextStatus)
    }

    setUpdatingTodo(null)
    setOverlayMessage('')
  }, [updatingTodo, userId, listId])

  const deleteTodo = useCallback(async (todoId: string) => {
    if (updatingTodo || !userId) return

    const targetTodo = todos.find((todo) => todo.id === todoId)
    const targetGroupId = targetTodo?.group_id ?? null

    setDeletingTodos((prev) => new Set(prev).add(todoId))
    setUpdatingTodo(todoId)
    setOverlayMessage('削除中...')

    setTimeout(async () => {
      const { error } = await supabaseTodo
        .from('todo_items')
        .delete()
        .eq('id', todoId)
        .eq('user_id', userId)
        .eq('list_id', listId)

      if (!error) {
        setTodos((prev) => prev.filter((todo) => todo.id !== todoId))

        if (targetGroupId) {
          // Clean up the group when no other TODOs reference it anymore
          const { data: remainingGroupTodos, error: remainingGroupError } = await supabaseTodo
            .from('todo_items')
            .select('id')
            .eq('group_id', targetGroupId)
            .eq('user_id', userId)
            .eq('list_id', listId)
            .limit(1)

          if (!remainingGroupError && (!remainingGroupTodos || remainingGroupTodos.length === 0)) {
            const { error: groupDeleteError } = await supabaseTodo
              .from('todo_groups')
              .delete()
              .eq('id', targetGroupId)
              .eq('user_id', userId)
              .eq('list_id', listId)

            if (!groupDeleteError) {
              setGroups((prev) => prev.filter((group) => group.id !== targetGroupId))
            }
          }
        }
      }

      setDeletingTodos((prev) => {
        const next = new Set(prev)
        next.delete(todoId)
        return next
      })
      setUpdatingTodo(null)
      setOverlayMessage('')
    }, 300)
  }, [updatingTodo, userId, listId, todos])

  const toggleExpanded = useCallback((todoId: string) => {
    setExpandedTodos((prev) => {
      const next = new Set(prev)
      if (next.has(todoId)) {
        next.delete(todoId)
      } else {
        next.add(todoId)
      }
      return next
    })
  }, [])

  const handleGroupCreateModalOpen = useCallback((callback: (groupId: string) => void) => {
    setPendingGroupSelectionCallback(() => callback)
    setShowGroupCreateModal(true)
  }, [])

  const handleGroupCreate = useCallback(async (name: string, color: string) => {
    const created = await createGroup(name, color)
    if (created && pendingGroupSelectionCallback) {
      pendingGroupSelectionCallback(created.id)
    }
    setShowGroupCreateModal(false)
    setPendingGroupSelectionCallback(null)
  }, [createGroup, pendingGroupSelectionCallback])

  const handleGroupCreateModalClose = useCallback(() => {
    setShowGroupCreateModal(false)
    setPendingGroupSelectionCallback(null)
  }, [])

  const deleteGroup = useCallback(async (groupId: string) => {
    if (!userId) return

    setUpdatingTodo('deleting-group')
    setOverlayMessage('グループ削除中...')

    // まず、そのグループを使用しているTODOのgroup_idをnullに更新
    await supabaseTodo
      .from('todo_items')
      .update({ group_id: null })
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .eq('list_id', listId)

    // その後、グループを削除
    const { error } = await supabaseTodo
      .from('todo_groups')
      .delete()
      .eq('id', groupId)
      .eq('user_id', userId)
      .eq('list_id', listId)

    if (!error) {
      setGroups((prev) => prev.filter((g) => g.id !== groupId))
      setTodos((prev) =>
        prev.map((todo) =>
          todo.group_id === groupId ? { ...todo, group_id: null } : todo
        )
      )
    }

    setUpdatingTodo(null)
    setOverlayMessage('')
  }, [userId, listId])

  const reorderGroups = useCallback(async (reorderedGroups: TodoGroup[]) => {
    if (!userId) return

    setUpdatingTodo('reordering-groups')
    setOverlayMessage('グループ並び替え中...')

    const updates = reorderedGroups.map((group, index) => ({
      id: group.id,
      sort_order: index,
    }))

    for (const update of updates) {
      await supabaseTodo
        .from('todo_groups')
        .update({ sort_order: update.sort_order })
        .eq('id', update.id)
        .eq('user_id', userId)
        .eq('list_id', listId)
    }

    setGroups(reorderedGroups.map((g, i) => ({ ...g, sort_order: i })))

    setUpdatingTodo(null)
    setOverlayMessage('')
  }, [userId, listId])

  const defaultSorter = useCallback(
    (a: TodoItem, b: TodoItem) => {
      const snapshotA = disappearingMetaRef.current.get(a.id)
      const snapshotB = disappearingMetaRef.current.get(b.id)

      const aStatus = snapshotA?.status ?? a.status
      const bStatus = snapshotB?.status ?? b.status
      const statusDiff = STATUS_RANK[aStatus] - STATUS_RANK[bStatus]
      if (statusDiff !== 0) return statusDiff

      const groupIdA = snapshotA?.group_id ?? a.group_id
      const groupIdB = snapshotB?.group_id ?? b.group_id

      // グループが異なる場合は sort_order で比較
      if (groupIdA !== groupIdB) {
        // グループなしは最後に配置
        if (!groupIdA) return 1
        if (!groupIdB) return -1

        const sortOrderA = groupsById[groupIdA]?.sort_order ?? 999999
        const sortOrderB = groupsById[groupIdB]?.sort_order ?? 999999
        return sortOrderA - sortOrderB
      }

      const aPriority = snapshotA?.priority ?? a.priority ?? 'none'
      const bPriority = snapshotB?.priority ?? b.priority ?? 'none'
      const priorityDiff = PRIORITY_RANK[aPriority] - PRIORITY_RANK[bPriority]
      if (priorityDiff !== 0) return priorityDiff

      const aTags = (snapshotA?.tags ?? a.tags).join(',').toLowerCase()
      const bTags = (snapshotB?.tags ?? b.tags).join(',').toLowerCase()
      if (aTags !== bTags) {
        if (!aTags) return 1
        if (!bTags) return -1
        return aTags.localeCompare(bTags, 'ja')
      }

      const aCreated = a.created_at ? new Date(a.created_at).getTime() : 0
      const bCreated = b.created_at ? new Date(b.created_at).getTime() : 0
      if (aCreated !== bCreated) {
        return aCreated - bCreated
      }

      return a.title.localeCompare(b.title, 'ja')
    },
    [groupsById]
  )

  const sortedTodos = useMemo(() => {
    const cloned = [...todos]

    cloned.sort((a, b) => {
      if (sortField === 'default') {
        return defaultSorter(a, b)
      }

      let aValue: number | string = 0
      let bValue: number | string = 0

      switch (sortField) {
        case 'group':
          aValue = a.group_id ? (groupsById[a.group_id]?.name?.toLowerCase() ?? '') : ''
          bValue = b.group_id ? (groupsById[b.group_id]?.name?.toLowerCase() ?? '') : ''
          if (!aValue) aValue = '\uffff'
          if (!bValue) bValue = '\uffff'
          break
        case 'priority':
          aValue = PRIORITY_RANK[a.priority ?? 'none']
          bValue = PRIORITY_RANK[b.priority ?? 'none']
          break
        case 'status':
          aValue = STATUS_RANK[a.status]
          bValue = STATUS_RANK[b.status]
          break
        case 'title':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case 'done_date':
          aValue = a.done_date ? new Date(a.done_date).getTime() : 0
          bValue = b.done_date ? new Date(b.done_date).getTime() : 0
          break
        case 'created_at':
          aValue = a.created_at ? new Date(a.created_at).getTime() : 0
          bValue = b.created_at ? new Date(b.created_at).getTime() : 0
          break
        default:
          return defaultSorter(a, b)
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return defaultSorter(a, b)
    })

    if (showCompleted) return cloned
    return cloned.filter((todo) => todo.status !== '完了' || disappearingTodos.has(todo.id))
  }, [todos, sortField, sortDirection, showCompleted, defaultSorter, disappearingTodos, groupsById])

  const statusSummary = useMemo(() => ({
    未着手: todos.filter((todo) => todo.status === '未着手').length,
    着手中: todos.filter((todo) => todo.status === '着手中').length,
    完了: todos.filter((todo) => todo.status === '完了').length
  }), [todos])

  const xpProgressPercent = useMemo(
    () => Math.min(100, Math.max(0, Math.round(xpProgress.progressToNext * 100))),
    [xpProgress]
  )

  const xpNeededForNextLevel = useMemo(
    () => Math.max(0, xpProgress.xpForNextLevel - xpProgress.xpIntoLevel),
    [xpProgress]
  )

  useEffect(() => {
    if (!recentXpGain) return
    const timer = setTimeout(() => setRecentXpGain(null), 4000)
    return () => clearTimeout(timer)
  }, [recentXpGain])

  const columnWidths = ['8%', '8%', '14%', '32%', '10%', '14%', '7%', '7%']

  if (loading) {
    return <LoadingOverlay message="読み込み中..." />
  }

  if (!userId) {
    return <LoginPromptCard onSignIn={handleSignIn} />
  }

  return (
    <div className="min-h-screen overflow-x-auto bg-page-gradient px-4 pb-16 pt-12 sm:px-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 text-frost-soft">
        <Header onSignOut={handleSignOut} />
        <div className="relative flex flex-col rounded-3xl border border-night-border bg-night-glass p-4 text-frost-soft shadow-glass-xl sm:p-6">
          <SummaryHeader
            statusSummary={statusSummary}
            showCompleted={showCompleted}
            onToggleShowCompleted={() => setShowCompleted((prev) => !prev)}
          />

          <XpProgressCard
            level={xpProgress.level}
            xpTotal={xpTotal}
            xpNeededForNextLevel={xpNeededForNextLevel}
            xpProgressPercent={xpProgressPercent}
            recentXpGain={recentXpGain}
          />

          <TodoList
            todos={sortedTodos}
            columnWidths={columnWidths}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={(field) => {
              if (sortField === field) {
                setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
              } else {
                setSortField(field)
                setSortDirection('asc')
              }
            }}
            editingTodoId={editingTodo}
            onStartEditing={startEditing}
            onCancelEditing={cancelEditing}
            showNewTodo={showNewTodo}
            onStartCreating={startCreating}
            editForm={editForm}
            onEditFormChange={updateEditForm}
            editingMarkdownId={editingMarkdown}
            onStartEditingMarkdown={startEditingMarkdown}
            tempMarkdown={tempMarkdown}
            onTempMarkdownChange={handleTempMarkdownChange}
            onToggleTodoInProgress={toggleTodoInProgress}
            onToggleTodoCompletion={toggleTodoCompletion}
            updatingTodoId={updatingTodo}
            expandedTodos={expandedTodos}
            onToggleExpanded={toggleExpanded}
            onDeleteTodo={deleteTodo}
            deletingTodos={deletingTodos}
            newlyCreatedTodos={newlyCreatedTodos}
            recentlyMovedTodoId={recentlyMovedTodoId}
            reappearingTodos={reappearingTodos}
            disappearingTodos={disappearingTodos}
            groups={groups}
            groupsById={groupsById}
            onCreateGroup={createGroup}
            onSaveTodo={saveTodo}
            onOpenGroupCreateModal={handleGroupCreateModalOpen}
            onDeleteGroup={deleteGroup}
            onReorderGroups={reorderGroups}
          />
        </div>
      </div>
      <XpRewardPopup recentXpGain={recentXpGain} />
      {overlayMessage && <LoadingOverlay message={overlayMessage} />}

      {/* 編集中のオーバーレイ */}
      {(editingTodo || showNewTodo) && (
        <div
          className="fixed inset-0 z-[5] bg-black/10 pointer-events-auto"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      {/* マークダウン編集中のオーバーレイ */}
      {editingMarkdown && (
        <div
          className="fixed inset-0 z-[40] bg-black/50 backdrop-blur-[1px]"
          onClick={saveMarkdown}
          aria-hidden="true"
        />
      )}

      <GroupCreateModal
        isOpen={showGroupCreateModal}
        onClose={handleGroupCreateModalClose}
        onCreate={handleGroupCreate}
      />
    </div>
  )
}
