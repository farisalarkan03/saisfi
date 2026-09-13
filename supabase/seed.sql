-- ==============================================================================
-- Saisfi Seed Data
-- ==============================================================================

-- 1. Profiles (Demo Admin & Demo User)
INSERT INTO public.profiles (id, full_name, avatar_url, plan, role)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Faris Admin', 'https://api.dicebear.com/7.x/bottts/svg?seed=admin', 'pro', 'admin'),
  ('u0000000-0000-0000-0000-000000000002', 'Budi Santoso', 'https://api.dicebear.com/7.x/avataaars/svg?seed=budi', 'free', 'user')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

-- 2. Sample Form: "Formulir Pendaftaran Event"
INSERT INTO public.forms (id, owner_id, title, description, slug, status, theme, visit_count, published_at)
VALUES (
  'f0000000-0000-0000-0000-000000000001',
  'u0000000-0000-0000-0000-000000000002',
  'Pendaftaran Event Tahunan 2026',
  'Isi formulir di bawah untuk mendaftar. Data kamu hanya digunakan untuk keperluan acara ini.',
  'event-2026',
  'published',
  '{
    "accent_color": "#5B5FEF",
    "accent_ink": "#2F32B8",
    "accent_soft": "#ECEDFF",
    "font": "Plus Jakarta Sans",
    "layout": "all_at_once",
    "background": "plain"
  }'::jsonb,
  142,
  now()
) ON CONFLICT (id) DO NOTHING;

-- 3. Questions for Sample Form
INSERT INTO public.questions (id, form_id, type, label, hint, required, position, options)
VALUES
  (
    'q0000000-0000-0000-0000-000000000001',
    'f0000000-0000-0000-0000-000000000001',
    'short_text',
    'Nama lengkap',
    'Sesuai KTP atau identitas resmi',
    true,
    1,
    null
  ),
  (
    'q0000000-0000-0000-0000-000000000002',
    'f0000000-0000-0000-0000-000000000001',
    'short_text',
    'Alamat email',
    'Kami akan mengirimkan tiket dan jadwal via email',
    true,
    2,
    null
  ),
  (
    'q0000000-0000-0000-0000-000000000003',
    'f0000000-0000-0000-0000-000000000001',
    'multiple_choice',
    'Pilih sesi acara',
    'Pilih salah satu jadwal yang Anda sanggupi hadir',
    true,
    3,
    '["Sesi pagi — 09.00", "Sesi siang — 13.00", "Sesi sore — 16.00"]'::jsonb
  ),
  (
    'q0000000-0000-0000-0000-000000000004',
    'f0000000-0000-0000-0000-000000000001',
    'paragraph',
    'Ceritakan alasanmu ikut acara ini',
    'Berikan gambaran ekspektasi Anda terhadap materi workshop',
    false,
    4,
    null
  ),
  (
    'q0000000-0000-0000-0000-000000000005',
    'f0000000-0000-0000-0000-000000000001',
    'rating',
    'Tingkat pengalaman dengan teknologi cloud',
    'Skala 1 (Pemula) sampai 5 (Mahir)',
    false,
    5,
    null
  )
ON CONFLICT (id) DO NOTHING;

-- 4. Sample Responses
INSERT INTO public.responses (id, form_id, submitted_at, meta)
VALUES (
  'r0000000-0000-0000-0000-000000000001',
  'f0000000-0000-0000-0000-000000000001',
  now() - interval '2 hours',
  '{"user_agent": "Mozilla/5.0", "ip_hash": "a1b2c3d4"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.answers (response_id, question_id, value)
VALUES
  ('r0000000-0000-0000-0000-000000000001', 'q0000000-0000-0000-0000-000000000001', '"Sarah Amanda"'),
  ('r0000000-0000-0000-0000-000000000001', 'q0000000-0000-0000-0000-000000000002', '"sarah.amanda@example.com"'),
  ('r0000000-0000-0000-0000-000000000001', 'q0000000-0000-0000-0000-000000000003', '"Sesi pagi — 09.00"'),
  ('r0000000-0000-0000-0000-000000000001', 'q0000000-0000-0000-0000-000000000004', '"Ingin belajar implementasi edge workers langsung dari praktisi."'),
  ('r0000000-0000-0000-0000-000000000001', 'q0000000-0000-0000-0000-000000000005', '4')
ON CONFLICT (id) DO NOTHING;

-- 5. Integrations
INSERT INTO public.integrations (id, form_id, type, config, enabled)
VALUES
  ('i0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'whatsapp', '{"whatsapp_number": "08123456789"}'::jsonb, true),
  ('i0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001', 'sheets', '{"sheets_name": "Pendaftar Event 2026"}'::jsonb, false)
ON CONFLICT (id) DO NOTHING;
