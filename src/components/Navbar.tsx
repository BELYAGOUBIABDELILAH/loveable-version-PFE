/**
 * Navbar Component - Google Antigravity Design System
 * Requirements: 20.9, 20.10
 * - Fixed/sticky header with transparent→white scroll transition
 * - Navigation items: Product, Use Cases↓, Pricing, Blog, Resources↓
 * - Black pill "Get Started" CTA button
 * - Logo only (no "CityHealth" text)
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Stethoscope, 
  LogIn, 
  LogOut,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/AuthModal';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

// Services dropdown items (French)
const servicesItems = [
  { to: '/search', label: 'Rechercher', description: 'Trouver un professionnel de santé' },
  { to: '/map', label: 'Carte interactive', description: 'Voir les prestataires sur la carte' },
  { to: '/emergency', label: 'Urgences', description: 'Services d\'urgence 24h/24' },
];

// Professionals dropdown items (French)
const professionalsItems = [
  { to: '/provider/register', label: 'Devenir partenaire', description: 'Rejoignez notre réseau de prestataires' },
  { to: '/provider/dashboard', label: 'Tableau de bord', description: 'Gérez votre profil professionnel' },
];

// Resources dropdown items (French)
const resourcesItems = [
  { to: '/why', label: 'Pourquoi CityHealth', description: 'Notre mission et nos valeurs' },
  { to: '/how', label: 'Comment ça marche', description: 'Guide d\'utilisation de la plateforme' },
  { to: '/contact', label: 'Contact', description: 'Nous contacter' },
];

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();

  // Handle scroll effect for transparent→white transition
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleOpenAuthModal = () => {
    setIsAuthModalOpen(true);
  };

  return (
    <>
      <header 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled 
            ? "bg-white shadow-soft" 
            : "bg-transparent"
        )}
        data-scrolled={isScrolled}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo only - no text per Requirements 20.10 */}
            <Link to="/" className="flex items-center">
              <Stethoscope 
                size={32} 
                className={cn(
                  "transition-colors duration-300",
                  isScrolled ? "text-antigravity-accent" : "text-antigravity-accent"
                )} 
              />
            </Link>

            {/* Navigation Items */}
            <div className="hidden md:flex items-center space-x-1">
              <NavigationMenu>
                <NavigationMenuList>
                  {/* Accueil */}
                  <NavigationMenuItem>
                    <Link to="/">
                      <NavigationMenuLink 
                        className={cn(
                          "px-4 py-2 text-sm font-medium transition-colors rounded-lg",
                          "hover:bg-antigravity-button-secondary",
                          isScrolled ? "text-antigravity-primary-text" : "text-antigravity-primary-text"
                        )}
                      >
                        Accueil
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>

                  {/* Services Dropdown */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger 
                      className={cn(
                        "px-4 py-2 text-sm font-medium transition-colors",
                        "hover:bg-antigravity-button-secondary bg-transparent",
                        isScrolled ? "text-antigravity-primary-text" : "text-antigravity-primary-text"
                      )}
                    >
                      Services
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[300px] gap-2 p-4 bg-white rounded-card shadow-soft">
                        {servicesItems.map((item) => (
                          <li key={item.to}>
                            <Link
                              to={item.to}
                              className="block p-3 rounded-lg hover:bg-antigravity-button-secondary transition-colors"
                            >
                              <div className="text-sm font-medium text-antigravity-primary-text">
                                {item.label}
                              </div>
                              <div className="text-xs text-antigravity-secondary-text mt-1">
                                {item.description}
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  {/* Professionnels Dropdown */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger 
                      className={cn(
                        "px-4 py-2 text-sm font-medium transition-colors",
                        "hover:bg-antigravity-button-secondary bg-transparent",
                        isScrolled ? "text-antigravity-primary-text" : "text-antigravity-primary-text"
                      )}
                    >
                      Professionnels
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[300px] gap-2 p-4 bg-white rounded-card shadow-soft">
                        {professionalsItems.map((item) => (
                          <li key={item.to}>
                            <Link
                              to={item.to}
                              className="block p-3 rounded-lg hover:bg-antigravity-button-secondary transition-colors"
                            >
                              <div className="text-sm font-medium text-antigravity-primary-text">
                                {item.label}
                              </div>
                              <div className="text-xs text-antigravity-secondary-text mt-1">
                                {item.description}
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  {/* Ressources Dropdown */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger 
                      className={cn(
                        "px-4 py-2 text-sm font-medium transition-colors",
                        "hover:bg-antigravity-button-secondary bg-transparent",
                        isScrolled ? "text-antigravity-primary-text" : "text-antigravity-primary-text"
                      )}
                    >
                      Ressources
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[300px] gap-2 p-4 bg-white rounded-card shadow-soft">
                        {resourcesItems.map((item) => (
                          <li key={item.to}>
                            <Link
                              to={item.to}
                              className="block p-3 rounded-lg hover:bg-antigravity-button-secondary transition-colors"
                            >
                              <div className="text-sm font-medium text-antigravity-primary-text">
                                {item.label}
                              </div>
                              <div className="text-xs text-antigravity-secondary-text mt-1">
                                {item.description}
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            {/* Right side - Auth buttons */}
            <div className="flex items-center space-x-3">
              {isAuthenticated ? (
                <>
                  <Link to="/profile">
                    <Button 
                      variant="ghost" 
                      className="text-antigravity-secondary-text hover:text-antigravity-primary-text"
                    >
                      Profile
                    </Button>
                  </Link>
                  <Button
                    onClick={logout}
                    variant="ghost"
                    className="text-antigravity-secondary-text hover:text-antigravity-primary-text"
                  >
                    <LogOut size={18} className="mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleOpenAuthModal}
                    variant="ghost"
                    className="text-antigravity-secondary-text hover:text-antigravity-primary-text"
                  >
                    <LogIn size={18} className="mr-2" />
                    Sign In
                  </Button>
                  {/* Black pill "Get Started" CTA button per Requirements 20.10 */}
                  <Button
                    onClick={handleOpenAuthModal}
                    className="bg-antigravity-button-primary text-white rounded-pill px-6 py-2 font-medium shadow-soft hover:opacity-90 transition-opacity"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </nav>
      </header>
      
      {/* Spacer to prevent content from going under fixed header */}
      <div className="h-16" />
      
      <AuthModal open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
    </>
  );
};

export default Navbar;
