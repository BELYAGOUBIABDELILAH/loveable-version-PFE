import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Search, 
  Users, 
  Settings, 
  Phone, 
  MapPin, 
  Heart,
  Menu,
  X,
  Globe,
  Moon,
  Sun
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';

interface MenuItem {
  icon: React.ComponentType<any>;
  label: string;
  href: string;
}

const FloatingSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t, language, setLanguage, isRTL } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const menuItems: MenuItem[] = [
    { icon: Home, label: t('nav.home'), href: '/' },
    { icon: Search, label: t('nav.search'), href: '/search' },
    { icon: Users, label: t('nav.providers'), href: '/providers' },
    { icon: MapPin, label: 'Carte', href: '/map' },
    { icon: Heart, label: 'Favoris', href: '/favorites' },
    { icon: Phone, label: t('nav.contact'), href: '/contact' },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleLanguageChange = (lang: 'fr' | 'ar' | 'en') => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Toggle Button */}
      <Button
        onClick={toggleSidebar}
        className={cn(
          "fixed top-4 z-50 glass-panel rounded-full p-3 transition-all duration-300",
          isRTL ? "right-4" : "left-4",
          isOpen && (isRTL ? "right-80" : "left-80")
        )}
        variant="ghost"
        size="icon"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 h-full w-80 glass-sidebar z-50 transform transition-transform duration-300 ease-out",
          isRTL ? "right-0" : "left-0",
          isOpen ? "translate-x-0" : (isRTL ? "translate-x-full" : "-translate-x-full")
        )}
      >
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8 mt-12">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">CityHealth</h2>
              <p className="text-sm text-muted-foreground">Sidi Bel Abbès</p>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="space-y-2 mb-8">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ripple-effect",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-glow" 
                      : "hover:bg-muted/50 text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Divider */}
          <div className="border-t border-border/50 my-6" />

          {/* Language Selector */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Langue / Language / اللغة
            </h3>
            <div className="space-y-1">
              {[
                { code: 'fr', name: 'Français', flag: '🇫🇷' },
                { code: 'ar', name: 'العربية', flag: '🇩🇿' },
                { code: 'en', name: 'English', flag: '🇬🇧' }
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code as any)}
                  className={cn(
                    "w-full flex items-center gap-3 p-2 rounded-lg transition-colors",
                    language === lang.code 
                      ? "bg-primary/10 text-primary" 
                      : "hover:bg-muted/50"
                  )}
                >
                  <span>{lang.flag}</span>
                  <span className="text-sm">{lang.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Theme Toggle */}
          <Button
            onClick={toggleTheme}
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
          </Button>

          {/* Emergency Button */}
          <div className="mt-6 p-4 glass-card rounded-xl border border-red-200">
            <div className="text-center">
              <Phone className="h-6 w-6 text-red-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-red-600 mb-1">Urgences</p>
              <p className="text-xs text-muted-foreground">Appelez le 15</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FloatingSidebar;