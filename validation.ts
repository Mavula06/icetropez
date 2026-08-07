import { z } from 'zod';

export const emailSchema = z.string().email('Enter a valid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password is too long');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z
  .object({
    full_name: z.string().min(2, 'Enter your full name').max(80),
    email: emailSchema,
    phone: z
      .string()
      .min(10, 'Enter a valid phone number')
      .max(20)
      .optional()
      .or(z.literal('')),
    password: passwordSchema,
    confirmPassword: z.string(),
    referral_code: z.string().max(8).optional().or(z.literal('')),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const depositSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
});

export const withdrawalSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  bank_name: z.string().min(2, 'Bank name is required').max(60),
  account_number: z.string().min(5, 'Enter a valid account number').max(20),
  branch_code: z.string().min(4, 'Enter a valid branch code').max(10),
  account_holder: z.string().min(2, 'Account holder is required').max(80),
});

export const investmentSchema = z.object({
  plan_id: z.string().uuid(),
  amount: z.number().positive('Amount must be positive'),
});

export const planSchema = z.object({
  name: z.string().min(2, 'Name is required').max(80),
  description: z.string().max(500).optional().or(z.literal('')),
  min_amount: z.number().positive().max(10000000),
  max_amount: z.number().positive().max(10000000),
  duration_days: z.number().int().positive().max(3650),
  return_rate: z.number().positive().max(1000),
  earnings_type: z.enum(['daily', 'maturity']),
  is_active: z.boolean(),
});

export const settingsSchema = z.object({
  company_name: z.string().min(2).max(120),
  bank_name: z.string().min(2).max(120),
  account_number: z.string().min(5).max(30),
  branch_code: z.string().min(4).max(10),
  account_holder: z.string().min(2).max(120),
  minimum_deposit: z.number().positive().max(10000000),
  referral_percentage: z.number().min(0).max(100),
  support_email: z.string().email(),
  contact_phone: z.string().min(5).max(30),
});

export const announcementSchema = z.object({
  title: z.string().min(2).max(120),
  message: z.string().min(2).max(1000),
  is_active: z.boolean(),
});

export const profileSchema = z.object({
  full_name: z.string().min(2).max(80),
  phone: z.string().max(20).optional().or(z.literal('')),
  avatar_url: z.string().url().optional().or(z.literal('')).or(z.null()),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type DepositInput = z.infer<typeof depositSchema>;
export type WithdrawalInput = z.infer<typeof withdrawalSchema>;
export type InvestmentInput = z.infer<typeof investmentSchema>;
export type PlanInput = z.infer<typeof planSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
export type AnnouncementInput = z.infer<typeof announcementSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
