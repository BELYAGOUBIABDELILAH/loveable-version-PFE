# Requirements Document

## Introduction

CityHealth is a digital healthcare directory platform designed for citizens of Sidi Bel Abbès, Algeria. The system provides centralized access to verified healthcare providers including hospitals, clinics, private doctors, pharmacies, and labs. The platform emphasizes data reliability, accessibility, and user-friendliness through a responsive web application with multilingual support.

This document covers the complete platform migration and redesign including: Firebase backend migration, Google Antigravity design system implementation, Leaflet map integration, and codebase cleanup.

## Glossary

- **CityHealth Platform**: The web-based healthcare directory system
- **Citizen User**: An individual accessing the platform to find healthcare providers (authenticated or unauthenticated)
- **Provider User**: A healthcare provider (hospital, clinic, doctor, pharmacy, lab) managing their profile
- **Admin User**: A system administrator with full control over verification and moderation
- **Provider Profile**: A detailed listing of a healthcare provider including contact information, services, and accessibility features
- **Verification Queue**: A list of provider profiles awaiting admin approval
- **Profile Claiming**: The process by which a real provider takes ownership of a preloaded profile
- **Medical Ad**: A promotional content item created by verified providers
- **Accessibility Indicator**: A marker showing wheelchair accessibility or other accessibility features
- **Home Visit Availability**: A flag indicating whether a provider offers mobile/home services
- **Firebase**: Google's Backend-as-a-Service platform providing authentication, database, and storage
- **Firestore**: Firebase's NoSQL document database
- **Google Antigravity Design**: Ultra-minimal, agentic design aesthetic based on Material Design 3
- **Leaflet**: Open-source JavaScript library for interactive maps

## Requirements

### Requirement 1: Search and Discovery

**User Story:** As a citizen, I want to search for healthcare providers by service type and location, so that I can quickly find relevant providers near me

#### Acceptance Criteria

1. WHEN a Citizen User enters a service type and location in the search bar, THE CityHealth Platform SHALL display matching Provider Profiles within 2 seconds
2. THE CityHealth Platform SHALL support search queries in Arabic, French, and English languages
3. WHEN search results are displayed, THE CityHealth Platform SHALL show a minimum of provider name, type, location, and accessibility indicators for each result
4. THE CityHealth Platform SHALL allow Citizen Users to access search functionality without authentication
5. WHEN no matching results are found, THE CityHealth Platform SHALL display a message suggesting alternative search terms

### Requirement 2: Search Filtering

**User Story:** As a citizen, I want to filter search results by provider type, accessibility features, and home visit availability, so that I can narrow down options that meet my specific needs

#### Acceptance Criteria

1. WHEN a Citizen User applies a filter to search results, THE CityHealth Platform SHALL update the displayed results within 1 second
2. THE CityHealth Platform SHALL provide filters for provider type, accessibility features, and Home Visit Availability
3. WHEN multiple filters are applied, THE CityHealth Platform SHALL display only Provider Profiles matching all selected criteria
4. THE CityHealth Platform SHALL persist filter selections while the Citizen User navigates between search results and profile pages
5. THE CityHealth Platform SHALL display the count of matching results after each filter application

### Requirement 3: Provider Profile Display

**User Story:** As a citizen, I want to view detailed provider profiles with contact information, photos, and map location, so that I can make informed decisions about which provider to contact

#### Acceptance Criteria

1. WHEN a Citizen User selects a Provider Profile from search results, THE CityHealth Platform SHALL display the complete profile page within 2 seconds
2. THE CityHealth Platform SHALL display provider contact information including phone number, address, and operating hours
3. WHEN a Provider Profile includes photos, THE CityHealth Platform SHALL display them in a grid layout with modal viewer functionality
4. THE CityHealth Platform SHALL embed a Leaflet interactive map showing the provider location on each profile page
5. THE CityHealth Platform SHALL display Accessibility Indicators and Home Visit Availability status on the profile page

### Requirement 4: Internationalization

**User Story:** As a citizen, I want to access the platform in my preferred language, so that I can use the system comfortably

#### Acceptance Criteria

1. THE CityHealth Platform SHALL support Arabic, French, and English language interfaces
2. WHEN a Citizen User selects a language, THE CityHealth Platform SHALL update all interface text within 1 second
3. THE CityHealth Platform SHALL apply right-to-left (RTL) layout when Arabic language is selected
4. THE CityHealth Platform SHALL persist language preferences across user sessions
5. THE CityHealth Platform SHALL translate all UI text, validation messages, and error messages in the selected language

