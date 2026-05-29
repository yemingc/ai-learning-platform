import { PlaceholderPage } from "@/components/product/placeholder-page";

export default function DashboardPage() {
  return (
    <PlaceholderPage
      description="The Dashboard area will summarize concept readiness, current plan progress, learner memory signals, and practice readiness across AP Calculus AB."
      eyebrow="Learning dashboard"
      primaryItems={[
        "Current learning focus and next recommended concept",
        "Unit-level readiness across the AP Calculus AB sequence",
        "Recent memory updates from learning sessions",
        "Practice readiness separated from raw question count",
      ]}
      secondaryItems={[
        "Design dashboard metrics around learning progress and readiness.",
        "Keep application practice visible but downstream from concept mastery.",
        "Later connect cards to planner output and learner memory events.",
      ]}
      secondaryTitle="Progress model"
      title="A dashboard for mastery, not streaks alone."
    />
  );
}
