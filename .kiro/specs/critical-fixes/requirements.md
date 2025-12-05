# Requirements Document

## Introduction

This document covers critical fixes identified during the CityHealth platform audit. These are P0 (critical) and P1 (important) issues that block core user flows or create security/UX problems. The fixes address authentication gaps, booking system completion, account management, route protection issues, and content alignment.

## Glossary

- **CityHealth Platform**: The web-based healthcare directory system
- **AuthModal**: The modal component handling login/signup flows
- **ProtectedRoute**: React Router component that restricts access based on authentication and role
- **BookingModal**: Existing component for appointment scheduling (currently offline-only)
- **Firebase Auth**: Authentication service providing email/password and Google OAuth
- **Firestore**: Firebase's NoSQL document database for data persistence
- **Provider Registration**: The process by which healthcare providers create accounts and profiles

## Requirements

### Requirement 1: Password Reset UI

**User Story:** As a user who forgot my password, I want to reset it via email, so that I can regain access to my account

#### Acceptance Criteria

1. WHEN a user clicks "Forgot Password" in the AuthModal, THE CityHealth Platform SHALL display a password reset form
2. WHEN a user submits a valid email address, THE CityHealth Platform SHALL call Firebase Auth sendPasswordResetEmail within 2 seconds
3. THE CityHealth Platform SHALL display a success message confirming the reset email was sent
4. WHEN a user submits an invalid or non-existent email, THE CityHealth Platform SHALL display an appropriate error message
5. THE CityHealth Platform SHALL provide a link to return to the login form from the reset form

### Requirement 2: Provider Registration Access

**User Story:** As a new healthcare provider, I want to register on the platform, so that I can create and manage my provider profile

#### Acceptance Criteria

1. THE CityHealth Platform SHALL allow unauthenticated users to access the provider registration page at `/provider/register`
2. WHEN a user selects "provider" role during signup, THE CityHealth Platform SHALL redirect them to the provider registration flow
3. THE CityHealth Platform SHALL NOT require `role=provider` to access the registration page (remove ProtectedRoute restriction)
4. WHEN a provider completes registration, THE CityHealth Platform SHALL create their account with `role=provider` in Firestore
5. THE CityHealth Platform SHALL persist provider registration data to Firestore instead of localStorage

### Requirement 3: Booking System Persistence

**User Story:** As a citizen, I want to book appointments with providers, so that I can schedule healthcare visits

#### Acceptance Criteria

1. WHEN a user clicks "Book Appointment" on a provider profile, THE CityHealth Platform SHALL open the BookingModal
2. WHEN a user confirms a booking, THE CityHealth Platform SHALL create an appointment document in Firestore
3. THE CityHealth Platform SHALL store appointments in `/appointments` collection with providerId, userId, datetime, status, and contactInfo
4. THE CityHealth Platform SHALL display booked appointments in the citizen's profile/dashboard
5. THE CityHealth Platform SHALL display incoming appointments in the provider's dashboard
6. WHEN a booking is created, THE CityHealth Platform SHALL send a confirmation notification to both parties

### Requirement 4: Account Deletion

**User Story:** As a user, I want to delete my account, so that I can remove my data from the platform

#### Acceptance Criteria

1. WHEN a user clicks "Delete Account" in their profile settings, THE CityHealth Platform SHALL display a confirmation dialog
2. THE CityHealth Platform SHALL require the user to confirm deletion by typing their email or a confirmation phrase
3. WHEN deletion is confirmed, THE CityHealth Platform SHALL delete the user's Firebase Auth account
4. WHEN deletion is confirmed, THE CityHealth Platform SHALL delete or anonymize the user's Firestore documents (profile, favorites, appointments)
5. THE CityHealth Platform SHALL redirect the user to the homepage after successful account deletion

### Requirement 5: CityHealth Content Alignment

**User Story:** As a visitor, I want to see consistent CityHealth branding on all pages, so that I understand what the platform offers

#### Acceptance Criteria

1. THE CityHealth Platform SHALL display CityHealth-specific content on the Why page explaining the platform's mission for Sidi Bel Abbès healthcare
2. THE CityHealth Platform SHALL display CityHealth-specific content on the How page explaining how to use the platform
3. THE CityHealth Platform SHALL remove all references to "Cortex" or other unrelated branding
4. THE CityHealth Platform SHALL maintain consistent visual design with the Google Antigravity design system on these pages
5. THE CityHealth Platform SHALL include relevant healthcare directory features and benefits in the content

### Requirement 6: Provider Verification Request UI

**User Story:** As a provider, I want to request verification for my profile, so that citizens can trust my listing

#### Acceptance Criteria

1. WHEN a provider accesses their dashboard, THE CityHealth Platform SHALL display a "Request Verification" button if not yet verified
2. THE CityHealth Platform SHALL enable the verification button only when required profile fields are complete
3. WHEN a provider clicks "Request Verification", THE CityHealth Platform SHALL create a verification request in Firestore
4. THE CityHealth Platform SHALL display the current verification status (pending/verified/rejected) in the provider dashboard
5. WHEN a verification request is denied, THE CityHealth Platform SHALL display the denial reason to the provider

### Requirement 7: FavoritesPage Login Button

**User Story:** As an unauthenticated user on the favorites page, I want to sign in, so that I can access my saved providers

#### Acceptance Criteria

1. WHEN an unauthenticated user visits `/favorites`, THE CityHealth Platform SHALL display a login prompt
2. WHEN the user clicks the "Sign In" button, THE CityHealth Platform SHALL open the AuthModal
3. WHEN the user successfully authenticates, THE CityHealth Platform SHALL display their favorites list
4. THE CityHealth Platform SHALL NOT redirect unauthenticated users away from the favorites page

### Requirement 8: MapPage Firebase Integration

**User Story:** As a user viewing the map, I want to see real provider locations, so that I can find healthcare services near me

#### Acceptance Criteria

1. THE CityHealth Platform SHALL fetch provider data from Firestore on the MapPage
2. THE CityHealth Platform SHALL NOT use mock/local data for the MapPage in production mode
3. WHEN providers are loaded, THE CityHealth Platform SHALL display markers for all providers with valid coordinates
4. THE CityHealth Platform SHALL apply the same filters available on SearchPage to the MapPage
5. THE CityHealth Platform SHALL update markers when filters change
