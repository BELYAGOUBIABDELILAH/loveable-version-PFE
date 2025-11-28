# Design Document

## Overview

The CityHealth platform is a comprehensive healthcare directory system built on a modern React/TypeScript stack with Supabase backend. The design emphasizes three core principles:

1. **Accessibility First**: WCAG 2.1 Level AA compliance, multilingual support (Arabic, French, English), and responsive design
2. **Trust & Verification**: Multi-tier verification system for providers with admin oversight
3. **Performance**: Sub-2-second response times for critical user interactions

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
│              Backend Layer (Supabase)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL  │  │  Auth + RLS  │  │    Storage   │      │
│  │   Database   │  │   Security   │  │   (Files)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │  Edge Funcs  │  │  Real-time   │                        │
│  │  (AI Chat)   │  │  Subscript.  │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              External Services                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Mapbox     │  │   Lovable    │  │    Email     │      │
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
- Mapbox GL for maps

**Backend:**
- Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- Row Level Security (RLS) for data access control
- Supabase Edge Functions for serverless compute

**External Services:**
- Lovable AI Gateway (Gemini 2.5 Flash/Pro + GPT-5)
- Mapbox for interactive maps
- Email service for notifications

## Components and Interfaces

### 1. User Management System

**User Roles:**
- `citizen`: Regular users searching for providers
- `provider`: Healthcare providers managing profiles
- `admin`: System administrators with full access

**Authentication Flow:**
```typescript
interface AuthContext {
  user: User | null;
  role: 'citizen' | 'provider' | 'admin' | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}
```

**Profile Management:**
```typescript
interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  language: 'fr' | 'ar' | 'en';
  created_at: string;
  updated_at: string;
}
```

### 2. Provider Management System

**Provider Profile:**
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
  created_at: string;
  updated_at: string;
}
```

**Services:**
```typescript
interface Service {
  id: string;
  provider_id: string;
  name_fr: string;
  name_ar: string | null;
  name_en: string | null;
  description: string | null;
  price: number | null;
  duration_minutes: number | null;
}
```

**Schedule:**
```typescript
interface Schedule {
  id: string;
  provider_id: string;
  day_of_week: number; // 0-6 (Sunday-Saturday)
  start_time: string; // HH:MM format
  end_time: string;
  is_active: boolean;
}
```

### 3. Search System

**Search Interface:**
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

interface SearchResult {
  providers: Provider[];
  total_count: number;
  page: number;
  page_size: number;
}
```

**Search Service:**
```typescript
class SearchService {
  async searchProviders(params: SearchParams): Promise<SearchResult>;
  async getProviderById(id: string): Promise<Provider>;
  async getSuggestions(query: string, language: string): Promise<string[]>;
}
```

### 4. Verification System

**Verification Request:**
```typescript
interface Verification {
  id: string;
  provider_id: string;
  document_type: string;
  document_url: string;
  status: 'pending' | 'verified' | 'rejected';
  notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}
```

**Verification Queue:**
```typescript
interface VerificationQueue {
  pending_verifications: Verification[];
  pending_claims: ProfileClaim[];
}

interface ProfileClaim {
  id: string;
  provider_id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  documentation: string[];
  notes: string | null;
  created_at: string;
}
```

### 5. Medical Ads System

**Medical Ad:**
```typescript
interface MedicalAd {
  id: string;
  provider_id: string;
  title: string;
  content: string;
  image_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  display_priority: number;
  start_date: string;
  end_date: string | null;
  created_at: string;
}
```

### 6. Favorites System

**Favorites:**
```typescript
interface Favorite {
  id: string;
  user_id: string;
  provider_id: string;
  created_at: string;
}

interface FavoritesService {
  addFavorite(provider_id: string): Promise<void>;
  removeFavorite(provider_id: string): Promise<void>;
  getFavorites(): Promise<Provider[]>;
  isFavorite(provider_id: string): Promise<boolean>;
}
```

