INSERT INTO public.user_roles (user_id, role)
VALUES ('379ce7de-fadd-4e01-8058-2d336a1a37a6', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;