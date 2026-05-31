"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { LanguageToggle } from "@/components/i18n/language-toggle";
import { useLanguage } from "@/components/i18n/language-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/learn", label: { en: "Learn", zh: "学习" } },
  { href: "/memory", label: { en: "Memory", zh: "记忆" } },
  { href: "/dashboard", label: { en: "Dashboard", zh: "仪表盘" } },
  { href: "/developer", label: { en: "Developer", zh: "开发者" } },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const { data: session, status } = useSession();
  const userLabel = session?.user?.name || session?.user?.email || "User";

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
                const isActive =
                  pathname === item.href ||
                  (item.href === "/learn" &&
                    (pathname.startsWith("/learn/") ||
                      pathname.startsWith("/courses/"))) ||
                  (item.href === "/developer" &&
                    (pathname.startsWith("/developer") ||
                      pathname.startsWith("/dashboard/workflow-inspector") ||
                      pathname.startsWith("/dashboard/ai-evaluation")));

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

          {status === "authenticated" ? (
            <>
              <span className="hidden text-sm text-muted-foreground md:inline">
                {userLabel}
              </span>
              <Button
                onClick={() => signOut({ callbackUrl: "/learn" })}
                size="sm"
                type="button"
                variant="outline"
              >
                {language === "zh" ? "退出" : "Logout"}
              </Button>
            </>
          ) : (
            <>
              <Link
                className={buttonVariants({ size: "sm", variant: "outline" })}
                href="/login"
              >
                {language === "zh" ? "登录" : "Login"}
              </Link>
              <Link className={buttonVariants({ size: "sm" })} href="/register">
                {language === "zh" ? "注册" : "Register"}
              </Link>
            </>
          )}

          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}
