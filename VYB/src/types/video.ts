export interface VideoPost {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  description?: string;
  hashtags?: string[];
  likes: number;
  comments: number;
  shares: number;
  createdAt: Date;
  duration: number;
  filter?: string;
}

export interface VideoComment {
  id: string;
  videoId: string;
  userId: string;
  username: string;
  userAvatar?: string;
  text: string;
  likes: number;
  createdAt: Date;
}

export interface VideoLike {
  id: string;
  videoId: string;
  userId: string;
  createdAt: Date;
}

export interface VideoShare {
  id: string;
  videoId: string;
  userId: string;
  sharedWith: string;
  createdAt: Date;
} 