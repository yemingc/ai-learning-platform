import Link from "next/link";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  MessageSquare,
  Network,
  Route,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const learningLoop = [
  {
    step: "01",
    title: "Course-pack knowledge graph",
    description:
      "Model any subject as connected learning targets with prerequisite awareness. AP Calculus AB is the first course pack.",
  },
  {
    step: "02",
    title: "AI-generated learning sessions",
    description:
      "Turn a concept into guided explanation, checks for understanding, and targeted examples before practice begins.",
  },
  {
    step: "03",
    title: "Learner memory",
    description:
      "Track what a student understands, what is fading, and which misconceptions keep showing up across sessions.",
  },
  {
    step: "04",
    title: "Adaptive study actions",
    description:
      "Turn memory signals into misconception repair, reflection prompts, and application readiness gates.",
  },
  {
    step: "05",
    title: "Application practice",
    description:
      "Move into AP-style application after concept readiness is established, not as the whole product experience.",
  },
];

const signals = [
  { label: "Study action", value: "Repair misconception" },
  { label: "Readiness", value: "82%" },
  { label: "Application gate", value: "After learning" },
];

const heroFlow = [
  {
    label: "Knowledge graph",
    title: "What is a limit?",
    description: "Concept first, prerequisites visible.",
    icon: Network,
  },
  {
    label: "Static lesson",
    title: "Build intuition before notation",
    description: "Curriculum content stays stable and reviewable.",
    icon: Sparkles,
  },
  {
    label: "AI Teacher",
    title: "Ask about this section",
    description: "Interactive help uses current lesson context.",
    icon: MessageSquare,
  },
  {
    label: "Learner memory",
    title: "Misconception: limit = f(a)",
    description: "Signals shape adaptive study actions.",
    icon: Brain,
  },
];

function HeroFlowCard({
  description,
  icon: Icon,
  label,
  title,
}: {
  description: string;
  icon: typeof Network;
  label: string;
  title: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-background/85 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-sm font-semibold leading-5">{title}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

function HeroWorkspace() {
  return (
    <div className="hidden lg:block">
      <div className="relative overflow-hidden rounded-[2rem] border border-border bg-[linear-gradient(135deg,hsl(var(--card))_0%,hsl(var(--muted))_100%)] p-6 shadow-[0_24px_80px_rgb(27_42_47_/_0.12)]">
        <div className="absolute -right-16 -top-16 size-56 rounded-full bg-learning-blue/20 blur-3xl" />
        <div className="absolute -bottom-20 left-12 size-52 rounded-full bg-learning-mint/25 blur-3xl" />

        <div className="relative rounded-2xl border border-border bg-background/70 p-5 backdrop-blur">
          <div className="flex items-start justify-between gap-6">
            <div>
              <Badge variant="secondary">Learning system preview</Badge>
              <h2 className="mt-4 max-w-sm text-2xl font-semibold leading-tight">
                From concept clarity to adaptive next step.
              </h2>
            </div>
            <div className="rounded-lg border border-border bg-card p-3 text-right">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Demo course pack
              </p>
              <p className="mt-1 text-sm font-semibold">Unit 1 - Limits</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            {heroFlow.map((item, index) => (
              <div className="relative" key={item.label}>
                <HeroFlowCard {...item} />
                {index < heroFlow.length - 1 && (
                  <div className="mx-8 h-3 w-px bg-border" />
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-border bg-card/90 p-4">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Readiness
              </p>
              <p className="mt-2 text-2xl font-semibold">82%</p>
            </div>
            <div className="rounded-lg border border-border bg-card/90 p-4">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Next concept
              </p>
              <p className="mt-2 text-sm font-semibold leading-5">
                Limit notation
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card/90 p-4">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Practice gate
              </p>
              <p className="mt-2 flex items-center gap-2 text-sm font-semibold">
                <CheckCircle2 className="size-4 text-primary" />
                After learning
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="overflow-hidden">
      <section className="relative isolate border-b border-border">
        <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <div className="relative z-10 max-w-2xl">
            <Badge variant="outline">Reusable AI learning platform</Badge>
            <h1 className="mt-6 max-w-xl text-5xl font-semibold leading-none sm:text-6xl">
              AI Learning Platform
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              A learning-centric system that helps students build concept
              mastery through swappable course packs, knowledge graphs,
              AI-guided learning sessions, learner memory, adaptive study
              actions, and practice after readiness.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-11 border-learning-mint bg-learning-mint px-5 text-white shadow-sm hover:bg-learning-mint/90",
                )}
                href="/learn"
              >
                <Route
                  data-icon="inline-start"
                  className="size-4 text-white"
                />
                Start learning
              </Link>
              <Link
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-11 px-5",
                )}
                href="/memory"
              >
                View learner memory
                <ArrowRight data-icon="inline-end" className="size-4" />
              </Link>
            </div>
            <dl className="mt-10 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
              {signals.map((signal) => (
                <div
                  className="rounded-lg border border-border bg-card/80 p-4"
                  key={signal.label}
                >
                  <dt className="text-xs font-semibold uppercase text-muted-foreground">
                    {signal.label}
                  </dt>
                  <dd className="mt-2 text-sm font-semibold">
                    {signal.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <HeroWorkspace />
        </div>
      </section>

      <section className="border-b border-border bg-card/70 py-16 sm:py-20">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
              <Badge variant="secondary">Learning loop</Badge>
              <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">
              Concepts drive the journey from first explanation to application,
              no matter the course.
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              The app skeleton is organized around durable learning state. Each
              product area supports one stage of the loop so future database and
              AI layers have a clear place to attach.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {learningLoop.map((item) => (
              <Card key={item.step}>
                <CardHeader>
                  <Badge className="w-fit" variant="outline">
                    {item.step}
                  </Badge>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{item.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
          <Card>
            <CardHeader>
              <Badge className="w-fit" variant="secondary">
                Product stance
              </Badge>
              <CardTitle>Learning-centric by design</CardTitle>
              <CardDescription>
                The core experience begins with concept readiness and student
                memory, then uses practice as evidence and application.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Badge className="w-fit" variant="outline">
                Scope for now
              </Badge>
              <CardTitle>No database or auth yet</CardTitle>
              <CardDescription>
                AI chat is server-side, learner memory is local-demo storage,
                and the typed data model is ready for future persistence.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
    </div>
  );
}

