'use client';

import { Form, Question, FormResponse, Profile, Integration, PlatformStats, UserRole, UserPlan } from './types';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEY_FORMS = 'saisfi_forms_v1';
const STORAGE_KEY_RESPONSES = 'saisfi_responses_v1';
const STORAGE_KEY_PROFILES = 'saisfi_profiles_v1';
const STORAGE_KEY_CURRENT_ROLE = 'saisfi_current_role_v1';
const STORAGE_KEY_INTEGRATIONS = 'saisfi_integrations_v1';

// Initial Seed Data matching saisfi-ui.html
export const INITIAL_USER_PROFILE: Profile = {
  id: 'user-default-id',
  full_name: 'Faris Alarkan',
  avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Faris',
  plan: 'pro',
  role: 'user',
  created_at: new Date().toISOString(),
  is_suspended: false,
};

export const INITIAL_ADMIN_PROFILE: Profile = {
  id: 'admin-default-id',
  full_name: 'Administrator Saisfi',
  avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Admin',
  plan: 'pro',
  role: 'admin',
  created_at: new Date().toISOString(),
  is_suspended: false,
};

const DEFAULT_QUESTIONS: Question[] = [
  {
    id: 'q-1',
    form_id: 'form-event-registration',
    type: 'short_text',
    label: 'Nama lengkap',
    hint: 'Sesuai KTP atau identitas resmi',
    required: true,
    position: 1,
  },
  {
    id: 'q-2',
    form_id: 'form-event-registration',
    type: 'short_text',
    label: 'Alamat email',
    hint: 'Kami akan mengirimkan e-tiket ke email ini',
    required: true,
    position: 2,
  },
  {
    id: 'q-3',
    form_id: 'form-event-registration',
    type: 'multiple_choice',
    label: 'Pilih sesi acara',
    hint: 'Pilih salah satu jadwal kehadiran',
    required: true,
    position: 3,
    options: ['Sesi pagi — 09.00', 'Sesi siang — 13.00', 'Sesi sore — 16.00'],
  },
  {
    id: 'q-4',
    form_id: 'form-event-registration',
    type: 'paragraph',
    label: 'Ceritakan alasanmu ikut acara ini',
    hint: 'Ekspektasi topik atau materi yang paling ingin dipelajari',
    required: false,
    position: 4,
  },
  {
    id: 'q-5',
    form_id: 'form-event-registration',
    type: 'rating',
    label: 'Tingkat kemahiran teknologi web/cloud',
    hint: 'Beri bintang 1 sampai 5',
    required: false,
    position: 5,
  },
];

const INITIAL_FORM: Form = {
  id: 'form-event-registration',
  owner_id: 'user-default-id',
  title: 'Formulir Pendaftaran Event',
  description: 'Isi formulir di bawah untuk mendaftar. Data kamu hanya digunakan untuk keperluan acara ini.',
  slug: 'pendaftaran-event',
  status: 'published',
  theme: {
    accent_color: '#5B5FEF',
    accent_ink: '#2F32B8',
    accent_soft: '#ECEDFF',
    font: "'Plus Jakarta Sans', sans-serif",
    layout: 'all_at_once',
    background: 'plain',
    cover_gradient: 'linear-gradient(135deg, #8285FF 0%, #5B5FEF 55%, #4740D6 100%)',
  },
  visit_count: 128,
  published_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
  created_at: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
  updated_at: new Date().toISOString(),
  questions: DEFAULT_QUESTIONS,
};

const INITIAL_RESPONSES: FormResponse[] = [
  {
    id: 'resp-1',
    form_id: 'form-event-registration',
    submitted_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    meta: { user_agent: 'Chrome / macOS', ip_hash: '7f9a2b' },
    answers: [
      { id: 'a-1', response_id: 'resp-1', question_id: 'q-1', value: 'Sarah Amanda' },
      { id: 'a-2', response_id: 'resp-1', question_id: 'q-2', value: 'sarah.amanda@example.com' },
      { id: 'a-3', response_id: 'resp-1', question_id: 'q-3', value: 'Sesi pagi — 09.00' },
      { id: 'a-4', response_id: 'resp-1', question_id: 'q-4', value: 'Ingin belajar implementasi edge workers & database realtime.' },
      { id: 'a-5', response_id: 'resp-1', question_id: 'q-5', value: 4 },
    ],
  },
  {
    id: 'resp-2',
    form_id: 'form-event-registration',
    submitted_at: new Date(Date.now() - 3600000 * 1).toISOString(),
    meta: { user_agent: 'Safari / iPhone', ip_hash: '90cd3e' },
    answers: [
      { id: 'a-6', response_id: 'resp-2', question_id: 'q-1', value: 'Rian Pratama' },
      { id: 'a-7', response_id: 'resp-2', question_id: 'q-2', value: 'rian.pratama@example.com' },
      { id: 'a-8', response_id: 'resp-2', question_id: 'q-3', value: 'Sesi siang — 13.00' },
      { id: 'a-9', response_id: 'resp-2', question_id: 'q-4', value: 'Tertarik membuat otomasi form publik.' },
      { id: 'a-10', response_id: 'resp-2', question_id: 'q-5', value: 5 },
    ],
  },
];

