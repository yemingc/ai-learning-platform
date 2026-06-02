import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthSessionProvider } from "@/components/auth/auth-session-provider";
import { LanguageProvider } from "@/components/i18n/language-provider";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Learning Platform | AI 自适应学习平台",
  description:
    "面向概念学习的 AI 教育平台，支持结构化课程、AI 教师、学习记忆和后续应用练习。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full bg-background text-foreground"
        suppressHydrationWarning
      >
        <AuthSessionProvider>
          <LanguageProvider>
            <SiteHeader />
            <main>{children}</main>
          </LanguageProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
