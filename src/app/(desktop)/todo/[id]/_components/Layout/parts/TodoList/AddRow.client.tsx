"use client"

type AddRowProps = {
  gridTemplateColumns: string
  cellPaddingClass: string
  onStartCreating: () => void
}

export default function AddRow({ gridTemplateColumns, cellPaddingClass, onStartCreating }: AddRowProps) {
  return (
    <div className="border-b border-dashed border-night-border-muted">
      <div
        role="button"
        tabIndex={0}
        onClick={onStartCreating}
        onKeyDown={(event) => {
          if (event.nativeEvent.isComposing) return
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onStartCreating()
          }
        }}
        className="grid cursor-pointer"
        style={{ gridTemplateColumns }}
      >
        <div
          className={`col-span-full flex items-center gap-2 text-frost-muted transition-colors focus-visible:text-white focus-visible:outline-none hover:text-white ${cellPaddingClass}`}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full text-xl leading-none">＋</span>
          新しいTODOを追加
        </div>
      </div>
    </div>
  )
}
