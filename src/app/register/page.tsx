"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [accountCreated, setAccountCreated] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(undefined);
    setAccountCreated(false);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedName = name.trim();
      const registerResponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          name: normalizedName || undefined,
          password,
        }),
      });

      const payload = (await registerResponse.json().catch(() => ({}))) as {
        code?: string;
        error?: string;
      };

      if (!registerResponse.ok) {
        setError(payload.error ?? "Registration failed. Please try again.");
        return;
      }

      const loginResult = await signIn("credentials", {
        email: normalizedEmail,
        password,
        redirect: false,
        callbackUrl: "/learn",
      });

      if (
        !loginResult ||
        !loginResult.ok ||
        loginResult.error ||
        !loginResult.url
      ) {
        setAccountCreated(true);
        setError(
          "Your account was created, but automatic login failed. Log in with the same email and password.",
        );
        return;
      }

      window.location.assign(loginResult.url);
    } catch {
      setError(
        "Unable to reach the registration service. Try logging in first if the account may have been created.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-16 sm:px-6">
      <Card>
        <CardHeader>
          <Badge className="w-fit" variant="secondary">
            Authentication
          </Badge>
          <CardTitle className="mt-3 text-2xl">Create account</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="name">
                Name (optional)
              </label>
              <input
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                id="name"
                autoComplete="name"
                onChange={(event) => setName(event.target.value)}
                type="text"
                value={name}
              />
            </div>
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
                autoComplete="new-password"
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
                {accountCreated && (
                  <>
                    {" "}
                    <Link className="font-medium underline" href="/login">
                      Go to login
                    </Link>
                    .
                  </>
                )}
              </p>
            )}
            <Button className="w-full" disabled={isLoading} type="submit">
              {isLoading ? "Creating..." : "Create account"}
            </Button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link className="font-medium text-foreground underline" href="/login">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
