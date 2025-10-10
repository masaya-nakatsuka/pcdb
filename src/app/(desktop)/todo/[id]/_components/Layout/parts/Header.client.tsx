"use client"

type HeaderProps = {
  onSignOut: () => Promise<void> | void
  doneHref: string
}

export default function Header({ onSignOut, doneHref }: HeaderProps) {
  return (
    <div className="flex items-center justify-between rounded-3xl border border-night-border bg-night-glass px-6 py-4 text-frost-soft shadow-glass-xl backdrop-blur-[22px]">
      <div className="flex items-center gap-3">
        <a
          href="/todo"
          className="text-sm text-frost-soft transition-colors hover:text-white"
        >
          ← Todo 一覧へ
        </a>
        <a
          href={doneHref}
          className="inline-flex items-center gap-2 rounded-full border border-sky-400/60 bg-sky-500/10 px-4 py-2 text-xs font-semibold text-sky-200 transition-all hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-500/20 hover:text-white"
        >
          完了ログを見る
        </a>
      </div>
      <button
        type="button"
        onClick={() => onSignOut()}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-gradient px-4 py-2 text-sm font-semibold text-white shadow-button-primary transition duration-200 hover:-translate-y-0.5 hover:shadow-button-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
      >
        ログアウト
      </button>
    </div>
  )
}
