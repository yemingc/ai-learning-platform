import { redirect } from "next/navigation";
import {
  Activity,
  ArrowRight,
  Beaker,
  BookOpenText,
  Bug,
  Gauge,
  ShieldCheck,
} from "lucide-react";
import { auth } from "@/auth";
import { DeveloperModeClient } from "@/components/developer/developer-mode-client";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  hasDeveloperModeAccess,
  hasDeveloperModePassword,
  isDeveloperToolsEnabled,
} from "@/lib/developer-mode";
import { cn } from "@/lib/utils";

type DeveloperPageProps = {
  searchParams: Promise<{
    callbackUrl?: string;
  }>;
};

const developerTools = [
  {
    description:
      "Inspect model tokens, latency, prompt versions, retrieval modes, success rates, and rolling usage limits without storing raw learner messages.",
    href: "/developer/ai-runs",
    icon: Activity,
    title: "AI Run Observability",
  },
  {
    description:
      "Inspect recent LangGraph traces, teaching strategies, learning signals, and memory patches.",
    href: "/dashboard/workflow-inspector",
    icon: Bug,
    title: "Workflow Inspector",
  },
  {
    description:
      "Run deterministic and live model evals for AI Teacher behavior, schema, and pedagogy.",
    href: "/dashboard/ai-evaluation",
    icon: Beaker,
    title: "AI Teacher Evaluation",
  },
  {
    description:
      "Preview retrieval-ready curriculum chunks, source labels, tags, and stable citation ids before adding embeddings.",
    href: "/developer/retrieval-preview",
    icon: BookOpenText,
    title: "Curriculum Retrieval Preview",
  },
  {
    description:
      "Run fixed Chinese and English retrieval cases to evaluate whether queries hit the right concept and section.",
    href: "/developer/retrieval-evaluation",
    icon: Gauge,
    title: "Retrieval Quality Evaluation",
  },
];

export default async function DeveloperPage({
  searchParams,
}: DeveloperPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/developer");
  }

  const resolvedSearchParams = await searchParams;
  const developerModeEnabled = isDeveloperToolsEnabled();
  const hasAccess = await hasDeveloperModeAccess();
  const callbackUrl = resolvedSearchParams.callbackUrl?.startsWith("/")
    ? resolvedSearchParams.callbackUrl
    : "/developer";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <section className="grid gap-8 lg:grid-cols-[1fr_26rem] lg:items-end">
        <div>
          <Badge variant="outline">Developer mode</Badge>
          <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
            Separate student learning from AI engineering tools.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground">
            Student accounts can learn, chat, and build memory. Developer mode
            unlocks internal tools for tracing LangGraph workflows, evaluating
            AI Teacher outputs, and debugging prompt quality.
          </p>
        </div>

        <DeveloperModeClient
          callbackUrl={callbackUrl}
          developerModeEnabled={developerModeEnabled}
          hasAccess={hasAccess}
          requiresPassword={hasDeveloperModePassword()}
        />
      </section>

      <section className="mt-10 grid gap-5 md:grid-cols-2">
        {developerTools.map((tool) => {
          const Icon = tool.icon;

          return (
            <Card className={!hasAccess ? "opacity-70" : undefined} key={tool.href}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="size-5" />
                  {tool.title}
                </CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <a
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    !hasAccess && "pointer-events-none",
                  )}
                  href={hasAccess ? tool.href : undefined}
                  aria-disabled={!hasAccess}
                >
                  Open tool
                  <ArrowRight className="size-4" />
                </a>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Card className="mt-10 border-learning-mint/30 bg-learning-mint/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5" />
            Product boundary
          </CardTitle>
          <CardDescription>
            Developer mode is intentionally separate from authentication. A
            signed-in user is a learner by default; developer access is an
            explicit debugging mode.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
