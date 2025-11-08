import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const ModernFooter = () => {
  const { language, setLanguage, t } = useLanguage();

  const languageLabels = {
    fr: { flag: '🇫🇷', label: 'Français' },
    ar: { flag: '🇩🇿', label: 'العربية' },
    en: { flag: '🇬🇧', label: 'English' },
  };

  const contactInfo = {
    address: 'Sidi Bel Abbès, Algérie',
    phone: '+213 555 123 456',
    email: 'contact@cityhealth.dz',
  };

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/cityhealth', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com/cityhealth', label: 'Twitter' },
    { icon: Instagram, href: 'https://instagram.com/cityhealth', label: 'Instagram' },
    { icon: Linkedin, href: 'https://linkedin.com/company/cityhealth', label: 'LinkedIn' },
  ];

  const footerLinks = {
    quickLinks: [
      { label: t('footer.contact'), path: '/contact' },
      { label: t('footer.terms'), path: '/terms' },
      { label: t('footer.privacy'), path: '/privacy' },
    ]
  };

  return (
    <footer className="bg-secondary/20 border-t border-border/40 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand & Contact */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">CH</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                CityHealth
              </span>
            </Link>
            <p className="text-muted-foreground mb-4 text-sm">
              Votre plateforme de santé locale à Sidi Bel Abbès
            </p>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin size={16} />
                <span>{contactInfo.address}</span>
              </div>
              <a 
                href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Phone size={16} />
                <span>{contactInfo.phone}</span>
              </a>
              <a 
                href={`mailto:${contactInfo.email}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail size={16} />
                <span>{contactInfo.email}</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social & Language */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.social')}</h3>
            <div className="flex gap-3 mb-6">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                >
                  <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary">
                    <Icon size={18} />
                  </Button>
                </a>
              ))}
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Langue</h4>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="hover:bg-primary/10">
                    <span className="mr-2">{languageLabels[language].flag}</span>
                    {languageLabels[language].label}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover/95 backdrop-blur-lg border-border/50">
                  {Object.entries(languageLabels).map(([lang, { flag, label }]) => (
                    <DropdownMenuItem
                      key={lang}
                      onClick={() => setLanguage(lang as 'fr' | 'ar' | 'en')}
                      className="cursor-pointer"
                    >
                      <span className="mr-2">{flag}</span>
                      {label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
          <p>{t('footer.copyright')}</p>
          <p className="mt-1">{t('footer.made')}</p>
        </div>
      </div>
    </footer>
  );
};
