import { useThemeStore } from '../store/themeStore';

export const useThemeClasses = () => {
  const { isDark } = useThemeStore();
  
  return {
    isDark,
    bg: isDark ? 'bg-gray-900' : 'bg-gray-50',
    bgSolid: isDark ? 'bg-gray-800' : 'bg-white',
    text: isDark ? 'text-white' : 'text-gray-800',
    textMuted: isDark ? 'text-gray-400' : 'text-gray-600',
    border: isDark ? 'border-gray-700' : 'border-gray-200',
    hover: isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100',
  };
};
