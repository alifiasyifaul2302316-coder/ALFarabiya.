import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './components/LoginPage';
import { Navbar } from './components/Navbar';
import { NotesView } from './components/NotesView';
import { TasksView } from './components/TasksView';
import { AiAssistantView } from './components/AiAssistantView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { testFirestoreConnection } from './lib/firebase';
import { Sparkles, Layers, ShieldCheck } from 'lucide-react';

const WorkspaceContent: React.FC = () => {
  const { currentUser, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'notes' | 'tasks' | 'ai' | 'admin'>('notes');

  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-xl shadow-indigo-600/30 animate-pulse border border-indigo-400/30 mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <div className="text-base font-bold text-white tracking-tight">NexusAI Workspace</div>
        <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
          <span>Memuat sesi autentikasi...</span>
        </div>
      </div>
    );
  }

  // Wajib Login: If user is not authenticated, show LoginPage
  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar with active tab navigation and logout button */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'notes' && <NotesView />}
        {activeTab === 'tasks' && <TasksView />}
        {activeTab === 'ai' && <AiAssistantView />}
        {activeTab === 'admin' && currentUser.isAdmin && <AdminDashboardView />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">NexusAI Workspace</span>
            <span>•</span>
            <span>Firebase Auth & Firestore Realtime</span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
              Express /api/index.ts (Vercel Ready)
            </span>
            <span className="px-2 py-0.5 rounded bg-violet-950/40 border border-violet-800/40 text-violet-400">
              Gemini 3.8 Flash Server-Side
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <WorkspaceContent />
    </AuthProvider>
  );
}
