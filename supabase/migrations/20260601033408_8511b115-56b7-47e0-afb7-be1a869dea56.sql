CREATE TABLE public.practice_attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  paper_id uuid NOT NULL REFERENCES public.practice_papers(id) ON DELETE CASCADE,
  score integer NOT NULL DEFAULT 0,
  total integer NOT NULL DEFAULT 0,
  percentage numeric NOT NULL DEFAULT 0,
  time_taken_seconds integer NOT NULL DEFAULT 0,
  answers_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  breakdown_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  submitted_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.practice_attempts TO authenticated;
GRANT ALL ON public.practice_attempts TO service_role;

ALTER TABLE public.practice_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own attempts" ON public.practice_attempts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own attempts" ON public.practice_attempts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own attempts" ON public.practice_attempts
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_practice_attempts_user ON public.practice_attempts(user_id, submitted_at DESC);
CREATE INDEX idx_practice_attempts_paper ON public.practice_attempts(paper_id);