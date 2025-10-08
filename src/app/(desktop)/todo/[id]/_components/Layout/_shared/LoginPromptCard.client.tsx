"use client"

type LoginPromptCardProps = {
  onSignIn: () => void
}

export default function LoginPromptCard({ onSignIn }: LoginPromptCardProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-page-gradient px-4 py-12">
      <div className="flex w-full max-w-[420px] flex-col gap-6 rounded-3xl border border-night-border bg-night-glass p-10 text-center text-frost-soft shadow-glass-xl backdrop-blur-[22px]">
        <div className="text-xs uppercase tracking-[0.4em] text-frost-subtle">Welcome back</div>
        <h1 className="bg-primary-gradient bg-clip-text text-4xl font-bold text-transparent">
          Specsy Todo
        </h1>
        <p className="text-sm leading-relaxed text-frost-muted">
          プロジェクトのタスクをまとめて管理するにはログインしてください。
        </p>
        <button
          type="button"
          onClick={onSignIn}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary-gradient px-5 py-3 text-sm font-semibold text-white shadow-button-primary transition duration-200 hover:-translate-y-0.5 hover:shadow-button-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
        >
          Googleでログイン
        </button>
      </div>
    </div>
  )
}
