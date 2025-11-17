import { useThemeStore } from '../store/themeStore';

export const useThemeClasses = () => {
  const { isDark } = useThemeStore();
  
  return {
    isDark,
    bg: isDark ? 'bg-gray-800' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50',
    bgSolid: isDark ? 'bg-gray-800' : 'bg-white',
    bgAlt: isDark ? 'bg-gray-900' : 'bg-gradient-to-r from-blue-100 to-purple-100',
    text: isDark ? 'text-white' : 'text-gray-800',
    textMuted: isDark ? 'text-gray-400' : 'text-gray-600',
    border: isDark ? 'border-gray-700' : 'border-purple-200',
    hover: isDark ? 'hover:bg-gray-700' : 'hover:bg-purple-50',
    card: isDark ? 'bg-gray-800 border-gray-700' : 'bg-white/80 backdrop-blur-sm border-purple-200',
  };
};
