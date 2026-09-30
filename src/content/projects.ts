/**
 * Case studies. Every fact here comes from the master project sheet.
 * Do not add numbers that are not verified there.
 */

export type Metric = { value: string; label: string };
export type Decision = { title: string; choice: string; tradeoff: string };

export type Project = {
  slug: string;
  name: string;
  subtitle: string;
  client?: string;
  period: string;
  role: string;
  stack: string[];
  featured: boolean;
  summary: string;
  metrics: Metric[];
  problem: string[];
  constraints: string[];
  approach: { title: string; body: string }[];
  decisions: Decision[];
  results: string[];
  lessons: string[];
  demos?: { href: string; label: string }[];
  publicLink?: { href: string; label: string };
  /**
   * Plain-words description of the case study's architecture diagram, used as
   * the SVG's accessible name. Its presence renders the Architecture section;
   * the diagram itself is selected by slug in src/components/diagrams.
   */
  diagram?: string;
};

export const projects: Project[] = [
  {
    slug: "ddmind",
    name: "DDMind",
    subtitle: "Private equity research and investment analysis platform",
    period: "Jan 2025 – Mar 2026",
    role: "Main developer, led 2 developers",
    stack: ["Angular 16 → 20", "TypeScript", "RxJS", "NGXS", "NgRx", "AG-Grid Enterprise", "AG Charts", "WebSockets", "AWS S3"],
    featured: true,
    summary:
      "An AI-assisted platform for researching equities, debt and company financials, replacing data kept in heavy Excel workbooks. I was main developer, led two developers, and worked directly with the client on requirements and estimates.",
    metrics: [
      { value: "8–10 s", label: "faster grid load" },
      { value: "20,000+", label: "financial records" },
      { value: "−12%", label: "bundle size" },
      { value: "−8%", label: "build time" },
    ],
    problem: [
      "Tables held 20,000+ financial records, with 17,000+ rows in a single table. The grid loaded every page at page load, took a long time to become usable, and froze after users loaded several files.",
      "The app was also behind on Angular versions, and the client was pursuing a certification that ruled out CDN-loaded assets and deprecated or outdated dependencies.",
    ],
    constraints: [
      "Pre-production product in its funding stage: requirements moved as the client refined the product.",
      "The client wanted every one of roughly 30–40 tabs to feel instant when clicked.",
      "The app would be sold as SaaS, so limits like upload counts had to be configurable per organization.",
    ],
    approach: [
      {
        title: "Two-layer grid fix",
        body: "On the data side, I moved to server-side pagination: only the page in view is fetched, and an unvisited page is fetched on demand. On the rendering side, I used AG-Grid's infinite row model and row virtualization, and cached fetched pages on the client.",
      },
      {
        title: "Grid customization",
        body: "API responses carried custom data that needed its own markup, so I extended the grid at runtime with custom cellRenderers. Per-table helper buttons change decimal places and run calculations on numeric cells only, through valueFormatter and valueGetter, and leave other cells untouched.",
      },
      {
        title: "Config-driven tabs with background prefetch",
        body: "An API response defines 5–6 main tabs with 6–7 sub-tabs each, every one holding tables, charts and content. Main content loads first; each tab's data is then prefetched in the background with a delay and cached, so switching tabs reads from cache.",
      },
      {
        title: "Angular v16 → v20 upgrade",
        body: "I proposed and led the upgrade: standalone components, the new control flow, OnPush and trackBy where lists re-rendered, and removal of unused code, packages and libraries.",
      },
      {
        title: "Streaming LLM chat",
        body: "A WebSocket chat with streaming responses lets users ask direct questions about a company or report instead of reading it end to end. OpenAI and Anthropic are switchable, with provider routing on the backend.",
      },
      {
        title: "Reusable charts, state and uploads",
        body: "One config-driven AG Charts component powers almost every chart. State uses NGXS and NgRx where needed and RxJS BehaviorSubject services at global, module and component level. Files upload directly to AWS S3 through pre-signed URLs (up to 50 MB each, 10–25 files per organization).",
      },
      {
        title: "Reverse-engineered data flow",
        body: "I studied how a reference product processed market data and replicated the behaviour on the frontend, shaping request and response structures so the backend could call the same market-data APIs consistently.",
      },
    ],
    decisions: [
      {
        title: "Prefetch tab data instead of loading on click",
        choice: "Load main content first, then fetch every tab's data in the background with a delay and cache it.",
        tradeoff: "More backend calls for tabs some users never open. Accepted because instant tab switching was the client's priority.",
      },
      {
        title: "Lazy-load almost everything",
        choice: "Nearly every module is lazy-loaded, and heavy features were split into sub-modules.",
        tradeoff: "Tab data is the deliberate exception: components stay lazy, but their data is prefetched.",
      },
      {
        title: "Direct-to-S3 uploads",
        choice: "The frontend uploads straight to S3 with a pre-signed URL from the backend.",
        tradeoff: "Upload traffic never passes through the API server, at the cost of handling URL expiry and per-org limits on the client.",
      },
    ],
    results: [
      "Grid load time cut by about 8–10 seconds, and the freezes after multiple file loads stopped.",
      "Bundle size down 12% and build time down 8% after the v20 upgrade, with deprecated dependencies removed for the client's certification.",
      "Quality gates (ESLint and Prettier on pre-push, the same checks in GitHub Actions) and a Dockerized dev environment.",
    ],
    lessons: [
      "Record Lighthouse and Web Vitals numbers before and after every optimization. I checked performance with Lighthouse and DevTools but did not keep the scores.",
      "With Angular 17+, @defer with prefetch-on-idle can handle tab components, and prefetching only the next likely tabs would cut unneeded calls.",
    ],
    demos: [
      { href: "/work/ddmind/grid-demo", label: "Try the 17,000-row grid demo" },
      { href: "/work/ddmind/chat-demo", label: "Try the streaming chat demo" },
    ],
    diagram:
      "Architecture diagram. The browser shows a virtualized grid that renders only the visible rows and reads pages from a client-side page cache; on a cache miss the cache fetches one page from the paged API. Separately, the main tab content loads first, then each tab's data is prefetched in the background after a delay and kept in a tab cache, so switching to a tab reads from the cache instead of fetching again.",
  },
  {
    slug: "ccm",
    name: "CCM",
    subtitle: "Chase Cost Management — contract and vendor management platform",
    period: "Mar 2026 – Jul 2026",
    role: "Project setup, code reviewer for 2 developers, then module owner",
    stack: ["React", "Next.js (Pages Router)", "SSR / SSG", "Redux", "TypeScript", "WebSockets", "AWS S3", "v0"],
    featured: true,
    summary:
      "A platform for managing thousands of vendors and their contracts, used by about 100 people, with an AI chat for querying contracts. I set up the Next.js foundation, reviewed two developers' work, stabilized the codebase and built two modules.",
    metrics: [
      { value: "1,000s", label: "vendors managed" },
      { value: "~100", label: "users" },
      { value: "2", label: "developers reviewed" },
      { value: "2", label: "modules built" },
    ],
    problem: [
      "The client supplied UI generated with v0 (Vercel), which needed to become a real production codebase.",
      "Later, while I was on another project, forms and other features in CCM started breaking almost daily.",
    ],
    constraints: [
      "Mostly forms and tables, with fields that depend on other fields' values.",
      "A small team: two developers continued the work between my setup and my return.",
    ],
    approach: [
      {
        title: "Setup from v0 to production",
        body: "I moved the v0 UI into a Next.js codebase using the Pages Router, with server-side and static rendering where it fit, plus architecture, tooling and reusable boilerplate the team built on.",
      },
      {
        title: "Review, then stabilize",
        body: "I came back as code reviewer for two developers, fixed the recurring form and feature failures, and got the app to the point where errors became rare.",
      },
      {
        title: "AI Sync and User modules",
        body: "AI Sync is a WebSocket chat with streaming responses for querying the contracts assigned to a user. The User module gives admins access control over other users.",
      },
      {
        title: "Dynamic forms and performance",
        body: "Complex forms with conditional, nested dependent fields, and data tables for contracts and vendors. React.memo, useMemo and useCallback avoid needless re-renders; pages are lazy-loaded and API responses cached.",
      },
    ],
    decisions: [
      {
        title: "Adapt the v0 UI instead of rebuilding it",
        choice: "Wire the client's generated UI into Next.js with Redux and REST.",
        tradeoff: "A faster start that matched the client-approved design; the generated UI still had to be adapted to Redux and the API layer.",
      },
      {
        title: "Direct-to-S3 uploads",
        choice: "Pre-signed URLs from the backend; the frontend uploads files (up to 25 MB) directly.",
        tradeoff: "Keeps file traffic off the API server.",
      },
    ],
    results: [
      "A production Next.js foundation the rest of the team built on.",
      "Daily breakages reduced to rare errors after review and stabilization.",
      "Two complete modules shipped: AI Sync and User management.",
    ],
    lessons: [
      "Automated tests on the form logic would have caught the regressions earlier than review alone.",
    ],
    demos: [{ href: "/work/qbench/form-demo", label: "Try the config-driven form demo" },{ href: "/work/ddmind/chat-demo", label: "Try the streaming chat demo" }],
    diagram:
      "Architecture diagram. The v0-generated UI is ported into a Next.js app on the Pages Router with server-side and static rendering, wired through a Redux store to a REST API. Separately, the AI Sync chat opens a WebSocket to the backend and streams replies back, and file uploads request a pre-signed URL from the backend and then upload directly to Amazon S3.",
  },
  {
    slug: "paper-tiger",
    name: "Paper Tiger",
    subtitle: "Academic research and writing platform",
    period: "Mar 2023 – Sep 2024",
    role: "Sole frontend engineer, end to end",
    stack: ["React", "Redux", "Custom hooks", "Context API", "DevExpress", "TinyMCE", "Google Cloud Storage", "OAuth 2.0"],
    featured: true,
    summary:
      "A tool that helps students plan, structure, research and write academic papers and manage citations. I built the entire React frontend alone, from an empty repo to production.",
    metrics: [
      { value: "5", label: "modules built solo" },
      { value: "~2 MB", label: "JSON per paper, client-side" },
      { value: "0 → prod", label: "sole frontend engineer" },
    ],
    problem: [
      "Students needed one place to outline, read, extract, organize and write, instead of juggling separate tools.",
      "Each research paper came with about 2 MB of JSON that the frontend had to handle directly.",
    ],
    constraints: [
      "One frontend engineer for the whole tenure.",
      "The Django and PostgreSQL backend, and the NER/ML extraction in Explorer, were built by others.",
    ],
    approach: [
      {
        title: "Foundation",
        body: "Architecture, tooling, routing, error handling, the API layer and authentication with OAuth 2.0 and Google Sign-In, all set up from scratch.",
      },
      {
        title: "Five modules",
        body: "Outliner for restructuring, Reader with highlighting and annotation, Explorer for extracted data, Builder for clustering into a tree, and Writer, a TinyMCE-based word processor.",
      },
      {
        title: "Kanban workflow",
        body: "Drag-and-drop columns built with DevExpress for managing a paper's parts.",
      },
      {
        title: "Large client-side data",
        body: "About 2 MB of JSON per paper served from Google Cloud Storage and handled on the frontend. File metadata lived in Redux so the app never read stale cached values. PDFs uploaded directly to the bucket through signed URLs.",
      },
    ],
    decisions: [
      {
        title: "Keep file metadata in Redux",
        choice: "Track file information in the store rather than trusting cached responses.",
        tradeoff: "More state to manage, but it avoided getting the same stale value back from cache.",
      },
    ],
    results: [
      "A complete five-module product delivered by one frontend engineer and handed to DevOps for deployment.",
    ],
    lessons: [
      "Next time I would extract the shared hooks and components into a small internal package from day one, and add tests before the codebase grows.",
    ],
    diagram:
      "Architecture diagram. Five modules — Outliner, Reader, Explorer, Builder and Writer — feed a single Redux store, which reads and writes each paper's roughly 2 MB of JSON in Google Cloud Storage through signed URLs.",
  },
  {
    slug: "block-power",
    name: "Block Power",
    subtitle: "Community engagement and voting platform",
    client: "Harvard professor",
    period: "Jan 2024 – Mar 2025",
    role: "Sole frontend engineer",
    stack: ["React", "Redux", "Mobile-first", "RBAC", "JWT"],
    featured: false,
    summary:
      "A customizable platform for US organizations working on health, wealth, power-building and civic campaigns. Community ambassadors earn points by inviting people and completing challenges, then redeem rewards. About 250 users.",
    metrics: [
      { value: "~250", label: "users" },
      { value: "1", label: "app for every role" },
    ],
    problem: [
      "Ambassadors mostly used their phones, and several user types needed different features without a separate admin app.",
    ],
    constraints: ["One frontend engineer.", "Requirements came directly from the client on calls."],
    approach: [
      {
        title: "Mobile-web-first",
        body: "Designed for phone browsers first: forms, card UI, challenges, points, referral and reward flows, and voting and nomination screens.",
      },
      {
        title: "Role-based access in one app",
        body: "Multiple user types, each seeing different features, handled with role-based access control rather than a separate admin panel.",
      },
      {
        title: "Direct client work",
        body: "I estimated work and took requirement calls with the client alongside the project manager.",
      },
    ],
    decisions: [
      {
        title: "No separate admin app",
        choice: "Role-based access inside one React app.",
        tradeoff: "One codebase to maintain, with more care needed in routing and permissions.",
      },
    ],
    results: ["Delivered the full frontend for about 250 users."],
    lessons: ["Next time I would add automated tests around role permissions, so a change for one user type cannot leak features to another."],
    diagram:
      "Architecture diagram. One React app uses role-based access to route each user type to its own features: ambassadors see points, referrals and voting, while other user types each see their own features, with no separate admin app.",
  },
  {
    slug: "qbench",
    name: "Qbench",
    subtitle: "Laboratory SaaS customer portal and billing",
    period: "May 2021 – Dec 2022",
    role: "Sole frontend engineer",
    stack: ["React", "Redux", "React-Query", "Custom hooks", "Stripe Checkout", "Azure Blob Storage"],
    featured: false,
    summary:
      "A SaaS portal for managing laboratory data from test start to completion. A super admin configures table columns, form elements and form order, and the portal renders them without code changes.",
    metrics: [
      { value: "0", label: "code changes to reconfigure" },
      { value: "Stripe", label: "billing & subscriptions" },
    ],
    problem: [
      "Every customer needed different columns, fields and form order, and changing code per customer would not scale.",
    ],
    constraints: ["One frontend engineer.", "Every form element type had to be supported from configuration."],
    approach: [
      {
        title: "Config-driven engine",
        body: "An engine that renders dynamic forms and tables from backend configuration through a common control panel, handling every form element type.",
      },
      {
        title: "Billing and subscriptions",
        body: "A billing module on Stripe Checkout covering subscriptions, payments, invoices and transactions.",
      },
      {
        title: "Data and uploads",
        body: "Redux for app state, React-Query for server data and caching, and direct uploads to Azure Blob Storage through pre-signed URLs.",
      },
    ],
    decisions: [
      {
        title: "Configuration over code",
        choice: "Render UI from backend config instead of building per-customer screens.",
        tradeoff: "A more complex engine up front, in exchange for admins customizing the portal themselves.",
      },
    ],
    results: ["Admins reconfigure the portal without developer involvement."],
    lessons: ["A schema for the configuration, validated on load, would make the engine safer to extend."],
    demos: [{ href: "/work/qbench/form-demo", label: "Try the config-driven form demo" }],
    publicLink: { href: "https://qbench.com/products/customer-web-portal", label: "Qbench customer web portal (public page)" },
    diagram:
      "Architecture diagram. Backend configuration drives a config-driven engine that renders dynamic forms and tables without code changes. A separate billing module uses Stripe Checkout for subscriptions, payments and invoices.",
  },
];

export const earlierProjects = [
  { name: "Youxta", period: "Jun 2020 – Jun 2021", stack: "Angular 10, Angular Material, RxJS, Stripe", summary: "Lawyer discovery and hiring platform: UI, Stripe payments and appointment booking." },
  { name: "Ignite", period: "Nov 2020 – Mar 2021", stack: "Angular 8, Dragula, Froala, Cloudinary", summary: "Recruitment SaaS: built a drag-and-drop portfolio and career-page builder with the team." },
  { name: "Envy Pet Care", period: "Jul 2019 – Nov 2020", stack: "Angular 7, AG-Grid, FullCalendar", summary: "Pet reservation SPA: bookings, invoicing, Gravity Payments via emulator; contributed to the Angular v6 → v8 upgrade." },
  { name: "Together Now", period: "Feb 2022 – Jun 2022", stack: "React, Redux, React-Query", summary: "Artwork review platform: commenting and status-based approve/reject flows." },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}
