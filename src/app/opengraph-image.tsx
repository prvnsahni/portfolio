import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og";
import { site } from "@/lib/site";

export const alt = `${site.name} — ${site.title}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    eyebrow: site.title,
    title: site.name,
    subtitle: site.tagline,
    footerRight: "Angular · React · Next.js",
  });
}
