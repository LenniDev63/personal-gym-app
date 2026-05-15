import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Dumbbell, User as UserIcon, TrendingUp, MessageSquare, ListFilter, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StudentRow {
  id: string;
  name: string;
  email: string | null;
  goal: string | null;
  approval_status: 'pending' | 'approved' | 'rejected';
}

type Tab = 'pending' | 'active';

export default function StudentsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [tab, setTab] = useState<Tab>('pending');
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data: details } = await supabase
      .from('student_details')
      .select('user_id, goal, approval_status')
      .in('approval_status', ['pending', 'approved']);
    const ids = (details ?? []).map((d) => d.user_id);
    if (ids.length === 0) { setStudents([]); setLoading(false); return; }
    const { data: profs } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', ids);
    const profMap = new Map(profs?.map((p) => [p.id, p]) ?? []);
    setStudents((details ?? []).map((d) => {
      const p = profMap.get(d.user_id);
      return {
        id: d.user_id,
        name: p?.full_name || p?.email || 'Student',
        email: p?.email ?? null,
        goal: d.goal || null,
        approval_status: d.approval_status as StudentRow['approval_status'],
      };
    }));
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const setStatus = async (studentId: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase.from('student_details').update({ approval_status: status }).eq('user_id', studentId);
    if (error) { toast.error(error.message); return; }
    toast.success(status === 'approved' ? 'Student approved' : 'Student rejected');
    load();
  };

  const pending = students.filter((s) => s.approval_status === 'pending');
  const active = students.filter((s) => s.approval_status === 'approved');
  const list = tab === 'pending' ? pending : active;
  const filtered = list.filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="px-4 py-6 safe-area-top">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-full bg-card shadow-card flex items-center justify-center"><UserIcon className="w-5 h-5 text-muted-foreground" /></button>
          <h1 className="fitness-page-title">Students</h1>
        </div>
      </motion.div>

      <div className="flex gap-2 mb-6 bg-muted p-1 rounded-2xl">
        <button onClick={() => setTab('pending')} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === 'pending' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>
          Pending {pending.length > 0 && <span className="ml-1 text-xs">({pending.length})</span>}
        </button>
        <button onClick={() => setTab('active')} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === 'active' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>
          Active {active.length > 0 && <span className="ml-1 text-xs">({active.length})</span>}
        </button>
      </div>

      <div className="relative mb-6 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input type="text" placeholder="Search students..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="fitness-input pl-12" />
        </div>
        <button className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground shadow-sm"><ListFilter className="w-5 h-5" /></button>
      </div>

      <div className="space-y-3">
        {loading ? <p className="text-sm text-muted-foreground text-center py-8">Loading...</p> :
         filtered.length === 0 ? (
          <div className="fitness-card text-center py-12 text-muted-foreground">
            {tab === 'pending' ? 'No pending students.' : 'No active students yet.'}
          </div>
         ) :
         filtered.map((student, index) => (
          <motion.div key={student.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="fitness-card flex flex-col gap-4 p-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-accent flex items-center justify-center">
                <span className="text-primary font-bold text-2xl">{student.name.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-foreground mb-0.5">{student.name}</h3>
                <p className="text-sm text-muted-foreground truncate">{student.email}</p>
                {student.goal && <p className="text-xs text-primary mt-1">Goal: {student.goal}</p>}
              </div>
            </div>

            {tab === 'pending' ? (
              <div className="flex gap-3 mt-2 pt-2 border-t border-border/50">
                <button onClick={() => setStatus(student.id, 'rejected')} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-destructive/10 text-destructive font-bold text-sm active:scale-95 transition-all">
                  <X className="w-4 h-4" />Reject
                </button>
                <button onClick={() => setStatus(student.id, 'approved')} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-button shadow-primary/20 active:scale-95 transition-all">
                  <Check className="w-4 h-4" />Approve
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-border/50">
                <button onClick={() => navigate('/trainer/messages')} className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-accent/50 text-accent-foreground font-bold text-sm shadow-sm active:scale-95 transition-all"><MessageSquare className="w-4 h-4" />CHAT</button>
                <button onClick={() => navigate(`/trainer/students/${student.id}/progress`)} className="w-10 h-10 rounded-full bg-accent/30 flex items-center justify-center text-foreground hover:bg-accent/50 transition-colors"><TrendingUp className="w-4 h-4" /></button>
                <button onClick={() => navigate(`/trainer/students/${student.id}/workouts`)} className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-button shadow-primary/20 active:scale-95 transition-all"><Dumbbell className="w-5 h-5" /></button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
