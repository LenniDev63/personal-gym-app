import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Smartphone, Dumbbell, Users, CreditCard, ChevronRight, PlayCircle, ExternalLink, AlertTriangle, MessageCircle, FileText, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const categories = [
  { icon: Smartphone, label: 'App Usage' },
  { icon: Dumbbell, label: 'Workouts' },
  { icon: Users, label: 'Students' },
  { icon: CreditCard, label: 'Plans' },
];

const faqs = [
  'How to register a student?',
  'How to edit a workout?',
  'I forgot my password, what should I do?',
];

export default function HelpSupportPage() {
  const navigate = useNavigate();

  return (
    <div className="px-4 py-6 safe-area-top min-h-screen bg-background pb-24">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/trainer/profile')} className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="w-6 h-6" /></button>
        <h1 className="text-xl font-bold text-foreground">Help & Support</h1>
      </motion.div>
      <div className="h-px bg-border mb-6" />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
        <h2 className="text-lg font-bold text-foreground mb-4">Categories</h2>
        <div className="grid grid-cols-2 gap-3">
          {categories.map((category, index) => (
            <motion.button key={category.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.05 }} className="fitness-card flex flex-col items-start gap-3 p-4 hover:shadow-card-hover transition-all">
              <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center"><category.icon className="w-5 h-5 text-primary" /></div>
              <span className="font-medium text-foreground">{category.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6">
        <h2 className="text-lg font-bold text-foreground mb-4">FAQ</h2>
        <div className="fitness-card divide-y divide-border">
          {faqs.map((faq) => (
            <button key={faq} className="w-full flex items-center justify-between py-4 first:pt-2 last:pb-2">
              <span className="text-foreground text-left">{faq}</span>
              <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            </button>
          ))}
        </div>
      </motion.div>

      <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="w-full fitness-card flex items-center gap-4 mb-4">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center"><PlayCircle className="w-5 h-5 text-primary-foreground" /></div>
        <span className="font-medium text-primary flex-1 text-left">Tutorials</span>
        <ExternalLink className="w-5 h-5 text-primary" />
      </motion.button>

      <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="w-full fitness-card flex items-center gap-4 mb-6">
        <div className="w-10 h-10 bg-warning/10 rounded-xl flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-warning" /></div>
        <span className="font-medium text-foreground flex-1 text-left">Report a Problem</span>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </motion.button>

      <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="w-full fitness-button-primary flex items-center justify-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5" /><span>Contact Support</span>
      </motion.button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-2">
        <button className="w-full flex items-center gap-3 py-3 text-muted-foreground hover:text-foreground transition-colors"><FileText className="w-5 h-5" /><span>Terms & Privacy</span></button>
        <button className="w-full flex items-center gap-3 py-3 text-muted-foreground hover:text-foreground transition-colors"><Info className="w-5 h-5" /><span>About the App</span></button>
      </motion.div>
    </div>
  );
}
