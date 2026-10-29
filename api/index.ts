import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Shared Gemini AI instance initialized server-side
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'NexusAI Workspace Express Backend',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(apiKey),
    version: '1.0.0',
  });
});

// Admin credentials authentication endpoint
// Username: alifia | Password: pasword123456
app.post('/api/auth/admin-login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (username === 'alifia' && password === 'pasword123456') {
    return res.json({
      success: true,
      message: 'Login admin berhasil',
      user: {
        uid: 'admin-alifia-primary',
        email: 'alifia.syifaul.2302316@students.um.ac.id',
        displayName: 'Alifia Syifaul',
        username: 'alifia',
        role: 'admin',
        isAdmin: true,
        permissions: ['read_all', 'write_all', 'manage_system', 'ai_high_priority'],
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      },
      token: `admin-token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    });
  }

  return res.status(401).json({
    success: false,
    error: 'Username atau password admin tidak valid. Gunakan username: alifia dan password yang sesuai.',
  });
});

// AI Summarization endpoint (Server-side Gemini 3.8 Flash)
app.post('/api/ai/summarize', async (req: Request, res: Response) => {
  try {
    const { content, format = 'bullet_points' } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Konten teks wajib diisi.' });
    }

    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY belum dikonfigurasi di server environment.',
      });
    }

    const prompt = `Anda adalah asisten AI produktivitas cerdas untuk workspace NexusAI.
Tugas: Buat ringkasan profesional, padat, dan jelas dari catatan/dokumen berikut dalam bahasa Indonesia.
Format yang diminta: ${format}.
Sertakan juga:
1. Poin Inti (Key Takeaways)
2. Saran Tindakan Lanjut (Action Items)

Konten yang diringkas:
"""
${content}
"""`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({
      success: true,
      summary: response.text || 'Tidak ada ringkasan yang dihasilkan.',
    });
  } catch (error: any) {
    console.error('Error generating summary:', error);
    return res.status(500).json({
      error: error?.message || 'Gagal menghasilkan ringkasan dengan Gemini AI.',
    });
  }
});

// AI Smart Task Generator endpoint
app.post('/api/ai/generate-tasks', async (req: Request, res: Response) => {
  try {
    const { goal, context = '' } = req.body;

    if (!goal || typeof goal !== 'string') {
      return res.status(400).json({ error: 'Tujuan (goal) wajib diisi.' });
    }

    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY belum dikonfigurasi di server environment.',
      });
    }

    const prompt = `Anda adalah task management strategist. 
Berdasarkan tujuan proyek pengguna: "${goal}"
Konteks tambahan: "${context}"

Pecah tujuan ini menjadi 3-6 langkah to-do item yang spesifik, terukur, dan berurutan.
Keluarkan output HANYA berupa array JSON dengan struktur persis seperti ini:
[
  {
    "title": "Nama langkah tugas",
    "description": "Deskripsi singkat cara menyelesaikannya",
    "priority": "high" | "medium" | "low",
    "estimatedMinutes": 30,
    "category": "Perencanaan" | "Eksekusi" | "Review" | "Dokumentasi"
  }
]
Jangan sertakan markdown \`\`\`json pembungkus, cukup outputkan teks JSON murni.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    let tasks = [];
    try {
      tasks = JSON.parse(response.text?.trim() || '[]');
    } catch {
      // Fallback parse if json string has wrapped tokens
      const cleaned = (response.text || '').replace(/```json/g, '').replace(/```/g, '').trim();
      tasks = JSON.parse(cleaned);
    }

    return res.json({
      success: true,
      tasks,
    });
  } catch (error: any) {
    console.error('Error generating tasks:', error);
    return res.status(500).json({
      error: error?.message || 'Gagal memecah tugas dengan Gemini AI.',
    });
  }
});

// AI Writing Polish & Expansion
app.post('/api/ai/polish', async (req: Request, res: Response) => {
  try {
    const { text, tone = 'profesional' } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Teks wajib diisi.' });
    }

    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY belum dikonfigurasi di server environment.',
      });
    }

    const prompt = `Tingkatkan, rapikan tata bahasa, perjelas pesan, dan perbaiki susunan teks berikut dengan nada bicara ${tone}.
Pertahankan makna asli namun jadikan lebih elegan, terstruktur, dan enak dibaca.
Berikan teks hasil perbaikan secara langsung.

Teks:
"""
${text}
"""`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({
      success: true,
      polished: response.text || text,
    });
  } catch (error: any) {
    console.error('Error polishing text:', error);
    return res.status(500).json({
      error: error?.message || 'Gagal memperbaiki teks dengan Gemini AI.',
    });
  }
});

// AI Chat & Ideation endpoint
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { message, previousMessages = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Pesan wajib diisi.' });
    }

    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY belum dikonfigurasi di server environment.',
      });
    }

    // Build chat context
    const conversationContents = previousMessages.map((m: any) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }));

    conversationContents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: conversationContents,
      config: {
        systemInstruction: `Anda adalah NexusAI, asisten produktivitas dan perencanaan cerdas untuk pengguna NexusAI Workspace.
Bantu pengguna menyusun ide, menganalisis solusi, menyusun rencana kerja, dan memecahkan masalah dengan ramah, cerdas, terstruktur, dan solutif.
Gunakan bahasa Indonesia yang jelas, modern, dan profesional.`,
      },
    });

    return res.json({
      success: true,
      reply: response.text || 'Maaf, saya tidak dapat merespons saat ini.',
    });
  } catch (error: any) {
    console.error('Error in AI chat:', error);
    return res.status(500).json({
      error: error?.message || 'Gagal memproses percakapan AI.',
    });
  }
});

// Admin stats endpoint
app.get('/api/admin/system-stats', (_req: Request, res: Response) => {
  res.json({
    status: 'operational',
    serverUptime: process.uptime(),
    activeEngine: 'Gemini 3.8 Flash (Server-Side)',
    modelLatency: '320ms avg',
    features: [
      { name: 'Google Firebase Authentication', status: 'Active' },
      { name: 'Firestore Realtime Per-User DB', status: 'Active' },
      { name: 'Server-Side Express on Vercel', status: 'Active' },
      { name: 'Admin Account (alifia)', status: 'Configured' },
    ],
    timestamp: new Date().toISOString(),
  });
});

// Export default app as requested (without app.listen for Vercel Serverless Function compatibility)
export default app;
