import React, { useState } from 'react';
import { motion, Reorder, AnimatePresence, useDragControls } from 'framer-motion';
import { ArrowLeft, Plus, Clock, Repeat, Play, GripVertical, X, Check, Moon, Sparkles, Search, Trash2, AlertTriangle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const weekDays = [
  { short: 'MON', full: 'Monday', date: 12 },
  { short: 'TUE', full: 'Tuesday', date: 13 },
  { short: 'WED', full: 'Wednesday', date: 14 },
  { short: 'THU', full: 'Thursday', date: 15 },
  { short: 'FRI', full: 'Friday', date: 16 },
  { short: 'SAT', full: 'Saturday', date: 17 },
  { short: 'SUN', full: 'Sunday', date: 18 },
];

const mockExercises = [
  { id: 101, name: 'Barbell Bench Press', muscleGroup: 'Chest', type: 'Compound' },
  { id: 102, name: 'Barbell Squat', muscleGroup: 'Legs', type: 'Compound' },
  { id: 103, name: 'Lat Pulldown', muscleGroup: 'Back', type: 'Isolation' },
  { id: 104, name: 'Dumbbell Shoulder Press', muscleGroup: 'Shoulders', type: 'Compound' },
  { id: 105, name: 'Barbell Curl', muscleGroup: 'Biceps', type: 'Isolation' },
  { id: 106, name: 'Triceps Rope Pushdown', muscleGroup: 'Triceps', type: 'Isolation' },
];

const mockWorkout = {
  muscleGroups: 'Chest + Triceps',
  level: 'ADVANCED',
  description: 'Focus on hypertrophy with controlled tempo.',
  exerciseCount: 8,
  estimatedDuration: '~65 min',
  exercises: [
    { id: 1, name: 'Bench Press', sets: 4, reps: 12, rest: '60s' },
    { id: 2, name: 'Machine Fly', sets: 3, reps: 15, rest: '45s' },
    { id: 3, name: 'Triceps Rope Pushdown', sets: 4, reps: 10, rest: '60s' },
    { id: 4, name: 'Overhead Triceps Extension', sets: 3, reps: 12, rest: '45s' },
  ],
};

export default function StudentWorkoutsPage() {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const [selectedDay, setSelectedDay] = useState(0);
  const [dailyWorkouts, setDailyWorkouts] = useState<Record<number, any[]>>({
    0: mockWorkout.exercises, 1: [], 2: [], 3: [], 4: [], 5: [], 6: [],
  });
  const exercises = dailyWorkouts[selectedDay] || [];
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<any>(null);
  const [exerciseToDelete, setExerciseToDelete] = useState<any>(null);

  const handleEditExercise = (exercise: any) => { setEditingExercise(exercise); setIsEditModalOpen(true); };
  const handleDeleteClick = (e: React.MouseEvent, exercise: any) => { e.stopPropagation(); setExerciseToDelete(exercise); };
  const confirmDelete = () => {
    if (exerciseToDelete) {
      setDailyWorkouts(prev => ({ ...prev, [selectedDay]: exercises.filter(ex => ex.id !== exerciseToDelete.id) }));
      setExerciseToDelete(null);
    }
  };
  const handleAddExercise = (exerciseFromLibrary: any) => {
    const newExercise = { id: Date.now(), name: exerciseFromLibrary.name, sets: 3, reps: 12, rest: '60s' };
    setDailyWorkouts(prev => ({ ...prev, [selectedDay]: [...(prev[selectedDay] || []), newExercise] }));
    setIsAddModalOpen(false);
  };
  const handleSaveExercise = (updatedData: any) => {
    setDailyWorkouts(prev => ({ ...prev, [selectedDay]: exercises.map(ex => ex.id === editingExercise.id ? { ...ex, ...updatedData } : ex) }));
    setIsEditModalOpen(false);
  };
  const handleReorder = (newOrder: any[]) => { setDailyWorkouts(prev => ({ ...prev, [selectedDay]: newOrder })); };

  return (
    <div className="px-4 py-6 safe-area-top">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/trainer/students')} className="w-10 h-10 rounded-full bg-card shadow-card flex items-center justify-center"><ArrowLeft className="w-5 h-5 text-muted-foreground" /></button>
          <div><h1 className="font-bold text-foreground">Workout Plan</h1><p className="text-sm text-muted-foreground">Student: Rodrigo Silva</p></div>
        </div>
        <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center"><span className="text-primary font-bold text-lg">R</span></div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex gap-2 overflow-x-auto scrollbar-hide mb-6 -mx-4 px-4">
        {weekDays.map((day, index) => (
          <button key={day.short} onClick={() => setSelectedDay(index)} className={`flex-shrink-0 w-16 py-3 rounded-xl transition-all ${selectedDay === index ? 'bg-primary text-primary-foreground shadow-button' : 'bg-card text-muted-foreground'}`}>
            <div className="text-xs font-medium">{day.short}</div><div className="text-lg font-bold">{day.date}</div>
          </button>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-foreground">{mockWorkout.muscleGroups}</h2>
          <span className="fitness-badge-primary">{mockWorkout.level}</span>
        </div>
        <p className="text-muted-foreground text-sm mb-4">{mockWorkout.description}</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="fitness-card flex items-center gap-3"><Repeat className="w-5 h-5 text-primary" /><div><p className="text-xs text-muted-foreground">EXERCISES</p><p className="font-bold text-foreground">{mockWorkout.exerciseCount}</p></div></div>
          <div className="fitness-card flex items-center gap-3"><Clock className="w-5 h-5 text-primary" /><div><p className="text-xs text-muted-foreground">EST. DURATION</p><p className="font-bold text-foreground">{mockWorkout.estimatedDuration}</p></div></div>
        </div>
      </motion.div>

      {exercises.length > 0 ? (
        <Reorder.Group axis="y" values={exercises} onReorder={handleReorder} className="space-y-3 mb-24">
          {exercises.map((exercise) => (
            <ExerciseCard key={exercise.id} exercise={exercise} onEdit={() => handleEditExercise(exercise)} onDelete={(e) => handleDeleteClick(e, exercise)} />
          ))}
        </Reorder.Group>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="fitness-card flex flex-col items-center justify-center py-16 text-center mb-24">
          <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mb-4 relative">
            <Moon className="w-10 h-10 text-primary" />
            <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="absolute -top-1 -right-1"><Sparkles className="w-6 h-6 text-primary" /></motion.div>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-1">Rest Day</h3>
          <p className="text-muted-foreground text-sm max-w-[200px]">Take time to recover and come back stronger!</p>
        </motion.div>
      )}

      <AnimatePresence>{isEditModalOpen && <EditExerciseModal exercise={editingExercise} onClose={() => setIsEditModalOpen(false)} onSave={handleSaveExercise} />}</AnimatePresence>
      <AnimatePresence>{isAddModalOpen && <SelectExerciseModal onClose={() => setIsAddModalOpen(false)} onSelect={handleAddExercise} />}</AnimatePresence>
      <AnimatePresence>{exerciseToDelete && <ConfirmationModal title="Delete Exercise" message={`Are you sure you want to delete "${exerciseToDelete.name}" from this workout?`} onConfirm={confirmDelete} onCancel={() => setExerciseToDelete(null)} />}</AnimatePresence>

      <div className="fixed bottom-24 left-4 right-4">
        <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} onClick={() => setIsAddModalOpen(true)} className="w-full fitness-button-primary flex items-center justify-center gap-2">
          <Plus className="w-5 h-5" /><span>Add Exercise</span>
        </motion.button>
      </div>
    </div>
  );
}

function ExerciseCard({ exercise, onEdit, onDelete }: any) {
  const controls = useDragControls();
  return (
    <Reorder.Item value={exercise} dragListener={false} dragControls={controls} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="fitness-card flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform" onClick={onEdit}>
      <div className="w-16 h-16 bg-foreground/10 rounded-xl flex items-center justify-center relative overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-br from-foreground/20 to-foreground/5" /><Play className="w-6 h-6 text-card z-10" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground">{exercise.name}</h3>
        <div className="flex items-center gap-3 mt-1 text-sm">
          <span className="text-primary font-bold flex items-center gap-1"><Repeat className="w-3.5 h-3.5" />{exercise.sets} × {exercise.reps}</span>
          <span className="text-muted-foreground flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{exercise.rest} rest</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onDelete} className="p-2 text-destructive/40 hover:text-destructive transition-colors"><Trash2 className="w-5 h-5" /></button>
        <div className="text-muted-foreground/30 p-2 cursor-grab active:cursor-grabbing" onPointerDown={(e) => controls.start(e)}><GripVertical className="w-5 h-5" /></div>
      </div>
    </Reorder.Item>
  );
}

function ConfirmationModal({ title, message, onConfirm, onCancel }: any) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm" onClick={onCancel}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm bg-card rounded-2xl p-6 shadow-2xl text-center">
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

function SelectExerciseModal({ onClose, onSelect }: any) {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredExercises = mockExercises.filter(ex => ex.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/50 z-50 flex items-end sm:items-center justify-center backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-card rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Select Exercise</h2>
          <button onClick={onClose} className="p-2 rounded-full bg-muted text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input type="text" placeholder="Search exercise..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="fitness-input pl-12" autoFocus />
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 min-h-0 pb-4">
          {filteredExercises.map((exercise) => (
            <button key={exercise.id} onClick={() => onSelect(exercise)} className="w-full fitness-card flex items-center gap-4 text-left active:scale-[0.98] transition-all">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0"><Play className="w-5 h-5 text-primary" /></div>
              <div><h3 className="font-semibold text-foreground">{exercise.name}</h3><p className="text-xs text-muted-foreground uppercase">{exercise.muscleGroup}</p></div>
              <Plus className="w-5 h-5 text-primary ml-auto" />
            </button>
          ))}
          {filteredExercises.length === 0 && <div className="text-center py-8"><p className="text-muted-foreground">No exercises found.</p></div>}
        </div>
      </motion.div>
    </motion.div>
  );
}

function EditExerciseModal({ exercise, onClose, onSave }: any) {
  const [formData, setFormData] = useState({ sets: exercise.sets, reps: exercise.reps, rest: exercise.rest });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/50 z-50 flex items-center justify-center backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-card rounded-3xl shadow-2xl p-6 overflow-hidden">
        <div className="flex flex-col max-h-[80vh]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground truncate mr-2">{exercise.name}</h2>
            <button onClick={onClose} className="p-2 rounded-full bg-muted text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
          </div>
          <div className="flex-1 overflow-y-auto pb-4 scrollbar-hide">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="fitness-label">Sets</label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setFormData(p => ({ ...p, sets: Math.max(1, p.sets - 1) }))} className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-primary font-bold active:scale-95 transition-transform">-</button>
                    <div className="flex-1 bg-muted rounded-xl h-10 flex items-center justify-center font-bold text-lg">{formData.sets}</div>
                    <button onClick={() => setFormData(p => ({ ...p, sets: p.sets + 1 }))} className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-primary font-bold active:scale-95 transition-transform">+</button>
                  </div>
                </div>
                <div>
                  <label className="fitness-label">Reps</label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setFormData(p => ({ ...p, reps: Math.max(1, p.reps - 1) }))} className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-primary font-bold active:scale-95 transition-transform">-</button>
                    <div className="flex-1 bg-muted rounded-xl h-10 flex items-center justify-center font-bold text-lg">{formData.reps}</div>
                    <button onClick={() => setFormData(p => ({ ...p, reps: p.reps + 1 }))} className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-primary font-bold active:scale-95 transition-transform">+</button>
                  </div>
                </div>
              </div>
              <div>
                <label className="fitness-label">Rest Time</label>
                <div className="grid grid-cols-4 gap-2">
                  {['30s', '45s', '60s', '90s'].map((time) => (
                    <button key={time} onClick={() => setFormData(p => ({ ...p, rest: time }))} className={`py-3 rounded-xl font-bold transition-all active:scale-95 ${formData.rest === time ? 'bg-primary text-primary-foreground shadow-button' : 'bg-muted text-muted-foreground hover:bg-accent'}`}>{time}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="pt-4 border-t bg-card mt-auto">
            <button onClick={() => onSave(formData)} className="w-full fitness-button-primary flex items-center justify-center gap-2"><Check className="w-5 h-5" /><span>Confirm Changes</span></button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
