import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, LogOut, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AvatarUpload from '@/components/AvatarUpload';

export default function StudentProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="px-4 py-6 safe-area-top">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8"><h1 className="fitness-page-title">My Profile</h1></motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="fitness-card flex flex-col items-center py-8 mb-6">
        <AvatarUpload />
        <h2 className="text-xl font-bold text-foreground mb-1">{user?.name || 'John Smith'}</h2>
        <p className="text-muted-foreground text-sm mb-4">{user?.email || 'john@email.com'}</p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Calendar className="w-4 h-4" /><span>Student since January 2024</span></div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="fitness-card mb-6">
        <h3 className="font-semibold text-foreground mb-4">Personal Information</h3>
        <div className="space-y-4">
          <div className="flex justify-between"><span className="text-muted-foreground">Age</span><span className="text-foreground font-medium">28 years</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Height</span><span className="text-foreground font-medium">1.78m</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Current Weight</span><span className="text-foreground font-medium">78.5 kg</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Goal</span><span className="text-foreground font-medium">Hypertrophy</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Level</span><span className="text-foreground font-medium">Intermediate</span></div>
        </div>
        <button className="w-full fitness-button-secondary mt-6 text-sm">Edit Information</button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="fitness-card flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center"><span className="text-primary font-bold text-xl">A</span></div>
        <div className="flex-1"><p className="text-xs text-muted-foreground uppercase tracking-wide">Your Trainer</p><p className="font-semibold text-foreground">Coach Alex</p></div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </motion.div>

      <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} onClick={handleLogout} className="w-full fitness-card flex items-center justify-center gap-3 py-4 text-destructive hover:bg-destructive/5 transition-colors">
        <LogOut className="w-5 h-5" /><span className="font-medium">Sign Out</span>
      </motion.button>
    </div>
  );
}
