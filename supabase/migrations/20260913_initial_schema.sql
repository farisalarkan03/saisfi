-- ==============================================================================
-- Saisfi Database Schema & Row Level Security (RLS)
-- Sesuai saisfi-implementasi-supabase-cloudflare.md
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUM / TYPES (or check constraints)
-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  is_suspended BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Helper function: is_admin()
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin' AND is_suspended = false
  );
$$;

-- 3. FORMS TABLE
CREATE TABLE IF NOT EXISTS public.forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Formulir Tanpa Judul',
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  theme JSONB NOT NULL DEFAULT '{
    "accent_color": "#5B5FEF",
    "accent_ink": "#2F32B8",
    "accent_soft": "#ECEDFF",
    "font": "Plus Jakarta Sans",
    "layout": "all_at_once",
    "background": "plain"
  }'::jsonb,
  visit_count INT NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('short_text', 'paragraph', 'multiple_choice', 'checkbox', 'dropdown', 'date', 'number', 'rating', 'file')),
  label TEXT NOT NULL,
  hint TEXT,
  required BOOLEAN NOT NULL DEFAULT false,
  position INT NOT NULL DEFAULT 0,
  options JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. RESPONSES TABLE
CREATE TABLE IF NOT EXISTS public.responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  meta JSONB DEFAULT '{}'::jsonb
);

-- 6. ANSWERS TABLE
CREATE TABLE IF NOT EXISTS public.answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  response_id UUID NOT NULL REFERENCES public.responses(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  value JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. INTEGRATIONS TABLE
CREATE TABLE IF NOT EXISTS public.integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('whatsapp', 'sheets')),
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. VIEW UNTUK FORM PUBLIK (Aman untuk anonim / responder)
CREATE OR REPLACE VIEW public.published_forms_view AS
SELECT
  f.id,
  f.title,
  f.description,
  f.slug,
  f.theme,
  f.published_at,
  COALESCE(
    json_agg(
      json_build_object(
        'id', q.id,
        'type', q.type,
        'label', q.label,
        'hint', q.hint,
        'required', q.required,
        'position', q.position,
        'options', q.options
      ) ORDER BY q.position ASC
    ) FILTER (WHERE q.id IS NOT NULL),
    '[]'::json
  ) AS questions
FROM public.forms f
LEFT JOIN public.questions q ON f.id = q.form_id
WHERE f.status = 'published'
GROUP BY f.id;

-- 9. TRIGGER: Auto-create Profile saat User Register di Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role, plan)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'user'),
    'free'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 10. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- Forms Policies
CREATE POLICY "Owner or admin can select forms" ON public.forms
  FOR SELECT USING (owner_id = auth.uid() OR public.is_admin() OR status = 'published');

CREATE POLICY "Owner can insert form" ON public.forms
  FOR INSERT WITH CHECK (owner_id = auth.uid() OR public.is_admin());

CREATE POLICY "Owner or admin can update form" ON public.forms
  FOR UPDATE USING (owner_id = auth.uid() OR public.is_admin());

CREATE POLICY "Owner or admin can delete form" ON public.forms
  FOR DELETE USING (owner_id = auth.uid() OR public.is_admin());

-- Questions Policies
CREATE POLICY "Select questions for form" ON public.questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.forms f
      WHERE f.id = questions.form_id
        AND (f.owner_id = auth.uid() OR public.is_admin() OR f.status = 'published')
    )
  );

CREATE POLICY "Manage questions for own form" ON public.questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.forms f
      WHERE f.id = questions.form_id
        AND (f.owner_id = auth.uid() OR public.is_admin())
    )
  );

-- Responses Policies
CREATE POLICY "Owner or admin can select responses" ON public.responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.forms f
      WHERE f.id = responses.form_id
        AND (f.owner_id = auth.uid() OR public.is_admin())
    )
  );

-- Answers Policies
CREATE POLICY "Owner or admin can select answers" ON public.answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.responses r
      JOIN public.forms f ON f.id = r.form_id
      WHERE r.id = answers.response_id
        AND (f.owner_id = auth.uid() OR public.is_admin())
    )
  );

-- Integrations Policies
CREATE POLICY "Owner or admin can manage integrations" ON public.integrations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.forms f
      WHERE f.id = integrations.form_id
        AND (f.owner_id = auth.uid() OR public.is_admin())
    )
  );
