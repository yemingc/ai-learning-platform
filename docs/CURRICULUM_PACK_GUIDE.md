# 课程包生成与接入规范

本文档用于指导开发者或 AI 为本项目生成新的课程包。目标是让新课程复用现有的课程库、知识图谱、结构化课时、AI 教师、形成性评估、学习记忆、学习计划和 RAG 检索能力，而不修改学习运行时的核心逻辑。

生成课程前，先填写 [`CURRICULUM_PACK_BRIEF.template.yaml`](./CURRICULUM_PACK_BRIEF.template.yaml)。需求不完整时，不应直接批量生成课程内容。

## 1. 核心原则

1. **课程包是数据和教学策略，不是独立应用。** 不要为每门课程复制页面、API 或学习组件。
2. **概念是核心学习节点。** 单元、主题、课时、题目、学习记忆和 AI 教师上下文都围绕概念组织。
3. **先构建知识图谱，再编写课时。** 每个概念必须明确父级、先修关系和学习目标。
4. **静态课程内容是事实来源。** AI 教师负责解释、追问和纠偏，不负责临时生成整节正式课程。
5. **答案只能存在于服务端。** 形成性评估的正确答案和评分函数不得进入客户端课程包数据。
6. **每个课程包必须可独立校验。** 不允许依赖另一个课程包中的概念、课时、翻译或题库。

## 2. 推荐目录结构

小型验证课程可以集中在一个 `index.ts` 中。正式课程建议拆分：

```text
src/curricula/<course-id>/
  index.ts                 # 组装并导出 CurriculumPack
  knowledge.ts             # Course、Unit、Topic、Concept、Dependency
  lessons.ts               # 英文或主语言结构化课时
  localization.zh.ts       # 中文本地化资源（如果主内容不是中文）
  assessments.ts           # 仅服务端使用的形成性评估 provider
  visualizations.ts        # 可选的概念可视化配置
```

参考实现：

- `src/curricula/ap-calculus-ab/`
- `src/curricula/javascript-foundations/index.ts`

## 3. 开始生成前需要的课程需求

至少确认以下信息：

| 信息 | 示例 |
| --- | --- |
| 课程名称 | JavaScript Foundations |
| `courseId` | `javascript-foundations` |
| 学科 | Programming |
| 学习者 | 零基础高中生或大学新生 |
| 难度 | Beginner |
| 主内容语言 | English |
| 本地化语言 | Chinese |
| 课程范围 | 值、类型、变量、条件、循环 |
| 单元划分 | 语言基础、控制流、函数 |
| 最终能力 | 能阅读并编写小型 JavaScript 程序 |
| 是否需要题库 | 是，每个概念包含诊断与离堂检查 |
| 是否需要可视化 | 部分概念需要 |

如果课程范围、受众或学习结果不明确，应先澄清，避免生成大量无法形成连贯路径的课时。

## 4. ID 规则

- 所有 ID 使用小写 `kebab-case`。
- `CurriculumPack.id` 必须等于 `course.id`。
- ID 在同一个课程包内必须唯一且稳定；发布后不要因标题变化而修改 ID。
- 推荐格式：

```text
course:      javascript-foundations
unit:        javascript-foundations-unit-1-language-basics
topic:       javascript-values
concept:     js-values-and-types
lesson:      js-values-and-types-lesson-v1
dependency:  js-values-support-variables
question:    js-values-d1
```

- 路由由平台生成，不在课程内容中手写：

```text
/courses/<courseId>/learn/<unitId>/<conceptId>
```

## 5. CurriculumPack 必需内容

课程包必须满足 `src/curricula/types.ts` 中的 `CurriculumPack`：

| 字段 | 要求 |
| --- | --- |
| `id` | 与 `course.id` 完全一致 |
| `course` | 课程标题、学科、简介和完整 `unitIds` |
| `units` | 按 `sequence` 排序，列出所属 topic 和 concept |
| `topics` | 每个主题属于一个 unit，并列出 concept |
| `concepts` | 包含父级、目标、先修、误区、示例、难度和预计时间 |
| `dependencies` | 显式描述概念间的 prerequisite/supports/extends 关系 |
| `defaultUnitId` | 必须指向已注册单元 |
| `lessons` | 每个概念恰好一节结构化课时 |
| `teachingProfile` | AI 教师角色、受众、语气、术语策略和教学优先级 |
| `catalog` | 状态、难度标签和课程标签 |
| `capabilities` | 是否提供形成性评估和概念可视化 |
| `localizations` | 可选，按语言存放课程、单元、主题、概念和课时翻译 |
| `visualizations` | 可选，按 conceptId 存放可视化配置 |

课程包示意：

