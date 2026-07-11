"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type LoginFormProps = {
  callbackUrl: string;
  demoAccount?: {
    email: string;
    name: string;
    password: string;
  };
};

export function LoginForm({ callbackUrl, demoAccount }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function login(credentials: { email: string; password: string }) {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setError(undefined);

    try {
      const result = await signIn("credentials", {
        callbackUrl,
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
        redirect: false,
      });

      if (!result || !result.ok || result.error || !result.url) {
        setError(
          result?.error === "CredentialsSignin"
            ? "Invalid email or password."
            : "Login could not be completed. Please try again.",
        );
        return;
      }

      window.location.assign(result.url);
    } catch {
      setError("Unable to reach the login service. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await login({ email, password });
  }

  async function handleDemoLogin() {
    if (!demoAccount) {
      return;
    }

    setEmail(demoAccount.email);
    setPassword(demoAccount.password);
    await login(demoAccount);
  }

  return (
    <Card>
      <CardHeader>
        <Badge className="w-fit" variant="secondary">
          Authentication
        </Badge>
        <CardTitle className="mt-3 text-2xl">Log in</CardTitle>
      </CardHeader>
      <CardContent>
        {demoAccount && (
          <div className="mb-5 rounded-lg border border-primary/20 bg-primary/5 p-3">
            <p className="text-sm font-medium">Shared portfolio demo</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Explore as {demoAccount.name}. This account contains only
              synthetic learning evidence and may be reset between visits.
            </p>
            <Button
              className="mt-3 w-full"
              disabled={isLoading}
              onClick={handleDemoLogin}
              type="button"
              variant="outline"
            >
              {isLoading ? "Logging in..." : "Log in as demo learner"}
            </Button>
          </div>
        )}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <input
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
              id="email"
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="password">
              Password
            </label>
            <input
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
              id="password"
              autoComplete="current-password"
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </div>
          {error && (
            <p
              aria-live="polite"
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {error}
            </p>
          )}
          <Button className="w-full" disabled={isLoading} type="submit">
            {isLoading ? "Logging in..." : "Log in"}
          </Button>
        </form>
        <p className="mt-4 text-sm text-muted-foreground">
          No account?{" "}
          <Link className="font-medium text-foreground underline" href="/register">
            Create one
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
