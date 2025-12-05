# Design Document - Critical Fixes

## Overview

This design document covers the critical fixes identified during the CityHealth platform audit. These fixes address blocking issues in authentication, booking, account management, and content alignment that prevent core user flows from functioning correctly.

The fixes are prioritized as:
- **P0 (Critical)**: Blocking core functionality - must fix immediately
- **P1 (Important)**: Significant UX/functionality gaps - fix within 2 weeks

## Architecture

### Current State Issues

```
┌─────────────────────────────────────────────────────────────┐
│                    CURRENT PROBLEMS                          │
├─────────────────────────────────────────────────────────────┤
│  Auth Flow:                                                  │
│  ❌ /provider/register requires role=provider (blocks new)  │
│  ❌ No password reset UI (function exists, no form)         │
│  ❌ Account deletion button not functional                  │
│                                                              │
│  Booking Flow:                                               │
│  ❌ BookingModal exists but not connected to buttons        │
│  ❌ No Firestore persistence (localStorage only)            │
│  ❌ No dashboard views for appointments                     │
│                                                              │
│  Content:                                                    │
│  ❌ Why/How pages show "Cortex" instead of "CityHealth"     │
│                                                              │
│  Data:                                                       │
│  ❌ MapPage uses mock data instead of Firestore             │
│  ❌ Provider verification UI missing from dashboard         │
└─────────────────────────────────────────────────────────────┘
```

### Target State

```
┌─────────────────────────────────────────────────────────────┐
│                    TARGET STATE                              │
├─────────────────────────────────────────────────────────────┤
│  Auth Flow:                                                  │
│  ✅ /provider/register accessible without role restriction  │
│  ✅ Password reset form in AuthModal                        │
│  ✅ Account deletion with confirmation + cleanup            │
│                                                              │
│  Booking Flow:                                               │
│  ✅ BookingModal opens from all "Book" buttons              │
│  ✅ Appointments persisted to Firestore                     │
│  ✅ Citizen dashboard shows their appointments              │
│  ✅ Provider dashboard shows incoming appointments          │
│                                                              │
│  Content:                                                    │
│  ✅ Why/How pages with CityHealth branding                  │
│                                                              │
│  Data:                                                       │
│  ✅ MapPage fetches from Firestore                          │
│  ✅ Provider verification request UI in dashboard           │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Password Reset Component

```typescript
// src/components/auth/PasswordResetForm.tsx
interface PasswordResetFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

interface PasswordResetState {
  email: string;
  isLoading: boolean;
  error: string | null;
  success: boolean;
}
```

**Integration with AuthModal:**
- Add new tab/view state: `'login' | 'register' | 'reset'`
- "Forgot Password?" link in login form triggers reset view
- Back button returns to login view

### 2. Provider Registration Route Fix

```typescript
// src/App.tsx - BEFORE
<Route path="/provider/register" element={
  <ProtectedRoute requireRole="provider">
    <ProviderRegister />
  </ProtectedRoute>
} />

// src/App.tsx - AFTER
<Route path="/provider/register" element={
  <ProviderRegister />
} />
```

**Registration Flow Changes:**
- Remove ProtectedRoute wrapper entirely
- Allow unauthenticated access
- Handle auth within ProviderRegister component
- Persist to Firestore instead of localStorage

### 3. Booking System Components

```typescript
// src/integrations/firebase/services/appointmentService.ts
interface AppointmentService {
  createAppointment(data: CreateAppointmentData): Promise<string>;
  getAppointmentsByUser(userId: string): Promise<Appointment[]>;
  getAppointmentsByProvider(providerId: string): Promise<Appointment[]>;
  updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<void>;
  cancelAppointment(id: string): Promise<void>;
}

interface CreateAppointmentData {
  providerId: string;
  userId: string;
  datetime: Date;
  contactInfo: {
    name: string;
    phone: string;
    email?: string;
  };
  notes?: string;
}

