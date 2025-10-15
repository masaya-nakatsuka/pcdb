'use client'

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import type { Pluggable, PluggableList } from 'unified';

import { useAuth } from '@/hooks/useAuth';
import { supabaseTodo } from '@/lib/supabaseTodoClient';
import type { TodoItem } from '@/lib/todoTypes';
import { rollXpReward, summarizeLevelProgress, type LevelProgress } from '@/lib/todoXp';
import {
  todoCollectionSchema,
  todoGroupCollectionSchema,
  type TodoGroupDTO,
} from '@/features/todo/detail/types';
import XpProgressCard, { type RecentXpGain } from './XpProgressCard';
import CreateGroupModal from './CreateGroupModal';

type DetailShellClientProps = {
  listId: string;
};

type TodoGroupMap = Record<string, TodoGroupDTO>;

const STATUS_BADGE_STYLE: Record<TodoItem['status'], string> = {
  未着手: 'border-night-border bg-night-glass text-frost-soft',
  着手中: 'border-sky-400/70 bg-sky-500/15 text-sky-100',
  完了: 'border-emerald-400/70 bg-emerald-500/15 text-emerald-100',
};

const PRIORITY_META: Record<
  NonNullable<TodoItem['priority']> | 'none',
  { className: string; dotClass: string }
> = {
  high: {
    className: 'border-rose-400/70 bg-rose-500/15 text-rose-100',
    dotClass: 'bg-red-400',
  },
  medium: {
    className: 'border-amber-400/70 bg-amber-500/15 text-amber-100',
    dotClass: 'bg-amber-300',
  },
  low: {
    className: 'border-emerald-400/70 bg-emerald-500/15 text-emerald-100',
    dotClass: 'bg-emerald-300',
  },
  none: {
    className: 'border-night-border bg-night-glass text-frost-subtle',
    dotClass: 'bg-slate-500/60',
  },
};

type IconProps = {
  className?: string;
};

function withIconClass(className?: string) {
  return className ? `h-4 w-4 ${className}` : 'h-4 w-4';
}

// `remark-breaks` の型が古いため unified v11 に合わせてキャスト
const markdownPlugins: PluggableList = [
  remarkGfm as unknown as Pluggable,
  remarkBreaks as unknown as Pluggable,
];

