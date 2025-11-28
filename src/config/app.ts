// CityHealth Application Configuration

/**
 * MODE OFFLINE
 * 
 * Quand OFFLINE_MODE = true:
 * - Les données mock locales sont utilisées
 * - Pas d'appels à Firebase/Supabase
 * - Parfait pour le développement sans backend
 * 
 * Quand OFFLINE_MODE = false:
 * - Connexion à Firebase requise
 * - Données réelles de la base de données
 */
export const OFFLINE_MODE = true;

/**
 * Backend Provider
 * 'firebase' | 'supabase' | 'mock'
 */
export const BACKEND_PROVIDER: 'firebase' | 'supabase' | 'mock' = 'firebase';

/**
 * Configuration Firebase
 * À configurer avec vos credentials Firebase
 */
export const FIREBASE_CONFIG = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

/**
 * Configuration Supabase (LEGACY - conservé pour référence)
 * @deprecated Utilisez Firebase à la place
 */
export const SUPABASE_CONFIG = {
  url: 'https://krctlzpozxtygyteeqii.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyY3RsenBvenh0eWd5dGVlcWlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MjcyNzAsImV4cCI6MjA3ODIwMzI3MH0.ZzE32HjIrOBbdITEEAdza1sc8zokgtp8dvKrksrTfGs',
};

/**
 * Messages d'information pour le mode offline
 */
export const OFFLINE_MESSAGES = {
  fr: {
    medicalAds: 'Aucune annonce médicale disponible en mode hors ligne',
    providers: 'Utilisation des données de démonstration',
    emergency: 'Services d\'urgence en mode démonstration',
  },
  ar: {
    medicalAds: 'لا توجد إعلانات طبية متاحة في وضع عدم الاتصال',
    providers: 'استخدام بيانات العرض التوضيحي',
    emergency: 'خدمات الطوارئ في وضع العرض التوضيحي',
  },
  en: {
    medicalAds: 'No medical ads available in offline mode',
    providers: 'Using demonstration data',
    emergency: 'Emergency services in demonstration mode',
  },
};
