import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth, UserRole } from "@/contexts/AuthContext";
import { ThemeProvider } from "next-themes";

import WelcomePage from "./pages/WelcomePage";
import LoginPage from "./pages/LoginPage";
import NotificationsHistoryPage from "./pages/NotificationsHistoryPage";
import NotFound from "./pages/NotFound";

import TrainerLayout from "./components/trainer/TrainerLayout";
import TrainerDashboard from "./pages/trainer/TrainerDashboard";
import ExerciseLibrary from "./pages/trainer/ExerciseLibrary";
import StudentsPage from "./pages/trainer/StudentsPage";
import StudentWorkoutsPage from "./pages/trainer/StudentWorkoutsPage";
import MessagesPage from "./pages/trainer/MessagesPage";
import TrainerProfilePage from "./pages/trainer/TrainerProfilePage";
import EditProfilePage from "./pages/trainer/EditProfilePage";
import PrivacySecurityPage from "./pages/trainer/PrivacySecurityPage";
import HelpSupportPage from "./pages/trainer/HelpSupportPage";
import NotificationsPage from "./pages/trainer/NotificationsPage";

import StudentLayout from "./components/student/StudentLayout";
import StudentWorkoutsPageStudent from "./pages/student/StudentWorkoutsPage";
import StudentChatPage from "./pages/student/StudentChatPage";
import StudentProgressPage from "./pages/student/StudentProgressPage";
import StudentProfilePage from "./pages/student/StudentProfilePage";

const queryClient = new QueryClient();

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole: UserRole }) {
  const { user, role, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && role !== requiredRole) return <Navigate to={role === 'trainer' ? '/trainer' : '/student'} replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/notifications" element={<NotificationsHistoryPage />} />

      <Route path="/trainer" element={<ProtectedRoute requiredRole="trainer"><TrainerLayout /></ProtectedRoute>}>
        <Route index element={<TrainerDashboard />} />
        <Route path="library" element={<ExerciseLibrary />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="students/:studentId/workouts" element={<StudentWorkoutsPage />} />
        <Route path="students/:studentId/progress" element={<StudentProgressPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="profile" element={<TrainerProfilePage />} />
        <Route path="profile/edit" element={<EditProfilePage />} />
        <Route path="profile/privacy" element={<PrivacySecurityPage />} />
        <Route path="profile/help" element={<HelpSupportPage />} />
        <Route path="profile/notifications" element={<NotificationsPage />} />
        <Route path="profile/terms" element={<HelpSupportPage />} />
      </Route>

      <Route path="/student" element={<ProtectedRoute requiredRole="student"><StudentLayout /></ProtectedRoute>}>
        <Route index element={<StudentWorkoutsPageStudent />} />
        <Route path="chat" element={<StudentChatPage />} />
        <Route path="progress" element={<StudentProgressPage />} />
        <Route path="profile" element={<StudentProfilePage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
