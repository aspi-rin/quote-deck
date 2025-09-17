import { Button, Tooltip } from "@heroui/react";
import { MoonIcon, SunIcon } from "@heroui/shared-icons";
import { useMemo } from "react";
import { useTheme, type ThemePreference } from "../providers/theme";

const nextPreference = (current: ThemePreference): ThemePreference => {
  switch (current) {
    case "system":
      return "light";
    case "light":
      return "dark";
    default:
      return "system";
  }
};

export const ThemeToggle = () => {
  const { mode, preference, setPreference } = useTheme();

  const label = useMemo(() => {
    switch (preference) {
      case "light":
        return "当前：浅色模式";
      case "dark":
        return "当前：深色模式";
      default:
        return "当前：跟随系统";
    }
  }, [preference]);

  const handleToggle = () => {
    setPreference(nextPreference(preference));
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
