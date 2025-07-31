import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'fr' | 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  fr: {
    'hero.title': 'CityHealth',
    'hero.slogan': 'Trouvez les meilleurs soins près de chez vous',
    'hero.description': 'Connectez-vous avec des prestataires de santé vérifiés dans votre ville',
    'nav.home': 'Accueil',
    'nav.search': 'Rechercher',
    'nav.providers': 'Prestataires',
    'nav.about': 'À propos',
    'nav.contact': 'Contact',
    'nav.login': 'Connexion',
    'nav.register': 'S\'inscrire',
    'search.placeholder': 'Rechercher un médecin, spécialité...',
    'search.location': 'Localisation',
    'search.specialty': 'Spécialité',
    'search.button': 'Rechercher',
    'emergency.title': 'Urgences - Appelez le 15',
    'stats.providers': 'Prestataires vérifiés',
    'stats.citizens': 'Citoyens satisfaits',
    'stats.emergency': 'Services d\'urgence',
    'stats.areas': 'Zones couvertes',
    'provider.verified': 'Vérifié',
    'provider.emergency': 'Urgences 24/7',
    'provider.homevisits': 'Visites à domicile',
    'cta.register': 'S\'inscrire',
    'cta.explore': 'Explorer les services',
  },
  ar: {
    'hero.title': 'سيتي هيلث',
    'hero.slogan': 'اعثر على أفضل الرعاية الصحية بالقرب منك',
    'hero.description': 'تواصل مع مقدمي الرعاية الصحية المعتمدين في مدينتك',
    'nav.home': 'الرئيسية',
    'nav.search': 'البحث',
    'nav.providers': 'مقدمو الخدمة',
    'nav.about': 'حول',
    'nav.contact': 'اتصل بنا',
    'nav.login': 'تسجيل الدخول',
    'nav.register': 'إنشاء حساب',
    'search.placeholder': 'البحث عن طبيب، تخصص...',
    'search.location': 'الموقع',
    'search.specialty': 'التخصص',
    'search.button': 'بحث',
    'emergency.title': 'الطوارئ - اتصل بالرقم 15',
    'stats.providers': 'مقدمو خدمة معتمدون',
    'stats.citizens': 'مواطنون راضون',
    'stats.emergency': 'خدمات الطوارئ',
    'stats.areas': 'المناطق المغطاة',
    'provider.verified': 'معتمد',
    'provider.emergency': 'طوارئ 24/7',
    'provider.homevisits': 'زيارات منزلية',
    'cta.register': 'إنشاء حساب',
    'cta.explore': 'استكشاف الخدمات',
  },
  en: {
    'hero.title': 'CityHealth',
    'hero.slogan': 'Find the best care near you',
    'hero.description': 'Connect with verified healthcare providers in your city',
    'nav.home': 'Home',
    'nav.search': 'Search',
    'nav.providers': 'Providers',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'search.placeholder': 'Search for doctor, specialty...',
    'search.location': 'Location',
    'search.specialty': 'Specialty',
    'search.button': 'Search',
    'emergency.title': 'Emergency - Call 15',
    'stats.providers': 'Verified providers',
    'stats.citizens': 'Happy citizens',
    'stats.emergency': 'Emergency services',
    'stats.areas': 'Coverage areas',
    'provider.verified': 'Verified',
    'provider.emergency': '24/7 Emergency',
    'provider.homevisits': 'Home visits',
    'cta.register': 'Register',
    'cta.explore': 'Explore services',
  },
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('fr');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      <div dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'font-arabic' : ''}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};