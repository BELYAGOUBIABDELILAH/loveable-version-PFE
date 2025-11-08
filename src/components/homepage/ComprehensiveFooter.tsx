import { useState } from 'react';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, ArrowRight, Globe, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/hooks/useLanguage';
import { Link } from 'react-router-dom';

export const ComprehensiveFooter = () => {
  const { t, language, setLanguage } = useLanguage();
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribing(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubscribing(false);
      setEmail('');
      // Show success toast
    }, 1000);
  };

  const footerSections = [
    {
      title: t('footer.about'),
      links: [
        { label: 'About CityHealth', href: '/about' },
        { label: 'Our Mission', href: '/mission' },
        { label: 'Team', href: '/team' },
        { label: 'Careers', href: '/careers' },
        { label: 'Press', href: '/press' }
      ]
    },
    {
      title: t('footer.services'),
      links: [
        { label: 'Find Doctors', href: '/search?type=doctors' },
        { label: 'Book Appointments', href: '/appointments' },
        { label: 'Emergency Services', href: '/emergency' },
        { label: 'Pharmacies', href: '/search?type=pharmacies' },
        { label: 'Health Records', href: '/records' }
      ]
    },
    {
      title: t('footer.support'),
      links: [
        { label: 'Help Center', href: '/help' },
        { label: 'Contact Us', href: '/contact' },
        { label: 'Provider Support', href: '/provider-support' },
        { label: 'Technical Issues', href: '/technical' },
        { label: 'Feedback', href: '/feedback' }
      ]
    },
    {
      title: t('footer.legal'),
      links: [
        { label: t('footer.privacy'), href: '/privacy' },
        { label: t('footer.terms'), href: '/terms' },
        { label: t('footer.cookies'), href: '/cookies' },
        { label: 'Licensing', href: '/licensing' },
        { label: 'Compliance', href: '/compliance' }
      ]
    }
  ];

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/cityhealth', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com/cityhealth', label: 'Twitter' },
    { icon: Instagram, href: 'https://instagram.com/cityhealth', label: 'Instagram' },
    { icon: Linkedin, href: 'https://linkedin.com/company/cityhealth', label: 'LinkedIn' }
  ];

  return (
    <footer className="bg-gradient-to-br from-muted/20 via-background to-primary/5 border-t border-border/50">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-4 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                  <Heart className="text-primary" size={20} />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  CityHealth
                </h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Your trusted healthcare directory in Algeria. Connecting patients with verified healthcare providers since 2024.
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="text-primary" size={16} />
                <span>123 Rue Didouche Mourad, Alger 16000, Algeria</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="text-primary" size={16} />
                <span>+213 21 123 456</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="text-primary" size={16} />
                <span>contact@cityhealth.dz</span>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-3">{t('footer.social')}</p>
              <div className="flex gap-3">
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-primary/10 hover:bg-primary/20 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
                      aria-label={social.label}
                    >
                      <IconComponent className="text-primary" size={18} />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Links Sections */}
          <div className="lg:col-span-6 grid grid-cols-2 md:grid-cols-4 gap-8">
            {footerSections.map((section, index) => (
              <div key={index} className="space-y-4">
                <h4 className="font-semibold text-foreground">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        to={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter Section */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">{t('footer.newsletter')}</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Get health tips and updates delivered to your inbox
              </p>
            </div>

            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <Input
                type="email"
                placeholder={t('footer.newsletter.placeholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background/50 border-primary/20 focus:border-primary"
              />
              <Button 
                type="submit" 
                className="w-full ripple-effect"
                disabled={isSubscribing}
              >
                {isSubscribing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Subscribing...</span>
                  </div>
                ) : (
                  <>
                    {t('footer.newsletter.button')}
                    <ArrowRight className="ml-2" size={16} />
                  </>
                )}
              </Button>
            </form>

            {/* Language Selector */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                <Globe className="inline mr-2" size={14} />
                Language
              </label>
              <Select value={language} onValueChange={(value: 'fr' | 'ar' | 'en') => setLanguage(value)}>
                <SelectTrigger className="bg-background/50 border-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/50 bg-muted/5">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {t('footer.copyright')}
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                {t('footer.privacy')}
              </Link>
              <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                {t('footer.terms')}
              </Link>
              <Link to="/cookies" className="text-muted-foreground hover:text-primary transition-colors">
                {t('footer.cookies')}
              </Link>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {t('footer.made')}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};