import type { Metadata } from "next";
import { Container, SectionHeading } from "@/components/ui";
import { ResumeManager } from "@/components/ResumeManager";
import { getResumes } from "@/lib/resume";

// A private admin page — keep it out of search engines and sitemaps.
export const metadata: Metadata = {
  title: "Manage resume",
  robots: { index: false, follow: false },
};

// Always read the live list so the manager reflects the current store, and so
// deletions/additions show up immediately after a save.
export const dynamic = "force-dynamic";

export default async function ManageResumePage() {
  const resumes = await getResumes();

  return (
    <Container className="py-16 sm:py-20">
      <SectionHeading
        as="h1"
        eyebrow="Admin"
        title="Update my resume"
        intro="Add or remove PDFs, then hit Save to make the list live — no redeploy. Each file keeps a unique id, so even same-named uploads stay distinct."
      />
      <ResumeManager initial={resumes} />
    </Container>
  );
}