export default function DetailShellClient({ listId }: DetailShellClientProps) {
  const { userId, loading: authLoading, signIn } = useAuth(supabaseTodo, {
    redirectPath: `/todo/${listId}`,
  });

  const [loading, setLoading] = useState(true);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [groups, setGroups] = useState<TodoGroupMap>({});
  const [xpLogsByTodo, setXpLogsByTodo] = useState<Record<string, number>>({});
  const [xpTotal, setXpTotal] = useState(0);
  const [xpProgress, setXpProgress] = useState<LevelProgress>(() => summarizeLevelProgress(0));
  const [recentXpGain, setRecentXpGain] = useState<RecentXpGain | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoGroupId, setNewTodoGroupId] = useState<string | 'none'>('none');
  const [creatingNewTodo, setCreatingNewTodo] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const createFormRef = useRef<HTMLDivElement | null>(null);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  const loadData = useCallback(
    async (uid: string) => {
      setLoading(true);
      setError(null);

      const [todosResult, groupsResult, xpLogsResult] = await Promise.all([
        supabaseTodo
          .from('todo_items')
          .select('*')
          .eq('user_id', uid)
          .eq('list_id', listId)
          .order('created_at', { ascending: false }),
        supabaseTodo
          .from('todo_groups')
          .select('*')
          .eq('user_id', uid)
          .eq('list_id', listId)
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: true }),
        supabaseTodo
          .from('todo_xp_logs')
          .select('todo_id, xp')
          .eq('user_id', uid),
      ]);

      if (todosResult.error) {
        setError('TODOの取得に失敗しました。');
        setLoading(false);
        return;
      }

      if (groupsResult.error) {
        setError('グループの取得に失敗しました。');
        setLoading(false);
        return;
      }

      const parsedTodos = todoCollectionSchema.parse(todosResult.data ?? []);
      const parsedGroups = todoGroupCollectionSchema.parse(groupsResult.data ?? []);

      const nextGroups: TodoGroupMap = {};
      for (const group of parsedGroups as TodoGroupDTO[]) {
        nextGroups[group.id] = group;
      }

      setTodos(parsedTodos as TodoItem[]);
      setGroups(nextGroups);
      if (xpLogsResult.error) {
        setError((prev) => prev ?? 'XPの取得に失敗しました。');
        setXpLogsByTodo({});
        setXpTotal(0);
        setXpProgress(summarizeLevelProgress(0));
      } else {
        const mapped: Record<string, number> = {};
        let totalXp = 0;
        for (const row of (xpLogsResult.data ?? []) as { todo_id?: string | null; xp?: number | null }[]) {
          if (row.todo_id) {
            mapped[row.todo_id] = row.xp ?? 0;
          }
          totalXp += row.xp ?? 0;
        }
        setXpLogsByTodo(mapped);
        setXpTotal(totalXp);
        setXpProgress(summarizeLevelProgress(totalXp));
      }
      setLoading(false);
    },
    [listId]
  );

  useEffect(() => {
    if (!userId) {
      setTodos([]);
      setGroups({});
      setLoading(false);
      return;
    }

    void loadData(userId);
  }, [userId, loadData]);

  const awardXpForTodoCompletion = useCallback(
    async (todo: TodoItem) => {
      if (!userId) return;
      if (xpLogsByTodo[todo.id]) return;

      const reward = rollXpReward();
      const { data, error } = await supabaseTodo
        .from('todo_xp_logs')
        .insert({
          user_id: userId,
          todo_id: todo.id,
          xp: reward,
        })
        .select('todo_id, xp')
        .single();

      if (!error && data) {
        const xpAwarded = data.xp ?? reward;
        setXpLogsByTodo((prev) => ({ ...prev, [data.todo_id]: xpAwarded }));
        setXpTotal((prev) => {
          const nextTotal = prev + xpAwarded;
          setXpProgress(summarizeLevelProgress(nextTotal));
          return nextTotal;
        });
        setRecentXpGain({ amount: xpAwarded, todoId: todo.id });
        return;
      }

      if (error?.code === '23505') {
        return;
      }

      console.error('Failed to award XP', error);
    },
    [userId, xpLogsByTodo]
  );

  const toggleExpanded = useCallback((todoId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(todoId)) {
        next.delete(todoId);
      } else {
        next.add(todoId);
      }
      return next;
    });
  }, []);

  const toggleCompletion = useCallback(
    async (todo: TodoItem) => {
      if (!userId || busyId || deletingId) return;

      setError(null);
      const nextStatus = todo.status === '完了' ? '未着手' : '完了';
      const nextDoneDate = nextStatus === '完了' ? new Date().toISOString() : null;

      setBusyId(todo.id);
      const { error: updateError } = await supabaseTodo
        .from('todo_items')
        .update({
          status: nextStatus,
          done_date: nextDoneDate,
          updated_at: new Date().toISOString(),
        })
        .eq('id', todo.id)
        .eq('user_id', userId)
        .eq('list_id', listId);

      if (!updateError) {
        setTodos((prev) =>
          prev.map((item) =>
            item.id === todo.id
              ? { ...item, status: nextStatus, done_date: nextDoneDate }
              : item
          )
        );
        if (nextStatus === '完了') {
          await awardXpForTodoCompletion(todo);
        }
      } else {
        setError('ステータスの更新に失敗しました。');
      }

      setBusyId(null);
    },
    [userId, busyId, deletingId, listId, awardXpForTodoCompletion]
  );

  const toggleInProgress = useCallback(
    async (todo: TodoItem) => {
      if (!userId || busyId || deletingId) return;

      setError(null);
      const nextStatus = todo.status === '着手中' ? '未着手' : '着手中';

      setBusyId(todo.id);
      const { error: updateError } = await supabaseTodo
        .from('todo_items')
        .update({
          status: nextStatus,
          done_date: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', todo.id)
        .eq('user_id', userId)
        .eq('list_id', listId);

      if (!updateError) {
        setTodos((prev) =>
          prev.map((item) =>
            item.id === todo.id ? { ...item, status: nextStatus, done_date: null } : item
          )
        );
      } else {
        setError('ステータスの更新に失敗しました。');
      }

      setBusyId(null);
    },
    [userId, busyId, deletingId, listId]
  );

  const deleteTodo = useCallback(
    async (todoId: string) => {
      if (!userId || deletingId || busyId) return;

      setError(null);
      setDeletingId(todoId);
      const { error: deleteError } = await supabaseTodo
        .from('todo_items')
        .delete()
        .eq('id', todoId)
        .eq('user_id', userId)
        .eq('list_id', listId);

      if (!deleteError) {
        setTodos((prev) => prev.filter((item) => item.id !== todoId));
        setExpandedIds((prev) => {
          if (!prev.has(todoId)) return prev;
          const next = new Set(prev);
          next.delete(todoId);
          return next;
        });
      } else {
        setError('削除に失敗しました。');
      }

      setDeletingId(null);
    },
    [userId, deletingId, busyId, listId]
  );

  const openCreateForm = useCallback(() => {
    setShowCreateForm(true);
    setCreateError(null);
    setNewTodoGroupId('none');
  }, []);

  const cancelCreateForm = useCallback(() => {
    setShowCreateForm(false);
    setNewTodoTitle('');
    setCreateError(null);
    setNewTodoGroupId('none');
  }, []);

  const handleCreateTodo = useCallback(async () => {
    if (!userId) return;
    const title = newTodoTitle.trim();
    if (!title) {
      setCreateError('タイトルを入力してください。');
      return;
    }

    setCreatingNewTodo(true);
    setCreateError(null);
    try {
      const timestamp = new Date().toISOString();
      const { data, error: insertError } = await supabaseTodo
        .from('todo_items')
        .insert({
          user_id: userId,
          list_id: listId,
          title,
          status: '未着手',
          priority: null,
          group_id: newTodoGroupId === 'none' ? null : newTodoGroupId,
          tags: [],
          markdown_text: null,
          created_at: timestamp,
          updated_at: timestamp,
          done_date: null,
        })
        .select('*')
        .single();

      if (insertError || !data) {
        setCreateError('TODOの作成に失敗しました。');
        return;
      }

      const parsed = todoCollectionSchema.parse([data])[0] as TodoItem;
      const appliedGroupId = newTodoGroupId === 'none' ? null : newTodoGroupId;

      if (appliedGroupId) {
        const { error: updateGroupError } = await supabaseTodo
          .from('todo_items')
          .update({ group_id: appliedGroupId, updated_at: new Date().toISOString() })
          .eq('id', parsed.id)
          .eq('user_id', userId)
          .eq('list_id', listId);

        if (updateGroupError) {
          console.error('Failed to persist group selection', updateGroupError);
        }
      }

      const nextTodo: TodoItem = {
        ...parsed,
        group_id: appliedGroupId,
      };
      setTodos((prev) => [nextTodo, ...prev]);
      setNewTodoTitle('');
      setShowCreateForm(false);
      setNewTodoGroupId('none');
    } catch (err) {
      console.error('Failed to create todo', err);
      setCreateError('TODOの作成に失敗しました。');
    } finally {
      setCreatingNewTodo(false);
    }
  }, [userId, listId, newTodoTitle, newTodoGroupId]);

  const sortedTodos = useMemo(() => {
    return todos.slice().sort((a, b) => {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bTime - aTime;
    });
  }, [todos]);

  const visibleTodos = useMemo(() => {
    if (showCompleted) return sortedTodos;
    return sortedTodos.filter((todo) => todo.status !== '完了');
  }, [sortedTodos, showCompleted]);

  const groupList = useMemo(() => {
    return Object.values(groups).sort((a, b) => {
      const orderDiff = (a.sort_order ?? 0) - (b.sort_order ?? 0);
      if (orderDiff !== 0) return orderDiff;
      return (a.created_at ?? '').localeCompare(b.created_at ?? '');
    });
  }, [groups]);

  const openGroupModal = useCallback(() => {
    setIsGroupModalOpen(true);
  }, []);

  const closeGroupModal = useCallback(() => {
    setIsGroupModalOpen(false);
  }, []);

  const handleCreateGroup = useCallback(
    async (name: string, color: string | null) => {
      if (!userId) throw new Error('ユーザー情報が取得できませんでした');

      const payload = {
        user_id: userId,
        list_id: listId,
        name,
        color,
        sort_order: groupList.length,
        created_at: new Date().toISOString()
      };

      const { data, error: insertError } = await supabaseTodo
        .from('todo_groups')
        .insert(payload)
        .select('*')
        .single();

      if (insertError || !data) {
        throw insertError ?? new Error('グループの作成に失敗しました。');
      }

      const parsedGroup = todoGroupCollectionSchema.parse([data])[0] as TodoGroupDTO;
      setGroups((prev) => ({ ...prev, [parsedGroup.id]: parsedGroup }));
      setNewTodoGroupId(parsedGroup.id);
    },
    [userId, listId, groupList.length]
  );

  const statusSummary = useMemo(() => {
    const base: Record<TodoItem['status'], number> = { 未着手: 0, 着手中: 0, 完了: 0 };

    for (const todoItem of todos) {
      base[todoItem.status] += 1;
    }

    const total = todos.length;
    const completionRate =
      total === 0 ? 0 : Math.round((base['完了'] / total) * 100);

    return {
      ...base,
      total,
      completionRate,
    };
  }, [todos]);

  const focusTodo = useMemo(
    () => sortedTodos.find((todo) => todo.status !== '完了'),
    [sortedTodos]
  );

  const xpProgressPercent = useMemo(
    () => Math.min(100, Math.max(0, Math.round(xpProgress.progressToNext * 100))),
    [xpProgress]
  );

  const xpNeededForNextLevel = useMemo(
    () => Math.max(0, xpProgress.xpForNextLevel - xpProgress.xpIntoLevel),
    [xpProgress]
  );

  useEffect(() => {
    if (!recentXpGain) return;
    const timer = window.setTimeout(() => setRecentXpGain(null), 4000);
    return () => window.clearTimeout(timer);
  }, [recentXpGain]);

  useEffect(() => {
    if (!showCreateForm) return;
    const target = createFormRef.current;
    if (!target) return;
    const handle = window.requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return () => window.cancelAnimationFrame(handle);
  }, [showCreateForm]);

  if (authLoading || loading) {
    return (
      <section className='flex flex-col gap-4 p-4'>
        <LoadingPlaceholder />
      </section>
    );
  }

  if (!userId) {
    return (
      <section className='flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 py-10 text-center'>
        <div className='relative w-full max-w-sm overflow-hidden rounded-3xl border border-night-border bg-night-glass-soft px-6 py-8 text-frost-soft shadow-glass-xl'>
          <div
            aria-hidden
            className='pointer-events-none absolute inset-x-0 top-0 h-44 bg-primary-gradient opacity-30 blur-3xl'
          />
          <div className='relative z-10 space-y-4'>
            <p className='text-sm font-medium'>Todo を表示するにはログインが必要です。</p>
            <p className='text-xs text-frost-subtle'>
              Google アカウントでログインして、進捗をモバイルでも確認しましょう。
            </p>
            <button
              type='button'
              className='inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-button-primary transition hover:shadow-button-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300'
              onClick={() => void signIn()}
            >
              <span className='text-base'>🔐</span>
              <span>Googleでログイン</span>
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className='flex flex-col gap-5 p-4 pb-16'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <Link
          href="/todo"
          className='inline-flex items-center gap-2 rounded-full border border-night-border bg-night-highlight px-4 py-2 text-xs font-semibold text-frost-soft transition hover:border-sky-400/40 hover:text-sky-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300'
        >
          <span aria-hidden>←</span>
          <span>一覧に戻る</span>
        </Link>
        <Link
          href={`/todo/${listId}/done`}
          className='inline-flex items-center gap-2 rounded-full border border-sky-400/60 bg-sky-500/10 px-4 py-2 text-xs font-semibold text-sky-100 transition hover:border-sky-300 hover:bg-sky-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300'
        >
          <span aria-hidden>🗓️</span>
          <span>完了ログを見る</span>
        </Link>
      </div>

      <div className='relative overflow-hidden rounded-3xl border border-night-border bg-night-glass-soft px-5 py-6 shadow-glass-xl'>
        <div
          aria-hidden
          className='pointer-events-none absolute inset-0 bg-primary-gradient opacity-25 blur-[120px]'
        />
        <div className='relative z-10 space-y-5'>
          <div className='flex items-start justify-between gap-4'>
            <div>
              <p className='text-[11px] uppercase tracking-[0.3em] text-frost-subtle'>
                Progress
              </p>
              <p className='mt-2 text-3xl font-semibold text-frost-soft'>
                {statusSummary.completionRate}%
              </p>
              <p className='mt-1 text-xs text-frost-muted'>
                完了 {statusSummary['完了']} / {statusSummary.total}
              </p>
            </div>
            <div className='flex flex-col items-end gap-2 text-xs text-frost-subtle'>
              <StatPill label='未着手' value={statusSummary['未着手']} accent='from-slate-400 to-slate-200' />
              <StatPill label='着手中' value={statusSummary['着手中']} accent='from-sky-400 to-cyan-300' />
              <StatPill label='完了' value={statusSummary['完了']} accent='from-emerald-400 to-teal-300' />
            </div>
          </div>

          <div
            role='progressbar'
            aria-label='完了率'
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={statusSummary.completionRate}
            className='relative h-2 w-full overflow-hidden rounded-full border border-night-border bg-night-glass-soft'
          >
            <div
              className='h-full rounded-full bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-300 transition-[width] duration-500 ease-out'
              style={{ width: `${Math.min(statusSummary.completionRate, 100)}%` }}
            />
          </div>

          {focusTodo && (
            <div className='relative flex items-center justify-between gap-3 rounded-2xl border border-night-border bg-night-glass px-4 py-3 text-xs text-frost-soft'>
              <div className='flex min-w-0 items-center gap-2'>
                <span className='text-lg'>✨</span>
                <span className='text-[10px] uppercase tracking-[0.28em] text-frost-muted'>
                  Focus
                </span>
                <span className='break-words text-sm font-medium text-frost-soft'>
                  {focusTodo.title}
                </span>
              </div>
              <span className='shrink-0 rounded-full border border-night-border bg-night-glass px-2 py-1 text-[11px] text-frost-muted'>
                {focusTodo.status}
              </span>
            </div>
          )}
        </div>
      </div>
      <XpProgressCard
        level={xpProgress.level}
        xpTotal={xpTotal}
        xpNeededForNextLevel={xpNeededForNextLevel}
        xpProgressPercent={xpProgressPercent}
        recentXpGain={recentXpGain}
      />

      {error && (
        <div className='relative overflow-hidden rounded-2xl border border-rose-500/60 bg-rose-500/10 px-4 py-3 text-sm text-rose-100'>
          <div
            aria-hidden
            className='absolute inset-0 bg-gradient-to-r from-rose-500/25 via-transparent to-orange-500/15 opacity-80'
          />
          <div className='relative z-10 flex items-center gap-3'>
            <span className='flex h-8 w-8 items-center justify-center rounded-full border border-rose-400/60 bg-rose-500/20 text-sm font-semibold text-rose-100'>
              !
            </span>
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className='flex justify-end'>
        <button
          type='button'
          onClick={() => setShowCompleted((prev) => !prev)}
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
            showCompleted
              ? 'border-sky-400/60 bg-sky-500/15 text-sky-100 hover:border-sky-300 hover:bg-sky-500/25'
              : 'border-night-border bg-night-highlight text-frost-soft hover:border-sky-400/40 hover:text-sky-100'
          } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300`}
        >
          {showCompleted ? '完了タスクを非表示' : '完了タスクを表示'}
        </button>
      </div>

      {visibleTodos.length === 0 ? (
        <div className='rounded-3xl border border-night-border bg-night-glass-soft px-6 py-12 text-center text-sm text-frost-subtle'>
          <p className='text-base font-semibold text-frost-soft'>表示できる Todo はありません。</p>
          <p className='mt-2 text-xs text-frost-subtle'>
            新しいタスクを追加すると、ここにモダンなカードで表示されます。
          </p>
        </div>
      ) : (
        <div className='space-y-4'>
          {visibleTodos.map((todo) => (
            <MobileTodoRow
              key={todo.id}
              todo={todo}
              group={todo.group_id ? groups[todo.group_id] : undefined}
              expanded={expandedIds.has(todo.id)}
              isBusy={busyId === todo.id}
              isDeleting={deletingId === todo.id}
              onToggleExpanded={toggleExpanded}
              onToggleCompletion={toggleCompletion}
              onToggleInProgress={toggleInProgress}
              onDelete={deleteTodo}
            />
          ))}
        </div>
      )}

      {showCreateForm ? (
        <div
          ref={createFormRef}
          className='rounded-3xl border border-night-border bg-night-glass-soft px-5 py-6 text-sm text-frost-soft shadow-glass-xl'
        >
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <h2 className='text-base font-semibold text-frost-soft'>新しい Todo を追加</h2>
              <button
                type='button'
                className='text-xs text-frost-subtle underline-offset-2 hover:underline'
                onClick={cancelCreateForm}
              >
                閉じる
              </button>
            </div>
            <div className='space-y-2'>
              <label className='block text-xs text-frost-muted' htmlFor='mobile-new-todo-title'>
                タイトル
              </label>
              <input
                id='mobile-new-todo-title'
                value={newTodoTitle}
                onChange={(event) => {
                  if (createError) setCreateError(null);
                  setNewTodoTitle(event.target.value);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                    event.preventDefault();
                    void handleCreateTodo();
                  }
                }}
                placeholder='例: 仕様書の確認'
                className='w-full rounded-2xl border border-night-border bg-night-glass px-3 py-2 text-sm text-frost-soft placeholder:text-frost-subtle focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400'
                disabled={creatingNewTodo}
              />
              {createError && <p className='text-xs text-rose-300'>{createError}</p>}
            </div>
            <div className='space-y-2'>
              <div className='flex items-center justify-between text-xs text-frost-muted'>
                <label className='block' htmlFor='mobile-new-todo-group'>
                  グループ
                </label>
                <button
                  type='button'
                  onClick={openGroupModal}
                  className='text-[11px] text-sky-200 underline-offset-2 hover:underline'
                  disabled={creatingNewTodo}
                >
                  ＋ グループを作成
                </button>
              </div>
              <select
                id='mobile-new-todo-group'
                value={newTodoGroupId}
                onChange={(event) => setNewTodoGroupId(event.target.value as typeof newTodoGroupId)}
                className='w-full rounded-2xl border border-night-border bg-night-glass px-3 py-2 text-sm text-frost-soft focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400'
                disabled={creatingNewTodo}
              >
                <option value='none'>グループなし</option>
                {groupList.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.emoji ? `${group.emoji} ` : ''}{group.name}
                  </option>
                ))}
              </select>
            </div>
            <div className='flex flex-wrap gap-3'>
              <button
                type='button'
                onClick={() => void handleCreateTodo()}
                className='inline-flex items-center gap-2 rounded-full bg-primary-gradient px-4 py-2 text-xs font-semibold text-white shadow-button-primary transition hover:shadow-button-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 disabled:cursor-not-allowed disabled:opacity-60'
                disabled={creatingNewTodo || newTodoTitle.trim().length === 0}
              >
                {creatingNewTodo ? '作成中…' : '作成する'}
              </button>
              <button
                type='button'
                onClick={cancelCreateForm}
                className='inline-flex items-center gap-2 rounded-full border border-night-border bg-night-highlight px-4 py-2 text-xs font-semibold text-frost-soft transition hover:border-rose-300/60 hover:text-rose-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-300'
                disabled={creatingNewTodo}
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type='button'
          onClick={openCreateForm}
          className='sticky bottom-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-sky-400/50 bg-primary-gradient px-4 py-3 text-sm font-semibold text-white shadow-button-primary transition hover:shadow-button-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300'
        >
          <span aria-hidden>＋</span>
          <span>新しい Todo を作成</span>
        </button>
      )}

      <CreateGroupModal
        isOpen={isGroupModalOpen}
        onClose={closeGroupModal}
        onCreate={handleCreateGroup}
      />
    </section>
  );
}

type MobileTodoRowProps = {
  todo: TodoItem;
  group?: TodoGroupDTO;
  expanded: boolean;
  isBusy: boolean;
  isDeleting: boolean;
  onToggleExpanded: (todoId: string) => void;
  onToggleCompletion: (todo: TodoItem) => void;
  onToggleInProgress: (todo: TodoItem) => void;
  onDelete: (todoId: string) => void;
};

function MobileTodoRow({
  todo,
  group,
  expanded,
  isBusy,
  isDeleting,
  onToggleExpanded,
  onToggleCompletion,
  onToggleInProgress,
  onDelete,
}: MobileTodoRowProps) {
  const isCompleted = todo.status === '完了';
  const isInProgress = todo.status === '着手中';
  const priorityKey: NonNullable<TodoItem['priority']> | 'none' = todo.priority ?? 'none';
  const priorityMeta = PRIORITY_META[priorityKey];

  const createdLabel = todo.created_at
    ? new Date(todo.created_at).toLocaleString('ja-JP', { dateStyle: 'short', timeStyle: 'short' })
    : '-';
  const doneLabel = todo.done_date
    ? new Date(todo.done_date).toLocaleString('ja-JP', { dateStyle: 'short', timeStyle: 'short' })
    : '-';

  const groupBadgeStyle =
    group && group.color?.startsWith('#')
      ? {
          backgroundColor: `${group.color}15`,
          borderColor: `${group.color}4d`,
          color: group.color,
        }
      : undefined;

  return (
    <article className={`group relative overflow-hidden rounded-3xl border border-night-border bg-night-glass-soft transition-all duration-300 ${isCompleted ? 'opacity-80' : 'hover:border-sky-400/80 hover:shadow-card-hover'}`}>
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-500/10 via-transparent to-purple-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100'
      />
      <div className='relative flex items-center gap-4 p-4'>
        <div className='flex items-center gap-2'>
          <button
            type='button'
            className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-200 ${
              isCompleted
                ? 'border-emerald-300/80 bg-emerald-500/25 text-emerald-100 shadow-button-secondary'
                : 'border-night-border bg-night-glass text-frost-subtle hover:border-emerald-300/70 hover:text-emerald-100 hover:shadow-button-secondary'
            } ${isBusy || isDeleting ? 'pointer-events-none opacity-60' : 'active:scale-95'}`}
            onClick={() => onToggleCompletion(todo)}
            disabled={isBusy || isDeleting}
            aria-pressed={isCompleted}
            aria-label={isCompleted ? '未着手に戻す' : '完了にする'}
          >
            <CheckIcon />
          </button>
          <button
            type='button'
            className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-200 ${
              isInProgress
                ? 'border-sky-400/80 bg-sky-500/25 text-sky-100 shadow-button-secondary'
                : 'border-night-border bg-night-glass text-frost-subtle hover:border-sky-400/70 hover:text-sky-100 hover:shadow-button-secondary'
            } ${isBusy || isDeleting ? 'pointer-events-none opacity-60' : 'active:scale-95'}`}
            onClick={() => onToggleInProgress(todo)}
            disabled={isBusy || isDeleting}
            aria-pressed={isInProgress}
            aria-label={isInProgress ? '着手中を解除' : '着手中にする'}
          >
            <FlagIcon />
          </button>
        </div>

        <div className='flex min-w-0 flex-1 flex-col gap-2'>
          <div className='flex flex-wrap items-center gap-2 text-[11px]'>
            <span className={`h-2 w-2 rounded-full ${priorityMeta.dotClass}`} aria-hidden />
            <span
              className='inline-flex items-center gap-1 rounded-full border border-night-border bg-night-glass px-2.5 py-1 text-frost-soft'
              style={groupBadgeStyle}
            >
              {group?.emoji && <span aria-hidden>{group.emoji}</span>}
              <span>{group?.name ?? '未所属'}</span>
            </span>
          </div>
          <p
            className={`break-words text-sm font-semibold leading-relaxed ${
              isCompleted ? 'text-frost-muted line-through decoration-frost-subtle/60' : 'text-frost-soft'
            }`}
          >
            {todo.title}
          </p>

          {todo.tags.length > 0 && (
            <div className='flex flex-wrap gap-2 text-[11px] text-sky-100'>
              {todo.tags.map((tag) => (
                <span
                  key={`${todo.id}-${tag}`}
                  className='rounded-full border border-sky-400/40 bg-sky-500/10 px-2.5 py-0.5'
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className='flex shrink-0 items-start'>
          <button
            type='button'
            aria-expanded={expanded}
            aria-label={expanded ? '詳細を閉じる' : '詳細を開く'}
            className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-200 ${
              expanded
                ? 'border-sky-400/80 bg-sky-500/25 text-sky-100 shadow-button-secondary'
                : 'border-night-border bg-night-glass text-frost-subtle hover:border-sky-400/70 hover:text-sky-100 hover:shadow-button-secondary'
            } ${isDeleting ? 'pointer-events-none opacity-60' : 'active:scale-95'}`}
            onClick={() => onToggleExpanded(todo.id)}
            disabled={isDeleting}
          >
            {expanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className='relative space-y-3 border-t border-night-border/70 bg-night-glass-soft px-4 pb-4 pt-4 text-sm text-frost-soft'>
          <div className='grid grid-cols-2 gap-3 text-xs text-frost-subtle'>
            <div className='rounded-2xl border border-night-border bg-night-glass px-3 py-2'>
              <div className='text-[10px] uppercase tracking-[0.25em] text-frost-muted'>作成</div>
              <div className='mt-1 text-sm text-frost-soft'>{createdLabel}</div>
            </div>
            <div className='rounded-2xl border border-night-border bg-night-glass px-3 py-2'>
              <div className='text-[10px] uppercase tracking-[0.25em] text-frost-muted'>完了</div>
              <div className='mt-1 text-sm text-frost-soft'>{doneLabel}</div>
            </div>
          </div>

          <div className='rounded-2xl border border-night-border bg-night-glass-soft px-4 py-3 text-sm leading-relaxed text-frost-soft shadow-inner'>
            {todo.markdown_text ? (
              <div className='prose prose-invert max-w-none text-sm [&_code]:rounded [&_code]:bg-night-glass [&_code]:px-1.5 [&_code]:py-0.5 [&_li]:pl-4'>
                <ReactMarkdown remarkPlugins={markdownPlugins}>
                  {todo.markdown_text}
                </ReactMarkdown>
              </div>
            ) : (
              <p className='italic text-frost-subtle'>詳細はまだありません。</p>
            )}
          </div>

          <div className='flex justify-end pt-1'>
            <button
              type='button'
              className={`inline-flex items-center gap-2 rounded-full bg-destructive-gradient px-4 py-2 text-xs font-semibold text-white shadow-button-destructive transition hover:shadow-button-destructive-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-300 ${
                isDeleting || isBusy ? 'pointer-events-none opacity-60' : ''
              }`}
              onClick={() => onDelete(todo.id)}
              disabled={isDeleting || isBusy}
            >
              <TrashIcon />
              <span>削除</span>
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

function LoadingPlaceholder() {
  return (
    <>
      <div className='relative overflow-hidden rounded-3xl border border-night-border bg-night-glass-soft px-5 py-6'>
        <div
          aria-hidden
          className='pointer-events-none absolute inset-0 bg-primary-gradient opacity-20 blur-[120px]'
        />
        <div className='relative z-10 space-y-3'>
          <div className='h-4 w-28 rounded-full bg-night-glass/80 animate-pulse' />
          <div className='h-3 w-48 rounded-full bg-night-glass/70 animate-pulse' />
          <div className='h-2 w-full rounded-full bg-night-glass/60 animate-pulse' />
        </div>
      </div>
      <div className='space-y-3'>
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className='h-24 w-full rounded-3xl border border-night-border bg-night-glass-soft animate-pulse'
          />
        ))}
      </div>
    </>
  );
}

type StatPillProps = {
  label: string;
  value: number;
  accent: string;
};

function StatPill({ label, value, accent }: StatPillProps) {
  return (
    <div className='inline-flex items-center gap-2 rounded-full border border-night-border bg-night-glass px-3 py-1.5'>
      <span className={`h-2 w-2 rounded-full bg-gradient-to-r ${accent}`} aria-hidden />
      <span className='text-[11px] text-frost-muted'>{label}</span>
      <span className='text-sm font-semibold text-frost-soft'>{value}</span>
    </div>
  );
}

function CheckIcon({ className }: IconProps) {
  return (
    <svg
      viewBox='0 0 20 20'
      fill='none'
      className={withIconClass(className)}
      stroke='currentColor'
      strokeWidth='1.8'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden
    >
      <path d='M5 10.5 8.2 14l6.8-8' />
    </svg>
  );
}

function FlagIcon({ className }: IconProps) {
  return (
    <svg
      viewBox='0 0 20 20'
      fill='none'
      className={withIconClass(className)}
      stroke='currentColor'
      strokeWidth='1.6'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden
    >
      <path d='M5 3.5v13' />
      <path d='M6 4h8.5l-2.2 3 2.2 3H6' />
    </svg>
  );
}

function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg
      viewBox='0 0 20 20'
      fill='none'
      className={withIconClass(className)}
      stroke='currentColor'
      strokeWidth='1.8'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden
    >
      <path d='m5.5 7.75 4.5 4.5 4.5-4.5' />
    </svg>
  );
}

function ChevronUpIcon({ className }: IconProps) {
  return (
    <svg
      viewBox='0 0 20 20'
      fill='none'
      className={withIconClass(className)}
      stroke='currentColor'
      strokeWidth='1.8'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden
    >
      <path d='m5.5 12.25 4.5-4.5 4.5 4.5' />
    </svg>
  );
}

function TrashIcon({ className }: IconProps) {
  return (
    <svg
      viewBox='0 0 20 20'
      fill='none'
      className={withIconClass(className)}
      stroke='currentColor'
      strokeWidth='1.6'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden
    >
      <path d='M4.5 6.5h11' />
      <path d='M8.5 3.5h3a1.5 1.5 0 0 1 1.5 1.5v1.5h-6V5a1.5 1.5 0 0 1 1.5-1.5Z' />
      <path d='M6.5 6.5v8a1.5 1.5 0 0 0 1.5 1.5h4a1.5 1.5 0 0 0 1.5-1.5v-8' />
    </svg>
  );
}
