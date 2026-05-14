import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Send, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Conv { id: string; student_id: string; name: string; lastMessage: string; time: string; }
interface Msg { id: string; sender_id: string; content: string; created_at: string; }

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conv[]>([]);
  const [selected, setSelected] = useState<Conv | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  const loadConversations = async () => {
    if (!user) return;
    const { data: convs } = await supabase.from('conversations').select('id, student_id, last_message_at').eq('trainer_id', user.id).order('last_message_at', { ascending: false });
    if (!convs) return;

    // ensure conversations exist for all linked students
    const { data: links } = await supabase.from('trainer_students').select('student_id').eq('trainer_id', user.id).eq('status', 'active');
    const existing = new Set(convs.map((c) => c.student_id));
    const missing = (links ?? []).filter((l) => !existing.has(l.student_id));
    for (const l of missing) {
      await supabase.from('conversations').insert({ trainer_id: user.id, student_id: l.student_id });
    }
    if (missing.length > 0) return loadConversations();

    const ids = convs.map((c) => c.student_id);
    const { data: profs } = await supabase.from('profiles').select('id, full_name, email').in('id', ids);
    const profMap = new Map(profs?.map((p) => [p.id, p]) ?? []);
    const convIds = convs.map((c) => c.id);
    const { data: lastMsgs } = await supabase.from('messages').select('id, conversation_id, content, created_at').in('conversation_id', convIds).order('created_at', { ascending: false });
    const lastByConv = new Map<string, any>();
    lastMsgs?.forEach((m) => { if (!lastByConv.has(m.conversation_id)) lastByConv.set(m.conversation_id, m); });

    setConversations(convs.map((c) => {
      const p = profMap.get(c.student_id);
      const m = lastByConv.get(c.id);
      return { id: c.id, student_id: c.student_id, name: p?.full_name || p?.email || 'Student', lastMessage: m?.content || 'Start a conversation', time: m ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '' };
    }));
  };

  useEffect(() => { loadConversations(); }, [user]);

  useEffect(() => {
    if (!selected) return;
    let unsub: (() => void) | undefined;
    (async () => {
      const { data } = await supabase.from('messages').select('*').eq('conversation_id', selected.id).order('created_at');
      setMessages((data ?? []) as Msg[]);
      const channel = supabase.channel(`msgs-${selected.id}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${selected.id}` }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Msg]);
      }).subscribe();
      unsub = () => { supabase.removeChannel(channel); };
    })();
    return () => unsub?.();
  }, [selected]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!input.trim() || !selected || !user) return;
    const content = input.trim();
    setInput('');
    const { error } = await supabase.from('messages').insert({ conversation_id: selected.id, sender_id: user.id, content });
    if (error) { toast.error(error.message); return; }
    await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', selected.id);
  };

  if (selected) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-border bg-card safe-area-top">
          <button onClick={() => setSelected(null)} className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground"><ChevronLeft className="w-6 h-6" /></button>
          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center"><span className="text-primary font-bold text-lg">{selected.name.charAt(0)}</span></div>
          <div className="flex-1"><h2 className="font-semibold text-foreground">{selected.name}</h2></div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${m.sender_id === user?.id ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-card text-foreground rounded-bl-md shadow-card'}`}>
                <p className="text-sm">{m.content}</p>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <div className="p-4 border-t border-border bg-card safe-area-bottom">
          <div className="flex items-center gap-3">
            <input type="text" placeholder="Type a message..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} className="fitness-input flex-1" />
            <button onClick={send} className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-button"><Send className="w-5 h-5 text-primary-foreground" /></button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 safe-area-top">
      <div className="mb-6">
        <h1 className="fitness-page-title">Messages</h1>
        <p className="text-muted-foreground text-sm mt-1">Chat with your students</p>
      </div>
      <div className="space-y-3">
        {conversations.length === 0 ? <div className="fitness-card text-center py-12 text-muted-foreground">No conversations yet. Add students to start chatting.</div> :
          conversations.map((c) => (
            <button key={c.id} onClick={() => setSelected(c)} className="w-full fitness-card flex items-center gap-4 text-left hover:shadow-card-hover transition-all">
              <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center"><span className="text-primary font-bold text-lg">{c.name.charAt(0)}</span></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5"><h3 className="font-semibold text-foreground">{c.name}</h3><span className="text-xs text-muted-foreground">{c.time}</span></div>
                <p className="text-sm text-muted-foreground truncate">{c.lastMessage}</p>
              </div>
            </button>
          ))}
      </div>
    </div>
  );
}
