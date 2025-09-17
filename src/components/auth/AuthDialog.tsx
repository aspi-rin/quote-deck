import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { useEffect, useState } from "react";
import { signInWithPassword } from "../../services/auth";

const formatError = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }
  return "登录失败，请稍后再试。";
};

type AuthDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
};

export const AuthDialog = ({
  isOpen,
  onClose,
  onAuthenticated,
}: AuthDialogProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setPassword("");
      setError(null);
      setLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email || !password) {
      setError("请输入邮箱和密码。");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await signInWithPassword(email, password);
      onAuthenticated();
    } catch (err) {
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={(open) => !open && onClose()} placement="center">
      <ModalContent>
        {(close) => (
          <form
            className="flex flex-col gap-3"
            onSubmit={(event) => {
              void handleSubmit(event);
            }}
          >
            <ModalHeader className="flex flex-col gap-1">
              <h3 className="text-lg font-semibold">管理员登录</h3>
              <p className="text-sm text-foreground-500">
                请输入 Supabase 中配置的邮箱和密码。
              </p>
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4">
                <Input
                  label="邮箱"
                  type="email"
                  value={email}
                  onValueChange={setEmail}
                  isRequired
                  autoFocus
                />
                <Input
                  label="密码"
                  type="password"
                  value={password}
                  onValueChange={setPassword}
                  isRequired
                />
                {error ? (
                  <p className="rounded-medium border border-danger-200 bg-danger-50/70 px-3 py-2 text-sm text-danger">
                    {error}
                  </p>
                ) : null}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                type="button"
                variant="light"
                onPress={() => {
                  close();
                  onClose();
                }}
                isDisabled={loading}
              >
                取消
              </Button>
              <Button color="primary" type="submit" isLoading={loading}>
                登录
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
};
