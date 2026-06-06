
-- Notes
ALTER TABLE public.notes ALTER COLUMN chapter_id DROP NOT NULL;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS subject_id uuid;

-- Formula sheets
ALTER TABLE public.formula_sheets ALTER COLUMN chapter_id DROP NOT NULL;
ALTER TABLE public.formula_sheets ADD COLUMN IF NOT EXISTS subject_id uuid;
ALTER TABLE public.formula_sheets ADD COLUMN IF NOT EXISTS title text;

-- Worksheets
ALTER TABLE public.worksheets ALTER COLUMN chapter_id DROP NOT NULL;
ALTER TABLE public.worksheets ADD COLUMN IF NOT EXISTS subject_id uuid;
ALTER TABLE public.worksheets ADD COLUMN IF NOT EXISTS title text;

-- One-pagers
ALTER TABLE public.one_pagers ALTER COLUMN chapter_id DROP NOT NULL;
ALTER TABLE public.one_pagers ADD COLUMN IF NOT EXISTS subject_id uuid;
ALTER TABLE public.one_pagers ADD COLUMN IF NOT EXISTS title text;

-- Past papers
ALTER TABLE public.past_papers ALTER COLUMN year DROP NOT NULL;
ALTER TABLE public.past_papers ALTER COLUMN school_name DROP NOT NULL;
ALTER TABLE public.past_papers ADD COLUMN IF NOT EXISTS title text;

-- Important questions
ALTER TABLE public.important_questions ADD COLUMN IF NOT EXISTS subject_id uuid;
ALTER TABLE public.important_questions ADD COLUMN IF NOT EXISTS answer text;

-- Practice papers
ALTER TABLE public.practice_papers ADD COLUMN IF NOT EXISTS time_limit_minutes integer NOT NULL DEFAULT 60;

-- Storage policies on the 'content' bucket so admins can upload files
DO $$ BEGIN
  CREATE POLICY "Authenticated read content bucket"
    ON storage.objects FOR SELECT TO authenticated
    USING (bucket_id = 'content');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins upload to content bucket"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'content' AND private.has_role(auth.uid(), 'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins update content bucket"
    ON storage.objects FOR UPDATE TO authenticated
    USING (bucket_id = 'content' AND private.has_role(auth.uid(), 'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins delete from content bucket"
    ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'content' AND private.has_role(auth.uid(), 'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
