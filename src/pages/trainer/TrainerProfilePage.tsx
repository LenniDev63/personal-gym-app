import React from 'react';
import { motion } from 'framer-motion';
import { Camera, ChevronRight, LogOut, Bell, HelpCircle, FileText, Users, Moon, Sun } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';

import AvatarUpload from '@/components/AvatarUpload';
import { Switch } from '@/components/ui/switch';

const menuItems = [
  { icon: Camera, label: 'Edit Profile', path: '/trainer/profile/edit' },
  { icon: Bell, label: 'Notifications', path: '/trainer/profile/notifications' },
  { icon: HelpCircle, label: 'Help & Support', path: '/trainer/profile/help' },
  { icon: FileText, label: 'Terms of Use', path: '/trainer/profile/terms' },
];

export default function TrainerProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const isDarkMode = theme === 'dark';

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
        className="mb-6"
      >
        <h1 className="fitness-page-title">Profile</h1>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="fitness-card flex flex-col items-center py-8 mb-4"
      >
        <AvatarUpload />

        <h2 className="text-xl font-bold text-foreground mb-1">
          {user?.name || 'John Smith'}
        </h2>
        <p className="text-muted-foreground text-sm">{user?.email || 'john@email.com'}</p>
      </motion.div>

      {/* Stats Card - Only Total Students */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="fitness-card text-center py-4 px-1 mb-6"
      >
        <div className="flex items-center justify-center mb-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="w-4 h-4 text-primary" />
          </div>
        </div>
        <p className="text-xl font-bold text-foreground">52</p>
        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tight">Total Students</p>
      </motion.div>

      {/* Menu Items */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="fitness-card divide-y divide-border mb-6"
      >
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="w-full flex items-center justify-between py-4 first:pt-2 last:pb-2"
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium text-foreground">{item.label}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        ))}
      </motion.div>

      {/* Theme Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.27 }}
        className="fitness-card mb-6"
      >
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            {isDarkMode ? (
              <Moon className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Sun className="w-5 h-5 text-muted-foreground" />
            )}
            <span className="font-medium text-foreground">Dark Mode</span>
          </div>
          <Switch
            checked={isDarkMode}
            onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
          />
        </div>
      </motion.div>

      {/* Logout */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onClick={handleLogout}
        className="w-full fitness-button-danger-outline flex items-center justify-center gap-3"
      >
        <LogOut className="w-5 h-5" />
        <span className="font-medium">Sign Out</span>
      </motion.button>
    </div>
  );
}
