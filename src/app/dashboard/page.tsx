import Link from "next/link";
import { Activity, ArrowRight, BarChart3, BrainCircuit } from "lucide-react";
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

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-end">
        <div>
          <Badge variant="outline">Learning dashboard</Badge>
          <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
            A dashboard for mastery, memory, and AI observability.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground">
            This area separates student-facing progress from developer-facing
            AI workflow visibility. The product can show concept readiness while
            the engineering story shows how the AI Teacher makes structured,
            inspectable decisions.
          </p>
        </div>

        <Card className="bg-muted/30">
          <CardHeader>
            <Badge className="w-fit" variant="secondary">
              Portfolio signal
            </Badge>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="size-5" />
              Inspect the AI learning workflow
            </CardTitle>
            <CardDescription>
              View LangGraph traces, teaching strategy choices, learning
              signals, and memory patches from recent AI Teacher conversations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/workflow-inspector">
                Open Workflow Inspector
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
    </div>
  );
}
