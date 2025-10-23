import { z } from "zod";

// Enum values matching database
export const genderEnum = z.enum(["male", "female", "other"]);
export const positionEnum = z.enum(["goalkeeper", "defender", "midfielder", "forward"]);
export const dominantFootEnum = z.enum(["left", "right", "both"]);
export const bloodTypeEnum = z.enum([
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
]);
export const relationshipEnum = z.enum(["father", "mother", "guardian", "other"]);

// Player CSV row schema
export const playerCsvRowSchema = z.object({
  // Personal Info
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format"),
  gender: genderEnum,
  nationality: z.string().min(1, "Nationality is required"),
  city: z.string().min(1, "City is required"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email_prefix: z.string().min(1, "Email prefix is required"),

  // Football Info
  position: positionEnum,
  dominant_foot: dominantFootEnum,
  previous_club: z.string().optional(),

  // Medical Info
  blood_type: bloodTypeEnum.optional(),
  allergies: z.string().optional(),
  medical_conditions: z.string().optional(),
  medications: z.string().optional(),

  // Emergency Contact
  emergency_contact_name: z.string().min(1, "Emergency contact name is required"),
  emergency_contact_phone: z.string().min(1, "Emergency contact phone is required"),
  emergency_contact_relationship: relationshipEnum,

  // Parent/Guardian
  parent_first_name: z.string().min(1, "Parent first name is required"),
  parent_last_name: z.string().min(1, "Parent last name is required"),
  parent_email: z.string().email("Invalid parent email"),
  parent_phone: z.string().optional(),
  parent_relationship: relationshipEnum,

  // Team Assignment (optional)
  team_name: z.string().optional(),
  jersey_number: z.string().optional().refine(
    (val) => !val || (!isNaN(Number(val)) && Number(val) > 0 && Number(val) <= 99),
    "Jersey number must be between 1-99"
  ),
});

export type PlayerCsvRow = z.infer<typeof playerCsvRowSchema>;

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ParsedRow {
  rowNumber: number;
  data: Partial<PlayerCsvRow>;
  validation: ValidationResult;
}
