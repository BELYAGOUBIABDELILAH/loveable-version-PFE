# Design Document

## Overview

The CityHealth platform is a comprehensive healthcare directory system built on a modern React/TypeScript stack with Firebase backend. This design document covers the complete platform migration and redesign including:

1. **Firebase Migration**: Complete backend migration from Supabase to Firebase (Auth, Firestore, Storage)
2. **Google Antigravity Design System**: Ultra-minimal, agentic design aesthetic based on Material Design 3
3. **Leaflet Map Integration**: Replace Google Maps with Leaflet/OpenStreetMap
4. **Codebase Cleanup**: Remove dead code, fix inconsistencies, streamline architecture

The platform serves three distinct user types (Citizens, Providers, Admins) with role-based access control and tailored experiences for each.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (React)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Citizen    │  │   Provider   │  │    Admin     │      │
│  │     UI       │  │      UI      │  │      UI      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Service Layer (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Search     │  │   Profile    │  │     AI       │      │
│  │   Service    │  │   Service    │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend Layer (Firebase)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Firestore   │  │ Firebase Auth│  │   Firebase   │      │
│  │   Database   │  │   + Rules    │  │   Storage    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │  Cloud Funcs │  │  Real-time   │                        │
│  │  (AI Chat)   │  │  Listeners   │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              External Services                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Leaflet    │  │   Lovable    │  │    Email     │      │
│  │     Maps     │  │  AI Gateway  │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- React 18.3 with TypeScript
- Vite for build tooling
- TailwindCSS + shadcn/ui for styling
- React Router for navigation
- TanStack Query for data fetching
- Leaflet + react-leaflet for maps
- Framer Motion for animations
- particles.js for hero background

**Backend:**
- Firebase Auth (email/password, Google OAuth)
- Firestore (NoSQL document database)
- Firebase Storage (file uploads)
- Firebase Cloud Functions (serverless compute)

**External Services:**
- Lovable AI Gateway (Gemini 2.5 Flash/Pro + GPT-5)
- OpenStreetMap tiles for Leaflet
- Email service for notifications

## Components and Interfaces

### 1. Firebase Services

**Firebase Client Configuration:**
```typescript
// src/integrations/firebase/client.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

**Auth Service Interface:**
```typescript
// src/integrations/firebase/services/authService.ts
interface AuthService {
  signIn(email: string, password: string): Promise<UserCredential>;
  signUp(email: string, password: string): Promise<UserCredential>;
  signInWithGoogle(): Promise<UserCredential>;
  signOut(): Promise<void>;
  sendVerificationEmail(user: User): Promise<void>;
  getCurrentUser(): User | null;
  onAuthStateChanged(callback: (user: User | null) => void): Unsubscribe;
}
```

**Provider Service Interface:**
```typescript
// src/integrations/firebase/services/providerService.ts
interface ProviderService {
  getProviders(filters?: SearchParams): Promise<Provider[]>;
  getProviderById(id: string): Promise<Provider | null>;
  createProvider(data: Partial<Provider>): Promise<string>;
  updateProvider(id: string, data: Partial<Provider>): Promise<void>;
  deleteProvider(id: string): Promise<void>;
  searchProviders(query: string, filters: SearchParams): Promise<Provider[]>;
  getEmergencyProviders(): Promise<Provider[]>;
}
```

**Storage Service Interface:**
```typescript
// src/integrations/firebase/services/storageService.ts
interface StorageService {
  uploadFile(path: string, file: File): Promise<string>;
  deleteFile(path: string): Promise<void>;
  getDownloadURL(path: string): Promise<string>;
}
```

### 2. User Management System

**User Roles:**
- `citizen`: Regular users searching for providers
- `provider`: Healthcare providers managing profiles
- `admin`: System administrators with full access

**Authentication Context:**
```typescript
interface AuthContext {
  user: User | null;
  role: 'citizen' | 'provider' | 'admin' | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}
```

**User Profile (Firestore Document):**
```typescript
interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  language: 'fr' | 'ar' | 'en';
  role: 'citizen' | 'provider' | 'admin';
  created_at: Timestamp;
  updated_at: Timestamp;
}
```

### 3. Provider Management System

**Provider Profile (Firestore Document):**
```typescript
interface Provider {
  id: string;
  user_id: string;
  business_name: string;
  provider_type: 'doctor' | 'clinic' | 'hospital' | 'pharmacy' | 'laboratory';
  specialty_id: string | null;
  phone: string;
  email: string | null;
  address: string;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  avatar_url: string | null;
  cover_image_url: string | null;
  website: string | null;
  verification_status: 'pending' | 'verified' | 'rejected';
  is_emergency: boolean;
  is_preloaded: boolean;
  is_claimed: boolean;
  accessibility_features: string[];
  home_visit_available: boolean;
  photos: string[];
  created_at: Timestamp;
  updated_at: Timestamp;
}
```

### 4. Search System

**Search Parameters:**
```typescript
interface SearchParams {
  query: string;
  provider_type: string[];
  city: string | null;
  specialty_id: string | null;
  accessibility_features: string[];
  home_visit_available: boolean | null;
  is_emergency: boolean | null;
  verification_status: 'verified' | null;
  latitude: number | null;
  longitude: number | null;
  radius_km: number | null;
}
```

### 5. Leaflet Map Integration

**Map Component Interface:**
```typescript
interface MapProps {
  center: [number, number];
  zoom: number;
  providers?: Provider[];
  onMarkerClick?: (provider: Provider) => void;
  showClustering?: boolean;
}