### 7. AI Chatbot System

**Chat Interface:**
```typescript
interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface ChatSession {
  id: string;
  user_id: string | null;
  language: 'fr' | 'ar' | 'en';
  created_at: string;
  updated_at: string;
}

interface ChatService {
  sendMessage(message: string, session_id: string): AsyncIterator<string>;
  createSession(language: string): Promise<ChatSession>;
  getSessionHistory(session_id: string): Promise<ChatMessage[]>;
}
```

### 8. Internationalization System

**Language Context:**
```typescript
interface LanguageContext {
  language: 'fr' | 'ar' | 'en';
  setLanguage: (lang: 'fr' | 'ar' | 'en') => void;
  t: (section: string, key: string) => string;
  isRTL: boolean;
}
```

### 9. Analytics System

**Analytics Events:**
```typescript
interface AnalyticsEvent {
  event_type: 'pageView' | 'search' | 'providerView' | 'booking' | 'favorite' | 'chatInteraction';
  event_data: Record<string, any>;
  user_id: string | null;
  session_id: string;
  page_url: string;
  ip_address: string | null;
  user_agent: string | null;
}

interface AnalyticsService {
  trackEvent(event: AnalyticsEvent): void;
  trackPageView(url: string): void;
  trackSearch(query: string, filters: SearchParams): void;
  trackProviderView(provider_id: string): void;
}
```

## Data Models

### Database Schema

**Core Tables:**

1. **profiles** - User profile information
   - id (uuid, PK, FK to auth.users)
   - full_name (text)
   - avatar_url (text)
   - phone (text)
   - language (text)
   - created_at, updated_at (timestamp)

2. **user_roles** - Role assignments
   - id (uuid, PK)
   - user_id (uuid, FK to auth.users)
   - role (enum: citizen, provider, admin)
   - created_at (timestamp)

3. **providers** - Healthcare provider profiles
   - id (uuid, PK)
   - user_id (uuid, FK to auth.users)
   - business_name (text)
   - provider_type (enum)
   - specialty_id (uuid, FK to specialties)
   - phone, email, address, city (text)
   - latitude, longitude (numeric)
   - description (text)
   - avatar_url, cover_image_url, website (text)
   - verification_status (enum)
   - is_emergency (boolean)
   - is_preloaded (boolean)
   - is_claimed (boolean)
   - accessibility_features (text[])
   - home_visit_available (boolean)
   - created_at, updated_at (timestamp)

4. **specialties** - Medical specialties
   - id (uuid, PK)
   - name_fr, name_ar, name_en (text)
   - icon (text)
   - created_at (timestamp)

5. **services** - Provider services
   - id (uuid, PK)
   - provider_id (uuid, FK to providers)
   - name_fr, name_ar, name_en (text)
   - description (text)
   - price (numeric)
   - duration_minutes (integer)
   - created_at (timestamp)

6. **schedules** - Provider operating hours
   - id (uuid, PK)
   - provider_id (uuid, FK to providers)
   - day_of_week (integer 0-6)
   - start_time, end_time (time)
   - is_active (boolean)
   - created_at (timestamp)

7. **verifications** - Verification documents
   - id (uuid, PK)
   - provider_id (uuid, FK to providers)
   - document_type (text)
   - document_url (text)
   - status (enum)
   - notes (text)
   - reviewed_by (uuid, FK to auth.users)
   - reviewed_at (timestamp)
   - created_at (timestamp)

8. **medical_ads** - Promotional content
   - id (uuid, PK)
   - provider_id (uuid, FK to providers)
   - title, content (text)
   - image_url (text)
   - status (enum)
   - display_priority (integer)
   - start_date, end_date (timestamp)
   - created_at (timestamp)

9. **favorites** - User favorites
   - id (uuid, PK)
   - user_id (uuid, FK to auth.users)
   - provider_id (uuid, FK to providers)
   - created_at (timestamp)
   - UNIQUE(user_id, provider_id)

