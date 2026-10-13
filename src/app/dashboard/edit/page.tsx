import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Container } from "@/components/ui";
import { DEFAULT_THEME } from "@/lib/config/themes";
import type { Profile } from "@/lib/linkbio/types";
import { EditForm } from "./EditForm";

export const metadata: Metadata = {
  title: "Edit your page",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function EditPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  // No profile row yet (trigger should have made one) — or no username claimed.
  if (!data) {
    redirect("/dashboard/username");
  }
  if (!data.username) {
    redirect("/dashboard/username");
  }

  const profile: Profile = {
    ...data,
    theme: data.theme ?? DEFAULT_THEME,
    socials: data.socials ?? {},
  };

  return (
    <Container className="py-10">
      <EditForm profile={profile} />
    </Container>
  );
}
