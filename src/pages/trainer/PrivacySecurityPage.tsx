import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PrivacySecurityPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });

  return (
    <div className="px-4 py-6 safe-area-top min-h-screen bg-background pb-24">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/trainer/profile')} className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="w-6 h-6" /></button>
        <h1 className="text-xl font-bold text-foreground">Privacy & Security</h1>
      </motion.div>
      <div className="h-px bg-border mb-6" />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="fitness-card mb-4">
        <h2 className="text-lg font-bold text-foreground mb-2">Change Password</h2>
        <p className="text-sm text-muted-foreground mb-6">Choose a strong password to keep your account secure.</p>
        <div className="space-y-4">
          <div>
            <label className="fitness-label">New Password</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} placeholder="••••••" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} className="fitness-input pr-12" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
            </div>
          </div>
          <div>
            <label className="fitness-label">Confirm New Password</label>
            <div className="relative">
              <input type={showConfirmPassword ? 'text' : 'password'} placeholder="••••••" value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} className="fitness-input pr-12" />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">{showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
            </div>
          </div>
          <button onClick={() => setPasswords({ newPassword: '', confirmPassword: '' })} className="w-full fitness-button-primary">Update Password</button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="fitness-card">
        <h2 className="text-lg font-bold text-foreground mb-2">Delete Account</h2>
        <p className="text-sm text-muted-foreground mb-6">Account deletion is permanent and cannot be undone. All your data will be erased.</p>
        <button onClick={() => setShowDeleteConfirm(true)} className="w-full fitness-button-danger-outline">Delete my account</button>
      </motion.div>

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/50 z-50 flex items-center justify-center px-4" onClick={() => setShowDeleteConfirm(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm bg-card rounded-3xl p-6 text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle className="w-8 h-8 text-destructive" /></div>
              <h2 className="text-xl font-bold text-foreground mb-2">Are you sure?</h2>
              <p className="text-muted-foreground mb-6">This action cannot be undone. All your data will be permanently deleted.</p>
              <div className="space-y-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="w-full fitness-button-primary">Cancel</button>
                <button className="w-full fitness-button-danger-outline">Yes, delete my account</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
