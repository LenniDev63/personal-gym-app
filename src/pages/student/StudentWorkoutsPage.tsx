import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Clock, Repeat, Check, ChevronRight, Timer, CheckCircle, Send, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const weekDays = [
  { short: 'MON', full: 'Monday', date: 12, hasWorkout: true },
  { short: 'TUE', full: 'Tuesday', date: 13, hasWorkout: true },
  { short: 'WED', full: 'Wednesday', date: 14, hasWorkout: false },
  { short: 'THU', full: 'Thursday', date: 15, hasWorkout: true },
  { short: 'FRI', full: 'Friday', date: 16, hasWorkout: true },
  { short: 'SAT', full: 'Saturday', date: 17, hasWorkout: false },
  { short: 'SUN', full: 'Sunday', date: 18, hasWorkout: false },
];

const mockWorkout = {
  muscleGroups: 'Legs + Abs',
  exercises: [
    { id: 1, name: 'Barbell Squat', sets: 4, reps: 12, rest: 60, notes: 'Keep knees aligned', completed: false, videoUrl: 'https://www.youtube.com/embed/gcNh17Ckjgg' },
    { id: 2, name: 'Leg Press 45°', sets: 4, reps: 15, rest: 45, notes: '', completed: false, videoUrl: 'https://www.youtube.com/embed/gcNh17Ckjgg' },
    { id: 3, name: 'Leg Extension', sets: 3, reps: 12, rest: 45, notes: 'Control the eccentric', completed: false, videoUrl: 'https://www.youtube.com/embed/gcNh17Ckjgg' },
    { id: 4, name: 'Leg Curl', sets: 3, reps: 12, rest: 45, notes: '', completed: false, videoUrl: 'https://www.youtube.com/embed/gcNh17Ckjgg' },
    { id: 5, name: 'Abdominal Crunch', sets: 4, reps: 20, rest: 30, notes: 'Focus on contraction', completed: false, videoUrl: 'https://www.youtube.com/embed/gcNh17Ckjgg' },
  ],
};

export default function StudentWorkoutsPage() {
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState(0);
  const [exercises, setExercises] = useState(mockWorkout.exercises);
  const [activeRest, setActiveRest] = useState<number | null>(null);
  const [restTimer, setRestTimer] = useState(0);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [expandedExercise, setExpandedExercise] = useState<number | null>(null);

  const completedCount = exercises.filter(e => e.completed).length;
  const allCompleted = completedCount === exercises.length;

  const toggleExercise = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const exercise = exercises.find(e => e.id === id);
    if (!exercise) return;
    const newCompletedStatus = !exercise.completed;
    if (newCompletedStatus) {
      setActiveRest(id);
      setRestTimer(exercise.rest);
      const interval = setInterval(() => {
        setRestTimer(prev => { if (prev <= 1) { clearInterval(interval); setActiveRest(null); return 0; } return prev - 1; });
      }, 1000);
    }
    setExercises(exercises.map(e => e.id === id ? { ...e, completed: newCompletedStatus } : e));
    if (newCompletedStatus && expandedExercise === id) setExpandedExercise(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="px-4 py-6 safe-area-top">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div><h1 className="fitness-page-title">My Workouts</h1><p className="text-muted-foreground text-sm">Coach: Alex Personal</p></div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/notifications')} className="w-10 h-10 rounded-full bg-card shadow-sm flex items-center justify-center relative active:scale-90 transition-transform">
            <Bell className="w-5 h-5 text-muted-foreground" /><span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-destructive rounded-full" />
          </button>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"><span className="text-primary font-bold text-lg">J</span></div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex gap-2 overflow-x-auto scrollbar-hide mb-6 -mx-4 px-4">
        {weekDays.map((day, index) => (
          <button key={day.short} onClick={() => setSelectedDay(index)} disabled={!day.hasWorkout} className={`flex-shrink-0 w-16 py-3 rounded-xl transition-all relative ${selectedDay === index ? 'bg-primary text-primary-foreground shadow-button' : day.hasWorkout ? 'bg-card text-muted-foreground' : 'bg-muted/50 text-muted-foreground/50'}`}>
            <div className="text-xs font-medium">{day.short}</div><div className="text-lg font-bold">{day.date}</div>
            {day.hasWorkout && selectedDay !== index && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" />}
          </button>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-foreground">{mockWorkout.muscleGroups}</h2>
          <span className="text-sm text-muted-foreground">{completedCount}/{exercises.length} exercises</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <motion.div className="h-full bg-primary rounded-full" initial={{ width: 0 }} animate={{ width: `${(completedCount / exercises.length) * 100}%` }} transition={{ duration: 0.3 }} />
        </div>
      </motion.div>

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
                      {exercise.videoUrl ? (
                        <iframe width="100%" height="100%" src={`${exercise.videoUrl}?rel=0&modestbranding=1`} title={exercise.name} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen className="rounded-2xl" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2"><Play className="w-8 h-8 opacity-20" /><p className="text-xs">Video not available</p></div>
                      )}
                    </div>
                    {exercise.notes && (
                      <div className="bg-primary/5 rounded-xl p-3 flex gap-3">
                        <Send className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-muted-foreground leading-relaxed"><span className="font-bold text-primary block mb-0.5 uppercase tracking-wider">Coach's Tip:</span>"{exercise.notes}"</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>

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
        <button className="w-full fitness-button-primary flex items-center justify-center gap-2"><Send className="w-4 h-4" /><span>Send & Finish</span></button>
      </motion.div>
    </motion.div>
  );
}
