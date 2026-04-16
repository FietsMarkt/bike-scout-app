import { Globe, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SUPPORTED_LANGUAGES } from "@/i18n";

type Props = { variant?: "header" | "default" };

export const LanguageSwitcher = ({ variant = "header" }: Props) => {
  const { i18n, t } = useTranslation();
  const current = SUPPORTED_LANGUAGES.find((l) => l.code === i18n.resolvedLanguage) ?? SUPPORTED_LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={t("nav.language")}
          className={
            variant === "header"
              ? "text-header-foreground hover:bg-white/10 hover:text-header-foreground gap-1.5 px-2"
              : "gap-1.5"
          }
        >
          <Globe className="h-4 w-4" />
          <span className="text-sm font-semibold uppercase">{current.code}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 bg-card">
        {SUPPORTED_LANGUAGES.map((lang) => {
          const active = lang.code === current.code;
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => i18n.changeLanguage(lang.code)}
              className="cursor-pointer flex items-center justify-between"
            >
              <span className="inline-flex items-center gap-2">
                <span className="text-base leading-none">{lang.flag}</span>
                <span>{lang.label}</span>
              </span>
              {active && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
