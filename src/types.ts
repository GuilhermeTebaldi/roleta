export type ThemeId = 
  | 'pink' 
  | 'dark' 
  | 'gold' 
  | 'nature' 
  | 'cyberpunk' 
  | 'retro' 
  | 'ocean' 
  | 'sunset' 
  | 'midnight';

export type RouletteStyle = 
  | 'classic' 
  | 'neon' 
  | 'minimalist' 
  | 'crystal' 
  | '3d' 
  | 'solid' 
  | 'gradient';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  background: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  wheelColors: string[];
  particles: string[];
}

export interface Participant {
  id: string;
  name: string;
}
