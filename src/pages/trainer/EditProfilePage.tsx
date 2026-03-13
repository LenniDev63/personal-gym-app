import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.name || 'João Silva',
    email: user?.email || 'joao@email.com',
    bio: '',
  });

  const handleSave = () => {
    // Save logic here
    navigate('/trainer/profile');
  };

  return (
    <div className="px-4 py-6 safe-area-top min-h-screen bg-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-6"
      >
        <button
          onClick={() => navigate('/trainer/profile')}
          className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Editar Perfil</h1>
      </motion.div>

      <div className="h-px bg-border mb-6" />

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="fitness-card space-y-6"
      >
        <div>
          <label className="fitness-label">Nome Completo</label>
          <input
            type="text"
            placeholder="Seu nome"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="fitness-input"
          />
        </div>

        <div>
          <label className="fitness-label">Email</label>
          <input
            type="email"
            value={formData.email}
            disabled
            className="fitness-input bg-muted cursor-not-allowed"
          />
          <p className="text-xs text-primary mt-1.5">O email não pode ser alterado.</p>
        </div>

        <div>
          <label className="fitness-label">Objetivo / Bio</label>
          <textarea
            placeholder="Qual seu objetivo principal? (Ex: Hipertrofia, Emagrecimento...)"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={4}
            className="fitness-input resize-none"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full fitness-button-primary"
        >
          Salvar Alterações
        </button>
      </motion.div>
    </div>
  );
}
