import { z } from "zod";
import { SOCIAL_PLATFORMS } from "@/lib/config/socials";
import { THEMES } from "@/lib/config/themes";
import { isReservedUsername } from "@/lib/config/reserved";

export const BIO_MAX = 160;

const themeIds = THEMES.map((t) => t.id) as [string, ...string[]];

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "At least 3 characters")
  .max(30, "At most 30 characters")
  .regex(/^[a-z0-9_-]+$/, "Only a-z, 0-9, _ and -")
  .refine((v) => !isReservedUsername(v), "That username is reserved");

// Optional free-text that treats "" as undefined.
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

const optionalEmail = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : undefined))
  .refine((v) => v === undefined || z.string().email().safeParse(v).success, "Enter a valid email");

/** The editable profile fields (username handled separately so we can warn on change). */
export const profileSchema = z.object({
  display_name: optionalText(80),
  bio: optionalText(BIO_MAX),
  theme: z.enum(themeIds),
  phone: optionalText(40),
  email: optionalEmail,
  whatsapp: optionalText(40),
  is_published: z.boolean(),
  socials: z.object(
    Object.fromEntries(
      SOCIAL_PLATFORMS.map((p) => [p.key, z.string().trim().max(300).optional()]),
    ) as Record<(typeof SOCIAL_PLATFORMS)[number]["key"], z.ZodOptional<z.ZodString>>,
  ),
});

export type ProfileFormValues = z.input<typeof profileSchema>;
export type ProfileFormParsed = z.output<typeof profileSchema>;