interface MarkerPopupProps {
  provider: Provider;
}
```

**Map Configuration:**
```typescript
const mapConfig = {
  tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '© OpenStreetMap contributors',
  defaultCenter: [35.1833, -0.6333], // Sidi Bel Abbès
  defaultZoom: 13,
  clusterOptions: {
    maxClusterRadius: 50,
    spiderfyOnMaxZoom: true
  }
};
```

### 6. Google Antigravity Design System

**Design Tokens:**
```typescript
const designTokens = {
  colors: {
    background: '#FFFFFF',
    primaryText: '#202124',
    secondaryText: '#5F6368',
    accent: '#4285F4',
    buttonPrimary: '#1F1F1F',
    buttonSecondary: '#F1F3F4'
  },
  typography: {
    fontFamily: "'Google Sans', 'DM Sans', 'Open Sans', sans-serif",
    weights: {
      medium: 500,
      semibold: 600,
      bold: 700
    },
    sizes: {
      hero: '60px',
      h1: '48px',
      h2: '36px',
      body: '18px',
      footer: '150px'
    }
  },
  spacing: {
    sectionGap: '120px',
    containerPadding: '80px'
  },
  effects: {
    shadow: '0 10px 30px rgba(0,0,0,0.05)',
    borderRadius: {
      pill: '9999px',
      card: '16px'
    }
  }
};
```

**Header Component:**
```typescript
interface HeaderProps {
  transparent?: boolean;
}

// Navigation items
const navItems = [
  { label: 'Product', href: '/product' },
  { label: 'Use Cases', href: '/use-cases', dropdown: true },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
  { label: 'Resources', href: '/resources', dropdown: true }
];
```

**Hero Section with Particles:**
```typescript
interface HeroProps {
  title: string;
  subtitle: string;
  primaryCTA: { label: string; href: string };
  secondaryCTA: { label: string; href: string };
}

// Particle configuration
const particleConfig = {
  particles: {
    number: { value: 80 },
    color: { value: '#4285F4' },
    opacity: { value: 0.5 },
    size: { value: 3 },
    move: { enable: true, speed: 2 }
  }
};
```

## Data Models

### Firestore Collections

**1. users** - User profile information
```
/users/{userId}
  - full_name: string
  - avatar_url: string | null
  - phone: string | null
  - language: 'fr' | 'ar' | 'en'
  - role: 'citizen' | 'provider' | 'admin'
  - created_at: timestamp
  - updated_at: timestamp
```

**2. providers** - Healthcare provider profiles
```
/providers/{providerId}
  - user_id: string
  - business_name: string
  - provider_type: string
  - specialty_id: string | null
  - phone: string
  - email: string | null
  - address: string
  - city: string | null
  - latitude: number | null
  - longitude: number | null
  - description: string | null
  - avatar_url: string | null
  - cover_image_url: string | null
  - website: string | null
  - verification_status: string
  - is_emergency: boolean
  - is_preloaded: boolean
  - is_claimed: boolean
  - accessibility_features: string[]
  - home_visit_available: boolean
  - photos: string[]
  - created_at: timestamp
  - updated_at: timestamp
