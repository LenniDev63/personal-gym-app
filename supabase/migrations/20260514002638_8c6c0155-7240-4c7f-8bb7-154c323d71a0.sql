
-- ENUM
CREATE TYPE public.app_role AS ENUM ('trainer', 'student');

-- updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- USER ROLES
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- has_role security definer
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- TRAINER STUDENTS
CREATE TABLE public.trainer_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (trainer_id, student_id)
);
ALTER TABLE public.trainer_students ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_trainer_students_trainer ON public.trainer_students(trainer_id);
CREATE INDEX idx_trainer_students_student ON public.trainer_students(student_id);

-- security definer for trainer-student link check (avoid recursion)
CREATE OR REPLACE FUNCTION public.is_trainer_of(_trainer UUID, _student UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.trainer_students WHERE trainer_id = _trainer AND student_id = _student AND status = 'active');
$$;

-- STUDENT DETAILS
CREATE TABLE public.student_details (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  age INT,
  height_cm NUMERIC,
  weight_kg NUMERIC,
  goal TEXT,
  level TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.student_details ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER student_details_updated BEFORE UPDATE ON public.student_details
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- EXERCISES
CREATE TABLE public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  muscle_group TEXT,
  video_url TEXT,
  instructions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_exercises_trainer ON public.exercises(trainer_id);
CREATE TRIGGER exercises_updated BEFORE UPDATE ON public.exercises
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- WORKOUTS
CREATE TABLE public.workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  day_of_week TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_workouts_student ON public.workouts(student_id);
CREATE INDEX idx_workouts_trainer ON public.workouts(trainer_id);
CREATE TRIGGER workouts_updated BEFORE UPDATE ON public.workouts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- WORKOUT EXERCISES
CREATE TABLE public.workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE RESTRICT,
  sets INT NOT NULL DEFAULT 3,
  reps TEXT NOT NULL DEFAULT '10',
  rest_seconds INT NOT NULL DEFAULT 60,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_we_workout ON public.workout_exercises(workout_id);

-- security definer to check workout ownership
CREATE OR REPLACE FUNCTION public.workout_visible_to(_workout UUID, _user UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workouts w
    WHERE w.id = _workout AND (w.trainer_id = _user OR w.student_id = _user)
  );
$$;

CREATE OR REPLACE FUNCTION public.workout_managed_by(_workout UUID, _user UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.workouts w WHERE w.id = _workout AND w.trainer_id = _user);
$$;

-- PROGRESS ENTRIES
CREATE TABLE public.progress_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  weight NUMERIC,
  body_fat NUMERIC,
  height NUMERIC,
  chest NUMERIC,
  waist NUMERIC,
  hips NUMERIC,
  arm_l NUMERIC,
  arm_r NUMERIC,
  thigh_l NUMERIC,
  thigh_r NUMERIC,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.progress_entries ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_progress_student ON public.progress_entries(student_id, recorded_at DESC);

-- CONVERSATIONS
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (trainer_id, student_id)
);
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.conversation_participant(_conv UUID, _user UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.conversations c
    WHERE c.id = _conv AND (c.trainer_id = _user OR c.student_id = _user));
$$;

-- MESSAGES
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_messages_conv ON public.messages(conversation_id, created_at DESC);

-- =============== POLICIES ===============

-- profiles
CREATE POLICY "profiles select own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles select trainer of student" ON public.profiles FOR SELECT
  USING (public.is_trainer_of(auth.uid(), id));
CREATE POLICY "profiles select student of trainer" ON public.profiles FOR SELECT
  USING (public.is_trainer_of(id, auth.uid()));
CREATE POLICY "profiles insert own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles update own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- user_roles
CREATE POLICY "roles select own" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- trainer_students
CREATE POLICY "ts select own trainer" ON public.trainer_students FOR SELECT USING (auth.uid() = trainer_id);
CREATE POLICY "ts select own student" ON public.trainer_students FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "ts insert by trainer" ON public.trainer_students FOR INSERT
  WITH CHECK (auth.uid() = trainer_id AND public.has_role(auth.uid(), 'trainer'));
CREATE POLICY "ts delete by trainer" ON public.trainer_students FOR DELETE USING (auth.uid() = trainer_id);
CREATE POLICY "ts update by trainer" ON public.trainer_students FOR UPDATE USING (auth.uid() = trainer_id);

-- student_details
CREATE POLICY "sd select own" ON public.student_details FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "sd select by trainer" ON public.student_details FOR SELECT
  USING (public.is_trainer_of(auth.uid(), user_id));
CREATE POLICY "sd insert own" ON public.student_details FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sd update own" ON public.student_details FOR UPDATE USING (auth.uid() = user_id);

-- exercises
CREATE POLICY "ex trainer manage" ON public.exercises FOR ALL
  USING (auth.uid() = trainer_id) WITH CHECK (auth.uid() = trainer_id);
CREATE POLICY "ex student view" ON public.exercises FOR SELECT
  USING (public.is_trainer_of(trainer_id, auth.uid()));

-- workouts
CREATE POLICY "wo trainer manage" ON public.workouts FOR ALL
  USING (auth.uid() = trainer_id) WITH CHECK (auth.uid() = trainer_id);
CREATE POLICY "wo student view" ON public.workouts FOR SELECT USING (auth.uid() = student_id);

-- workout_exercises
CREATE POLICY "we view" ON public.workout_exercises FOR SELECT
  USING (public.workout_visible_to(workout_id, auth.uid()));
CREATE POLICY "we trainer manage" ON public.workout_exercises FOR ALL
  USING (public.workout_managed_by(workout_id, auth.uid()))
  WITH CHECK (public.workout_managed_by(workout_id, auth.uid()));

-- progress_entries
CREATE POLICY "pe student manage" ON public.progress_entries FOR ALL
  USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);
CREATE POLICY "pe trainer view" ON public.progress_entries FOR SELECT
  USING (public.is_trainer_of(auth.uid(), student_id));
CREATE POLICY "pe trainer insert" ON public.progress_entries FOR INSERT
  WITH CHECK (public.is_trainer_of(auth.uid(), student_id));

-- conversations
CREATE POLICY "conv participants select" ON public.conversations FOR SELECT
  USING (auth.uid() = trainer_id OR auth.uid() = student_id);
CREATE POLICY "conv trainer create" ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = trainer_id AND public.is_trainer_of(auth.uid(), student_id));
CREATE POLICY "conv participants update" ON public.conversations FOR UPDATE
  USING (auth.uid() = trainer_id OR auth.uid() = student_id);

-- messages
CREATE POLICY "msg participants select" ON public.messages FOR SELECT
  USING (public.conversation_participant(conversation_id, auth.uid()));
CREATE POLICY "msg sender insert" ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id AND public.conversation_participant(conversation_id, auth.uid()));
CREATE POLICY "msg participants update" ON public.messages FOR UPDATE
  USING (public.conversation_participant(conversation_id, auth.uid()));

-- =============== SIGNUP TRIGGER ===============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _role public.app_role;
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email
  );

  _role := COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'student');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _role);

  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============== REALTIME ===============
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
