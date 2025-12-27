
export interface PPTPage {
  id: string;
  title: string;
  content: string;
  visual?: string; // @deprecated
  visualEnabled?: boolean; // @deprecated
  imageType?: 'flow' | 'logic' | 'illustration' | 'custom';
  type?: string; // e.g., 'cover', 'catalog', 'content', 'ending'
}

export interface ColorScheme {
  name: string;
  primary: string; // Hex
  secondary: string[]; // Hex array
  description?: string; // @deprecated
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
  design?: DesignSystem; // Keeping this for backward compatibility if needed, but we might move to using colorSchemes
  colorSchemes?: ColorScheme[]; // AI suggested schemes
  selectedColorScheme?: ColorScheme; // Currently selected scheme
  pages: PPTPage[];
}

export type GenerationMode = 'detail' | 'slide';