### Requirement 5: Favorites System

**User Story:** As an authenticated citizen, I want to save favorite providers, so that I can quickly access them later

#### Acceptance Criteria

1. WHEN an authenticated Citizen User clicks the favorite button on a Provider Profile, THE CityHealth Platform SHALL add the provider to their favorites list within 1 second
2. THE CityHealth Platform SHALL require Firebase authentication before allowing favorite functionality
3. WHEN an unauthenticated Citizen User attempts to favorite a provider, THE CityHealth Platform SHALL prompt them to sign in or register
4. THE CityHealth Platform SHALL display all favorited providers in a dedicated favorites section accessible from the user dashboard
5. WHEN a Citizen User removes a provider from favorites, THE CityHealth Platform SHALL update the favorites list immediately

### Requirement 6: AI Chatbot

**User Story:** As a citizen, I want to interact with a chatbot for quick assistance, so that I can get answers without navigating through the entire platform

#### Acceptance Criteria

1. THE CityHealth Platform SHALL provide a chatbot interface accessible from any page
2. WHEN a Citizen User submits a question to the chatbot, THE CityHealth Platform SHALL provide a response within 3 seconds
3. THE CityHealth Platform SHALL support chatbot interactions in Arabic, French, and English
4. THE CityHealth Platform SHALL allow unauthenticated Citizen Users to access the chatbot
5. WHEN the chatbot cannot answer a query, THE CityHealth Platform SHALL provide relevant search suggestions or contact information

### Requirement 7: Emergency Services

**User Story:** As a citizen, I want to view an "Emergency Now" section showing 24/7 available services, so that I can quickly find help during emergencies

#### Acceptance Criteria

1. THE CityHealth Platform SHALL display an Emergency Now section on the homepage
2. THE CityHealth Platform SHALL show only Provider Profiles marked as available 24/7 in the Emergency Now section
3. WHEN a Citizen User accesses the Emergency Now section, THE CityHealth Platform SHALL display results within 1 second
4. THE CityHealth Platform SHALL highlight emergency contact information prominently for each provider in this section
5. THE CityHealth Platform SHALL update the Emergency Now section automatically when provider availability changes

### Requirement 8: Provider Registration

**User Story:** As a healthcare provider, I want to register and create my profile with minimal information initially, so that I can get started quickly

#### Acceptance Criteria

1. THE CityHealth Platform SHALL provide a registration form requiring only provider type, name, and contact information
2. WHEN a Provider User submits the registration form, THE CityHealth Platform SHALL create their Firebase account within 2 seconds
3. THE CityHealth Platform SHALL display a progress bar showing profile completion percentage after registration
4. THE CityHealth Platform SHALL support email/password and Google OAuth authentication methods via Firebase Auth
5. THE CityHealth Platform SHALL send a verification email after successful registration

### Requirement 9: Provider Profile Management

**User Story:** As a healthcare provider, I want to manage my profile information and upload photos, so that citizens can find accurate information about my services

#### Acceptance Criteria

1. WHEN a Provider User accesses their dashboard, THE CityHealth Platform SHALL display all editable profile fields
2. THE CityHealth Platform SHALL allow Provider Users to upload multiple photos to their profile gallery via Firebase Storage
3. WHEN a Provider User uploads a photo, THE CityHealth Platform SHALL store it and display it in the profile within 3 seconds
4. THE CityHealth Platform SHALL allow Provider Users to set Accessibility Indicators and Home Visit Availability flags
5. WHEN a Provider User saves profile changes, THE CityHealth Platform SHALL update the Firestore document immediately and confirm the update

### Requirement 10: Provider Verification

**User Story:** As a healthcare provider, I want to request verification for my profile, so that citizens can trust my listing

#### Acceptance Criteria

1. WHEN a Provider User completes their profile, THE CityHealth Platform SHALL enable the verification request button
2. WHEN a Provider User submits a verification request, THE CityHealth Platform SHALL add their profile to the Verification Queue within 1 second
3. THE CityHealth Platform SHALL notify the Provider User when their verification status changes
4. THE CityHealth Platform SHALL display a verification badge on verified Provider Profiles
5. WHEN a verification request is denied, THE CityHealth Platform SHALL provide the reason to the Provider User

### Requirement 11: Medical Ads

**User Story:** As a healthcare provider, I want to create and publish medical ads, so that I can promote my services to citizens

#### Acceptance Criteria

