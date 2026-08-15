"use client";

import { type FormEvent, useState } from "react";
import { Code2, Loader2, Lock, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type DeveloperModeClientProps = {
  callbackUrl: string;
  developerModeEnabled: boolean;
  hasAccess: boolean;
  requiresPassword: boolean;
};

export function DeveloperModeClient({
  callbackUrl,
  developerModeEnabled,
  hasAccess,
  requiresPassword,
}: DeveloperModeClientProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  async function enableDeveloperMode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(undefined);

    try {
      const response = await fetch("/api/developer-mode", {
        body: JSON.stringify({ password }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => undefined)) as
          | { error?: { message?: string } }
          | undefined;

        throw new Error(
          errorBody?.error?.message ??
            `Developer mode request failed with status ${response.status}.`,
        );
      }

      window.location.replace(callbackUrl);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Developer mode request failed.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function disableDeveloperMode() {
    setIsLoading(true);
    setError(undefined);

    try {
      await fetch("/api/developer-mode", {
        method: "DELETE",
      });
      window.location.reload();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="bg-muted/30">
      <CardHeader>
        <Badge className="w-fit" variant={hasAccess ? "secondary" : "outline"}>
          {hasAccess ? "Developer mode active" : "Developer mode locked"}
        </Badge>
        <CardTitle className="flex items-center gap-2">
          <Code2 className="size-5" />
          Developer tools access
        </CardTitle>
        <CardDescription>
          These tools are for debugging AI workflows, prompts, traces, and evals.
          They are intentionally separate from the student learning experience.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!developerModeEnabled ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            Developer tools are disabled for this environment.
          </div>
        ) : hasAccess ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-learning-mint/30 bg-learning-mint/10 p-4 text-sm leading-6">
              Developer mode is enabled for this browser session. You can open
              Workflow Inspector and AI Evaluation from this page.
            </div>
            <Button
              disabled={isLoading}
              onClick={disableDeveloperMode}
              type="button"
              variant="outline"
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <LogOut className="size-4" />
              )}
              Turn off developer mode
            </Button>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={enableDeveloperMode}>
            {requiresPassword ? (
              <div>
                <label
                  className="text-sm font-medium"
                  htmlFor="developer-password"
                >
                  Developer password
                </label>
                <input
                  className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
                  id="developer-password"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter developer mode password"
                  type="password"
                  value={password}
                />
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-lg border border-border bg-background/70 p-4 text-sm leading-6 text-muted-foreground">
                <Lock className="mt-1 size-4 shrink-0" />
                Local development does not require a developer password. Set
                DEVELOPER_MODE_PASSWORD to require one.
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button disabled={isLoading} type="submit">
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Lock className="size-4" />
              )}
              Enable developer mode
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