```

**3. specialties** - Medical specialties
```
/specialties/{specialtyId}
  - name_fr: string
  - name_ar: string | null
  - name_en: string | null
  - icon: string
  - created_at: timestamp
```

**4. services** - Provider services
```
/providers/{providerId}/services/{serviceId}
  - name_fr: string
  - name_ar: string | null
  - name_en: string | null
  - description: string | null
  - price: number | null
  - duration_minutes: number | null
  - created_at: timestamp
```

**5. schedules** - Provider operating hours
```
/providers/{providerId}/schedules/{scheduleId}
  - day_of_week: number (0-6)
  - start_time: string
  - end_time: string
  - is_active: boolean
  - created_at: timestamp
```

**6. verifications** - Verification documents
```
/verifications/{verificationId}
  - provider_id: string
  - document_type: string
  - document_url: string
  - status: 'pending' | 'verified' | 'rejected'
  - notes: string | null
  - reviewed_by: string | null
  - reviewed_at: timestamp | null
  - created_at: timestamp
```

**7. medical_ads** - Promotional content
```
/medical_ads/{adId}
  - provider_id: string
  - title: string
  - content: string
  - image_url: string | null
  - status: 'pending' | 'approved' | 'rejected'
  - display_priority: number
  - start_date: timestamp
  - end_date: timestamp | null
  - created_at: timestamp
```

**8. favorites** - User favorites
```
/users/{userId}/favorites/{favoriteId}
  - provider_id: string
  - created_at: timestamp
```

**9. profile_claims** - Profile claiming requests
```
/profile_claims/{claimId}
  - provider_id: string
  - user_id: string
  - status: 'pending' | 'approved' | 'rejected'
  - documentation: string[]
  - notes: string | null
  - reviewed_by: string | null
  - reviewed_at: timestamp | null
  - created_at: timestamp
```

**10. admin_logs** - Admin action logs
```
/admin_logs/{logId}
  - admin_id: string
  - action: string
  - entity_type: string
  - entity_id: string
  - changes: object
  - created_at: timestamp
