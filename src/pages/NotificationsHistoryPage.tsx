import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell, MessageCircle, Dumbbell, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const mockNotifications = [
    {
        id: 1, type: 'message', title: 'New message',
        description: 'Sarah Connor sent you a new message.',
        time: '5 min ago', unread: true, icon: MessageCircle,
        color: 'bg-blue-500/10 text-blue-500'
    },
    {
        id: 2, type: 'workout', title: 'New workout available',
        description: 'Your Coach Alex added the workout "Legs + Abs" to your schedule.',
        time: '1 hour ago', unread: true, icon: Dumbbell,
        color: 'bg-orange-500/10 text-orange-500'
    },
    {
        id: 3, type: 'update', title: 'Measurements updated',
        description: 'Lucas Silva updated body measurements today.',
        time: '3 hours ago', unread: false, icon: TrendingUp,
        color: 'bg-green-500/10 text-green-500'
    },
    {
        id: 4, type: 'alert', title: 'Subscription expiring',
        description: "Daniel Smith's subscription expires in 3 days.",
        time: 'Yesterday', unread: false, icon: AlertCircle,
        color: 'bg-red-500/10 text-red-500'
    },
    {
        id: 5, type: 'success', title: 'Workout completed',
        description: 'Maria Santos completed today\'s workout successfully.',
        time: 'Yesterday', unread: false, icon: CheckCircle,
        color: 'bg-emerald-500/10 text-emerald-500'
    }
];

export default function NotificationsHistoryPage() {
    const navigate = useNavigate();

    return (
        <div className="px-4 py-6 safe-area-top min-h-screen bg-background">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between mb-8"
            >
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-full bg-card shadow-sm flex items-center justify-center text-muted-foreground hover:text-foreground transition-all active:scale-95"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
                </div>
                <button className="text-sm font-medium text-primary hover:underline">
                    Mark all as read
                </button>
            </motion.div>

            <div className="space-y-4">
                {mockNotifications.map((notification, index) => (
                    <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`fitness-card flex gap-4 relative group cursor-pointer hover:shadow-card-hover transition-all ${notification.unread ? 'border-l-4 border-l-primary' : ''}`}
                    >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${notification.color}`}>
                            <notification.icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className={`font-semibold truncate ${notification.unread ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {notification.title}
                                </h3>
                                <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">
                                    {notification.time}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                                {notification.description}
                            </p>
                        </div>
                        {notification.unread && (
                            <div className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_hsl(var(--primary))]" />
                        )}
                    </motion.div>
                ))}
            </div>

            {mockNotifications.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Bell className="w-10 h-10 text-muted-foreground/40" />
                    </div>
                    <p className="text-muted-foreground font-medium">You have no recent notifications.</p>
                </div>
            )}
        </div>
    );
}
