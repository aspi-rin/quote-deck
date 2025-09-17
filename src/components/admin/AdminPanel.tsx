import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Textarea,
} from "@heroui/react";
import type { Session } from "@supabase/supabase-js";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { createBookIfNeeded, insertMemos } from "../../services/memos";
import { parseMemoBlock } from "../../utils/memoParser";

const formatError = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }
  return "提交失败，请稍后再试。";
};

type AdminPanelProps = {
  session: Session | null;
  isReady: boolean;
  onRequireSignIn: () => void;
  onMemosCreated: () => void;
};

export const AdminPanel = ({
  session,
  isReady,
  onRequireSignIn,
  onMemosCreated,
}: AdminPanelProps) => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [memoBlock, setMemoBlock] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const ownerId = session?.user?.id ?? null;

  const entries = useMemo(() => parseMemoBlock(memoBlock), [memoBlock]);

  useEffect(() => {
    if (!isPanelOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsPanelOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPanelOpen]);

  if (!isReady) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessCount(null);

    const trimmedTitle = title.trim();
    const trimmedAuthor = author.trim();
    const parsedEntries = entries;

    if (!trimmedTitle || !trimmedAuthor) {
      setError("请填写书名和作者。");
      return;
    }

    if (!parsedEntries.length) {
      setError("请输入至少一条句子，句子之间使用空行分隔。");
      return;
    }

    if (!ownerId) {
      setError("请先登录后再保存。");
      return;
    }

    setSubmitting(true);

    try {
      const { id: bookId } = await createBookIfNeeded(
        trimmedTitle,
        trimmedAuthor,
        ownerId,
      );

      const result = await insertMemos(bookId, parsedEntries, ownerId);

      if (result.errors?.length) {
        throw new Error(result.errors[0]?.message ?? "保存失败");
      }

      setSuccessCount(result.count);
      setMemoBlock("");
      onMemosCreated();
    } catch (err) {
      setError(formatError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const renderPanelContent = () => {
    if (!ownerId) {
      return (
        <Card className="border border-dashed border-default-200 bg-content1/40">
          <CardHeader>
            <div className="flex w-full items-start justify-between gap-3">
              <h3 className="text-lg font-semibold">添加新的摘抄</h3>
              <Button
                variant="light"
                isIconOnly
                radius="full"
                size="sm"
                onPress={() => setIsPanelOpen(false)}
                aria-label="关闭"
              >
                <span className="text-lg leading-none">&times;</span>
              </Button>
            </div>
          </CardHeader>
          <CardBody className="flex flex-col gap-3 text-sm text-foreground-500">
            <p>
              登录后可以输入书籍信息和文本片段，我会自动拆分为空行分隔的多个句子并保存到数据库中。
            </p>
            <div>
              <Button
                color="primary"
                variant="flat"
                onPress={() => {
                  setIsPanelOpen(false);
                  onRequireSignIn();
                }}
              >
                立即登录
              </Button>
            </div>
          </CardBody>
        </Card>
      );
    }

    return (
      <Card className="border border-default-200 bg-content1/60">
        <CardHeader>
          <div className="flex w-full items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-semibold">添加新的摘抄</h3>
              <p className="text-sm text-foreground-500">
                同一本书的多个句子请贴在同一个文本框中，使用空行分隔，我会自动拆分并保存。
              </p>
            </div>
            <Button
              variant="light"
              isIconOnly
              radius="full"
              size="sm"
              onPress={() => setIsPanelOpen(false)}
              aria-label="关闭"
            >
              <span className="text-lg leading-none">&times;</span>
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="书名"
                placeholder="书名"
                value={title}
                onValueChange={setTitle}
                isRequired
              />
              <Input
                label="作者"
                placeholder="作者"
                value={author}
                onValueChange={setAuthor}
                isRequired
              />
            </div>

            <Textarea
              label="摘抄内容"
              minRows={8}
              placeholder={`每条句子之间请留一个空行，例如：\n\n句子 1\n\n句子 2`}
              value={memoBlock}
              onValueChange={setMemoBlock}
              isRequired
            />

            <div className="rounded-medium border border-dashed border-default-200 bg-content2/60 px-4 py-3 text-sm text-foreground-500">
              {entries.length ? (
                <span>已解析 {entries.length} 条句子。</span>
              ) : (
                <span>输入内容后，将按空行自动拆分。</span>
              )}
            </div>

            {error ? (
              <div className="rounded-medium border border-danger-200 bg-danger-50/60 px-4 py-3 text-sm text-danger">
                {error}
              </div>
            ) : null}

            {successCount !== null ? (
              <div className="rounded-medium border border-success-200 bg-success-50/60 px-4 py-3 text-sm text-success">
                已成功保存 {successCount} 条句子。
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-foreground-400">
                句子默认保存在当前账号下，可在 Supabase 表中查看。
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="light"
                  onPress={() => {
                    setTitle("");
                    setAuthor("");
                    setMemoBlock("");
                    setError(null);
                    setSuccessCount(null);
                  }}
                  isDisabled={submitting}
                >
                  清空
                </Button>
                <Button color="primary" type="submit" isLoading={submitting}>
                  保存
                </Button>
              </div>
            </div>
          </form>
        </CardBody>
      </Card>
    );
  };

  return (
    <>
      <Button
        className="fixed bottom-6 right-6 z-40 shadow-lg"
        color="primary"
        isIconOnly
        size="lg"
        radius="full"
        onPress={() => setIsPanelOpen(true)}
        aria-label="打开添加摘抄表单"
        isDisabled={isPanelOpen}
      >
        <span className="text-2xl leading-none">+</span>
      </Button>
      <AnimatePresence>
        {isPanelOpen ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsPanelOpen(false)}
          >
            <motion.div
              className="w-full max-w-3xl px-4 py-6"
              initial={{ opacity: 0, scale: 0.95, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 24 }}
              transition={{ duration: 0.25 }}
              onClick={(event) => event.stopPropagation()}
            >
              {renderPanelContent()}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
};
