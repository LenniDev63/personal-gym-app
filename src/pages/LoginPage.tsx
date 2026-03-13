import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, User, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import logo from '@/assets/logo.png';

type AuthMode = 'select-role' | 'login' | 'register';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<AuthMode>('select-role');
  const [role, setRole] = useState<UserRole>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (mode === 'login') {
        await login(formData.email, formData.password, role);
      } else {
        await register(formData.name, formData.email, formData.password, role);
      }
      navigate(role === 'trainer' ? '/trainer' : '/student');
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setMode('login');
  };

  const handleBack = () => {
    if (mode === 'login' || mode === 'register') {
      setMode('select-role');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 py-8 safe-area-top safe-area-bottom">
      {/* Header */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={handleBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit mb-8"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Voltar</span>
      </motion.button>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex justify-center mb-8"
        >
          <img 
            src={logo} 
            alt="Logo" 
            className="h-28 w-auto object-contain"
          />
        </motion.div>

        <AnimatePresence mode="wait">
          {mode === 'select-role' && (
            <motion.div
              key="select-role"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-foreground mb-2">Como você quer usar?</h1>
                <p className="text-muted-foreground">Selecione seu tipo de conta</p>
              </div>

              <button
                onClick={() => handleRoleSelect('trainer')}
                className="w-full fitness-card p-6 flex items-center gap-4 hover:shadow-card-hover transition-all group"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <User className="w-7 h-7 text-primary" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-semibold text-foreground text-lg">Personal Trainer</h3>
                  <p className="text-muted-foreground text-sm">Gerencie alunos e treinos</p>
                </div>
              </button>

              <button
                onClick={() => handleRoleSelect('student')}
                className="w-full fitness-card p-6 flex items-center gap-4 hover:shadow-card-hover transition-all group"
              >
                <div className="w-14 h-14 bg-accent rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <GraduationCap className="w-7 h-7 text-primary" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-semibold text-foreground text-lg">Aluno</h3>
                  <p className="text-muted-foreground text-sm">Acesse seus treinos e progresso</p>
                </div>
              </button>
            </motion.div>
          )}

          {(mode === 'login' || mode === 'register') && (
            <motion.div
              key="auth-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <div className="fitness-badge-primary mb-3 mx-auto w-fit">
                  {role === 'trainer' ? 'Personal Trainer' : 'Aluno'}
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  {mode === 'login' ? 'Bem-vindo de volta!' : 'Criar sua conta'}
                </h1>
                <p className="text-muted-foreground">
                  {mode === 'login' ? 'Entre com suas credenciais' : 'Preencha seus dados abaixo'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <div>
                    <label className="fitness-label">Nome completo</label>
                    <input
                      type="text"
                      placeholder="Seu nome"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="fitness-input"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="fitness-label">E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="fitness-input pl-12"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="fitness-label">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="fitness-input pl-12 pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {mode === 'login' && (
                  <button type="button" className="text-primary text-sm font-medium hover:underline">
                    Esqueceu sua senha?
                  </button>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full fitness-button-primary mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Aguarde...
                    </span>
                  ) : (
                    mode === 'login' ? 'Entrar' : 'Criar conta'
                  )}
                </button>
              </form>

              {/* Social Login */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">ou continue com</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button className="fitness-button-secondary flex items-center justify-center py-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </button>
                <button className="fitness-button-secondary flex items-center justify-center py-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 17 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/>
                  </svg>
                </button>
                <button className="fitness-button-secondary flex items-center justify-center py-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>
              </div>

              <p className="text-center text-muted-foreground mt-6">
                {mode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}{' '}
                <button
                  type="button"
                  onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                  className="text-primary font-semibold hover:underline"
                >
                  {mode === 'login' ? 'Criar conta' : 'Entrar'}
                </button>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
