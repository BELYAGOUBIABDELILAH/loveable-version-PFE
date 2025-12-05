# Implementation Plan - Complete CityHealth MVP

> **Based on Current State Analysis**: See `.kiro/specs/cityhealth-platform/current-state-analysis.md` for detailed gap analysis.
> **Overall Coverage**: ~55% of requirements implemented
> **Focus**: Complete missing features and connect mock data to real backend

---

## PHASE 1: DATABASE & CORE BACKEND (Critical - Unblocks Everything)

- [x] 1. Extend database schema for missing features





- [x] 1.1 Create database migration for new tables


  - Add `medical_ads` table: id, provider_id, title, content, image_url, status, display_priority, start_date, end_date, created_at
  - Add `favorites` table: id, user_id, provider_id, created_at, UNIQUE(user_id, provider_id)
  - Add `profile_claims` table: id, provider_id, user_id, status, documentation, notes, reviewed_by, reviewed_at, created_at
  - _Requirements: 11.1-11.5, 5.1-5.5, 12.1-12.5_
  - _Status: MISSING - No tables exist_

- [x] 1.2 Add missing columns to providers table


  - Add `is_preloaded` boolean (default false)
  - Add `is_claimed` boolean (default false)  
  - Add `accessibility_features` text array
  - Add `home_visit_available` boolean (default false)
  - _Requirements: 2.2, 3.5, 9.4, 12.2, 15.2_
  - _Status: MISSING - Columns don't exist_

- [x] 1.3 Implement Row Level Security policies


  - RLS for `medical_ads`: public SELECT approved ads, providers INSERT/UPDATE own, admins full access
  - RLS for `favorites`: users SELECT/INSERT/DELETE own favorites only
  - RLS for `profile_claims`: providers SELECT own + INSERT, admins full access
  - Update `providers` RLS: ensure new columns are properly secured
  - _Requirements: 11.3, 5.2, 12.3, 14.1_
  - _Status: MISSING - New tables need policies_

- [x] 1.4 Write property test for RLS policies


  - **Property 51: Admin CRUD permissions**
  - **Validates: Requirements 14.1**

---

## PHASE 2: FAVORITES SYSTEM (Quick Win - UI Exists)

- [x] 2. Complete favorites backend integration




- [x] 2.1 Create favorites service


  - Create `src/services/favoritesService.ts`
  - Implement `addFavorite(provider_id)` - INSERT into favorites table
  - Implement `removeFavorite(provider_id)` - DELETE from favorites table
  - Implement `getFavorites()` - SELECT with JOIN to providers
  - Implement `isFavorite(provider_id)` - CHECK if exists
  - Add authentication checks using Supabase auth
  - _Requirements: 5.1, 5.2, 5.5_
  - _Status: MISSING - Service doesn't exist, FavoritesPage uses mock data_

- [x] 2.2 Write property tests for favorites


  - **Property 14: Favorite addition**
  - **Property 16: Favorite removal**
  - **Property 15: Favorites display completeness**
  - **Validates: Requirements 5.1, 5.5, 5.4**



- [x] 2.3 Create FavoriteButton component





  - Create `src/components/FavoriteButton.tsx`
  - Show heart icon (filled if favorited, outline if not)
  - Call `favoritesService.addFavorite()` on click
  - Show auth modal if user not authenticated
  - Update UI optimistically with loading state
  - _Requirements: 5.1, 5.3_


  - _Status: MISSING - Component doesn't exist_

- [x] 2.4 Integrate FavoriteButton into pages





  - Add to ProviderProfilePage (top right with other actions)
  - Add to SearchResults cards


  - Add to ProvidersPage cards
  - _Requirements: 5.1_
  - _Status: MISSING - No favorite buttons anywhere_

