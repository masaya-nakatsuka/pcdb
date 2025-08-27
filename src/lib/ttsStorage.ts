export type TtsPage = {
  id: string
  name: string
  content: string
  createdAt: number
  updatedAt: number
}

export type TtsBook = {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  pages: TtsPage[]
}

type StorageShape = {
  version: number
  books: TtsBook[]
}

const STORAGE_KEY = 'tts:books:v1'

const now = () => Date.now()
const genId = () => `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`

function readStore(): StorageShape {
  if (typeof window === 'undefined') return { version: 1, books: [] }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { version: 1, books: [] }
    const parsed = JSON.parse(raw) as StorageShape
    if (!parsed.books) return { version: 1, books: [] }
    return parsed
  } catch {
    return { version: 1, books: [] }
  }
}

function writeStore(data: StorageShape) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {}
}

export function listBooks(): TtsBook[] {
  return readStore().books
}

export function getBook(bookId: string): TtsBook | undefined {
  return readStore().books.find(b => b.id === bookId)
}

export function createBook(name: string): TtsBook {
  const data = readStore()
  const book: TtsBook = { id: genId(), name: name || '新しいブック', createdAt: now(), updatedAt: now(), pages: [] }
  data.books.unshift(book)
  writeStore(data)
  return book
}

export function renameBook(bookId: string, name: string) {
  const data = readStore()
  const book = data.books.find(b => b.id === bookId)
  if (!book) return
  book.name = name
  book.updatedAt = now()
  writeStore(data)
}

export function deleteBook(bookId: string) {
  const data = readStore()
  data.books = data.books.filter(b => b.id !== bookId)
  writeStore(data)
}

export function createPage(bookId: string, name: string): TtsPage | undefined {
  const data = readStore()
  const book = data.books.find(b => b.id === bookId)
  if (!book) return
  const page: TtsPage = { id: genId(), name: name || '新しいページ', content: '', createdAt: now(), updatedAt: now() }
  book.pages.push(page)
  book.updatedAt = now()
  writeStore(data)
  return page
}

export function renamePage(bookId: string, pageId: string, name: string) {
  const data = readStore()
  const book = data.books.find(b => b.id === bookId)
  const page = book?.pages.find(p => p.id === pageId)
  if (!book || !page) return
  page.name = name
  page.updatedAt = now()
  book.updatedAt = now()
  writeStore(data)
}

export function deletePage(bookId: string, pageId: string) {
  const data = readStore()
  const book = data.books.find(b => b.id === bookId)
  if (!book) return
  book.pages = book.pages.filter(p => p.id !== pageId)
  book.updatedAt = now()
  writeStore(data)
}

export function getPage(bookId: string, pageId: string): TtsPage | undefined {
  const book = getBook(bookId)
  return book?.pages.find(p => p.id === pageId)
}

export function updatePageContent(bookId: string, pageId: string, content: string) {
  const data = readStore()
  const book = data.books.find(b => b.id === bookId)
  const page = book?.pages.find(p => p.id === pageId)
  if (!book || !page) return
  page.content = content
  page.updatedAt = now()
  book.updatedAt = now()
  writeStore(data)
}

// 初期ブック自動作成は行わない方針に変更