10. **chat_sessions** - AI chat sessions
    - id (uuid, PK)
    - user_id (uuid, FK to auth.users, nullable)
    - language (text)
    - created_at, updated_at (timestamp)

11. **chat_messages** - Chat message history
    - id (uuid, PK)
    - session_id (uuid, FK to chat_sessions)
    - role (enum: user, assistant)
    - content (text)
    - created_at (timestamp)

12. **analytics_events** - User behavior tracking
    - id (uuid, PK)
    - event_type (text)
    - event_data (jsonb)
    - user_id (uuid, FK to auth.users, nullable)
    - session_id (text)
    - page_url (text)
    - ip_address, user_agent (text)
    - created_at (timestamp)

13. **profile_claims** - Profile claiming requests
    - id (uuid, PK)
    - provider_id (uuid, FK to providers)
    - user_id (uuid, FK to auth.users)
    - status (enum: pending, approved, rejected)
    - documentation (text[])
    - notes (text)
    - reviewed_by (uuid, FK to auth.users)
    - reviewed_at (timestamp)
    - created_at (timestamp)

### Row Level Security (RLS) Policies

**General Principles:**
- Public read access for approved/verified content
- Authenticated users can create/update their own records
- Providers can manage their own profiles
- Admins have full access to all data

**Key Policies:**

1. **providers table:**
   - SELECT: Public can view verified providers
   - INSERT: Authenticated users with provider role
   - UPDATE: Provider owns the record OR user is admin
   - DELETE: Admin only

2. **verifications table:**
   - SELECT: Provider owns the record OR user is admin
   - INSERT: Provider owns the related provider record
   - UPDATE: Admin only
   - DELETE: Admin only

3. **medical_ads table:**
   - SELECT: Public can view approved ads
   - INSERT: Verified providers only
   - UPDATE: Provider owns the record OR user is admin
   - DELETE: Provider owns the record OR user is admin

4. **favorites table:**
   - SELECT: User owns the record
   - INSERT: Authenticated users
   - UPDATE: User owns the record
   - DELETE: User owns the record

5. **chat_sessions & chat_messages:**
   - SELECT: User owns the session OR session is anonymous
   - INSERT: Any user (authenticated or anonymous)
   - UPDATE: User owns the session
   - DELETE: User owns the session OR admin

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

**Property 9: Map presence**
*For any* provider profile page, an interactive map component showing the provider location should be present
**Validates: Requirements 3.4**

**Property 10: Accessibility indicator display**
*For any* provider profile page, accessibility indicators and home visit availability status should be visible
**Validates: Requirements 3.5**

### Internationalization Properties

**Property 11: Language switching completeness**
*For any* language selection (Arabic, French, English), all interface text should update to the selected language
**Validates: Requirements 4.2**

**Property 12: Theme consistency**
*For any* page in the application, when dark mode is enabled, the dark theme should be applied to all components
**Validates: Requirements 4.4**

**Property 13: Preference persistence**
*For any* language and theme preference settings, ending the session and starting a new one should restore the same preferences
**Validates: Requirements 4.5**

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

**Property 21: Emergency section performance**
*For any* access to the Emergency Now section, results should be displayed within 1 second
**Validates: Requirements 7.3**

**Property 22: Emergency contact prominence**
*For any* provider in the Emergency Now section, emergency contact information should be prominently displayed
**Validates: Requirements 7.4**

**Property 23: Emergency section consistency**
*For any* change to a provider's emergency availability status, the Emergency Now section should reflect the change
**Validates: Requirements 7.5**

### Provider Registration Properties

**Property 24: Registration performance**
*For any* valid provider registration data, account creation should complete within 2 seconds
**Validates: Requirements 8.2**

**Property 25: Verification email delivery**
*For any* successful provider registration, a verification email should be sent to the registered email address
**Validates: Requirements 8.5**

