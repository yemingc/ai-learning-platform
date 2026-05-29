"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageToggle } from "@/components/i18n/language-toggle";
import { useLanguage } from "@/components/i18n/language-provider";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/learn", label: { en: "Learn", zh: "学习" } },
  { href: "/memory", label: { en: "Memory", zh: "记忆" } },
  { href: "/dashboard", label: { en: "Dashboard", zh: "仪表盘" } },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { language } = useLanguage();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <Link className="flex items-center gap-3 font-semibold" href="/">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-sm">
            AB
          </span>
          <span>AI Learning Platform</span>
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <nav aria-label={language === "zh" ? "主导航" : "Main navigation"}>
            <ul className="flex flex-wrap items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <li key={item.href}>
                    <Link
                      aria-current={isActive ? "page" : undefined}
                      className={buttonVariants({
                        variant: isActive ? "secondary" : "ghost",
                        size: "sm",
                        className: cn(
                          "text-muted-foreground",
                          isActive && "text-foreground",
                        ),
                      })}
                      href={item.href}
                    >
                      {item.label[language]}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}
