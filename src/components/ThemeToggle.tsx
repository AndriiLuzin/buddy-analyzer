import { Moon, Sun, Briefcase, Building2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';

type ThemeOption = 'light' | 'dark' | 'business' | 'business-dark';

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const themes: { value: ThemeOption; icon: typeof Sun; labelKey: string }[] = [
    { value: 'light', icon: Sun, labelKey: 'theme.light' },
    { value: 'dark', icon: Moon, labelKey: 'theme.dark' },
    { value: 'business', icon: Briefcase, labelKey: 'theme.business' },
    { value: 'business-dark', icon: Building2, labelKey: 'theme.business_dark' },
  ];

  const currentTheme = themes.find(t => t.value === theme) || themes[0];
  const CurrentIcon = currentTheme.icon;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleThemeChange = (newTheme: ThemeOption) => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:opacity-70 transition-opacity relative"
      >
        <CurrentIcon className="h-5 w-5 text-muted-foreground" />
        <span className="sr-only">{t('theme.toggle')}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 py-2 w-40 bg-card rounded-xl border border-border shadow-card z-50 animate-fade-in">
          {themes.map((themeOption) => {
            const Icon = themeOption.icon;
            const isActive = theme === themeOption.value;
            return (
              <button
                key={themeOption.value}
                onClick={() => handleThemeChange(themeOption.value)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-foreground hover:bg-secondary'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t(themeOption.labelKey)}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
