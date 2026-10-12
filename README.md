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
| `npm run resume:upload` | Upload resume PDF(s) to the Blob store (see "Update the resume") |

## Where things live

| Path | Contents |
| --- | --- |
| `src/lib/site.ts` | Name, email, links, tagline, availability |
| `src/content/projects.ts` | All case studies (one object per project) |
| `src/content/notes/index.ts` | Study-corner registry |
| `src/content/notes/*.mdx` | Note bodies (Markdown + React components) |
| `src/components/demos/` | Interactive demos (grid demo, memo demo) |
| `src/mdx-components.tsx` | Components available inside notes |
| `public/resume/` | Resume PDFs (local dev fallback / seed for the Blob store) |
| `src/lib/resume.ts` | Lists resumes from the Blob store, falling back to `public/resume/` |
| `src/app/resume/page.tsx` | Resume page — inline preview + download |
| `src/app/resume/manage/page.tsx` | Password-gated drag-drop upload page (`noindex`) |
| `src/app/api/resume/upload/route.ts` | Vends short-lived client-upload tokens after checking `RESUME_ADMIN_SECRET` |

## Add a study note

1. Create `src/content/notes/my-topic.mdx` and write in Markdown.
2. Add an entry to `src/content/notes/index.ts` with `kind: "production"` (used at work) or `kind: "learning"` (studying).
3. To use a live demo inside a note, build it in `src/components/demos/`, register it in `src/mdx-components.tsx`, and write `<MyDemo />` in the note.

## Add or edit a case study

Edit `src/content/projects.ts`. Only use facts and numbers you can verify.

## Update the resume

The `/resume` page previews and lists PDFs live from a [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) store (prefix `resume/`), so updates appear **without a redeploy**. Any PDF in the store is picked up automatically; the version label comes from the filename.

**One-time setup**

1. On Vercel: **Storage → Create Database → Blob**, and connect it to this project.
2. Pull the token locally: `vercel env pull .env.local` (creates `.env.local` with `BLOB_READ_WRITE_TOKEN`). See `.env.example`.
3. Set `RESUME_ADMIN_SECRET` to a long random string — in `.env.local` and in Vercel (**Settings → Environment Variables**). This is the password for the in-browser upload page below.
4. Seed it from the PDFs already in the repo: `npm run resume:upload`.

**To update later** — any of:

- **In-browser (easiest):** visit [`/resume/manage`](https://portfolio.prvnsahni.com/resume/manage), enter `RESUME_ADMIN_SECRET`, and drag a PDF in. It uploads straight from the browser to Blob (the server only vends a short-lived token after checking the password) and goes live immediately. The page is `noindex`.
- Drop the PDF into the Blob store from the Vercel dashboard (**Storage → your store → Upload**), or
- Run `npm run resume:upload -- ./path/to/Resume.pdf` (re-uploading the same filename replaces it).

Re-uploading the same filename overwrites it in place, so the resume title stays stable. Locally, with no token set, the `/resume` page falls back to the PDFs in `public/resume/`.

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
- [x] Open Graph / Twitter images (dynamic, per page)
- [ ] Analytics