```

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isProvider() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'provider';
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isOwner(userId);
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }

    // Providers collection
    match /providers/{providerId} {
      allow read: if true; // Public read for verified providers
      allow create: if isProvider();
      allow update: if isOwner(resource.data.user_id) || isAdmin();
      allow delete: if isAdmin();
      
      // Subcollections
      match /services/{serviceId} {
        allow read: if true;
        allow write: if isOwner(get(/databases/$(database)/documents/providers/$(providerId)).data.user_id) || isAdmin();
      }
      
      match /schedules/{scheduleId} {
        allow read: if true;
        allow write: if isOwner(get(/databases/$(database)/documents/providers/$(providerId)).data.user_id) || isAdmin();
      }
    }

    // Verifications collection
    match /verifications/{verificationId} {
      allow read: if isOwner(resource.data.provider_id) || isAdmin();
      allow create: if isProvider();
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }

    // Medical ads collection
    match /medical_ads/{adId} {
      allow read: if resource.data.status == 'approved' || isOwner(resource.data.provider_id) || isAdmin();
      allow create: if isProvider();
      allow update: if isOwner(resource.data.provider_id) || isAdmin();
      allow delete: if isOwner(resource.data.provider_id) || isAdmin();
    }

    // Favorites subcollection
    match /users/{userId}/favorites/{favoriteId} {
      allow read: if isOwner(userId);
      allow write: if isOwner(userId);
    }

    // Profile claims collection
    match /profile_claims/{claimId} {
      allow read: if isOwner(resource.data.user_id) || isAdmin();
      allow create: if isProvider();
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }

    // Admin logs collection
    match /admin_logs/{logId} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }

    // Specialties collection
    match /specialties/{specialtyId} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Search and Discovery Properties

**Property 1: Search returns matching providers**
*For any* valid search query with service type and location, the search results should only contain providers that match the specified criteria
**Validates: Requirements 1.1**

**Property 2: Multilingual search equivalence**
*For any* search query, searching with equivalent terms in Arabic, French, or English should return the same set of providers
**Validates: Requirements 1.2**

**Property 3: Search result completeness**
*For any* search result item, it should contain at minimum: provider name, type, location, and accessibility indicators
**Validates: Requirements 1.3**

**Property 4: Filter conjunction correctness**
*For any* combination of filters applied to search results, all returned providers should match ALL selected filter criteria (AND logic)
**Validates: Requirements 2.3**

**Property 5: Filter state persistence**
*For any* set of applied filters, navigating to a provider profile and back should preserve the same filter selections and results
**Validates: Requirements 2.4**

**Property 6: Result count accuracy**
*For any* filter combination, the displayed result count should equal the actual number of provider results returned
**Validates: Requirements 2.5**

### Profile Display Properties

**Property 7: Profile data completeness**
*For any* provider profile page, it should display contact information including phone number, address, and operating hours
**Validates: Requirements 3.2**

**Property 8: Photo gallery functionality**
*For any* provider profile with photos, the photos should be displayed in a grid layout and be clickable to open a modal viewer
**Validates: Requirements 3.3**

**Property 9: Leaflet map presence**
*For any* provider profile page with valid coordinates, a Leaflet map component showing the provider location should be present
**Validates: Requirements 3.4**

**Property 10: Accessibility indicator display**
*For any* provider profile page, accessibility indicators and home visit availability status should be visible
**Validates: Requirements 3.5**

### Internationalization Properties

**Property 11: Language switching completeness**
*For any* language selection (Arabic, French, English), all interface text should update to the selected language
**Validates: Requirements 4.2**

**Property 12: RTL layout for Arabic**
*For any* page when Arabic language is selected, the layout direction should be right-to-left
**Validates: Requirements 4.3**

**Property 13: Preference persistence**
*For any* language preference setting, ending the session and starting a new one should restore the same preference
**Validates: Requirements 4.4**

### Favorites Properties

**Property 14: Favorite addition**
*For any* authenticated user and any provider, clicking the favorite button should add the provider to the user's favorites list
**Validates: Requirements 5.1**

**Property 15: Favorites display completeness**
*For any* authenticated user, all providers they have favorited should be visible in their favorites section
**Validates: Requirements 5.4**

**Property 16: Favorite removal**
*For any* provider in a user's favorites list, removing it should immediately update the favorites list to exclude that provider
**Validates: Requirements 5.5**

### Chatbot Properties

**Property 17: Chatbot response delivery**
*For any* question submitted to the chatbot, a response should be received within 3 seconds
**Validates: Requirements 6.2**

**Property 18: Multilingual chatbot support**
*For any* message sent to the chatbot in Arabic, French, or English, the chatbot should respond in the same language
**Validates: Requirements 6.3**

**Property 19: Chatbot fallback behavior**
*For any* query the chatbot cannot answer, it should provide relevant search suggestions or contact information
**Validates: Requirements 6.5**

### Emergency Services Properties

**Property 20: Emergency section filtering**
*For any* provider displayed in the Emergency Now section, the provider should have is_emergency flag set to true
**Validates: Requirements 7.2**

**Property 21: Emergency contact prominence**
*For any* provider in the Emergency Now section, emergency contact information should be prominently displayed
**Validates: Requirements 7.4**

**Property 22: Emergency section consistency**
*For any* change to a provider's emergency availability status, the Emergency Now section should reflect the change
**Validates: Requirements 7.5**

### Provider Registration Properties

**Property 23: Firebase Auth integration**
*For any* provider registration, the account should be created using Firebase Auth within 2 seconds
**Validates: Requirements 8.2**

**Property 24: Verification email delivery**
*For any* successful provider registration, a verification email should be sent to the registered email address
**Validates: Requirements 8.5**

### Provider Profile Management Properties

**Property 25: Dashboard field accessibility**
*For any* provider accessing their dashboard, all profile fields should be displayed and editable
**Validates: Requirements 9.1**

**Property 26: Multiple photo upload**
*For any* provider, they should be able to upload more than one photo to their profile gallery via Firebase Storage
**Validates: Requirements 9.2**

**Property 27: Photo upload performance**
*For any* valid photo uploaded by a provider, it should be stored and displayed in the profile within 3 seconds
**Validates: Requirements 9.3**

**Property 28: Accessibility flag editability**
*For any* provider profile, accessibility indicators and home visit availability flags should be settable
**Validates: Requirements 9.4**

**Property 29: Profile update confirmation**
*For any* profile changes saved by a provider, the changes should be persisted to Firestore and a confirmation should be displayed
**Validates: Requirements 9.5**

### Verification Properties

**Property 30: Verification button enablement**
*For any* provider profile that is complete (all required fields filled), the verification request button should be enabled
**Validates: Requirements 10.1**

**Property 31: Verification queue addition**
*For any* verification request submitted by a provider, it should be added to the admin verification queue within 1 second
**Validates: Requirements 10.2**

**Property 32: Verification badge display**
*For any* provider profile with verification_status='verified', a verification badge should be displayed
**Validates: Requirements 10.4**

**Property 33: Denial reason provision**
*For any* verification request that is denied, a reason for denial should be provided to the provider
**Validates: Requirements 10.5**

### Medical Ads Properties

**Property 34: Ad creation access control**
*For any* provider user, they should only be able to create medical ads if their profile verification_status='verified'
**Validates: Requirements 11.1**

**Property 35: Ad content support**
*For any* medical ad creation, the system should support both text and image content
**Validates: Requirements 11.2**

**Property 36: Ad approval requirement**
*For any* medical ad, it should not be visible to citizen users until its status='approved'
**Validates: Requirements 11.3**

**Property 37: Approved ad display locations**
*For any* medical ad with status='approved', it should be displayed in both the homepage carousel and inline in search results
**Validates: Requirements 11.4**

**Property 38: Ad status visibility**
*For any* provider, they should be able to view the status of all their medical ads in their dashboard
**Validates: Requirements 11.5**

### Profile Claiming Properties

**Property 39: Preloaded profile search**
*For any* search query for a practice name, matching preloaded profiles (is_preloaded=true) should be returned in results
**Validates: Requirements 12.1**

**Property 40: Claim button presence**
*For any* preloaded profile that is unclaimed (is_claimed=false), a claim button should be displayed
**Validates: Requirements 12.2**

**Property 41: Claim request queuing**
*For any* profile claim initiated by a provider, the request should be added to the admin verification queue
**Validates: Requirements 12.3**

**Property 42: Claim ownership transfer**
*For any* approved profile claim, the profile's user_id should be updated to the claiming provider's user_id
**Validates: Requirements 12.5**

### Admin Verification Properties

**Property 43: Verification queue completeness**
*For any* admin accessing the verification queue, all pending verification requests should be displayed
**Validates: Requirements 13.1**

**Property 44: Verification approval processing**
*For any* verification request approved by an admin, the provider's verification_status should be updated to 'verified' within 1 second
**Validates: Requirements 13.3**

**Property 45: Denial reason requirement**
*For any* verification request denial, a reason for denial should be required and stored
**Validates: Requirements 13.4**

### Admin Management Properties

**Property 46: Admin CRUD permissions**
*For any* admin user, they should be able to create, read, update, and delete any provider profile in Firestore
**Validates: Requirements 14.1**

**Property 47: Admin modification logging**
*For any* provider profile modification by an admin, the change should be logged with timestamp and admin identifier
**Validates: Requirements 14.2**

**Property 48: Admin ad moderation**
*For any* admin user, they should be able to moderate and remove inappropriate medical ads
**Validates: Requirements 14.5**

### Data Import Properties

**Property 49: Bulk import functionality**
*For any* admin user, they should be able to import multiple provider records at once via CSV or JSON
**Validates: Requirements 15.1**

**Property 50: Import preload marking**
*For any* provider imported via bulk import, the created Firestore document should have is_preloaded=true
**Validates: Requirements 15.2**

**Property 51: Import data validation**
*For any* bulk import data, records missing required fields should be rejected before profile creation
**Validates: Requirements 15.4**

**Property 52: Claim preload flag removal**
*For any* preloaded profile that is successfully claimed, is_preloaded should be updated to false
**Validates: Requirements 15.5**

### Accessibility Properties

**Property 53: ARIA label presence**
*For any* interactive element in the application, it should have proper ARIA labels
**Validates: Requirements 16.2**

**Property 54: Keyboard navigation support**
*For any* functionality in the application, it should be accessible via keyboard navigation
**Validates: Requirements 16.3**

**Property 55: Color contrast compliance**
*For any* text element, the color contrast ratio should meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
**Validates: Requirements 16.4**

**Property 56: Image alt text presence**
*For any* image or icon in the application, it should have alternative text
**Validates: Requirements 16.5**

### Responsive Design Properties

**Property 57: Viewport size support**
*For any* screen width from 320px to 2560px, the application should display correctly without horizontal scrolling
**Validates: Requirements 17.1**

**Property 58: Responsive layout adaptation**
*For any* viewport size (mobile, tablet, desktop), navigation and layout should adapt appropriately
**Validates: Requirements 17.2**

**Property 59: Touch interaction optimization**
*For any* interactive element on mobile devices, touch targets should be at least 44x44 pixels
**Validates: Requirements 17.3**

**Property 60: Cross-browser functionality**
*For any* feature in the application, it should function correctly in Chrome, Firefox, Safari, and Edge browsers
**Validates: Requirements 17.5**

### AI Suggestions Properties

**Property 61: AI suggestion display**
*For any* search performed by a citizen user, AI-generated provider suggestions should be displayed
**Validates: Requirements 18.1**

**Property 62: Suggestion dismissal**
*For any* displayed suggestion, users should be able to dismiss or hide it
**Validates: Requirements 18.5**

### Firebase Migration Properties

**Property 63: Firebase Auth usage**
*For any* authentication operation, Firebase Auth should be used (no Supabase auth code)
**Validates: Requirements 19.1**

**Property 64: Firestore data storage**
*For any* application data operation, Firestore should be used for storage (no Supabase queries)
**Validates: Requirements 19.2**

**Property 65: Firebase Storage usage**
*For any* file upload operation, Firebase Storage should be used (no Supabase storage)
**Validates: Requirements 19.3**

**Property 66: Legacy code removal**
*For any* file in the codebase, there should be no Supabase client code, Google Maps code, or related configurations
**Validates: Requirements 19.6, 21.7**

### Design System Properties

**Property 67: Design system compliance**
*For any* UI component, it should use the Google Antigravity design tokens: white background (#FFFFFF), correct text colors (#202124, #5F6368), accent color (#4285F4), pill buttons (border-radius: 9999px), and soft shadows
**Validates: Requirements 20.1, 20.2, 20.4, 20.5**

**Property 68: Dark mode removal**
*For any* page in the application, there should be no dark mode toggle or dark theme variants
**Validates: Requirements 20.8**

**Property 69: Header scroll behavior**
*For any* page with scrolling, the header should transition from transparent to white background on scroll
**Validates: Requirements 20.9**

### Leaflet Map Properties

**Property 70: Leaflet map usage**
*For any* map component, Leaflet with react-leaflet should be used with OpenStreetMap tiles
**Validates: Requirements 21.1, 21.2**

**Property 71: Map marker popups**
*For any* provider marker on the map, clicking it should show a popup with name, type, address, and phone
**Validates: Requirements 21.4**

**Property 72: Marker clustering**
*For any* map view with multiple providers in close proximity, markers should be clustered
**Validates: Requirements 21.5**

### Codebase Cleanup Properties

**Property 73: No unused code**
*For any* import, component, hook, or utility in the codebase, it should be actively used
**Validates: Requirements 22.1**

**Property 74: No duplicate routes**
*For any* route path in the application, there should be only one route definition
**Validates: Requirements 22.2**

**Property 75: TypeScript strict compliance**
*For any* TypeScript file, it should pass strict mode compilation without errors
**Validates: Requirements 22.8**



## Error Handling

### Error Categories

1. **Network Errors**
   - Connection failures
   - Timeout errors
   - Firebase service unavailability

2. **Authentication Errors**
   - Invalid credentials
   - Expired sessions
   - Insufficient permissions
   - OAuth failures

3. **Validation Errors**
   - Invalid input data
   - Missing required fields
   - Format violations

4. **Firestore Errors**
   - Document not found
   - Permission denied
   - Quota exceeded

5. **Storage Errors**
   - Upload failures
   - File size exceeded
   - Invalid file type

6. **External Service Errors**
   - AI service failures
   - Map tile loading failures
   - Email delivery failures

### Error Handling Strategy

**Client-Side Error Handling:**

```typescript
interface ErrorHandler {
  handleError(error: Error, context: ErrorContext): void;
  logError(error: Error, context: ErrorContext): void;
  displayUserMessage(message: string, severity: 'error' | 'warning' | 'info'): void;
}

