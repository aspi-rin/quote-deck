import { useEffect, useMemo, useState } from "react";
import { Button } from "@heroui/react";
import type { Session } from "@supabase/supabase-js";
import { MemoViewer } from "./components/MemoViewer";
import { ThemeToggle } from "./components/ThemeToggle";
import { getSession, onAuthStateChange, signOut } from "./services/auth";
import { AuthDialog } from "./components/auth/AuthDialog";
import { AdminPanel } from "./components/admin/AdminPanel";

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [initialised, setInitialised] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [refreshSeed, setRefreshSeed] = useState(0);

  useEffect(() => {
    const initialise = async () => {
      try {
        const currentSession = await getSession();
        setSession(currentSession);
      } finally {
        setInitialised(true);
      }
    };

    void initialise();

    const unsubscribe = onAuthStateChange((_, newSession) => {
      setSession(newSession);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const isOwner = Boolean(session?.user);
  const reloadKey = useMemo(
    () =>
      `${isOwner ? session?.user?.id ?? "owner" : "guest"}-${refreshSeed}`,
    [isOwner, refreshSeed, session?.user?.id],
  );

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out failed", error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-divider/40 bg-background/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-xl font-semibold sm:text-2xl">Book Memo</h1>
            <p className="text-sm text-foreground-500">
              随机翻阅一本书里的句子，向左右切换发现更多灵感。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isOwner ? (
              <Button variant="flat" onPress={handleSignOut}>
                退出
              </Button>
            ) : (
              <Button onPress={() => setAuthDialogOpen(true)}>登录</Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6">
        <MemoViewer reloadKey={reloadKey} />
        <AdminPanel
          session={session}
          isReady={initialised}
          onRequireSignIn={() => setAuthDialogOpen(true)}
          onMemosCreated={() => setRefreshSeed((seed) => seed + 1)}
        />
      </main>

      <AuthDialog
        isOpen={authDialogOpen}
        onClose={() => setAuthDialogOpen(false)}
        onAuthenticated={() => setAuthDialogOpen(false)}
      />
    </div>
  );
}

export default App;
