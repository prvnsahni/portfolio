# portfolio.prvnsahni.com

Personal portfolio and study corner of Praveen Kumar, Senior Frontend Engineer.

Built with Next.js (App Router, static generation), TypeScript, Tailwind CSS v4, MDX and TanStack Virtual. Tested with Playwright; CI runs lint, build and tests on every push.

## Run locally

```bash
npm install
npm run dev          # http://localhost:3000
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build (all pages static) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm test` | Playwright tests (desktop + mobile); run `npx playwright install chromium` once first |

## Where things live

| Path | Contents |
| --- | --- |
| `src/lib/site.ts` | Name, email, links, tagline, availability |
| `src/content/projects.ts` | All case studies (one object per project) |
| `src/content/notes/index.ts` | Study-corner registry |
| `src/content/notes/*.mdx` | Note bodies (Markdown + React components) |
| `src/components/demos/` | Interactive demos (grid demo, memo demo) |
| `src/mdx-components.tsx` | Components available inside notes |
| `public/resume/` | Resume PDFs |

## Add a study note

1. Create `src/content/notes/my-topic.mdx` and write in Markdown.
2. Add an entry to `src/content/notes/index.ts` with `kind: "production"` (used at work) or `kind: "learning"` (studying).
3. To use a live demo inside a note, build it in `src/components/demos/`, register it in `src/mdx-components.tsx`, and write `<MyDemo />` in the note.

## Add or edit a case study

Edit `src/content/projects.ts`. Only use facts and numbers you can verify.

## Deploy to portfolio.prvnsahni.com (Vercel)

1. Push this folder to a new GitHub repo.
2. On vercel.com, **Add New → Project**, import the repo, keep the defaults, and deploy.
3. In the project, **Settings → Domains → Add** `portfolio.prvnsahni.com`.
4. At your domain registrar's DNS settings, add the record Vercel shows, usually:
   `CNAME  portfolio  →  cname.vercel-dns.com`
5. Wait for DNS to verify (minutes to a few hours). Vercel issues the HTTPS certificate automatically.

Every push to `main` redeploys the site.

## Roadmap

- [x] Phase 1: site, 5 case studies, resume, contact, 3 notes
- [x] Grid demo (17,000 rows, naive vs paged + virtualized)
- [ ] Phase 3: 3D data-portrait hero (React Three Fiber), static fallback on mobile and reduced motion
- [ ] More notes: Next.js App Router, RxJS, NgRx, Angular Signals (learning), Web Vitals
- [ ] Open Graph image, analytics
