export type Language = 'fr' | 'ar' | 'en';

export interface Translations {
  // Common
  common: {
    search: string;
    filters: string;
    loading: string;
    error: string;
    success: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    confirm: string;
    back: string;
    next: string;
    submit: string;
  };

  // Navigation
  nav: {
    home: string;
    search: string;
    providers: string;
    emergency: string;
    profile: string;
    login: string;
    signup: string;
    logout: string;
  };

  // Search
  search: {
    placeholder: string;
    results: string;
    noResults: string;
    filterByType: string;
    filterByArea: string;
    filterByRating: string;
    viewMap: string;
    viewList: string;
  };

  // Provider
  provider: {
    verified: string;
    rating: string;
    reviews: string;
    bookAppointment: string;
    callNow: string;
    getDirections: string;
    about: string;
    services: string;
    hours: string;
    location: string;
    emergency: string;
    accessible: string;
  };

  // Reviews
  reviews: {
    title: string;
    writeReview: string;
    yourRating: string;
    yourReview: string;
    submit: string;
    helpful: string;
    providerResponse: string;
    pending: string;
    approved: string;
    rejected: string;
  };

  // Auth
  auth: {
    login: string;
    signup: string;
    email: string;
    password: string;
    confirmPassword: string;
    forgotPassword: string;
    rememberMe: string;
    or: string;
    continueWithGoogle: string;
    alreadyHaveAccount: string;
    dontHaveAccount: string;
    role: string;
    patient: string;
    provider: string;
  };

  // Chat
  chat: {
    title: string;
    placeholder: string;
    disclaimer: string;
  };
}