- [x] 2.5 Connect FavoritesPage to real data





  - Replace mock data with `favoritesService.getFavorites()`
  - Use TanStack Query for data fetching
  - Add real-time updates when favorites change
  - Keep existing UI and filtering logic
  - _Requirements: 5.4_
  - _Status: PARTIAL - UI exists but uses mock data_

---

## PHASE 3: ENHANCED SEARCH & FILTERS (Required by Spec)

- [x] 3. Add missing search filters





- [x] 3.1 Update providers data model


  - Ensure `accessibility_features` and `home_visit_available` are in provider type
  - Update `src/data/providers.ts` to include new fields in mock data
  - _Requirements: 2.2_
  - _Status: MISSING - Fields not in data model_

- [x] 3.2 Add new filters to AdvancedFilters component


  - Add multi-select for `accessibility_features` (wheelchair, parking, elevator, ramp, etc.)
  - Add toggle for `home_visit_available`
  - Update `FilterState` interface in SearchPage
  - _Requirements: 2.2_
  - _Status: MISSING - Filters not in UI_

- [x] 3.3 Update search logic for new filters


  - Filter by `accessibility_features` (match ANY selected)
  - Filter by `home_visit_available` (boolean match)
  - Ensure AND logic across all filters
  - _Requirements: 2.3_
  - _Status: PARTIAL - Basic filters work, new ones missing_

- [x] 3.4 Write property tests for filters


  - **Property 4: Filter conjunction correctness**
  - **Property 6: Result count accuracy**
  - **Validates: Requirements 2.3, 2.5**



- [x] 3.5 Implement filter persistence





  - Store filters in URL query parameters
  - Restore filters from URL on page load
  - Persist when navigating to/from provider profiles
  - _Requirements: 2.4_


  - _Status: MISSING - Filters reset on navigation_

- [x] 3.6 Write property test for filter persistence





  - **Property 5: Filter state persistence**
  - **Validates: Requirements 2.4**

---

## PHASE 4: PROVIDER PROFILE ENHANCEMENTS

- [x] 4. Display accessibility features on profiles





- [x] 4.1 Update ProviderProfilePage display


  - Show `accessibility_features` as badges (wheelchair icon, parking icon, etc.)
  - Show `home_visit_available` indicator with home icon
  - Add to "About" section or create new "Accessibility" section
  - _Requirements: 3.5_
  - _Status: MISSING - Fields not displayed_

- [x] 4.2 Write property test for accessibility display


  - **Property 10: Accessibility indicator display**
  - **Validates: Requirements 3.5**

- [x] 4.3 Update SearchResults to show indicators


  - Add accessibility icons to search result cards
  - Add home visit badge if available
  - _Requirements: 1.3_
  - _Status: PARTIAL - Basic info shown, new fields missing_

- [x] 4.4 Write property test for search result completeness


  - **Property 3: Search result completeness**
  - **Validates: Requirements 1.3**



- [x] 4.5 Add accessibility editor to ProviderDashboard

  - Add multi-select checkbox group for `accessibility_features`
  - Options: wheelchair, parking, elevator, ramp, accessible_restroom, braille, sign_language
  - Add toggle switch for `home_visit_available`
  - Save to providers table on form submit
  - _Requirements: 9.4_

  - _Status: MISSING - Editor doesn't exist_

- [x] 4.6 Write property test for accessibility editability

  - **Property 29: Accessibility flag editability**
  - **Validates: Requirements 9.4**

---

## PHASE 5: MEDICAL ADS SYSTEM (New Feature)

- [x] 5. Build medical ads creation




- [x] 5.1 Create MedicalAdForm component


  - Create `src/components/MedicalAdForm.tsx`
  - Check if provider is verified before allowing access
  - Form fields: title, content (textarea), image upload, start_date, end_date
  - Upload image to Supabase Storage using fileUploadService
  - Submit to `medical_ads` table with status='pending'
  - Show success message after submission
  - _Requirements: 11.1, 11.2, 11.3_
  - _Status: MISSING - Component doesn't exist_

