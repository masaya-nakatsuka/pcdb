"use client"

import { useCallback, useState } from 'react'

type CreateGroupModalProps = {
  isOpen: boolean
  onClose: () => void
  onCreate: (name: string, color: string | null) => Promise<void>
}

export default function CreateGroupModal({ isOpen, onClose, onCreate }: CreateGroupModalProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = useCallback(async () => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('グループ名を入力してください。')
      return
    }

    const trimmedColor = color.trim()
    if (trimmedColor && !/^#[0-9a-fA-F]{6}$/.test(trimmedColor)) {
      setError('カラーコードは # から始まる 6 桁の 16 進数で入力してください。')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await onCreate(trimmedName, trimmedColor || null)
      setName('')
      setColor('')
      onClose()
    } catch (err) {
      console.error('Failed to create group', err)
      setError('グループの作成に失敗しました。')
    } finally {
      setSubmitting(false)
    }
  }, [name, color, onCreate, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-8 pt-12 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl border border-night-border bg-night-glass-soft p-6 text-sm text-frost-soft shadow-glass-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-frost-soft">新しいグループを作成</h2>
          <button
            type="button"
            className="text-xs text-frost-subtle underline-offset-2 hover:underline"
            onClick={onClose}
            disabled={submitting}
          >
            閉じる
          </button>
        </div>
        <div className="space-y-3">
          <div className="space-y-2">
            <label htmlFor="mobile-group-name" className="block text-xs text-frost-muted">
              グループ名
            </label>
            <input
              id="mobile-group-name"
              value={name}
              onChange={(event) => {
                if (error) setError(null)
                setName(event.target.value)
              }}
              placeholder="例: デザイン"
              className="w-full rounded-2xl border border-night-border bg-night-glass px-3 py-2 text-sm text-frost-soft placeholder:text-frost-subtle focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
              disabled={submitting}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="mobile-group-color" className="block text-xs text-frost-muted">
              カラーコード（任意）
            </label>
            <input
              id="mobile-group-color"
              value={color}
              onChange={(event) => setColor(event.target.value)}
              placeholder="#60A5FA"
              className="w-full rounded-2xl border border-night-border bg-night-glass px-3 py-2 text-sm text-frost-soft placeholder:text-frost-subtle focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
              disabled={submitting}
            />
            <p className="text-xs text-frost-subtle">カラーコードは # から始まる 6 桁の 16 進数で入力してください。</p>
          </div>
          {error && <p className="text-xs text-rose-300">{error}</p>}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void handleSubmit()}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary-gradient px-4 py-2 text-sm font-semibold text-white shadow-button-primary transition hover:shadow-button-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? '作成中…' : '作成する'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-night-border bg-night-highlight px-4 py-2 text-sm font-semibold text-frost-soft transition hover:border-rose-300/60 hover:text-rose-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-300"
            disabled={submitting}
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  )
}
