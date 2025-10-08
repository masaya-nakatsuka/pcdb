'use client'

import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';

import { useAuth } from '@/hooks/useAuth';
import { supabaseTodo } from '@/lib/supabaseTodoClient';
import type { TodoItem } from '@/lib/todoTypes';
import {
  todoCollectionSchema,
  todoGroupCollectionSchema,
  type TodoGroupDTO,
} from '@/features/todo/detail/types';

type DetailShellClientProps = {
  listId: string;
};

type TodoGroupMap = Record<string, TodoGroupDTO>;

const PRIORITY_DOT_COLOR: Record<NonNullable<TodoItem['priority']> | 'none', string> = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-emerald-500',
  none: 'bg-slate-500/60',
};

export default function DetailShellClient({ listId }: DetailShellClientProps) {
  const { userId, loading: authLoading, signIn } = useAuth(supabaseTodo, {
    redirectPath: `/todo/${listId}`,
  });

  const [loading, setLoading] = useState(true);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [groups, setGroups] = useState<TodoGroupMap>({});
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = useCallback(
    async (uid: string) => {
      setLoading(true);
      setError(null);

      const [todosResult, groupsResult] = await Promise.all([
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
      } else {
        setError('ステータスの更新に失敗しました。');
      }

      setBusyId(null);
    },
    [userId, busyId, deletingId, listId]
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

  const sortedTodos = useMemo(() => {
    return todos.slice().sort((a, b) => {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bTime - aTime;
    });
  }, [todos]);

  if (authLoading || loading) {
    return (
      <div className='p-6 text-center text-sm text-frost-subtle'>
        読み込み中です...
      </div>
    );
  }

  if (!userId) {
    return (
      <div className='flex flex-col items-center gap-4 p-6 text-center'>
        <p className='text-sm text-frost-subtle'>Todo を表示するにはログインが必要です。</p>
        <button
          type='button'
          className='rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-sky-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300'
          onClick={() => void signIn()}
        >
          Googleでログイン
        </button>
      </div>
    );
  }

  return (
    <section className='flex flex-col gap-4 p-4'>
      {error && (
        <div className='rounded-lg border border-rose-400/60 bg-rose-500/10 px-4 py-3 text-sm text-rose-200'>
          {error}
        </div>
      )}

      {sortedTodos.length === 0 ? (
        <p className='text-center text-sm text-frost-subtle'>表示できる Todo はありません。</p>
      ) : (
        <div className='space-y-3'>
          {sortedTodos.map((todo) => (
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
  const createdLabel = todo.created_at
    ? new Date(todo.created_at).toLocaleString('ja-JP', { dateStyle: 'short', timeStyle: 'short' })
    : '-';
  const doneLabel = todo.done_date
    ? new Date(todo.done_date).toLocaleString('ja-JP', { dateStyle: 'short', timeStyle: 'short' })
    : '-';

  const groupStyle =
    group && group.color?.startsWith('#')
      ? {
          backgroundColor: `${group.color}1a`,
          borderColor: `${group.color}4d`,
          color: group.color,
        }
      : undefined;

  return (
    <div className='overflow-hidden rounded-2xl border border-night-border-muted bg-night-surface-soft shadow-sm'>
      <div className='flex items-center gap-3 p-4'>
        <div className='flex items-center gap-1 pt-1'>
          <button
            type='button'
            className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold transition-all ${
              isCompleted
                ? 'border-emerald-300 bg-emerald-500/20 text-emerald-200'
                : 'border-night-border bg-night-glass text-frost-subtle hover:border-emerald-300 hover:text-emerald-200'
            } ${isBusy ? 'cursor-not-allowed opacity-60' : ''}`}
            onClick={() => onToggleCompletion(todo)}
            disabled={isBusy || isDeleting}
            aria-pressed={isCompleted}
          >
            ✓
          </button>
          <button
            type='button'
            className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs transition-colors ${
              isInProgress
                ? 'border-sky-400/70 bg-sky-500/25 text-sky-200'
                : 'border-night-border bg-night-glass text-frost-soft hover:border-sky-400/60 hover:text-sky-200'
            } ${isBusy ? 'cursor-not-allowed opacity-60' : ''}`}
            onClick={() => onToggleInProgress(todo)}
            disabled={isBusy || isDeleting}
            aria-pressed={isInProgress}
          >
            {isInProgress ? '🚩' : '⚑'}
          </button>
        </div>

        <div className='flex min-w-0 flex-1 flex-col gap-1'>
          <div className='flex flex-wrap items-center gap-2 text-xs'>
            <span
              className='inline-flex items-center gap-1 rounded-full border border-night-border bg-night-glass px-2.5 py-1 font-semibold text-frost-soft'
              style={groupStyle}
            >
              {group?.emoji && <span>{group.emoji}</span>}
              <span>{group?.name ?? '未所属'}</span>
            </span>
            <span className={`h-2.5 w-2.5 rounded-full ${PRIORITY_DOT_COLOR[priorityKey]}`} />
          </div>
          <p
            className={`break-words text-sm font-medium leading-relaxed ${
              isCompleted ? 'text-frost-muted line-through' : 'text-frost-soft'
            }`}
          >
            {todo.title}
          </p>
          {todo.tags.length > 0 && (
            <div className='flex flex-wrap gap-1 text-[11px] text-sky-200'>
              {todo.tags.map((tag) => (
                <span
                  key={`${todo.id}-${tag}`}
                  className='rounded-full bg-sky-500/10 px-2 py-0.5 text-sky-200'
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className='flex flex-col items-end gap-2'>
          <button
            type='button'
            aria-expanded={expanded}
            aria-label={expanded ? '詳細を閉じる' : '詳細を開く'}
            className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold transition ${
              expanded
                ? 'border-sky-400 bg-sky-500/20 text-sky-200'
                : 'border-night-border bg-night-glass text-frost-soft hover:border-sky-400 hover:text-sky-200'
            } ${isDeleting ? 'cursor-not-allowed opacity-60' : ''}`}
            onClick={() => onToggleExpanded(todo.id)}
            disabled={isDeleting}
          >
            {expanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {expanded && (
        <div className='space-y-3 border-t border-night-border-muted px-4 py-4 text-sm text-frost-soft'>
          <div className='flex flex-wrap gap-4 text-xs text-frost-subtle'>
            <span className='flex items-center gap-1.5'>
              <span className='font-semibold text-frost-soft'>作成:</span>
              <span>{createdLabel}</span>
            </span>
            <span className='flex items-center gap-1.5'>
              <span className='font-semibold text-frost-soft'>完了:</span>
              <span>{doneLabel}</span>
            </span>
          </div>
          <div className='prose prose-invert max-w-none text-sm [&_code]:rounded [&_code]:bg-night-glass [&_code]:px-1.5 [&_code]:py-0.5 [&_li]:list-disc [&_li]:pl-4'>
            {todo.markdown_text ? (
              <ReactMarkdown>{todo.markdown_text}</ReactMarkdown>
            ) : (
              <p className='italic text-frost-subtle'>詳細はまだありません。</p>
            )}
          </div>
          <div className='flex justify-end pt-1'>
            <button
              type='button'
              className='flex items-center gap-2 rounded-full border border-rose-400/50 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-200 transition hover:border-rose-400/70 hover:bg-rose-500/20'
              onClick={() => onDelete(todo.id)}
              disabled={isDeleting || isBusy}
            >
              🗑<span>削除</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