interface ErrorContext {
  component: string;
  action: string;
  userId?: string;
  additionalData?: Record<string, any>;
}
```

**Firebase Error Handling:**
```typescript
import { FirebaseError } from 'firebase/app';

function handleFirebaseError(error: FirebaseError): string {
  switch (error.code) {
    case 'auth/user-not-found':
      return 'No account found with this email';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists';
    case 'permission-denied':
      return 'You do not have permission to perform this action';
    case 'not-found':
      return 'The requested resource was not found';
    default:
      return 'An unexpected error occurred';
  }
}
```

**Error Boundary Implementation:**
- Global ErrorBoundary component wraps the entire application
- Catches React component errors
- Logs errors to console in development
- Displays user-friendly error messages
- Provides recovery options (reload, go home)

**API Error Handling:**
- Retry logic for transient failures (3 attempts with exponential backoff)
- Graceful degradation for non-critical features
- Offline support with cached data where possible

## Testing Strategy

### Testing Framework

**Primary Framework:** Vitest
**Property-Based Testing:** fast-check
**Component Testing:** React Testing Library
**E2E Testing:** Playwright (optional)

### Test Structure

```
src/tests/
├── generators/           # Custom fast-check generators
│   ├── index.ts
│   ├── provider.ts
│   ├── user.ts
│   └── search.ts
├── properties/           # Property-based tests
│   ├── search-and-filter.test.ts
│   ├── favorites.test.ts
│   ├── verification.test.ts
│   ├── medical-ads.test.ts
│   ├── profile-claiming.test.ts
│   ├── accessibility.test.ts
│   ├── responsive-design.test.ts
│   ├── internationalization.test.ts
│   ├── firebase-migration.test.ts
│   ├── design-system.test.ts
│   └── leaflet-maps.test.ts
├── integration/          # Integration tests
│   └── firebase-services.test.ts
└── setup.ts              # Test configuration
```

### Property-Based Testing Requirements

1. **Minimum Iterations:** Each property test should run at least 100 iterations
2. **Custom Generators:** Use domain-specific generators for realistic test data
3. **Property Tagging:** Each test must reference the correctness property it validates

**Example Property Test:**
```typescript
import { fc } from 'fast-check';
import { describe, it, expect } from 'vitest';

