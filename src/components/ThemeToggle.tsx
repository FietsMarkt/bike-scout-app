import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "react-i18next";

type Props = { variant?: "header" | "default" };

export const ThemeToggle = ({ variant = "header" }: Props) => {
  const { theme, toggle } = useTheme();
  const { t } = useTranslation();
  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={t("theme.toggle")}
      className={
        variant === "header"
          ? "text-header-foreground hover:bg-white/10 hover:text-header-foreground"
          : ""
      }
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
};