- [x] 5.2 Write property tests for ad creation


  - **Property 36: Ad creation access control**
  - **Property 37: Ad content support**
  - **Property 38: Ad approval requirement**
  - **Validates: Requirements 11.1, 11.2, 11.3**



- [x] 5.3 Add medical ads section to ProviderDashboard

  - Add new tab "Mes Annonces" to existing tabs
  - Display list of provider's medical ads with status badges
  - Show: title, status (pending/approved/rejected), created date
  - Add "Créer une annonce" button that opens MedicalAdForm
  - _Requirements: 11.5_


  - _Status: MISSING - No ads section in dashboard_




- [x] 5.4 Write property test for ad status visibility





  - **Property 40: Ad status visibility**
  - **Validates: Requirements 11.5**


- [x] 5.5 Create MedicalAdCarousel component





  - Create `src/components/MedicalAdCarousel.tsx`
  - Query `medical_ads` WHERE status='approved' ORDER BY display_priority
  - Use embla-carousel-react (already in package.json)

  - Auto-rotate every 5 seconds
  - Show: image, title, content (truncated), provider name
  - Click to view provider profile
  - _Requirements: 11.4_
  - _Status: MISSING - Component doesn't exist_

- [x] 5.6 Write property test for approved ad display

  - **Property 39: Approved ad display locations**
  - **Validates: Requirements 11.4**




- [x] 5.7 Integrate carousel into homepage




  - Add MedicalAdCarousel to NewIndex.tsx
  - Position below hero section or in dedicated section
  - Add heading "Annonces Médicales" / "Medical Announcements"
  - _Requirements: 11.4_
  - _Status: MISSING - No carousel on homepage_

- [x] 5.8 Add inline ads to search results


  - Insert approved ads every 5-10 search results
  - Style differently from regular results (border, "Annonce" badge)
  - Click goes to provider profile
  - _Requirements: 11.4_
  - _Status: MISSING - No ads in search_

---

## PHASE 6: ADMIN MEDICAL ADS MODERATION

- [x] 6. Add medical ads moderation to AdminDashboard





- [x] 6.1 Create ads moderation tab


  - Add "Annonces" tab to existing AdminDashboard tabs
  - Query all `medical_ads` with provider info
  - Display table: provider name, ad title, status, created date, actions
  - Filter by status (all/pending/approved/rejected)
  - _Requirements: 14.5_
  - _Status: MISSING - No ads moderation_

- [x] 6.2 Implement approve/reject actions


  - Add "Approve" button (green) - UPDATE status='approved'
  - Add "Reject" button (red) - UPDATE status='rejected'
  - Add "View" button to see full ad content in modal
  - Add "Delete" button for inappropriate content
  - Show confirmation dialogs
  - _Requirements: 14.5_
  - _Status: MISSING - No moderation actions_

- [x] 6.3 Write property test for admin ad moderation


  - **Property 54: Admin ad moderation**
  - **Validates: Requirements 14.5**

---

## PHASE 7: PROFILE CLAIMING SYSTEM

- [x] 7. Implement profile claiming workflow





- [x] 7.1 Add preloaded profile indicators to search


  - Update SearchResults to show "Revendiquer ce profil" button
  - Only show if `is_preloaded=true` AND `is_claimed=false`
  - Only show to authenticated provider users
  - _Requirements: 12.1, 12.2_
  - _Status: MISSING - No claim functionality_

- [x] 7.2 Write property tests for preloaded profiles


  - **Property 41: Preloaded profile search**
  - **Property 42: Claim button presence**
  - **Validates: Requirements 12.1, 12.2**



- [x] 7.3 Create ProfileClaimForm component





  - Create `src/components/ProfileClaimForm.tsx`
  - Modal/dialog form
  - Fields: reason (textarea), documentation (file upload - license, proof of ownership)
  - Upload files to Supabase Storage
  - INSERT into `profile_claims` table with status='pending'
  - Show success message
  - _Requirements: 12.3, 12.4_


  - _Status: MISSING - Component doesn't exist_

