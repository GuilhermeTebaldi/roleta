import { ThemeConfig, ThemeId } from './types';

export const THEMES: Record<ThemeId, ThemeConfig> = {
  pink: {
    id: 'pink',
    name: 'Rosa Padrão',
    background: 'from-pink-500 via-rose-400 to-pink-600',
    primary: '#ec4899',
    secondary: '#f43f5e',
    accent: '#fb7185',
    text: '#ffffff',
    wheelColors: ['#f472b6', '#fb7185', '#ec4899', '#db2777', '#be185d'],
    particles: ['#fbcfe8', '#f9a8d4', '#f472b6']
  },
  dark: {
    id: 'dark',
    name: 'Dark',
    background: 'from-gray-900 via-slate-800 to-black',
    primary: '#1f2937',
    secondary: '#111827',
    accent: '#374151',
    text: '#f3f4f6',
    wheelColors: ['#1f2937', '#374151', '#4b5563', '#111827', '#030712'],
    particles: ['#4b5563', '#9ca3af', '#d1d5db']
  },
  gold: {
    id: 'gold',
    name: 'Dourado Luxo',
    background: 'from-amber-700 via-yellow-600 to-amber-900',
    primary: '#d97706',
    secondary: '#b45309',
    accent: '#f59e0b',
    text: '#fffbeb',
    wheelColors: ['#d97706', '#b45309', '#92400e', '#78350f', '#f59e0b'],
    particles: ['#fef3c7', '#fde68a', '#fbbf24']
  },
  nature: {
    id: 'nature',
    name: 'Verde Natureza',
    background: 'from-emerald-800 via-green-700 to-teal-900',
    primary: '#059669',
    secondary: '#047857',
    accent: '#10b981',
    text: '#ecfdf5',
    wheelColors: ['#059669', '#047857', '#065f46', '#064e3b', '#10b981'],
    particles: ['#d1fae5', '#a7f3d0', '#6ee7b7']
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    background: 'from-purple-900 via-fuchsia-900 to-blue-900',
    primary: '#d946ef',
    secondary: '#2563eb',
    accent: '#06b6d4',
    text: '#ffffff',
    wheelColors: ['#d946ef', '#2563eb', '#06b6d4', '#8b5cf6', '#ec4899'],
    particles: ['#f5d0fe', '#bfdbfe', '#cffafe']
  },
  retro: {
    id: 'retro',
    name: 'Retro Arcade',
    background: 'from-orange-600 via-red-600 to-yellow-500',
    primary: '#ea580c',
    secondary: '#dc2626',
    accent: '#facc15',
    text: '#ffffff',
    wheelColors: ['#ea580c', '#dc2626', '#facc15', '#22c55e', '#3b82f6'],
    particles: ['#ffedd5', '#fee2e2', '#fef9c3']
  },
  ocean: {
    id: 'ocean',
    name: 'Azul Oceano',
    background: 'from-blue-800 via-cyan-700 to-blue-900',
    primary: '#0284c7',
    secondary: '#0369a1',
    accent: '#0ea5e9',
    text: '#f0f9ff',
    wheelColors: ['#0284c7', '#0369a1', '#075985', '#0c4a6e', '#0ea5e9'],
    particles: ['#e0f2fe', '#bae6fd', '#7dd3fc']
  },
  sunset: {
    id: 'sunset',
    name: 'Pôr do Sol',
    background: 'from-orange-500 via-red-500 to-purple-600',
    primary: '#f97316',
    secondary: '#ef4444',
    accent: '#8b5cf6',
    text: '#ffffff',
    wheelColors: ['#f97316', '#ef4444', '#8b5cf6', '#d946ef', '#f43f5e'],
    particles: ['#ffedd5', '#fee2e2', '#f5f3ff']
  },
  midnight: {
    id: 'midnight',
    name: 'Roxo Meia-noite',
    background: 'from-indigo-950 via-purple-950 to-black',
    primary: '#4338ca',
    secondary: '#581c87',
    accent: '#7c3aed',
    text: '#f5f3ff',
    wheelColors: ['#4338ca', '#581c87', '#3b0764', '#1e1b4b', '#7c3aed'],
    particles: ['#e0e7ff', '#f3e8ff', '#ddd6fe']
  }
};
