import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Smile, Plus, Video, Info } from 'lucide-react';

const mockMessages = [
  { id: 1, text: 'Hey! How was leg day this morning? I noticed you hit your squat PR! 🏋️', sender: 'other', time: '09:15 AM' },
  { id: 2, text: 'Great! The last set was tough, but I made it through.', sender: 'me', time: '09:18 AM' },
  { id: 3, text: 'Amazing. Your form looked much more stable on today\'s video check. Remember to log the exact weights!', sender: 'other', time: '09:20 AM' },
  { id: 4, text: 'Done! Already logged everything. Ready for tomorrow\'s cardio.', sender: 'me', time: '09:22 AM' },
];

const quickReplies = ['Thanks, coach!', 'I\'ll check now', 'Can we talk...'];

export default function StudentChatPage() {
  const [message, setMessage] = useState('');

  return (
    <div className="h-screen flex flex-col bg-background">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 px-4 py-4 border-b border-border bg-card safe-area-top">
        <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center relative"><span className="text-primary font-bold text-lg">A</span></div>
        <div className="flex-1"><h2 className="font-semibold text-foreground">Coach Alex</h2><p className="text-xs text-primary font-medium">ONLINE NOW</p></div>
        <button className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground"><Video className="w-5 h-5" /></button>
        <button className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground"><Info className="w-5 h-5" /></button>
      </motion.div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
        <div className="flex justify-center"><span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">TUESDAY, OCT 24</span></div>
        {mockMessages.map((msg) => (
          <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] ${msg.sender === 'me' ? 'order-1' : 'order-2'}`}>
              {msg.sender === 'other' && <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center mb-1"><span className="text-primary font-semibold text-xs">A</span></div>}
              <div className={`rounded-2xl px-4 py-3 ${msg.sender === 'me' ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-card text-foreground rounded-bl-md shadow-card'}`}><p className="text-sm">{msg.text}</p></div>
              <p className={`text-xs text-muted-foreground mt-1 ${msg.sender === 'me' ? 'text-right' : ''}`}>{msg.time} {msg.sender === 'me' && '✓✓'}</p>
            </div>
          </motion.div>
        ))}
        <div className="flex justify-center"><span className="text-xs text-primary bg-accent px-3 py-1 rounded-full font-medium">TODAY</span></div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {quickReplies.map((reply) => (
            <button key={reply} onClick={() => setMessage(reply)} className="flex-shrink-0 bg-card border border-border rounded-full px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors">{reply}</button>
          ))}
        </div>
      </div>

      <div className="fixed bottom-20 left-0 right-0 p-4 border-t border-border bg-card">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground"><Plus className="w-5 h-5" /></button>
          <div className="flex-1 relative">
            <input type="text" placeholder="Type a message..." value={message} onChange={(e) => setMessage(e.target.value)} className="fitness-input pr-12" />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"><Smile className="w-5 h-5" /></button>
          </div>
          <button className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-button"><Send className="w-5 h-5 text-primary-foreground" /></button>
        </div>
      </div>
    </div>
  );
}
