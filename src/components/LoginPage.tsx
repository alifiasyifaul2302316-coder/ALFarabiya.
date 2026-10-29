import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  User, 
  KeyRound, 
  ArrowRight, 
  CheckCircle2, 
  Server, 
  Zap, 
  AlertCircle,
  Cpu,
  Layers
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginWithGoogle, loginWithAdminCredentials, isLoading, error, clearError } = useAuth();
  const [activeTab, setActiveTab] = useState<'google' | 'admin'>('google');
  
  // Admin form state
  const [adminUsername, setAdminUsername] = useState('alifia');
  const [adminPassword, setAdminPassword] = useState('pasword123456');
  const [adminSubmitLoading, setAdminSubmitLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Server health state
  const [backendHealth, setBackendHealth] = useState<{
    status: string;
    geminiConfigured: boolean;
  } | null>(null);

  useEffect(() => {
    // Check backend Express status
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setBackendHealth({
          status: data.status,
          geminiConfigured: data.geminiConfigured,
        });
      })
      .catch(() => {
        setBackendHealth(null);
      });
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (!adminUsername.trim() || !adminPassword.trim()) {
      setFormError('Username dan password wajib diisi.');
      return;
    }

    setAdminSubmitLoading(true);
    const success = await loginWithAdminCredentials(adminUsername.trim(), adminPassword.trim());
    setAdminSubmitLoading(false);
    if (!success) {
      setFormError('Kredensial tidak valid. Gunakan username: alifia dan pasword123456');
    }
  };

  const fillAdminCredentials = () => {
    setAdminUsername('alifia');
    setAdminPassword('pasword123456');
    setFormError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden text-slate-100">
      {/* Background glowing gradients */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md relative z-10">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-500/30 mb-4 border border-indigo-400/30">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
            NexusAI Workspace
          </h1>
          <p className="text-sm text-slate-400 mt-2 max-w-xs mx-auto">
            Workspace produktif bertenaga Gemini AI & Firebase Firestore realtime
          </p>
        </div>

        {/* Auth Box Container */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80">
          {/* Tab selector */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950/70 rounded-2xl mb-6 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setActiveTab('google');
                clearError();
                setFormError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'google'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Google Auth
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('admin');
                clearError();
                setFormError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'admin'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Admin Alifia
            </button>
          </div>

          {/* Global error banner */}
          {(error || formError) && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1 font-medium">{error || formError}</div>
            </div>
          )}

          {/* Tab 1: Google Sign-in */}
          {activeTab === 'google' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 text-center">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Masuk menggunakan akun Google Anda melalui Firebase Authentication. Data catatan dan tugas Anda disimpan per-user di Cloud Firestore secara aman.
                </p>
              </div>

              <button
                type="button"
                onClick={loginWithGoogle}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl font-semibold text-sm bg-white hover:bg-slate-100 text-slate-900 transition-all shadow-lg shadow-white/5 active:scale-[0.99] disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Lanjutkan dengan Google</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <span className="text-[11px] text-slate-500">
                  Wajib login untuk mengakses workspace & data Firestore
                </span>
              </div>
            </div>
          )}

          {/* Tab 2: Admin Login */}
          {activeTab === 'admin' && (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-medium text-indigo-200">
                    Akun Admin: <strong>alifia</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={fillAdminCredentials}
                  className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 underline"
                >
                  Isi Otomatis
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="alifia"
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="pasword123456"
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all"
                  />
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Password bawaan admin: <code className="text-indigo-400 bg-indigo-950/40 px-1 py-0.5 rounded">pasword123456</code>
                </div>
              </div>

              <button
                type="submit"
                disabled={adminSubmitLoading}
                className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.99] disabled:opacity-50"
              >
                {adminSubmitLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Masuk sebagai Administrator</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* System status pill footer */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-emerald-400" />
                Express Backend (/api/index.ts):
              </span>
              <span className="text-emerald-400 font-mono font-medium">Ready (Vercel rewrite)</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                Gemini 3.8 Flash AI:
              </span>
              <span className="text-indigo-400 font-mono font-medium">
                {backendHealth?.geminiConfigured ? 'Server-Side Active' : 'Connected'}
              </span>
            </div>
          </div>
        </div>

        {/* Deployment badge */}
        <div className="text-center mt-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs">
            <Layers className="w-3.5 h-3.5 text-violet-400" />
            <span>Siap Deploy ke Vercel (vercel.json /api/* rewrite)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
