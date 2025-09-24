"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type KeyboardEventHandler,
} from 'react'
import type { NoteBook, NotePage } from '@/lib/noteTypes'
import ParagraphBlockEditor from './markdown/ParagraphBlockEditor'
import BulletBlockEditor from './markdown/BulletBlockEditor'

type Block = ParagraphBlock | BulletBlock

interface ParagraphBlock {
  id: string
  type: 'paragraph'
  text: string
}

interface BulletBlock {
  id: string
  type: 'bullet'
  items: BulletItem[]
}

interface BulletItem {
  id: string
  text: string
}

interface FocusTarget {
  blockId: string
  itemId?: string
}

interface PageContentPanelProps {
  book: NoteBook | null
  page: NotePage | null
  content: string
  onChange: (value: string) => void
  onSave: () => void
  saving: boolean
  dirty: boolean
  feedback: string | null
}

export default function PageContentPanel(props: PageContentPanelProps) {
  const { book, page, content, onChange, onSave, saving, dirty, feedback } = props

  const initialBlocksRef = useRef<Block[]>(ensureAtLeastOneBlock(parseContent(content)))
  const [blocks, setBlocks] = useState<Block[]>(initialBlocksRef.current)
  const lastSerializedRef = useRef<string>(serializeBlocks(initialBlocksRef.current))
  const focusRequestRef = useRef<FocusTarget | null>(null)

  const blockRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const bulletRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const compositionRefs = useRef<Record<string, boolean>>({})

  useEffect(() => {
    const parsed = ensureAtLeastOneBlock(parseContent(content))
    const serialized = serializeBlocks(parsed)
    if (serialized !== lastSerializedRef.current) {
      lastSerializedRef.current = serialized
      setBlocks(parsed)
    }
  }, [content])

  useEffect(() => {
    const target = focusRequestRef.current
    if (!target) return
    focusRequestRef.current = null
    requestAnimationFrame(() => {
      const node = target.itemId
        ? bulletRefs.current[bulletItemKey(target.blockId, target.itemId)]
        : blockRefs.current[target.blockId]
      focusEditable(node)
    })
  }, [blocks])

  const updateBlocks = useCallback((updater: (prev: Block[]) => BlockUpdateResult) => {
    setBlocks((prev) => {
      const { blocks: next, focus } = updater(prev)
      const normalized = ensureAtLeastOneBlock(next)
      const serialized = serializeBlocks(normalized)
      if (serialized !== lastSerializedRef.current) {
        lastSerializedRef.current = serialized
        onChange(serialized)
      }
      if (focus) focusRequestRef.current = focus
      return normalized
    })
  }, [onChange])

  const handleShortcutKeyDown = useCallback((event: KeyboardEvent<HTMLElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
      event.preventDefault()
      if (!saving && dirty) onSave()
    }
  }, [dirty, onSave, saving])

  const handleParagraphChange = useCallback((blockId: string, value: string) => {
    updateBlocks((prev) => ({
      blocks: prev.map((block) =>
        block.id === blockId && block.type === 'paragraph'
          ? { ...block, text: value }
          : block
      )
    }))
  }, [updateBlocks])

  const handleParagraphKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
    handleShortcutKeyDown(event)
  }

  const handleBulletItemChange = useCallback((blockId: string, itemId: string, value: string) => {
    updateBlocks((prev) => ({
      blocks: prev.map((block) => {
        if (block.id !== blockId || block.type !== 'bullet') return block
        return {
          ...block,
          items: block.items.map((item) => item.id === itemId ? { ...item, text: value } : item)
        }
      })
    }))
  }, [updateBlocks])

  const handleBulletItemKeyDown = useCallback((blockId: string, itemId: string, event: KeyboardEvent<HTMLDivElement>) => {
    handleShortcutKeyDown(event)
    if (event.defaultPrevented) return
    if (event.key !== 'Enter') return

    const key = bulletItemKey(blockId, itemId)
    if (compositionRefs.current[key]) return

    event.preventDefault()

    updateBlocks((prev) => {
      const next = [...prev]
      const blockIndex = next.findIndex((block) => block.id === blockId)
      if (blockIndex === -1) return { blocks: prev }
      const block = next[blockIndex]
      if (block.type !== 'bullet') return { blocks: prev }
      const itemIndex = block.items.findIndex((item) => item.id === itemId)
      if (itemIndex === -1) return { blocks: prev }

      const currentItem = block.items[itemIndex]

      if (currentItem.text.trim().length === 0) {
        const remainingItems = block.items.filter((item) => item.id !== itemId)
        let insertionIndex = blockIndex + 1
        if (remainingItems.length > 0) {
          next[blockIndex] = { ...block, items: remainingItems }
        } else {
          next.splice(blockIndex, 1)
          insertionIndex = blockIndex
        }
        const newBlock = createParagraphBlock()
        next.splice(insertionIndex, 0, newBlock)
        return {
          blocks: next,
          focus: { blockId: newBlock.id }
        }
      }

      const newItem = createBulletItem('')
      const updatedItems = [...block.items]
      updatedItems.splice(itemIndex + 1, 0, newItem)
      next[blockIndex] = { ...block, items: updatedItems }
      return {
        blocks: next,
        focus: { blockId, itemId: newItem.id }
      }
    })
  }, [handleShortcutKeyDown, updateBlocks])

  const handleAddParagraphBlock = useCallback(() => {
    updateBlocks((prev) => {
      const next = [...prev, createParagraphBlock()]
      const last = next[next.length - 1]
      return {
        blocks: next,
        focus: { blockId: last.id }
      }
    })
  }, [updateBlocks])

  const handleRemoveBlock = useCallback((blockId: string) => {
    updateBlocks((prev) => {
      if (prev.length === 1) {
        const fallback = createParagraphBlock()
        return { blocks: [fallback], focus: { blockId: fallback.id } }
      }
      const targetIndex = prev.findIndex((block) => block.id === blockId)
      if (targetIndex === -1) return { blocks: prev }
      const next = prev.filter((block) => block.id !== blockId)
      const fallbackIndex = Math.min(targetIndex, next.length - 1)
      const fallbackBlock = next[fallbackIndex]
      let focus: FocusTarget
      if (fallbackBlock.type === 'bullet') {
        const lastItem = fallbackBlock.items[fallbackBlock.items.length - 1]
        focus = { blockId: fallbackBlock.id, itemId: lastItem.id }
      } else {
        focus = { blockId: fallbackBlock.id }
      }
      return { blocks: next, focus }
    })
  }, [updateBlocks])

  const lastUpdatedLabel = useMemo(() => {
    if (!page?.updated_at) return null
    const date = new Date(page.updated_at)
    if (Number.isNaN(date.getTime())) return null
    return date.toLocaleString()
  }, [page?.updated_at])

  const headerTitle = page?.title?.trim() || '無題のページ'
  const subTitle = book?.title?.trim() || '無題のノート'

  if (!book || !page) {
    return (
      <main style={{ ...glassCardStyle, ...placeholderWrapperStyle }}>
        <div style={placeholderInnerStyle}>
          <h2>ノートを選択してください</h2>
          <p>左のサイドバーでノートやページを選択すると内容を編集できます。</p>
        </div>
      </main>
    )
  }

  return (
    <main style={{ ...glassCardStyle, ...panelStyle }}>
      <header style={panelHeaderStyle}>
        <div>
          <span style={panelKickerStyle}>{subTitle}</span>
          <h1 style={panelTitleStyle}>{headerTitle}</h1>
          {lastUpdatedLabel && (
            <p style={panelMetaStyle}>最終更新: {lastUpdatedLabel}</p>
          )}
        </div>
        <button
          onClick={onSave}
          disabled={!dirty || saving}
          style={{
            ...saveButtonStyle,
            opacity: dirty ? 1 : 0.5,
            cursor: dirty ? 'pointer' : 'not-allowed'
          }}
        >
          {saving ? '保存中...' : '保存する'}
        </button>
      </header>

      <section style={blockStackStyle}>
        {blocks.map((block) => (
          <div key={block.id} style={blockCardStyle}>
            <div style={blockToolbarStyle}>
              <button
                type="button"
                onClick={() => handleRemoveBlock(block.id)}
                style={removeBlockButtonStyle}
                aria-label="ブロックを削除"
              >
                ×
              </button>
            </div>

            {block.type === 'paragraph' ? (
              <ParagraphBlockEditor
                ref={(el) => { blockRefs.current[block.id] = el }}
                blockId={block.id}
                value={block.text}
                onChange={(value) => handleParagraphChange(block.id, value)}
                onKeyDown={handleParagraphKeyDown}
              />
            ) : (
              <BulletBlockEditor
                ref={(el) => { blockRefs.current[block.id] = el }}
                blockId={block.id}
                items={block.items}
                onItemChange={(itemId, value) => handleBulletItemChange(block.id, itemId, value)}
                onItemKeyDown={(itemId, event) => handleBulletItemKeyDown(block.id, itemId, event)}
                onCompositionStart={(itemId) => { compositionRefs.current[bulletItemKey(block.id, itemId)] = true }}
                onCompositionEnd={(itemId) => { compositionRefs.current[bulletItemKey(block.id, itemId)] = false }}
                registerItemRef={(itemId, node) => { bulletRefs.current[bulletItemKey(block.id, itemId)] = node }}
              />
            )}
          </div>
        ))}
      </section>

      <div style={addBlockRowStyle}>
        <span style={addBlockLabelStyle}>ブロックを追加</span>
        <button type="button" onClick={handleAddParagraphBlock} style={addBlockButtonStyle}>
          ＋ テキスト
        </button>
      </div>

      {feedback && <div style={feedbackStyle}>{feedback}</div>}
    </main>
  )
}

