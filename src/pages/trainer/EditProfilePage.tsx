import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', bio: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) setFormData({ name: profile.full_name || '', email: profile.email || '', bio: profile.bio || '' });
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ full_name: formData.name, bio: formData.bio }).eq('id', user.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    await refreshProfile();
    toast.success('Profile updated!');
    navigate('/trainer/profile');
  };

  return (
    <div className="px-4 py-6 safe-area-top min-h-screen bg-background">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/trainer/profile')} className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="w-6 h-6" /></button>
        <h1 className="text-xl font-bold text-foreground">Edit Profile</h1>
      </motion.div>
      <div className="h-px bg-border mb-6" />
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="fitness-card space-y-6">
        <div><label className="fitness-label">Full Name</label><input type="text" placeholder="Your name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="fitness-input" /></div>
        <div><label className="fitness-label">Email</label><input type="email" value={formData.email} disabled className="fitness-input bg-muted cursor-not-allowed" /><p className="text-xs text-primary mt-1.5">Email cannot be changed.</p></div>
        <div><label className="fitness-label">Goal / Bio</label><textarea placeholder="What's your main goal?" value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} rows={4} className="fitness-input resize-none" /></div>
        <button onClick={handleSave} disabled={saving} className="w-full fitness-button-primary disabled:opacity-50">{saving ? 'Saving...' : 'Save Changes'}</button>
      </motion.div>
    </div>
  );
}