```ts
export const exampleCurriculum: CurriculumPack = {
  id: COURSE_ID,
  course,
  units,
  topics,
  concepts,
  dependencies,
  defaultUnitId: UNIT_1_ID,
  lessons,
  teachingProfile: {
    role: "Concept-first subject teacher",
    audience: "Beginning learners",
    tone: "Clear, precise, encouraging",
    terminologyPolicy: "Define new terms before using them independently.",
    learningPriorities: [
      "Build mental models before procedures",
      "Check misconceptions early",
      "Use evidence before claiming mastery",
    ],
  },
  catalog: {
    status: "preview",
    level: "Beginner",
    tags: ["example-subject"],
  },
  capabilities: {
    formativeAssessments: true,
    conceptVisualizations: false,
  },
  localizations: {
    zh: {
      course: { title: "示例课程" },
      units: {},
      topics: {},
      concepts: {},
      lessons: {},
    },
  },
};
```

## 6. 知识图谱规则

以下引用必须保持一致：

```text
Course.unitIds
  -> Unit.id

Unit.topicIds
  -> Topic.id

Unit.conceptIds
  -> Concept.id

Topic.conceptIds
  -> Concept.id

Concept.courseId / unitId / topicId
  -> 实际父级

Concept.prerequisiteConceptIds
  -> 同一课程包中已经存在的 Concept.id

ConceptDependency 两端
  -> 同一课程包中的 Concept.id
```

设计要求：

- 一个概念只表达一个可教学、可观察的核心能力。
- 概念标题不要等同于宽泛章节名，例如避免仅使用“函数”或“语法”。
- 先修关系必须有教学理由，不能只按教材目录顺序连接。
- 避免循环先修关系。
- `estimatedMinutes` 表示完成概念学习与反思的大致时间，不只是阅读时间。
- `commonMisconceptions` 应是可观察的错误心智模型，不是笼统的“学生不理解”。

## 7. 结构化课时标准

课时必须通过 `src/features/lessons/lesson-schema.ts` 校验。每个概念恰好对应一节课时。

### 必需教学内容

- 稳定的 `id`、`lessonId`、`courseId`、`unitId`、`conceptId`
- 明确的学习目标和成功标准
- 主语言课程标题与检索标签
- 至少一个结构化 `section`
- 直观解释与正式解释
- 至少一个 worked example
- 至少一个 guided question
- 至少一个 misconception check
- 反思提示
- 应用迁移任务
- 至少一个关键总结

### 可用 section 类型

```text
why_this_matters
intuition
formal_idea
worked_example
think_with_me
common_trap
reflection
try_applying_it
key_takeaways
```

### 内容质量要求

- 先解释“为什么”和“如何理解”，再给程序、公式或步骤。
- worked example 必须展示推理过程，不只给最终答案。
- guided question 应能暴露理解状态，不是简单复述定义。
- misconception check 必须包含错误说法、检查问题和纠正说明。
- application task 应要求迁移到新情境，而不是原例换数字。
- 检索标签应包含学科术语、常见别名和学习者可能使用的表达。

## 8. 本地化规则

- 主语言内容保存在标准课程和课时字段中。
- 翻译保存在 `localizations.<language>`，按原始 ID 覆盖。
- 翻译不得修改 ID、父级关系、先修关系或题目正确答案。
- 中文应使用自然教学语言，不做逐词直译。
- 专业术语策略应与 `teachingProfile.terminologyPolicy` 一致。
- `localizeLesson` 使用浅层覆盖。若翻译某个嵌套对象或数组，应提供该字段可直接使用的完整结构，不能只给半个嵌套对象。

最低本地化建议：

- course 标题、学科、描述
- unit/topic/concept 标题和描述
- lesson 标题、hook、intuition、formalExplanation、keyTakeaways
- 所有形成性评估题干、选项和反馈

## 9. 形成性评估与安全边界

每个启用评估的概念应包含：

- `diagnostic`：学习前诊断
- `exit_ticket`：学习后迁移检查

要求：

- 每道题有稳定且唯一的 question ID。
- 每个选项有稳定 ID。
- 题干、选项和反馈提供中英文版本。
- 诊断用于判断起点，不用于宣称掌握。
- 离堂检查应使用新情境验证迁移。
- 正确答案与评分逻辑只能存在于服务端 provider 中。

课程模块应导出 provider：

```ts
export const exampleAssessments = createFormativeAssessmentProvider({
  bank: assessmentBank,
  courseId: COURSE_ID,
  version: "example-formative-v1",
});
```

然后在 `src/curricula/server-resources.ts` 注册：

```ts
const assessmentProviders = new Map([
  ["example-course", exampleAssessments],
]);
```

只有 provider 已注册时，才能设置：

```ts
capabilities: {
  formativeAssessments: true,
  conceptVisualizations: false,
}
```

禁止把 assessment provider、答案键或评分函数放入 `CurriculumPack`，因为课程包会被传递给客户端组件。

## 10. 可视化规则

- 可视化是可选能力，没有适合的表达时应设为 `false`，不要为了填字段而生成装饰性图表。
- 当前 `LessonVisualization` 主要支持极限与连续性相关数学表示。
- 新学科需要新的可视化类型时，必须同时扩展：
  1. `LessonVisualization` 联合类型；
  2. 可视化数据校验；
  3. `LessonConceptVisualization` 渲染组件；
  4. 对应测试。
- 可视化中的数值、标签和 AI 教师引用证据必须一致。

## 11. 注册与验证步骤

