/** Synthetic financial rows for the grid demo. Deterministic, so every visitor sees the same data. */

export type FinRow = {
  id: number;
  company: string;
  sector: string;
  region: string;
  revenue: number; // USD millions
  ebitda: number; // USD millions
  margin: number; // %
  pe: number;
  change: number; // % 1Y
};

export const TOTAL_ROWS = 17_000;

const prefixes = ["Apex", "Blue", "Cedar", "Delta", "Echo", "Falcon", "Granite", "Harbor", "Iris", "Juniper", "Kestrel", "Lumen", "Meridian", "Nova", "Orion", "Pioneer", "Quartz", "Ridge", "Summit", "Titan", "Umber", "Vertex", "Willow", "Zenith"];
const suffixes = ["Capital", "Holdings", "Industries", "Systems", "Labs", "Partners", "Energy", "Health", "Logistics", "Foods", "Networks", "Materials"];
const sectors = ["Technology", "Healthcare", "Financials", "Energy", "Industrials", "Consumer", "Materials", "Utilities"];
const regions = ["North America", "Europe", "India", "APAC", "LatAm", "Middle East"];

// Small seeded PRNG (mulberry32).
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeRow(id: number): FinRow {
  const r = rng(id * 9973 + 17);
  const revenue = Math.round((50 + r() * 9950) * 10) / 10;
  const margin = Math.round((4 + r() * 36) * 10) / 10;
  return {
    id,
    company: `${prefixes[Math.floor(r() * prefixes.length)]} ${suffixes[Math.floor(r() * suffixes.length)]} ${id}`,
    sector: sectors[Math.floor(r() * sectors.length)],
    region: regions[Math.floor(r() * regions.length)],
    revenue,
    ebitda: Math.round(revenue * (margin / 100) * 10) / 10,
    margin,
    pe: Math.round((6 + r() * 44) * 10) / 10,
    change: Math.round((r() * 80 - 30) * 10) / 10,
  };
}

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

/** Simulated API latency per request, the same for both strategies. */
export const LATENCY_MS = 200;

/** "Old" approach: one request returns every row. */
export async function fetchAllRows(): Promise<FinRow[]> {
  await wait(LATENCY_MS);
  return Array.from({ length: TOTAL_ROWS }, (_, i) => makeRow(i + 1));
}

/** "New" approach: server-side pagination. */
export const PAGE_SIZE = 100;
export async function fetchPage(page: number): Promise<FinRow[]> {
  await wait(LATENCY_MS);
  const start = page * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, TOTAL_ROWS);
  return Array.from({ length: end - start }, (_, i) => makeRow(start + i + 1));
}
