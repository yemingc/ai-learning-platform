import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Layers3, Network } from "lucide-react";
import { getCurriculumPacks } from "@/curricula";
import { localizeCourse, localizeUnit } from "@/curricula/localization";
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

export default function LearnPage() {
  const curricula = getCurriculumPacks();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <section className="grid gap-8 lg:grid-cols-[1fr_24rem] lg:items-end">
        <div>
          <Badge variant="outline">课程库</Badge>
          <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
            选择一门课程，开始概念驱动学习。
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground">
            每个课程包都拥有自己的知识图谱、结构化课程、AI 教师策略、形成性评估和学习记忆，并复用同一套学习引擎。
          </p>
        </div>

        <Card className="bg-muted/30">
          <CardHeader>
            <Badge className="w-fit" variant="secondary">
              平台模型
            </Badge>
            <CardTitle>可复用的学习引擎</CardTitle>
            <CardDescription>
              换课程包，不换产品内核：知识图谱、静态课程、AI 教师、学习记忆和工作流观察能力都可以复用。
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      <section className="mt-10 grid gap-5 md:grid-cols-2">
        {curricula.map((curriculum) => {
          const course = localizeCourse(curriculum, "zh");
          const activeUnit =
            curriculum.units.find((unit) => unit.id === curriculum.defaultUnitId) ??
            curriculum.units[0];
          const displayUnit = activeUnit
            ? localizeUnit(curriculum, activeUnit, "zh")
            : undefined;
          const conceptCount = curriculum.concepts.length;
          const lessonCount = curriculum.lessons.length;
          const totalMinutes = curriculum.concepts.reduce(
            (sum, concept) => sum + concept.estimatedMinutes,
            0,
          );

          return (
            <Card key={course.id}>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">
                    {curriculum.catalog.status === "available"
                      ? "当前可用"
                      : "课程预览"}
                  </Badge>
                  <Badge variant="outline">{course.subject}</Badge>
                </div>
                <CardTitle className="text-2xl">{course.title}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-border bg-background/70 p-3">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                      <Network className="size-3.5" />
                      概念节点
                    </p>
                    <p className="mt-2 text-2xl font-semibold">
                      {conceptCount}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-background/70 p-3">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                      <BookOpen className="size-3.5" />
                      结构化课程
                    </p>
                    <p className="mt-2 text-2xl font-semibold">
                      {lessonCount}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-background/70 p-3">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                      <Clock className="size-3.5" />
                      预计分钟
                    </p>
                    <p className="mt-2 text-2xl font-semibold">
                      {totalMinutes}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-background/70 p-4">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    当前模块
                  </p>
                  <p className="mt-2 text-sm font-semibold">
                    {displayUnit ? displayUnit.title : "暂无模块"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {displayUnit?.description ?? "课程模块正在准备中。"}
                  </p>
                </div>

                <Link
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "w-full justify-between px-4",
                  )}
                  href={`/courses/${course.id}/learn`}
                >
                  进入课程
                  <ArrowRight className="size-4" />
                </Link>
              </CardContent>
            </Card>
          );
        })}

        <Card className="border-dashed bg-muted/20">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">下一门课程</Badge>
              <Badge variant="outline">模板已准备</Badge>
            </div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Layers3 className="size-5" />
              以后可以换成别的学科
            </CardTitle>
            <CardDescription>
              新课程包可以继续复用同一套平台能力：知识图谱、静态课程、AI 教师工作流、学习记忆和开发者观察面板。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border bg-background/70 p-4 text-sm leading-6 text-muted-foreground">
              未来可以添加：JavaScript 基础、代数 II（Algebra II）、AP 物理力学（AP Physics Mechanics）、SAT 数学或英语词汇课程。
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
