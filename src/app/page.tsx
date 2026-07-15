"use client";

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
import {
  type Language,
  useLanguage,
} from "@/components/i18n/language-provider";
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

type LearningLoopItem = {
  step: string;
  title: string;
  description: string;
};

type Signal = {
  label: string;
  value: string;
};

type HeroFlowItem = {
  label: string;
  title: string;
  description: string;
  icon: typeof Network;
};

type HomePageCopy = {
  hero: {
    badge: string;
    title: string;
    description: string;
    startLearning: string;
    viewMemory: string;
    signals: Signal[];
    flow: HeroFlowItem[];
    workspace: {
      badge: string;
      title: string;
      demoLabel: string;
      demoUnit: string;
      readiness: string;
      nextConcept: string;
      nextConceptValue: string;
      practiceGate: string;
      practiceGateValue: string;
    };
  };
  learningLoop: {
    badge: string;
    title: string;
    description: string;
    items: LearningLoopItem[];
  };
  productStance: {
    badge: string;
    title: string;
    description: string;
  };
  currentScope: {
    badge: string;
    title: string;
    description: string;
  };
};

const homePageCopy = {
  en: {
    hero: {
      badge: "Reusable AI learning platform",
      title: "AI Learning Platform",
      description:
        "A learning-centric system that helps students build concept mastery through swappable course packs, knowledge graphs, AI-guided learning sessions, learner memory, adaptive study actions, and practice after readiness.",
      startLearning: "Start learning",
      viewMemory: "View learner memory",
      signals: [
        { label: "Study action", value: "Repair misconception" },
        { label: "Readiness", value: "82%" },
        { label: "Application gate", value: "After learning" },
      ],
      flow: [
        {
          label: "Knowledge graph",
          title: "What is a limit?",
          description: "Concept first, prerequisites visible.",
          icon: Network,
        },
        {
          label: "Structured lesson",
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
      ],
      workspace: {
        badge: "Learning system preview",
        title: "From concept clarity to an adaptive next step.",
        demoLabel: "Demo course pack",
        demoUnit: "Unit 1 · Limits",
        readiness: "Readiness",
        nextConcept: "Next concept",
        nextConceptValue: "Limit notation",
        practiceGate: "Practice gate",
        practiceGateValue: "After learning",
      },
    },
    learningLoop: {
      badge: "Learning loop",
      title:
        "Concepts drive the journey from first explanation to application, no matter the course.",
      description:
        "The platform is organized around durable learning state. Each product area supports one stage of the loop, so lessons, AI support, memory, and practice work together.",
      items: [
        {
          step: "01",
          title: "Course-pack knowledge graph",
          description:
            "Model any subject as connected learning targets with prerequisite awareness. AP Calculus AB is the first course pack.",
        },
        {
          step: "02",
          title: "AI-guided learning sessions",
          description:
            "Pair reviewed concept lessons with guided explanations, checks for understanding, and targeted AI support before practice begins.",
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
      ],
    },
    productStance: {
      badge: "Product stance",
      title: "Learning-centric by design",
      description:
        "The core experience begins with concept readiness and student memory, then uses practice as evidence and application.",
    },
    currentScope: {
      badge: "Scope for now",
      title: "Authenticated, persistent learning state",
      description:
        "AI chat runs server-side, learner sessions are protected, and account-scoped memory persists readiness, misconceptions, and study recommendations.",
    },
  },
  zh: {
    hero: {
      badge: "可复用的 AI 学习平台",
      title: "AI 自适应学习平台",
      description:
        "通过可替换课程包、知识图谱、AI 引导学习、学习记忆和自适应建议，帮助学习者先真正理解概念，再进入应用练习。",
      startLearning: "开始学习",
      viewMemory: "查看学习进度",
      signals: [
        { label: "当前学习建议", value: "优先修正常见误区" },
        { label: "学习准备度", value: "82%" },
        { label: "应用练习", value: "完成概念学习后解锁" },
      ],
      flow: [
        {
          label: "知识图谱",
          title: "什么是极限？",
          description: "先理解概念，前置关系一目了然。",
          icon: Network,
        },
        {
          label: "结构化课程",
          title: "先建立直觉，再进入符号",
          description: "课程内容稳定、可审阅，也便于持续迭代。",
          icon: Sparkles,
        },
        {
          label: "AI 教师",
          title: "针对当前段落提问",
          description: "回答会结合你正在学习的课程上下文。",
          icon: MessageSquare,
        },
        {
          label: "学习记忆",
          title: "常见误区：极限等于 f(a)",
          description: "学习信号会影响接下来的学习建议。",
          icon: Brain,
        },
      ],
      workspace: {
        badge: "学习系统预览",
        title: "从真正理解概念，到明确下一步学什么。",
        demoLabel: "演示课程包",
        demoUnit: "第 1 单元 · 极限",
        readiness: "学习准备度",
        nextConcept: "下一概念",
        nextConceptValue: "极限符号",
        practiceGate: "练习门槛",
        practiceGateValue: "完成学习后",
      },
    },
    learningLoop: {
      badge: "学习闭环",
      title: "无论课程怎样变化，概念始终串起讲解、理解、记忆与应用。",
      description:
        "平台围绕可持续的学习状态组织功能，让课程讲解、AI 支持、学习记忆和应用练习真正协同工作。",
      items: [
        {
          step: "01",
          title: "课程知识图谱",
          description:
            "把一门学科拆成相互连接的学习目标，同时呈现课程顺序和前置关系。",
        },
        {
          step: "02",
          title: "AI 引导学习",
          description:
            "结合经过审阅的课程讲解、理解检查和针对性 AI 支持，在练习前先打牢概念。",
        },
        {
          step: "03",
          title: "学习记忆",
          description:
            "记录哪些概念已经理解、哪些正在遗忘，以及哪些误区反复出现。",
        },
        {
          step: "04",
          title: "自适应学习行动",
          description:
            "把学习信号转化为误区修正、反思任务和下一步学习建议。",
        },
        {
          step: "05",
          title: "应用练习",
          description:
            "当概念准备度达到要求后，再进入 AP 风格的迁移与应用，而不是一开始就只刷题。",
        },
      ],
    },
    productStance: {
      badge: "产品原则",
      title: "一切围绕真正学会",
      description:
        "先建立概念理解并记录学习证据，再把练习作为检验理解和完成迁移的工具。",
    },
    currentScope: {
      badge: "当前能力",
      title: "带账号的持久学习状态",
      description:
        "登录后，学习准备度、常见误区与学习建议会按账号持续保存；AI 教师也会结合这些记录提供支持。",
    },
  },
} satisfies Record<Language, HomePageCopy>;

function HeroFlowCard({
  description,
  icon: Icon,
  label,
  title,
}: HeroFlowItem) {
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

function HeroWorkspace({
  copy,
  flow,
}: {
  copy: HomePageCopy["hero"]["workspace"];
  flow: HeroFlowItem[];
}) {
  return (
    <div className="hidden lg:block">
      <div className="relative overflow-hidden rounded-[2rem] border border-border bg-[linear-gradient(135deg,hsl(var(--card))_0%,hsl(var(--muted))_100%)] p-6 shadow-[0_24px_80px_rgb(27_42_47_/_0.12)]">
        <div className="absolute -right-16 -top-16 size-56 rounded-full bg-learning-blue/20 blur-3xl" />
        <div className="absolute -bottom-20 left-12 size-52 rounded-full bg-learning-mint/25 blur-3xl" />

        <div className="relative rounded-2xl border border-border bg-background/70 p-5 backdrop-blur">
          <div className="flex items-start justify-between gap-6">
            <div>
              <Badge variant="secondary">{copy.badge}</Badge>
              <h2 className="mt-4 max-w-sm text-2xl font-semibold leading-tight">
                {copy.title}
              </h2>
            </div>
            <div className="rounded-lg border border-border bg-card p-3 text-right">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                {copy.demoLabel}
              </p>
              <p className="mt-1 text-sm font-semibold">{copy.demoUnit}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            {flow.map((item, index) => (
              <div className="relative" key={item.label}>
                <HeroFlowCard {...item} />
                {index < flow.length - 1 && (
                  <div className="mx-8 h-3 w-px bg-border" />
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-border bg-card/90 p-4">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                {copy.readiness}
              </p>
              <p className="mt-2 text-2xl font-semibold">82%</p>
            </div>
            <div className="rounded-lg border border-border bg-card/90 p-4">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                {copy.nextConcept}
              </p>
              <p className="mt-2 text-sm font-semibold leading-5">
                {copy.nextConceptValue}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card/90 p-4">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                {copy.practiceGate}
              </p>
              <p className="mt-2 flex items-center gap-2 text-sm font-semibold">
                <CheckCircle2 className="size-4 text-primary" />
                {copy.practiceGateValue}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { language } = useLanguage();
  const copy = homePageCopy[language];

  return (
    <div className="overflow-hidden">
      <section className="relative isolate border-b border-border">
        <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <div className="relative z-10 max-w-2xl">
            <Badge variant="outline">{copy.hero.badge}</Badge>
            <h1 className="mt-6 max-w-xl text-5xl font-semibold leading-none sm:text-6xl">
              {copy.hero.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              {copy.hero.description}
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
                {copy.hero.startLearning}
              </Link>
              <Link
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-11 px-5",
                )}
                href="/memory"
              >
                {copy.hero.viewMemory}
                <ArrowRight data-icon="inline-end" className="size-4" />
              </Link>
            </div>
            <dl className="mt-10 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
              {copy.hero.signals.map((signal) => (
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
          <HeroWorkspace copy={copy.hero.workspace} flow={copy.hero.flow} />
        </div>
      </section>

      <section className="border-b border-border bg-card/70 py-16 sm:py-20">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Badge variant="secondary">{copy.learningLoop.badge}</Badge>
            <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">
              {copy.learningLoop.title}
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              {copy.learningLoop.description}
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {copy.learningLoop.items.map((item) => (
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
                {copy.productStance.badge}
              </Badge>
              <CardTitle>{copy.productStance.title}</CardTitle>
              <CardDescription>
                {copy.productStance.description}
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Badge className="w-fit" variant="outline">
                {copy.currentScope.badge}
              </Badge>
              <CardTitle>{copy.currentScope.title}</CardTitle>
              <CardDescription>{copy.currentScope.description}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
    </div>
  );
}
