export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  username?: string;
  role: 'admin' | 'user';
  isAdmin: boolean;
  provider: 'google' | 'admin-credentials';
  token?: string;
}

export interface NoteItem {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: string;
  summary?: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskItem {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  category: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SystemStats {
  status: string;
  serverUptime: number;
  activeEngine: string;
  modelLatency: string;
  features: Array<{ name: string; status: string }>;
  timestamp: string;
}
