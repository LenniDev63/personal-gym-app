import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Play, Pencil, Trash2, X, Video } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Exercise { id: string; name: string; muscle_group: string | null; video_url: string | null; instructions: string | null; }

function ytThumb(url?: string | null) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? `https://img.youtube.com/vi/${m[1]}/mqdefault.jpg` : null;
}

export default function ExerciseLibrary() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Exercise | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState<Exercise | null>(null);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from('exercises').select('*').eq('trainer_id', user.id).order('created_at', { ascending: false });
    setExercises((data ?? []) as Exercise[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, [user]);

  const handleSave = async (data: { name: string; muscle_group: string; video_url: string; instructions: string }) => {
    if (!user) return;
    if (editing) {
      const { error } = await supabase.from('exercises').update(data).eq('id', editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success('Exercise updated');
    } else {
      const { error } = await supabase.from('exercises').insert({ ...data, trainer_id: user.id });
      if (error) { toast.error(error.message); return; }
      toast.success('Exercise added');
    }
    setIsModalOpen(false); setEditing(null); load();
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    const { error } = await supabase.from('exercises').delete().eq('id', toDelete.id);
    if (error) { toast.error(error.message); return; }
    setToDelete(null); load();
  };

  const filtered = exercises.filter((ex) => ex.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="px-4 py-6 safe-area-top">
      <div className="flex items-center justify-between mb-6">
        <h1 className="fitness-page-title">Library</h1>
        <button onClick={() => { setEditing(null); setIsModalOpen(true); }} className="fitness-button-primary flex items-center gap-2 py-2.5 px-4">
          <Plus className="w-5 h-5" /><span className="font-medium">New Exercise</span>
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input type="text" placeholder="Search exercise..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="fitness-input pl-12" />
      </div>

      <div className="space-y-3">
        {loading ? <p className="text-sm text-muted-foreground text-center py-8">Loading...</p> :
          filtered.length === 0 ? <div className="fitness-card text-center py-12 text-muted-foreground">No exercises yet. Add your first one!</div> :
          filtered.map((exercise) => {
            const thumb = ytThumb(exercise.video_url);
            return (
              <motion.div key={exercise.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="fitness-card flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 relative">
                  {thumb ? <img src={thumb} alt={exercise.name} className="w-full h-full object-cover" /> :
                    <div className="w-full h-full bg-foreground/10 flex items-center justify-center"><Play className="w-8 h-8 text-card" /></div>}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center"><Play className="w-6 h-6 text-white drop-shadow-lg" /></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{exercise.name}</h3>
                  {exercise.muscle_group && <span className="fitness-badge-primary text-xs mt-1 inline-block">{exercise.muscle_group.toUpperCase()}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setEditing(exercise); setIsModalOpen(true); }} className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-primary"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => setToDelete(exercise)} className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive"><Trash2 className="w-4 h-4" /></button>
                </div>
              </motion.div>
            );
          })}
      </div>

      <AnimatePresence>
        {isModalOpen && <ExerciseModal exercise={editing} onClose={() => { setIsModalOpen(false); setEditing(null); }} onSave={handleSave} />}
        {toDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/50 z-[60] flex items-center justify-center p-4" onClick={() => setToDelete(null)}>
            <motion.div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm bg-card rounded-2xl p-6 text-center">
              <h2 className="text-xl font-bold mb-2">Delete "{toDelete.name}"?</h2>
              <p className="text-muted-foreground mb-6">This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setToDelete(null)} className="flex-1 fitness-button-secondary">Cancel</button>
                <button onClick={confirmDelete} className="flex-1 fitness-button-primary bg-destructive shadow-none">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ExerciseModal({ exercise, onClose, onSave }: { exercise: Exercise | null; onClose: () => void; onSave: (d: any) => void }) {
  const [formData, setFormData] = useState({
    name: exercise?.name || '',
    video_url: exercise?.video_url || '',
    muscle_group: exercise?.muscle_group || '',
    instructions: exercise?.instructions || '',
  });
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/50 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-card rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6">
          <h2 className="text-xl font-bold">{exercise ? 'Edit Exercise' : 'New Exercise'}</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 pt-0 space-y-5">
          <div><label className="fitness-label">Name *</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="fitness-input" /></div>
          <div>
            <label className="fitness-label">Video URL (YouTube)</label>
            <div className="relative">
              <Video className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input type="url" placeholder="https://youtube.com/..." value={formData.video_url} onChange={(e) => setFormData({ ...formData, video_url: e.target.value })} className="fitness-input pl-12" />
            </div>
          </div>
          <div><label className="fitness-label">Muscle Group</label><input type="text" placeholder="E.g. Chest" value={formData.muscle_group} onChange={(e) => setFormData({ ...formData, muscle_group: e.target.value })} className="fitness-input" /></div>
          <div><label className="fitness-label">Instructions</label><textarea rows={3} value={formData.instructions} onChange={(e) => setFormData({ ...formData, instructions: e.target.value })} className="fitness-input resize-none" /></div>
          <button onClick={() => onSave(formData)} disabled={!formData.name} className="w-full fitness-button-primary disabled:opacity-50">{exercise ? 'Save Changes' : 'Add Exercise'}</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
