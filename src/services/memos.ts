import type { PostgrestError } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";
import type { Memo } from "../types";

const mapMemo = (row: any): Memo => ({
  id: row.id,
  content: row.content,
  created_at: row.created_at,
  book_id: row.book_id,
  book_title: row.book_title,
  book_author: row.book_author,
  like_count: row.like_count ?? 0,
  liked_by_owner: row.liked_by_owner ?? false,
});

export const fetchRandomMemos = async (limit = 10): Promise<Memo[]> => {
  const { data, error } = await supabase.rpc("random_memos_with_count", {
    p_limit: limit,
  });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapMemo);
};

export const adjustMemoLike = async (
  memoId: string,
  delta: 1 | -1,
): Promise<number> => {
  const { data, error } = await supabase.rpc("adjust_memo_like", {
    p_memo_id: memoId,
    p_delta: delta,
  });

  if (error) {
    throw error;
  }

  const [row] = data ?? [];
  return row?.like_count ?? 0;
};

export const toggleOwnerMemoLike = async (
  memoId: string,
): Promise<{ liked_by_owner: boolean; like_count: number }> => {
  const { data, error } = await supabase.rpc("owner_toggle_memo_like", {
    p_memo_id: memoId,
  });

  if (error) {
    throw error;
  }

  const [row] = data ?? [];
  return {
    liked_by_owner: row?.liked_by_owner ?? false,
    like_count: row?.like_count ?? 0,
  };
};

export const createBookIfNeeded = async (
  title: string,
  author: string,
  ownerId: string,
): Promise<{ id: string }> => {
  const { data, error } = await supabase
    .from("books")
    .upsert(
      [
        {
          title,
          author,
          owner_id: ownerId,
        },
      ],
      {
        onConflict: "owner_id,title,author",
        ignoreDuplicates: false,
      },
    )
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return { id: data.id };
};

export const insertMemos = async (
  bookId: string,
  entries: string[],
  ownerId: string,
): Promise<{ count: number; errors?: PostgrestError[] }> => {
  if (!entries.length) {
    return { count: 0 };
  }

  const rows = entries.map((content) => ({
    book_id: bookId,
    content,
    owner_id: ownerId,
  }));

  const { error } = await supabase.from("memos").insert(rows);

  if (error) {
    return { count: 0, errors: [error] };
  }

  return { count: rows.length };
};