type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
```

**BookingModal Integration Points:**
- `ProviderProfilePage`: "Book Appointment" button
- `FavoritesPage`: "RDV" button on favorite cards
- `SearchResults`: Optional quick-book action

### 4. Account Deletion Component

```typescript
// src/components/profile/AccountDeletionDialog.tsx
interface AccountDeletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail: string;
}

// src/integrations/firebase/services/accountService.ts
interface AccountService {
  deleteAccount(userId: string): Promise<void>;
  // Deletes: Firebase Auth account, profile, favorites, appointments
}
```

### 5. Verification Request Component

```typescript
// src/components/provider/VerificationRequestCard.tsx
interface VerificationRequestCardProps {
  provider: Provider;
  onRequestSubmitted: () => void;
}

interface VerificationRequest {
  id: string;
  providerId: string;
  userId: string;
  documents: string[]; // URLs to uploaded documents
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: Timestamp;
  reviewedAt?: Timestamp;
  reviewedBy?: string;
}
```

## Data Models

### New Firestore Collection: appointments

```
/appointments/{appointmentId}
  - id: string
  - providerId: string
  - userId: string
  - datetime: timestamp
  - status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  - contactInfo: {
      name: string
      phone: string
      email: string | null
    }
  - notes: string | null
  - createdAt: timestamp
  - updatedAt: timestamp
```

### Updated Collection: verifications

```
/verifications/{verificationId}
  - id: string
  - providerId: string
  - userId: string
  - documentType: string
  - documentUrls: string[]
  - status: 'pending' | 'approved' | 'rejected'
  - rejectionReason: string | null
  - reviewedBy: string | null
  - reviewedAt: timestamp | null
  - createdAt: timestamp
