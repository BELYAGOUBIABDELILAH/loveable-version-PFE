# Implementation Plan - Critical Fixes

> **Execution Priority:** P0 fixes first (auth, booking, content) → P1 fixes (verification, MapPage)
> **Estimated Duration:** 1-2 weeks for all critical fixes

---

## PHASE 1: AUTHENTICATION FIXES (P0 - Critical)

- [x] 1. Fix Provider Registration Access




- [x] 1.1 Remove ProtectedRoute from provider registration


  - Open `src/App.tsx`
  - Find route `/provider/register`
  - Remove `<ProtectedRoute requireRole="provider">` wrapper
  - Keep the route accessible to all users
  - _Requirements: 2.1, 2.3_

- [x] 1.2 Write property test for registration accessibility


  - **Property 3: Registration page accessibility**
  - **Validates: Requirements 2.1, 2.3**



- [x] 1.3 Update ProviderRegister to persist to Firestore
  - Open `src/pages/ProviderRegister.tsx`
  - Replace localStorage persistence with Firestore
  - Create provider document with `status: 'pending'`
  - Ensure `role: 'provider'` is set in userRoles
  - _Requirements: 2.4, 2.5_

- [x] 1.4 Write property test for Firestore persistence

  - **Property 4: Provider role assignment**
  - **Property 5: Registration data persistence**
  - **Validates: Requirements 2.4, 2.5**

- [x] 2. Implement Password Reset UI




- [x] 2.1 Create PasswordResetForm component


  - Create `src/components/auth/PasswordResetForm.tsx`
  - Add email input with validation
  - Add submit button calling `authService.resetPassword()`
  - Add success/error message display
  - Add "Back to Login" link
  - _Requirements: 1.1, 1.2, 1.3, 1.5_

- [x] 2.2 Integrate PasswordResetForm into AuthModal


  - Open `src/components/AuthModal.tsx`
  - Add view state: `'login' | 'register' | 'reset'`
  - Add "Forgot Password?" link in login form
  - Render PasswordResetForm when view is 'reset'
  - _Requirements: 1.1_



- [x] 2.3 Write property tests for password reset

  - **Property 1: Password reset email delivery**
  - **Property 2: Invalid email error handling**
  - **Validates: Requirements 1.2, 1.4**

- [x] 3. Checkpoint - Auth Fixes





  - Ensure all tests pass, ask the user if questions arise.

---

## PHASE 2: BOOKING SYSTEM (P0 - Critical)

- [x] 4. Create Appointment Service






- [x] 4.1 Create appointmentService


  - Create `src/integrations/firebase/services/appointmentService.ts`
  - Implement `createAppointment(data)` → creates Firestore doc
  - Implement `getAppointmentsByUser(userId)` → query by userId
  - Implement `getAppointmentsByProvider(providerId)` → query by providerId
  - Implement `updateAppointmentStatus(id, status)`
  - Implement `cancelAppointment(id)`
  - _Requirements: 3.2, 3.3_

- [x] 4.2 Add Appointment types


  - Update `src/integrations/firebase/types.ts`
  - Add `Appointment` interface with all fields
  - Add `AppointmentStatus` type
  - Add `CreateAppointmentData` interface
  - _Requirements: 3.3_

- [x] 4.3 Update Firestore security rules


  - Open `firestore.rules`
  - Add rules for `/appointments` collection
  - Allow read for appointment owner (user or provider)
  - Allow create for authenticated users
  - Allow update for owner or admin
  - _Requirements: 3.2_

- [x] 4.4 Write property test for appointment persistence


  - **Property 7: Appointment Firestore persistence**
  - **Validates: Requirements 3.2, 3.3**

- [x] 5. Connect BookingModal to UI






- [x] 5.1 Integrate BookingModal in ProviderProfilePage


  - Open `src/pages/ProviderProfilePage.tsx`
  - Add state: `const [showBooking, setShowBooking] = useState(false)`
  - Connect "Book Appointment" button to `setShowBooking(true)`
  - Add `<BookingModal>` component with provider props
  - _Requirements: 3.1_

