import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import Markdown from '@ronradtke/react-native-markdown-display'
import { LinearGradient } from 'expo-linear-gradient'

import { supabase } from '../lib/supabase'
import { useTodoStore } from '../state/TodoStore'
import type { TodoGroup, TodoItem, TodoPriority, TodoStatus } from '../types'
import type { RecentXpGain } from '../types'
import { rollXpReward, summarizeLevelProgress } from '../utils/xp'

type DetailScreenProps = {
  listId: string
}

type StatusSummary = {
  total: number
  未着手: number
  着手中: number
  完了: number
  completionRate: number
}

type TodoGroupMap = Record<string, TodoGroup>

const STATUS_BADGE_STYLE: Record<TodoStatus, { border: string; bg: string; fg: string }> = {
  未着手: {
    border: 'rgba(148, 163, 184, 0.6)',
    bg: 'rgba(15, 23, 42, 0.6)',
    fg: '#cbd5f5'
  },
  着手中: {
    border: 'rgba(56, 189, 248, 0.65)',
    bg: 'rgba(56, 189, 248, 0.15)',
    fg: '#bae6fd'
  },
  完了: {
    border: 'rgba(74, 222, 128, 0.65)',
    bg: 'rgba(34, 197, 94, 0.2)',
    fg: '#bbf7d0'
  }
}

const PRIORITY_LABEL: Record<Exclude<TodoPriority, null>, string> = {
  high: '高',
  medium: '中',
  low: '低'
}

const PRIORITY_COLORS: Record<Exclude<TodoPriority, null>, string> = {
  high: '#fca5a5',
  medium: '#fbbf24',
  low: '#6ee7b7'
}

type PriorityOption = TodoPriority | 'none'