- [x] 7.4 Write property tests for claim requests


  - **Property 43: Claim request queuing**
  - **Property 44: Claim documentation requirement**
  - **Validates: Requirements 12.3, 12.4**

- [x] 7.5 Add claim approval to AdminDashboard





  - Add "Revendications" section to verification queue tab

  - Display pending profile claims with provider info
  - Show: claimant name, profile being claimed, documentation links, reason
  - Add "Approve" and "Reject" buttons
  - _Requirements: 12.5_
  - _Status: MISSING - No claim approval UI_

- [x] 7.6 Implement claim approval logic


  - On approve: UPDATE providers SET user_id=claimant_id, is_claimed=true, is_preloaded=false
  - On approve: UPDATE profile_claims SET status='approved', reviewed_by=admin_id, reviewed_at=NOW()
  - On reject: UPDATE profile_claims SET status='rejected', notes=rejection_reason
  - Send notification to claimant
  - _Requirements: 12.5, 15.5_
  - _Status: MISSING - No approval logic_

- [x] 7.7 Write property tests for claim approval





  - **Property 45: Claim ownership transfer**
  - **Property 59: Claim preload flag removal**
  - **Validates: Requirements 12.5, 15.5**

---

## PHASE 8: BULK IMPORT SYSTEM

- [x] 8. Build bulk import for admins




- [x] 8.1 Create BulkImportForm component


  - Create `src/components/BulkImportForm.tsx`
  - File upload for CSV or JSON
  - Parse CSV/JSON using Papa Parse or similar
  - Validate required fields: business_name, provider_type, phone, address
  - Show preview table of parsed data
  - Show validation errors clearly
  - _Requirements: 15.1, 15.4_
  - _Status: MISSING - Component doesn't exist_

- [x] 8.2 Implement bulk insert logic


  - INSERT multiple providers with is_preloaded=true
  - Set verification_status='verified' (admin imported)
  - Generate unique IDs
  - Handle errors gracefully (show which rows failed)
  - Show success count
  - _Requirements: 15.2, 15.3_
  - _Status: MISSING - No bulk import logic_

- [x] 8.3 Write property tests for bulk import



  - **Property 55: Bulk import functionality**
  - **Property 56: Import preload marking**
  - **Property 57: Preloaded profile claimability**
  - **Property 58: Import data validation**
  - **Validates: Requirements 15.1, 15.2, 15.3, 15.4**

- [x] 8.4 Add bulk import to AdminDashboard


  - Add "Import" tab to AdminDashboard
  - Integrate BulkImportForm component
  - Show import history (date, count, admin who imported)
  - Add download CSV template button
  - _Requirements: 15.1_
  - _Status: MISSING - No import UI_

---

## PHASE 9: NOTIFICATIONS & EMAIL

- [ ] 9. Implement email notifications
- [ ] 9.1 Set up email service
  - Use Supabase Edge Function or external service (SendGrid, Resend)
  - Create email templates for: verification approved, verification rejected, claim approved, claim rejected
  - Support multilingual emails (FR/AR/EN)
  - _Requirements: 8.5, 10.3, 13.5_
  - _Status: MISSING - No email sending_

- [ ] 9.2 Send verification emails
  - On provider registration: send welcome + verification pending email
  - On verification approval: send approval email
  - On verification rejection: send rejection email with reason
  - _Requirements: 8.5, 10.3, 13.5_
  - _Status: MISSING - No emails sent_

- [ ] 9.3 Write property tests for notifications
  - **Property 25: Verification email delivery**
  - **Property 33: Verification status notification**
  - **Property 50: Verification decision notification**
  - **Validates: Requirements 8.5, 10.3, 13.5**

