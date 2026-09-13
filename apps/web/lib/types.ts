export type UserRole = 'user' | 'admin';
export type UserPlan = 'free' | 'pro';

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  plan: UserPlan;
  role: UserRole;
  created_at?: string;
  is_suspended?: boolean;
}

export type QuestionType =
  | 'short_text'
  | 'paragraph'
  | 'multiple_choice'
  | 'checkbox'
  | 'dropdown'
  | 'date'
  | 'number'
  | 'rating'
  | 'file';

export interface Question {
  id: string;
  form_id: string;
  type: QuestionType;
  label: string;
  hint?: string | null;
  required: boolean;
  position: number;
  options?: string[] | null;
}

export interface FormTheme {
  accent_color: string;
  accent_ink?: string;
  accent_soft?: string;
  font: string; // "'Plus Jakarta Sans', sans-serif" | "'Inter', sans-serif"
  layout: 'one_by_one' | 'all_at_once';
  background: 'plain' | 'gradient' | 'image';
  cover_gradient?: string;
}

export type FormStatus = 'draft' | 'published';

export interface Form {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  slug: string;
  status: FormStatus;
  theme: FormTheme;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  visit_count?: number;
  questions?: Question[];
}

export interface Answer {
  id: string;
  response_id: string;
  question_id: string;
  value: string | number | string[] | boolean | null;
}

export interface FormResponse {
  id: string;
  form_id: string;
  submitted_at: string;
  meta: {
    ip_hash?: string;
    user_agent?: string;
    [key: string]: unknown;
  };
  answers?: Answer[];
}

export interface Integration {
  id: string;
  form_id: string;
  type: 'whatsapp' | 'sheets';
  config: {
    whatsapp_number?: string;
    sheets_name?: string;
    webhook_url?: string;
    [key: string]: unknown;
  };
  enabled: boolean;
}

export interface PlatformStats {
  totalUsers: number;
  totalForms: number;
  totalResponses: number;
  activeToday: number;
}
