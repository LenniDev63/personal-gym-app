import React from 'react';
import { motion } from 'framer-motion';
import { Camera, ChevronRight, LogOut, Calendar, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AvatarUpload from '@/components/AvatarUpload';

export default function StudentProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="px-4 py-6 safe-area-top">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="fitness-page-title">Meu Perfil</h1>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="fitness-card flex flex-col items-center py-8 mb-6"
      >
        <AvatarUpload />

        <h2 className="text-xl font-bold text-foreground mb-1">
          {user?.name || 'João Silva'}
        </h2>
        <p className="text-muted-foreground text-sm mb-4">{user?.email || 'joao@email.com'}</p>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Aluno desde Janeiro 2024</span>
        </div>
      </motion.div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="fitness-card mb-6"
      >
        <h3 className="font-semibold text-foreground mb-4">Informações Pessoais</h3>

        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Idade</span>
            <span className="text-foreground font-medium">28 anos</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Altura</span>
            <span className="text-foreground font-medium">1.78m</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Peso Atual</span>
            <span className="text-foreground font-medium">78.5 kg</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Objetivo</span>
            <span className="text-foreground font-medium">Hipertrofia</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nível</span>
            <span className="text-foreground font-medium">Intermediário</span>
          </div>
        </div>

        <button className="w-full fitness-button-secondary mt-6 text-sm">
          Editar Informações
        </button>
      </motion.div>

      {/* Coach Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="fitness-card flex items-center gap-4 mb-6"
      >
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-primary font-bold text-xl">A</span>
        </div>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Seu Personal</p>
          <p className="font-semibold text-foreground">Coach Alex</p>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </motion.div>

      {/* Logout */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        onClick={handleLogout}
        className="w-full fitness-card flex items-center justify-center gap-3 py-4 text-destructive hover:bg-destructive/5 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        <span className="font-medium">Sair da Conta</span>
      </motion.button>
    </div>
  );
}
