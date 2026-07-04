export interface Material {
  id: string;
  title: string;
  subject: string;
  classLevel: string;
  author: string;
  authorId: string;
  description: string;
  type: "pdf" | "word" | "powerpoint" | "video";
  rating: number;
  views: number;
  downloads: number;
  createdAt: string;
  content: string;
  commentsCount: number;
  coverGradient: string;
}

export interface Comment {
  id: string;
  materialId: string;
  author: string;
  authorId: string;
  text: string;
  createdAt: string;
  likes: number;
  likedBy: string[];
  replies: Reply[];
}

export interface Reply {
  id: string;
  author: string;
  authorId: string;
  text: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: "teacher" | "admin";
  favorites: string[];
  createdAt: string;
  subscriptionPlan?: string;
  isPremium?: boolean;
  subscriptionExpires?: string;
}

export interface AdminStats {
  materialsCount: number;
  commentsCount: number;
  usersCount: number;
  totalViews: number;
  totalDownloads: number;
  subjectStats: { name: string; value: number }[];
}
