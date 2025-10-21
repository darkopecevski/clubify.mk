import { z } from "zod";

export const clubSchema = z.object({
  name: z
    .string()
    .min(2, "Club name must be at least 2 characters")
    .max(100, "Club name must be less than 100 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(100, "Slug must be less than 100 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    ),
  city: z
    .string()
    .min(2, "City must be at least 2 characters")
    .max(100, "City must be less than 100 characters"),
  founded_year: z
    .number()
    .int("Year must be a whole number")
    .min(1800, "Year must be after 1800")
    .max(new Date().getFullYear(), "Year cannot be in the future")
    .optional()
    .nullable(),
  contact_email: z.string().email("Invalid email address"),
  contact_phone: z
    .string()
    .regex(/^\+?[0-9\s-()]+$/, "Invalid phone number format")
    .optional()
    .nullable(),
  website: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),
  address: z.string().max(255, "Address must be less than 255 characters").optional().nullable(),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional().nullable(),
  logo_url: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),
  is_active: z.boolean(),
});

export type ClubInput = z.infer<typeof clubSchema>;