### Provider Profile Management Properties

**Property 26: Dashboard field accessibility**
*For any* provider accessing their dashboard, all profile fields should be displayed and editable
**Validates: Requirements 9.1**

**Property 27: Multiple photo upload**
*For any* provider, they should be able to upload more than one photo to their profile gallery
**Validates: Requirements 9.2**

**Property 28: Photo upload performance**
*For any* valid photo uploaded by a provider, it should be stored and displayed in the profile within 3 seconds
**Validates: Requirements 9.3**

**Property 29: Accessibility flag editability**
*For any* provider profile, accessibility indicators and home visit availability flags should be settable
**Validates: Requirements 9.4**

**Property 30: Profile update confirmation**
*For any* profile changes saved by a provider, the changes should be persisted and a confirmation should be displayed
**Validates: Requirements 9.5**

### Verification Properties

**Property 31: Verification button enablement**
*For any* provider profile that is complete (all required fields filled), the verification request button should be enabled
**Validates: Requirements 10.1**

**Property 32: Verification queue addition**
*For any* verification request submitted by a provider, it should be added to the admin verification queue within 1 second
**Validates: Requirements 10.2**

**Property 33: Verification status notification**
*For any* change to a provider's verification status, a notification should be sent to the provider
**Validates: Requirements 10.3**

**Property 34: Verification badge display**
*For any* provider profile with verification_status='verified', a verification badge should be displayed
**Validates: Requirements 10.4**

**Property 35: Denial reason provision**
*For any* verification request that is denied, a reason for denial should be provided to the provider
**Validates: Requirements 10.5**

### Medical Ads Properties

**Property 36: Ad creation access control**
*For any* provider user, they should only be able to create medical ads if their profile verification_status='verified'
**Validates: Requirements 11.1**

**Property 37: Ad content support**
*For any* medical ad creation, the system should support both text and image content
**Validates: Requirements 11.2**

**Property 38: Ad approval requirement**
*For any* medical ad, it should not be visible to citizen users until its status='approved'
**Validates: Requirements 11.3**

**Property 39: Approved ad display locations**
*For any* medical ad with status='approved', it should be displayed in both the homepage carousel and inline in search results
**Validates: Requirements 11.4**

**Property 40: Ad status visibility**
*For any* provider, they should be able to view the status of all their medical ads in their dashboard
**Validates: Requirements 11.5**

### Profile Claiming Properties

**Property 41: Preloaded profile search**
*For any* search query for a practice name, matching preloaded profiles (is_preloaded=true) should be returned in results
**Validates: Requirements 12.1**

**Property 42: Claim button presence**
*For any* preloaded profile that is unclaimed (is_claimed=false), a claim button should be displayed
**Validates: Requirements 12.2**

**Property 43: Claim request queuing**
*For any* profile claim initiated by a provider, the request should be added to the admin verification queue
**Validates: Requirements 12.3**

**Property 44: Claim documentation requirement**
*For any* profile claim request, it should not be approved without verification documentation
**Validates: Requirements 12.4**

**Property 45: Claim ownership transfer**
*For any* approved profile claim, the profile's user_id should be updated to the claiming provider's user_id
**Validates: Requirements 12.5**

### Admin Verification Properties

**Property 46: Verification queue completeness**
*For any* admin accessing the verification queue, all pending verification requests should be displayed
**Validates: Requirements 13.1**

**Property 47: Verification request detail display**
*For any* verification request in the queue, provider details and submitted documentation should be shown
**Validates: Requirements 13.2**

**Property 48: Verification approval processing**
*For any* verification request approved by an admin, the provider's verification_status should be updated to 'verified' within 1 second
**Validates: Requirements 13.3**

**Property 49: Denial reason requirement**
*For any* verification request denial, a reason for denial should be required and stored
**Validates: Requirements 13.4**

