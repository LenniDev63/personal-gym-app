import React, { useRef } from 'react';
import { Camera, Image as ImageIcon, Trash2, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';

interface AvatarUploadProps {
    size?: 'sm' | 'md' | 'lg';
}

export default function AvatarUpload({ size = 'lg' }: AvatarUploadProps) {
    const { profile, user, refreshProfile } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const updateAvatar = async (avatarUrl: string | null) => {
        if (!user) return;
        const { error } = await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', user.id);
        if (error) { toast.error(error.message); return; }
        await refreshProfile();
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { toast.error('Image must be at most 5MB'); return; }
        const reader = new FileReader();
        reader.onloadend = async () => {
            await updateAvatar(reader.result as string);
            toast.success('Profile photo updated!');
            setIsMenuOpen(false);
        };
        reader.readAsDataURL(file);
    };

    const handleRemove = async () => {
        await updateAvatar(null);
        toast.success('Profile photo removed');
        setIsMenuOpen(false);
    };

    const toggleMenu = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setIsMenuOpen(!isMenuOpen); };

    const sizeClasses = { sm: 'w-14 h-14 text-xl', md: 'w-16 h-16 text-2xl', lg: 'w-24 h-24 text-3xl' };
    const avatar = profile?.avatar_url;
    const name = profile?.full_name || profile?.email || 'U';

    return (
        <div className="relative mb-6">
            <div className="relative group cursor-pointer" onClick={toggleMenu}>
                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                <input type="file" ref={cameraInputRef} onChange={handleImageChange} accept="image/*" capture="environment" className="hidden" />
                <div className={`${sizeClasses[size]} rounded-full bg-accent flex items-center justify-center overflow-hidden border-4 border-card transition-all group-hover:shadow-lg shadow-md font-bold text-primary ring-2 ring-primary/5 group-active:scale-95`}>
                    {avatar ? (
                        <img src={avatar} alt={name} className="w-full h-full object-cover" />
                    ) : (
                        <span className="opacity-40">{name.charAt(0).toUpperCase()}</span>
                    )}
                </div>
                <div className="absolute bottom-0 right-0 w-9 h-9 bg-primary rounded-full flex items-center justify-center shadow-button text-primary-foreground transform transition-transform group-hover:scale-110 border-4 border-card">
                    <Camera className="w-4 h-4" />
                </div>
            </div>

            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/30 z-50" onClick={() => setIsMenuOpen(false)} />
                        <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-0 left-0 right-0 bg-card rounded-t-[32px] p-6 pb-12 z-[51] shadow-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-foreground">Profile Photo</h3>
                                <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-muted rounded-full"><X className="w-5 h-5 text-muted-foreground" /></button>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-accent/50 hover:bg-accent transition-colors">
                                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500"><ImageIcon className="w-6 h-6" /></div>
                                    <span className="text-sm font-semibold">Gallery</span>
                                </button>
                                <button onClick={() => cameraInputRef.current?.click()} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-accent/50 hover:bg-accent transition-colors">
                                    <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500"><Camera className="w-6 h-6" /></div>
                                    <span className="text-sm font-semibold">Camera</span>
                                </button>
                            </div>
                            {avatar && (
                                <button onClick={handleRemove} className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-destructive/5 text-destructive font-semibold hover:bg-destructive/10 transition-colors">
                                    <Trash2 className="w-5 h-5" /> Remove Current Photo
                                </button>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