export const translations: Record<Language, Translations> = {
  fr: {
    common: {
      search: 'Rechercher',
      filters: 'Filtres',
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      cancel: 'Annuler',
      save: 'Enregistrer',
      delete: 'Supprimer',
      edit: 'Modifier',
      confirm: 'Confirmer',
      back: 'Retour',
      next: 'Suivant',
      submit: 'Soumettre',
    },
    nav: {
      home: 'Accueil',
      search: 'Recherche',
      providers: 'Professionnels',
      emergency: 'Urgences',
      profile: 'Profil',
      login: 'Connexion',
      signup: 'Inscription',
      logout: 'Déconnexion',
    },
    search: {
      placeholder: 'Rechercher un médecin, pharmacie, laboratoire...',
      results: 'résultats',
      noResults: 'Aucun résultat trouvé',
      filterByType: 'Type',
      filterByArea: 'Quartier',
      filterByRating: 'Note',
      viewMap: 'Vue carte',
      viewList: 'Vue liste',
    },
    provider: {
      verified: 'Vérifié',
      rating: 'Note',
      reviews: 'avis',
      bookAppointment: 'Prendre rendez-vous',
      callNow: 'Appeler',
      getDirections: 'Itinéraire',
      about: 'À propos',
      services: 'Services',
      hours: 'Horaires',
      location: 'Localisation',
      emergency: 'Urgence 24/7',
      accessible: 'Accessible PMR',
    },
    reviews: {
      title: 'Avis et évaluations',
      writeReview: 'Laisser un avis',
      yourRating: 'Votre note',
      yourReview: 'Votre avis',
      submit: 'Publier',
      helpful: 'Utile',
      providerResponse: 'Réponse du professionnel',
      pending: 'En attente',
      approved: 'Approuvé',
      rejected: 'Rejeté',
    },
    auth: {
      login: 'Connexion',
      signup: 'Inscription',
      email: 'Email',
      password: 'Mot de passe',
      confirmPassword: 'Confirmer le mot de passe',
      forgotPassword: 'Mot de passe oublié?',
      rememberMe: 'Se souvenir de moi',
      or: 'ou',
      continueWithGoogle: 'Continuer avec Google',
      alreadyHaveAccount: 'Déjà un compte?',
      dontHaveAccount: 'Pas encore de compte?',
      role: 'Je suis',
      patient: 'Patient',
      provider: 'Professionnel de santé',
    },
    chat: {
      title: 'Assistant Santé IA',
      placeholder: 'Posez votre question...',
      disclaimer: 'Ceci est un assistant virtuel. Consultez toujours un professionnel de santé.',
    },
  },
  
  ar: {
    common: {
      search: 'بحث',
      filters: 'فلاتر',
      loading: 'جاري التحميل...',
      error: 'خطأ',
      success: 'نجاح',
      cancel: 'إلغاء',
      save: 'حفظ',
      delete: 'حذف',
      edit: 'تعديل',
      confirm: 'تأكيد',
      back: 'رجوع',
      next: 'التالي',
      submit: 'إرسال',
    },
    nav: {
      home: 'الرئيسية',
      search: 'بحث',
      providers: 'المهنيون',
      emergency: 'الطوارئ',
      profile: 'الملف الشخصي',
      login: 'تسجيل الدخول',
      signup: 'إنشاء حساب',
      logout: 'تسجيل الخروج',
    },
    search: {
      placeholder: 'ابحث عن طبيب، صيدلية، مختبر...',
      results: 'نتائج',
      noResults: 'لم يتم العثور على نتائج',
      filterByType: 'النوع',
      filterByArea: 'الحي',
      filterByRating: 'التقييم',
      viewMap: 'عرض الخريطة',
      viewList: 'عرض القائمة',
    },
    provider: {
      verified: 'موثق',
      rating: 'التقييم',
      reviews: 'مراجعات',
      bookAppointment: 'حجز موعد',
      callNow: 'اتصل الآن',
      getDirections: 'الاتجاهات',
      about: 'حول',
      services: 'الخدمات',
      hours: 'ساعات العمل',
      location: 'الموقع',
      emergency: 'طوارئ 24/7',
      accessible: 'متاح لذوي الإعاقة',
    },
    reviews: {
      title: 'التقييمات والمراجعات',
      writeReview: 'اكتب تقييم',
      yourRating: 'تقييمك',
      yourReview: 'مراجعتك',
      submit: 'نشر',
      helpful: 'مفيد',
      providerResponse: 'رد المهني',
      pending: 'قيد الانتظار',
      approved: 'موافق عليه',
      rejected: 'مرفوض',
    },
    auth: {
      login: 'تسجيل الدخول',
      signup: 'إنشاء حساب',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      confirmPassword: 'تأكيد كلمة المرور',
      forgotPassword: 'نسيت كلمة المرور؟',
      rememberMe: 'تذكرني',
      or: 'أو',
      continueWithGoogle: 'المتابعة مع جوجل',
      alreadyHaveAccount: 'لديك حساب؟',
      dontHaveAccount: 'ليس لديك حساب؟',
      role: 'أنا',
      patient: 'مريض',
      provider: 'مهني صحي',
    },
    chat: {
      title: 'مساعد صحي بالذكاء الاصطناعي',
      placeholder: 'اسأل سؤالك...',
      disclaimer: 'هذا مساعد افتراضي. استشر دائمًا أخصائي الرعاية الصحية.',
    },
  },

  en: {
    common: {
      search: 'Search',
      filters: 'Filters',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      submit: 'Submit',
    },
    nav: {
      home: 'Home',
      search: 'Search',
      providers: 'Providers',
      emergency: 'Emergency',
      profile: 'Profile',
      login: 'Login',
      signup: 'Sign Up',
      logout: 'Logout',
    },
    search: {
      placeholder: 'Search for doctor, pharmacy, lab...',
      results: 'results',
      noResults: 'No results found',
      filterByType: 'Type',
      filterByArea: 'Area',
      filterByRating: 'Rating',
      viewMap: 'Map view',
      viewList: 'List view',
    },
    provider: {
      verified: 'Verified',
      rating: 'Rating',
      reviews: 'reviews',
      bookAppointment: 'Book appointment',
      callNow: 'Call now',
      getDirections: 'Get directions',
      about: 'About',
      services: 'Services',
      hours: 'Hours',
      location: 'Location',
      emergency: '24/7 Emergency',
      accessible: 'Wheelchair accessible',
    },
    reviews: {
      title: 'Reviews and ratings',
      writeReview: 'Write a review',
      yourRating: 'Your rating',
      yourReview: 'Your review',
      submit: 'Submit',
      helpful: 'Helpful',
      providerResponse: 'Provider response',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
    },
    auth: {
      login: 'Login',
      signup: 'Sign up',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm password',
      forgotPassword: 'Forgot password?',
      rememberMe: 'Remember me',
      or: 'or',
      continueWithGoogle: 'Continue with Google',
      alreadyHaveAccount: 'Already have an account?',
      dontHaveAccount: "Don't have an account?",
      role: 'I am',
      patient: 'Patient',
      provider: 'Healthcare provider',
    },
    chat: {
      title: 'AI Health Assistant',
      placeholder: 'Ask your question...',
      disclaimer: 'This is a virtual assistant. Always consult a healthcare professional.',
    },
  },
};
