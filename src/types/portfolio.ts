export type Lang = 'ar' | 'en';
export type WorkSectionId = 'social' | 'content' | 'ugc';
export type FolderId = WorkSectionId | 'about';

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  name?: string;
  link?: string;
}

export interface ProjectItem {
  id: string;
  section: WorkSectionId;
  coverLogo?: string;
  title: {
    ar: string;
    en: string;
  };
  description: {
    ar: string;
    en: string;
  };
  media: MediaItem[];
  createdAt: number;
}
