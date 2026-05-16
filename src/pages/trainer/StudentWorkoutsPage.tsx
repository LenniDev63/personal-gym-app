import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Clock, Repeat, Play, X, Check, Moon, Sparkles, Search, Trash2, AlertTriangle, Pencil } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const weekDays = [
  { short: 'MON', full: 'Monday' },
  { short: 'TUE', full: 'Tuesday' },
  { short: 'WED', full: 'Wednesday' },
  { short: 'THU', full: 'Thursday' },
  { short: 'FRI', full: 'Friday' },
  { short: 'SAT', full: 'Saturday' },
  { short: 'SUN', full: 'Sunday' },
];

interface LibraryExercise { id: string; name: string; muscle_group: string | null; video_url: string | null; }
interface WorkoutExercise { id: string; exercise_id: string; name: string; sets: number; reps: string; rest_seconds: number; order_index: number; }
interface Workout { id: string; title: string; duration_minutes: number | null; notes: string | null; }

function ytThumb(url?: string | null) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? `https://img.youtube.com/vi/${m[1]}/mqdefault.jpg` : null;
}

export default function TrainerStudentWorkoutsPage() {
  const navigate = useNavigate();
  const { studentId } = useParams<{ studentId: string }>();
  const { user } = useAuth();
  const [selectedDay, setSelectedDay] = useState(0);
  const [studentName, setStudentName] = useState('Student');
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [library, setLibrary] = useState<LibraryExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingEx, setEditingEx] = useState<WorkoutExercise | null>(null);
  const [editingDuration, setEditingDuration] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<WorkoutExercise | null>(null);

  const dayKey = weekDays[selectedDay].full;

  useEffect(() => {
    if (!studentId) return;
    supabase.from('profiles').select('full_name, email').eq('id', studentId).maybeSingle()
      .then(({ data }) => setStudentName(data?.full_name || data?.email || 'Student'));
    supabase.from('exercises').select('id, name, muscle_group, video_url').order('name')
      .then(({ data }) => setLibrary((data ?? []) as LibraryExercise[]));
  }, [studentId]);

  const loadDay = async () => {
    if (!studentId) return;
    setLoading(true);
    const { data: w } = await supabase
      .from('workouts')
      .select('id, title, duration_minutes, notes')
      .eq('student_id', studentId)
      .eq('day_of_week', dayKey)
      .maybeSingle();
    if (!w) { setWorkout(null); setExercises([]); setLoading(false); return; }
    setWorkout(w as Workout);
    const { data: we } = await supabase
      .from('workout_exercises')
      .select('id, exercise_id, sets, reps, rest_seconds, order_index, exercises(name)')
      .eq('workout_id', w.id)
      .order('order_index');
    setExercises((we ?? []).map((row: any) => ({
      id: row.id, exercise_id: row.exercise_id, name: row.exercises?.name ?? 'Exercise',
      sets: row.sets, reps: row.reps, rest_seconds: row.rest_seconds, order_index: row.order_index,
    })));
    setLoading(false);
  };

  useEffect(() => { loadDay(); }, [studentId, selectedDay]);

  const ensureWorkout = async (): Promise<Workout | null> => {
    if (workout) return workout;
    if (!studentId || !user) return null;
    const { data, error } = await supabase.from('workouts').insert({
      student_id: studentId, trainer_id: user.id, day_of_week: dayKey, title: `${dayKey} Workout`,
    }).select('id, title, duration_minutes, notes').single();
    if (error) { toast.error(error.message); return null; }
    setWorkout(data as Workout);
    return data as Workout;
  };

  const handleAddExercise = async (lib: LibraryExercise) => {
    const w = await ensureWorkout();
    if (!w) return;
    const { error } = await supabase.from('workout_exercises').insert({
      workout_id: w.id, exercise_id: lib.id, sets: 3, reps: '12', rest_seconds: 60, order_index: exercises.length,
    });
    if (error) { toast.error(error.message); return; }
    setIsAddOpen(false); loadDay();
  };

  const handleSaveExercise = async (data: { sets: number; reps: string; rest_seconds: number }) => {
    if (!editingEx) return;
    const { error } = await supabase.from('workout_exercises').update(data).eq('id', editingEx.id);
    if (error) { toast.error(error.message); return; }
    setEditingEx(null); loadDay();
  };

  const confirmDelete = async () => {
    if (!exerciseToDelete) return;
    const { error } = await supabase.from('workout_exercises').delete().eq('id', exerciseToDelete.id);
    if (error) { toast.error(error.message); return; }
    setExerciseToDelete(null); loadDay();
  };

  const saveDuration = async (mins: number) => {
    const w = await ensureWorkout();
    if (!w) return;
    const { error } = await supabase.from('workouts').update({ duration_minutes: mins }).eq('id', w.id);
    if (error) { toast.error(error.message); return; }
    setWorkout({ ...w, duration_minutes: mins });
    setEditingDuration(false);
  };

  return (
    <div className="px-4 py-6 safe-area-top">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/trainer/students')} className="w-10 h-10 rounded-full bg-card shadow-card flex items-center justify-center"><ArrowLeft className="w-5 h-5 text-muted-foreground" /></button>
          <div><h1 className="font-bold text-foreground">Workout Plan</h1><p className="text-sm text-muted-foreground">Student: {studentName}</p></div>
        </div>
        <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center"><span className="text-primary font-bold text-lg">{studentName.charAt(0).toUpperCase()}</span></div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex gap-2 overflow-x-auto scrollbar-hide mb-6 -mx-4 px-4">
        {weekDays.map((day, index) => (
          <button key={day.short} onClick={() => setSelectedDay(index)} className={`flex-shrink-0 w-16 py-4 rounded-xl transition-all ${selectedDay === index ? 'bg-primary text-primary-foreground shadow-button' : 'bg-card text-muted-foreground'}`}>
            <div className="text-sm font-bold">{day.short}</div>
          </button>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-6">
        <h2 className="text-xl font-bold text-foreground mb-3">{weekDays[selectedDay].full}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="fitness-card flex items-center gap-3"><Repeat className="w-5 h-5 text-primary" /><div><p className="text-xs text-muted-foreground">EXERCISES</p><p className="font-bold text-foreground">{exercises.length}</p></div></div>
          <button onClick={() => setEditingDuration(true)} className="fitness-card flex items-center gap-3 text-left active:scale-95 transition-transform">
            <Clock className="w-5 h-5 text-primary" />
            <div className="flex-1"><p className="text-xs text-muted-foreground">EST. DURATION</p><p className="font-bold text-foreground">{workout?.duration_minutes ? `~${workout.duration_minutes} min` : 'Set duration'}</p></div>
            <Pencil className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </motion.div>

      {loading ? <p className="text-sm text-muted-foreground text-center py-8">Loading...</p> :
       exercises.length > 0 ? (
        <div className="space-y-3 mb-24">
          {exercises.map((exercise) => (
            <motion.div key={exercise.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="fitness-card flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform" onClick={() => setEditingEx(exercise)}>
              <div className="w-16 h-16 bg-foreground/10 rounded-xl flex items-center justify-center relative overflow-hidden flex-shrink-0">
                <Play className="w-6 h-6 text-card z-10" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">{exercise.name}</h3>
                <div className="flex items-center gap-3 mt-1 text-sm">
                  <span className="text-primary font-bold flex items-center gap-1"><Repeat className="w-3.5 h-3.5" />{exercise.sets} × {exercise.reps}</span>
                  <span className="text-muted-foreground flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{exercise.rest_seconds}s rest</span>
                </div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setExerciseToDelete(exercise); }} className="p-2 text-destructive/40 hover:text-destructive transition-colors"><Trash2 className="w-5 h-5" /></button>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="fitness-card flex flex-col items-center justify-center py-16 text-center mb-24">
          <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mb-4 relative">
            <Moon className="w-10 h-10 text-primary" />
            <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="absolute -top-1 -right-1"><Sparkles className="w-6 h-6 text-primary" /></motion.div>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-1">Rest Day</h3>
          <p className="text-muted-foreground text-sm max-w-[220px]">No exercises scheduled. Tap below to add the first one.</p>
        </motion.div>
      )}

      <AnimatePresence>
        {isAddOpen && <SelectExerciseModal library={library} onClose={() => setIsAddOpen(false)} onSelect={handleAddExercise} />}
        {editingEx && <EditExerciseModal exercise={editingEx} onClose={() => setEditingEx(null)} onSave={handleSaveExercise} />}
        {editingDuration && <DurationModal current={workout?.duration_minutes ?? 60} onClose={() => setEditingDuration(false)} onSave={saveDuration} />}
        {exerciseToDelete && <ConfirmationModal title="Delete Exercise" message={`Remove "${exerciseToDelete.name}" from this workout?`} onConfirm={confirmDelete} onCancel={() => setExerciseToDelete(null)} />}
      </AnimatePresence>

      <div className="fixed bottom-24 left-4 right-4">
        <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onClick={() => setIsAddOpen(true)} className="w-full fitness-button-primary flex items-center justify-center gap-2">
          <Plus className="w-5 h-5" /><span>Add Exercise</span>
        </motion.button>
      </div>
    </div>
  );
}

function ConfirmationModal({ title, message, onConfirm, onCancel }: any) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm" onClick={onCancel}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm bg-card rounded-2xl p-6 shadow-2xl text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4"><AlertTriangle className="w-8 h-8 text-destructive" /></div>
        <h2 className="text-xl font-bold text-foreground mb-2">{title}</h2>
        <p className="text-muted-foreground mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 fitness-button-secondary">No</button>
          <button onClick={onConfirm} className="flex-1 fitness-button-primary bg-destructive shadow-none">Yes</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SelectExerciseModal({ library, onClose, onSelect }: { library: LibraryExercise[]; onClose: () => void; onSelect: (e: LibraryExercise) => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const filtered = library.filter(ex => ex.name.toLowerCase().includes(searchTerm.toLowerCase()));
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/50 z-50 flex items-end sm:items-center justify-center backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-card rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Select from Library</h2>
          <button onClick={onClose} className="p-2 rounded-full bg-muted text-muted-foreground"><X className="w-5 h-5" /></button>
        </div>
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input type="text" placeholder="Search exercise..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="fitness-input pl-12" autoFocus />
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 min-h-0 pb-4">
          {filtered.map((exercise) => {
            const thumb = ytThumb(exercise.video_url);
            return (
              <button key={exercise.id} onClick={() => onSelect(exercise)} className="w-full fitness-card flex items-center gap-4 text-left active:scale-[0.98] transition-all">
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-primary/10 flex items-center justify-center">
                  {thumb ? <img src={thumb} alt={exercise.name} className="w-full h-full object-cover" /> : <Play className="w-5 h-5 text-primary" />}
                </div>
                <div className="flex-1 min-w-0"><h3 className="font-semibold text-foreground truncate">{exercise.name}</h3>{exercise.muscle_group && <p className="text-xs text-muted-foreground uppercase">{exercise.muscle_group}</p>}</div>
                <Plus className="w-5 h-5 text-primary ml-auto" />
              </button>
            );
          })}
          {filtered.length === 0 && <div className="text-center py-8"><p className="text-muted-foreground">{library.length === 0 ? 'No exercises in your library yet.' : 'No exercises found.'}</p></div>}
        </div>
      </motion.div>
    </motion.div>
  );
}

function EditExerciseModal({ exercise, onClose, onSave }: { exercise: WorkoutExercise; onClose: () => void; onSave: (d: any) => void }) {
  const [formData, setFormData] = useState({ sets: exercise.sets, reps: exercise.reps, rest_seconds: exercise.rest_seconds });
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/50 z-50 flex items-center justify-center backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-card rounded-3xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground truncate mr-2">{exercise.name}</h2>
          <button onClick={onClose} className="p-2 rounded-full bg-muted text-muted-foreground"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="fitness-label">Sets</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setFormData(p => ({ ...p, sets: Math.max(1, p.sets - 1) }))} className="w-10 h-10 rounded-xl bg-accent text-primary font-bold">-</button>
                <div className="flex-1 bg-muted rounded-xl h-10 flex items-center justify-center font-bold text-lg">{formData.sets}</div>
                <button onClick={() => setFormData(p => ({ ...p, sets: p.sets + 1 }))} className="w-10 h-10 rounded-xl bg-accent text-primary font-bold">+</button>
              </div>
            </div>
            <div>
              <label className="fitness-label">Reps</label>
              <input type="text" value={formData.reps} onChange={(e) => setFormData(p => ({ ...p, reps: e.target.value }))} className="fitness-input text-center font-bold" />
            </div>
          </div>
          <div>
            <label className="fitness-label">Rest Time</label>
            <div className="grid grid-cols-4 gap-2">
              {[30, 45, 60, 90].map((time) => (
                <button key={time} onClick={() => setFormData(p => ({ ...p, rest_seconds: time }))} className={`py-3 rounded-xl font-bold transition-all active:scale-95 ${formData.rest_seconds === time ? 'bg-primary text-primary-foreground shadow-button' : 'bg-muted text-muted-foreground'}`}>{time}s</button>
              ))}
            </div>
          </div>
          <button onClick={() => onSave(formData)} className="w-full fitness-button-primary flex items-center justify-center gap-2"><Check className="w-5 h-5" /><span>Confirm Changes</span></button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function DurationModal({ current, onClose, onSave }: { current: number; onClose: () => void; onSave: (n: number) => void }) {
  const [value, setValue] = useState(current);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/50 z-50 flex items-center justify-center backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm bg-card rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-bold">Estimated Duration</h2><button onClick={onClose} className="p-2 rounded-full bg-muted"><X className="w-5 h-5" /></button></div>
        <label className="fitness-label">Minutes</label>
        <input type="number" min="1" value={value} onChange={(e) => setValue(Number(e.target.value))} className="fitness-input text-center font-bold text-lg mb-6" autoFocus />
        <button onClick={() => onSave(value)} className="w-full fitness-button-primary flex items-center justify-center gap-2"><Check className="w-5 h-5" /><span>Save</span></button>
      </motion.div>
    </motion.div>
  );
}
