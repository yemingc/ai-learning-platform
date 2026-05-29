"use client";

import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/i18n/language-provider";

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();
  const isChinese = language === "zh";

  return (
    <Button
      aria-label={isChinese ? "Switch to English" : "切换到中文"}
      onClick={toggleLanguage}
      size="sm"
      type="button"
      variant="outline"
    >
      <Languages className="size-4" />
      {isChinese ? "中文" : "EN"}
    </Button>
  );
}
