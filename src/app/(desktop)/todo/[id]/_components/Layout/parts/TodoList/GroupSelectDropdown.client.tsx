"use client"

import { useEffect, useRef, useState } from 'react'
import type { TodoGroup } from '@/lib/todoTypes'

type GroupSelectDropdownProps = {
  value: string | null
  groups: TodoGroup[]
  onChange: (groupId: string | null) => void
  onCreateNew: () => void
  onDeleteGroup: (groupId: string) => void
  onReorderGroups: (groups: TodoGroup[]) => void
  className?: string
}

export default function GroupSelectDropdown({
  value,
  groups,
  onChange,
  onCreateNew,
  onDeleteGroup,
  onReorderGroups,
  className = '',
}: GroupSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localGroups, setLocalGroups] = useState<TodoGroup[]>(groups)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLocalGroups(groups)
  }, [groups])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const selectedGroup = value ? localGroups.find((g) => g.id === value) : null

  const handleSelect = (groupId: string | null) => {
    onChange(groupId)
    setIsOpen(false)
  }

  const handleDelete = (e: React.MouseEvent, groupId: string) => {
    e.stopPropagation()
    if (confirm('このグループを削除しますか？')) {
      onDeleteGroup(groupId)
      if (value === groupId) {
        onChange(null)
      }
    }
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newGroups = [...localGroups]
    const draggedItem = newGroups[draggedIndex]
    newGroups.splice(draggedIndex, 1)
    newGroups.splice(index, 0, draggedItem)

    setLocalGroups(newGroups)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    if (draggedIndex !== null) {
      onReorderGroups(localGroups)
    }
    setDraggedIndex(null)
  }

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`todo-hit-expand w-full rounded-xl border border-night-border-strong bg-night-glass-strong px-3 py-2 text-left text-sm text-frost-soft transition-colors hover:border-sky-400 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400 ${className}`}
      >
        {selectedGroup ? (
          <span>
            {selectedGroup.emoji && `${selectedGroup.emoji} `}
            {selectedGroup.name}
          </span>
        ) : (
          <span className="text-frost-subtle">グループなし</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute -left-[50px] -right-[50px] top-full z-50 mt-1 max-h-80 overflow-y-auto rounded-xl border border-night-border bg-night-glass shadow-glass-xl backdrop-blur-[22px]">
          <button
            type="button"
            onClick={() => handleSelect(null)}
            className="flex w-full items-center px-3 py-2 text-left text-sm text-frost-subtle transition-colors hover:bg-night-highlight"
          >
            グループなし
          </button>

          {localGroups.map((group, index) => (
            <div
              key={group.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              onClick={() => handleSelect(group.id)}
              className={`group flex cursor-move items-center justify-between border-b border-night-border-muted px-3 py-2 text-sm transition-colors hover:bg-night-highlight ${
                draggedIndex === index ? 'opacity-50' : ''
              }`}
            >
              <div className="flex flex-1 items-center gap-2">
                <span className="cursor-move text-frost-subtle">⋮⋮</span>
                {group.color && (
                  <div
                    className="h-3 w-3 rounded-full border border-night-border"
                    style={{ backgroundColor: group.color }}
                  />
                )}
                <span className="text-frost-soft">
                  {group.emoji && `${group.emoji} `}
                  {group.name}
                </span>
              </div>

              <button
                type="button"
                onClick={(e) => handleDelete(e, group.id)}
                className="todo-hit-expand ml-2 flex h-6 w-6 items-center justify-center rounded-lg border border-red-400/40 bg-red-500/20 text-xs text-rose-200 opacity-0 transition-all hover:border-red-400/60 hover:bg-red-500/30 group-hover:opacity-100"
              >
                ✕
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => {
              setIsOpen(false)
              onCreateNew()
            }}
            className="flex w-full items-center px-3 py-2 text-left text-sm text-sky-400 transition-colors hover:bg-night-highlight"
          >
            ＋ 新規作成
          </button>
        </div>
      )}
    </div>
  )
}
