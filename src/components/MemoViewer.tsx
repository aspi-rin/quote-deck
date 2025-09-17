import { Button, Card, CardBody, CardHeader, Spinner } from "@heroui/react";
import { useCallback, useEffect, useState } from "react";
import { useSwipeable } from "react-swipeable";
import { fetchRandomMemos } from "../services/memos";
import type { Memo } from "../types";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroui/shared-icons";
import clsx from "clsx";

const BATCH_SIZE = 10;
const PREFETCH_THRESHOLD = 2;

const formatError = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }
  return "发生未知错误，请稍后再试。";
};

type MemoViewerProps = {
  reloadKey: string;
};

export const MemoViewer = ({ reloadKey }: MemoViewerProps) => {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [prefetching, setPrefetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const initial = await fetchRandomMemos(BATCH_SIZE);
      setMemos(initial);
      setCurrentIndex(0);
    } catch (err) {
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInitial();
  }, [loadInitial, reloadKey]);

  const currentMemo = memos[currentIndex];

  const prefetchMore = useCallback(
    async (advanceAfterAppend = false) => {
      if (prefetching) {
        return;
      }

      setPrefetching(true);
      try {
        const more = await fetchRandomMemos(BATCH_SIZE);
        setMemos((prev) => [...prev, ...more]);
        if (advanceAfterAppend && more.length > 0) {
          setCurrentIndex((prev) => prev + 1);
        }
      } catch (err) {
        setError(formatError(err));
      } finally {
        setPrefetching(false);
      }
    },
    [prefetching],
  );

  useEffect(() => {
    if (!loading && memos.length && memos.length - currentIndex <= PREFETCH_THRESHOLD) {
      void prefetchMore();
    }
  }, [loading, memos.length, currentIndex, prefetchMore]);

  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < memos.length - 1;

  const handlePrev = useCallback(() => {
    if (canGoPrev) {
      setCurrentIndex((prev) => Math.max(0, prev - 1));
    }
  }, [canGoPrev]);

  const handleNext = useCallback(() => {
    if (canGoNext) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    void prefetchMore(true);
  }, [canGoNext, prefetchMore]);

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        handleNext();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [handleNext, handlePrev]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleNext(),
    onSwipedRight: () => handlePrev(),
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  const handleReload = useCallback(() => {
    void loadInitial();
  }, [loadInitial]);

  const cardContent = () => {
    if (loading) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20">
          <Spinner label="加载中..." />
          <p className="text-sm text-foreground-500">正在为你挑选句子</p>
        </div>
      );
    }

    if (error && !currentMemo) {
      return (
        <div className="flex min-h-[240px] flex-col items-center justify-center gap-4 p-6 text-center">
          <p className="text-base font-medium text-danger">{error}</p>
          <Button color="primary" onPress={handleReload}>
            重试
          </Button>
        </div>
      );
    }

    if (!currentMemo) {
      return (
        <div className="flex min-h-[240px] flex-col items-center justify-center gap-4 p-6 text-center">
          <p className="text-base font-medium text-foreground-500">
            暂时没有可以显示的句子。
          </p>
          <Button color="primary" onPress={handleReload}>
            刷新
          </Button>
        </div>
      );
    }

    return (
      <div className="flex min-h-[260px] flex-col">
        <CardHeader className="flex flex-col items-start gap-1">
          <p className="text-sm uppercase tracking-wide text-foreground-500">
            {currentMemo.book_author}
          </p>
          <h2 className="text-2xl font-semibold">{currentMemo.book_title}</h2>
        </CardHeader>
        <CardBody className="flex-1">
          <p className="whitespace-pre-wrap text-lg leading-relaxed text-foreground">
            {currentMemo.content}
          </p>
        </CardBody>
      </div>
    );
  };

  return (
    <div className="flex w-full flex-col gap-6">
      {error && currentMemo ? (
        <div className="rounded-medium border border-danger-200 bg-danger-50/40 px-4 py-2 text-sm text-danger">
          {error}
        </div>
      ) : null}

      <Card
        {...swipeHandlers}
        className={clsx(
          "relative mx-auto w-full max-w-2xl cursor-grab select-none",
          "transition-transform duration-200 will-change-transform",
        )}
      >
        {cardContent()}
      </Card>

      <div className="flex items-center justify-center gap-3">
        <Button
          color="primary"
          variant="flat"
          onPress={handlePrev}
          isDisabled={!canGoPrev}
          startContent={<ArrowLeftIcon className="h-4 w-4" />}
        >
          上一条
        </Button>
        <Button variant="bordered" onPress={handleReload}>
          🎲
        </Button>
        <Button
          color="primary"
          variant="flat"
          onPress={handleNext}
          endContent={<ArrowRightIcon className="h-4 w-4" />}
        >
          下一条
        </Button>
      </div>

      {prefetching ? (
        <div className="flex items-center justify-center gap-2 text-xs text-foreground-500">
          <Spinner size="sm" /> 正在载入更多句子…
        </div>
      ) : null}
    </div>
  );
};
