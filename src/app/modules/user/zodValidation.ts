import { z } from "zod";

// Role enum
export const RoleEnum = z.enum(["ADMIN", "USER", "AGENT"]);

export const zodUserSchema = z.object({
  name: z.string().min(1, "Name is required"),

  email: z
    .string()
    .regex(/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/, "Invalid email format"),

  phone: z
    .string()
    .regex(
      /^(?:\+88)?01[3-9]\d{8}$/,
      "Phone must be a valid Bangladeshi number"
    )
    .optional(),
  password: z
    .string()
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/,
      "Password must be at least 6 characters and include letters, numbers, and a special character"
    ),

  picture: z.string().url("Invalid URL").optional(),

  role: RoleEnum.optional(),

  isActive: z.boolean().optional(),
  isDeleted: z.boolean().optional(),
  isBlocked: z.boolean().optional(),
  isVerified: z.boolean().optional(),

  auths: z
    .array(
      z.object({
        provider: z.string(),
        providerId: z.string(),
      })
    )
    .min(1, "At least one auth provider is required")
    .optional(),
});

export const zodUpdateUserSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),

  email: z
    .string()
    .regex(/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/, "Invalid email format")
    .optional(),

  phone: z
    .string()
    .regex(
      /^(?:\+88)?01[3-9]\d{8}$/,
      "Phone must be a valid Bangladeshi number"
    )
    .optional(),

  password: z
    .string()
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/,
      "Password must be at least 6 characters and include letters, numbers, and a special character"
    )
    .optional(),

  picture: z.string().url("Invalid URL").optional(),

  role: RoleEnum.optional(),

  isActive: z.boolean().optional(),
  isDeleted: z.boolean().optional(),
  isBlocked: z.boolean().optional(),
  isVerified: z.boolean().optional(),

  auths: z
    .array(
      z.object({
        provider: z.string(),
        providerId: z.string(),
      })
    )
    .optional(),
});