- [x] 5.2 Update BookingModal to use appointmentService


  - Open `src/components/BookingModal.tsx`
  - Replace mock `saveAppointment` with `appointmentService.createAppointment()`
  - Add proper error handling
  - Show success toast on booking confirmation
  - _Requirements: 3.2_

- [x] 5.3 Write property test for booking modal activation


  - **Property 6: Booking modal activation**
  - **Validates: Requirements 3.1**

- [x] 5.4 Integrate BookingModal in FavoritesPage


  - Open `src/pages/FavoritesPage.tsx`
  - Add booking state and modal
  - Connect "RDV" button to open BookingModal
  - Pass correct provider data
  - _Requirements: 3.1_

- [x] 6. Add Appointments to Dashboards






- [x] 6.1 Add appointments section to UserProfilePage


  - Open `src/pages/UserProfilePage.tsx`
  - Add new tab "Mes Rendez-vous"
  - Fetch appointments using `appointmentService.getAppointmentsByUser()`
  - Display list with status, provider name, datetime
  - Add cancel button for pending appointments
  - _Requirements: 3.4_


- [x] 6.2 Write property test for citizen appointment visibility

  - **Property 8: Citizen appointment visibility**
  - **Validates: Requirements 3.4**

- [x] 6.3 Add appointments section to ProviderDashboard


  - Open `src/pages/ProviderDashboard.tsx`
  - Add new tab "Rendez-vous"
  - Fetch appointments using `appointmentService.getAppointmentsByProvider()`
  - Display list with citizen name, datetime, status
  - Add confirm/cancel actions
  - _Requirements: 3.5_



- [x] 6.4 Write property test for provider appointment visibility





  - **Property 9: Provider appointment visibility**
  - **Validates: Requirements 3.5**

- [x] 7. Checkpoint - Booking System





  - Ensure all tests pass, ask the user if questions arise.

---

## PHASE 3: ACCOUNT MANAGEMENT (P0 - Critical)

- [x] 8. Implement Account Deletion






- [x] 8.1 Create accountService


  - Create `src/integrations/firebase/services/accountService.ts`
  - Implement `deleteAccount(userId)`:
    - Delete Firebase Auth account
    - Delete user profile from Firestore
    - Delete user favorites
    - Anonymize or delete appointments
  - _Requirements: 4.3, 4.4_

- [x] 8.2 Create AccountDeletionDialog component


  - Create `src/components/profile/AccountDeletionDialog.tsx`
  - Add confirmation input (type email to confirm)
  - Add warning message about data loss
  - Add cancel and confirm buttons
  - Call `accountService.deleteAccount()` on confirm
  - Redirect to homepage after success
  - _Requirements: 4.1, 4.2, 4.5_

- [x] 8.3 Integrate AccountDeletionDialog in UserProfilePage


  - Open `src/pages/UserProfilePage.tsx`
  - Find "Supprimer le compte" button
  - Add state for dialog visibility
  - Connect button to open dialog
  - Pass user email to dialog
  - _Requirements: 4.1_

- [x] 8.4 Write property tests for account deletion


  - **Property 10: Deletion confirmation requirement**
  - **Property 11: Firebase Auth deletion**
  - **Property 12: Firestore data cleanup**
  - **Validates: Requirements 4.2, 4.3, 4.4**

- [x] 9. Checkpoint - Account Management





  - Ensure all tests pass, ask the user if questions arise.

---

## PHASE 4: CONTENT ALIGNMENT (P0 - Critical)

- [x] 10. Rewrite Why/How Pages



- [x] 10.1 Rewrite WhyPage for CityHealth


  - Open `src/pages/WhyPage.tsx`
  - Remove all Cortex references
  - Add CityHealth mission statement
  - Explain healthcare directory for Sidi Bel Abbès
  - Highlight key features: verified providers, emergency services, accessibility
  - Maintain Google Antigravity design system
  - _Requirements: 5.1, 5.3, 5.4_


- [x] 10.2 Rewrite HowPage for CityHealth

  - Open `src/pages/HowPage.tsx`
  - Remove all Cortex references
  - Add step-by-step guide for citizens
  - Add step-by-step guide for providers
  - Include screenshots or illustrations
  - Maintain Google Antigravity design system
  - _Requirements: 5.2, 5.3, 5.4_



