import { useState } from 'react';
import { Moon, Sun, Menu, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { NotificationCenter } from '@/components/NotificationCenter';

export const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const languageLabels = {
    fr: { flag: '🇫🇷', label: 'Français' },
    ar: { flag: '🇩🇿', label: 'العربية' },
    en: { flag: '🇬🇧', label: 'English' },
  };

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/search', label: 'Prestataires' },
    { to: '/emergency', label: t('nav.emergency') },
    { to: '/contact', label: t('nav.contact') },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          aria-label="CityHealth Home"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm">CH</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            CityHealth
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6" role="navigation" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link 
              key={link.to}
              to={link.to} 
              className="text-foreground/80 hover:text-primary transition-colors font-medium"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="hover:bg-accent"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </Button>

          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:bg-accent"
                aria-label="Select language"
              >
                <span className="text-lg">{languageLabels[language].flag}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover/95 backdrop-blur-lg border-border/50 z-50">
              {Object.entries(languageLabels).map(([lang, { flag, label }]) => (
                <DropdownMenuItem
                  key={lang}
                  onClick={() => setLanguage(lang as 'fr' | 'ar' | 'en')}
                  className="cursor-pointer"
                >
                  <span className="mr-2 text-lg">{flag}</span>
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notification Center */}
          <div className="hidden md:block">
            <NotificationCenter />
          </div>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="sm">
              {t('nav.signin')}
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
              Inscription
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden"
                aria-label="Open mobile menu"
              >
                <Menu size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-background/95 backdrop-blur-lg">
              <nav className="flex flex-col gap-4 mt-8" role="navigation" aria-label="Mobile navigation">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium text-foreground/80 hover:text-primary transition-colors py-2 px-4 rounded-lg hover:bg-accent/50"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="border-t border-border/40 pt-4 mt-4 space-y-3">
                  <Button variant="outline" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                    {t('nav.signin')}
                  </Button>
                  <Button className="w-full bg-gradient-to-r from-primary to-accent" onClick={() => setMobileMenuOpen(false)}>
                    Inscription
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