const INITIAL_INTEGRATIONS: Integration[] = [
  {
    id: 'int-wa-1',
    form_id: 'form-event-registration',
    type: 'whatsapp',
    config: { whatsapp_number: '081234567890' },
    enabled: true,
  },
  {
    id: 'int-sheets-1',
    form_id: 'form-event-registration',
    type: 'sheets',
    config: { sheets_name: 'Pendaftaran Saisfi 2026' },
    enabled: false,
  },
];

// Helper for local storage
function safeGetItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage`, e);
    return defaultValue;
  }
}

function safeSetItem(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage`, e);
  }
}

export const DataStore = {
  // 1. Roles & Auth
  getCurrentRole(): UserRole {
    return safeGetItem<UserRole>(STORAGE_KEY_CURRENT_ROLE, 'user');
  },

  setCurrentRole(role: UserRole): void {
    safeSetItem(STORAGE_KEY_CURRENT_ROLE, role);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('saisfi_role_changed'));
    }
  },

  getCurrentUser(): Profile {
    const role = this.getCurrentRole();
    return role === 'admin' ? INITIAL_ADMIN_PROFILE : INITIAL_USER_PROFILE;
  },

  // 2. Forms
  getForms(): Form[] {
    const forms = safeGetItem<Form[]>(STORAGE_KEY_FORMS, [INITIAL_FORM]);
    return forms;
  },

  getFormById(id: string): Form | null {
    const forms = this.getForms();
    return forms.find((f) => f.id === id) || null;
  },

  getFormBySlug(slug: string): Form | null {
    const forms = this.getForms();
    return forms.find((f) => f.slug === slug) || null;
  },

  saveForm(updatedForm: Form): Form {
    const forms = this.getForms();
    const index = forms.findIndex((f) => f.id === updatedForm.id);
    const now = new Date().toISOString();
    const formWithMeta = {
      ...updatedForm,
      updated_at: now,
      slug: updatedForm.slug || slugify(updatedForm.title),
    };

    let newForms: Form[];
    if (index >= 0) {
      newForms = [...forms];
      newForms[index] = formWithMeta;
    } else {
      newForms = [formWithMeta, ...forms];
    }

    safeSetItem(STORAGE_KEY_FORMS, newForms);
    return formWithMeta;
  },

  createForm(title = 'Formulir Baru'): Form {
    const user = this.getCurrentUser();
    const id = 'form-' + Date.now();
    const slug = slugify(title) + '-' + Math.random().toString(36).substring(2, 6);

    const newForm: Form = {
      id,
      owner_id: user.id,
      title,
      description: 'Tambahkan deskripsi formulir Anda di sini.',
      slug,
      status: 'draft',
      theme: {
        accent_color: '#5B5FEF',
        accent_ink: '#2F32B8',
        accent_soft: '#ECEDFF',
        font: "'Plus Jakarta Sans', sans-serif",
        layout: 'all_at_once',
        background: 'plain',
        cover_gradient: 'linear-gradient(135deg, #8285FF 0%, #5B5FEF 55%, #4740D6 100%)',
      },
      visit_count: 0,
      published_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      questions: [
        {
          id: 'q-' + Date.now(),
          form_id: id,
          type: 'short_text',
          label: 'Pertanyaan pertama',
          hint: 'Masukkan petunjuk pengisian di sini',
          required: true,
          position: 1,
        },
      ],
    };

    const forms = this.getForms();
    safeSetItem(STORAGE_KEY_FORMS, [newForm, ...forms]);
    return newForm;
  },

  deleteForm(id: string): void {
    const forms = this.getForms().filter((f) => f.id !== id);
    safeSetItem(STORAGE_KEY_FORMS, forms);
  },

  incrementVisit(slug: string): void {
    const forms = this.getForms();
    const form = forms.find((f) => f.slug === slug);
    if (form) {
      form.visit_count = (form.visit_count || 0) + 1;
      this.saveForm(form);
    }
  },

  // 3. Responses & Answers
  getResponses(formId: string): FormResponse[] {
    const all = safeGetItem<FormResponse[]>(STORAGE_KEY_RESPONSES, INITIAL_RESPONSES);
    return all.filter((r) => r.form_id === formId);
  },

  submitResponse(slug: string, answersObj: Record<string, unknown>): { success: boolean; id: string } {
    const form = this.getFormBySlug(slug);
    if (!form) throw new Error('Formulir tidak ditemukan');

    const responseId = 'resp-' + Date.now();
    const answers = Object.entries(answersObj).map(([questionId, value], i) => ({
      id: `ans-${Date.now()}-${i}`,
      response_id: responseId,
      question_id: questionId,
      value: value as string | number | string[] | boolean | null,
    }));

    const newResponse: FormResponse = {
      id: responseId,
      form_id: form.id,
      submitted_at: new Date().toISOString(),
      meta: {
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Client',
        ip_hash: Math.random().toString(16).substring(2, 8),
      },
      answers,
    };

    const allResponses = safeGetItem<FormResponse[]>(STORAGE_KEY_RESPONSES, INITIAL_RESPONSES);
    safeSetItem(STORAGE_KEY_RESPONSES, [newResponse, ...allResponses]);

    return { success: true, id: responseId };
  },

  // 4. Integrations
  getIntegrations(formId: string): Integration[] {
    const list = safeGetItem<Integration[]>(STORAGE_KEY_INTEGRATIONS, INITIAL_INTEGRATIONS);
    const formIntegrations = list.filter((i) => i.form_id === formId);
    if (formIntegrations.length === 0) {
      // default template
      return [
        { id: `int-wa-${formId}`, form_id: formId, type: 'whatsapp', config: { whatsapp_number: '' }, enabled: false },
        { id: `int-sheets-${formId}`, form_id: formId, type: 'sheets', config: { sheets_name: '' }, enabled: false },
      ];
    }
    return formIntegrations;
  },

  toggleIntegration(formId: string, type: 'whatsapp' | 'sheets'): Integration[] {
    const list = safeGetItem<Integration[]>(STORAGE_KEY_INTEGRATIONS, INITIAL_INTEGRATIONS);
    const idx = list.findIndex((i) => i.form_id === formId && i.type === type);
    if (idx >= 0) {
      list[idx].enabled = !list[idx].enabled;
    } else {
      list.push({
        id: `int-${type}-${Date.now()}`,
        form_id: formId,
        type,
        config: {},
        enabled: true,
      });
    }
    safeSetItem(STORAGE_KEY_INTEGRATIONS, list);
    return this.getIntegrations(formId);
  },

  // 5. Admin Portal Data
  getAdminUsers(): Profile[] {
    return safeGetItem<Profile[]>(STORAGE_KEY_PROFILES, [
      INITIAL_ADMIN_PROFILE,
      INITIAL_USER_PROFILE,
      {
        id: 'u-3',
        full_name: 'Dewi Lestari',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dewi',
        plan: 'free',
        role: 'user',
        created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
        is_suspended: false,
      },
      {
        id: 'u-4',
        full_name: 'Ahmad Fauzi',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmad',
        plan: 'free',
        role: 'user',
        created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
        is_suspended: false,
      },
    ]);
  },

  toggleUserSuspended(userId: string): void {
    const users = this.getAdminUsers();
    const updated = users.map((u) => (u.id === userId ? { ...u, is_suspended: !u.is_suspended } : u));
    safeSetItem(STORAGE_KEY_PROFILES, updated);
  },

  updateUserPlan(userId: string, plan: UserPlan): void {
    const users = this.getAdminUsers();
    const updated = users.map((u) => (u.id === userId ? { ...u, plan } : u));
    safeSetItem(STORAGE_KEY_PROFILES, updated);
  },

  getPlatformStats(): PlatformStats {
    const forms = this.getForms();
    const responses = safeGetItem<FormResponse[]>(STORAGE_KEY_RESPONSES, INITIAL_RESPONSES);
    const users = this.getAdminUsers();

    return {
      totalUsers: users.length,
      totalForms: forms.length,
      totalResponses: responses.length,
      activeToday: 42,
    };
  },
};

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}