interface BlockUpdateResult {
  blocks: Block[]
  focus?: FocusTarget
}

function parseContent(value: string): Block[] {
  if (!value) {
    return [createParagraphBlock('')]
  }

  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) {
      const blocks: Block[] = parsed
        .map((raw) => normaliseParsedBlock(raw))
        .filter((block): block is Block => block !== null)
      return blocks.length > 0 ? blocks : [createParagraphBlock('')]
    }
  } catch (error) {
    // ignore and treat value as plain text
  }

  return [createParagraphBlock(value)]
}

function serialiseBulletItems(items: BulletItem[]): BulletItem[] {
  return items.map((item) => ({ id: item.id ?? makeId(), text: item.text ?? '' }))
}

function normaliseParsedBlock(raw: any): Block | null {
  if (!raw || typeof raw !== 'object') return null
  if (raw.type === 'paragraph') {
    return createParagraphBlock(typeof raw.text === 'string' ? raw.text : '', raw.id)
  }
  if (raw.type === 'bullet' && Array.isArray(raw.items)) {
    const items = raw.items
      .map((item: any) => ({
        id: typeof item?.id === 'string' ? item.id : makeId(),
        text: typeof item?.text === 'string' ? item.text : ''
      }))
    return createBulletBlock(items, raw.id)
  }
  return null
}

