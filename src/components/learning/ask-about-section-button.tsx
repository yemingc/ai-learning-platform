"use client";

import { MessageSquare } from "lucide-react";
import { useLanguage } from "@/components/i18n/language-provider";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AskAboutSectionButtonProps = {
  section: string;
};

export function AskAboutSectionButton({ section }: AskAboutSectionButtonProps) {
  const { language } = useLanguage();

  return (
    <button
      className={cn(
        buttonVariants({ variant: "ghost", size: "sm" }),
        "mt-3 px-0 text-primary hover:bg-transparent",
      )}
      onClick={() => {
        window.dispatchEvent(
          new CustomEvent("ai-teacher:ask-section", {
            detail: { section },
          }),
        );
      }}
      type="button"
    >
      <MessageSquare className="size-4" />
      {language === "zh" ? "问问这部分" : "Ask about this"}
    </button>
  );
}
