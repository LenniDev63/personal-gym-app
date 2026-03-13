import React, { useRef } from 'react';
import { Camera, Image as ImageIcon, Trash2, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';

interface AvatarUploadProps {
    size?: 'sm' | 'md' | 'lg';
}

export default function AvatarUpload({ size = 'lg' }: AvatarUploadProps) {
    const { user, updateUser } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('A imagem deve ter no máximo 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                updateUser({ avatar: base64String });
                toast.success('Foto de perfil atualizada!');
                setIsMenuOpen(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemove = () => {
        updateUser({ avatar: undefined });
        toast.success('Foto de perfil removida');
        setIsMenuOpen(false);
    };

    const toggleMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsMenuOpen(!isMenuOpen);
    };

    const sizeClasses = {
        sm: 'w-14 h-14 text-xl',
        md: 'w-16 h-16 text-2xl',
        lg: 'w-24 h-24 text-3xl',
    };

    return (
        <div className="relative mb-6">
            <div className="relative group cursor-pointer" onClick={toggleMenu}>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                />
                <input
                    type="file"
                    ref={cameraInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                />
                <div className={`${sizeClasses[size]} rounded-full bg-accent flex items-center justify-center overflow-hidden border-4 border-card transition-all group-hover:shadow-lg shadow-md font-bold text-primary ring-2 ring-primary/5 group-active:scale-95`}>
                    {user?.avatar ? (
                        <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="opacity-40">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                    )}
                </div>
                <div
                    className="absolute bottom-0 right-0 w-9 h-9 bg-primary rounded-full flex items-center justify-center shadow-button text-primary-foreground transform transition-transform group-hover:scale-110 border-4 border-card"
                >
                    <Camera className="w-4 h-4" />
                </div>
            </div>

            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-foreground/30 z-50"
                            onClick={() => setIsMenuOpen(false)}
                        />
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className="fixed bottom-0 left-0 right-0 bg-card rounded-t-[32px] p-6 pb-12 z-[51] shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-foreground">Foto de Perfil</h3>
                                <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-muted rounded-full">
                                    <X className="w-5 h-5 text-muted-foreground" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <button
                                    onClick={() => {
                                        fileInputRef.current?.click();
                                    }}
                                    className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-accent/50 hover:bg-accent transition-colors"
                                >
                                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                        <ImageIcon className="w-6 h-6" />
                                    </div>
                                    <span className="text-sm font-semibold">Galeria</span>
                                </button>
                                <button
                                    onClick={() => {
                                        cameraInputRef.current?.click();
                                    }}
                                    className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-accent/50 hover:bg-accent transition-colors"
                                >
                                    <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                                        <Camera className="w-6 h-6" />
                                    </div>
                                    <span className="text-sm font-semibold">Câmera</span>
                                </button>
                            </div>

                            {user?.avatar && (
                                <button
                                    onClick={handleRemove}
                                    className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-destructive/5 text-destructive font-semibold hover:bg-destructive/10 transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                    Remover Foto Atual
                                </button>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
