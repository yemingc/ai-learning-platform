import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type PlaceholderPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryItems: string[];
  secondaryTitle: string;
  secondaryItems: string[];
};

export function PlaceholderPage({
  eyebrow,
  title,
  description,
  primaryItems,
  secondaryTitle,
  secondaryItems,
}: PlaceholderPageProps) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="max-w-3xl">
        <Badge variant="outline">{eyebrow}</Badge>
        <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
          {title}
        </h1>
        <p className="mt-5 text-base leading-7 text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <Badge className="w-fit" variant="secondary">
              Initial skeleton
            </Badge>
            <CardTitle>What this area will own</CardTitle>
            <CardDescription>
              These placeholders define product responsibility before backend
              data, auth, or AI orchestration are added.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-3 sm:grid-cols-2">
              {primaryItems.map((item) => (
                <li
                  className="rounded-lg border border-border bg-background/70 p-4 text-sm leading-6"
                  key={item}
                >
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Badge className="w-fit" variant="outline">
              Next layer
            </Badge>
            <CardTitle>{secondaryTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {secondaryItems.map((item) => (
                <li
                  className="border-l-2 border-primary pl-3 text-sm leading-6 text-muted-foreground"
                  key={item}
                >
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
