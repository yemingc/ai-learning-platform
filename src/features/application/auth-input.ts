import { z } from "zod";

export const authEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email()
  .max(254);

export const authPasswordSchema = z.string().min(8).max(128);

const optionalDisplayNameSchema = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() === "" ? undefined : value,
  z.string().trim().min(1).max(64).optional(),
);

export const registrationInputSchema = z
  .object({
    email: authEmailSchema,
    name: optionalDisplayNameSchema,
    password: authPasswordSchema,
  })
  .strict();

export const signInInputSchema = z
  .object({
    email: authEmailSchema,
    password: authPasswordSchema,
  })
  .passthrough();
