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

// Use Cases dropdown items
const useCasesItems = [
  { to: '/search', label: 'Find Providers', description: 'Search for healthcare providers' },
  { to: '/map', label: 'Map View', description: 'View providers on a map' },
  { to: '/emergency', label: 'Emergency Services', description: '24/7 emergency care' },
];

// Resources dropdown items
const resourcesItems = [
  { to: '/how', label: 'How It Works', description: 'Learn about our platform' },
  { to: '/why', label: 'Why CityHealth', description: 'Our mission and values' },
  { to: '/contact', label: 'Contact Us', description: 'Get in touch with us' },
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
                  {/* Product */}
                  <NavigationMenuItem>
                    <Link to="/">
                      <NavigationMenuLink 
                        className={cn(
                          "px-4 py-2 text-sm font-medium transition-colors rounded-lg",
                          "hover:bg-antigravity-button-secondary",
                          isScrolled ? "text-antigravity-primary-text" : "text-antigravity-primary-text"
                        )}
                      >
                        Product
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>

                  {/* Use Cases Dropdown */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger 
                      className={cn(
                        "px-4 py-2 text-sm font-medium transition-colors",
                        "hover:bg-antigravity-button-secondary bg-transparent",
                        isScrolled ? "text-antigravity-primary-text" : "text-antigravity-primary-text"
                      )}
                    >
                      Use Cases
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[300px] gap-2 p-4 bg-white rounded-card shadow-soft">
                        {useCasesItems.map((item) => (
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

                  {/* Pricing */}
                  <NavigationMenuItem>
                    <Link to="/providers">
                      <NavigationMenuLink 
                        className={cn(
                          "px-4 py-2 text-sm font-medium transition-colors rounded-lg",
                          "hover:bg-antigravity-button-secondary",
                          isScrolled ? "text-antigravity-primary-text" : "text-antigravity-primary-text"
                        )}
                      >
                        Pricing
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>

                  {/* Blog */}
                  <NavigationMenuItem>
                    <Link to="/why">
                      <NavigationMenuLink 
                        className={cn(
                          "px-4 py-2 text-sm font-medium transition-colors rounded-lg",
                          "hover:bg-antigravity-button-secondary",
                          isScrolled ? "text-antigravity-primary-text" : "text-antigravity-primary-text"
                        )}
                      >
                        Blog
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>

                  {/* Resources Dropdown */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger 
                      className={cn(
                        "px-4 py-2 text-sm font-medium transition-colors",
                        "hover:bg-antigravity-button-secondary bg-transparent",
                        isScrolled ? "text-antigravity-primary-text" : "text-antigravity-primary-text"
                      )}
                    >
                      Resources
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
