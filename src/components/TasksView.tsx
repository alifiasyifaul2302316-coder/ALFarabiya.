import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { TaskItem } from '../types';
import { 
  Plus, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Sparkles, 
  Trash2, 
  AlertCircle, 
  Check, 
  Layers, 
  ListTodo,
  Calendar,
  Zap,
  ArrowRight
} from 'lucide-react';

export const TasksView: React.FC = () => {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'todo' | 'in_progress' | 'completed'>('all');
  
  // Manual task addition
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Utama');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isAddingManual, setIsAddingManual] = useState(false);

  // AI Task Generator
  const [aiGoal, setAiGoal] = useState('');
  const [isGeneratingAiTasks, setIsGeneratingAiTasks] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Real-time listener for tasks
  useEffect(() => {
    if (!currentUser?.uid) return;

    const tasksPath = `users/${currentUser.uid}/tasks`;
    const tasksCol = collection(db, 'users', currentUser.uid, 'tasks');
    const q = query(tasksCol, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedTasks: TaskItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          fetchedTasks.push({
            id: docSnap.id,
            userId: currentUser.uid,
            title: data.title || 'Tugas Baru',
            description: data.description || '',
            status: data.status || 'todo',
            priority: data.priority || 'medium',
            category: data.category || 'Umum',
            dueDate: data.dueDate,
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
          });
        });
        setTasks(fetchedTasks);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, tasksPath);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid]);

  const handleCreateManualTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.uid || !newTitle.trim()) return;

    const tasksPath = `users/${currentUser.uid}/tasks`;
    try {
      await addDoc(collection(db, 'users', currentUser.uid, 'tasks'), {
        userId: currentUser.uid,
        title: newTitle.trim(),
        description: '',
        status: 'todo',
        priority: newPriority,
        category: newCategory,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      setNewTitle('');
      setIsAddingManual(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, tasksPath);
    }
  };

  const handleToggleStatus = async (task: TaskItem) => {
    if (!currentUser?.uid) return;
    const taskPath = `users/${currentUser.uid}/tasks/${task.id}`;
    
    let nextStatus: 'todo' | 'in_progress' | 'completed' = 'in_progress';
    if (task.status === 'todo') nextStatus = 'in_progress';
    else if (task.status === 'in_progress') nextStatus = 'completed';
    else nextStatus = 'todo';

    try {
      const taskRef = doc(db, 'users', currentUser.uid, 'tasks', task.id);
      await updateDoc(taskRef, {
        status: nextStatus,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, taskPath);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!currentUser?.uid) return;
    const taskPath = `users/${currentUser.uid}/tasks/${taskId}`;
    try {
      const taskRef = doc(db, 'users', currentUser.uid, 'tasks', taskId);
      await deleteDoc(taskRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, taskPath);
    }
  };

  // AI Task Breakdown via Server-Side Gemini 3.8 Flash
  const handleGenerateAiBreakdown = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.uid || !aiGoal.trim()) return;

    setIsGeneratingAiTasks(true);
    setAiError(null);

    try {
      const response = await fetch('/api/ai/generate-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: aiGoal.trim() }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Gagal memecah tugas dengan Gemini AI');
      }

      const generatedTasks = Array.isArray(data.tasks) ? data.tasks : [];

      // Save each generated task to user's Firestore collection
      const tasksCol = collection(db, 'users', currentUser.uid, 'tasks');
      for (const item of generatedTasks) {
        await addDoc(tasksCol, {
          userId: currentUser.uid,
          title: item.title,
          description: `${item.description || ''} (Estimasi: ${item.estimatedMinutes || 30} menit)`,
          status: 'todo',
          priority: item.priority || 'medium',
          category: item.category || 'AI Generated',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      setAiGoal('');
      setShowAiModal(false);
    } catch (error: any) {
      console.error('Error generating AI tasks:', error);
      setAiError(error?.message || 'Gagal membuat tugas.');
    } finally {
      setIsGeneratingAiTasks(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filterStatus === 'all') return true;
    return t.status === filterStatus;
  });

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top summary card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Per-User Firestore Data
          </span>
          <h2 className="text-xl font-bold text-white mt-1">Daftar Tugas & Langkah Proyek</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-md">
            Pecah tujuan besar menjadi langkah-langkah praktis secara manual atau gunakan AI Task Strategist
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{completedCount} / {tasks.length}</div>
            <div className="text-[11px] text-slate-400">Tugas Selesai ({progressPercent}%)</div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center p-2">
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons & Filter bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status filters */}
        <div className="flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filterStatus === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Semua ({tasks.length})
          </button>
          <button
            onClick={() => setFilterStatus('todo')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filterStatus === 'todo' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            To-Do ({tasks.filter((t) => t.status === 'todo').length})
          </button>
          <button
            onClick={() => setFilterStatus('in_progress')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filterStatus === 'in_progress' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sedang Dikerjakan ({tasks.filter((t) => t.status === 'in_progress').length})
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filterStatus === 'completed' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Selesai ({completedCount})
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAiModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/40 text-violet-300 transition-all active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Pecah Tujuan dg AI</span>
          </button>

          <button
            onClick={() => setIsAddingManual(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Tugas</span>
          </button>
        </div>
      </div>

      {/* Manual Task Creator Input */}
      {isAddingManual && (
        <form onSubmit={handleCreateManualTask} className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200">Tambah Tugas Manual Baru</span>
            <button 
              type="button" 
              onClick={() => setIsAddingManual(false)} 
              className="text-xs text-slate-500 hover:text-slate-300"
            >
              Batal
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Apa yang perlu diselesaikan?..."
              required
              className="sm:col-span-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
            />
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Kategori (cth: Kuliah, Project)"
              className="bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
            />
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none"
            >
              <option value="low">Prioritas: Rendah</option>
              <option value="medium">Prioritas: Sedang</option>
              <option value="high">Prioritas: Tinggi</option>
            </select>
          </div>
          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow"
            >
              Simpan Tugas
            </button>
          </div>
        </form>
      )}

      {/* AI Task Generator Modal */}
      {showAiModal && (
        <div className="bg-slate-900 border border-violet-500/40 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-violet-600/30 flex items-center justify-center border border-violet-500/40">
                <Sparkles className="w-4 h-4 text-violet-300" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Gemini AI Task Strategist</h3>
                <p className="text-[11px] text-slate-400">Pecah sasaran atau proyek Anda menjadi beberapa langkah terstruktur</p>
              </div>
            </div>
            <button
              onClick={() => setShowAiModal(false)}
              className="text-slate-400 hover:text-white text-xs"
            >
              Tutup
            </button>
          </div>

          {aiError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              {aiError}
            </div>
          )}

          <form onSubmit={handleGenerateAiBreakdown} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Tuliskan Sasaran / Goal yang Ingin Diselesaikan:
              </label>
              <input
                type="text"
                value={aiGoal}
                onChange={(e) => setAiGoal(e.target.value)}
                placeholder="Contoh: Menyiapkan laporan akhir dan presentasi hasil penelitian bab 1-5"
                required
                className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500">
                AI akan membuat 3-6 to-do item berurutan langsung ke Firestore Anda
              </span>
              <button
                type="submit"
                disabled={isGeneratingAiTasks || !aiGoal.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-600/30 disabled:opacity-50"
              >
                {isGeneratingAiTasks ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Generate Langkah Kerja</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800">
          <ListTodo className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">Belum Ada Tugas pada Filter Ini</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Tambahkan tugas baru atau gunakan AI Breakdown untuk memecah proyek besar Anda.
          </p>
          <button
            onClick={() => setIsAddingManual(true)}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30"
          >
            + Buat Tugas Manual
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-start justify-between gap-3 p-4 rounded-2xl border transition-all ${
                task.status === 'completed'
                  ? 'bg-slate-900/30 border-slate-800/60 opacity-60'
                  : task.status === 'in_progress'
                  ? 'bg-slate-900/80 border-indigo-500/40 shadow-sm'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Checkbox status button */}
              <button
                onClick={() => handleToggleStatus(task)}
                className="mt-0.5 shrink-0 transition-transform active:scale-90"
                title={`Status: ${task.status} (Klik untuk ganti)`}
              >
                {task.status === 'completed' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : task.status === 'in_progress' ? (
                  <div className="w-5 h-5 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-500 hover:text-slate-300" />
                )}
              </button>

              {/* Task Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`font-semibold text-sm ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-white'}`}>
                    {task.title}
                  </span>

                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {task.category}
                  </span>

                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                      task.priority === 'high'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : task.priority === 'medium'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}
                  >
                    {task.priority === 'high' ? 'Tinggi' : task.priority === 'medium' ? 'Sedang' : 'Rendah'}
                  </span>
                </div>

                {task.description && (
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {task.description}
                  </p>
                )}

                <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(task.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                  <span className="capitalize">Status: {task.status.replace('_', ' ')}</span>
                </div>
              </div>

              {/* Delete button */}
              <button
                onClick={() => handleDeleteTask(task.id)}
                title="Hapus Tugas"
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-all shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
