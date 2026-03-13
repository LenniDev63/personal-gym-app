import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Calendar, TrendingDown, Plus, ChevronRight, X, Scale, Ruler, Activity, Check } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useNavigate, useParams } from 'react-router-dom';

const weightData = [
  { month: 'SEP', value: 81.1 }, { month: 'OCT', value: 80.4 }, { month: 'OCT', value: 79.8 }, { month: 'OCT', value: 79.2 }, { month: 'NOV', value: 78.5 },
];
const bodyFatData = [
  { month: 'SEP', value: 19.8 }, { month: 'OCT', value: 19.4 }, { month: 'OCT', value: 19.0 }, { month: 'OCT', value: 18.7 }, { month: 'NOV', value: 18.4 },
];
const historyData = [
  { date: 'Nov 12, 2023', note: 'Recorded by Trainer Mike', weight: '78.5 kg', bodyFat: '18.4%' },
  { date: 'Oct 28, 2023', note: 'Biweekly check-in', weight: '79.2 kg', bodyFat: '18.6%' },
  { date: 'Oct 14, 2023', note: 'Monthly assessment', weight: '80.4 kg', bodyFat: '19.2%' },
  { date: 'Sep 30, 2023', note: 'Initial baseline', weight: '81.1 kg', bodyFat: '19.8%' },
];
const timeFilters = ['1M', '3M', '6M', 'All'];

export default function StudentProgressPage() {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const [activeFilter, setActiveFilter] = useState('3M');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [metrics, setMetrics] = useState({ weight: 78.5, bodyFat: 18.4, height: 175, chest: 98, waist: 82, hips: 102, armL: 34, armR: 34.5, thighL: 58, thighR: 58.5 });

  return (
    <div className="px-4 py-6 safe-area-top">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-card shadow-card flex items-center justify-center text-muted-foreground"><ChevronLeft className="w-6 h-6" /></button>
          <h1 className="fitness-page-title">{studentId ? 'Student' : 'My'} Progress</h1>
        </div>
        <button className="w-10 h-10 rounded-full bg-card shadow-card flex items-center justify-center"><Calendar className="w-5 h-5 text-muted-foreground" /></button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex bg-muted rounded-xl p-1 mb-6">
        {timeFilters.map((filter) => (
          <button key={filter} onClick={() => setActiveFilter(filter)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${activeFilter === filter ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>{filter}</button>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="fitness-card mb-4">
        <div className="flex items-center justify-between mb-4">
          <div><p className="text-xs text-muted-foreground uppercase tracking-wide">WEIGHT PROGRESS</p><p className="text-3xl font-bold text-foreground">{metrics.weight} <span className="text-lg">kg</span></p></div>
          <span className="fitness-badge-success flex items-center gap-1"><TrendingDown className="w-3 h-3" />-2.4%</span>
        </div>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weightData}><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} /><Tooltip contentStyle={{ background: 'hsl(var(--card))', border: 'none', borderRadius: '8px', boxShadow: 'var(--shadow-card)' }} /><Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} /></LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="fitness-card mb-4">
        <div className="flex items-center justify-between mb-4">
          <div><p className="text-xs text-muted-foreground uppercase tracking-wide">BODY FAT PERCENTAGE</p><p className="text-3xl font-bold text-foreground">{metrics.bodyFat} <span className="text-lg">%</span></p></div>
          <span className="fitness-badge-success flex items-center gap-1"><TrendingDown className="w-3 h-3" />-1.2%</span>
        </div>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%"><LineChart data={bodyFatData}><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} /><Tooltip contentStyle={{ background: 'hsl(var(--card))', border: 'none', borderRadius: '8px', boxShadow: 'var(--shadow-card)' }} /><Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="grid grid-cols-2 gap-4 mb-6">
        <div className="fitness-card"><p className="text-xs text-muted-foreground uppercase tracking-wide">BMI</p><div className="flex items-end justify-between mt-1"><div><p className="text-2xl font-bold text-foreground">24.2</p><p className="text-xs text-primary font-medium">Normal</p></div><span className="text-xs text-primary flex items-center gap-0.5"><TrendingDown className="w-3 h-3" />-0.5%</span></div></div>
        <div className="fitness-card"><p className="text-xs text-muted-foreground uppercase tracking-wide">WHR</p><div className="flex items-end justify-between mt-1"><div><p className="text-2xl font-bold text-foreground">0.85</p><p className="text-xs text-primary font-medium">Low Risk</p></div><span className="text-xs text-primary flex items-center gap-0.5"><TrendingDown className="w-3 h-3" />-0.02%</span></div></div>
      </motion.div>

      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-24">
        <div className="flex items-center justify-between mb-4"><h2 className="fitness-section-title">Measurement History</h2><button className="text-primary text-sm font-medium">View All</button></div>
        <div className="space-y-3">
          {historyData.map((entry, index) => (
            <motion.div key={entry.date} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + index * 0.05 }} className="fitness-card flex items-center justify-between">
              <div><p className="font-semibold text-foreground">{entry.date}</p><p className="text-xs text-muted-foreground">{entry.note}</p></div>
              <div className="text-right"><p className="font-semibold text-foreground">{entry.weight}</p><p className="text-xs text-muted-foreground">{entry.bodyFat} BF</p></div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </motion.div>
          ))}
        </div>
      </motion.section>

      <AnimatePresence>{isModalOpen && <UpdateProgressModal currentMetrics={metrics} onClose={() => setIsModalOpen(false)} onSave={(m: any) => { setMetrics({ ...metrics, ...m }); setIsModalOpen(false); }} />}</AnimatePresence>
      <button onClick={() => setIsModalOpen(true)} className="fixed bottom-24 right-4 w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-button z-40 active:scale-95 transition-transform"><Plus className="w-6 h-6 text-primary-foreground" /></button>
    </div>
  );
}

