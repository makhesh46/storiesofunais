import { Story, User, Comment, Announcement } from '../types';
import { MOCK_STORIES, MOCK_USERS, MOCK_ANNOUNCEMENTS, MOCK_COMMENTS } from './mockData';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// --- Local Storage Implementation (Fallback) ---
const KEYS = {
  STORIES: 'lumina_stories',
  USERS: 'lumina_users',
  COMMENTS: 'lumina_comments',
  ANNOUNCEMENTS: 'lumina_announcements',
  CURRENT_USER: 'lumina_current_user',
  TOKEN: 'lumina_token'
};

// Initialize LocalStorage with mocks if empty
const initLS = () => {
  if (!localStorage.getItem(KEYS.STORIES)) localStorage.setItem(KEYS.STORIES, JSON.stringify(MOCK_STORIES));
  if (!localStorage.getItem(KEYS.USERS)) localStorage.setItem(KEYS.USERS, JSON.stringify(MOCK_USERS));
  if (!localStorage.getItem(KEYS.ANNOUNCEMENTS)) localStorage.setItem(KEYS.ANNOUNCEMENTS, JSON.stringify(MOCK_ANNOUNCEMENTS));
  if (!localStorage.getItem(KEYS.COMMENTS)) localStorage.setItem(KEYS.COMMENTS, JSON.stringify(MOCK_COMMENTS));
};
initLS();

const getLS = <T>(key: string): T[] => JSON.parse(localStorage.getItem(key) || '[]');
const setLS = (key: string, data: any[]) => localStorage.setItem(key, JSON.stringify(data));

// --- Hybrid Client ---

// We use a circuit breaker to stop trying the API if it's down
let isOffline = false;

