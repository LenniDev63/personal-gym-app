import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';

type AuthMode = 'login' | 'register';

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn, signUp, user, role, loading } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    if (!loading && user && role) {
      navigate(role === 'trainer' ? '/trainer' : '/student', { replace: true });
    }
  }, [user, role, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await signIn(formData.email, formData.password);
        if (error) { toast.error(error); return; }
      } else {
        const { error } = await signUp(formData.name, formData.email, formData.password, 'student');
        if (error) { toast.error(error); return; }
        toast.success('Account created! Check your email to confirm, then sign in.');
        setMode('login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 py-8 safe-area-top safe-area-bottom">
      <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit mb-8">
        <ArrowLeft className="w-5 h-5" /><span>Back</span>
      </motion.button>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex justify-center mb-8">
          <img src={logo} alt="Logo" className="h-28 w-auto object-contain" />
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div key="auth-form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {mode === 'login' ? 'Welcome back!' : 'Create your athlete account'}
              </h1>
              <p className="text-muted-foreground">
                {mode === 'login' ? 'Sign in to continue' : 'Sign up as an athlete to get started'}
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="fitness-label">Full Name</label>
                  <input type="text" placeholder="Your name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="fitness-input" required />
                </div>
              )}
              <div>
                <label className="fitness-label">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input type="email" placeholder="your@email.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="fitness-input pl-12" required />
                </div>
              </div>
              <div>
                <label className="fitness-label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="fitness-input pl-12 pr-12" required minLength={6} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={isLoading} className="w-full fitness-button-primary mt-6 disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2"><span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />Please wait...</span>
                ) : mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>
            <p className="text-center text-muted-foreground mt-6">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-primary font-semibold hover:underline">
                {mode === 'login' ? 'Sign up as athlete' : 'Sign In'}
              </button>
            </p>
            {mode === 'register' && (
              <p className="text-center text-xs text-muted-foreground mt-2">
                After signing up, a personal trainer will review and approve your account.
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
