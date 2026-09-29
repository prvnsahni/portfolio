import { getProject, projects } from "@/content/projects";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

// Prerender one image per case study at build time (mirrors page.tsx).
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);

  return renderOgImage({
    eyebrow: "Case study",
    title: project?.name ?? "Case study",
    subtitle: project?.subtitle ?? "",
    footerRight: project?.stack.slice(0, 3).join(" · "),
  });
}
