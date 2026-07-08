import { z } from "zod";

const strongPassword = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .regex(/[a-z]/, "Must include a lowercase letter")
  .regex(/[A-Z]/, "Must include an uppercase letter")
  .regex(/[0-9]/, "Must include a number")
  .regex(/[^A-Za-z0-9]/, "Must include a symbol");

export const registerSchema = z.object({
  name: z.string().min(2, "Please enter your name").max(80),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
  remember: z.boolean().optional().default(false),
  totp: z.string().optional(),
});

export const verifyEmailSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "Enter the 6-digit code"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(10),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

export const adminPasswordSchema = strongPassword;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: strongPassword,
    confirm: z.string(),
  })
  .refine((d) => d.newPassword === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

export const addressSchema = z.object({
  label: z.string().default("Home"),
  fullName: z.string().min(2),
  phone: z.string().min(6),
  street: z.string().min(2),
  area: z.string().min(1),
  city: z.string().min(1),
  postalCode: z.string().optional(),
  isDefault: z.boolean().optional().default(false),
});

export const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(2),
  price: z.number().positive("Price must be greater than 0"),
  images: z.array(z.string().url()).min(1, "Add at least one image"),
  category: z.string().min(1),
  stock: z.number().int().min(0),
  featured: z.boolean().optional().default(false),
  active: z.boolean().optional().default(true),
});

export const deliveryZoneSchema = z.object({
  name: z.string().min(1),
  areas: z.array(z.string().min(1)).min(1, "Add at least one area"),
  charge: z.number().min(0),
  estimatedDays: z.string().min(1),
  active: z.boolean().optional().default(true),
  freeAbove: z.number().min(0).nullable().optional(),
  sortOrder: z.number().int().optional(),
});

export const calculateDeliverySchema = z.object({
  area: z.string().min(1),
  subtotal: z.number().min(0),
});

export const checkoutSchema = z.object({
  email: z.string().email(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1, "Your cart is empty"),
  area: z.string().min(1),
  address: z.object({
    fullName: z.string().min(2),
    phone: z.string().min(6),
    street: z.string().min(2),
    area: z.string().min(1),
    city: z.string().min(1),
    postalCode: z.string().optional(),
  }),
  notes: z.string().optional(),
  paymentMethod: z.enum(["stripe", "paypal", "cod"]),
});

export const settingsSchema = z.object({
  storeName: z.string().min(1),
  storeEmail: z.string().email().or(z.literal("")),
  currency: z.string().min(1),
  currencySymbol: z.string().min(1),
  stripeSecretKey: z.string().optional(),
  paypalClientId: z.string().optional(),
  freeDeliveryAbove: z.number().min(0).nullable().optional(),
  faviconUrl: z.string().optional(),
  googleAuthEnabled: z.boolean().optional(),
  smtpHost: z.string().optional(),
  smtpPort: z.number().int().min(1).max(65535).nullable().optional(),
  smtpUser: z.string().optional(),
  smtpPassword: z.string().optional(),
  smtpFrom: z.string().optional(),
  smtpSecure: z.boolean().optional(),
});