- [x] 10.3 Write property test for no Cortex references





  - **Property 13: No Cortex references**
  - **Validates: Requirements 5.3**

- [x] 11. Checkpoint - Content Alignment





  - Ensure all tests pass, ask the user if questions arise.

---

## PHASE 5: PROVIDER VERIFICATION UI (P1 - Important)

- [ ] 12. Implement Verification Request UI

- [ ] 12.1 Create VerificationRequestCard component
  - Create `src/components/provider/VerificationRequestCard.tsx`
  - Display current verification status
  - Show "Request Verification" button if unverified
  - Disable button if profile incomplete
  - Add document upload functionality
  - _Requirements: 6.1, 6.2_

- [ ] 12.2 Create verificationService
  - Create `src/integrations/firebase/services/verificationService.ts`
  - Implement `createVerificationRequest(providerId, documents)`
  - Implement `getVerificationStatus(providerId)`
  - Implement `getVerificationByProvider(providerId)`
  - _Requirements: 6.3_

- [ ] 12.3 Integrate VerificationRequestCard in ProviderDashboard
  - Open `src/pages/ProviderDashboard.tsx`
  - Add VerificationRequestCard to profile section
  - Show denial reason if status is 'rejected'
  - Update UI when verification status changes
  - _Requirements: 6.4, 6.5_

- [ ] 12.4 Write property tests for verification
  - **Property 14: Verification button visibility**
  - **Property 15: Verification button enablement**
  - **Property 16: Verification request persistence**
  - **Property 17: Verification status display**
  - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**

- [ ] 13. Checkpoint - Verification UI
  - Ensure all tests pass, ask the user if questions arise.

---




## PHASE 6: UI FIXES (P1 - Important)

- [ ] 14. Fix FavoritesPage Login Button

- [ ] 14.1 Connect login button to AuthModal
  - Open `src/pages/FavoritesPage.tsx`
  - Add state: `const [showAuthModal, setShowAuthModal] = useState(false)`
  - Find "Se connecter" button for unauthenticated users
  - Add `onClick={() => setShowAuthModal(true)}`
  - Add `<AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />`
  - _Requirements: 7.1, 7.2_

- [x] 14.2 Ensure no redirect for unauthenticated users

  - Verify FavoritesPage does NOT use ProtectedRoute
  - Ensure unauthenticated users see login prompt, not redirect
  - _Requirements: 7.4_





- [x] 14.3 Write property tests for FavoritesPage

  - **Property 18: Unauthenticated favorites prompt**

  - **Property 19: Login button functionality**
  - **Property 20: No favorites redirect**
  - **Validates: Requirements 7.1, 7.2, 7.4**


- [ ] 15. Connect MapPage to Firestore

- [ ] 15.1 Update MapPage data source
  - Open `src/pages/MapPage.tsx`
  - Remove mock data imports

  - Add useQuery to fetch from `providerService.getAllProviders()`
  - Handle loading and error states
  - _Requirements: 8.1, 8.2_

- [ ] 15.2 Add filter support to MapPage
  - Implement same filters as SearchPage
  - Update markers when filters change
  - Sync filter state with URL params
  - _Requirements: 8.4, 8.5_

- [x] 15.3 Write property tests for MapPage

  - **Property 21: MapPage Firestore data source**
  - **Property 22: Map marker completeness**
  - **Property 23: Map filter synchronization**
  - **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5**

- [ ] 16. Final Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

---

## SUMMARY

**Total Phases:** 6
**Total Tasks:** ~30 subtasks
**Priority Order:** Auth fixes → Booking system → Account management → Content → Verification UI → UI fixes

**Key Deliverables:**
1. Provider registration accessible without role restriction
2. Password reset UI in AuthModal
3. Complete booking system with Firestore persistence
4. Account deletion functionality
5. CityHealth-branded Why/How pages
6. Provider verification request UI
7. FavoritesPage login button working
8. MapPage connected to Firestore

**Sprint Breakdown:**
- Sprint 1 (Days 1-3): Phases 1-2 (Auth + Booking)
- Sprint 2 (Days 4-5): Phases 3-4 (Account + Content)
- Sprint 3 (Days 6-7): Phases 5-6 (Verification + UI fixes)
