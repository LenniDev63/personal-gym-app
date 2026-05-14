import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Dumbbell, X, Mail, User as UserIcon, Trash2, TrendingUp, MessageSquare, ListFilter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StudentRow { link_id: string; id: string; name: string; email: string | null; goal: string | null; }

export default function StudentsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentToDelete, setStudentToDelete] = useState<StudentRow | null>(null);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data: links } = await supabase.from('trainer_students').select('id, student_id').eq('trainer_id', user.id).eq('status', 'active');
    if (!links || links.length === 0) { setStudents([]); setLoading(false); return; }
    const ids = links.map((l) => l.student_id);
    const [{ data: profs }, { data: details }] = await Promise.all([
      supabase.from('profiles').select('id, full_name, email').in('id', ids),
      supabase.from('student_details').select('user_id, goal').in('user_id', ids),
    ]);
    const goalMap = new Map(details?.map((d) => [d.user_id, d.goal]) ?? []);
    const profMap = new Map(profs?.map((p) => [p.id, p]) ?? []);
    setStudents(links.map((l) => {
      const p = profMap.get(l.student_id);
      return { link_id: l.id, id: l.student_id, name: p?.full_name || p?.email || 'Student', email: p?.email ?? null, goal: goalMap.get(l.student_id) || null };
    }));
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const filtered = students.filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleAddStudent = async (email: string) => {
    if (!user) return;
    const { data: prof, error: pErr } = await supabase.from('profiles').select('id, email').eq('email', email).maybeSingle();
    if (pErr || !prof) { toast.error('No student found with that email. Ask them to sign up first.'); return; }
    const { error } = await supabase.from('trainer_students').insert({ trainer_id: user.id, student_id: prof.id });
    if (error) { toast.error(error.message); return; }
    toast.success('Student added!');
    setIsModalOpen(false);
    load();
  };

  const handleDelete = async () => {
    if (!studentToDelete) return;
    const { error } = await supabase.from('trainer_students').delete().eq('id', studentToDelete.link_id);
    if (error) { toast.error(error.message); return; }
    toast.success('Student removed');
    setStudentToDelete(null);
    load();
  };

  return (
    <div className="px-4 py-6 safe-area-top">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-full bg-card shadow-card flex items-center justify-center"><UserIcon className="w-5 h-5 text-muted-foreground" /></button>
          <h1 className="fitness-page-title">My Students</h1>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-button"><Plus className="w-6 h-6 text-primary-foreground" /></button>
      </motion.div>

      <div className="relative mb-6 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input type="text" placeholder="Search students..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="fitness-input pl-12" />
        </div>
        <button className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground shadow-sm"><ListFilter className="w-5 h-5" /></button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Active Students ({students.length})</span>
      </div>

      <div className="space-y-3">
        {loading ? <p className="text-sm text-muted-foreground text-center py-8">Loading...</p> :
         filtered.length === 0 ? <div className="fitness-card text-center py-12 text-muted-foreground">No students yet. Add your first one!</div> :
         filtered.map((student, index) => (
          <motion.div key={student.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="fitness-card flex flex-col gap-4 p-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-accent flex items-center justify-center">
                <span className="text-primary font-bold text-2xl">{student.name.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-foreground mb-0.5">{student.name}</h3>
                <p className="text-sm text-muted-foreground">{student.email}</p>
                {student.goal && <p className="text-xs text-primary mt-1">Goal: {student.goal}</p>}
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
              <button onClick={() => setStudentToDelete(student)} className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20 transition-colors"><Trash2 className="w-4 h-4" /></button>
              <div className="flex items-center gap-2">
                <button onClick={() => navigate('/trainer/messages')} className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-accent/50 text-accent-foreground font-bold text-sm shadow-sm active:scale-95 transition-all"><MessageSquare className="w-4 h-4" />CHAT</button>
                <button onClick={() => navigate(`/trainer/students/${student.id}/progress`)} className="w-10 h-10 rounded-full bg-accent/30 flex items-center justify-center text-foreground hover:bg-accent/50 transition-colors"><TrendingUp className="w-4 h-4" /></button>
                <button onClick={() => navigate(`/trainer/students/${student.id}/workouts`)} className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-button shadow-primary/20 active:scale-95 transition-all"><Dumbbell className="w-5 h-5" /></button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && <AddStudentModal onClose={() => setIsModalOpen(false)} onSave={handleAddStudent} />}
        {studentToDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/50 z-[60] flex items-center justify-center px-4" onClick={() => setStudentToDelete(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm bg-card rounded-3xl p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-4 mx-auto"><Trash2 className="w-8 h-8" /></div>
              <h2 className="text-xl font-bold text-foreground mb-2">Remove Student?</h2>
              <p className="text-sm text-muted-foreground mb-6">{studentToDelete.name} will be unlinked from your roster.</p>
              <div className="flex w-full gap-3">
                <button onClick={() => setStudentToDelete(null)} className="flex-1 py-3 rounded-2xl bg-muted text-muted-foreground font-semibold">Cancel</button>
                <button onClick={handleDelete} className="flex-1 py-3 rounded-2xl bg-destructive text-white font-semibold">Remove</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AddStudentModal({ onClose, onSave }: { onClose: () => void; onSave: (email: string) => void }) {
  const [email, setEmail] = useState('');
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/50 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-card rounded-t-3xl sm:rounded-3xl">
        <div className="flex items-center justify-between p-6">
          <h2 className="text-xl font-bold text-foreground">Add Student</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 pt-0 space-y-5">
          <p className="text-sm text-muted-foreground">Enter the email of an existing student account to link them to your roster.</p>
          <div>
            <label className="fitness-label">Student Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input type="email" placeholder="student@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="fitness-input pl-12" />
            </div>
          </div>
          <button onClick={() => onSave(email)} disabled={!email} className="w-full fitness-button-primary disabled:opacity-50">Link Student</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
