export interface PPTPage {
  id: string;
  title: string;
  content: string;
  visual: string;
}

export interface PPTPlan {
  topic: string;
  pages: PPTPage[];
}

export type GenerationMode = 'detail' | 'slide';
