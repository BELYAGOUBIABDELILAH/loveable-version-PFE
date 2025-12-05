# Implementation Plan - CityHealth Platform Migration & Redesign

> **Execution Priority:** Firebase migration → Leaflet integration → Design system → Dead code removal → Feature completion → Testing
> **Preserve:** All SQL migration files (archive only, don't import)

---

## PHASE 1: FIREBASE MIGRATION (Critical - Blocking)

- [x] 1. Set up Firebase infrastructure



- [x] 1.1 Configure Firebase project and environment


  - Create Firebase project in console
  - Add environment variables to `.env`: VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID
  - Install Firebase SDK: `npm install firebase`
  - _Requirements: 19.1, 19.2, 19.3_



- [x] 1.2 Create Firebase client configuration


  - Create `src/integrations/firebase/client.ts` with initializeApp, getAuth, getFirestore, getStorage
  - Export auth, db, storage instances
  - Create `src/integrations/firebase/index.ts` barrel export
  - _Requirements: 19.1, 19.2, 19.3_


- [x] 1.3 Implement Firebase Auth service

  - Create `src/integrations/firebase/services/authService.ts`
  - Implement signIn, signUp, signOut, signInWithGoogle, sendVerificationEmail
  - Implement onAuthStateChanged listener
  - Implement getCurrentUser helper
  - _Requirements: 8.4, 19.1_



- [x] 1.4 Write property test for Firebase Auth
  - **Property 63: Firebase Auth usage**
  - **Validates: Requirements 19.1**

- [x] 1.5 Implement Firebase Provider service
  - Create `src/integrations/firebase/services/providerService.ts`
  - Implement getProviders, getProviderById, createProvider, updateProvider, deleteProvider
  - Implement searchProviders with Firestore queries
  - Implement getEmergencyProviders
  - _Requirements: 19.2_

- [x] 1.6 Write property test for Firestore data storage
  - **Property 64: Firestore data storage**
  - **Validates: Requirements 19.2**

- [x] 1.7 Implement Firebase Storage service
  - Create `src/integrations/firebase/services/storageService.ts`
  - Implement uploadFile, deleteFile, getDownloadURL
  - Handle file validation (size, type)
  - _Requirements: 9.2, 9.3, 19.3_

- [x] 1.8 Write property test for Firebase Storage
  - **Property 65: Firebase Storage usage**
  - **Validates: Requirements 19.3**

- [x] 1.9 Create Firestore security rules

  - Create `firestore.rules` with security rules from design document
  - Implement helper functions: isAuthenticated, isAdmin, isProvider, isOwner
  - Configure rules for all collections: users, providers, verifications, medical_ads, favorites, profile_claims, admin_logs, specialties
  - _Requirements: 19.4_


- [x] 1.10 Update AuthContext to use Firebase

  - Modify `src/contexts/AuthContext.tsx` to use Firebase Auth
  - Replace Supabase auth calls with Firebase authService
  - Update user state management
  - Add role fetching from Firestore users collection
  - _Requirements: 5.2, 8.4, 19.1_

- [x] 2. Checkpoint - Firebase Core Setup





  - Ensure all tests pass, ask the user if questions arise.

---

## PHASE 2: REMOVE SUPABASE CODE (Critical - Blocking)

- [x] 3. Remove all Supabase dependencies



- [x] 3.1 Remove Supabase client and types



  - Delete `src/integrations/supabase/client.ts`
  - Delete `src/integrations/supabase/types.ts`
  - Remove `src/integrations/supabase/` directory
  - _Requirements: 19.6_

- [x] 3.2 Update services to use Firebase


  - Update `src/services/favoritesService.ts` to use Firestore
  - Update `src/services/fileUploadService.ts` to use Firebase Storage
  - Update `src/services/aiChatService.ts` to use Firebase (if applicable)
  - Update `src/services/analyticsService.ts` to use Firestore
  - _Requirements: 19.2, 19.3, 19.6_



- [x] 3.3 Update all pages to use Firebase services
  - Update SearchPage, ProvidersPage, ProviderProfilePage
  - Update EmergencyPage, FavoritesPage
  - Update AdminDashboard, ProviderDashboard
  - Update Profile, Settings pages
  - _Requirements: 19.2, 19.6_

- [x] 3.4 Remove Supabase packages

  - Run `npm uninstall @supabase/supabase-js`
  - Remove any Supabase-related dev dependencies
  - Archive `supabase/` directory (keep migrations for reference)
  - _Requirements: 19.6, 19.7_



- [x] 3.5 Write property test for legacy code removal

  - **Property 66: Legacy code removal**
  - **Validates: Requirements 19.6, 21.7**

---

## PHASE 3: LEAFLET MAP INTEGRATION (Critical - Blocking)

- [x] 4. Install and configure Leaflet






- [x] 4.1 Install Leaflet packages

  - Run `npm install leaflet react-leaflet react-leaflet-cluster`
  - Run `npm install -D @types/leaflet`
  - Import Leaflet CSS in main.tsx: `import 'leaflet/dist/leaflet.css'`
  - _Requirements: 21.1_


- [x] 4.2 Create Leaflet map components

  - Create `src/components/maps/MapContainer.tsx` wrapper component
  - Configure OpenStreetMap tiles: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
  - Set default center to Sidi Bel Abbès: [35.1833, -0.6333]
  - _Requirements: 21.1, 21.2_


- [x] 4.3 Write property test for Leaflet map usage

  - **Property 70: Leaflet map usage**
  - **Validates: Requirements 21.1, 21.2**


- [x] 4.4 Create provider marker component






  - Create `src/components/maps/ProviderMarker.tsx`
  - Create custom marker icons matching design system (Google Blue accent)
  - Implement popup with provider name, type, address, phone
  - _Requirements: 21.4, 21.6_


- [x] 4.5 Write property test for marker popups





  - **Property 71: Map marker popups**

  - **Validates: Requirements 21.4**

- [x] 4.6 Implement marker clustering






  - Add MarkerClusterGroup from react-leaflet-cluster
  - Configure cluster options: maxClusterRadius: 50, spiderfyOnMaxZoom: true

  - Style cluster icons to match design system
  - _Requirements: 21.5_



- [x] 4.7 Write property test for marker clustering





  - **Property 72: Marker clustering**
  - **Validates: Requirements 21.5**

- [x] 4.8 Integrate maps into pages


  - Replace MapPlaceholder in ProviderProfilePage with Leaflet map
  - Update SearchMap component to use Leaflet


  - Update MapPage to use Leaflet
  - Add geolocation centering when available
  - _Requirements: 3.4, 21.3_

- [x] 4.9 Write property test for Leaflet map presence





  - **Property 9: Leaflet map presence**
  - **Validates: Requirements 3.4**

- [x] 4.10 Remove Google Maps code





  - Remove any @googlemaps/* packages
  - Remove Google Maps API keys from config
  - Delete Google Maps components, hooks, utilities
  - _Requirements: 21.7_

- [x] 5. Checkpoint - Maps Integration





  - Ensure all tests pass, ask the user if questions arise.

---

## PHASE 4: GOOGLE ANTIGRAVITY DESIGN SYSTEM

- [x] 6. Implement design system foundation



- [x] 6.1 Update Tailwind configuration


  - Add design tokens to `tailwind.config.ts`
  - Colors: background #FFFFFF, primaryText #202124, secondaryText #5F6368, accent #4285F4, buttonPrimary #1F1F1F, buttonSecondary #F1F3F4
  - Typography: Google Sans font family with fallbacks
  - Spacing: sectionGap 120px, containerPadding 80px
  - Effects: shadow, pill border-radius 9999px
  - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6_

- [x] 6.2 Update global styles


  - Update `src/index.css` with Google Sans font import
  - Set body background to #FFFFFF
  - Set default text color to #202124
  - Remove all dark mode CSS variables and styles
  - _Requirements: 20.1, 20.2, 20.3, 20.8_

- [x] 6.3 Write property test for design system compliance


  - **Property 67: Design system compliance**
  - **Validates: Requirements 20.1, 20.2, 20.4, 20.5**



- [x] 6.4 Remove dark mode functionality
  - Remove dark mode toggle from Navbar
  - Delete ThemeContext or remove dark mode logic
  - Remove all dark: Tailwind variants from components
  - Remove dark theme CSS variables
  - _Requirements: 20.8_

- [x] 6.5 Write property test for dark mode removal
  - **Property 68: Dark mode removal**
  - **Validates: Requirements 20.8**

- [x] 6.6 Update Navbar component

  - Implement fixed/sticky header with transparent→white scroll transition
  - Update navigation items: Product, Use Cases↓, Pricing, Blog, Resources↓
  - Add black pill "Get Started" CTA button
  - Remove "CityHealth" text, keep logo only
  - _Requirements: 20.9, 20.10_

- [x] 6.7 Write property test for header scroll behavior


  - **Property 69: Header scroll behavior**
  - **Validates: Requirements 20.9**

- [x] 6.8 Create particle hero section


  - Install particles.js: `npm install tsparticles @tsparticles/react`
  - Create `src/components/homepage/ParticleHero.tsx`
  - Configure blue particles (#4285F4) with subtle animation
  - Add centered headline with dual CTA buttons (black primary, light grey secondary)
  - _Requirements: 20.7_


- [x] 6.9 Update button components

  - Update `src/components/ui/button.tsx` with pill shape (border-radius: 9999px)
  - Add primary variant: black background (#1F1F1F)
  - Add secondary variant: light grey background (#F1F3F4)
  - Apply soft shadows
  - _Requirements: 20.4, 20.5_

- [x] 6.10 Update card and container components



  - Apply soft shadows to cards: box-shadow: 0 10px 30px rgba(0,0,0,0.05)
  - Add border-radius: 16px to cards
  - Ensure massive whitespace between sections (120px gap)
  - _Requirements: 20.5, 20.6_

---

## PHASE 5: CODEBASE CLEANUP

- [x] 7. Remove dead code and fix inconsistencies





- [x] 7.1 Remove unused components


  - Scan for unused imports and components
  - Delete orphaned components not referenced anywhere
  - Remove old Index.tsx if duplicate exists
  - _Requirements: 22.1, 22.2_


- [x] 7.2 Write property test for no unused code

  - **Property 73: No unused code**
  - **Validates: Requirements 22.1**

- [x] 7.3 Consolidate duplicate logic


  - Identify duplicate utility functions
  - Merge similar components
  - Create shared hooks for common patterns
  - _Requirements: 22.3_

- [x] 7.4 Remove orphaned test files


  - Delete test files for removed features
  - Update test imports
  - _Requirements: 22.4_

- [x] 7.5 Fix AuthContext inconsistencies


  - Ensure single source of truth for auth state
  - Remove duplicate auth logic
  - Standardize auth hooks usage
  - _Requirements: 22.5_

- [x] 7.6 Fix broken API calls


  - Update all API calls to use Firebase services
  - Remove references to deleted endpoints
  - Update error handling
  - _Requirements: 22.6_

- [x] 7.7 Remove console.log statements


  - Search and remove all console.log from production code
  - Keep only error logging where appropriate
  - _Requirements: 22.7_



- [x] 7.8 Ensure TypeScript strict compliance





  - Run `tsc --noEmit` to check for errors
  - Fix any type errors
  - Ensure strict mode passes


  - _Requirements: 22.8_

- [x] 7.9 Write property test for TypeScript compliance





  - **Property 75: TypeScript strict compliance**
  - **Validates: Requirements 22.8**

- [x] 8. Checkpoint - Cleanup Complete





  - Ensure all tests pass, ask the user if questions arise.

---

## PHASE 6: SEARCH AND FILTER FEATURES

- [x] 9. Complete search functionality





- [x] 9.1 Update search service for Firebase


  - Implement Firestore queries for search
  - Support multilingual search (AR/FR/EN)
  - Add filter support for provider_type, accessibility_features, home_visit_available
  - _Requirements: 1.1, 1.2, 2.2, 2.3_


- [x] 9.2 Write property tests for search

  - **Property 1: Search returns matching providers**
  - **Property 2: Multilingual search equivalence**
  - **Validates: Requirements 1.1, 1.2**

- [x] 9.3 Write property test for filter conjunction


  - **Property 4: Filter conjunction correctness**
  - **Validates: Requirements 2.3**

- [x] 9.4 Implement filter persistence


  - Store filters in URL query parameters
  - Restore filters from URL on page load
  - Persist when navigating to/from provider profiles
  - _Requirements: 2.4_

- [x] 9.5 Write property test for filter persistence


  - **Property 5: Filter state persistence**
  - **Validates: Requirements 2.4**

- [x] 9.6 Write property test for result count


  - **Property 6: Result count accuracy**
  - **Validates: Requirements 2.5**


- [x] 9.7 Write property test for search result completeness

  - **Property 3: Search result completeness**
  - **Validates: Requirements 1.3**

---

## PHASE 7: PROVIDER PROFILE FEATURES

- [x] 10. Complete provider profile functionality





- [x] 10.1 Update ProviderProfilePage for Firebase


  - Fetch provider data from Firestore
  - Display contact info, photos, accessibility indicators
  - Integrate Leaflet map
  - _Requirements: 3.2, 3.4, 3.5_


- [x] 10.2 Write property tests for profile display

  - **Property 7: Profile data completeness**
  - **Property 8: Photo gallery functionality**
  - **Property 10: Accessibility indicator display**
  - **Validates: Requirements 3.2, 3.3, 3.5**

- [x] 10.3 Update ProviderDashboard for Firebase


  - Fetch and update provider data via Firestore
  - Implement photo upload via Firebase Storage
  - Add accessibility feature editor
  - _Requirements: 9.1, 9.2, 9.4_



- [x] 10.4 Write property tests for provider management








  - **Property 25: Dashboard field accessibility**
  - **Property 26: Multiple photo upload**
  - **Property 28: Accessibility flag editability**
  - **Property 29: Profile update confirmation**
  - **Validates: Requirements 9.1, 9.2, 9.4, 9.5**

---

## PHASE 8: FAVORITES SYSTEM

- [ ] 11. Complete favorites functionality
- [ ] 11.1 Update favorites service for Firebase
  - Store favorites in Firestore subcollection: /users/{userId}/favorites
  - Implement addFavorite, removeFavorite, getFavorites, isFavorite
  - _Requirements: 5.1, 5.4, 5.5_

- [ ] 11.2 Write property tests for favorites
  - **Property 14: Favorite addition**
  - **Property 15: Favorites display completeness**
  - **Property 16: Favorite removal**
  - **Validates: Requirements 5.1, 5.4, 5.5**

- [ ] 11.3 Update FavoritesPage for Firebase
  - Fetch favorites from Firestore
  - Display favorited providers
  - _Requirements: 5.4_

---

## PHASE 9: VERIFICATION AND MEDICAL ADS

- [ ] 12. Complete verification system
- [ ] 12.1 Update verification service for Firebase
  - Store verifications in Firestore
  - Implement request submission, status updates
  - _Requirements: 10.1, 10.2, 10.4_

- [ ] 12.2 Write property tests for verification
  - **Property 30: Verification button enablement**
  - **Property 31: Verification queue addition**
  - **Property 32: Verification badge display**
  - **Validates: Requirements 10.1, 10.2, 10.4**

- [ ] 12.3 Update medical ads for Firebase
  - Store ads in Firestore medical_ads collection
  - Implement ad creation, approval workflow
  - _Requirements: 11.1, 11.3, 11.4_

- [ ] 12.4 Write property tests for medical ads
  - **Property 34: Ad creation access control**
  - **Property 36: Ad approval requirement**
  - **Property 37: Approved ad display locations**
  - **Validates: Requirements 11.1, 11.3, 11.4**

---

## PHASE 10: ADMIN FEATURES

- [ ] 13. Complete admin functionality
- [ ] 13.1 Update AdminDashboard for Firebase
  - Fetch all data from Firestore
  - Implement CRUD operations on providers
  - Implement verification queue management
  - Implement ad moderation
  - _Requirements: 14.1, 14.5_

- [ ] 13.2 Write property tests for admin
  - **Property 46: Admin CRUD permissions**
  - **Property 47: Admin modification logging**
  - **Property 48: Admin ad moderation**
  - **Validates: Requirements 14.1, 14.2, 14.5**

- [ ] 13.3 Update bulk import for Firebase
  - Import providers to Firestore
  - Mark as preloaded
  - Validate required fields
  - _Requirements: 15.1, 15.2, 15.4_

- [ ] 13.4 Write property tests for bulk import
  - **Property 49: Bulk import functionality**
  - **Property 50: Import preload marking**
  - **Property 51: Import data validation**
  - **Validates: Requirements 15.1, 15.2, 15.4**

---

## PHASE 11: INTERNATIONALIZATION

- [ ] 14. Complete i18n functionality
- [ ] 14.1 Update language context
  - Ensure all translations are complete for AR/FR/EN
  - Implement RTL layout for Arabic
  - Persist language preference
  - _Requirements: 4.1, 4.3, 4.4_

- [ ] 14.2 Write property tests for i18n
  - **Property 11: Language switching completeness**
  - **Property 12: RTL layout for Arabic**
  - **Property 13: Preference persistence**
  - **Validates: Requirements 4.2, 4.3, 4.4**

---

## PHASE 12: ACCESSIBILITY AND RESPONSIVE DESIGN

- [ ] 15. Complete accessibility features
- [ ] 15.1 Add ARIA labels to all interactive elements
  - Audit all buttons, links, form inputs
  - Add aria-label, aria-describedby where needed
  - _Requirements: 16.2_

- [ ] 15.2 Write property tests for accessibility
  - **Property 53: ARIA label presence**
  - **Property 54: Keyboard navigation support**
  - **Property 55: Color contrast compliance**
  - **Property 56: Image alt text presence**
  - **Validates: Requirements 16.2, 16.3, 16.4, 16.5**

- [ ] 15.3 Ensure responsive design
  - Test at 320px, 768px, 1024px, 1440px, 2560px
  - Ensure touch targets are 44x44px minimum
  - Verify navigation adapts to viewport
  - _Requirements: 17.1, 17.2, 17.3_

- [ ] 15.4 Write property tests for responsive design
  - **Property 57: Viewport size support**
  - **Property 58: Responsive layout adaptation**
  - **Property 59: Touch interaction optimization**
  - **Property 60: Cross-browser functionality**
  - **Validates: Requirements 17.1, 17.2, 17.3, 17.5**

---

## PHASE 13: EMERGENCY AND CHATBOT

- [ ] 16. Complete emergency and chatbot features
- [ ] 16.1 Update EmergencyPage for Firebase
  - Fetch emergency providers from Firestore
  - Display prominently with contact info
  - _Requirements: 7.2, 7.4_

- [ ] 16.2 Write property tests for emergency
  - **Property 20: Emergency section filtering**
  - **Property 21: Emergency contact prominence**
  - **Validates: Requirements 7.2, 7.4**

- [ ] 16.3 Update chatbot for Firebase (if applicable)
  - Ensure multilingual support
  - Implement fallback behavior
  - _Requirements: 6.2, 6.3, 6.5_

- [ ] 16.4 Write property tests for chatbot
  - **Property 17: Chatbot response delivery**
  - **Property 18: Multilingual chatbot support**
  - **Property 19: Chatbot fallback behavior**
  - **Validates: Requirements 6.2, 6.3, 6.5**

---

## PHASE 14: FINAL TESTING AND POLISH

- [ ] 17. Run comprehensive tests
- [ ] 17.1 Run all property-based tests
  - Execute: `npm run test`
  - Ensure all 75 properties pass
  - Fix any failing tests
  - _Requirements: All_

- [ ] 17.2 Run accessibility audit
  - Use Lighthouse accessibility audit
  - Use axe DevTools
  - Fix any issues found
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5_

- [ ] 17.3 Test cross-browser compatibility
  - Test in Chrome, Firefox, Safari, Edge
  - Fix any browser-specific issues
  - _Requirements: 17.5_

- [ ] 17.4 Performance optimization
  - Ensure page load <3s on 3G
  - Optimize images (WebP, lazy loading)
  - Bundle size optimization
  - _Requirements: 17.4_

- [ ] 18. Final Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

---

## SUMMARY

**Total Phases:** 14
**Total Tasks:** ~70 subtasks
**Priority Order:** Firebase → Supabase removal → Leaflet → Design system → Cleanup → Features → Testing

**Key Deliverables:**
1. Complete Firebase migration (Auth, Firestore, Storage)
2. Leaflet map integration with OpenStreetMap
3. Google Antigravity design system (no dark mode)
4. Clean, maintainable codebase
5. 75 property-based tests validating all requirements