- [ ] 9.4 Add real-time notification updates
  - Use Supabase real-time subscriptions on `notifications` table
  - Update NotificationCenter component to show live updates
  - Add toast notifications for important events
  - _Requirements: 10.3_
  - _Status: PARTIAL - Notifications table exists but no real-time_

---

## PHASE 10: CONNECT MOCK DATA TO REAL DATABASE

- [x] 10. Replace all mock data with real Supabase queries





- [x] 10.1 Update ProviderProfilePage


  - Replace mockProvider with real query using `id` param
  - Query from `providers` table with JOIN to schedules, services, ratings
  - Handle loading and error states
  - _Status: USES MOCK DATA_

- [x] 10.2 Update EmergencyPage


  - Replace mockServices with real query
  - Query `providers` WHERE is_emergency=true
  - Add real-time subscription for updates
  - _Requirements: 7.5_
  - _Status: USES MOCK DATA_

- [x] 10.3 Update SearchPage data source


  - Currently uses `getProviders()` from data/providers.ts (mock)
  - Replace with Supabase query to `providers` table
  - Keep existing filter and sort logic
  - _Status: USES MOCK DATA_



- [x] 10.4 Update ProvidersPage





  - Connect to real providers data
  - Add pagination
  - _Status: NEEDS VERIFICATION_

---

## PHASE 11: PROPERTY-BASED TESTING SETUP

- [-] 11. Set up comprehensive testing infrastructure


- [x] 11.1 Install and configure fast-check


  - Run: `npm install --save-dev fast-check @types/node`
  - Create `src/tests/` directory structure
  - Create `src/tests/generators/` for custom generators
  - Create `src/tests/properties/` for property tests
  - Configure Vitest for property tests
  - _Requirements: All_
  - _Status: NO TESTING FRAMEWORK_



- [x] 11.2 Create custom generators




  - Provider generator (valid provider objects)
  - Search query generator
  - Filter state generator
  - User generator
  - Medical ad generator
  - _Requirements: All_


  - _Status: NO GENERATORS_

- [x] 11.3 Write search and filter property tests





  - **Property 1: Search returns matching providers**
  - **Property 2: Multilingual search equivalence**
  - **Property 7: Profile data completeness**


  - **Property 8: Photo gallery functionality**
  - **Property 9: Map presence**
  - _Requirements: 1.1, 1.2, 3.2, 3.3, 3.4_



- [x] 11.4 Write internationalization property tests





  - **Property 11: Language switching completeness**
  - **Property 12: Theme consistency**
  - **Property 13: Preference persistence**


  - _Requirements: 4.2, 4.4, 4.5_

- [x] 11.5 Write chatbot property tests





  - **Property 17: Chatbot response delivery**
  - **Property 18: Multilingual chatbot support**


  - **Property 19: Chatbot fallback behavior**
  - _Requirements: 6.2, 6.3, 6.5_

- [x] 11.6 Write emergency services property tests





  - **Property 20: Emergency section filtering**
  - **Property 21: Emergency section performance**


  - **Property 22: Emergency contact prominence**
  - **Property 23: Emergency section consistency**
  - _Requirements: 7.2, 7.3, 7.4, 7.5_

- [x] 11.7 Write provider management property tests





  - **Property 24: Registration performance**
  - **Property 26: Dashboard field accessibility**
  - **Property 27: Multiple photo upload**
  - **Property 28: Photo upload performance**

  - **Property 30: Profile update confirmation**
  - _Requirements: 8.2, 9.1, 9.2, 9.3, 9.5_




- [ ] 11.8 Write verification property tests

  - **Property 31: Verification button enablement**
  - **Property 32: Verification queue addition**
  - **Property 34: Verification badge display**
  - **Property 35: Denial reason provision**
  - **Property 46: Verification queue completeness**
  - **Property 47: Verification request detail display**
  - **Property 48: Verification approval processing**
  - **Property 49: Denial reason requirement**
  - _Requirements: 10.1, 10.2, 10.4, 10.5, 13.1, 13.2, 13.3, 13.4_

