import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-line/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          © {new Date().getFullYear()} {site.name}. Built with Next.js, TypeScript and Tailwind.
        </p>
        <div className="flex gap-4">
          <a href={`mailto:${site.email}`} className="hover:text-text">Email</a>
          <a href={site.linkedin} className="hover:text-text" target="_blank" rel="noreferrer">LinkedIn</a>
          <a href={site.github} className="hover:text-text" target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </div>
    </footer>
  );
}
