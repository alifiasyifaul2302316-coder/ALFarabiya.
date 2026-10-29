import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  Trash2, 
  RefreshCw, 
  Lightbulb, 
  CheckCircle,
  Copy
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const AiAssistantView: React.FC = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: `Halo ${currentUser?.displayName || 'Sahabat'}! Saya NexusAI, asisten produktivitas cerdas Anda yang ditenagai oleh Gemini 3.8 Flash di server Express. Apa yang ingin kita kerjakan hari ini? Anda dapat meminta saya menyusun ide, menganalisis rencana, atau membuat draf tulisan.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const quickPrompts = [
    'Susun rencana kerja prioritas untuk minggu ini',
    'Bantu buat draf ide inovatif untuk riset & teknologi',
    'Buat ringkasan template laporan progres proyek',
    'Bagaimana cara mengoptimalkan alur kerja harian?',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isSending) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsSending(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          previousMessages: messages.slice(-6).map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Gagal memproses pesan AI');
      }

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error: any) {
      console.error('AI chat error:', error);
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: `Terjadi kendala saat menghubungi server Gemini: ${error?.message || 'Silakan coba lagi.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'ai',
        text: 'Percakapan telah direset. Ada hal lain yang bisa saya bantu hari ini?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] min-h-[500px] bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-6 py-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-600/30 border border-violet-500/40 flex items-center justify-center">
            <Bot className="w-5 h-5 text-violet-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">NexusAI Copilot</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-mono">
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Asisten cerdas perencana tugas, riset, dan produktivitas</p>
          </div>
        </div>

        <button
          onClick={clearChat}
          title="Bersihkan Percakapan"
          className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all text-xs flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset Chat</span>
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-semibold ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-violet-950/80 border border-violet-600/40 text-violet-300 shadow-md shadow-violet-900/30'
              }`}
            >
              {msg.sender === 'user' ? (
                currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : <User className="w-4 h-4" />
              ) : (
                <Sparkles className="w-4 h-4 text-violet-400" />
              )}
            </div>

            {/* Bubble */}
            <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
              msg.sender === 'user'
                ? 'bg-indigo-600 text-white rounded-tr-none'
                : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
            }`}>
              <div className="whitespace-pre-line font-sans">{msg.text}</div>
              
              <div className={`flex items-center gap-2 mt-2 pt-1 text-[10px] ${
                msg.sender === 'user' ? 'text-indigo-200 justify-end' : 'text-slate-500 justify-between'
              }`}>
                <span>{msg.timestamp}</span>
                {msg.sender === 'ai' && (
                  <button
                    onClick={() => handleCopy(msg.id, msg.text)}
                    className="hover:text-slate-300 flex items-center gap-1 transition-all"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Salin</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {isSending && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-violet-950/80 border border-violet-600/40 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-violet-400 animate-spin" />
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl rounded-tl-none p-4 text-xs text-slate-400 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-violet-500 animate-ping" />
              <span>NexusAI sedang memproses jawaban via Gemini 3.8 Flash server-side...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested prompts */}
      <div className="px-4 py-2 bg-slate-950/40 border-t border-slate-800/60 overflow-x-auto flex items-center gap-2">
        <span className="text-[10px] text-slate-500 uppercase font-mono flex items-center gap-1 shrink-0">
          <Lightbulb className="w-3 h-3 text-amber-400" /> Saran:
        </span>
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt)}
            className="text-[11px] text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg px-2.5 py-1 whitespace-nowrap transition-all shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input box */}
      <div className="p-3 bg-slate-950/80 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Tanyakan ide, minta draf dokumen, atau analisis tugas..."
            className="flex-1 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none"
          />
          <button
            type="submit"
            disabled={isSending || !inputMessage.trim()}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-600/30 disabled:opacity-40 transition-all active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
