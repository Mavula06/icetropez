import { describe, it, expect } from 'vitest';
import {
  emailSchema,
  passwordSchema,
  loginSchema,
  registerSchema,
  depositSchema,
  withdrawalSchema,
  planSchema,
  settingsSchema,
} from '@/lib/validation';

describe('emailSchema', () => {
  it('accepts valid emails', () => {
    expect(emailSchema.safeParse('user@example.com').success).toBe(true);
  });
  it('rejects invalid emails', () => {
    expect(emailSchema.safeParse('not-an-email').success).toBe(false);
    expect(emailSchema.safeParse('').success).toBe(false);
  });
});

describe('passwordSchema', () => {
  it('accepts strong passwords', () => {
    expect(passwordSchema.safeParse('Str0ngP@ss!').success).toBe(true);
  });
  it('rejects short passwords', () => {
    expect(passwordSchema.safeParse('short').success).toBe(false);
  });
  it('rejects overly long passwords', () => {
    expect(passwordSchema.safeParse('a'.repeat(73)).success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('accepts valid login data', () => {
    expect(loginSchema.safeParse({ email: 'user@example.com', password: 'password123' }).success).toBe(true);
  });
  it('rejects missing password', () => {
    expect(loginSchema.safeParse({ email: 'user@example.com', password: '' }).success).toBe(false);
  });
});

describe('registerSchema', () => {
  it('accepts valid registration', () => {
    expect(registerSchema.safeParse({
      full_name: 'John Doe',
      email: 'john@example.com',
      phone: '0821234567',
      password: 'Password123',
      confirmPassword: 'Password123',
      referral_code: '',
    }).success).toBe(true);
  });
  it('rejects mismatched passwords', () => {
    expect(registerSchema.safeParse({
      full_name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123',
      confirmPassword: 'Different123',
    }).success).toBe(false);
  });
  it('rejects short full name', () => {
    expect(registerSchema.safeParse({
      full_name: 'J',
      email: 'john@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
    }).success).toBe(false);
  });
});

describe('depositSchema', () => {
  it('accepts positive amounts', () => {
    expect(depositSchema.safeParse({ amount: 100 }).success).toBe(true);
  });
  it('rejects zero or negative', () => {
    expect(depositSchema.safeParse({ amount: 0 }).success).toBe(false);
    expect(depositSchema.safeParse({ amount: -50 }).success).toBe(false);
  });
});

describe('withdrawalSchema', () => {
  it('accepts valid withdrawal', () => {
    expect(withdrawalSchema.safeParse({
      amount: 500,
      bank_name: 'FNB',
      account_number: '1234567890',
      branch_code: '250655',
      account_holder: 'John Doe',
    }).success).toBe(true);
  });
  it('rejects short bank name', () => {
    expect(withdrawalSchema.safeParse({
      amount: 500,
      bank_name: 'A',
      account_number: '1234567890',
      branch_code: '250655',
      account_holder: 'John Doe',
    }).success).toBe(false);
  });
});

describe('planSchema', () => {
  it('accepts valid plan', () => {
    expect(planSchema.safeParse({
      name: 'Starter',
      description: 'Beginner plan',
      min_amount: 80,
      max_amount: 5000,
      duration_days: 30,
      return_rate: 8,
      earnings_type: 'maturity',
      is_active: true,
    }).success).toBe(true);
  });
  it('rejects invalid earnings_type', () => {
    expect(planSchema.safeParse({
      name: 'Starter',
      min_amount: 80,
      max_amount: 5000,
      duration_days: 30,
      return_rate: 8,
      earnings_type: 'weekly',
      is_active: true,
    }).success).toBe(false);
  });
  it('rejects negative duration', () => {
    expect(planSchema.safeParse({
      name: 'Starter',
      min_amount: 80,
      max_amount: 5000,
      duration_days: -1,
      return_rate: 8,
      earnings_type: 'daily',
      is_active: true,
    }).success).toBe(false);
  });
});

describe('settingsSchema', () => {
  it('accepts valid settings', () => {
    expect(settingsSchema.safeParse({
      company_name: 'Icetropez.Vest',
      bank_name: 'FNB',
      account_number: '62345678901',
      branch_code: '250655',
      account_holder: 'Icetropez.Vest Pty Ltd',
      minimum_deposit: 80,
      referral_percentage: 10,
      support_email: 'support@icetropez.vest',
      contact_phone: '+27 11 555 0100',
    }).success).toBe(true);
  });
  it('rejects invalid email', () => {
    expect(settingsSchema.safeParse({
      company_name: 'Icetropez.Vest',
      bank_name: 'FNB',
      account_number: '62345678901',
      branch_code: '250655',
      account_holder: 'Icetropez.Vest Pty Ltd',
      minimum_deposit: 80,
      referral_percentage: 10,
      support_email: 'not-an-email',
      contact_phone: '+27 11 555 0100',
    }).success).toBe(false);
  });
});
