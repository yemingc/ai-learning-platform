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
  title: "AI Learning Platform | AP Calculus AB",
  description:
    "A learning-centric AI platform for AP Calculus AB concept mastery, adaptive planning, and application practice.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
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