**Property 50: Verification decision notification**
*For any* verification decision (approved or denied), an email notification should be sent to the provider
**Validates: Requirements 13.5**

### Admin Management Properties

**Property 51: Admin CRUD permissions**
*For any* admin user, they should be able to create, read, update, and delete any provider profile
**Validates: Requirements 14.1**

**Property 52: Admin modification logging**
*For any* provider profile modification by an admin, the change should be logged with timestamp and admin identifier
**Validates: Requirements 14.2**

**Property 53: Admin entity management**
*For any* admin user, they should be able to manage account types, specialties, and service categories
**Validates: Requirements 14.3**

**Property 54: Admin ad moderation**
*For any* admin user, they should be able to moderate and remove inappropriate medical ads
**Validates: Requirements 14.5**

### Data Import Properties

**Property 55: Bulk import functionality**
*For any* admin user, they should be able to import multiple provider records at once
**Validates: Requirements 15.1**

**Property 56: Import preload marking**
*For any* provider imported via bulk import, the created profile should have is_preloaded=true
**Validates: Requirements 15.2**

**Property 57: Preloaded profile claimability**
*For any* preloaded profile (is_preloaded=true), it should be marked as claimable by real providers
**Validates: Requirements 15.3**

**Property 58: Import data validation**
*For any* bulk import data, records missing required fields should be rejected before profile creation
**Validates: Requirements 15.4**

**Property 59: Claim preload flag removal**
*For any* preloaded profile that is successfully claimed, is_preloaded should be updated to false
**Validates: Requirements 15.5**

### Accessibility Properties

**Property 60: ARIA label presence**
*For any* interactive element in the application, it should have proper ARIA labels
**Validates: Requirements 16.2**

**Property 61: Keyboard navigation support**
*For any* functionality in the application, it should be accessible via keyboard navigation
**Validates: Requirements 16.3**

**Property 62: Color contrast compliance**
*For any* text element in both light and dark modes, the color contrast ratio should meet WCAG AA standards
**Validates: Requirements 16.4**

**Property 63: Image alt text presence**
*For any* image or icon in the application, it should have alternative text
**Validates: Requirements 16.5**

### Responsive Design Properties

**Property 64: Viewport size support**
*For any* screen width from 320px to 2560px, the application should display correctly without horizontal scrolling
**Validates: Requirements 17.1**

**Property 65: Responsive layout adaptation**
*For any* viewport size (mobile, tablet, desktop), navigation and layout should adapt appropriately
**Validates: Requirements 17.2**

**Property 66: Touch interaction optimization**
*For any* interactive element on mobile devices, touch targets should be at least 44x44 pixels
**Validates: Requirements 17.3**

**Property 67: Cross-browser functionality**
*For any* feature in the application, it should function correctly in Chrome, Firefox, Safari, and Edge browsers
**Validates: Requirements 17.5**

### AI Suggestions Properties

**Property 68: AI suggestion display**
*For any* search performed by a citizen user, AI-generated provider suggestions should be displayed
**Validates: Requirements 18.1**

**Property 69: Suggestion performance**
*For any* page load, smart suggestions should be displayed within 2 seconds
**Validates: Requirements 18.3**

**Property 70: Dynamic suggestion updates**
*For any* user interaction with the platform, suggestions should update dynamically based on the interaction
**Validates: Requirements 18.4**

**Property 71: Suggestion dismissal**
*For any* displayed suggestion, users should be able to dismiss or hide it
**Validates: Requirements 18.5**

## Error Handling

### Error Categories

1. **Network Errors**
   - Connection failures
   - Timeout errors
   - API unavailability

2. **Validation Errors**
   - Invalid input data
   - Missing required fields
   - Format violations

3. **Authorization Errors**
   - Unauthenticated access attempts
   - Insufficient permissions
   - Expired sessions

4. **Business Logic Errors**
   - Duplicate entries
   - Invalid state transitions
   - Constraint violations

