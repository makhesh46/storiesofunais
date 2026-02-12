export type Role = 'admin' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
}

export interface Story {
  id: string;
  title: string;
  excerpt: string;
  content: string; // Markdown or HTML
  coverImage: string;
  authorId: string;
  authorName: string;
  status: 'draft' | 'published';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  likes: number;
  tags: string[];
}

export interface Comment {
  id: string;
  storyId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  content: string;
  createdAt: string;
  isActive: boolean;
}

export interface DailyStat {
  date: string;
  views: number;
}
