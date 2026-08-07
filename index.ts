export type UserRole = 'user' | 'admin';

export type InvestmentStatus = 'active' | 'completed' | 'cancelled';
export type EarningsType = 'daily' | 'maturity';
export type DepositStatus = 'pending' | 'approved' | 'rejected';
export type WithdrawalStatus = 'pending' | 'approved' | 'rejected';
export type TransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'investment'
  | 'earnings'
  | 'referral'
  | 'bonus';
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  referral_code: string;
  referred_by: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  total_deposited: number;
  total_withdrawn: number;
  total_earnings: number;
  created_at: string;
  updated_at: string;
}

export interface InvestmentPlan {
  id: string;
  name: string;
  description: string | null;
  min_amount: number;
  max_amount: number;
  duration_days: number;
  return_rate: number;
  earnings_type: EarningsType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Investment {
  id: string;
  user_id: string;
  plan_id: string;
  amount: number;
  expected_return: number;
  earnings_to_date: number;
  start_date: string;
  end_date: string;
  status: InvestmentStatus;
  plan?: InvestmentPlan;
  created_at: string;
  updated_at: string;
}

export interface Deposit {
  id: string;
  user_id: string;
  amount: number;
  reference: string;
  proof_url: string | null;
  status: DepositStatus;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  bank_name: string | null;
  account_number: string | null;
  branch_code: string | null;
  account_holder: string | null;
  status: WithdrawalStatus;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  description: string;
  reference: string;
  balance_after: number;
  created_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  investment_id: string | null;
  earnings: number;
  status: 'pending' | 'paid';
  created_at: string;
  referrer?: Profile;
  referred?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface Settings {
  id: string;
  company_name: string;
  bank_name: string;
  account_number: string;
  branch_code: string;
  account_holder: string;
  minimum_deposit: number;
  referral_percentage: number;
  support_email: string;
  contact_phone: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  action: string;
  entity: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  actor?: Profile;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  is_active: boolean;
  created_at: string;
}
