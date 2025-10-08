"use client"

type HeaderProps = {
  onSignOut: () => Promise<void> | void
}

export default function Header({ onSignOut }: HeaderProps) {
  return (
    <div className="flex items-center justify-between rounded-3xl border border-night-border bg-night-glass px-6 py-4 text-frost-soft shadow-glass-xl backdrop-blur-[22px]">
      <a
        href="/todo"
        className="text-sm text-frost-soft transition-colors hover:text-white"
      >
        ← リスト一覧へ
      </a>
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
