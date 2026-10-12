import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui";
import { getUser } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Log in",
  robots: { index: false, follow: false },
};

// Session state is per-request.
export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const [user, { redirect: redirectParam }] = await Promise.all([getUser(), searchParams]);
  const redirectTo = typeof redirectParam === "string" ? redirectParam : "/dashboard/edit";

  // Already logged in — skip the form.
  if (user) redirect(redirectTo);

  return (
    <Container className="flex min-h-[70vh] max-w-md flex-col justify-center py-16">
      <LoginForm redirectTo={redirectTo} />
    </Container>
  );
}
