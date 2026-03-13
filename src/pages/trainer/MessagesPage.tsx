import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Smile, Plus, ChevronLeft, Video, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const mockConversations = [
  { id: 1, name: 'Daniel Smith', lastMessage: 'The new workout plan is intense!', time: '10:45', unread: false, isOnline: true },
  { id: 2, name: 'Sarah Connor', lastMessage: 'Can we reschedule to Friday?', time: 'Yesterday', unread: true, unreadCount: 2, isOnline: false },
  { id: 3, name: 'Lucas Silva', lastMessage: 'Thanks for today\'s workout!', time: 'Yesterday', unread: false, isOnline: true },
  { id: 4, name: 'Maria Santos', lastMessage: 'I\'ll follow the meal plan', time: 'Mon', unread: false, isOnline: false },
];

const mockMessages = [
  { id: 1, text: 'Hey! How was leg day this morning? I noticed you hit your squat PR! 🏋️', sender: 'other', time: '09:15 AM' },
  { id: 2, text: 'Great! The last set was tough, but I made it through.', sender: 'me', time: '09:18 AM' },
  { id: 3, text: 'Amazing. Your form looked much more stable on today\'s video check. Remember to log the exact weights!', sender: 'other', time: '09:20 AM' },
  { id: 4, text: 'Done! Already logged everything. Ready for tomorrow\'s cardio.', sender: 'me', time: '09:22 AM' },
];

const quickReplies = ['Thanks, coach!', 'I\'ll check now', 'Can we talk...'];

export default function MessagesPage() {
  const navigate = useNavigate();
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  if (selectedChat !== null) {
    const conversation = mockConversations.find(c => c.id === selectedChat);
    return (
      <div className="h-screen flex flex-col bg-background">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 px-4 py-4 border-b border-border bg-card safe-area-top">
          <button onClick={() => setSelectedChat(null)} className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"><ChevronLeft className="w-6 h-6" /></button>
          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center relative"><span className="text-primary font-bold text-lg">{conversation?.name.charAt(0)}</span></div>
          <div className="flex-1">
            <h2 className="font-semibold text-foreground">{conversation?.name}</h2>
            {conversation?.isOnline && <p className="text-xs text-primary font-medium">ONLINE NOW</p>}
          </div>
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground"><Video className="w-5 h-5" /></button>
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground"><Info className="w-5 h-5" /></button>
        </motion.div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex justify-center"><span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">TUESDAY, OCT 24</span></div>
          {mockMessages.map((msg) => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${msg.sender === 'me' ? 'order-1' : 'order-2'}`}>
                {msg.sender === 'other' && <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center mb-1"><span className="text-primary font-semibold text-xs">{conversation?.name.charAt(0)}</span></div>}
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

        <div className="p-4 border-t border-border bg-card safe-area-bottom">
          <div className="flex items-center gap-3">
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

  return (
    <div className="px-4 py-6 safe-area-top">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="fitness-page-title">Messages</h1>
        <p className="text-muted-foreground text-sm mt-1">Chat with your students</p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="space-y-3">
        {mockConversations.map((conversation, index) => (
          <motion.button key={conversation.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.05 }} onClick={() => setSelectedChat(conversation.id)} className="w-full fitness-card flex items-center gap-4 text-left hover:shadow-card-hover transition-all">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center"><span className="text-primary font-bold text-lg">{conversation.name.charAt(0)}</span></div>
              {conversation.isOnline && <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-primary rounded-full border-2 border-card" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5"><h3 className="font-semibold text-foreground">{conversation.name}</h3><span className="text-xs text-muted-foreground">{conversation.time}</span></div>
              <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
            </div>
            {conversation.unreadCount && <span className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-semibold text-primary-foreground">{conversation.unreadCount}</span>}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
