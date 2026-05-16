import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Clock, Repeat, Check, ChevronRight, Timer, CheckCircle, Send, Bell, Moon, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const weekDays = [
  { short: 'MON', full: 'Monday' },
  { short: 'TUE', full: 'Tuesday' },
  { short: 'WED', full: 'Wednesday' },
  { short: 'THU', full: 'Thursday' },
  { short: 'FRI', full: 'Friday' },
  { short: 'SAT', full: 'Saturday' },
  { short: 'SUN', full: 'Sunday' },
];

interface DayWorkout { id: string; title: string; duration_minutes: number | null; }
interface DisplayExercise { id: string; name: string; sets: number; reps: string; rest: number; videoUrl: string | null; instructions: string | null; completed: boolean; }

export default function StudentWorkoutsPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [selectedDay, setSelectedDay] = useState(0);
  const [daysWithWorkouts, setDaysWithWorkouts] = useState<Set<string>>(new Set());
  const [workout, setWorkout] = useState<DayWorkout | null>(null);
  const [exercises, setExercises] = useState<DisplayExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRest, setActiveRest] = useState<string | null>(null);
  const [restTimer, setRestTimer] = useState(0);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from('workouts').select('day_of_week').eq('student_id', user.id)
      .then(({ data }) => setDaysWithWorkouts(new Set((data ?? []).map((r: any) => r.day_of_week).filter(Boolean))));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const dayKey = weekDays[selectedDay].full;
    (async () => {
      const { data: w } = await supabase.from('workouts')
        .select('id, title, duration_minutes')
        .eq('student_id', user.id).eq('day_of_week', dayKey).maybeSingle();
      if (!w) { setWorkout(null); setExercises([]); setLoading(false); return; }
      setWorkout(w as DayWorkout);
      const { data: we } = await supabase.from('workout_exercises')
        .select('id, sets, reps, rest_seconds, order_index, exercises(name, video_url, instructions)')
        .eq('workout_id', w.id).order('order_index');
      setExercises((we ?? []).map((row: any) => ({
        id: row.id, name: row.exercises?.name ?? 'Exercise', sets: row.sets, reps: row.reps,
        rest: row.rest_seconds, videoUrl: row.exercises?.video_url ?? null,
        instructions: row.exercises?.instructions ?? null, completed: false,
      })));
      setLoading(false);
    })();
  }, [user, selectedDay]);

  const completedCount = exercises.filter(e => e.completed).length;
  const allCompleted = exercises.length > 0 && completedCount === exercises.length;

  const toggleExercise = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const exercise = exercises.find(x => x.id === id);
    if (!exercise) return;
    const newCompleted = !exercise.completed;
    if (newCompleted) {
      setActiveRest(id); setRestTimer(exercise.rest);
      const interval = setInterval(() => {
        setRestTimer(prev => { if (prev <= 1) { clearInterval(interval); setActiveRest(null); return 0; } return prev - 1; });
      }, 1000);
    }
    setExercises(exercises.map(x => x.id === id ? { ...x, completed: newCompleted } : x));
    if (newCompleted && expandedExercise === id) setExpandedExercise(null);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="px-4 py-6 safe-area-top">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div><h1 className="fitness-page-title">My Workouts</h1><p className="text-muted-foreground text-sm">{weekDays[selectedDay].full}</p></div>
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"><span className="text-primary font-bold text-lg">{(profile?.full_name || profile?.email || 'S').charAt(0).toUpperCase()}</span></div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex gap-2 overflow-x-auto scrollbar-hide mb-6 -mx-4 px-4">
        {weekDays.map((day, index) => {
          const has = daysWithWorkouts.has(day.full);
          return (
            <button key={day.short} onClick={() => setSelectedDay(index)} className={`flex-shrink-0 w-16 py-4 rounded-xl transition-all relative ${selectedDay === index ? 'bg-primary text-primary-foreground shadow-button' : has ? 'bg-card text-muted-foreground' : 'bg-muted/50 text-muted-foreground/50'}`}>
              <div className="text-sm font-bold">{day.short}</div>
              {has && selectedDay !== index && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" />}
            </button>
          );
        })}
      </motion.div>

      {workout && exercises.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-foreground">{workout.title}</h2>
            <span className="text-sm text-muted-foreground">{completedCount}/{exercises.length} exercises</span>
          </div>
          {workout.duration_minutes && <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />~{workout.duration_minutes} min</p>}
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <motion.div className="h-full bg-primary rounded-full" initial={{ width: 0 }} animate={{ width: `${(completedCount / exercises.length) * 100}%` }} transition={{ duration: 0.3 }} />
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {activeRest !== null && restTimer > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-card rounded-3xl p-8 shadow-2xl text-center">
            <Timer className="w-12 h-12 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">Rest Time</p>
            <p className="text-5xl font-bold text-foreground">{formatTime(restTimer)}</p>
            <button onClick={() => { setActiveRest(null); setRestTimer(0); }} className="fitness-button-secondary mt-6">Skip</button>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? <p className="text-center py-12 text-sm text-muted-foreground">Loading...</p> :
       exercises.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="fitness-card flex flex-col items-center justify-center py-16 text-center mb-24">
          <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mb-4 relative">
            <Moon className="w-10 h-10 text-primary" />
            <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="absolute -top-1 -right-1"><Sparkles className="w-6 h-6 text-primary" /></motion.div>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-1">Rest Day</h3>
          <p className="text-muted-foreground text-sm max-w-[220px]">No workout scheduled for this day.</p>
        </motion.div>
       ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-3 mb-24">
          {exercises.map((exercise, index) => {
            const isExpanded = expandedExercise === exercise.id;
            return (
              <motion.div key={exercise.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + index * 0.05 }} layout onClick={() => setExpandedExercise(isExpanded ? null : exercise.id)} className={`fitness-card overflow-hidden transition-all duration-300 ${exercise.completed ? 'opacity-60 bg-accent/30' : 'bg-card'} ${isExpanded ? 'ring-2 ring-primary ring-inset' : ''}`}>
                <div className="flex items-start gap-4 p-4">
                  <button onClick={(e) => toggleExercise(e, exercise.id)} className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center transition-all mt-1 ${exercise.completed ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {exercise.completed && <Check className="w-5 h-5" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold transition-all ${exercise.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{exercise.name}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm">
                      <span className="text-primary font-medium flex items-center gap-1"><Repeat className="w-3.5 h-3.5" />{exercise.sets} × {exercise.reps}</span>
                      <span className="text-muted-foreground flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{exercise.rest}s</span>
                    </div>
                  </div>
                  <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} className="mt-2"><ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" /></motion.div>
                </div>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-4 pb-4 overflow-hidden">
                      <div className="aspect-video w-full rounded-2xl bg-foreground/10 mb-4 overflow-hidden shadow-lg">
                        {exercise.videoUrl ? (() => {
                          const m = exercise.videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
                          const embed = m ? `https://www.youtube.com/embed/${m[1]}` : exercise.videoUrl;
                          return <iframe width="100%" height="100%" src={`${embed}?rel=0&modestbranding=1`} title={exercise.name} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen className="rounded-2xl" />;
                        })() : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2"><Play className="w-8 h-8 opacity-20" /><p className="text-xs">Video not available</p></div>
                        )}
                      </div>
                      {exercise.instructions && (
                        <div className="bg-primary/5 rounded-xl p-3 flex gap-3">
                          <Send className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-muted-foreground leading-relaxed"><span className="font-bold text-primary block mb-0.5 uppercase tracking-wider">Coach's Tip:</span>"{exercise.instructions}"</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
       )}

      {allCompleted && (
        <div className="fixed bottom-24 left-4 right-4">
          <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onClick={() => setShowCompleteModal(true)} className="w-full fitness-button-primary flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5" /><span>Workout Complete!</span>
          </motion.button>
        </div>
      )}

      <AnimatePresence>{showCompleteModal && <CompleteWorkoutModal onClose={() => setShowCompleteModal(false)} />}</AnimatePresence>
    </div>
  );
}

function CompleteWorkoutModal({ onClose }: { onClose: () => void }) {
  const [message, setMessage] = useState('');
  const maxLength = 150;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/50 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm bg-card rounded-3xl p-6 text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-10 h-10 text-primary" /></div>
        <h2 className="text-xl font-bold text-foreground mb-2">Congratulations! 🎉</h2>
        <p className="text-muted-foreground mb-6">You completed today's workout!</p>
        <div className="mb-4">
          <label className="fitness-label text-left">Leave a message for your coach (optional)</label>
          <textarea placeholder="How was the workout?" value={message} onChange={(e) => setMessage(e.target.value.slice(0, maxLength))} rows={3} className="fitness-input resize-none" />
          <p className="text-xs text-muted-foreground text-right mt-1">{message.length}/{maxLength}</p>
        </div>
        <button onClick={onClose} className="w-full fitness-button-primary flex items-center justify-center gap-2"><Send className="w-4 h-4" /><span>Send & Finish</span></button>
      </motion.div>
    </motion.div>
  );
}
