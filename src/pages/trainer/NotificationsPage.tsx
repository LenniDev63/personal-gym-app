import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell, MessageCircle, Dumbbell, Calendar, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const essentialSettings = [
  { id: 'new_student', label: 'Novo aluno cadastrado', description: 'Receba avisos quando novos alunos entrarem.', enabled: true },
  { id: 'workout_started', label: 'Aluno iniciou um treino', description: 'Saiba quando seus alunos começam a treinar.', enabled: true },
  { id: 'workout_finished', label: 'Treino concluído', description: 'Seja notificado ao final de cada treino.', enabled: true },
  { id: 'inactive_student', label: 'Aluno inativo', description: 'Alertas sobre alunos sem treinar há 7 dias.', enabled: true },
];

const importantSettings = [
  { id: 'metric_change', label: 'Aluno alterou peso/reps', description: 'Acompanhe ajustes de carga feitos pelos alunos.', enabled: true },
  { id: 'comment_doubt', label: 'Comentário ou dúvida', description: 'Feedback direto dos alunos nos treinos.', enabled: true },
  { id: 'upload_failed', label: 'Falha de envio', description: 'Problemas técnicos no salvamento de treinos.', enabled: true },
];

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [essentials, setEssentials] = React.useState(essentialSettings);
  const [importants, setImportants] = React.useState(importantSettings);

  const toggleEssential = (id: string) => {
    setEssentials(essentials.map(s =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
  };

  const toggleImportant = (id: string) => {
    setImportants(importants.map(s =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
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
        <h1 className="text-xl font-bold text-foreground">Notificações</h1>
      </motion.div>

      <div className="h-px bg-border mb-6" />

      {/* Sections */}
      <div className="space-y-8">
        {/* Essenciais */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-4 px-1">
            <span className="w-2 h-2 rounded-full bg-destructive" />
            <h2 className="text-lg font-bold text-foreground">Essenciais</h2>
          </div>

          <div className="bg-card rounded-[24px] overflow-hidden shadow-sm border border-border/50">
            {essentials.map((setting, index) => (
              <div key={setting.id} className="p-5 flex items-center gap-4 relative">
                {index !== 0 && <div className="absolute top-0 left-5 right-5 h-px bg-border/40" />}
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground leading-tight mb-1">{setting.label}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{setting.description}</p>
                </div>
                <button
                  onClick={() => toggleEssential(setting.id)}
                  className={`flex-shrink-0 w-12 h-7 rounded-full transition-all duration-300 relative ${setting.enabled ? 'bg-primary shadow-[0_0_12px_rgba(var(--primary),0.3)]' : 'bg-muted'
                    }`}
                >
                  <span
                    className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${setting.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Importantes */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4 px-1">
            <span className="w-2 h-2 rounded-full bg-warning" />
            <h2 className="text-lg font-bold text-foreground">Importantes</h2>
          </div>

          <div className="bg-card rounded-[24px] overflow-hidden shadow-sm border border-border/50">
            {importants.map((setting, index) => (
              <div key={setting.id} className="p-5 flex items-center gap-4 relative">
                {index !== 0 && <div className="absolute top-0 left-5 right-5 h-px bg-border/40" />}
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground leading-tight mb-1">{setting.label}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{setting.description}</p>
                </div>
                <button
                  onClick={() => toggleImportant(setting.id)}
                  className={`flex-shrink-0 w-12 h-7 rounded-full transition-all duration-300 relative ${setting.enabled ? 'bg-primary shadow-[0_0_12px_rgba(var(--primary),0.3)]' : 'bg-muted'
                    }`}
                >
                  <span
                    className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${setting.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
