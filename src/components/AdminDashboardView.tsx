import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Server, 
  Cpu, 
  Database, 
  Activity, 
  CheckCircle2, 
  Key, 
  RefreshCw, 
  Terminal, 
  Layers, 
  AlertTriangle,
  UserCheck,
  Zap,
  Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SystemStats } from '../types';

export const AdminDashboardView: React.FC = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTestingAi, setIsTestingAi] = useState(false);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch('/api/admin/system-stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const runAiDiagnostic = async () => {
    setIsTestingAi(true);
    setTestResult(null);
    try {
      const start = Date.now();
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: 'Uji koneksi diagnostik administrator NexusAI untuk verifikasi server Gemini 3.8 Flash di Express.',
          format: 'diagnostik_singkat',
        }),
      });
      const data = await res.json();
      const duration = Date.now() - start;

      if (res.ok && data.success) {
        setTestResult(`Respon Berhasil (${duration}ms): "${data.summary.substring(0, 150)}..."`);
      } else {
        setTestResult(`Error (${duration}ms): ${data.error || 'Gagal memproses'}`);
      }
    } catch (err: any) {
      setTestResult(`Koneksi Gagal: ${err?.message}`);
    } finally {
      setIsTestingAi(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin header banner */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-indigo-950/80 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <ShieldCheck className="w-48 h-48 text-emerald-400" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Akun Administrator Terverifikasi: alifia</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Pusat Kendali Administrator
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl leading-relaxed">
              Selamat datang, <strong>{currentUser?.displayName || 'Alifia'}</strong>! Anda memiliki akses penuh ke parameter sistem, integrasi backend Express, status Firestore, dan mesin Gemini AI server-side.
            </p>
          </div>

          <button
            onClick={fetchStats}
            disabled={loadingStats}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-all self-start md:self-auto"
          >
            <RefreshCw className={`w-4 h-4 ${loadingStats ? 'animate-spin' : ''}`} />
            <span>Segarkan Diagnostik</span>
          </button>
        </div>
      </div>

      {/* Admin Key Specs Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Admin Account */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Akun Admin</span>
            <UserCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-white">alifia</div>
          <div className="text-xs text-slate-400 mt-1">
            Status: <span className="text-emerald-400 font-medium">Super Administrator</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-500">
            Password: <code className="text-slate-300 bg-slate-950 px-1 py-0.5 rounded">pasword123456</code>
          </div>
        </div>

        {/* Card 2: Express Backend */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Backend Express</span>
            <Server className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-lg font-bold text-white">api/index.ts</div>
          <div className="text-xs text-slate-400 mt-1">
            Mode: <span className="text-indigo-400 font-medium">Export Default App</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center gap-1">
            <Globe className="w-3 h-3 text-emerald-400" />
            <span>Vercel Serverless Ready</span>
          </div>
        </div>

        {/* Card 3: Gemini Model */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Mesin AI</span>
            <Cpu className="w-5 h-5 text-violet-400" />
          </div>
          <div className="text-lg font-bold text-white">Gemini 3.8 Flash</div>
          <div className="text-xs text-slate-400 mt-1">
            Eksekusi: <span className="text-violet-400 font-medium">Server-Side Only</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-500">
            Zero API key exposure to client
          </div>
        </div>

        {/* Card 4: Firestore Realtime */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Database</span>
            <Database className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-white">Cloud Firestore</div>
          <div className="text-xs text-slate-400 mt-1">
            Struktur: <span className="text-amber-400 font-medium">Per-User Sandboxed</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-500">
            ABAC Rules: Active & Deployed
          </div>
        </div>
      </div>

      {/* Diagnostics and Action Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tool 1: Server-Side Gemini AI Ping & Diagnostic */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <Zap className="w-5 h-5 text-violet-400" />
              <h3 className="font-bold text-sm text-white">Uji Server-Side Gemini API</h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/20 text-violet-300">
              POST /api/ai/summarize
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Menjalankan permintaan diagnostik langsung dari browser ke backend Express Anda di <code>api/index.ts</code>. Backend akan memanggil SDK <code>@google/genai</code> menggunakan model <code>gemini-3.8-flash</code> tanpa mengekspos API key ke client.
          </p>

          <button
            onClick={runAiDiagnostic}
            disabled={isTestingAi}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-600/30 transition-all disabled:opacity-50"
          >
            {isTestingAi ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Memproses Respon Gemini 3.8 Flash...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Jalankan Diagnostik AI Sekarang</span>
              </>
            )}
          </button>

          {testResult && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto">
              <div className="text-[10px] text-slate-500 mb-1">// Hasil Diagnostik:</div>
              {testResult}
            </div>
          )}
        </div>

        {/* Tool 2: Vercel & Deployment Checklist */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-sm text-white">Status Siap Deploy Vercel</h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
              vercel.json Configured
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-medium">Vercel Rewrites Rule</strong>
                <span className="text-slate-400 text-[11px]">
                  <code>vercel.json</code> merewrite pola <code>/api/*</code> langsung ke <code>/api</code>.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-medium">Export Default Express (Tanpa listen)</strong>
                <span className="text-slate-400 text-[11px]">
                  <code>api/index.ts</code> mengekspor <code>export default app</code> untuk kompatibilitas serverless handler Vercel.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-medium">Build Output Directory</strong>
                <span className="text-slate-400 text-[11px]">
                  Output build Vite dikonfigurasi ke folder <code>dist</code> standar siap hosting statis Vercel.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-medium">Firebase Auth & Firestore Rules</strong>
                <span className="text-slate-400 text-[11px]">
                  Database Firestore aktif dengan aturan akses berbasis kepemilikan user dan verifikasi admin Alifia.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
