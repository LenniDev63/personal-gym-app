import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Users, MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const recentMessages = [
  { id: 1, name: 'Daniel Smith', avatar: null, message: 'The new workout plan is intense!', time: '10:45', unread: false },
  { id: 2, name: 'Sarah Connor', avatar: null, message: 'Can we reschedule to Friday?', time: 'Yesterday', unread: true, unreadCount: 2 },
];

export default function TrainerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="px-4 py-6 safe-area-top">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div
          onClick={() => navigate('/trainer/profile')}
          className="flex items-center gap-3 cursor-pointer active:scale-95 transition-transform"
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-primary font-bold text-lg">
                {user?.name?.charAt(0) || 'C'}
              </span>
            )}
          </div>
          <div>
            <p className="font-bold text-foreground">{user?.name || 'Loading...'}</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/notifications')}
          className="w-10 h-10 rounded-full bg-card shadow-card flex items-center justify-center relative active:scale-90 transition-transform"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
        </button>
      </motion.div>

      {/* Welcome */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="fitness-page-title mb-6"
      >
        Welcome back, {user?.name?.split(' ')[1] || 'Coach'}!
      </motion.h1>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Active Students Card */}
        <motion.div variants={item} className="fitness-stat-card">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm">Active Students</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-foreground">52</span>
          </div>
        </motion.div>

        {/* Recent Messages */}
        <motion.section variants={item}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="fitness-section-title">Recent Messages</h2>
            <button
              onClick={() => navigate('/trainer/messages')}
              className="text-primary text-sm font-medium"
            >
              Inbox
            </button>
          </div>

          <div className="space-y-3">
            {recentMessages.map((msg) => (
              <div key={msg.id} className="fitness-card flex items-center gap-4 cursor-pointer hover:shadow-card-hover transition-all">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                    <span className="text-primary font-semibold">
                      {msg.name.charAt(0)}
                    </span>
                  </div>
                  {msg.unread && (
                    <span className="absolute bottom-0 left-0 w-3 h-3 bg-primary rounded-full border-2 border-card" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className="font-semibold text-foreground">{msg.name}</h3>
                    <span className="text-xs text-muted-foreground">{msg.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">"{msg.message}"</p>
                </div>
                {msg.unreadCount && (
                  <span className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-semibold text-primary-foreground">
                    {msg.unreadCount}
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
}
