import { steps } from "@/lib/steps";

export type PublicStep = {
  slug: string;
  name: string;
  timeframe: string;
  description: string;
  link: string;
  status: "planned" | "in-progress" | "done";
  percent: number; // 0-100
};

// Simple default mapping. You can update this object from the admin later
// or wire it to a real data source. For now everything starts as planned (0%).
const defaultProgress: Record<string, { status: PublicStep["status"]; percent: number }> = {};

export function getPublicSteps(): PublicStep[] {
  return steps.map((s) => {
    const slug = s.link.replace(/^\//, "");
    const prog = defaultProgress[slug] ?? { status: "planned", percent: 0 };
    return {
      slug,
      name: s.name,
      timeframe: s.timeframe,
      description: s.description,
      link: `/public/${slug}`,
      status: prog.status,
      percent: Math.max(0, Math.min(100, prog.percent)),
    } satisfies PublicStep;
  });
}

export function getPublicStep(slug: string): PublicStep | undefined {
  return getPublicSteps().find((s) => s.slug === slug);
}