1. WHERE a Provider User has a verified profile, THE CityHealth Platform SHALL allow creation of Medical Ads
2. WHEN a Provider User creates a Medical Ad, THE CityHealth Platform SHALL support both text and image content
3. THE CityHealth Platform SHALL require admin approval before displaying Medical Ads to Citizen Users
4. WHEN a Medical Ad is approved, THE CityHealth Platform SHALL display it in the homepage carousel and inline in search results
5. THE CityHealth Platform SHALL allow Provider Users to view the status of their Medical Ads in their dashboard

### Requirement 12: Profile Claiming

**User Story:** As a healthcare provider, I want to claim a preloaded profile that represents my practice, so that I can take ownership and manage it

#### Acceptance Criteria

1. WHEN a Provider User searches for their practice name, THE CityHealth Platform SHALL display matching preloaded profiles
2. THE CityHealth Platform SHALL provide a claim button on unclaimed preloaded profiles
3. WHEN a Provider User initiates a profile claim, THE CityHealth Platform SHALL add the request to the admin Verification Queue
4. THE CityHealth Platform SHALL require verification documentation before approving a profile claim
5. WHEN a claim is approved, THE CityHealth Platform SHALL transfer profile ownership to the Provider User

### Requirement 13: Admin Verification Management

**User Story:** As an admin, I want to review and approve provider verification requests, so that I can ensure only legitimate providers are verified

#### Acceptance Criteria

1. WHEN an Admin User accesses the Verification Queue, THE CityHealth Platform SHALL display all pending verification requests
2. THE CityHealth Platform SHALL show provider details and submitted documentation for each verification request
3. WHEN an Admin User approves a verification request, THE CityHealth Platform SHALL mark the Provider Profile as verified within 1 second
4. WHEN an Admin User denies a verification request, THE CityHealth Platform SHALL require a reason for denial
5. THE CityHealth Platform SHALL notify the Provider User of the verification decision via email

### Requirement 14: Admin Platform Management

**User Story:** As an admin, I want to manage all provider profiles and system data, so that I can maintain platform quality and accuracy

#### Acceptance Criteria

1. THE CityHealth Platform SHALL provide Admin Users with full CRUD operations on all Provider Profiles in Firestore
2. WHEN an Admin User modifies a Provider Profile, THE CityHealth Platform SHALL log the change with timestamp and admin identifier
3. THE CityHealth Platform SHALL allow Admin Users to manage account types, specialties, and service categories
4. THE CityHealth Platform SHALL provide Admin Users with a dashboard displaying platform statistics
5. THE CityHealth Platform SHALL allow Admin Users to moderate and remove inappropriate Medical Ads

### Requirement 15: Bulk Data Import

**User Story:** As an admin, I want to preload verified provider profiles, so that the platform has initial content for citizens to discover

#### Acceptance Criteria

1. THE CityHealth Platform SHALL allow Admin Users to bulk import provider data via CSV or JSON
2. WHEN Admin Users import provider data, THE CityHealth Platform SHALL create Firestore documents marked as preloaded
3. THE CityHealth Platform SHALL mark preloaded profiles as claimable by real providers
4. THE CityHealth Platform SHALL validate imported data for required fields before creating profiles
5. WHEN a preloaded profile is claimed, THE CityHealth Platform SHALL update its status to remove the preloaded flag

### Requirement 16: Accessibility

**User Story:** As a citizen using assistive technology, I want the platform to be accessible, so that I can navigate and use all features effectively

#### Acceptance Criteria

1. THE CityHealth Platform SHALL comply with WCAG 2.1 Level AA accessibility standards
2. THE CityHealth Platform SHALL provide proper ARIA labels for all interactive elements
3. THE CityHealth Platform SHALL support keyboard navigation for all functionality
4. THE CityHealth Platform SHALL ensure sufficient color contrast ratios meeting WCAG AA standards
5. THE CityHealth Platform SHALL provide alternative text for all images and icons

### Requirement 17: Responsive Design

**User Story:** As any user, I want the platform to be responsive and work on mobile devices, so that I can access it from any device

#### Acceptance Criteria

1. THE CityHealth Platform SHALL display correctly on screen sizes from 320px to 2560px width
2. THE CityHealth Platform SHALL adapt navigation and layout for mobile, tablet, and desktop viewports
3. WHEN accessed on a mobile device, THE CityHealth Platform SHALL provide touch-optimized interactions with minimum 44x44 pixel touch targets
4. THE CityHealth Platform SHALL load and render pages within 3 seconds on 3G mobile connections
5. THE CityHealth Platform SHALL maintain functionality across Chrome, Firefox, Safari, and Edge browsers

