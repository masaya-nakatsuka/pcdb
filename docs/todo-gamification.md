# TODO Gamification Notes

## XP テーブル

```sql
create table if not exists public.todo_xp_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  todo_id uuid not null references public.todo_items (id) on delete cascade,
  xp integer not null check (xp >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, todo_id)
);

create index if not exists todo_xp_logs_user_idx on public.todo_xp_logs (user_id);
create index if not exists todo_xp_logs_todo_idx on public.todo_xp_logs (todo_id);
```

`unique (user_id, todo_id)` を設定して、同じ TODO を完了状態にするたびに新しい XP を付与しないようにしています。繰り返し完了させたい場合は制約を削除してください。

## XP 付与ルール

- 完了時に `25` 〜 `35` のランダム XP。
- 累計 XP によるレベル計算は指数関数的に上昇します（ベース 100、成長率 1.25）。
- レベルや XP の計算ロジックは `src/lib/todoXp.ts` に置いています。
