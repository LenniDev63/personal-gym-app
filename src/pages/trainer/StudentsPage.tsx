import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, MessageCircle, Dumbbell, X, Mail, User as UserIcon, Pencil, Trash2, TrendingUp, MessageSquare, ListFilter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const mockStudents = [
  { id: 1, name: 'Alex Johnson', objective: 'Weight Loss', nextSession: 'Tomorrow, 8 AM', isActive: true, status: 'upcoming' },
  { id: 2, name: 'Sarah Miller', objective: 'Marathon Prep', lastWorkout: '2h ago', isActive: true, status: 'trained' },
  { id: 3, name: 'Marcus Chen', objective: 'Muscle Gain', inactiveFor: '4 days', isActive: false, status: 'inactive' },
  { id: 4, name: 'Elena Rodriguez', objective: 'Flexibility', isActive: true, status: 'normal' },
  { id: 5, name: 'David Thompson', objective: 'Senior Fitness', isActive: true, status: 'normal' },
];

export default function StudentsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [students, setStudents] = useState(mockStudents);
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<any | null>(null);

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = students.filter(s => s.isActive).length;

  const handleSaveStudent = (studentData: any) => {
    if (editingStudent) {
      setStudents(students.map(s => s.id === editingStudent.id ? { ...s, ...studentData } : s));
    } else {
      const newStudent = { id: students.length + 1, ...studentData, isActive: true, status: 'normal' as const };
      setStudents([newStudent, ...students]);
    }
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  const handleEdit = (student: any) => { setEditingStudent(student); setIsModalOpen(true); };
  const handleDeleteClick = (student: any) => { setStudentToDelete(student); setIsDeleteModalOpen(true); };
  const handleDeleteConfirm = () => {
    if (studentToDelete) {
      setStudents(students.filter(s => s.id !== studentToDelete.id));
      setIsDeleteModalOpen(false);
      setStudentToDelete(null);
    }
  };

  return (
    <div className="px-4 py-6 safe-area-top">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-full bg-card shadow-card flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-muted-foreground" />
          </button>
          <h1 className="fitness-page-title">My Students</h1>
        </div>
        <button onClick={() => { setEditingStudent(null); setIsModalOpen(true); }} className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-button">
          <Plus className="w-6 h-6 text-primary-foreground" />
        </button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative mb-6 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input type="text" placeholder="Search students..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="fitness-input pl-12" />
        </div>
        <button className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground shadow-sm">
          <ListFilter className="w-5 h-5" />
        </button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Active Students ({activeCount})</span>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-3">
        {filteredStudents.map((student, index) => (
          <motion.div key={student.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.05 }} className="fitness-card flex flex-col gap-4 p-5">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-accent flex items-center justify-center">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} alt={student.name} className="w-full h-full object-cover" />
                </div>
                <span className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-card ${student.isActive ? 'bg-primary' : 'bg-muted-foreground'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-foreground mb-0.5">{student.name}</h3>
                <p className="text-sm text-muted-foreground">Goal: <span className="text-accent-foreground font-medium">{student.objective}</span></p>
                {student.status === 'upcoming' && <p className="text-xs text-primary font-medium mt-1 flex items-center gap-1"><span className="text-lg leading-none">📅</span> Next session: {(student as any).nextSession}</p>}
                {student.status === 'trained' && <p className="text-xs text-primary font-medium mt-1 flex items-center gap-1"><span className="text-lg leading-none">⏱️</span> Last workout: {(student as any).lastWorkout}</p>}
                {student.status === 'inactive' && <p className="text-xs text-destructive font-medium mt-1 flex items-center gap-1"><span className="text-lg leading-none">⚠️</span> Inactive for {(student as any).inactiveFor}</p>}
                {student.status === 'normal' && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">Up to date with workouts</p>}
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
              <div className="flex items-center gap-2">
                <button onClick={() => handleEdit(student)} className="w-10 h-10 rounded-full bg-accent/30 flex items-center justify-center text-muted-foreground hover:bg-accent/50 transition-colors"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDeleteClick(student)} className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => navigate('/trainer/messages')} className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-accent/50 text-accent-foreground font-bold text-sm shadow-sm active:scale-95 transition-all"><MessageSquare className="w-4 h-4 fill-accent-foreground/20" />CHAT</button>
                <button onClick={() => navigate(`/trainer/students/${student.id}/progress`)} className="w-10 h-10 rounded-full bg-accent/30 flex items-center justify-center text-foreground hover:bg-accent/50 transition-colors"><TrendingUp className="w-4 h-4" /></button>
                <button onClick={() => navigate(`/trainer/students/${student.id}/workouts`)} className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-button shadow-primary/20 active:scale-95 transition-all"><Dumbbell className="w-5 h-5" /></button>
              </div>
            </div>
          </motion.div>
        ))}
        {filteredStudents.length === 0 && <div className="text-center py-12"><p className="text-muted-foreground">No students found.</p></div>}
      </motion.div>

      <AnimatePresence>
        {isModalOpen && <NewStudentModal student={editingStudent} onClose={() => { setIsModalOpen(false); setEditingStudent(null); }} onSave={handleSaveStudent} />}
        {isDeleteModalOpen && <DeleteConfirmationModal studentName={studentToDelete?.name || ''} onClose={() => { setIsDeleteModalOpen(false); setStudentToDelete(null); }} onConfirm={handleDeleteConfirm} />}
      </AnimatePresence>
    </div>
  );
}

