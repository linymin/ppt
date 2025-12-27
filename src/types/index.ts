
export interface PPTPage {
  id: string;
  title: string;
  content: string;
  visual: string;
  visualEnabled?: boolean;
  type?: string; // e.g., 'cover', 'catalog', 'content', 'ending'
}

export interface DesignSystem {
  style: {
    name: string;
    description: string;
    reason: string;
  };
  colors: {
    primary: { name: string; hex: string };
    secondary: Array<{ name: string; hex: string }>;
    background?: { name: string; hex: string };
  };
  fonts: {
    title: string;
    body: string;
  };
}

export interface PPTPlan {
  topic: string;
  design?: DesignSystem;
  pages: PPTPage[];
}

export type GenerationMode = 'detail' | 'slide';
