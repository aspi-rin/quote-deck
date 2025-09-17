import { Button, Tooltip } from "@heroui/react";
import { MoonIcon, SunIcon } from "@heroui/shared-icons";
import { useMemo } from "react";
import { useTheme } from "../providers/theme";

export const ThemeToggle = () => {
  const { mode, setPreference } = useTheme();

  const label = useMemo(() => {
    return mode === "dark" ? "当前：深色模式" : "当前：浅色模式";
  }, [mode]);

  const handleToggle = () => {
    const next = mode === "dark" ? "light" : "dark";
    setPreference(next);
  };

  const Icon = mode === "dark" ? MoonIcon : SunIcon;

  return (
    <Tooltip content={`${label}，点击切换`} placement="bottom">
      <Button
        isIconOnly
        variant="light"
        aria-label="切换主题"
        onPress={handleToggle}
      >
        <Icon className="h-5 w-5" />
      </Button>
    </Tooltip>
  );
};
