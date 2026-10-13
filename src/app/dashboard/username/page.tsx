import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Container } from "@/components/ui";
import { UsernameClaim } from "./UsernameClaim";

export const metadata: Metadata = {
  title: "Choose your username",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ClaimUsernamePage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("username").eq("id", user.id).single();

  // Already claimed — nothing to do here.
  if (data?.username) redirect("/dashboard/edit");

  return (
    <Container className="flex min-h-[60vh] max-w-md flex-col justify-center py-16">
      <UsernameClaim />
    </Container>
  );
}
