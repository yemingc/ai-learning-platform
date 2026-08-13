# AP Calculus AB official-framework alignment

Audit date: 2026-07-15

Repository verification snapshot: 2026-08-13

Official references:

- [AP Calculus AB course page](https://apcentral.collegeboard.org/courses/ap-calculus-ab)
- [AP Calculus AB and BC Course and Exam Description](https://apcentral.collegeboard.org/media/pdf/ap-calculus-ab-and-bc-course-and-exam-description.pdf?course=ap-calculus-ab)

The College Board course page identifies eight AP Calculus AB units and gives both Unit 1 and Unit 2 a 10%–12% multiple-choice exam weighting. The current Course and Exam Description organizes Unit 1 into Topics 1.1–1.16 and Unit 2 into Topics 2.1–2.10, with about 22–23 AB class periods suggested for Unit 1 and 13–14 for Unit 2. Platform minute estimates describe direct self-study content rather than official classroom pacing. The College Board has announced 2026–27 clarifications but states that course content will not change.

This audit requires observable platform evidence. “Complete” means that an official topic has a stable concept mapping, a schema-complete lesson, substantive Chinese teaching copy, diagnostic and exit-ticket assessment support, retrieval coverage, and regression coverage. It does not mean that College Board has reviewed or endorsed the material.

## Current implementation scope

| Measure | Current repository state |
| --- | --- |
| Official AP units implemented | 2 of 8 |
| Official topics implemented | 26: Unit 1 Topics 1.1–1.16 and Unit 2 Topics 2.1–2.10 |
| Platform units/topics/concepts | 2 units, 11 topics, 27 concepts |
| Structured lessons | 27, one per concept |
| Chinese lesson rewrites | 27, one complete adaptive teaching rewrite per lesson |
| Formative assessment items | 108 bilingual items: 2 diagnostic and 2 exit-ticket items per concept |
| Concept visualizations | 10 selected Unit 1 concepts |
| Runtime catalog status | `preview` |

Units 3–8 are outside the implemented runtime scope. Their absence is a known
course-completion gap, not a partial implementation hidden behind placeholder
units. Optional embedding-index freshness and live-model quality are
environment-backed states and are not asserted by this source alignment audit.

## Unit 1 mapping

| Official topic | Platform concept evidence | Status | Implementation evidence |
| --- | --- | --- | --- |
| 1.1 Introducing Calculus: Can Change Occur at an Instant? | instantaneous-change-motivation | Complete | Compares average rates over shrinking nonzero intervals and motivates instantaneous behavior before the formal derivative unit. |
| 1.2 Defining Limits and Using Limit Notation | what-is-a-limit; limit-notation | Complete | Separates nearby behavior from point values and translates between words, symbols, graphs, and examples. |
| 1.3 Estimating Limit Values from Graphs | estimating-limits-from-graphs; one-sided-limits | Complete | Uses both directional traces, recognizes mismatch and nonexistence, and qualifies graphical evidence. |
| 1.4 Estimating Limit Values from Tables | estimating-limits-from-tables | Complete | Selects nearby inputs from both sides, avoids using the target row as the limit, and limits reported precision. |
| 1.5 Determining Limits Using Algebraic Properties of Limits | evaluating-limits-with-limit-laws | Complete | Applies limit laws with their conditions, checks direct substitution, and diagnoses indeterminate forms. |
| 1.6 Determining Limits Using Algebraic Manipulation | algebraic-limit-techniques | Complete | Teaches factoring, nearby-input cancellation, conjugates, and trigonometric rewriting with domain restrictions. |
| 1.7 Selecting Procedures for Determining Limits | selecting-limit-procedures | Complete | Uses representation type and expression structure to select and justify direct, numerical, graphical, algebraic, or bounding procedures. |
| 1.8 Determining Limits Using the Squeeze Theorem | squeeze-theorem | Complete | Builds a two-bound argument with a common limiting value and applies it to oscillatory behavior. |
| 1.9 Connecting Multiple Representations of Limits | connecting-limit-representations | Complete | Translates among graphical, numerical, analytical, and verbal evidence and checks representation limitations. |
| 1.10 Exploring Types of Discontinuities | classifying-discontinuities | Complete | Classifies removable, jump, and infinite discontinuities from directional limits and point values. |
| 1.11 Defining Continuity at a Point | continuity-at-a-point | Complete | Verifies the three conditions and identifies which condition fails. |
| 1.12 Confirming Continuity over an Interval | continuity-over-intervals | Complete | Uses familiar-function domains, excluded inputs, interval notation, and one-sided endpoint conditions. |
| 1.13 Removing Discontinuities | classifying-discontinuities; continuity-at-a-point | Complete | Uses a finite two-sided limit as the repair criterion and selects the required function value. |
| 1.14 Connecting Infinite Limits and Vertical Asymptotes | infinite-limits | Complete | Interprets directional unbounded behavior and vertical asymptotes without treating infinity as a function value. |
| 1.15 Connecting Limits at Infinity and Horizontal Asymptotes | limits-at-infinity | Complete | Uses dominant powers to determine end behavior and correctly interprets horizontal asymptotes. |
| 1.16 Working with the Intermediate Value Theorem | intermediate-value-theorem | Complete | Checks closed-interval continuity, brackets a target output, and makes an existence-only conclusion. |

Current Unit 1 alignment result:

- Complete: 16 of 16 official topics
- Partial: 0 of 16 official topics
- Gap: 0 of 16 official topics

Unit 1 contains 17 platform concepts because official Topic 1.2 is intentionally split into limit meaning and limit notation, while several official topics also draw on more than one prerequisite concept. The runtime order follows the official 1.1–1.16 progression even where the platform uses finer teaching granularity.

## Unit 2 mapping

| Official topic | Platform concept | Status |
| --- | --- | --- |
| 2.1 Defining Average and Instantaneous Rates of Change at a Point | average-and-instantaneous-rates-of-change | Complete |
| 2.2 Defining the Derivative of a Function and Using Derivative Notation | derivative-as-a-limit-and-tangent-slope | Complete |
| 2.3 Estimating Derivatives of a Function at a Point | estimating-derivatives-at-a-point | Complete |
| 2.4 Connecting Differentiability and Continuity | differentiability-and-continuity | Complete |
| 2.5 Applying the Power Rule | power-rule | Complete |
| 2.6 Constant, Sum, Difference, and Constant Multiple Rules | linearity-rules-for-derivatives | Complete |
| 2.7 Derivatives of cos x, sin x, e^x, and ln x | basic-transcendental-derivatives | Complete |
| 2.8 The Product Rule | product-rule | Complete |
| 2.9 The Quotient Rule | quotient-rule | Complete |
| 2.10 Derivatives of tan, cot, sec, and csc | remaining-trigonometric-derivatives | Complete |

Unit 2 explicitly continues from Unit 1’s instantaneous-change motivation, limit notation, one-sided limits, limit procedures, and continuity. Each Unit 2 concept has one canonical English lesson, substantive Chinese teaching copy, two diagnostic questions, two exit-ticket questions, and explicit prerequisite edges.

## Delivery and review status

The prior Unit 1 gaps were remediated with seven focused concepts placed at their official teaching positions: instantaneous-change-motivation, estimating-limits-from-tables, algebraic-limit-techniques, selecting-limit-procedures, connecting-limit-representations, classifying-discontinuities, and continuity-over-intervals. Each addition includes a knowledge-graph node, a full lesson, Chinese teaching copy, two diagnostic and two exit-ticket questions, an AI Teacher evaluation case, a RAG retrieval case, and regression coverage.

Unit 1 and Unit 2 are engineering-complete AI-authored previews. Their 27
concepts have one structured lesson and four bilingual formative items each,
and all 27 lessons have complete natural Chinese teaching rewrites. The ten
existing concept visualizations cover selected Unit 1 concepts rather than
every implemented lesson. Named subject-matter review is still required before
the course status can move from preview to reviewed or published. The versioned
whole-course brief at `docs/course-briefs/ap-calculus-ab.yaml` records Unit 1
and Unit 2 as implemented and defines Unit 3 as the next curriculum increment.
