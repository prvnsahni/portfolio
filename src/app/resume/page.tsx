import type { Metadata } from "next";
import { Container, SectionHeading } from "@/components/ui";
import { ResumeViewer } from "@/components/ResumeViewer";
import { getResumes } from "@/lib/resume";

// Always read the latest resumes at request time so Blob updates go live
// without a redeploy. Switch to `revalidate = 60` if you prefer light caching.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Resume",
  description: "View or download Praveen Kumar's resume.",
};

export default async function ResumePage() {
  const resumes = await getResumes();

  return (
    <Container className="py-16 sm:py-20">
      <SectionHeading
        as="h1"
        eyebrow="Resume"
        title="My resume"
        intro="Preview it below or download a copy. This always shows the latest version."
      />
      {resumes.length === 0 ? (
        <p className="mt-10 text-muted">No resume is available right now — please check back soon.</p>
      ) : (
        <ResumeViewer resumes={resumes} />
      )}
    </Container>
  );
}