function DeleteConfirmationModal({ studentName, onClose, onConfirm }: { studentName: string; onClose: () => void; onConfirm: () => void }) {
  const [confirmName, setConfirmName] = useState('');
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/50 z-[60] flex items-center justify-center px-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm bg-card rounded-3xl p-6 shadow-2xl border border-border">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-4"><Trash2 className="w-8 h-8" /></div>
          <h2 className="text-xl font-bold text-foreground mb-2">Delete Student?</h2>
          <p className="text-sm text-muted-foreground mb-6">This action cannot be undone. To confirm, type <strong>{studentName}</strong> below:</p>
          <input type="text" placeholder="Student name" value={confirmName} onChange={(e) => setConfirmName(e.target.value)} className="fitness-input mb-6 text-center" />
          <div className="flex w-full gap-3">
            <button onClick={onClose} className="flex-1 py-3 rounded-2xl bg-muted text-muted-foreground font-semibold hover:bg-muted/80 transition-colors">Cancel</button>
            <button onClick={onConfirm} disabled={confirmName !== studentName} className="flex-1 py-3 rounded-2xl bg-destructive text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-destructive/90 transition-colors shadow-lg shadow-destructive/20">Delete</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function NewStudentModal({ student, onClose, onSave }: { student?: any | null; onClose: () => void; onSave: (data: any) => void }) {
  const [formData, setFormData] = useState({
    name: student?.name || '', email: student?.email || '', age: student?.age || '', gender: student?.gender || '',
    height: student?.height || '', weight: student?.weight || '', bodyFat: student?.bodyFat || '', experience: student?.experience || '',
    objective: student?.objective || '', restrictions: student?.restrictions || '', notes: student?.notes || '',
  });
  const genderOptions = ['Male', 'Female', 'Other'];
  const experienceOptions = ['Beginner', 'Intermediate', 'Advanced'];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/50 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-card rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-center pt-3 sm:hidden"><div className="w-12 h-1.5 bg-muted rounded-full" /></div>
        <div className="flex items-center justify-between p-6 pb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">{student ? 'Edit Student' : 'New Student'}</h2>
            <p className="text-sm text-muted-foreground">{student ? 'Update student information.' : 'Register a new student and send access.'}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="h-px bg-border" />
        <div className="p-6 space-y-5">
          <div>
            <label className="fitness-label">Full Name <span className="text-destructive">*</span></label>
            <input type="text" placeholder="Student name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="fitness-input" />
          </div>
          <div>
            <label className="fitness-label">Email <span className="text-destructive">*</span></label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input type="email" placeholder="email@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="fitness-input pl-12" />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1"><Mail className="w-3 h-3" /> An email will be sent to this address</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="fitness-label">Age</label><input type="number" placeholder="E.g.: 25" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} className="fitness-input" /></div>
            <div><label className="fitness-label">Gender</label><select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="fitness-input appearance-none cursor-pointer"><option value="">Select</option>{genderOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}</select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="fitness-label">Height (cm)</label><input type="number" placeholder="E.g.: 175" value={formData.height} onChange={(e) => setFormData({ ...formData, height: e.target.value })} className="fitness-input" /></div>
            <div><label className="fitness-label">Weight (kg)</label><input type="number" placeholder="E.g.: 70" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} className="fitness-input" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="fitness-label">Body Fat %</label><input type="number" placeholder="E.g.: 15" value={formData.bodyFat} onChange={(e) => setFormData({ ...formData, bodyFat: e.target.value })} className="fitness-input" /></div>
            <div><label className="fitness-label">Experience</label><select value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: e.target.value })} className="fitness-input appearance-none cursor-pointer"><option value="">Select</option>{experienceOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}</select></div>
          </div>
          <div><label className="fitness-label">Goal</label><input type="text" placeholder="E.g.: Hypertrophy, Weight Loss..." value={formData.objective} onChange={(e) => setFormData({ ...formData, objective: e.target.value })} className="fitness-input" /></div>
          <div><label className="fitness-label">Restrictions / Injuries</label><textarea placeholder="Describe injuries, limitations or medical restrictions..." value={formData.restrictions} onChange={(e) => setFormData({ ...formData, restrictions: e.target.value })} rows={3} className="fitness-input resize-none" /></div>
          <div><label className="fitness-label">Notes</label><textarea placeholder="Other relevant information" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} className="fitness-input resize-none" /></div>
        </div>
        <div className="p-6 pt-0">
          <button onClick={() => onSave(formData)} className="w-full fitness-button-primary flex items-center justify-center gap-2">
            <span>{student ? 'Save Changes' : 'Register Student'}</span>
            <UserIcon className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
