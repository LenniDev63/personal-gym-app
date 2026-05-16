ALTER TABLE public.student_details ADD COLUMN IF NOT EXISTS date_of_birth date;
ALTER TABLE public.messages REPLICA IDENTITY FULL;