5. **External Service Errors**
   - AI service failures
   - Map service unavailability
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

**Error Boundary Implementation:**
- Global ErrorBoundary component wraps the entire application
- Catches React component errors
- Logs errors to localStorage (last 50 errors)
- Displays user-friendly error messages
- Provides recovery options (reload, go home)

**API Error Handling:**
- Retry logic for transient failures (3 attempts with exponential backoff)
- Graceful degradation for non-critical features
- User-friendly error messages in the user's selected language
- Fallback content when external services fail

**Validation Error Handling:**
- Real-time form validation with immediate feedback
- Clear error messages next to invalid fields
- Prevent form submission until all errors are resolved
- Highlight invalid fields with visual indicators

**Authorization Error Handling:**
- Redirect to login page for unauthenticated access
- Display permission denied messages for insufficient permissions
- Automatic token refresh for expired sessions
- Clear indication of required role for protected features

### Error Recovery Mechanisms

1. **Automatic Retry**: Network requests retry up to 3 times with exponential backoff
2. **Offline Support**: Cache critical data for offline viewing
3. **Partial Failure Handling**: Continue operation even if non-critical features fail
4. **User Notification**: Toast notifications for errors with actionable recovery steps
5. **Error Logging**: All errors logged with context for debugging

## Testing Strategy

### Testing Approach

The CityHealth platform will employ a comprehensive testing strategy combining unit tests, integration tests, and property-based tests to ensure correctness and reliability.

### Unit Testing

**Framework**: Vitest (fast, Vite-native test runner)

**Coverage Areas:**
- Utility functions (date formatting, string manipulation, validation)
- Service layer functions (search, profile management, favorites)
- React hooks (useLanguage, useAnalytics, useAuth)
- Form validation logic
- Data transformation functions

**Example Unit Tests:**
- Test that `formatPhoneNumber` correctly formats Algerian phone numbers
- Test that `validateProviderProfile` rejects profiles missing required fields
- Test that `calculateDistance` correctly computes distance between coordinates
- Test that `filterProvidersByType` returns only providers of specified types

### Integration Testing

**Framework**: React Testing Library + Vitest

**Coverage Areas:**
- User authentication flows (sign up, sign in, sign out)
- Provider registration and profile creation
- Search and filter functionality
- Favorites management
- Admin verification workflows
- Profile claiming process

**Example Integration Tests:**
- Test complete user registration flow from form submission to email verification
- Test search with filters applied, verify correct results displayed
- Test adding/removing favorites, verify database updates
- Test admin approving verification request, verify provider status changes

### Property-Based Testing

**Framework**: fast-check (JavaScript property-based testing library)

**Configuration:**
- Minimum 100 iterations per property test
- Custom generators for domain-specific data (providers, users, search queries)
- Shrinking enabled to find minimal failing cases

**Property Test Organization:**
- Each correctness property from the design document implemented as a property-based test
- Tests tagged with format: `**Feature: cityhealth-platform, Property {number}: {property_text}**`
- One property-based test per correctness property

**Example Property Tests:**

```typescript
// Property 1: Search returns matching providers
test('Property 1: Search returns matching providers', () => {
  fc.assert(
    fc.asyncProperty(
      fc.record({
        query: fc.string(),
        provider_type: fc.array(fc.constantFrom('doctor', 'clinic', 'hospital')),
        city: fc.option(fc.string())
      }),
      async (searchParams) => {
        const results = await searchProviders(searchParams);
        // All results should match the search criteria
        results.providers.every(provider => 
          matchesSearchCriteria(provider, searchParams)
        );
      }
    ),
    { numRuns: 100 }
  );
});

// Property 4: Filter conjunction correctness
test('Property 4: Filter conjunction correctness', () => {
  fc.assert(
    fc.asyncProperty(
      fc.record({
        provider_type: fc.array(fc.constantFrom('doctor', 'clinic')),
        accessibility_features: fc.array(fc.string()),
        home_visit_available: fc.boolean()
      }),
      async (filters) => {
        const results = await applyFilters(filters);
        // All results should match ALL filter criteria
        results.every(provider => 
          matchesAllFilters(provider, filters)
        );
      }
    ),
    { numRuns: 100 }
  );
});
```

