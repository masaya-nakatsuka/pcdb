"use client"

import {
  forwardRef,
  useEffect,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type KeyboardEventHandler,
} from 'react'

export interface BulletItemModel {
  id: string
  text: string
}

interface BulletBlockEditorProps {
  blockId: string
  items: BulletItemModel[]
  onItemChange: (itemId: string, value: string) => void
  onItemKeyDown: (itemId: string, event: KeyboardEvent<HTMLDivElement>) => void
  onCompositionStart: (itemId: string) => void
  onCompositionEnd: (itemId: string) => void
  registerItemRef: (itemId: string, node: HTMLDivElement | null) => void
}

const BulletBlockEditor = forwardRef<HTMLDivElement, BulletBlockEditorProps>(function BulletBlockEditor (
  props,
  forwardedRef
) {
  const {
    blockId,
    items,
    onItemChange,
    onItemKeyDown,
    onCompositionStart,
    onCompositionEnd,
    registerItemRef
  } = props

  const attachWrapper = (node: HTMLDivElement | null) => {
    if (typeof forwardedRef === 'function') {
      forwardedRef(node)
    } else if (forwardedRef) {
      forwardedRef.current = node
    }
  }

  return (
    <div ref={attachWrapper} data-block-id={blockId} style={bulletWrapperStyle}>
      <ul style={bulletListStyle}>
        {items.map((item) => (
          <li key={item.id} style={bulletItemStyle}>
            <span style={bulletMarkerStyle}>•</span>
            <EditableBullet
              blockId={blockId}
              itemId={item.id}
              value={item.text}
              onChange={onItemChange}
              onKeyDown={onItemKeyDown}
              onCompositionStart={onCompositionStart}
              onCompositionEnd={onCompositionEnd}
              registerItemRef={registerItemRef}
            />
          </li>
        ))}
      </ul>
    </div>
  )
})

export default BulletBlockEditor

interface EditableBulletProps {
  blockId: string
  itemId: string
  value: string
  onChange: (itemId: string, value: string) => void
  onKeyDown: (itemId: string, event: React.KeyboardEvent<HTMLDivElement>) => void
  onCompositionStart: (itemId: string) => void
  onCompositionEnd: (itemId: string) => void
  registerItemRef: (itemId: string, node: HTMLDivElement | null) => void
}

function EditableBullet(props: EditableBulletProps) {
  const {
    blockId,
    itemId,
    value,
    onChange,
    onKeyDown,
    onCompositionStart,
    onCompositionEnd,
    registerItemRef
  } = props

  const innerRef = useRef<HTMLDivElement | null>(null)
  const lastValueRef = useRef<string>('')

  useEffect(() => {
    const node = innerRef.current
    if (!node) return
    if (node.innerText !== value) {
      lastValueRef.current = value
      node.innerText = value
    }
  }, [value])

  const attachRef = (node: HTMLDivElement | null) => {
    innerRef.current = node
    if (node && node.innerText !== value) {
      node.innerText = value
    }
    registerItemRef(itemId, node)
  }

  const handleInput: React.FormEventHandler<HTMLDivElement> = (event) => {
    const text = event.currentTarget.innerText.replace(/\u00a0/g, ' ')
    lastValueRef.current = text
    onChange(itemId, text)
  }

  const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
    onKeyDown(itemId, event)
  }

  const handleCompositionStart: React.CompositionEventHandler<HTMLDivElement> = () => {
    onCompositionStart(itemId)
  }

  const handleCompositionEnd: React.CompositionEventHandler<HTMLDivElement> = () => {
    onCompositionEnd(itemId)
  }

  const handleBlur: React.FocusEventHandler<HTMLDivElement> = () => {
    onCompositionEnd(itemId)
  }

  const computedStyle: CSSProperties = value.trim().length === 0
    ? { ...bulletInputStyle, color: 'rgba(148, 163, 184, 0.7)' }
    : bulletInputStyle

  return (
    <div
      ref={attachRef}
      data-block-id={blockId}
      data-item-id={itemId}
      data-empty={value.trim().length === 0}
      data-placeholder="箇条書きを入力"
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      onBlur={handleBlur}
      tabIndex={0}
      style={computedStyle}
    />
  )
}

const bulletWrapperStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px'
}

const bulletListStyle: CSSProperties = {
  margin: 0,
  paddingLeft: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '6px'
}

const bulletItemStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '10px'
}

const bulletMarkerStyle: CSSProperties = {
  color: '#bfdbfe',
  lineHeight: '24px'
}

const bulletInputStyle: CSSProperties = {
  flex: 1,
  minHeight: '24px',
  outline: 'none',
  borderRadius: '8px',
  padding: '4px 8px',
  background: 'rgba(15, 23, 42, 0.2)',
  border: '1px solid transparent',
  color: '#e2e8f0',
  fontSize: '15px',
  lineHeight: 1.6
}
