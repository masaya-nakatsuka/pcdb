export interface NoteBook {
  id: string
  user_id: string
  title: string
  created_at: string | null
  updated_at: string | null
}

export interface NotePage {
  id: string
  user_id: string
  book_id: string
  title: string
  content: string | null
  created_at: string | null
  updated_at: string | null
}