**Custom Generators:**

```typescript
// Generator for valid provider profiles
const providerArbitrary = fc.record({
  business_name: fc.string({ minLength: 1, maxLength: 100 }),
  provider_type: fc.constantFrom('doctor', 'clinic', 'hospital', 'pharmacy', 'laboratory'),
  phone: fc.string({ minLength: 10, maxLength: 15 }),
  address: fc.string({ minLength: 5, maxLength: 200 }),
  city: fc.constantFrom('Sidi Bel Abbès', 'Oran', 'Algiers'),
  latitude: fc.double({ min: 34.0, max: 36.0 }),
  longitude: fc.double({ min: -1.0, max: 1.0 }),
  is_emergency: fc.boolean(),
  accessibility_features: fc.array(fc.constantFrom('wheelchair', 'parking', 'elevator')),
  home_visit_available: fc.boolean()
});

// Generator for search queries
const searchQueryArbitrary = fc.record({
  query: fc.oneof(
    fc.constant(''),
    fc.string({ minLength: 1, maxLength: 50 })
  ),
  provider_type: fc.array(fc.constantFrom('doctor', 'clinic', 'hospital')),
  city: fc.option(fc.string()),
  accessibility_features: fc.array(fc.string()),
  home_visit_available: fc.option(fc.boolean())
});
```

### End-to-End Testing

**Framework**: Playwright (cross-browser E2E testing)

**Coverage Areas:**
- Critical user journeys (search → view profile → favorite)
- Provider onboarding flow
- Admin verification workflow
- Multilingual interface switching
- Responsive design on different devices

**Example E2E Tests:**
- Test citizen searching for a doctor, viewing profile, and adding to favorites
- Test provider registering, completing profile, and requesting verification
- Test admin reviewing verification queue and approving a provider
- Test language switching updates all UI text correctly

### Performance Testing

**Tools**: Lighthouse, WebPageTest

**Metrics:**
- Page load time < 3 seconds on 3G
- Time to Interactive < 5 seconds
- First Contentful Paint < 1.5 seconds
- Search response time < 2 seconds
- Filter application < 1 second

### Accessibility Testing

**Tools**: axe-core, WAVE, manual keyboard testing

**Coverage:**
- WCAG 2.1 Level AA compliance
- Keyboard navigation for all features
- Screen reader compatibility
- Color contrast ratios
- ARIA label correctness

### Test Execution Strategy

1. **Development**: Run unit tests on file save (watch mode)
2. **Pre-commit**: Run unit tests and linting
3. **CI/CD Pipeline**: Run all tests (unit, integration, property-based)
4. **Pre-deployment**: Run E2E tests and performance tests
5. **Post-deployment**: Run smoke tests on production

### Test Data Management

- **Mock Data**: Use factories to generate consistent test data
- **Seed Data**: Populate test database with realistic provider data
- **Fixtures**: Store common test scenarios as fixtures
- **Cleanup**: Reset database state between test runs

## Implementation Notes

### Phase 1: Core Infrastructure (Weeks 1-2)
- Set up project structure and dependencies
- Configure Supabase database and authentication
- Implement user roles and RLS policies
- Create base UI components and layouts
- Set up internationalization system

### Phase 2: Citizen Features (Weeks 3-4)
- Implement search functionality with filters
- Create provider profile pages
- Build favorites system
- Integrate Mapbox for location display
- Implement Emergency Now section

### Phase 3: Provider Features (Weeks 5-6)
- Build provider registration flow
- Create provider dashboard
- Implement profile management
- Add photo upload functionality
- Build verification request system

