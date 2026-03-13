import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutGrid, Dumbbell, Users, MessageCircle } from 'lucide-react';

const navItems = [
  { path: '/trainer', icon: LayoutGrid, label: 'Dashboard' },
  { path: '/trainer/library', icon: Dumbbell, label: 'Exercises' },
  { path: '/trainer/students', icon: Users, label: 'Students' },
  { path: '/trainer/messages', icon: MessageCircle, label: 'Messages' },
];

export default function TrainerBottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-lg border-t border-border shadow-nav safe-area-bottom z-50">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/trainer' && location.pathname.startsWith(item.path));
          return (
            <NavLink key={item.path} to={item.path} className={`fitness-nav-item relative flex-1 min-w-0 ${isActive ? 'active' : ''}`}>
              {isActive && <motion.div layoutId="trainer-nav-indicator" className="absolute -top-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" transition={{ type: 'spring', bounce: 0.3, duration: 0.4 }} />}
              <item.icon className="w-6 h-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