- [x] 11.9 Write admin management property tests

  - **Property 52: Admin modification logging**
  - **Property 53: Admin entity management**
  - _Requirements: 14.2, 14.3_

- [x] 11.10 Write accessibility property tests


  - **Property 60: ARIA label presence**
  - **Property 61: Keyboard navigation support**
  - **Property 62: Color contrast compliance**
  - **Property 63: Image alt text presence**
  - _Requirements: 16.2, 16.3, 16.4, 16.5_

- [x] 11.11 Write responsive design property tests



  - **Property 64: Viewport size support**
  - **Property 65: Responsive layout adaptation**
  - **Property 66: Touch interaction optimization**
  - **Property 67: Cross-browser functionality**
  - _Requirements: 17.1, 17.2, 17.3, 17.5_

---

## PHASE 12: OPTIONAL ENHANCEMENTS

- [x] 12. AI Smart Suggestions (Optional - Requirement 18)



- [x] 12.1 Create SmartSuggestions component


  - Display AI-generated provider suggestions
  - Base on search history, location, popular providers
  - Load within 2 seconds
  - Update dynamically
  - Allow dismissing
  - _Requirements: 18.1, 18.3, 18.4, 18.5_
  - _Status: NOT IMPLEMENTED_


- [x] 12.2 Write property tests for AI suggestions


  - **Property 68: AI suggestion display**
  - **Property 69: Suggestion performance**
  - **Property 70: Dynamic suggestion updates**
  - **Property 71: Suggestion dismissal**
  - **Validates: Requirements 18.1, 18.3, 18.4, 18.5**

- [ ] 13. Mapbox Integration (Optional Enhancement)
- [ ] 13.1 Integrate Mapbox GL
  - Add Mapbox GL JS library (already in package.json)
  - Create MapComponent wrapper
  - Add to ProviderProfilePage
  - Add to SearchMap
  - Add to EmergencyPage
  - _Requirements: 3.4_
  - _Status: PLACEHOLDERS ONLY_

- [x] 14. Admin Logging System (Optional Enhancement)







- [x] 14.1 Create admin_logs table



  - Track all admin modifications
  - Store: admin_id, action, entity_type, entity_id, changes, timestamp
  - _Requirements: 14.2_
  - _Status: NOT IMPLEMENTED_

- [x] 14.2 Implement logging in admin actions


  - Log provider approvals/rejections
  - Log profile modifications
  - Log ad moderation actions
  - _Requirements: 14.2_
  - _Status: NOT IMPLEMENTED_


- [x] 14.3 Write property test for admin logging

  - **Property 52: Admin modification logging**
  - **Validates: Requirements 14.2**

---

## CHECKPOINTS

- [x] 15. Checkpoint 1 - After Phase 2 (Favorites)





  - Ensure all tests pass
  - Verify favorites work end-to-end
  - Test authentication flow
  - Ask user if questions arise

- [x] 16. Checkpoint 2 - After Phase 5 (Medical Ads)





  - Ensure all tests pass
  - Verify ads creation and display
  - Test admin moderation
  - Ask user if questions arise

- [x] 17. Checkpoint 3 - After Phase 8 (Bulk Import)





  - Ensure all tests pass
  - Verify all major features work
  - Test profile claiming
  - Ask user if questions arise

- [x] 18. Final Checkpoint - After Phase 11 (Testing)



  - Run all property-based tests
  - Run accessibility audit
  - Test cross-browser compatibility
  - Verify all requirements are met
  - Ask user for final review

---

## SUMMARY

**Total Tasks**: 18 phases, ~100 subtasks
**Current Coverage**: ~55% of requirements
**Priority Order**: Database → Favorites → Filters → Profiles → Ads → Claims → Import → Testing

*