import { useThemeStore } from '../store/themeStore';

export const useThemeClasses = () => {
  const { isDark } = useThemeStore();
  
  return {
    isDark,
    bg: isDark ? 'bg-gray-800' : 'bg-white',
    bgAlt: isDark ? 'bg-gray-900' : 'bg-gray-50',
    text: isDark ? 'text-white' : 'text-gray-900',
    textMuted: isDark ? 'text-gray-400' : 'text-gray-600',
    border: isDark ? 'border-gray-700' : 'border-gray-200',
    hover: isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50',
    card: isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
  };
};
