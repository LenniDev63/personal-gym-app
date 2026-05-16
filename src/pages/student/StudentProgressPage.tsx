import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Calendar, TrendingDown, TrendingUp, Plus, ChevronRight, X, Scale, Ruler, Activity, Check } from 'lucide-react';
import { LineChart, Line, XAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const timeFilters = ['1M', '3M', '6M', 'All'];

interface Entry {
  id: string;
  recorded_at: string;
  weight: number | null; body_fat: number | null; height: number | null;
  chest: number | null; waist: number | null; hips: number | null;
  arm_l: number | null; arm_r: number | null; thigh_l: number | null; thigh_r: number | null;
  note: string | null;
}

export default function StudentProgressPage() {
  const navigate = useNavigate();
  const { studentId: paramId } = useParams();
  const { user, role } = useAuth();
  const targetId = paramId || user?.id;
  const isTrainerView = !!paramId && role === 'trainer';

  const [activeFilter, setActiveFilter] = useState('3M');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!targetId) return;
    setLoading(true);
    const { data } = await supabase.from('progress_entries')
      .select('*').eq('student_id', targetId).order('recorded_at', { ascending: false });
    setEntries((data ?? []) as Entry[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, [targetId]);

  const monthsBack = activeFilter === '1M' ? 1 : activeFilter === '3M' ? 3 : activeFilter === '6M' ? 6 : 9999;
  const cutoff = new Date(); cutoff.setMonth(cutoff.getMonth() - monthsBack);
  const filtered = entries.filter(e => activeFilter === 'All' || new Date(e.recorded_at) >= cutoff);

  const ascending = [...filtered].reverse();
  const fmtMonth = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const weightData = ascending.filter(e => e.weight != null).map(e => ({ month: fmtMonth(e.recorded_at), value: Number(e.weight) }));
  const bodyFatData = ascending.filter(e => e.body_fat != null).map(e => ({ month: fmtMonth(e.recorded_at), value: Number(e.body_fat) }));

  const latest = entries[0];
  const previousWeight = entries.find((e, i) => i > 0 && e.weight != null)?.weight ?? null;
  const latestWeight = latest?.weight ?? null;
  const weightDelta = latestWeight != null && previousWeight != null ? Number(latestWeight) - Number(previousWeight) : null;
  const previousBf = entries.find((e, i) => i > 0 && e.body_fat != null)?.body_fat ?? null;
  const latestBf = latest?.body_fat ?? null;
  const bfDelta = latestBf != null && previousBf != null ? Number(latestBf) - Number(previousBf) : null;

  const bmi = latest?.weight && latest?.height ? (Number(latest.weight) / Math.pow(Number(latest.height) / 100, 2)).toFixed(1) : null;
  const whr = latest?.waist && latest?.hips ? (Number(latest.waist) / Number(latest.hips)).toFixed(2) : null;

  const handleSave = async (data: any) => {
    if (!targetId) return;
    const payload: any = { student_id: targetId, recorded_at: new Date().toISOString() };
    ['weight', 'body_fat', 'height', 'chest', 'waist', 'hips', 'arm_l', 'arm_r', 'thigh_l', 'thigh_r'].forEach(k => {
      if (data[k] !== '' && data[k] != null) payload[k] = Number(data[k]);
    });
    const { error } = await supabase.from('progress_entries').insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success('Progress saved');
    setIsModalOpen(false); load();
  };

  return (
    <div className="px-4 py-6 safe-area-top">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-card shadow-card flex items-center justify-center text-muted-foreground"><ChevronLeft className="w-6 h-6" /></button>
          <h1 className="fitness-page-title">{isTrainerView ? 'Student' : 'My'} Progress</h1>
        </div>
        <button className="w-10 h-10 rounded-full bg-card shadow-card flex items-center justify-center"><Calendar className="w-5 h-5 text-muted-foreground" /></button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex bg-muted rounded-xl p-1 mb-6">
        {timeFilters.map((filter) => (
          <button key={filter} onClick={() => setActiveFilter(filter)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${activeFilter === filter ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>{filter}</button>
        ))}
      </motion.div>

      {loading ? <p className="text-center py-12 text-sm text-muted-foreground">Loading...</p> :
       entries.length === 0 ? (
        <div className="fitness-card text-center py-16 mb-24">
          <p className="text-muted-foreground mb-2">No progress entries yet.</p>
          <p className="text-xs text-muted-foreground">Tap the + button below to record the first measurement.</p>
        </div>
       ) : (
        <>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="fitness-card mb-4">
            <div className="flex items-center justify-between mb-4">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">WEIGHT PROGRESS</p><p className="text-3xl font-bold text-foreground">{latestWeight ?? '—'} {latestWeight != null && <span className="text-lg">kg</span>}</p></div>
              {weightDelta != null && (
                <span className={`fitness-badge-${weightDelta <= 0 ? 'success' : 'primary'} flex items-center gap-1`}>
                  {weightDelta <= 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}{weightDelta > 0 ? '+' : ''}{weightDelta.toFixed(1)} kg
                </span>
              )}
            </div>
            {weightData.length > 1 && (
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%"><LineChart data={weightData}><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} /><Tooltip contentStyle={{ background: 'hsl(var(--card))', border: 'none', borderRadius: '8px' }} /><Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer>
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="fitness-card mb-4">
            <div className="flex items-center justify-between mb-4">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">BODY FAT PERCENTAGE</p><p className="text-3xl font-bold text-foreground">{latestBf ?? '—'} {latestBf != null && <span className="text-lg">%</span>}</p></div>
              {bfDelta != null && (
                <span className={`fitness-badge-${bfDelta <= 0 ? 'success' : 'primary'} flex items-center gap-1`}>
                  {bfDelta <= 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}{bfDelta > 0 ? '+' : ''}{bfDelta.toFixed(1)}%
                </span>
              )}
            </div>
            {bodyFatData.length > 1 && (
              <div className="h-32"><ResponsiveContainer width="100%" height="100%"><LineChart data={bodyFatData}><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} /><Tooltip contentStyle={{ background: 'hsl(var(--card))', border: 'none', borderRadius: '8px' }} /><Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="grid grid-cols-2 gap-4 mb-6">
            <div className="fitness-card"><p className="text-xs text-muted-foreground uppercase tracking-wide">BMI</p><p className="text-2xl font-bold text-foreground mt-1">{bmi ?? '—'}</p></div>
            <div className="fitness-card"><p className="text-xs text-muted-foreground uppercase tracking-wide">WHR</p><p className="text-2xl font-bold text-foreground mt-1">{whr ?? '—'}</p></div>
          </motion.div>

          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-24">
            <div className="flex items-center justify-between mb-4"><h2 className="fitness-section-title">Measurement History</h2></div>
            <div className="space-y-3">
              {filtered.map((entry, index) => (
                <motion.div key={entry.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + index * 0.05 }} className="fitness-card flex items-center justify-between">
                  <div><p className="font-semibold text-foreground">{new Date(entry.recorded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>{entry.note && <p className="text-xs text-muted-foreground">{entry.note}</p>}</div>
                  <div className="text-right">{entry.weight != null && <p className="font-semibold text-foreground">{entry.weight} kg</p>}{entry.body_fat != null && <p className="text-xs text-muted-foreground">{entry.body_fat}% BF</p>}</div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </motion.div>
              ))}
            </div>
          </motion.section>
        </>
       )}

      <AnimatePresence>{isModalOpen && <UpdateProgressModal onClose={() => setIsModalOpen(false)} onSave={handleSave} />}</AnimatePresence>
      <button onClick={() => setIsModalOpen(true)} className="fixed bottom-24 right-4 w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-button z-40 active:scale-95 transition-transform"><Plus className="w-6 h-6 text-primary-foreground" /></button>
    </div>
  );
}

function UpdateProgressModal({ onClose, onSave }: any) {
  const [formData, setFormData] = useState<any>({ weight: '', body_fat: '', height: '', chest: '', waist: '', hips: '', arm_l: '', arm_r: '', thigh_l: '', thigh_r: '' });
  const set = (k: string, v: string) => setFormData({ ...formData, [k]: v });
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/50 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-card rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-center pt-3 sm:hidden"><div className="w-12 h-1.5 bg-muted rounded-full" /></div>
        <div className="flex items-center justify-between p-6 pb-4">
          <div><h2 className="text-xl font-bold text-foreground">Update Measurements</h2><p className="text-sm text-muted-foreground">Record today's physical progress.</p></div>
          <button onClick={onClose} className="p-2 rounded-full bg-muted text-muted-foreground"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 pt-0 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><label className="fitness-label flex items-center gap-2"><Scale className="w-4 h-4" /> Weight (kg)</label><input type="number" step="0.1" value={formData.weight} onChange={(e) => set('weight', e.target.value)} className="fitness-input" /></div>
            <div className="space-y-2"><label className="fitness-label flex items-center gap-2"><Activity className="w-4 h-4" /> Body Fat (%)</label><input type="number" step="0.1" value={formData.body_fat} onChange={(e) => set('body_fat', e.target.value)} className="fitness-input" /></div>
          </div>
          <div className="space-y-2"><label className="fitness-label flex items-center gap-2"><Ruler className="w-4 h-4" /> Height (cm)</label><input type="number" value={formData.height} onChange={(e) => set('height', e.target.value)} className="fitness-input" /></div>
          <div className="h-px bg-border" /><p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Circumferences (cm)</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2"><label className="fitness-label">Chest</label><input type="number" value={formData.chest} onChange={(e) => set('chest', e.target.value)} className="fitness-input" /></div>
            <div className="space-y-2"><label className="fitness-label">Waist</label><input type="number" value={formData.waist} onChange={(e) => set('waist', e.target.value)} className="fitness-input" /></div>
            <div className="space-y-2"><label className="fitness-label">Hips</label><input type="number" value={formData.hips} onChange={(e) => set('hips', e.target.value)} className="fitness-input" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><label className="fitness-label">Arm (L/R)</label><div className="flex gap-2"><input type="number" placeholder="L" value={formData.arm_l} onChange={(e) => set('arm_l', e.target.value)} className="fitness-input px-2" /><input type="number" placeholder="R" value={formData.arm_r} onChange={(e) => set('arm_r', e.target.value)} className="fitness-input px-2" /></div></div>
            <div className="space-y-2"><label className="fitness-label">Thigh (L/R)</label><div className="flex gap-2"><input type="number" placeholder="L" value={formData.thigh_l} onChange={(e) => set('thigh_l', e.target.value)} className="fitness-input px-2" /><input type="number" placeholder="R" value={formData.thigh_r} onChange={(e) => set('thigh_r', e.target.value)} className="fitness-input px-2" /></div></div>
          </div>
          <button onClick={() => onSave(formData)} className="w-full fitness-button-primary flex items-center justify-center gap-2 py-4"><Check className="w-5 h-5" /><span>Save Progress</span></button>
          <div className="h-6" />
        </div>
      </motion.div>
    </motion.div>
  );
}