export default function DetailScreen({ listId }: DetailScreenProps) {
  const { user, selectList } = useTodoStore()

  const [loading, setLoading] = useState(true)
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [groups, setGroups] = useState<TodoGroupMap>({})
  const [xpTotal, setXpTotal] = useState(0)
  const [xpLogsByTodo, setXpLogsByTodo] = useState<Record<string, number>>({})
  const [recentXpGain, setRecentXpGain] = useState<RecentXpGain | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showCompleted, setShowCompleted] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTodoTitle, setNewTodoTitle] = useState('')
  const [newTodoGroupId, setNewTodoGroupId] = useState<string | 'none'>('none')
  const [creatingNewTodo, setCreatingNewTodo] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const createFormRef = useRef<View | null>(null)
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false)
  const [isManageGroupsOpen, setIsManageGroupsOpen] = useState(false)
  const [recentlyCreatedGroupId, setRecentlyCreatedGroupId] = useState<string | null>(null)
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editGroupId, setEditGroupId] = useState<string | 'none'>('none')
  const [editTags, setEditTags] = useState('')
  const [editPriority, setEditPriority] = useState<PriorityOption>('none')
  const [editError, setEditError] = useState<string | null>(null)
  const [savingEdit, setSavingEdit] = useState(false)
  const [groupDraft, setGroupDraft] = useState({ name: '', color: '', emoji: '' })

  const xpProgress = useMemo(() => summarizeLevelProgress(xpTotal), [xpTotal])

  const scrollViewRef = useRef<ScrollView | null>(null)

  const loadData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)

    const [todosResult, groupsResult, xpLogsResult] = await Promise.all([
      supabase
        .from('todo_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('list_id', listId)
        .order('created_at', { ascending: false }),
      supabase
        .from('todo_groups')
        .select('*')
        .eq('user_id', user.id)
        .eq('list_id', listId)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true }),
      supabase.from('todo_xp_logs').select('todo_id, xp').eq('user_id', user.id)
    ])

    if (todosResult.error) {
      setError('TODOの取得に失敗しました。')
      setLoading(false)
      return
    }

    if (groupsResult.error) {
      setError('グループの取得に失敗しました。')
      setLoading(false)
      return
    }

    const nextGroups: TodoGroupMap = {}
    for (const group of (groupsResult.data ?? []) as TodoGroup[]) {
      nextGroups[group.id] = group
    }
    setGroups(nextGroups)

    setTodos((todosResult.data ?? []) as TodoItem[])

    if (xpLogsResult.error) {
      setError((prev) => prev ?? 'XPの取得に失敗しました。')
      setXpLogsByTodo({})
      setXpTotal(0)
    } else {
      const xpMap: Record<string, number> = {}
      let total = 0
      for (const row of (xpLogsResult.data ?? []) as { todo_id?: string | null; xp?: number | null }[]) {
        if (row.todo_id) {
          xpMap[row.todo_id] = row.xp ?? 0
        }
        total += row.xp ?? 0
      }
      setXpLogsByTodo(xpMap)
      setXpTotal(total)
    }

    setLoading(false)
  }, [listId, user])

  useEffect(() => {
    if (!user) return
    void loadData()
  }, [user, loadData])

  const sortedTodos = useMemo(() => {
    return todos
      .slice()
      .sort((a, b) => {
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0
        return bTime - aTime
      })
  }, [todos])

  const visibleTodos = useMemo(() => {
    if (showCompleted) return sortedTodos
    return sortedTodos.filter((todo) => todo.status !== '完了')
  }, [sortedTodos, showCompleted])

  const groupList = useMemo(() => {
    return Object.values(groups).sort((a, b) => {
      const orderDiff = (a.sort_order ?? 0) - (b.sort_order ?? 0)
      if (orderDiff !== 0) return orderDiff
      return (a.created_at ?? '').localeCompare(b.created_at ?? '')
    })
  }, [groups])

  const statusSummary = useMemo<StatusSummary>(() => {
    const bucket: StatusSummary = {
      total: todos.length,
      未着手: 0,
      着手中: 0,
      完了: 0,
      completionRate: 0
    }
    for (const todo of todos) {
      bucket[todo.status] += 1
    }
    bucket.completionRate = bucket.total === 0 ? 0 : Math.round((bucket['完了'] / bucket.total) * 100)
    return bucket
  }, [todos])

  const focusTodo = useMemo(() => sortedTodos.find((todo) => todo.status !== '完了'), [sortedTodos])

  useEffect(() => {
    if (!recentXpGain) return
    const timer = setTimeout(() => setRecentXpGain(null), 4000)
    return () => clearTimeout(timer)
  }, [recentXpGain])

  const handleToggleExpanded = useCallback((todoId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(todoId)) next.delete(todoId)
      else next.add(todoId)
      return next
    })
  }, [])

  const awardXpForTodoCompletion = useCallback(
    async (todo: TodoItem) => {
      if (!user) return
      if (xpLogsByTodo[todo.id]) return

      const reward = rollXpReward()
      const { data, error } = await supabase
        .from('todo_xp_logs')
        .insert({ user_id: user.id, todo_id: todo.id, xp: reward })
        .select('todo_id, xp')
        .single()

      if (error) {
        if (error.code === '23505') return
        console.error('Failed to award XP', error)
        return
      }

      const xpAwarded = data?.xp ?? reward
      setXpLogsByTodo((prev) => ({ ...prev, [todo.id]: xpAwarded }))
      setXpTotal((prev) => prev + xpAwarded)
      setRecentXpGain({ todoId: todo.id, amount: xpAwarded })
    },
    [user, xpLogsByTodo]
  )

  const handleToggleStatus = useCallback(
    async (todo: TodoItem, nextStatus: TodoStatus, doneDate: string | null) => {
      if (!user || busyId || deletingId) return

      setBusyId(todo.id)
      setError(null)

      const { error: updateError } = await supabase
        .from('todo_items')
        .update({
          status: nextStatus,
          done_date: doneDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', todo.id)
        .eq('user_id', user.id)
        .eq('list_id', listId)

      if (updateError) {
        setError('ステータスの更新に失敗しました。')
      } else {
        setTodos((prev) =>
          prev.map((item) => (item.id === todo.id ? { ...item, status: nextStatus, done_date: doneDate } : item))
        )
        if (nextStatus === '完了') {
          await awardXpForTodoCompletion(todo)
        }
      }

      setBusyId(null)
    },
    [user, busyId, deletingId, listId, awardXpForTodoCompletion]
  )

  const toggleCompletion = useCallback(
    async (todo: TodoItem) => {
      const nextStatus = todo.status === '完了' ? '未着手' : '完了'
      const nextDoneDate = nextStatus === '完了' ? new Date().toISOString() : null
      await handleToggleStatus(todo, nextStatus, nextDoneDate)
    },
    [handleToggleStatus]
  )

  const toggleInProgress = useCallback(
    async (todo: TodoItem) => {
      const nextStatus = todo.status === '着手中' ? '未着手' : '着手中'
      await handleToggleStatus(todo, nextStatus, null)
    },
    [handleToggleStatus]
  )

  const handleDeleteTodo = useCallback(
    async (todoId: string) => {
      if (!user || deletingId || busyId) return

      setDeletingId(todoId)
      setError(null)
      const { error: deleteError } = await supabase
        .from('todo_items')
        .delete()
        .eq('id', todoId)
        .eq('user_id', user.id)
        .eq('list_id', listId)

      if (deleteError) {
        setError('削除に失敗しました。')
      } else {
        setTodos((prev) => prev.filter((item) => item.id !== todoId))
        setExpandedIds((prev) => {
          if (!prev.has(todoId)) return prev
          const next = new Set(prev)
          next.delete(todoId)
          return next
        })
      }

      setDeletingId(null)
    },
    [user, deletingId, busyId, listId]
  )

  const handleCreateTodo = useCallback(async () => {
    if (!user) return
    const title = newTodoTitle.trim()
    if (!title) {
      setCreateError('タイトルを入力してください。')
      return
    }

    setCreatingNewTodo(true)
    setCreateError(null)

    const timestamp = new Date().toISOString()
    const payload = {
      user_id: user.id,
      list_id: listId,
      title,
      status: '未着手' as TodoStatus,
      priority: null as TodoPriority,
      group_id: newTodoGroupId === 'none' ? null : newTodoGroupId,
      tags: [],
      markdown_text: null,
      created_at: timestamp,
      updated_at: timestamp,
      done_date: null
    }

    const { data, error: insertError } = await supabase.from('todo_items').insert(payload).select('*').single()

    if (insertError || !data) {
      setCreateError('TODOの作成に失敗しました。')
      setCreatingNewTodo(false)
      return
    }

    setTodos((prev) => [{ ...(data as TodoItem) }, ...prev])
    setNewTodoTitle('')
    setShowCreateForm(false)
    setNewTodoGroupId('none')
    setCreatingNewTodo(false)
  }, [user, listId, newTodoTitle, newTodoGroupId])

  const openEditModal = useCallback((todo: TodoItem) => {
    setEditingTodo(todo)
    setEditTitle(todo.title)
    setEditGroupId(todo.group_id ?? 'none')
    setEditTags(todo.tags.join(', '))
    setEditPriority(todo.priority ?? 'none')
    setEditError(null)
  }, [])

  const closeEditModal = useCallback(() => {
    if (savingEdit) return
    setEditingTodo(null)
    setEditTitle('')
    setEditGroupId('none')
    setEditTags('')
    setEditPriority('none')
    setEditError(null)
  }, [savingEdit])

  const handleSaveEdit = useCallback(async () => {
    if (!user || !editingTodo) return

    const trimmedTitle = editTitle.trim()
    if (!trimmedTitle) {
      setEditError('タイトルを入力してください。')
      return
    }

    const nextGroupId = editGroupId === 'none' ? null : editGroupId
    const nextTags = editTags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
    const nextPriority = editPriority === 'none' ? null : (editPriority as TodoPriority)

    setSavingEdit(true)
    setEditError(null)
    const { error: updateError } = await supabase
      .from('todo_items')
      .update({
        title: trimmedTitle,
        group_id: nextGroupId,
        tags: nextTags,
        priority: nextPriority,
        updated_at: new Date().toISOString()
      })
      .eq('id', editingTodo.id)
      .eq('user_id', user.id)
      .eq('list_id', listId)

    if (updateError) {
      setEditError('TODOの更新に失敗しました。')
      setSavingEdit(false)
      return
    }

    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === editingTodo.id
          ? { ...todo, title: trimmedTitle, group_id: nextGroupId, tags: nextTags, priority: nextPriority }
          : todo
      )
    )

    setSavingEdit(false)
    closeEditModal()
  }, [user, editingTodo, editTitle, editGroupId, editTags, editPriority, closeEditModal, listId])

  const handleCreateGroup = useCallback(async () => {
    if (!user) return
    const name = groupDraft.name.trim()
    if (!name) return

    const { data, error } = await supabase
      .from('todo_groups')
      .insert({
        user_id: user.id,
        list_id: listId,
        name,
        color: groupDraft.color.trim() || null,
        emoji: groupDraft.emoji.trim() || null,
        sort_order: Object.keys(groups).length,
        created_at: new Date().toISOString()
      })
      .select('*')
      .single()

    if (error || !data) {
      Alert.alert('エラー', 'グループの作成に失敗しました。')
      return
    }

    const created = data as TodoGroup
    setGroups((prev) => ({ ...prev, [created.id]: created }))
    setNewTodoGroupId(created.id)
    setRecentlyCreatedGroupId(created.id)
    setGroupDraft({ name: '', color: '', emoji: '' })
    setIsGroupModalOpen(false)
  }, [user, groupDraft, listId, groups])

  const handleDeleteGroup = useCallback(
    (groupId: string) => {
      Alert.alert('グループを削除', 'グループに紐付くタスクは未分類になります。削除を続行しますか？', [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            if (!user) return

            await supabase
              .from('todo_items')
              .update({ group_id: null, updated_at: new Date().toISOString() })
              .eq('group_id', groupId)
              .eq('user_id', user.id)
              .eq('list_id', listId)

            const { error } = await supabase
              .from('todo_groups')
              .delete()
              .eq('id', groupId)
              .eq('user_id', user.id)
              .eq('list_id', listId)

            if (error) {
              Alert.alert('エラー', 'グループの削除に失敗しました。')
              return
            }

            setGroups((prev) => {
              const next = { ...prev }
              delete next[groupId]
              return next
            })
            setTodos((prev) => prev.map((todo) => (todo.group_id === groupId ? { ...todo, group_id: null } : todo)))
            setNewTodoGroupId((prev) => (prev === groupId ? 'none' : prev))
          }
        }
      ])
    },
    [user, listId]
  )

  useEffect(() => {
    if (!showCreateForm || !createFormRef.current) return
    createFormRef.current.measure((_x, _y, _width, _height, _pageX, pageY) => {
      scrollViewRef.current?.scrollTo({ y: Math.max(pageY - 80, 0), animated: true })
    })
  }, [showCreateForm])

  if (!user) {
    return (
      <View style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.centerTitle}>ログインが必要です</Text>
          <Text style={styles.centerBody}>一覧画面から Google ログインをやり直してください。</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => selectList(null)}>
            <Text style={styles.backLabel}>一覧に戻る</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#38bdf8" />
          <Text style={styles.loadingText}>読み込み中…</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.safe}>
      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.headerButton} onPress={() => selectList(null)}>
            <Text style={styles.headerButtonText}>← 一覧に戻る</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButtonSecondary} onPress={() => Alert.alert('ヒント', '完了ログはWeb版で確認できます。')}>
            <Text style={styles.headerButtonSecondaryText}>🗓️ 完了ログを見る</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.progressCard}>
          <LinearGradient
            colors={['rgba(56,189,248,0.25)', 'rgba(99,102,241,0.15)']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.progressContent}>
            <View>
              <Text style={styles.progressLabel}>PROGRESS</Text>
              <Text style={styles.progressValue}>{statusSummary.completionRate}%</Text>
              <Text style={styles.progressSubValue}>
                完了 {statusSummary['完了']} / {statusSummary.total}
              </Text>
            </View>
            <View style={styles.statColumn}>
              <StatPill label="未着手" value={statusSummary['未着手']} gradient={['#94a3b8', '#cbd5f5']} />
              <StatPill label="着手中" value={statusSummary['着手中']} gradient={['#38bdf8', '#2dd4bf']} />
              <StatPill label="完了" value={statusSummary['完了']} gradient={['#4ade80', '#22d3ee']} />
            </View>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${Math.min(statusSummary.completionRate, 100)}%` }]} />
          </View>
          {focusTodo && (
            <View style={styles.focusCard}>
              <Text style={styles.focusLabel}>FOCUS</Text>
              <Text style={styles.focusTitle}>{focusTodo.title}</Text>
              <Text style={styles.focusStatus}>{focusTodo.status}</Text>
            </View>
          )}
        </View>

        <XpProgress
          level={xpProgress.level}
          xpTotal={xpTotal}
          xpNeededForNextLevel={Math.max(0, xpProgress.xpForNextLevel - xpProgress.xpIntoLevel)}
          xpProgressPercent={Math.min(100, Math.max(0, Math.round(xpProgress.progressToNext * 100)))}
          recentXpGain={recentXpGain}
        />

        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.toggleRow}>
          <TouchableOpacity style={styles.primaryAction} onPress={() => setShowCreateForm(true)}>
            <Text style={styles.primaryActionLabel}>新しいタスク</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryAction} onPress={() => setIsManageGroupsOpen(true)}>
            <Text style={styles.secondaryActionLabel}>グループを管理</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ghostAction} onPress={() => setIsGroupModalOpen(true)}>
            <Text style={styles.ghostActionLabel}>グループを追加</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.toggleSwitchRow}>
          <TouchableOpacity style={styles.toggleSwitch} onPress={() => setShowCompleted((prev) => !prev)}>
            <Text style={styles.toggleSwitchLabel}>{showCompleted ? '完了タスクを非表示' : '完了タスクを表示'}</Text>
          </TouchableOpacity>
        </View>

        {showCreateForm && (
          <View
            ref={(node) => {
              createFormRef.current = node
            }}
            style={styles.createCard}
          >
            <Text style={styles.cardHeading}>新しい Todo を追加</Text>
            <TextInput
              value={newTodoTitle}
              onChangeText={(text) => {
                if (createError) setCreateError(null)
                setNewTodoTitle(text)
              }}
              placeholder="例: 仕様書の確認"
              placeholderTextColor="#94a3b8"
              style={styles.input}
            />
            {createError ? <Text style={styles.errorInline}>{createError}</Text> : null}
            <View style={styles.groupPickerRow}>
              <Text style={styles.groupLabel}>グループ</Text>
              <TouchableOpacity style={styles.groupManagerButton} onPress={() => setIsManageGroupsOpen(true)}>
                <Text style={styles.groupManagerLabel}>⚙️ グループを管理</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.groupOptions}>
              <GroupOption
                label="グループなし"
                active={newTodoGroupId === 'none'}
                onPress={() => setNewTodoGroupId('none')}
              />
              {groupList.map((group) => (
                <GroupOption
                  key={group.id}
                  label={group.emoji ? `${group.emoji} ${group.name}` : group.name}
                  active={newTodoGroupId === group.id}
                  onPress={() => setNewTodoGroupId(group.id)}
                  color={group.color}
                />
              ))}
            </View>
            <View style={styles.createActions}>
              <TouchableOpacity style={styles.primaryAction} onPress={() => void handleCreateTodo()} disabled={creatingNewTodo}>
                <Text style={styles.primaryActionLabel}>{creatingNewTodo ? '作成中…' : '作成する'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.ghostAction} onPress={() => setShowCreateForm(false)} disabled={creatingNewTodo}>
                <Text style={styles.ghostActionLabel}>閉じる</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {visibleTodos.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>表示できる Todo はありません。</Text>
            <Text style={styles.emptyBody}>新しいタスクを追加するとここに表示されます。</Text>
          </View>
        ) : (
          visibleTodos.map((todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              group={todo.group_id ? groups[todo.group_id] : undefined}
              expanded={expandedIds.has(todo.id)}
              isBusy={busyId === todo.id}
              isDeleting={deletingId === todo.id}
              onToggleExpanded={() => handleToggleExpanded(todo.id)}
              onToggleCompletion={() => void toggleCompletion(todo)}
              onToggleInProgress={() => void toggleInProgress(todo)}
              onDelete={() => handleDeleteTodo(todo.id)}
              onEdit={() => openEditModal(todo)}
            />
          ))
        )}
      </ScrollView>

      <CreateGroupModal
        visible={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        draft={groupDraft}
        onDraftChange={setGroupDraft}
        onSubmit={() => void handleCreateGroup()}
      />

      <ManageGroupsModal
        visible={isManageGroupsOpen}
        onClose={() => setIsManageGroupsOpen(false)}
        groups={groupList}
        onDelete={handleDeleteGroup}
      />

      <EditTodoModal
        visible={!!editingTodo}
        todo={editingTodo}
        groups={groupList}
        onClose={closeEditModal}
        title={editTitle}
        onTitleChange={setEditTitle}
        groupId={editGroupId}
        onGroupChange={setEditGroupId}
        tags={editTags}
        onTagsChange={setEditTags}
        priority={editPriority}
        onPriorityChange={setEditPriority}
        onSave={() => void handleSaveEdit()}
        error={editError}
        saving={savingEdit}
      />
    </View>
  )
}

function StatPill({ label, value, gradient }: { label: string; value: number; gradient: [string, string] }) {
  return (
    <LinearGradient colors={gradient} style={styles.statPill}>
      <Text style={styles.statPillText}>
        {label} {value}
      </Text>
    </LinearGradient>
  )
}

function XpProgress({
  level,
  xpTotal,
  xpNeededForNextLevel,
  xpProgressPercent,
  recentXpGain
}: {
  level: number
  xpTotal: number
  xpNeededForNextLevel: number
  xpProgressPercent: number
  recentXpGain: RecentXpGain | null
}) {
  return (
    <View style={styles.xpCard}>
      <LinearGradient
        colors={['rgba(56,189,248,0.35)', 'rgba(129,140,248,0.35)', 'rgba(244,114,182,0.2)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.xpHeader}>
        <Text style={styles.xpLevel}>Lv.{level}</Text>
        <Text style={styles.xpLabel}>アドベンチャー進捗</Text>
      </View>
      <Text style={styles.xpSummary}>
        合計 {xpTotal} XP ・ 次のレベルまで {xpNeededForNextLevel} XP
      </Text>
      <View style={styles.xpBar}>
        <View style={[styles.xpFill, { width: `${xpProgressPercent}%` }]} />
      </View>
      {recentXpGain && (
        <View style={styles.xpGainBadge}>
          <Text style={styles.xpGainText}>✨ +{recentXpGain.amount} XP 獲得！</Text>
        </View>
      )}
    </View>
  )
}

function GroupOption({
  label,
  active,
  onPress,
  color
}: {
  label: string
  active: boolean
  onPress(): void
  color?: string | null
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.groupOption,
        {
          backgroundColor: active ? 'rgba(56,189,248,0.25)' : color ?? 'rgba(15,23,42,0.75)',
          borderColor: active ? 'rgba(56,189,248,0.6)' : 'rgba(148,163,184,0.25)'
        }
      ]}
    >
      <Text style={[styles.groupOptionText, { color: active ? '#0f172a' : '#e2e8f0' }]}>{label}</Text>
    </TouchableOpacity>
  )
}

function TodoCard({
  todo,
  group,
  expanded,
  isBusy,
  isDeleting,
  onToggleExpanded,
  onToggleCompletion,
  onToggleInProgress,
  onDelete,
  onEdit
}: {
  todo: TodoItem
  group?: TodoGroup
  expanded: boolean
  isBusy: boolean
  isDeleting: boolean
  onToggleExpanded(): void
  onToggleCompletion(): void
  onToggleInProgress(): void
  onDelete(): void
  onEdit(): void
}) {
  const badgeConfig = STATUS_BADGE_STYLE[todo.status]
  return (
    <View style={styles.todoCard}>
      <TouchableOpacity style={styles.todoHeader} onPress={onToggleExpanded}>
        <View
          style={[
            styles.statusBadge,
            {
              borderColor: badgeConfig.border,
              backgroundColor: badgeConfig.bg
            }
          ]}
        >
          <Text style={[styles.statusBadgeText, { color: badgeConfig.fg }]}>{todo.status}</Text>
        </View>
        <Text style={styles.todoTitle}>{todo.title}</Text>
        <Text style={styles.expandIcon}>{expanded ? '⌃' : '⌄'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.todoBody}>
          <View style={styles.todoMetaRow}>
            <Text style={styles.metaLabel}>
              グループ:{' '}
              <Text style={styles.metaValue}>{group ? (group.emoji ? `${group.emoji} ${group.name}` : group.name) : '未分類'}</Text>
            </Text>
            <Text style={styles.metaLabel}>
              優先度:{' '}
              <Text
                style={[
                  styles.metaValue,
                  todo.priority ? { color: PRIORITY_COLORS[todo.priority] } : { color: '#94a3b8' }
                ]}
              >
                {todo.priority ? PRIORITY_LABEL[todo.priority] : 'なし'}
              </Text>
            </Text>
          </View>

          {todo.tags.length > 0 && (
            <View style={styles.tagRow}>
              {todo.tags.map((tag) => (
                <View key={tag} style={styles.tagPill}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {todo.markdown_text ? (
            <View style={styles.markdownContainer}>
              <Markdown
                style={{
                  body: { color: '#e2e8f0', fontSize: 14, lineHeight: 20 },
                  paragraph: { marginTop: 0, marginBottom: 12 },
                  bullet_list: { marginBottom: 12 },
                  ordered_list: { marginBottom: 12 },
                  heading1: { color: '#f8fafc', marginBottom: 8 },
                  heading2: { color: '#f8fafc', marginBottom: 8 },
                  heading3: { color: '#f8fafc', marginBottom: 8 },
                  code_inline: {
                    backgroundColor: 'rgba(15,23,42,0.9)',
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 6
                  }
                }}
              >
                {todo.markdown_text}
              </Markdown>
            </View>
          ) : null}

          <View style={styles.todoActions}>
            <TouchableOpacity style={styles.secondaryAction} onPress={onEdit} disabled={isBusy || isDeleting}>
              <Text style={styles.secondaryActionLabel}>編集</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryAction} onPress={onToggleInProgress} disabled={isBusy || isDeleting}>
              <Text style={styles.primaryActionLabel}>{todo.status === '着手中' ? '未着手に戻す' : '着手中にする'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryAction} onPress={onToggleCompletion} disabled={isBusy || isDeleting}>
              <Text style={styles.secondaryActionLabel}>{todo.status === '完了' ? '完了を取り消す' : '完了にする'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.destructiveAction} onPress={onDelete} disabled={isBusy || isDeleting}>
              <Text style={styles.destructiveActionLabel}>{isDeleting ? '削除中…' : '削除'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  )
}

function CreateGroupModal({
  visible,
  onClose,
  draft,
  onDraftChange,
  onSubmit
}: {
  visible: boolean
  onClose(): void
  draft: { name: string; color: string; emoji: string }
  onDraftChange: (next: { name: string; color: string; emoji: string }) => void
  onSubmit(): void
}) {
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>新しいグループ</Text>
          <TextInput
            placeholder="グループ名"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            value={draft.name}
            onChangeText={(text) => onDraftChange({ ...draft, name: text })}
          />
          <TextInput
            placeholder="カラー (例: #38bdf8)"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            value={draft.color}
            onChangeText={(text) => onDraftChange({ ...draft, color: text })}
          />
          <TextInput
            placeholder="絵文字 (任意)"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            value={draft.emoji}
            onChangeText={(text) => onDraftChange({ ...draft, emoji: text })}
          />
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.primaryAction} onPress={onSubmit}>
              <Text style={styles.primaryActionLabel}>作成する</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ghostAction} onPress={onClose}>
              <Text style={styles.ghostActionLabel}>閉じる</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

function ManageGroupsModal({
  visible,
  onClose,
  groups,
  onDelete
}: {
  visible: boolean
  onClose(): void
  groups: TodoGroup[]
  onDelete: (groupId: string) => void
}) {
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCardLarge}>
          <Text style={styles.modalTitle}>グループ管理</Text>
          {groups.length === 0 ? (
            <Text style={styles.modalEmpty}>まだグループがありません。</Text>
          ) : (
            groups.map((group) => (
              <View key={group.id} style={styles.manageRow}>
                <View>
                  <Text style={styles.manageTitle}>{group.emoji ? `${group.emoji} ${group.name}` : group.name}</Text>
                  {group.color ? <Text style={styles.manageSubtitle}>{group.color}</Text> : null}
                </View>
                <TouchableOpacity style={styles.destructiveAction} onPress={() => onDelete(group.id)}>
                  <Text style={styles.destructiveActionLabel}>削除</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
          <TouchableOpacity style={[styles.ghostAction, { marginTop: 12 }]} onPress={onClose}>
            <Text style={styles.ghostActionLabel}>閉じる</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

function EditTodoModal({
  visible,
  todo,
  groups,
  onClose,
  title,
  onTitleChange,
  groupId,
  onGroupChange,
  tags,
  onTagsChange,
  priority,
  onPriorityChange,
  onSave,
  error,
  saving
}: {
  visible: boolean
  todo: TodoItem | null
  groups: TodoGroup[]
  onClose(): void
  title: string
  onTitleChange(text: string): void
  groupId: string | 'none'
  onGroupChange(next: string | 'none'): void
  tags: string
  onTagsChange(text: string): void
  priority: PriorityOption
  onPriorityChange(next: PriorityOption): void
  onSave(): void
  error: string | null
  saving: boolean
}) {
  return (
    <Modal transparent animationType="slide" visible={visible}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCardLarge}>
          <Text style={styles.modalTitle}>Todoを編集</Text>
          <TextInput
            style={styles.input}
            placeholder="タイトル"
            placeholderTextColor="#94a3b8"
            value={title}
            onChangeText={onTitleChange}
          />
          <TextInput
            style={styles.input}
            placeholder="タグ (カンマ区切り)"
            placeholderTextColor="#94a3b8"
            value={tags}
            onChangeText={onTagsChange}
          />
          <View style={styles.groupOptions}>
            <GroupOption label="グループなし" active={groupId === 'none'} onPress={() => onGroupChange('none')} />
            {groups.map((group) => (
              <GroupOption
                key={group.id}
                label={group.emoji ? `${group.emoji} ${group.name}` : group.name}
                active={groupId === group.id}
                onPress={() => onGroupChange(group.id)}
                color={group.color}
              />
            ))}
          </View>
          <View style={styles.priorityRow}>
            <PriorityButton label="なし" active={priority === 'none'} onPress={() => onPriorityChange('none')} />
            <PriorityButton label="低" active={priority === 'low'} onPress={() => onPriorityChange('low')} color="#6ee7b7" />
            <PriorityButton label="中" active={priority === 'medium'} onPress={() => onPriorityChange('medium')} color="#fbbf24" />
            <PriorityButton label="高" active={priority === 'high'} onPress={() => onPriorityChange('high')} color="#fca5a5" />
          </View>
          {error ? <Text style={styles.errorInline}>{error}</Text> : null}
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.primaryAction} onPress={onSave} disabled={saving}>
              <Text style={styles.primaryActionLabel}>{saving ? '保存中…' : '保存する'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ghostAction} onPress={onClose} disabled={saving}>
              <Text style={styles.ghostActionLabel}>キャンセル</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

function PriorityButton({
  label,
  active,
  onPress,
  color
}: {
  label: string
  active: boolean
  onPress(): void
  color?: string
}) {
  return (
    <TouchableOpacity
      style={[
        styles.priorityButton,
        {
          backgroundColor: active ? color ?? 'rgba(56,189,248,0.3)' : 'rgba(15,23,42,0.8)',
          borderColor: active ? 'rgba(255,255,255,0.6)' : 'rgba(148,163,184,0.4)'
        }
      ]}
      onPress={onPress}
    >
      <Text style={[styles.priorityButtonLabel, { color: active ? '#020617' : '#e2e8f0' }]}>{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#020617'
  },
  container: {
    padding: 16,
    paddingBottom: 120,
    gap: 16
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12
  },
  headerButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.35)',
    backgroundColor: 'rgba(15,23,42,0.75)'
  },
  headerButtonText: {
    color: '#e2e8f0',
    fontWeight: '600',
    fontSize: 13
  },
  headerButtonSecondary: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.45)',
    backgroundColor: 'rgba(56,189,248,0.12)'
  },
  headerButtonSecondaryText: {
    color: '#bae6fd',
    fontWeight: '600',
    fontSize: 13
  },
  progressCard: {
    position: 'relative',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
    backgroundColor: 'rgba(15,23,42,0.85)',
    overflow: 'hidden'
  },
  progressContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  progressLabel: {
    color: '#94a3b8',
    fontSize: 11,
    letterSpacing: 4,
    textTransform: 'uppercase'
  },
  progressValue: {
    color: '#f8fafc',
    fontSize: 36,
    fontWeight: '700',
    marginTop: 4
  },
  progressSubValue: {
    color: '#94a3b8',
    marginTop: 6
  },
  statColumn: {
    gap: 8,
    alignItems: 'flex-end'
  },
  statPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999
  },
  statPillText: {
    color: '#020617',
    fontWeight: '700',
    fontSize: 11
  },
  progressBar: {
    height: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.3)',
    backgroundColor: 'rgba(15,23,42,0.9)',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: 'rgba(56,189,248,0.6)'
  },
  focusCard: {
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
    backgroundColor: 'rgba(15,23,42,0.85)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  focusLabel: {
    color: '#94a3b8',
    letterSpacing: 4,
    fontSize: 10,
    textTransform: 'uppercase'
  },
  focusTitle: {
    color: '#f8fafc',
    fontSize: 14,
    flex: 1,
    marginLeft: 12,
    marginRight: 12
  },
  focusStatus: {
    color: '#94a3b8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.3)'
  },
  xpCard: {
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.35)',
    backgroundColor: 'rgba(15,23,42,0.8)',
    overflow: 'hidden'
  },
  xpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  xpLevel: {
    color: '#0f172a',
    fontWeight: '700',
    backgroundColor: 'rgba(56,189,248,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999
  },
  xpLabel: {
    color: '#bae6fd',
    fontWeight: '600',
    fontSize: 14
  },
  xpSummary: {
    color: '#e2e8f0',
    marginTop: 10
  },
  xpBar: {
    marginTop: 12,
    height: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.3)',
    backgroundColor: 'rgba(2,6,23,0.8)',
    overflow: 'hidden'
  },
  xpFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: 'rgba(165,180,252,0.9)'
  },
  xpGainBadge: {
    marginTop: 12,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(34,197,94,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.5)'
  },
  xpGainText: {
    color: '#bbf7d0',
    fontWeight: '700'
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 10
  },
  toggleSwitchRow: {
    alignItems: 'flex-end'
  },
  toggleSwitch: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(56,189,248,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.35)'
  },
  toggleSwitchLabel: {
    color: '#bae6fd',
    fontWeight: '600'
  },
  primaryAction: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: '#38bdf8',
    alignItems: 'center'
  },
  primaryActionLabel: {
    color: '#020617',
    fontWeight: '700'
  },
  secondaryAction: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(56,189,248,0.18)',
    alignItems: 'center'
  },
  secondaryActionLabel: {
    color: '#bae6fd',
    fontWeight: '600'
  },
  ghostAction: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.3)',
    backgroundColor: 'rgba(15,23,42,0.7)',
    alignItems: 'center'
  },
  ghostActionLabel: {
    color: '#e2e8f0',
    fontWeight: '600'
  },
  destructiveAction: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.4)',
    backgroundColor: 'rgba(248,113,113,0.1)',
    alignItems: 'center'
  },
  destructiveActionLabel: {
    color: '#fecaca',
    fontWeight: '600'
  },
  createCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
    backgroundColor: 'rgba(15,23,42,0.82)',
    padding: 18,
    gap: 12
  },
  cardHeading: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700'
  },
  input: {
    backgroundColor: 'rgba(2,6,23,0.85)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.35)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#f8fafc'
  },
  errorInline: {
    color: '#fca5a5',
    fontSize: 12
  },
  groupPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  groupLabel: {
    color: '#94a3b8'
  },
  groupManagerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
    backgroundColor: 'rgba(15,23,42,0.8)'
  },
  groupManagerLabel: {
    color: '#cbd5f5',
    fontSize: 12
  },
  groupOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  groupOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1
  },
  groupOptionText: {
    fontWeight: '600'
  },
  createActions: {
    flexDirection: 'row',
    gap: 12
  },
  emptyCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.2)',
    backgroundColor: 'rgba(15,23,42,0.75)',
    padding: 24,
    alignItems: 'center',
    gap: 8
  },
  emptyTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700'
  },
  emptyBody: {
    color: '#94a3b8'
  },
  todoCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
    backgroundColor: 'rgba(15,23,42,0.82)',
    padding: 16,
    gap: 12
  },
  todoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1
  },
  statusBadgeText: {
    fontWeight: '700',
    fontSize: 12
  },
  todoTitle: {
    flex: 1,
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700'
  },
  expandIcon: {
    color: '#94a3b8',
    fontSize: 18
  },
  todoBody: {
    gap: 12
  },
  todoMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  metaLabel: {
    color: '#94a3b8',
    fontSize: 12
  },
  metaValue: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '600'
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  tagPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(56,189,248,0.2)'
  },
  tagText: {
    color: '#bae6fd',
    fontWeight: '600',
    fontSize: 12
  },
  markdownContainer: {
    backgroundColor: 'rgba(2,6,23,0.7)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
    padding: 14
  },
  todoActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  modalCard: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
    backgroundColor: 'rgba(15,23,42,0.95)',
    padding: 20,
    gap: 12
  },
  modalCardLarge: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
    backgroundColor: 'rgba(15,23,42,0.95)',
    padding: 20,
    gap: 16
  },
  modalTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700'
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12
  },
  modalEmpty: {
    color: '#94a3b8'
  },
  manageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12
  },
  manageTitle: {
    color: '#e2e8f0',
    fontWeight: '600'
  },
  manageSubtitle: {
    color: '#94a3b8',
    fontSize: 12
  },
  priorityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  priorityButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1
  },
  priorityButtonLabel: {
    fontWeight: '600'
  },
  errorCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.4)',
    backgroundColor: 'rgba(248,113,113,0.12)',
    padding: 16
  },
  errorText: {
    color: '#fecaca'
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 24
  },
  centerTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700'
  },
  centerBody: {
    color: '#94a3b8',
    textAlign: 'center'
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: '#38bdf8'
  },
  backLabel: {
    color: '#020617',
    fontWeight: '700'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12
  },
  loadingText: {
    color: '#94a3b8'
  }
})
