import assert from 'node:assert/strict'
import test from 'node:test'

import { buildAuthCallbackUrl, normalizeAuthRedirect } from '../src/lib/authRedirect'
import { createLazySupabaseClient } from '../src/lib/createLazySupabaseClient'

test('login preserves supported internal routes, queries and fragments', () => {
  const allowed = [
    '/todo', '/todo/', '/todo/lp', '/todo/list-123', '/todo/list_123/done',
    '/todo/7a1368c0-62cd-49df-9450-3bde3d07da31/done?date=2026-10-16#timeline',
    '/note', '/note/', '/note?book=abc&page=def',
    '/todo?title=%E4%BB%8A%E6%97%A5&view=done',
    '/todo?next=javascript%3Aalert%281%29',
    '/note?source=https%3A%2F%2Fexample.com%2Fa%3Fb%3Dc#page-1',
  ]

  for (const value of allowed) {
    assert.equal(normalizeAuthRedirect(value), value)
  }
})

test('login rejects script schemes, foreign origins, normalization tricks and unsupported paths', () => {
  const rejected: unknown[] = [
    undefined, null, 42, {}, '', 'todo', '/admin', '/auth/callback',
    'javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'data:text/html,test',
    'https://evil.example/todo', 'https://specsy-hub.com/todo',
    '//evil.example/todo', '///evil.example/todo', '/\\evil.example/todo',
    '\\todo', '/todo\\..\\admin', '/todo//evil.example',
    ' /todo', '/todo ', '\n/todo', '/to\tdo', '/todo?x=\u0000',
    '/todo/../admin', '/todo/../note', '/admin/../todo', '/todo/./done',
    '/todo/%2e%2e/note', '/todo/%252e%252e/note', '/todo/%5cevil',
    '/%2ftodo', '/%74odo', '/todo%2f..%2fadmin', '%2Ftodo',
    '/todo-evil', '/note/evil', '/notebook', '/todo/id/done/extra',
    `/todo?${'a'.repeat(2048)}`,
  ]

  for (const value of rejected) {
    assert.equal(normalizeAuthRedirect(value), '/todo', String(value))
  }
})

test('OAuth callback construction keeps redirect queries inside one encoded parameter', () => {
  const target = '/todo/list-123/done?date=2026-10-16&redirect=https%3A%2F%2Fevil.example#timeline'
  const url = new URL(buildAuthCallbackUrl('https://specsy-hub.com', target))
  assert.equal(url.origin, 'https://specsy-hub.com')
  assert.equal(url.pathname, '/auth/callback')
  assert.deepEqual(Array.from(url.searchParams.entries()), [['redirect', target]])
  assert.equal(url.hash, '')
  assert.equal(normalizeAuthRedirect(url.searchParams.get('redirect')), target)

  const malicious = new URL(buildAuthCallbackUrl('https://specsy-hub.com', '//evil.example'))
  assert.equal(malicious.searchParams.get('redirect'), '/todo')
})

test('public Supabase configuration stays lazy and is reused without any network request', () => {
  let configReads = 0
  const client = createLazySupabaseClient(() => {
    configReads += 1
    return { url: 'https://security-test.supabase.co', anonKey: 'public-test-key' }
  })

  assert.equal(configReads, 0)
  const query = client.from('example').select('id')
  assert.ok(query)
  assert.equal(configReads, 1)
  client.from('another_example').select('id')
  assert.equal(configReads, 1)
})

test('missing public Supabase configuration fails only on use and does not expose values', () => {
  const client = createLazySupabaseClient(() => ({ url: undefined, anonKey: 'not-to-be-disclosed' }))
  assert.throws(() => client.from('example'), { message: 'Supabaseの公開接続設定がありません' })
})
