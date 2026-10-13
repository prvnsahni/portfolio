import type { SocialKey } from "@/lib/config/socials";
import type { ThemeId } from "@/lib/config/themes";

export type Socials = Partial<Record<SocialKey, string>>;

/** A row from public.profiles. */
export type Profile = {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  theme: ThemeId;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  socials: Socials;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

/** A row from public.profile_items (custom links / custom fields). */
export type ProfileItem = {
  id: string;
  user_id: string;
  kind: "link" | "field";
  label: string | null;
  value: string | null;
  type: "text" | "link" | "phone" | "email";
  position: number;
  is_visible: boolean;
  created_at: string;
};
