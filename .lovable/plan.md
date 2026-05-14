# Plano: Backend real + remoção de dados mockados

Lovable Cloud já está habilitado. Este plano cobre o schema do banco, autenticação real e a substituição de todos os dados mockados por dados do banco.

## 1. Autenticação real
- Substituir o `AuthContext` simulado por integração com Lovable Cloud (email/senha + Google).
- Criar página `/auth` com sign up / sign in (escolha de papel: trainer ou student).
- Listener `onAuthStateChange` antes de `getSession`, persistência em localStorage.
- Rotas protegidas: redirecionar para `/auth` quando não autenticado; redirecionar `trainer` ↔ `student` conforme o papel.
- Logout real via Supabase.

## 2. Schema do banco (migration)

```text
profiles (id=auth.users.id, full_name, email, avatar_url, bio, created_at)
user_roles (id, user_id, role enum: 'trainer'|'student')   -- segurança
students_trainers (trainer_id, student_id, status, created_at)  -- vínculo aluno↔personal
student_details (user_id, age, height_cm, weight_kg, goal, level)
exercises (id, trainer_id, name, muscle_group, video_url, instructions, created_at)
workouts (id, student_id, trainer_id, title, day_of_week, notes, created_at)
workout_exercises (id, workout_id, exercise_id, sets, reps, rest_seconds, order_index)
progress_entries (id, student_id, recorded_at, weight, body_fat, height, chest, waist, hips, arm_l, arm_r, thigh_l, thigh_r, note)
conversations (id, trainer_id, student_id, last_message_at)
messages (id, conversation_id, sender_id, content, created_at, read_at)
```

Funções/triggers:
- `handle_new_user()` cria `profiles` + `user_roles` automaticamente no signup (papel vem do metadata).
- `has_role(user_id, role)` SECURITY DEFINER para uso em RLS sem recursão.
- `updated_at` triggers padrão.

RLS habilitado em todas as tabelas. Políticas resumidas:
- `profiles`: dono lê/atualiza próprio; trainer lê profiles dos seus alunos.
- `user_roles`: leitura própria; sem update via cliente.
- `students_trainers`: trainer e student do vínculo podem ler; trainer cria/remove.
- `exercises`: trainer dono CRUD; students leem exercícios do seu trainer.
- `workouts` / `workout_exercises`: trainer dono CRUD; student lê seus próprios.
- `progress_entries`: student dono CRUD; trainer do aluno lê e insere.
- `conversations` / `messages`: apenas participantes leem; remetente insere.

Realtime habilitado para `messages` e `conversations`.

## 3. Remoção de mocks (frontend)

Substituir todos os arrays/constantes mockadas por hooks `useQuery` (TanStack) usando o cliente Supabase:

- `TrainerDashboard.tsx`: contagem real de alunos ativos + últimas mensagens reais.
- `TrainerProfilePage.tsx`: total de alunos vindo da query; demais campos do `profiles`.
- `StudentsPage.tsx`: lista real de `students_trainers` + `profiles`. Modal "Novo aluno" cria vínculo (busca por email).
- `ExerciseLibrary.tsx`: CRUD real em `exercises`; thumbnail do YouTube já implementada.
- `StudentWorkoutsPage` (trainer e student): leitura de `workouts` + `workout_exercises` + `exercises`.
- `MessagesPage` + `StudentChatPage`: lista de `conversations` + envio/recebimento via realtime.
- `StudentProgressPage`: gráficos a partir de `progress_entries`; modal grava nova entrada.
- `StudentProfilePage` / `EditProfilePage`: lê/atualiza `profiles` + `student_details`.
- `NotificationsHistoryPage`, `NotificationsPage`: ocultar até existir backend de notificações (placeholder vazio com estado "sem notificações").

## 4. Estados vazios e loading
- Skeletons em listas (alunos, exercícios, mensagens, progresso).
- Estados vazios amigáveis em vez de mocks ("Nenhum aluno ainda — convide o primeiro").

## 5. Ordem de implementação
1. Migration do schema + RLS + trigger handle_new_user.
2. Refatorar `AuthContext` para Supabase + página `/auth` + proteção de rotas.
3. Hooks de dados (`useStudents`, `useExercises`, `useWorkouts`, `useMessages`, `useProgress`, `useProfile`).
4. Substituir mocks página por página, na ordem: Dashboard → Students → Exercises → Workouts → Messages → Progress → Profile.
5. Realtime em mensagens.
6. Limpeza final de imports e dados mockados remanescentes.

## Notas técnicas
- App em inglês mantido.
- Sem alterar `src/integrations/supabase/client.ts` nem `types.ts`.
- Sem CHECK constraints com `now()`; usar triggers se necessário.
- Toda string visível continua em inglês.
- Confirmação de email do Supabase fica desligada nesta fase para facilitar o teste (pode ser reativada depois).

Pronto para implementar quando você aprovar.