const request = async <T>(endpoint: string, options: RequestInit = {}, fallback: () => Promise<T> | T): Promise<T> => {
  if (isOffline) {
    return fallback();
  }

  try {
    const token = localStorage.getItem(KEYS.TOKEN);
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: { ...headers, ...options.headers }
    });

    if (!res.ok) {
      // If 4xx/5xx error from server, try to parse message, otherwise throw
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Server error: ${res.status}`);
    }

    return res.json();
  } catch (error: any) {
    // If it's a network error (Failed to fetch), switch to offline mode
    if (error.message === 'Failed to fetch' || error.message.includes('NetworkError')) {
      console.warn(`Backend unreachable (${endpoint}). Switching to Offline Mode.`);
      isOffline = true;
      return fallback();
    }
    throw error;
  }
};

export const DB = {
  stories: {
    getAll: () => request<Story[]>('/stories', {}, () => getLS(KEYS.STORIES)),

    getPublished: () => request<Story[]>('/stories?status=published', {}, () => {
      return getLS<Story>(KEYS.STORIES)
        .filter(s => s.status === 'published')
        .sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime());
    }),

    getById: (id: string) => request<Story | undefined>(`/stories/${id}`, {}, () => {
      return getLS<Story>(KEYS.STORIES).find(s => s.id === id);
    }),

    create: (story: Partial<Story>) => request<Story>('/stories', {
      method: 'POST',
      body: JSON.stringify(story)
    }, () => {
      const stories = getLS<Story>(KEYS.STORIES);
      const newStory: Story = {
        ...story,
        id: `story-${Date.now()}`,
        views: 0,
        likes: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Story;
      setLS(KEYS.STORIES, [newStory, ...stories]);
      return newStory;
    }),

    update: (id: string, updates: Partial<Story>) => request<Story>(`/stories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }, () => {
      const stories = getLS<Story>(KEYS.STORIES);
      const idx = stories.findIndex(s => s.id === id);
      if (idx === -1) throw new Error('Story not found');
      const updated = { ...stories[idx], ...updates, updatedAt: new Date().toISOString() };
      stories[idx] = updated;
      setLS(KEYS.STORIES, stories);
      return updated;
    }),

    delete: (id: string) => request<void>(`/stories/${id}`, {
      method: 'DELETE'
    }, () => {
      const stories = getLS<Story>(KEYS.STORIES);
      setLS(KEYS.STORIES, stories.filter(s => s.id !== id));
    }),

    incrementView: (id: string) => request(`/stories/${id}/view`, { method: 'POST' }, () => {
      const stories = getLS<Story>(KEYS.STORIES);
      const idx = stories.findIndex(s => s.id === id);
      if (idx > -1) {
        stories[idx].views++;
        setLS(KEYS.STORIES, stories);
      }
    }),

    like: (id: string) => request(`/stories/${id}/like`, { method: 'POST' }, () => {
      const stories = getLS<Story>(KEYS.STORIES);
      const idx = stories.findIndex(s => s.id === id);
      if (idx > -1) {
        stories[idx].likes++;
        setLS(KEYS.STORIES, stories);
      }
    })
  },

  comments: {
    getByStoryId: (storyId: string) => request<Comment[]>(`/comments/${storyId}`, {}, () => {
      return getLS<Comment>(KEYS.COMMENTS)
        .filter(c => c.storyId === storyId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }),

    create: (comment: Partial<Comment>) => request<Comment>('/comments', {
      method: 'POST',
      body: JSON.stringify(comment)
    }, () => {
      const comments = getLS<Comment>(KEYS.COMMENTS);
      const newComment = {
        ...comment,
        id: `c-${Date.now()}`,
        createdAt: new Date().toISOString()
      } as Comment;
      setLS(KEYS.COMMENTS, [newComment, ...comments]);
      return newComment;
    }),

    delete: (id: string) => request<void>(`/comments/${id}`, { method: 'DELETE' }, () => {
      const comments = getLS<Comment>(KEYS.COMMENTS);
      setLS(KEYS.COMMENTS, comments.filter(c => c.id !== id));
    })
  },

  announcements: {
    getAll: () => request<Announcement[]>('/announcements', {}, () => getLS(KEYS.ANNOUNCEMENTS)),

    create: (content: string) => request<Announcement>('/announcements', {
      method: 'POST',
      body: JSON.stringify({ content })
    }, () => {
      const anns = getLS<Announcement>(KEYS.ANNOUNCEMENTS);
      const newAnn: Announcement = {
        id: `ann-${Date.now()}`,
        content,
        createdAt: new Date().toISOString(),
        isActive: true
      };
      setLS(KEYS.ANNOUNCEMENTS, [newAnn, ...anns]);
      return newAnn;
    }),

    delete: (id: string) => request<void>(`/announcements/${id}`, { method: 'DELETE' }, () => {
      const anns = getLS<Announcement>(KEYS.ANNOUNCEMENTS);
      setLS(KEYS.ANNOUNCEMENTS, anns.filter(a => a.id !== id));
    })
  },

  auth: {
    login: (email: string, password: string) => request<{ token: string, user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }, async () => {
      // Fallback Auth
      await new Promise(r => setTimeout(r, 500));

      const checkCredentials = (users: User[]) => {
        // Check hardcoded mocks for admin/demo
        if (email === 'storiesofunais@gmail.com' && password === 'storiesofunais@gmail.com') return MOCK_USERS[0];
        if (email === 'reader@lumina.com' && password === 'password') return MOCK_USERS[1];
        // Check dynamic local users
        return users.find(u => u.email === email);
      };

      const user = checkCredentials(getLS<User>(KEYS.USERS));

      if (!user) throw new Error('Invalid credentials');
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
      return { token: 'mock-token', user };
    }).then(res => {
      localStorage.setItem(KEYS.TOKEN, res.token);
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(res.user));
      return res.user;
    }),

    signup: (email: string, password: string, name: string) => request<{ token: string, user: User }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name })
    }, async () => {
      await new Promise(r => setTimeout(r, 500));
      const users = getLS<User>(KEYS.USERS);
      if (users.some(u => u.email === email)) throw new Error('Email already taken');

      const newUser: User = {
        id: `u-${Date.now()}`,
        email,
        name,
        role: 'viewer',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
      };
      setLS(KEYS.USERS, [...users, newUser]);
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(newUser));
      return { token: 'mock-token', user: newUser };
    }).then(res => {
      localStorage.setItem(KEYS.TOKEN, res.token);
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(res.user));
      return res.user;
    }),

    googleLogin: (token: string) => request<{ token: string, user: User }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ token })
    }, async () => {
      // Fallback/Mock for offline development
      await new Promise(r => setTimeout(r, 500));
      const mockUser: User = {
        id: `u-google-${Date.now()}`,
        email: "google-user@example.com",
        name: "Google User",
        role: "viewer",
        avatar: "https://lh3.googleusercontent.com/a/default-user"
      };
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(mockUser));
      return { token: 'mock-google-token', user: mockUser };
    }).then(res => {
      localStorage.setItem(KEYS.TOKEN, res.token);
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(res.user));
      return res.user;
    }),

    logout: async () => {
      localStorage.removeItem(KEYS.TOKEN);
      localStorage.removeItem(KEYS.CURRENT_USER);
    },

    getCurrentUser: (): User | null => {
      const u = localStorage.getItem(KEYS.CURRENT_USER);
      if (!u) return null;
      try {
        const parsed = JSON.parse(u);
        return parsed.user ? parsed.user : parsed;
      } catch {
        return null;
      }
    }
  }
};