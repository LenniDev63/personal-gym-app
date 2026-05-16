import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Calendar, Pencil, Check, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AvatarUpload from '@/components/AvatarUpload';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Details {
  date_of_birth: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  goal: string | null;
  level: string | null;
}

const computeAge = (dob: string | null) => {
  if (!dob) return null;
  const b = new Date(dob);
  const t = new Date();
  let age = t.getFullYear() - b.getFullYear();
  const m = t.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < b.getDate())) age--;
  return age;
};

export default function StudentProfilePage() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [details, setDetails] = useState<Details | null>(null);
  const [editing, setEditing] = useState(false);
  const [latestProgress, setLatestProgress] = useState<{ weight: number | null; height: number | null } | null>(null);
  const [form, setForm] = useState<Details>({ date_of_birth: null, height_cm: null, weight_kg: null, goal: null, level: null });

  const load = async () => {
    if (!user) return;
    const { data: d } = await supabase.from('student_details').select('date_of_birth, height_cm, weight_kg, goal, level').eq('user_id', user.id).maybeSingle();
    const det = (d as Details) || { date_of_birth: null, height_cm: null, weight_kg: null, goal: null, level: null };
    setDetails(det);
    setForm(det);
    const { data: p } = await supabase.from('progress_entries').select('weight, height').eq('student_id', user.id).order('recorded_at', { ascending: false }).limit(1).maybeSingle();
    if (p) setLatestProgress({ weight: p.weight as any, height: p.height as any });
  };

  useEffect(() => { load(); }, [user]);

  const handleLogout = async () => { await signOut(); navigate('/'); };

  const handleSave = async () => {
    if (!user) return;
    const payload = {
      user_id: user.id,
      date_of_birth: form.date_of_birth || null,
      height_cm: form.height_cm != null && (form.height_cm as any) !== '' ? Number(form.height_cm) : null,
      weight_kg: form.weight_kg != null && (form.weight_kg as any) !== '' ? Number(form.weight_kg) : null,
      goal: form.goal || null,
      level: form.level || null,
    };
    const { error } = await supabase.from('student_details').upsert(payload, { onConflict: 'user_id' });
    if (error) { toast.error(error.message); return; }
    toast.success('Profile updated');
    setEditing(false);
    load();
  };

  const age = computeAge(details?.date_of_birth ?? null);
  const displayHeight = details?.height_cm ?? latestProgress?.height ?? null;
  const displayWeight = details?.weight_kg ?? latestProgress?.weight ?? null;

  return (
    <div className="px-4 py-6 safe-area-top pb-32">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="fitness-page-title">My Profile</h1>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="fitness-card flex flex-col items-center py-8 mb-6">
        <AvatarUpload />
        <h2 className="text-xl font-bold text-foreground mb-1">{profile?.full_name || 'Student'}</h2>
        <p className="text-muted-foreground text-sm mb-4">{profile?.email}</p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Calendar className="w-4 h-4" /><span>Member</span></div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="fitness-card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Personal Information</h3>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-sm text-primary font-medium">
              <Pencil className="w-4 h-4" /> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => { setEditing(false); setForm(details!); }} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground"><X className="w-4 h-4" /></button>
              <button onClick={handleSave} className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground"><Check className="w-4 h-4" /></button>
            </div>
          )}
        </div>

        {!editing ? (
          <div className="space-y-4">
            <Row label="Date of Birth" value={details?.date_of_birth ? new Date(details.date_of_birth).toLocaleDateString() : '—'} />
            <Row label="Age" value={age != null ? `${age} years` : '—'} />
            <Row label="Height" value={displayHeight ? `${displayHeight} cm` : '—'} />
            <Row label="Current Weight" value={displayWeight ? `${displayWeight} kg` : '—'} />
            <Row label="Goal" value={details?.goal || '—'} />
            <Row label="Level" value={details?.level || '—'} />
          </div>
        ) : (
          <div className="space-y-4">
            <Field label="Date of Birth">
              <input type="date" value={form.date_of_birth || ''} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} className="fitness-input" />
            </Field>
            <Field label="Height (cm)">
              <input type="number" step="0.1" value={form.height_cm ?? ''} onChange={(e) => setForm({ ...form, height_cm: e.target.value as any })} className="fitness-input" />
            </Field>
            <Field label="Current Weight (kg)">
              <input type="number" step="0.1" value={form.weight_kg ?? ''} onChange={(e) => setForm({ ...form, weight_kg: e.target.value as any })} className="fitness-input" />
            </Field>
            <Field label="Goal">
              <input type="text" value={form.goal ?? ''} onChange={(e) => setForm({ ...form, goal: e.target.value })} className="fitness-input" placeholder="e.g. Build muscle" />
            </Field>
            <Field label="Level">
              <select value={form.level ?? ''} onChange={(e) => setForm({ ...form, level: e.target.value })} className="fitness-input">
                <option value="">Select level</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </Field>
          </div>
        )}
      </motion.div>

      <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} onClick={handleLogout} className="w-full fitness-card flex items-center justify-center gap-3 py-4 text-destructive hover:bg-destructive/5 transition-colors">
        <LogOut className="w-5 h-5" /><span className="font-medium">Sign Out</span>
      </motion.button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span className="text-muted-foreground">{label}</span><span className="text-foreground font-medium">{value}</span></div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><label className="text-sm text-muted-foreground">{label}</label>{children}</div>;
}
