"use client"

import {
  forwardRef,
  useEffect,
  useRef,
  type CSSProperties,
  type FormEventHandler,
  type KeyboardEventHandler,
} from 'react'

interface ParagraphBlockEditorProps {
  blockId: string
  value: string
  placeholder?: string
  onChange: (value: string) => void
  onKeyDown?: KeyboardEventHandler<HTMLDivElement>
}

const ParagraphBlockEditor = forwardRef<HTMLDivElement, ParagraphBlockEditorProps>(function ParagraphBlockEditor (
  props,
  forwardedRef
) {
  const { blockId, value, placeholder = 'テキストを入力', onChange, onKeyDown } = props
  const innerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const node = innerRef.current
    if (!node) return
    if (node.innerText !== value) {
      node.innerText = value
    }
  }, [value])

  const handleInput: FormEventHandler<HTMLDivElement> = (event) => {
    const text = event.currentTarget.innerText.replace(/\u00a0/g, ' ')
    onChange(text)
  }

  const computedStyle: CSSProperties = value.trim().length === 0
    ? { ...paragraphStyle, color: 'rgba(148, 163, 184, 0.7)' }
    : paragraphStyle

  const attachRef = (node: HTMLDivElement | null) => {
    innerRef.current = node
    if (node && node.innerText !== value) {
      node.innerText = value
    }
    if (typeof forwardedRef === 'function') {
      forwardedRef(node)
    } else if (forwardedRef) {
      forwardedRef.current = node
    }
  }

  return (
    <div
      ref={attachRef}
      data-block-id={blockId}
      data-empty={value.trim().length === 0}
      data-placeholder={placeholder}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onKeyDown={onKeyDown}
      tabIndex={0}
      style={computedStyle}
    />
  )
})

export default ParagraphBlockEditor

const paragraphStyle: CSSProperties = {
  minHeight: '24px',
  outline: 'none',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  fontSize: '15px',
  lineHeight: 1.7,
  padding: '4px 0',
  color: '#e2e8f0'
}
