export type Memo = {
  id: string;
  content: string;
  created_at: string;
  book_id: string;
  book_title: string;
  book_author: string;
  like_count: number;
  liked_by_owner: boolean;
};

export type Book = {
  id: string;
  title: string;
  author: string;
  created_at: string;
};

export type MemoInput = {
  bookId: string;
  content: string;
};

export type MemoFormPayload = {
  author: string;
  title: string;
  entries: string[];
};

export type AuthState = {
  isAuthenticated: boolean;
  email?: string;
};