```

### Firestore Security Rules Additions

```javascript
// Appointments collection
match /appointments/{appointmentId} {
  allow read: if isAuthenticated() && 
    (resource.data.userId == request.auth.uid || 
     resource.data.providerId in getUserProviderIds());
  allow create: if isAuthenticated();
  allow update: if isAuthenticated() && 
    (resource.data.userId == request.auth.uid || 
     resource.data.providerId in getUserProviderIds() ||
     isAdmin());
  allow delete: if isAdmin();
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Password Reset Properties

**Property 1: Password reset email delivery**
*For any* valid email address submitted to the password reset form, Firebase Auth sendPasswordResetEmail should be called with that email
**Validates: Requirements 1.2**

**Property 2: Invalid email error handling**
*For any* invalid or malformed email submitted to the password reset form, an appropriate error message should be displayed without calling Firebase
**Validates: Requirements 1.4**

### Provider Registration Properties

**Property 3: Registration page accessibility**
*For any* user (authenticated or not), the `/provider/register` route should be accessible without role restrictions
**Validates: Requirements 2.1, 2.3**

**Property 4: Provider role assignment**
*For any* completed provider registration, the created Firestore user document should have `role: 'provider'`
**Validates: Requirements 2.4**

**Property 5: Registration data persistence**
*For any* provider registration submission, data should be persisted to Firestore, not localStorage
**Validates: Requirements 2.5**

### Booking System Properties

**Property 6: Booking modal activation**
*For any* "Book Appointment" button click on a provider profile, the BookingModal should open with correct provider data
**Validates: Requirements 3.1**

**Property 7: Appointment Firestore persistence**
*For any* confirmed booking, an appointment document should be created in Firestore with all required fields
**Validates: Requirements 3.2, 3.3**

**Property 8: Citizen appointment visibility**
*For any* authenticated citizen with appointments, all their appointments should be visible in their dashboard
**Validates: Requirements 3.4**

**Property 9: Provider appointment visibility**
*For any* provider with incoming appointments, all appointments for their profile should be visible in their dashboard
**Validates: Requirements 3.5**

### Account Deletion Properties

**Property 10: Deletion confirmation requirement**
*For any* account deletion attempt, the action should not proceed without explicit user confirmation
**Validates: Requirements 4.2**

**Property 11: Firebase Auth deletion**
*For any* confirmed account deletion, the Firebase Auth account should be deleted
**Validates: Requirements 4.3**

**Property 12: Firestore data cleanup**
*For any* confirmed account deletion, associated Firestore documents (profile, favorites) should be deleted or anonymized
**Validates: Requirements 4.4**

### Content Alignment Properties

**Property 13: No Cortex references**
*For any* page in the application, there should be no references to "Cortex" or unrelated branding
**Validates: Requirements 5.3**

### Verification Request Properties

**Property 14: Verification button visibility**
*For any* unverified provider accessing their dashboard, a "Request Verification" button should be visible
**Validates: Requirements 6.1**

**Property 15: Verification button enablement**
*For any* provider with incomplete required fields, the verification request button should be disabled
**Validates: Requirements 6.2**

**Property 16: Verification request persistence**
*For any* verification request submission, a document should be created in Firestore verifications collection
**Validates: Requirements 6.3**

**Property 17: Verification status display**
*For any* provider, their current verification status should be visible in their dashboard
**Validates: Requirements 6.4**

### FavoritesPage Properties

**Property 18: Unauthenticated favorites prompt**
*For any* unauthenticated user visiting `/favorites`, a login prompt should be displayed
**Validates: Requirements 7.1**

**Property 19: Login button functionality**
*For any* click on the "Sign In" button on FavoritesPage, the AuthModal should open
**Validates: Requirements 7.2**

**Property 20: No favorites redirect**
*For any* unauthenticated user on `/favorites`, they should NOT be redirected away from the page
**Validates: Requirements 7.4**

### MapPage Properties

**Property 21: MapPage Firestore data source**
*For any* MapPage load, provider data should be fetched from Firestore, not mock data
**Validates: Requirements 8.1, 8.2**

**Property 22: Map marker completeness**
*For any* provider with valid coordinates in Firestore, a marker should be displayed on the map
**Validates: Requirements 8.3**

**Property 23: Map filter synchronization**
*For any* filter change on MapPage, the displayed markers should update to reflect the filter criteria
**Validates: Requirements 8.4, 8.5**

## Error Handling

### Password Reset Errors
- Invalid email format: Display inline validation error
- Email not found: Display generic "If account exists, email sent" (security)
- Network error: Display retry option with error message
- Rate limiting: Display "Too many attempts, try again later"

### Booking Errors
- Provider unavailable: Display message and suggest alternatives
- Slot already taken: Refresh slots and notify user
- Network error: Save draft locally, retry on reconnect
- Validation error: Highlight invalid fields

### Account Deletion Errors
- Re-authentication required: Prompt for password
- Network error: Warn user and offer retry
- Partial deletion: Log error, notify admin, inform user

### Verification Request Errors
- File upload failure: Retry with exponential backoff
- Invalid file type: Display accepted formats
- File too large: Display size limit

## Testing Strategy

### Testing Framework
- **Unit Tests**: Vitest
- **Property-Based Tests**: fast-check
- **Component Tests**: React Testing Library

### Test Categories

**1. Password Reset Tests**
- Form renders correctly
- Email validation works
- Firebase function called on valid submit
- Error states display correctly
- Navigation back to login works

**2. Provider Registration Tests**
- Route accessible without auth
- Form validation works
- Firestore document created with correct role
- No localStorage usage

**3. Booking System Tests**
- Modal opens from all trigger points
- Appointment created in Firestore
- Required fields validated
- Dashboard displays appointments correctly

**4. Account Deletion Tests**
- Confirmation required before deletion
- Firebase Auth account deleted
- Firestore documents cleaned up
- Redirect to homepage after deletion

**5. Content Tests**
- No "Cortex" references in codebase
- CityHealth branding present on Why/How pages

**6. Verification Tests**
- Button visible for unverified providers
- Button disabled when profile incomplete
- Request created in Firestore
- Status displayed correctly

**7. MapPage Tests**
- Data fetched from Firestore
- Markers rendered for providers with coordinates
- Filters update markers correctly
