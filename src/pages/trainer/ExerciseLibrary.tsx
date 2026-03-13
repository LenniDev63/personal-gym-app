import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Play, Pencil, Trash2, ChevronDown, X, Video, AlertTriangle } from 'lucide-react';

const INITIAL_MUSCLE_GROUPS = [
  'Chest',
  'Back',
  'Legs',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Abs',
  'Glutes',
];

const EXERCISE_VIDEOS: Record<string, string> = {
  'Chest': 'https://img.youtube.com/vi/rT7DgCr-3pg/mqdefault.jpg',
  'Legs': 'https://img.youtube.com/vi/gcNh17Ckjgg/mqdefault.jpg',
  'Back': 'https://img.youtube.com/vi/eGo4IYlbE5g/mqdefault.jpg',
  'Shoulders': 'https://img.youtube.com/vi/qEwKCR5JCog/mqdefault.jpg',
  'Biceps': 'https://img.youtube.com/vi/ykJmrZ5v0Oo/mqdefault.jpg',
  'Triceps': 'https://img.youtube.com/vi/2-LAMcpzODU/mqdefault.jpg',
};

const mockExercises = [
  { id: 1, name: 'Barbell Bench Press', muscleGroup: 'Chest', type: 'Compound', videoUrl: 'https://www.youtube.com/watch?v=rT7DgCr-3pg' },
  { id: 2, name: 'Barbell Squat', muscleGroup: 'Legs', type: 'Compound', videoUrl: 'https://www.youtube.com/watch?v=gcNh17Ckjgg' },
  { id: 3, name: 'Lat Pulldown', muscleGroup: 'Back', type: 'Isolation', videoUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g' },
  { id: 4, name: 'Dumbbell Shoulder Press', muscleGroup: 'Shoulders', type: 'Compound', videoUrl: 'https://www.youtube.com/watch?v=qEwKCR5JCog' },
  { id: 5, name: 'Barbell Curl', muscleGroup: 'Biceps', type: 'Isolation', videoUrl: 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo' },
  { id: 6, name: 'Triceps Rope Pushdown', muscleGroup: 'Triceps', type: 'Isolation', videoUrl: 'https://www.youtube.com/watch?v=2-LAMcpzODU' },
];

function getYouTubeThumbnail(url?: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (match) return `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`;
  return null;
}

export default function ExerciseLibrary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('All Muscles');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<any | null>(null);
  const [muscleGroups, setMuscleGroups] = useState(INITIAL_MUSCLE_GROUPS);
  const [exercises, setExercises] = useState(mockExercises);
  const [exerciseToDelete, setExerciseToDelete] = useState<any | null>(null);

  const handleDeleteClick = (exercise: any) => {
    setExerciseToDelete(exercise);
  };

  const confirmDelete = () => {
    if (exerciseToDelete) {
      setExercises(exercises.filter(ex => ex.id !== exerciseToDelete.id));
      setExerciseToDelete(null);
    }
  };

  const allFilterGroups = ['All Muscles', ...muscleGroups];

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = selectedGroup === 'All Muscles' || exercise.muscleGroup === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  const handleEdit = (exercise: any) => {
    setEditingExercise(exercise);
    setIsModalOpen(true);
  };

  const handleNewExercise = () => {
    setEditingExercise(null);
    setIsModalOpen(true);
  };

  const handleSaveExercise = (data: any) => {
    if (editingExercise) {
      setExercises(exercises.map(ex =>
        ex.id === editingExercise.id ? { ...ex, ...data } : ex
      ));
    } else {
      const newExercise = {
        id: exercises.length + 1,
        ...data,
        type: 'Isolation',
      };
      setExercises([newExercise, ...exercises]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="px-4 py-6 safe-area-top">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <h1 className="fitness-page-title">Library</h1>
        <button
          onClick={handleNewExercise}
          className="fitness-button-primary flex items-center gap-2 py-2.5 px-4"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">New Exercise</span>
        </button>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative mb-4"
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search exercise..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="fitness-input pl-12"
        />
      </motion.div>

      {/* Filter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-6"
      >
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
          Filter by Muscle Group
        </label>
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="w-full fitness-input flex items-center justify-between"
        >
          <span>{selectedGroup}</span>
          <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 bg-card rounded-xl shadow-card overflow-hidden"
            >
              {allFilterGroups.map((group) => (
                <button
                  key={group}
                  onClick={() => {
                    setSelectedGroup(group);
                    setIsFilterOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-accent transition-colors ${selectedGroup === group ? 'bg-accent text-primary font-medium' : 'text-foreground'
                    }`}
                >
                  {group}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Exercise List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        {filteredExercises.map((exercise, index) => {
          const thumbnail = getYouTubeThumbnail(exercise.videoUrl);
          return (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="fitness-card flex items-center gap-4"
            >
              {/* Thumbnail */}
              <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 relative">
                {thumbnail ? (
                  <img src={thumbnail} alt={exercise.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-foreground/10 flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-foreground/20 to-foreground/5" />
                    <Play className="w-8 h-8 text-card z-10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Play className="w-6 h-6 text-white drop-shadow-lg" />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">{exercise.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="fitness-badge-primary text-xs">{exercise.muscleGroup.toUpperCase()}</span>
                  <span className="text-xs text-muted-foreground">• {exercise.type}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(exercise)}
                  className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteClick(exercise)}
                  className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}

        {filteredExercises.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No exercises found.</p>
          </div>
        )}
      </motion.div>

      {/* Delete Modal */}
      <AnimatePresence>
        {exerciseToDelete && (
          <ConfirmationModal
            title="Delete Exercise"
            message={`Are you sure you want to delete "${exerciseToDelete.name}"? This action cannot be undone.`}
            onConfirm={confirmDelete}
            onCancel={() => setExerciseToDelete(null)}
          />
        )}
      </AnimatePresence>

      {/* Exercise Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <ExerciseModal
            exercise={editingExercise}
            onClose={() => setIsModalOpen(false)}
            muscleGroups={muscleGroups}
            onAddMuscleGroup={(group) => setMuscleGroups([...muscleGroups, group])}
            onSave={handleSaveExercise}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ConfirmationModal({ title, message, onConfirm, onCancel }: any) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-foreground/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-card rounded-2xl p-6 shadow-2xl text-center"
      >
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">{title}</h2>
        <p className="text-muted-foreground mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 fitness-button-secondary"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 fitness-button-primary bg-destructive shadow-none"
          >
            Yes
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ExerciseModal({
  exercise,
  onClose,
  muscleGroups,
  onAddMuscleGroup,
  onSave
}: {
  exercise: any | null;
  onClose: () => void;
  muscleGroups: string[];
  onAddMuscleGroup: (group: string) => void;
  onSave: (data: any) => void;
}) {
  const [formData, setFormData] = useState({
    name: exercise?.name || '',
    videoUrl: exercise?.videoUrl || '',
    muscleGroup: exercise?.muscleGroup || '',
    description: '',
  });
  const [isNewGroupInputOpen, setIsNewGroupInputOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const handleAddNewGroup = () => {
    if (newGroupName.trim()) {
      onAddMuscleGroup(newGroupName.trim());
      setFormData({ ...formData, muscleGroup: newGroupName.trim() });
      setNewGroupName('');
      setIsNewGroupInputOpen(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-foreground/50 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-card rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-12 h-1.5 bg-muted rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {exercise ? 'Edit Exercise' : 'New Exercise'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {exercise ? 'Update the exercise information' : 'Add a new exercise to the library'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="h-px bg-border" />

        {/* Form */}
        <div className="p-6 space-y-5">
          <div>
            <label className="fitness-label">
              Exercise Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              placeholder="E.g.: Bench Press"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="fitness-input"
            />
          </div>

          <div>
            <label className="fitness-label">
              Video URL (YouTube) <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Video className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="url"
                placeholder="https://www.youtube.com/..."
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                className="fitness-input pl-12"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              Paste the YouTube link or embed code
            </p>
          </div>

          <div>
            <label className="fitness-label">Muscle Group</label>
            <div className="space-y-3">
              <select
                value={formData.muscleGroup}
                onChange={(e) => {
                  if (e.target.value === 'ADD_NEW') {
                    setIsNewGroupInputOpen(true);
                  } else {
                    setFormData({ ...formData, muscleGroup: e.target.value });
                    setIsNewGroupInputOpen(false);
                  }
                }}
                className="fitness-input appearance-none cursor-pointer"
              >
                <option value="">Select muscle group</option>
                {muscleGroups.map((group) => (
                  <option key={group} value={group}>{group}</option>
                ))}
                <option value="ADD_NEW" className="text-primary font-semibold">+ Add new group</option>
              </select>

              <AnimatePresence>
                {isNewGroupInputOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      placeholder="New group..."
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      className="fitness-input flex-1"
                      autoFocus
                    />
                    <button
                      onClick={handleAddNewGroup}
                      className="bg-primary text-primary-foreground rounded-xl px-4 font-semibold shadow-sm hover:brightness-110"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setIsNewGroupInputOpen(false)}
                      className="bg-muted text-muted-foreground rounded-xl px-4 font-medium"
                    >
                      Cancel
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div>
            <label className="fitness-label">Description / Notes</label>
            <textarea
              placeholder="Instructions, tips, muscles worked..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="fitness-input resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 space-y-3">
          <button
            onClick={() => onSave(formData)}
            className="w-full fitness-button-primary"
          >
            {exercise ? 'Save Changes' : 'Create Exercise'}
          </button>
          <button onClick={onClose} className="w-full text-muted-foreground font-medium py-3">
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