### Requirement 18: AI Smart Suggestions

**User Story:** As any user, I want the platform to provide AI-powered smart suggestions, so that I can discover relevant providers more easily

#### Acceptance Criteria

1. WHEN a Citizen User performs a search, THE CityHealth Platform SHALL display AI-generated provider suggestions
2. THE CityHealth Platform SHALL base suggestions on search history, location, and popular providers
3. THE CityHealth Platform SHALL display smart suggestions within 2 seconds of page load
4. THE CityHealth Platform SHALL update suggestions dynamically as the Citizen User interacts with the platform
5. THE CityHealth Platform SHALL allow Citizen Users to dismiss or hide suggestions

### Requirement 19: Firebase Migration

**User Story:** As a platform maintainer, I want the backend migrated from Supabase to Firebase, so that the platform uses a unified Google ecosystem

#### Acceptance Criteria

1. THE CityHealth Platform SHALL use Firebase Auth for all authentication operations including email/password and Google OAuth
2. THE CityHealth Platform SHALL store all application data in Firestore collections
3. THE CityHealth Platform SHALL use Firebase Storage for all file uploads including provider photos and documents
4. THE CityHealth Platform SHALL implement Firestore security rules equivalent to existing RLS policies
5. WHEN migrating data, THE CityHealth Platform SHALL preserve all existing provider profiles and user data
6. THE CityHealth Platform SHALL remove all Supabase client code, services, types, and configurations
7. THE CityHealth Platform SHALL archive existing SQL migration files without importing them

### Requirement 20: Google Antigravity Design System

**User Story:** As a platform user, I want a modern, minimal interface following Google Antigravity design principles, so that the platform feels professional and easy to use

#### Acceptance Criteria

1. THE CityHealth Platform SHALL use a pure white (#FFFFFF) background color throughout the application
2. THE CityHealth Platform SHALL use primary text color #202124, secondary text color #5F6368, and accent color Google Blue #4285F4
3. THE CityHealth Platform SHALL use Google Sans font family with fallback to DM Sans or Open Sans at weight 500-700
4. THE CityHealth Platform SHALL implement pill-shaped buttons with border-radius 9999px
5. THE CityHealth Platform SHALL apply soft shadows using box-shadow: 0 10px 30px rgba(0,0,0,0.05)
6. THE CityHealth Platform SHALL display massive whitespace between sections
7. THE CityHealth Platform SHALL implement a hero section with blue particle background using particles.js or three.js
8. THE CityHealth Platform SHALL remove all dark mode toggle functionality and dark theme variants
9. THE CityHealth Platform SHALL implement a fixed/sticky header that transitions from transparent to white on scroll
10. THE CityHealth Platform SHALL display navigation items: Product, Use Cases dropdown, Pricing, Blog, Resources dropdown, and a black pill "Get Started" CTA button

### Requirement 21: Leaflet Map Integration

**User Story:** As a platform user, I want to see provider locations on interactive maps, so that I can understand where providers are located

#### Acceptance Criteria

1. THE CityHealth Platform SHALL use Leaflet with react-leaflet for all map functionality
2. THE CityHealth Platform SHALL display OpenStreetMap tiles using the URL pattern https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
3. THE CityHealth Platform SHALL center maps on user geolocation when available
4. THE CityHealth Platform SHALL display provider markers with popups showing name, type, address, and phone
5. THE CityHealth Platform SHALL implement marker clustering for dense provider areas using react-leaflet-cluster
6. THE CityHealth Platform SHALL use custom marker icons matching the Google Antigravity design system
7. THE CityHealth Platform SHALL remove all Google Maps packages, API keys, and related code

### Requirement 22: Codebase Cleanup

**User Story:** As a platform maintainer, I want unused code removed and architecture streamlined, so that the codebase is maintainable and efficient

#### Acceptance Criteria

1. THE CityHealth Platform SHALL remove all unused imports, components, pages, hooks, and utilities
2. THE CityHealth Platform SHALL remove duplicate route definitions including old Index.tsx
3. THE CityHealth Platform SHALL consolidate duplicate logic across components
4. THE CityHealth Platform SHALL remove test files for deleted features
5. THE CityHealth Platform SHALL resolve AuthContext inconsistencies
6. THE CityHealth Platform SHALL fix broken API calls and update missing dependencies
7. THE CityHealth Platform SHALL remove all console.log statements from production code
8. THE CityHealth Platform SHALL maintain TypeScript strict mode compliance throughout

