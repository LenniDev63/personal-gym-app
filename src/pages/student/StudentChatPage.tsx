import React, { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Msg { id: string; sender_id: string; content: string; created_at: string; }

export default function StudentChatPage() {
  const { user } = useAuth();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [trainerName, setTrainerName] = useState('Coach');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: link } = await supabase.from('trainer_students').select('trainer_id').eq('student_id', user.id).eq('status', 'active').maybeSingle();
      if (!link) return;
      const { data: t } = await supabase.from('profiles').select('full_name, email').eq('id', link.trainer_id).maybeSingle();
      setTrainerName(t?.full_name || t?.email || 'Coach');
      const { data: conv } = await supabase.from('conversations').select('id').eq('trainer_id', link.trainer_id).eq('student_id', user.id).maybeSingle();
      if (conv) setConversationId(conv.id);
    })();
  }, [user]);

  useEffect(() => {
    if (!conversationId) return;
    let unsub: (() => void) | undefined;
    (async () => {
      const { data } = await supabase.from('messages').select('*').eq('conversation_id', conversationId).order('created_at');
      setMessages((data ?? []) as Msg[]);
      const channel = supabase.channel(`smsgs-${conversationId}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Msg]);
      }).subscribe();
      unsub = () => { supabase.removeChannel(channel); };
    })();
    return () => unsub?.();
  }, [conversationId]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!input.trim() || !conversationId || !user) return;
    const content = input.trim();
    setInput('');
    const { error } = await supabase.from('messages').insert({ conversation_id: conversationId, sender_id: user.id, content });
    if (error) toast.error(error.message);
    await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', conversationId);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border bg-card safe-area-top">
        <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center"><span className="text-primary font-bold text-lg">{trainerName.charAt(0)}</span></div>
        <div className="flex-1"><h2 className="font-semibold text-foreground">{trainerName}</h2></div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-32">
        {!conversationId ? <p className="text-center text-muted-foreground text-sm">No trainer linked yet.</p> :
          messages.length === 0 ? <p className="text-center text-muted-foreground text-sm">Send your first message.</p> :
          messages.map((m) => (
            <div key={m.id} className={`flex ${m.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${m.sender_id === user?.id ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-card text-foreground rounded-bl-md shadow-card'}`}>
                <p className="text-sm">{m.content}</p>
              </div>
            </div>
          ))}
        <div ref={endRef} />
      </div>
      <div className="fixed bottom-20 left-0 right-0 p-4 border-t border-border bg-card">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <input type="text" placeholder="Type a message..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} className="fitness-input flex-1" disabled={!conversationId} />
          <button onClick={send} disabled={!conversationId} className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-button disabled:opacity-50"><Send className="w-5 h-5 text-primary-foreground" /></button>
        </div>
      </div>
    </div>
  );
}
