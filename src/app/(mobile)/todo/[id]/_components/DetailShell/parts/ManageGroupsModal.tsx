"use client"

import { useMemo, useState } from 'react'
import type { TodoGroupDTO } from '@/features/todo/detail/types'

type ManageGroupsModalProps = {
  isOpen: boolean
  groups: TodoGroupDTO[]
  onDelete: (groupId: string) => Promise<void>
  onCreate: () => void
  onClose: () => void
}

export default function ManageGroupsModal({ isOpen, groups, onDelete, onCreate, onClose }: ManageGroupsModalProps) {
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const sortedGroups = useMemo(() => {
    return [...groups].sort((a, b) => {
      const orderDiff = (a.sort_order ?? 0) - (b.sort_order ?? 0)
      if (orderDiff !== 0) return orderDiff
      return (a.created_at ?? '').localeCompare(b.created_at ?? '')
    })
  }, [groups])

  if (!isOpen) return null

  const handleDelete = async (groupId: string) => {
    setError(null)
    setPendingId(groupId)
    try {
      await onDelete(groupId)
    } catch (err) {
      console.error('Failed to delete group', err)
      setError('グループの削除に失敗しました。')
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-8 pt-12 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl border border-night-border bg-night-glass-soft p-6 text-sm text-frost-soft shadow-glass-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-frost-soft">グループの管理</h2>
          <button
            type="button"
            className="text-xs text-frost-subtle underline-offset-2 hover:underline"
            onClick={onClose}
            disabled={pendingId !== null}
          >
            閉じる
          </button>
        </div>

        {error && (
          <div className="mb-3 rounded-2xl border border-rose-500/60 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">
            {error}
          </div>
        )}

        {sortedGroups.length === 0 ? (
          <p className="text-xs text-frost-muted">作成済みのグループはありません。</p>
        ) : (
          <ul className="space-y-3">
            {sortedGroups.map((group) => (
              <li key={group.id} className="flex items-center justify-between gap-3 rounded-2xl border border-night-border bg-night-glass px-4 py-3">
                <div className="flex items-center gap-3">
                  <div
                    className="h-6 w-6 rounded-full border border-night-border"
                    style={{ backgroundColor: group.color ?? 'transparent' }}
                  />
                  <div className="flex flex-col text-sm text-frost-soft">
                    <span className="font-semibold">{group.name}</span>
                    {group.color && <span className="text-xs text-frost-muted">{group.color}</span>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void handleDelete(group.id)}
                  disabled={pendingId === group.id}
                  className="rounded-full border border-rose-400/60 px-3 py-1 text-xs font-semibold text-rose-200 transition hover:border-rose-300 hover:text-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {pendingId === group.id ? '削除中…' : '削除'}
                </button>
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          onClick={onCreate}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-sky-400/60 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-100 transition hover:border-sky-300 hover:bg-sky-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
          disabled={pendingId !== null}
        >
          <span aria-hidden>＋</span>
          <span>新しいグループを作成</span>
        </button>
      </div>
    </div>
  )
}
