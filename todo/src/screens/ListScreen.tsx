import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'

import { supabase } from '../lib/supabase'
import { useTodoStore } from '../state/TodoStore'
import type { TodoList } from '../types'

type StatusCounts = {
  total: number
  未着手: number
  着手中: number
  完了: number
}

export default function ListScreen() {
  const { user, selectList, signOut } = useTodoStore()
  const [lists, setLists] = useState<TodoList[]>([])
  const [summaries, setSummaries] = useState<Record<string, StatusCounts>>({})
  const [loading, setLoading] = useState(false)
  const [overlayMessage, setOverlayMessage] = useState<string | null>(null)
  const [newListName, setNewListName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [editingListId, setEditingListId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  useEffect(() => {
    if (!user) return
    void loadLists()
  }, [user])

  const loadLists = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data: listsData, error: listsError } = await supabase
      .from('todo_lists')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (listsError || !listsData) {
      setLoading(false)
      return
    }

    setLists(listsData as TodoList[])

    const base: Record<string, StatusCounts> = {}
    for (const list of listsData as TodoList[]) {
      base[list.id] = { total: 0, 未着手: 0, 着手中: 0, 完了: 0 }
    }

    if ((listsData as TodoList[]).length > 0) {
      const { data: itemsData } = await supabase
        .from('todo_items')
        .select('list_id, status')
        .eq('user_id', user.id)
        .in(
          'list_id',
          (listsData as TodoList[]).map((list) => list.id)
        )

      for (const row of (itemsData ?? []) as { list_id: string; status: keyof StatusCounts }[]) {
        const entry = base[row.list_id]
        if (!entry) continue
        entry.total += 1
        entry[row.status] += 1
      }
    }

    setSummaries(base)
    setLoading(false)
  }, [user])

  const handleCreateList = useCallback(async () => {
    if (!user) return
    const trimmed = newListName.trim()
    if (!trimmed) return

    setOverlayMessage('リストを作成中...')
    const timestamp = new Date().toISOString()
    const { data, error } = await supabase
      .from('todo_lists')
      .insert({
        user_id: user.id,
        name: trimmed,
        description: null,
        sort_order: null,
        created_at: timestamp,
        updated_at: timestamp
      })
      .select('*')
      .single()

    setOverlayMessage(null)

    if (error || !data) return

    const created = data as TodoList
    setLists((prev) => [created, ...prev])
    setSummaries((prev) => ({
      ...prev,
      [created.id]: { total: 0, 未着手: 0, 着手中: 0, 完了: 0 }
    }))
    setNewListName('')
    setIsCreating(false)
  }, [newListName, user])

  const handleSaveEditing = useCallback(async () => {
    if (!user || !editingListId) return
    const trimmed = editingName.trim()
    if (!trimmed) return

    const { error } = await supabase
      .from('todo_lists')
      .update({ name: trimmed, updated_at: new Date().toISOString() })
      .eq('id', editingListId)
      .eq('user_id', user.id)

    if (!error) {
      setLists((prev) => prev.map((list) => (list.id === editingListId ? { ...list, name: trimmed } : list)))
      setEditingListId(null)
      setEditingName('')
    }
  }, [editingListId, editingName, user])

  const handleDeleteList = useCallback(
    (listId: string) => {
      Alert.alert('リストを削除', 'このリストを削除すると関連するタスクも削除されます。続行しますか？', [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            if (!user) return
            setOverlayMessage('リストを削除中...')
            await supabase.from('todo_items').delete().eq('list_id', listId).eq('user_id', user.id)
            const { error } = await supabase
              .from('todo_lists')
              .delete()
              .eq('id', listId)
              .eq('user_id', user.id)
            setOverlayMessage(null)
            if (!error) {
              setLists((prev) => prev.filter((list) => list.id !== listId))
              setSummaries((prev) => {
                const next = { ...prev }
                delete next[listId]
                return next
              })
            }
          }
        }
      ])
    },
    [user]
  )

  const headerSubtitle = useMemo(() => {
    const total = Object.values(summaries).reduce((acc, summary) => acc + summary.total, 0)
    return `現在 ${total} 件のタスクを追跡中`
  }, [summaries])

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Specsy Todo</Text>
            <Text style={styles.subtitle}>{headerSubtitle}</Text>
          </View>
          <TouchableOpacity onPress={() => void signOut()}>
            <Text style={styles.signOut}>サインアウト</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.primaryAction} onPress={() => setIsCreating((prev) => !prev)}>
            <Text style={styles.primaryActionLabel}>{isCreating ? 'キャンセル' : '新しいリスト'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryAction} onPress={() => void loadLists()}>
            <Text style={styles.secondaryActionLabel}>{loading ? '更新中…' : '再読み込み'}</Text>
          </TouchableOpacity>
        </View>

        {isCreating && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>リストを作成</Text>
            <TextInput
              placeholder="リスト名"
              placeholderTextColor="#94a3b8"
              style={styles.input}
              value={newListName}
              onChangeText={setNewListName}
            />
            <TouchableOpacity style={styles.primaryAction} onPress={() => void handleCreateList()}>
              <Text style={styles.primaryActionLabel}>作成</Text>
            </TouchableOpacity>
          </View>
        )}

        {lists.map((list) => {
          const summary = summaries[list.id]
          const isEditing = editingListId === list.id
          return (
            <View key={list.id} style={styles.card}>
              <TouchableOpacity style={styles.cardHeader} onPress={() => selectList(list.id)}>
                <View style={{ flex: 1 }}>
                  {isEditing ? (
                    <TextInput
                      value={editingName}
                      onChangeText={setEditingName}
                      style={[styles.input, styles.inlineInput]}
                    />
                  ) : (
                    <Text style={styles.cardTitle}>{list.name}</Text>
                  )}
                  {list.description ? <Text style={styles.cardDescription}>{list.description}</Text> : null}
                </View>
                <Text style={styles.openLabel}>開く ›</Text>
              </TouchableOpacity>

              <View style={styles.countRow}>
                <StatusChip label="未着手" value={summary?.['未着手'] ?? 0} tone="slate" />
                <StatusChip label="着手中" value={summary?.['着手中'] ?? 0} tone="sky" />
                <StatusChip label="完了" value={summary?.['完了'] ?? 0} tone="emerald" />
                <StatusChip label="合計" value={summary?.total ?? 0} tone="primary" />
              </View>

              <View style={styles.cardActions}>
                {isEditing ? (
                  <TouchableOpacity style={styles.secondaryAction} onPress={() => void handleSaveEditing()}>
                    <Text style={styles.secondaryActionLabel}>保存</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.secondaryAction}
                    onPress={() => {
                      setEditingListId(list.id)
                      setEditingName(list.name)
                    }}
                  >
                    <Text style={styles.secondaryActionLabel}>名称変更</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.destructiveAction} onPress={() => handleDeleteList(list.id)}>
                  <Text style={styles.destructiveActionLabel}>削除</Text>
                </TouchableOpacity>
              </View>
            </View>
          )
        })}

        {lists.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>リストがありません</Text>
            <Text style={styles.emptyBody}>右上のボタンから新しく作成しましょう。</Text>
          </View>
        )}
      </ScrollView>

      {overlayMessage && (
        <View style={styles.overlay}>
          <View style={styles.overlayCard}>
            <Text style={styles.overlayText}>{overlayMessage}</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  )
}

