import React from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Users, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '@/assets/logo.png';

export default function WelcomePage() {
  const navigate = useNavigate();

  const features = [
    { icon: Dumbbell, label: 'Workouts' },
    { icon: Users, label: 'Students' },
    { icon: TrendingUp, label: 'Progress' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12 safe-area-top safe-area-bottom">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm flex flex-col items-center text-center"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-8"
        >
          <img 
            src={logo} 
            alt="Logo" 
            className="h-40 w-auto object-contain"
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-3xl font-bold text-foreground mb-3"
        >
          Your Training in
          <br />
          the Palm of Your Hand
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-muted-foreground mb-10 text-balance"
        >
          The complete platform for Personal Trainers and their students to achieve extraordinary results.
        </motion.p>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="flex gap-6 mb-12"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">{feature.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          className="w-full space-y-4"
        >
          <button
            onClick={() => navigate('/login')}
            className="w-full fitness-button-primary text-lg"
          >
            Get Started
          </button>

          <p className="text-muted-foreground">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-primary font-semibold hover:underline"
            >
              Sign In
            </button>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
