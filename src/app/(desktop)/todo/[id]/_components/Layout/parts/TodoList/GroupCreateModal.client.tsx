"use client"

import { useState } from 'react'

type GroupCreateModalProps = {
  isOpen: boolean
  onClose: () => void
  onCreate: (name: string, color: string) => Promise<void>
}

const COLOR_OPTIONS = [
  { value: '#ef4444', label: '赤' },
  { value: '#f97316', label: 'オレンジ' },
  { value: '#f59e0b', label: '黄色' },
  { value: '#10b981', label: '緑' },
  { value: '#3b82f6', label: '青' },
  { value: '#8b5cf6', label: '紫' },
  { value: '#ec4899', label: 'ピンク' },
  { value: '#6b7280', label: 'グレー' },
]

export default function GroupCreateModal({ isOpen, onClose, onCreate }: GroupCreateModalProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLOR_OPTIONS[0].value)
  const [isCreating, setIsCreating] = useState(false)

  if (!isOpen) return null

  const handleCreate = async () => {
    if (!name.trim()) return

    setIsCreating(true)
    try {
      await onCreate(name.trim(), color)
      setName('')
      setColor(COLOR_OPTIONS[0].value)
      onClose()
    } finally {
      setIsCreating(false)
    }
  }

  const handleClose = () => {
    if (isCreating) return
    setName('')
    setColor(COLOR_OPTIONS[0].value)
    onClose()
  }

  const handleBackdropClick = async () => {
    if (isCreating) return
    if (name.trim()) {
      await handleCreate()
      return
    }
    handleClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-night-border bg-night-glass p-6 shadow-glass-xl backdrop-blur-[22px]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold text-frost-soft">新しいグループを作成</h2>

        <div className="mb-4">
          <label className="mb-2 block text-sm text-frost-soft">グループ名</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="グループ名を入力"
            autoFocus
            className="w-full rounded-xl border border-night-border-strong bg-night-glass-strong px-3 py-2 text-sm text-frost-soft placeholder:text-frost-subtle focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                e.preventDefault()
                handleCreate()
              }
            }}
          />
        </div>

        <div className="mb-6">
          <label className="mb-2 block text-sm text-frost-soft">色</label>
          <div className="grid grid-cols-4 gap-2">
            {COLOR_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setColor(option.value)}
                className={`flex h-10 items-center justify-center rounded-lg border-2 transition-all ${
                  color === option.value
                    ? 'border-sky-400 scale-105'
                    : 'border-night-border-strong hover:border-night-border'
                }`}
                style={{ backgroundColor: option.value }}
              >
                {color === option.value && (
                  <span className="text-white text-lg">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={isCreating}
            className="rounded-full border border-night-border bg-night-glass px-4 py-2 text-sm font-semibold text-frost-soft transition-colors hover:border-night-border-strong hover:text-white disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={!name.trim() || isCreating}
            className="rounded-full bg-primary-gradient px-4 py-2 text-sm font-semibold text-white shadow-button-primary transition duration-200 hover:-translate-y-0.5 hover:shadow-button-primary-hover disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {isCreating ? '作成中...' : '作成'}
          </button>
        </div>
      </div>
    </div>
  )
}
