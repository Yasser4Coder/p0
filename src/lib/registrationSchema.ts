import { z } from "zod";
import { ALGERIAN_WILAYAS } from "./wilayas";

export const SHIRT_SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;

/** Trim + collapse spaces; used for duplicate email checks. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Lenient international / local numbers (digits, spaces, +, common separators). */
const phoneRegex = /^[+]?[0-9][\d\s()./-]{6,20}$/;

export const registrationSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(80, "First name is too long"),
  familyName: z
    .string()
    .trim()
    .min(2, "Family name must be at least 2 characters")
    .max(80, "Family name is too long"),
  phone: z
    .string()
    .trim()
    .min(8, "Enter a valid phone number")
    .max(24, "Phone number is too long")
    .regex(phoneRegex, "Use digits; you may start with + or country code"),
  wilaya: z.enum(ALGERIAN_WILAYAS, {
    errorMap: () => ({ message: "Select your wilaya" }),
  }),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address")
    .max(120, "Email is too long")
    .transform(normalizeEmail)
    .refine((e) => !e.includes("/"), "Invalid email address"),
  teamName: z
    .string()
    .trim()
    .min(2, "Team name must be at least 2 characters")
    .max(100, "Team name is too long"),
  nenSkill: z
    .string()
    .trim()
    .min(2, "Describe your skill / nen path")
    .max(200, "Keep it under 200 characters"),
  hackathonBefore: z.enum(["yes", "no"], {
    errorMap: () => ({ message: "Please select yes or no" }),
  }),
  shirtSize: z.enum(SHIRT_SIZES, {
    errorMap: () => ({ message: "Select a T-shirt size" }),
  }),
  matricule: z
    .string()
    .trim()
    .min(3, "Matricule must be at least 3 characters")
    .max(40, "Matricule is too long")
    .regex(
      /^[A-Za-z0-9][A-Za-z0-9\s./-]*$/,
      "Use letters, numbers, and common ID characters only",
    ),
});

export type RegistrationPayload = z.infer<typeof registrationSchema>;
