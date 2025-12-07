'use client'

import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/contexts/ThemeContext'

export function ThemeToggle() {
  const { theme, toggleTheme, isDark } = useTheme()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all duration-200"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
      <span className="ml-2 hidden sm:inline">
        {isDark ? 'Light' : 'Dark'}
      </span>
    </Button>
  )
}