import type { MetadataRoute } from "next";
import { notes } from "@/content/notes";
import { projects } from "@/content/projects";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ["", "/work", "/work/ddmind/grid-demo", "/notes", "/about", "/resume", "/contact"];
  return [
    ...staticPaths.map((p) => ({ url: `${site.url}${p}` })),
    ...projects.map((p) => ({ url: `${site.url}/work/${p.slug}` })),
    ...notes.map((n) => ({ url: `${site.url}/notes/${n.slug}`, lastModified: n.updated })),
  ];
}
