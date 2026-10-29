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
import { NoteItem } from '../types';
import { 
  Plus, 
  Search, 
  Sparkles, 
  Pin, 
  Trash2, 
  Tag, 
  FileEdit, 
  Bot, 
  Check, 
  X, 
  Clock, 
  Wand2,
  FolderOpen
} from 'lucide-react';

export const NotesView: React.FC = () => {
  const { currentUser } = useAuth();
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [isAiSummarizing, setIsAiSummarizing] = useState<string | null>(null);
  const [isAiPolishing, setIsAiPolishing] = useState(false);
  
  // New note form
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Pekerjaan');

  const categories = ['Semua', 'Pekerjaan', 'Riset', 'Ide', 'Pribadi', 'Teknologi'];

  // Firestore real-time listener for user notes
  useEffect(() => {
    if (!currentUser?.uid) return;

    const notesPath = `users/${currentUser.uid}/notes`;
    const notesCol = collection(db, 'users', currentUser.uid, 'notes');
    const q = query(notesCol, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedNotes: NoteItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          fetchedNotes.push({
            id: docSnap.id,
            userId: currentUser.uid,
            title: data.title || 'Tanpa Judul',
            content: data.content || '',
            category: data.category || 'Umum',
            summary: data.summary,
            isPinned: Boolean(data.isPinned),
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
          });
        });
        setNotes(fetchedNotes);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, notesPath);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid]);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.uid || !newTitle.trim()) return;

    const notesPath = `users/${currentUser.uid}/notes`;
    try {
      await addDoc(collection(db, 'users', currentUser.uid, 'notes'), {
        userId: currentUser.uid,
        title: newTitle.trim(),
        content: newContent.trim(),
        category: newCategory,
        isPinned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      setNewTitle('');
      setNewContent('');
      setNewCategory('Pekerjaan');
      setIsCreating(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, notesPath);
    }
  };

  const handleTogglePin = async (note: NoteItem) => {
    if (!currentUser?.uid) return;
    const notePath = `users/${currentUser.uid}/notes/${note.id}`;
    try {
      const noteRef = doc(db, 'users', currentUser.uid, 'notes', note.id);
      await updateDoc(noteRef, {
        isPinned: !note.isPinned,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, notePath);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!currentUser?.uid) return;
    const notePath = `users/${currentUser.uid}/notes/${noteId}`;
    try {
      const noteRef = doc(db, 'users', currentUser.uid, 'notes', noteId);
      await deleteDoc(noteRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, notePath);
    }
  };

  // Generate AI Summary using server-side Gemini 3.8 Flash
  const handleGenerateSummary = async (note: NoteItem) => {
    if (!currentUser?.uid || !note.content) return;
    setIsAiSummarizing(note.id);

    try {
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `${note.title}\n\n${note.content}`,
          format: 'ringkas_dan_action_item',
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Gagal memproses ringkasan AI');
      }

      // Update Firestore document with AI summary
      const noteRef = doc(db, 'users', currentUser.uid, 'notes', note.id);
      await updateDoc(noteRef, {
        summary: data.summary,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error in AI summarize:', error);
      alert('Gagal menghasilkan ringkasan AI: ' + (error instanceof Error ? error.message : 'Error server'));
    } finally {
      setIsAiSummarizing(null);
    }
  };

  // Polish note content in editor using server-side Gemini 3.8 Flash
  const handlePolishDraft = async () => {
    if (!newContent.trim()) return;
    setIsAiPolishing(true);

    try {
      const response = await fetch('/api/ai/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: newContent,
          tone: 'profesional, rapi, dan terstruktur',
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setNewContent(data.polished);
      }
    } catch (err) {
      console.error('AI polish error:', err);
    } finally {
      setIsAiPolishing(false);
    }
  };

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.summary && n.summary.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      selectedCategory === 'all' || selectedCategory === 'Semua' || n.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort pinned first
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Catatan & Ide Pintar</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
              {notes.length} item
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Tersimpan aman di Firestore per akun Anda dengan fitur ringkasan cerdas Gemini AI
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Catatan Baru</span>
        </button>
      </div>

      {/* Filter and search bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari catatan, ide, atau ringkasan AI..."
            className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === 'Semua' ? 'all' : cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                (selectedCategory === 'all' && cat === 'Semua') || selectedCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-950/40 hover:bg-slate-800/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Create note modal / expandable card */}
      {isCreating && (
        <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-5 shadow-2xl relative animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <span className="text-sm font-semibold text-white flex items-center gap-2">
              <FileEdit className="w-4 h-4 text-indigo-400" />
              Tulis Catatan / Dokumen Baru
            </span>
            <button
              onClick={() => setIsCreating(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleCreateNote} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Judul catatan atau ide..."
                  required
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none"
                />
              </div>
              <div>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-300 outline-none"
                >
                  <option value="Pekerjaan">Kategori: Pekerjaan</option>
                  <option value="Riset">Kategori: Riset</option>
                  <option value="Ide">Kategori: Ide</option>
                  <option value="Pribadi">Kategori: Pribadi</option>
                  <option value="Teknologi">Kategori: Teknologi</option>
                </select>
              </div>
            </div>

            <div className="relative">
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={5}
                placeholder="Tuliskan isi catatan, poin pertemuan, ide riset, atau draf dokumen..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3.5 text-sm text-slate-200 placeholder-slate-500 outline-none font-sans"
              />
              <button
                type="button"
                onClick={handlePolishDraft}
                disabled={isAiPolishing || !newContent.trim()}
                title="Perbaiki & Rapikan Tulisan dengan Gemini AI"
                className="absolute right-3 bottom-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-[11px] font-medium text-indigo-200 transition-all disabled:opacity-30"
              >
                <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>{isAiPolishing ? 'Merapikan...' : 'Rapikan dg AI'}</span>
              </button>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
              >
                Simpan ke Firestore
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notes list / Grid */}
      {sortedNotes.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800">
          <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">Belum Ada Catatan</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Mulai tulis catatan atau ide Anda. Anda dapat merangkum dan mengekstrak action items menggunakan server-side Gemini AI.
          </p>
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30"
          >
            + Buat Catatan Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedNotes.map((note) => (
            <div
              key={note.id}
              className={`flex flex-col justify-between bg-slate-900/80 backdrop-blur-sm border rounded-2xl p-5 transition-all hover:border-slate-700 shadow-lg ${
                note.isPinned
                  ? 'border-indigo-500/40 bg-indigo-950/10'
                  : 'border-slate-800'
              }`}
            >
              <div>
                {/* Header card */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60">
                      {note.category}
                    </span>
                    {note.isPinned && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                        <Pin className="w-2.5 h-2.5" /> Disematkan
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleTogglePin(note)}
                      title={note.isPinned ? 'Lepas Sematan' : 'Sematkan Catatan'}
                      className={`p-1.5 rounded-lg transition-all ${
                        note.isPinned
                          ? 'text-indigo-400 bg-indigo-950/60'
                          : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      title="Hapus Catatan"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Title & Body */}
                <h3 className="font-semibold text-white text-base mb-2 line-clamp-2">
                  {note.title}
                </h3>
                <p className="text-xs text-slate-300/90 whitespace-pre-line line-clamp-4 leading-relaxed font-sans">
                  {note.content}
                </p>

                {/* AI Summary Section if generated */}
                {note.summary && (
                  <div className="mt-4 p-3 rounded-xl bg-violet-950/30 border border-violet-800/40 text-xs">
                    <div className="flex items-center gap-1.5 text-violet-300 font-semibold mb-1 text-[11px]">
                      <Sparkles className="w-3 h-3 text-violet-400" />
                      <span>Ringkasan Cerdas Gemini AI:</span>
                    </div>
                    <div className="text-violet-200/90 text-[11px] whitespace-pre-line leading-relaxed">
                      {note.summary}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(note.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>

                <button
                  onClick={() => handleGenerateSummary(note)}
                  disabled={isAiSummarizing === note.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-[11px] font-medium text-indigo-300 transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span>
                    {isAiSummarizing === note.id
                      ? 'Merangkum...'
                      : note.summary
                      ? 'Perbarui Ringkasan'
                      : 'Ringkas dg AI'}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
