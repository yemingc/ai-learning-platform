"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type LoginFormProps = {
  callbackUrl: string;
};

export function LoginForm({ callbackUrl }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(undefined);

    const result = await signIn("credentials", {
      callbackUrl,
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password.");
      setIsLoading(false);
      return;
    }

    window.location.href = result?.url ?? callbackUrl;
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
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <input
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
              id="email"
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
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </div>
          {error && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
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
