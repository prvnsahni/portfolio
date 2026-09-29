import { ButtonLink, Container } from "@/components/ui";

export default function NotFound() {
  return (
    <Container className="py-32 text-center">
      <p className="font-mono text-sm text-accent">404 · row not found</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">This page isn&apos;t in the dataset.</h1>
      <div className="mt-8 flex justify-center">
        <ButtonLink href="/">Back home</ButtonLink>
      </div>
    </Container>
  );
}