function StatusChip({
  label,
  value,
  tone
}: {
  label: string
  value: number
  tone: 'slate' | 'sky' | 'emerald' | 'primary'
}) {
  const palette: Record<typeof tone, { bg: string; fg: string }> = {
    slate: { bg: 'rgba(148, 163, 184, 0.2)', fg: '#e2e8f0' },
    sky: { bg: 'rgba(56, 189, 248, 0.2)', fg: '#bae6fd' },
    emerald: { bg: 'rgba(16, 185, 129, 0.2)', fg: '#bbf7d0' },
    primary: { bg: 'rgba(129, 140, 248, 0.25)', fg: '#ede9fe' }
  }
  return (
    <View
      style={{
        backgroundColor: palette[tone].bg,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 999
      }}
    >
      <Text style={{ color: palette[tone].fg, fontSize: 12, fontWeight: '600' }}>
        {label} {value}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#020617'
  },
  container: {
    padding: 20,
    paddingBottom: 120,
    gap: 16
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    color: '#f8fafc',
    fontSize: 30,
    fontWeight: '700'
  },
  subtitle: {
    color: '#94a3b8',
    marginTop: 6,
    fontSize: 14
  },
  signOut: {
    color: '#38bdf8',
    fontWeight: '600',
    fontSize: 14
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12
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
    fontSize: 15,
    fontWeight: '700'
  },
  secondaryAction: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(56, 189, 248, 0.18)',
    alignItems: 'center'
  },
  secondaryActionLabel: {
    color: '#bae6fd',
    fontWeight: '600'
  },
  destructiveAction: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.4)',
    backgroundColor: 'rgba(248, 113, 113, 0.12)'
  },
  destructiveActionLabel: {
    color: '#fecaca',
    fontWeight: '600'
  },
  card: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    gap: 12
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  cardTitle: {
    color: '#e2e8f0',
    fontSize: 20,
    fontWeight: '700'
  },
  cardDescription: {
    color: '#94a3b8',
    marginTop: 4,
    fontSize: 13
  },
  openLabel: {
    color: '#38bdf8',
    fontWeight: '600',
    fontSize: 14
  },
  input: {
    backgroundColor: 'rgba(2, 6, 23, 0.85)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.4)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#f8fafc',
    fontSize: 15
  },
  inlineInput: {
    marginTop: 0
  },
  countRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12
  },
  emptyState: {
    marginTop: 80,
    alignItems: 'center',
    gap: 8
  },
  emptyTitle: {
    color: '#e2e8f0',
    fontSize: 18,
    fontWeight: '700'
  },
  emptyBody: {
    color: '#94a3b8'
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 6, 23, 0.8)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  overlayCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.35)'
  },
  overlayText: {
    color: '#e2e8f0',
    fontWeight: '600'
  }
})
