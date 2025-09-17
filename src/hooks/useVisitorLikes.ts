import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "memo-visitor-likes";

type LikeMap = Record<string, boolean>;

const readStorage = (): LikeMap => {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as LikeMap;
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
  } catch (error) {
    console.warn("Failed to parse stored likes", error);
  }

  return {};
};

export const useVisitorLikes = () => {
  const [likes, setLikes] = useState<LikeMap>(() => readStorage());

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(likes));
  }, [likes]);

  const isLiked = useCallback(
    (memoId: string) => {
      return Boolean(likes[memoId]);
    },
    [likes],
  );

  const setLiked = useCallback((memoId: string, liked: boolean) => {
    setLikes((prev) => {
      const next = { ...prev };
      if (liked) {
        next[memoId] = true;
      } else {
        delete next[memoId];
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      isLiked,
      setLiked,
      likes,
    }),
    [isLiked, setLiked, likes],
  );

  return value;
};
