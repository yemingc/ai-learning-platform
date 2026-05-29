import {
  apCalculusABKnowledgeGraph,
  apCalculusABUnit1ConceptDependencies,
  apCalculusABUnit1Concepts,
} from "@/features/knowledge/ap-calculus-ab";
import type {
  Concept,
  ConceptDependency,
  ConceptId,
  TopicId,
  UnitId,
} from "@/features/knowledge/types";

export function getConcepts(): Concept[] {
  return apCalculusABUnit1Concepts;
}

export function getConceptById(conceptId: ConceptId): Concept | undefined {
  return apCalculusABKnowledgeGraph.concepts.find(
    (concept) => concept.id === conceptId,
  );
}

export function getConceptsByUnit(unitId: UnitId): Concept[] {
  return apCalculusABKnowledgeGraph.concepts.filter(
    (concept) => concept.unitId === unitId,
  );
}

export function getConceptsByTopic(topicId: TopicId): Concept[] {
  return apCalculusABKnowledgeGraph.concepts.filter(
    (concept) => concept.topicId === topicId,
  );
}

export function getConceptDependencies(
  conceptId: ConceptId,
): ConceptDependency[] {
  return apCalculusABUnit1ConceptDependencies.filter(
    (dependency) =>
      dependency.dependentConceptId === conceptId ||
      dependency.prerequisiteConceptId === conceptId,
  );
}

export function getNextConcepts(conceptId: ConceptId): Concept[] {
  return apCalculusABUnit1ConceptDependencies
    .filter((dependency) => dependency.prerequisiteConceptId === conceptId)
    .map((dependency) => getConceptById(dependency.dependentConceptId))
    .filter((concept): concept is Concept => Boolean(concept));
}

export function getPrerequisiteConcepts(conceptId: ConceptId): Concept[] {
  const concept = getConceptById(conceptId);

  if (!concept) {
    return [];
  }

  return concept.prerequisiteConceptIds
    .map((prerequisiteId) => getConceptById(prerequisiteId))
    .filter((prerequisite): prerequisite is Concept => Boolean(prerequisite));
}