describe('Search and Filter Properties', () => {
  /**
   * **Feature: cityhealth-platform, Property 4: Filter conjunction correctness**
   * **Validates: Requirements 2.3**
   */
  it('should return only providers matching ALL filter criteria', () => {
    fc.assert(
      fc.property(
        providerListArb,
        filterStateArb,
        (providers, filters) => {
          const results = applyFilters(providers, filters);
          return results.every(provider => 
            matchesAllFilters(provider, filters)
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Unit Testing Requirements

1. **Coverage:** Focus on critical business logic
2. **Isolation:** Mock Firebase services for unit tests
3. **Edge Cases:** Test boundary conditions and error states

### Integration Testing Requirements

1. **Firebase Emulator:** Use Firebase emulator suite for integration tests
2. **Real Data Flows:** Test complete user journeys
3. **Security Rules:** Verify Firestore security rules work correctly

### Test Categories by Feature

**Firebase Migration Tests:**
- Verify Firebase Auth operations work correctly
- Verify Firestore CRUD operations
- Verify Firebase Storage uploads
- Verify no Supabase code remains

**Design System Tests:**
- Verify color tokens are applied correctly
- Verify typography matches specifications
- Verify button styles (pill shape)
- Verify no dark mode exists

**Leaflet Map Tests:**
- Verify Leaflet renders correctly
- Verify OpenStreetMap tiles load
- Verify marker popups show correct data
- Verify clustering works for dense areas

**Accessibility Tests:**
- Verify ARIA labels on interactive elements
- Verify keyboard navigation works
- Verify color contrast meets WCAG AA
- Verify alt text on images

**Responsive Design Tests:**
- Verify layout at 320px, 768px, 1024px, 1440px, 2560px
- Verify touch targets are 44x44px minimum
- Verify navigation adapts to viewport

### Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/tests/']
    }
  }
});
```

### Test Execution

```bash
# Run all tests
npm run test

# Run property tests only
npm run test -- --grep "Property"

# Run with coverage
npm run test:coverage

# Run specific test file
npm run test -- src/tests/properties/firebase-migration.test.ts
```

