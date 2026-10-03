import type { Metadata } from "next";
import { Container, SectionHeading } from "@/components/ui";
import { ResumeUploader } from "@/components/ResumeUploader";

// A private admin page — keep it out of search engines and sitemaps.
export const metadata: Metadata = {
  title: "Manage resume",
  robots: { index: false, follow: false },
};

export default function ManageResumePage() {
  return (
    <Container className="py-16 sm:py-20">
      <SectionHeading
        as="h1"
        eyebrow="Admin"
        title="Update my resume"
        intro="Drop a new PDF to replace the live resume instantly — no redeploy. Re-uploading the same filename overwrites it."
      />
      <ResumeUploader />
    </Container>
  );
}