### Phase 4: Admin Features (Weeks 7-8)
- Create admin dashboard
- Build verification queue interface
- Implement profile claiming workflow
- Add bulk import functionality
- Create medical ads management

### Phase 5: AI & Advanced Features (Weeks 9-10)
- Integrate AI chatbot with Lovable AI Gateway
- Implement smart suggestions
- Add analytics tracking
- Build notification system
- Optimize performance

### Phase 6: Testing & Polish (Weeks 11-12)
- Write comprehensive test suite
- Conduct accessibility audit
- Perform cross-browser testing
- Optimize for mobile devices
- Security audit and penetration testing

### Technology Decisions

**Why React + TypeScript:**
- Type safety reduces runtime errors
- Large ecosystem of libraries
- Excellent developer experience
- Strong community support

**Why Supabase:**
- PostgreSQL provides robust relational data model
- Built-in authentication and authorization
- Row Level Security for fine-grained access control
- Real-time subscriptions for live updates
- Edge Functions for serverless compute
- Generous free tier for development

**Why TailwindCSS + shadcn/ui:**
- Rapid UI development
- Consistent design system
- Accessible components out of the box
- Easy customization
- Small bundle size with purging

**Why Mapbox:**
- Superior map quality and performance
- Excellent Algeria coverage
- Customizable styling
- Offline support
- Generous free tier

**Why fast-check for Property-Based Testing:**
- Native JavaScript/TypeScript support
- Excellent shrinking capabilities
- Custom generator support
- Good documentation and examples
- Active maintenance

### Security Considerations

1. **Authentication**: Supabase Auth with JWT tokens
2. **Authorization**: Row Level Security policies enforce access control
3. **Input Validation**: Zod schemas validate all user input
4. **File Upload Security**: Validate file types and sizes, scan for malware
5. **SQL Injection Prevention**: Parameterized queries via Supabase client
6. **XSS Prevention**: React automatically escapes output
7. **CSRF Protection**: SameSite cookies and CSRF tokens
8. **Rate Limiting**: Implement rate limiting on API endpoints
9. **Data Encryption**: HTTPS for all communications, encrypted at rest in Supabase

### Performance Optimization

1. **Code Splitting**: Lazy load routes and heavy components
2. **Image Optimization**: Use WebP format, lazy loading, responsive images
3. **Caching**: Cache API responses with TanStack Query
4. **Database Indexing**: Index frequently queried columns
5. **CDN**: Serve static assets from CDN
6. **Compression**: Enable gzip/brotli compression
7. **Bundle Size**: Tree shaking, minimize dependencies
8. **Analytics Batching**: Batch analytics events to reduce requests

### Monitoring and Observability

1. **Error Tracking**: Log errors to monitoring service (e.g., Sentry)
2. **Performance Monitoring**: Track Core Web Vitals
3. **User Analytics**: Track user behavior and feature usage
4. **Database Monitoring**: Monitor query performance and slow queries
5. **Uptime Monitoring**: Alert on service downtime
6. **Log Aggregation**: Centralize logs from edge functions

### Deployment Strategy

1. **Development**: Auto-deploy to dev environment on push to dev branch
2. **Staging**: Auto-deploy to staging on push to main branch
3. **Production**: Manual deployment after QA approval
4. **Rollback**: Keep previous 5 deployments for quick rollback
5. **Database Migrations**: Run migrations before deploying new code
6. **Feature Flags**: Use feature flags for gradual rollout

### Maintenance and Support

1. **Documentation**: Maintain up-to-date technical documentation
2. **Code Reviews**: All code changes require peer review
3. **Dependency Updates**: Regular security updates and dependency upgrades
4. **Backup Strategy**: Daily database backups with 30-day retention
5. **Incident Response**: On-call rotation for production issues
6. **User Support**: Help desk for user inquiries and issues