function ensureAtLeastOneBlock(blocks: Block[]): Block[] {
  if (blocks.length === 0) {
    return [createParagraphBlock('')]
  }
  return blocks.map((block) => {
    if (block.type === 'bullet') {
      const items = block.items.length > 0 ? block.items : [createBulletItem('')]
      return { ...block, items }
    }
    return block
  })
}

function createParagraphBlock(text = '', id?: string): ParagraphBlock {
  return {
    id: id ?? makeId(),
    type: 'paragraph',
    text
  }
}

function createBulletBlock(items?: BulletItem[], id?: string): BulletBlock {
  const prepared = items && items.length > 0 ? serialiseBulletItems(items) : [createBulletItem('')]
  return {
    id: id ?? makeId(),
    type: 'bullet',
    items: prepared
  }
}

function createBulletItem(text = '', id?: string): BulletItem {
  return {
    id: id ?? makeId(),
    text
  }
}

function serializeBlocks(blocks: Block[]): string {
  return JSON.stringify(blocks)
}

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function bulletItemKey(blockId: string, itemId: string): string {
  return `${blockId}:${itemId}`
}

function focusEditable(node: HTMLDivElement | null): void {
  if (!node) return
  if (typeof node.focus === 'function') {
    node.focus({ preventScroll: true })
  }
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  if (!node.isContentEditable) return
  const selection = window.getSelection()
  if (!selection) return
  const range = document.createRange()
  range.selectNodeContents(node)
  selection.removeAllRanges()
  selection.addRange(range)
}

const glassCardStyle: CSSProperties = {
  background: 'rgba(15, 23, 42, 0.65)',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  borderRadius: '24px',
  boxShadow: '0 45px 80px -40px rgba(15, 23, 42, 0.8)',
  backdropFilter: 'blur(22px)',
  WebkitBackdropFilter: 'blur(22px)'
}

const panelStyle: CSSProperties = {
  padding: '32px 36px',
  minHeight: 'calc(100vh - 72px)',
  color: '#e2e8f0',
  display: 'flex',
  flexDirection: 'column',
  gap: '28px'
}

const panelHeaderStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '24px',
  alignItems: 'flex-start'
}

const panelKickerStyle: CSSProperties = {
  display: 'inline-block',
  fontSize: '12px',
  letterSpacing: '0.35em',
  textTransform: 'uppercase',
  color: 'rgba(226, 232, 240, 0.6)',
  marginBottom: '8px'
}

const panelTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: '36px',
  fontWeight: 700,
  color: '#f1f5f9'
}

const panelMetaStyle: CSSProperties = {
  margin: '10px 0 0',
  fontSize: '12px',
  color: 'rgba(148, 163, 184, 0.75)'
}

const saveButtonStyle: CSSProperties = {
  border: 'none',
  borderRadius: '12px',
  padding: '10px 18px',
  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
  color: '#fff',
  fontWeight: 600,
  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
}

const blockStackStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  flex: 1
}

const blockCardStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  padding: '4px 0'
}

const blockToolbarStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
}

const removeBlockButtonStyle: CSSProperties = {
  border: 'none',
  background: 'transparent',
  color: 'rgba(248, 113, 113, 0.8)',
  padding: '0 4px',
  cursor: 'pointer',
  marginLeft: 'auto'
}

const addBlockRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '16px'
}

const addBlockLabelStyle: CSSProperties = {
  fontSize: '13px',
  color: 'rgba(148, 163, 184, 0.8)'
}

const addBlockButtonStyle: CSSProperties = {
  border: '1px dashed rgba(148, 163, 184, 0.4)',
  borderRadius: '12px',
  padding: '8px 14px',
  background: 'rgba(148, 163, 184, 0.15)',
  color: '#e2e8f0',
  cursor: 'pointer'
}

const feedbackStyle: CSSProperties = {
  fontSize: '13px',
  color: 'rgba(148, 163, 184, 0.85)'
}

const placeholderWrapperStyle: CSSProperties = {
  padding: '32px 36px',
  minHeight: 'calc(100vh - 72px)',
  color: '#e2e8f0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}

const placeholderInnerStyle: CSSProperties = {
  textAlign: 'center',
  color: 'rgba(226, 232, 240, 0.75)'
}
