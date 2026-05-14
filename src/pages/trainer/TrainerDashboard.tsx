import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface RecentMessage {
  id: string;
  senderName: string;
  content: string;
  time: string;
  conversationId: string;
}

export default function TrainerDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [activeStudents, setActiveStudents] = useState(0);
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { count } = await supabase
        .from('trainer_students')
        .select('*', { count: 'exact', head: true })
        .eq('trainer_id', user.id)
        .eq('status', 'active');
      setActiveStudents(count ?? 0);

      const { data: convs } = await supabase
        .from('conversations')
        .select('id, student_id, last_message_at')
        .eq('trainer_id', user.id)
        .order('last_message_at', { ascending: false })
        .limit(5);

      if (convs && convs.length) {
        const studentIds = convs.map((c) => c.student_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', studentIds);
        const profMap = new Map(profiles?.map((p) => [p.id, p]) ?? []);

        const convIds = convs.map((c) => c.id);
        const { data: lastMsgs } = await supabase
          .from('messages')
          .select('id, conversation_id, content, created_at')
          .in('conversation_id', convIds)
          .order('created_at', { ascending: false });

        const lastByConv = new Map<string, any>();
        lastMsgs?.forEach((m) => { if (!lastByConv.has(m.conversation_id)) lastByConv.set(m.conversation_id, m); });

        setRecentMessages(
          convs
            .filter((c) => lastByConv.has(c.id))
            .map((c) => {
              const m = lastByConv.get(c.id);
              const p = profMap.get(c.student_id);
              return {
                id: m.id,
                senderName: p?.full_name || p?.email || 'Student',
                content: m.content,
                time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                conversationId: c.id,
              };
            })
        );
      }
      setLoading(false);
    })();
  }, [user]);

  const displayName = profile?.full_name || profile?.email || 'Coach';
  const firstName = displayName.split(' ')[0];

  return (
    <div className="px-4 py-6 safe-area-top">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div onClick={() => navigate('/trainer/profile')} className="flex items-center gap-3 cursor-pointer active:scale-95 transition-transform">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-primary font-bold text-lg">{displayName.charAt(0)}</span>
            )}
          </div>
          <div><p className="font-bold text-foreground">{displayName}</p></div>
        </div>
        <button onClick={() => navigate('/notifications')} className="w-10 h-10 rounded-full bg-card shadow-card flex items-center justify-center relative active:scale-90 transition-transform">
          <Bell className="w-5 h-5 text-muted-foreground" />
        </button>
      </motion.div>

      <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="fitness-page-title mb-6">
        Welcome back, {firstName}!
      </motion.h1>

      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fitness-stat-card">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm">Active Students</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-foreground">{activeStudents}</span>
          </div>
        </motion.div>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="fitness-section-title">Recent Messages</h2>
            <button onClick={() => navigate('/trainer/messages')} className="text-primary text-sm font-medium">Inbox</button>
          </div>
          <div className="space-y-3">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : recentMessages.length === 0 ? (
              <div className="fitness-card text-center py-6 text-sm text-muted-foreground">No messages yet.</div>
            ) : (
              recentMessages.map((msg) => (
                <div key={msg.id} onClick={() => navigate('/trainer/messages')} className="fitness-card flex items-center gap-4 cursor-pointer hover:shadow-card-hover transition-all">
                  <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                    <span className="text-primary font-semibold">{msg.senderName.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className="font-semibold text-foreground">{msg.senderName}</h3>
                      <span className="text-xs text-muted-foreground">{msg.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
