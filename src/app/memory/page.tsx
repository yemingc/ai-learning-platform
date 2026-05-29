import { MemoryPageClient } from "@/components/memory/memory-page-client";
import {
  AP_CALCULUS_AB_UNIT_1_ID,
} from "@/features/knowledge/ap-calculus-ab";
import { getConceptsByUnit } from "@/features/knowledge/get-concepts";

export default function MemoryPage() {
  return (
    <MemoryPageClient concepts={getConceptsByUnit(AP_CALCULUS_AB_UNIT_1_ID)} />
  );
}