function UpdateProgressModal({ currentMetrics, onClose, onSave }: any) {
  const [formData, setFormData] = useState(currentMetrics);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/50 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-card rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-center pt-3 sm:hidden"><div className="w-12 h-1.5 bg-muted rounded-full" /></div>
        <div className="flex items-center justify-between p-6 pb-4">
          <div><h2 className="text-xl font-bold text-foreground">Update Measurements</h2><p className="text-sm text-muted-foreground">Record today's physical progress.</p></div>
          <button onClick={onClose} className="p-2 rounded-full bg-muted text-muted-foreground"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 pt-0 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><label className="fitness-label flex items-center gap-2"><Scale className="w-4 h-4" /> Weight (kg)</label><input type="number" step="0.1" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} className="fitness-input" /></div>
            <div className="space-y-2"><label className="fitness-label flex items-center gap-2"><Activity className="w-4 h-4" /> Body Fat (%)</label><input type="number" step="0.1" value={formData.bodyFat} onChange={(e) => setFormData({ ...formData, bodyFat: e.target.value })} className="fitness-input" /></div>
          </div>
          <div className="space-y-2"><label className="fitness-label flex items-center gap-2"><Ruler className="w-4 h-4" /> Height (cm)</label><input type="number" value={formData.height} onChange={(e) => setFormData({ ...formData, height: e.target.value })} className="fitness-input" /></div>
          <div className="h-px bg-border" /><p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Circumferences (cm)</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2"><label className="fitness-label">Chest</label><input type="number" value={formData.chest} onChange={(e) => setFormData({ ...formData, chest: e.target.value })} className="fitness-input" /></div>
            <div className="space-y-2"><label className="fitness-label">Waist</label><input type="number" value={formData.waist} onChange={(e) => setFormData({ ...formData, waist: e.target.value })} className="fitness-input" /></div>
            <div className="space-y-2"><label className="fitness-label">Hips</label><input type="number" value={formData.hips} onChange={(e) => setFormData({ ...formData, hips: e.target.value })} className="fitness-input" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><label className="fitness-label">Arm (L/R)</label><div className="flex gap-2"><input type="number" placeholder="L" value={formData.armL} onChange={(e) => setFormData({ ...formData, armL: e.target.value })} className="fitness-input px-2" /><input type="number" placeholder="R" value={formData.armR} onChange={(e) => setFormData({ ...formData, armR: e.target.value })} className="fitness-input px-2" /></div></div>
            <div className="space-y-2"><label className="fitness-label">Thigh (L/R)</label><div className="flex gap-2"><input type="number" placeholder="L" value={formData.thighL} onChange={(e) => setFormData({ ...formData, thighL: e.target.value })} className="fitness-input px-2" /><input type="number" placeholder="R" value={formData.thighR} onChange={(e) => setFormData({ ...formData, thighR: e.target.value })} className="fitness-input px-2" /></div></div>
          </div>
          <button onClick={() => onSave(formData)} className="w-full fitness-button-primary flex items-center justify-center gap-2 py-4"><Check className="w-5 h-5" /><span>Save Progress</span></button>
          <div className="h-6" />
        </div>
      </motion.div>
    </motion.div>
  );
}
