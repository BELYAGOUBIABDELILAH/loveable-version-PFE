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
    // Navigation
    'nav.home': 'Accueil',
    'nav.search': 'Rechercher',
    'nav.emergency': 'Urgence',
    'nav.signin': 'Se connecter',
    'nav.contact': 'Contact',
    'nav.aboutus': 'À propos',
    'nav.how': 'Comment',
    'nav.why': 'Pourquoi',

    // Search
    'search.placeholder': 'Rechercher un spécialiste...',
    'search.location': 'Votre ville',
    'search.service': 'Type de service',
    'search.button': 'Rechercher',
    'search.now': 'Rechercher maintenant',
    'search.recent': 'Recherches récentes',

    // Emergency
    'emergency.title': 'Urgence',
    'emergency.subtitle': 'Appelez le 15',
    'emergency.services': 'Services d\'urgence',

    // Hero
    'hero.title': 'Trouvez vos professionnels de santé en un clic',
    'hero.subtitle': 'Découvrez des médecins vérifiés, prenez rendez-vous et accédez à des soins de qualité en Algérie.',

    // Services
    'services.title': 'Nos Services',
    'services.generalDoctors': 'Médecins Généralistes',
    'services.generalDoctors.desc': 'Consultations médicales générales',
    'services.specialists': 'Spécialistes Médicaux',
    'services.specialists.desc': 'Médecins spécialisés en différents domaines',
    'services.pharmacies': 'Pharmacies',
    'services.pharmacies.desc': 'Pharmacies et médicaments près de vous',
    'services.laboratories': 'Laboratoires',
    'services.laboratories.desc': 'Analyses et tests médicaux',
    'services.clinics': 'Cliniques Privées',
    'services.clinics.desc': 'Centres de soins privés',
    'services.emergency': 'Services d\'Urgence',
    'services.emergency.desc': 'Soins médicaux d\'urgence 24h/24',
    'services.explore': 'Explorer',

    // Providers
    'providers.featured': 'Professionnels Recommandés',
    'providers.viewAll': 'Voir tous les professionnels',
    'providers.verified': 'Vérifié',
    'providers.rating': 'Note',
    'providers.distance': 'Distance',

    // AI Assistant
    'ai.title': 'Assistant IA',
    'ai.subtitle': 'Posez vos questions médicales',
    'ai.try': 'Essayer l\'Assistant IA',
    'ai.preview1': 'Comment puis-je trouver un cardiologue près de moi ?',
    'ai.preview2': 'Quels sont les symptômes de la grippe ?',
    'ai.preview3': 'Comment prendre rendez-vous rapidement ?',

    // Stats
    'stats.providers': 'Professionnels',
    'stats.cities': 'Villes Couvertes',
    'stats.patients': 'Patients Satisfaits',
    'stats.rating': 'Note Moyenne',

    // Footer
    'footer.about': 'À propos',
    'footer.services': 'Services',
    'footer.support': 'Support',
    'footer.legal': 'Légal',
    'footer.contact': 'Contact',
    'footer.privacy': 'Confidentialité',
    'footer.terms': 'Conditions',
    'footer.cookies': 'Cookies',
    'footer.newsletter': 'S\'abonner à la newsletter',
    'footer.newsletter.placeholder': 'Votre adresse email',
    'footer.newsletter.button': 'S\'abonner',
    'footer.copyright': '© 2024 CityHealth. Tous droits réservés.',
    'footer.made': 'Conçu avec ❤️ en Algérie',
    'footer.social': 'Suivez-nous',

    // Common
    'loading': 'Chargement...',
    'error': 'Erreur',
    'tryAgain': 'Réessayer',
    'close': 'Fermer',
    'ok': 'OK',
    'cancel': 'Annuler',
  },
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.search': 'البحث',
    'nav.emergency': 'طوارئ',
    'nav.signin': 'تسجيل الدخول',
    'nav.contact': 'اتصل بنا',
    'nav.aboutus': 'حولنا',
    'nav.how': 'كيف',
    'nav.why': 'لماذا',

    // Search
    'search.placeholder': 'ابحث عن أخصائي...',
    'search.location': 'مدينتك',
    'search.service': 'نوع الخدمة',
    'search.button': 'بحث',
    'search.now': 'ابحث الآن',
    'search.recent': 'عمليات البحث الأخيرة',

    // Emergency
    'emergency.title': 'طوارئ',
    'emergency.subtitle': 'اتصل بـ 15',
    'emergency.services': 'خدمات الطوارئ',

    // Hero
    'hero.title': 'اعثر على متخصصي الرعاية الصحية بنقرة واحدة',
    'hero.subtitle': 'اكتشف الأطباء المعتمدين، احجز المواعيد، واحصل على رعاية صحية عالية الجودة في الجزائر.',

    // Services
    'services.title': 'خدماتنا',
    'services.generalDoctors': 'أطباء عامون',
    'services.generalDoctors.desc': 'استشارات طبية عامة',
    'services.specialists': 'أخصائيون طبيون',
    'services.specialists.desc': 'أطباء متخصصون في مجالات مختلفة',
    'services.pharmacies': 'صيدليات',
    'services.pharmacies.desc': 'صيدليات وأدوية بالقرب منك',
    'services.laboratories': 'مختبرات',
    'services.laboratories.desc': 'تحاليل واختبارات طبية',
    'services.clinics': 'عيادات خاصة',
    'services.clinics.desc': 'مراكز رعاية خاصة',
    'services.emergency': 'خدمات الطوارئ',
    'services.emergency.desc': 'رعاية طبية طارئة 24/7',
    'services.explore': 'استكشف',

    // Providers
    'providers.featured': 'متخصصون مميزون',
    'providers.viewAll': 'عرض جميع المتخصصين',
    'providers.verified': 'معتمد',
    'providers.rating': 'التقييم',
    'providers.distance': 'المسافة',

    // AI Assistant
    'ai.title': 'المساعد الذكي',
    'ai.subtitle': 'اطرح أسئلتك الطبية',
    'ai.try': 'جرب المساعد الذكي',
    'ai.preview1': 'كيف يمكنني العثور على طبيب قلب بالقرب مني؟',
    'ai.preview2': 'ما هي أعراض الإنفلونزا؟',
    'ai.preview3': 'كيف أحجز موعداً بسرعة؟',

    // Stats
    'stats.providers': 'متخصص',
    'stats.cities': 'مدينة مغطاة',
    'stats.patients': 'مريض راضٍ',
    'stats.rating': 'متوسط التقييم',

    // Footer
    'footer.about': 'حولنا',
    'footer.services': 'الخدمات',
    'footer.support': 'الدعم',
    'footer.legal': 'قانوني',
    'footer.contact': 'اتصل بنا',
    'footer.privacy': 'الخصوصية',
    'footer.terms': 'الشروط',
    'footer.cookies': 'ملفات تعريف الارتباط',
    'footer.newsletter': 'اشترك في النشرة الإخبارية',
    'footer.newsletter.placeholder': 'عنوان بريدك الإلكتروني',
    'footer.newsletter.button': 'اشترك',
    'footer.copyright': '© 2024 CityHealth. جميع الحقوق محفوظة.',
    'footer.made': 'صُنع بـ ❤️ في الجزائر',
    'footer.social': 'تابعنا',

    // Common
    'loading': 'جارٍ التحميل...',
    'error': 'خطأ',
    'tryAgain': 'حاول مرة أخرى',
    'close': 'إغلاق',
    'ok': 'موافق',
    'cancel': 'إلغاء',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.search': 'Search',
    'nav.emergency': 'Emergency',
    'nav.signin': 'Sign In',
    'nav.contact': 'Contact',
    'nav.aboutus': 'About Us',
    'nav.how': 'How',
    'nav.why': 'Why',

    // Search
    'search.placeholder': 'Search for a specialist...',
    'search.location': 'Your city',
    'search.service': 'Service type',
    'search.button': 'Search',
    'search.now': 'Search Now',
    'search.recent': 'Recent searches',

    // Emergency
    'emergency.title': 'Emergency',
    'emergency.subtitle': 'Call 15',
    'emergency.services': 'Emergency Services',

    // Hero
    'hero.title': 'Find Your Healthcare Professionals in One Click',
    'hero.subtitle': 'Discover verified doctors, book appointments, and access quality healthcare in Algeria.',

    // Services
    'services.title': 'Our Services',
    'services.generalDoctors': 'General Doctors',
    'services.generalDoctors.desc': 'General medical consultations',
    'services.specialists': 'Medical Specialists',
    'services.specialists.desc': 'Doctors specialized in different fields',
    'services.pharmacies': 'Pharmacies',
    'services.pharmacies.desc': 'Pharmacies and medications near you',
    'services.laboratories': 'Laboratories',
    'services.laboratories.desc': 'Medical tests and analysis',
    'services.clinics': 'Private Clinics',
    'services.clinics.desc': 'Private healthcare centers',
    'services.emergency': 'Emergency Services',
    'services.emergency.desc': '24/7 emergency medical care',
    'services.explore': 'Explore',

    // Providers
    'providers.featured': 'Featured Providers',
    'providers.viewAll': 'View All Providers',
    'providers.verified': 'Verified',
    'providers.rating': 'Rating',
    'providers.distance': 'Distance',

    // AI Assistant
    'ai.title': 'AI Assistant',
    'ai.subtitle': 'Ask your medical questions',
    'ai.try': 'Try AI Assistant',
    'ai.preview1': 'How can I find a cardiologist near me?',
    'ai.preview2': 'What are the symptoms of the flu?',
    'ai.preview3': 'How to book an appointment quickly?',

    // Stats
    'stats.providers': 'Providers',
    'stats.cities': 'Cities Covered',
    'stats.patients': 'Happy Patients',
    'stats.rating': 'Average Rating',

    // Footer
    'footer.about': 'About',
    'footer.services': 'Services',
    'footer.support': 'Support',
    'footer.legal': 'Legal',
    'footer.contact': 'Contact',
    'footer.privacy': 'Privacy',
    'footer.terms': 'Terms',
    'footer.cookies': 'Cookies',
    'footer.newsletter': 'Subscribe to Newsletter',
    'footer.newsletter.placeholder': 'Your email address',
    'footer.newsletter.button': 'Subscribe',
    'footer.copyright': '© 2024 CityHealth. All rights reserved.',
    'footer.made': 'Made with ❤️ in Algeria',
    'footer.social': 'Follow Us',

    // Common
    'loading': 'Loading...',
    'error': 'Error',
    'tryAgain': 'Try Again',
    'close': 'Close',
    'ok': 'OK',
    'cancel': 'Cancel',
  }
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