import React from 'react';
import { Outlet } from 'react-router-dom';
import StudentBottomNav from './StudentBottomNav';

export default function StudentLayout() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <Outlet />
      <StudentBottomNav />
    </div>
  );
}
