import React from 'react';
import { Outlet } from 'react-router-dom';
import TrainerBottomNav from './TrainerBottomNav';

export default function TrainerLayout() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <Outlet />
      <TrainerBottomNav />
    </div>
  );
}
