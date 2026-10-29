import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  LogOut, 
  FileText, 
  CheckSquare, 
  Bot, 
  ShieldCheck, 
  User, 
  Database,
  Terminal
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'notes' | 'tasks' | 'ai' | 'admin';
  setActiveTab: (tab: 'notes' | 'tasks' | 'ai' | 'admin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-600/20 border border-indigo-400/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">NexusAI</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/30 text-indigo-300">
                  Workspace
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Firestore Realtime</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'notes'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Catatan Pintar</span>
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'tasks'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Tugas & Proyek</span>
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'ai'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-violet-400" />
              <span>Asisten NexusAI</span>
            </button>

            {currentUser?.isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'admin'
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/30'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Panel Admin</span>
              </button>
            )}
          </nav>

          {/* User profile & Logout button */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 bg-slate-950/70 border border-slate-800 rounded-2xl py-1.5 px-3">
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'User'}
                  className="w-7 h-7 rounded-xl object-cover border border-slate-700"
                />
              ) : (
                <div className="w-7 h-7 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 font-semibold text-xs border border-slate-700">
                  {currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>
              )}

              <div className="hidden sm:block text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-200 max-w-[120px] truncate">
                    {currentUser?.displayName || currentUser?.username || 'User'}
                  </span>
                  {currentUser?.isAdmin ? (
                    <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ADMIN
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.2 text-[9px] font-medium rounded bg-slate-800 text-slate-400">
                      MEMBER
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[130px]">
                  {currentUser?.email || (currentUser?.username ? `@${currentUser.username}` : 'Firebase Auth')}
                </div>
              </div>
            </div>

            {/* Logout button (Requested by user) */}
            <button
              type="button"
              onClick={logout}
              title="Keluar dari akun (Logout)"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:text-rose-200 transition-all active:scale-[0.98]"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center justify-between py-2 border-t border-slate-800 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'notes' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Catatan
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'tasks' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            Tugas
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'ai' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-violet-400" />
            Asisten
          </button>
          {currentUser?.isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                activeTab === 'admin' ? 'bg-emerald-600 text-white' : 'text-emerald-400'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
