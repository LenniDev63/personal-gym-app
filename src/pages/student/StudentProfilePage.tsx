import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, LogOut, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AvatarUpload from '@/components/AvatarUpload';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Trainer { id: string; full_name: string | null; email: string | null }
interface Details { age: number | null; height_cm: number | null; weight_kg: number | null; goal: string | null; level: string | null }

export default function StudentProfilePage() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [details, setDetails] = useState<Details | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: link } = await supabase.from('trainer_students').select('trainer_id, created_at').eq('student_id', user.id).eq('status', 'active').maybeSingle();
      if (link) {
        const { data: t } = await supabase.from('profiles').select('id, full_name, email').eq('id', link.trainer_id).maybeSingle();
        setTrainer(t as Trainer);
      }
      const { data: d } = await supabase.from('student_details').select('*').eq('user_id', user.id).maybeSingle();
      setDetails(d as Details);
    })();
  }, [user]);

  const handleLogout = async () => { await signOut(); navigate('/'); };

  return (
    <div className="px-4 py-6 safe-area-top">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8"><h1 className="fitness-page-title">My Profile</h1></motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="fitness-card flex flex-col items-center py-8 mb-6">
        <AvatarUpload />
        <h2 className="text-xl font-bold text-foreground mb-1">{profile?.full_name || 'Student'}</h2>
        <p className="text-muted-foreground text-sm mb-4">{profile?.email}</p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Calendar className="w-4 h-4" /><span>Member</span></div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="fitness-card mb-6">
        <h3 className="font-semibold text-foreground mb-4">Personal Information</h3>
        <div className="space-y-4">
          <Row label="Age" value={details?.age ? `${details.age} years` : '—'} />
          <Row label="Height" value={details?.height_cm ? `${details.height_cm} cm` : '—'} />
          <Row label="Current Weight" value={details?.weight_kg ? `${details.weight_kg} kg` : '—'} />
          <Row label="Goal" value={details?.goal || '—'} />
          <Row label="Level" value={details?.level || '—'} />
        </div>
      </motion.div>

      {trainer && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="fitness-card flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center"><span className="text-primary font-bold text-xl">{(trainer.full_name || 'T').charAt(0)}</span></div>
          <div className="flex-1"><p className="text-xs text-muted-foreground uppercase tracking-wide">Your Trainer</p><p className="font-semibold text-foreground">{trainer.full_name || trainer.email}</p></div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </motion.div>
      )}

      <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} onClick={handleLogout} className="w-full fitness-card flex items-center justify-center gap-3 py-4 text-destructive hover:bg-destructive/5 transition-colors">
        <LogOut className="w-5 h-5" /><span className="font-medium">Sign Out</span>
      </motion.button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span className="text-muted-foreground">{label}</span><span className="text-foreground font-medium">{value}</span></div>;
}
