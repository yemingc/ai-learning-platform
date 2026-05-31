import Link from "next/link";
import { redirect } from "next/navigation";
import { Activity, ArrowRight, BarChart3, BrainCircuit, Code2 } from "lucide-react";
import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const dashboardAreas = [
  {
    title: "Concept readiness",
    description:
      "Summarize whether each concept is still forming, stabilizing, or ready for application practice.",
  },
  {
    title: "Learner memory",
    description:
      "Surface misconceptions, confusion sections, reflection signals, and confidence movement.",
  },
  {
    title: "Application gate",
    description:
      "Keep practice downstream from learning by showing when a student is ready to apply a concept.",
  },
];

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-end">
        <div>
          <Badge variant="outline">Learning dashboard</Badge>
          <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
            A dashboard for mastery, memory, and next learning actions.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground">
            This student-facing area focuses on concept readiness,
            misconception repair, and application readiness. Internal AI
            workflow tools live behind Developer Mode.
          </p>
        </div>

        <Card className="bg-muted/30">
          <CardHeader>
            <Badge className="w-fit" variant="secondary">
              Portfolio signal
            </Badge>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="size-5" />
              Student progress, not debug traces
            </CardTitle>
            <CardDescription>
              The dashboard should help a learner understand what is stable,
              what needs repair, and when they are ready to apply a concept.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/memory">
                Open Memory
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {dashboardAreas.map((area) => (
          <Card key={area.title}>
            <CardHeader>
              <CardTitle>{area.title}</CardTitle>
              <CardDescription>{area.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="size-5" />
              Student progress model
            </CardTitle>
            <CardDescription>
              Future dashboard cards should prioritize concept mastery,
              misconception repair, and readiness to apply ideas instead of raw
              streaks or question counts.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="size-5" />
              AI workflow model
            </CardTitle>
            <CardDescription>
              The Workflow Inspector demonstrates that the AI layer is an
              observable teaching pipeline: context, intent, strategy,
              response, signals, memory, and next action.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card className="mt-8 border-dashed">
        <CardHeader>
          <Badge className="w-fit" variant="outline">
            Developer-only
          </Badge>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="size-5" />
            Internal AI tools are separated
          </CardTitle>
          <CardDescription>
            Workflow Inspector and AI Teacher Evaluation are useful for
            engineering and portfolio review, but they are not part of the
            learner experience.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href="/developer">
              Open Developer Mode
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
