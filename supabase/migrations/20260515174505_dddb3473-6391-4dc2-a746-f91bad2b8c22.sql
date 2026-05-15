
-- 1. Add approval_status column
ALTER TABLE public.student_details
  ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'pending';

-- 2. Helper function: is_trainer
CREATE OR REPLACE FUNCTION public.is_trainer(_user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user AND role = 'trainer');
$$;

-- 3. Update handle_new_user: always student, create student_details
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.email);

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student');

  INSERT INTO public.student_details (user_id, approval_status)
  VALUES (NEW.id, 'pending');

  RETURN NEW;
END; $$;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Backfill: existing students with no row, and approve already-linked ones
INSERT INTO public.student_details (user_id, approval_status)
SELECT ur.user_id, 'pending'
FROM public.user_roles ur
WHERE ur.role = 'student'
  AND NOT EXISTS (SELECT 1 FROM public.student_details sd WHERE sd.user_id = ur.user_id);

UPDATE public.student_details sd
SET approval_status = 'approved'
WHERE EXISTS (SELECT 1 FROM public.trainer_students ts WHERE ts.student_id = sd.user_id AND ts.status = 'active');

-- 5. PROFILES: any trainer can view/update any profile
DROP POLICY IF EXISTS "profiles select student of trainer" ON public.profiles;
DROP POLICY IF EXISTS "profiles select trainer of student" ON public.profiles;
CREATE POLICY "profiles trainer view all" ON public.profiles
  FOR SELECT USING (public.is_trainer(auth.uid()));
CREATE POLICY "profiles trainer update all" ON public.profiles
  FOR UPDATE USING (public.is_trainer(auth.uid()));

-- 6. STUDENT_DETAILS: trainer view/update/insert all
DROP POLICY IF EXISTS "sd select by trainer" ON public.student_details;
CREATE POLICY "sd trainer view all" ON public.student_details
  FOR SELECT USING (public.is_trainer(auth.uid()));
CREATE POLICY "sd trainer update all" ON public.student_details
  FOR UPDATE USING (public.is_trainer(auth.uid()));
CREATE POLICY "sd trainer insert all" ON public.student_details
  FOR INSERT WITH CHECK (public.is_trainer(auth.uid()));

-- 7. PROGRESS_ENTRIES: trainer view/insert any
DROP POLICY IF EXISTS "pe trainer view" ON public.progress_entries;
DROP POLICY IF EXISTS "pe trainer insert" ON public.progress_entries;
CREATE POLICY "pe trainer view all" ON public.progress_entries
  FOR SELECT USING (public.is_trainer(auth.uid()));
CREATE POLICY "pe trainer insert all" ON public.progress_entries
  FOR INSERT WITH CHECK (public.is_trainer(auth.uid()));

-- 8. EXERCISES: shared library across trainers
DROP POLICY IF EXISTS "ex trainer manage" ON public.exercises;
DROP POLICY IF EXISTS "ex student view" ON public.exercises;
CREATE POLICY "ex trainer view all" ON public.exercises
  FOR SELECT USING (public.is_trainer(auth.uid()));
CREATE POLICY "ex trainer insert" ON public.exercises
  FOR INSERT WITH CHECK (public.is_trainer(auth.uid()) AND auth.uid() = trainer_id);
CREATE POLICY "ex trainer update all" ON public.exercises
  FOR UPDATE USING (public.is_trainer(auth.uid()));
CREATE POLICY "ex trainer delete all" ON public.exercises
  FOR DELETE USING (public.is_trainer(auth.uid()));
CREATE POLICY "ex student view all" ON public.exercises
  FOR SELECT USING (public.has_role(auth.uid(), 'student'));

-- 9. WORKOUTS: any trainer can manage; student sees their own
DROP POLICY IF EXISTS "wo trainer manage" ON public.workouts;
CREATE POLICY "wo trainer view all" ON public.workouts
  FOR SELECT USING (public.is_trainer(auth.uid()));
CREATE POLICY "wo trainer insert" ON public.workouts
  FOR INSERT WITH CHECK (public.is_trainer(auth.uid()) AND auth.uid() = trainer_id);
CREATE POLICY "wo trainer update all" ON public.workouts
  FOR UPDATE USING (public.is_trainer(auth.uid()));
CREATE POLICY "wo trainer delete all" ON public.workouts
  FOR DELETE USING (public.is_trainer(auth.uid()));

-- 10. workout_exercises: update workout_managed_by to allow any trainer
CREATE OR REPLACE FUNCTION public.workout_managed_by(_workout uuid, _user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_trainer(_user) AND EXISTS (SELECT 1 FROM public.workouts w WHERE w.id = _workout);
$$;

-- 11. CONVERSATIONS: any trainer can start a conversation with any student
DROP POLICY IF EXISTS "conv trainer create" ON public.conversations;
CREATE POLICY "conv trainer create" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() = trainer_id AND public.is_trainer(auth.uid()));

-- 12. trainer_students: allow any trainer to insert links (for chat ownership)
DROP POLICY IF EXISTS "ts insert by trainer" ON public.trainer_students;
CREATE POLICY "ts insert by trainer" ON public.trainer_students
  FOR INSERT WITH CHECK (auth.uid() = trainer_id AND public.is_trainer(auth.uid()));