### 注册课程包

在 `src/curricula/index.ts` 中导入并加入 `curriculumPacks`：

```ts
export const curriculumPacks = [
  existingCurriculum,
  exampleCurriculum,
] satisfies CurriculumPack[];
```

注册表启动时会执行通用完整性校验，包括：

- 重复 course ID
- pack ID 与 course ID 不一致
- 无效的默认单元
- 无效的 unit/topic/concept 父级引用
- 缺失先修概念
- 无效 dependency
- 课时 schema 错误
- 一个概念没有课时或拥有两个课时
- 可视化指向不存在的概念

### 必跑命令

```bash
npx tsc --noEmit
npm test
npm run lint
npm run build
```

生产构建必须能生成以下页面：

```text
/courses/<courseId>/learn
/courses/<courseId>/learn/<unitId>
/courses/<courseId>/learn/<unitId>/<conceptId>
```

课程内容变化后，在本地开发服务器运行期间重建向量索引：

```bash
npm run embeddings:build
```

索引接口应最终报告：

```text
isCurrent: true
missingCount: 0
staleCount: 0
orphanedCount: 0
```

## 12. 课程包验收清单

### 结构

- [ ] `pack.id === course.id`
- [ ] course 的 `unitIds` 与 units 完全一致
- [ ] 所有 unit/topic/concept 父级引用有效
- [ ] 没有循环或缺失先修关系
- [ ] 每个概念恰好对应一节课时
- [ ] 所有 lesson 的 courseId/unitId/conceptId 正确

### 教学质量

- [ ] 每个概念有明确、可观察的成功标准
- [ ] 每节课包含直观解释、正式解释和完整例子
- [ ] 每节课包含引导问题、误区检查和反思
- [ ] 应用任务要求迁移而不是机械重复
- [ ] AI 教师 profile 与学科和受众匹配

### 本地化与评估

- [ ] 课程库和学习页面不存在其他课程的硬编码文案
- [ ] 中文内容自然且术语一致
- [ ] 每个启用评估的概念都有 diagnostic 和 exit ticket
- [ ] 题目 ID 唯一，选项与反馈完整
- [ ] 答案和评分函数只存在于服务端

### 工程验证

- [ ] 类型检查通过
- [ ] 自动化测试通过
- [ ] lint 通过
- [ ] 生产构建通过
- [ ] 新课程页面实际返回 200
- [ ] 评估 API 返回正确 courseId
- [ ] RAG 索引覆盖率为 100%

## 13. 可直接交给 AI 的生成提示词

复制下面的提示词，并附上填写完成的 brief：

```text
请根据 docs/CURRICULUM_PACK_GUIDE.md 和我提供的课程 brief，为当前 AI Learning Platform 生成一个新的课程包。

开始前：
1. 完整读取 docs/CURRICULUM_PACK_GUIDE.md。
2. 读取 src/curricula/types.ts、src/features/knowledge/types.ts、src/features/lessons/lesson-schema.ts。
3. 参考 src/curricula/javascript-foundations/ 的小型实现和 src/curricula/ap-calculus-ab/ 的大型实现。
4. 如果 brief 缺少课程范围、受众、最终学习结果、单元划分或语言要求，先列出缺失项，不要直接生成课程。

实现要求：
- 使用稳定的 kebab-case ID。
- 先生成知识图谱，再生成每个概念的一对一结构化课时。
- 所有父级、先修、dependency 和 lesson 引用必须一致。
- 每个概念包含可观察的成功标准、常见误区和示例。
- 每节课包含直观解释、正式解释、worked example、guided question、misconception check、reflection 和 application transfer。
- 按 brief 提供自然的本地化内容。
- 如果启用形成性评估，为每个概念提供 diagnostic 和 exit_ticket，并把 provider 注册到 server-resources.ts。
- 不得把答案或评分函数放入可序列化 CurriculumPack。
- 不要生成当前渲染器不支持的 visualization kind；确需新增时同步实现类型、组件和测试。
- 在 curricula/index.ts 注册课程。
- 新增课程包完整性与关键行为测试。

验证要求：
- 运行 npx tsc --noEmit。
- 运行 npm test。
- 运行 npm run lint。
- 运行 npm run build。
- 启动应用并验证课程库、课程页、单元页、课时页和评估 API。
- 若已配置嵌入服务，运行 npm run embeddings:build 并验证覆盖率为 100%。

最终报告：
- 课程、单元、主题、概念和课时数量。
- 新增或修改的文件。
- 形成性评估和本地化覆盖情况。
- 所有验证命令的结果。
- 任何未完成项或外部依赖。
```

## 14. 不应做的事情

- 不要为新课程创建独立的学习页面副本。
- 不要在共享 UI 中写死课程标题、学科、单元或概念。
- 不要依赖默认课程查找新课程概念。
- 不要使用只有 `conceptId` 的新课时链接。
- 不要把 AI 生成内容直接当成已审核正式课程。
- 不要以“题目数量很多”替代知识图谱和教学路径质量。
- 不要跳过生产构建；它会发现客户端序列化和静态路由问题。
