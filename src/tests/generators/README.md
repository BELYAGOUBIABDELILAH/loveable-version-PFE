# Custom Generators for Property-Based Testing

This directory contains custom generators for the CityHealth platform's property-based tests using fast-check.

## Available Generators

### Core Entity Generators

#### `providerArbitrary()`
Generates valid Provider objects with all required and optional fields.
- Includes: id, user_id, business_name, provider_type, phone, address, etc.
- Validates: business name length (3-100 chars), address length (10-200 chars)
- Optional fields: email, city, coordinates, description, images, verification status

#### `userArbitrary()`
Generates valid user profile objects.
- Includes: id, full_name, email, role, phone, language
- Roles: citizen, provider, admin
- Languages: fr, ar, en

#### `medicalAdArbitrary()`
Generates valid medical advertisement objects.
- Includes: id, provider_id, title, content, image_url, status, display_priority
- Title length: 10-100 chars
- Content length: 20-500 chars
- Status: pending, approved, rejected

### Search & Filter Generators

#### `searchQueryArbitrary()`
Generates search queries in multiple languages.
- Includes common healthcare terms in French, Arabic, and English
- Also generates random strings (3-50 chars)

#### `filterStateArbitrary()`
Generates complete filter state objects for search functionality.
- Includes: provider_type[], city, accessibility_features[], home_visit_available, is_emergency, verification_status

### Primitive Generators

#### `uuidArbitrary()`
Generates valid UUID strings.

#### `phoneArbitrary()`
Generates valid Algerian phone numbers (10 digits).
- Mobile: 05/06/07 + 8 digits
- Landline: 0 + area code (2 digits) + 7 digits

#### `emailArbitrary()`
Generates valid email addresses.

#### `cityArbitrary()`
Generates Algerian city names.
- Cities: Sidi Bel Abbès, Algiers, Oran, Constantine, Annaba, Blida, Batna, Djelfa, Sétif, Tlemcen

#### `providerTypeArbitrary()`
Generates provider types: doctor, clinic, hospital, pharmacy, laboratory

#### `verificationStatusArbitrary()`
Generates verification statuses: pending, verified, rejected

#### `appRoleArbitrary()`
Generates app roles: citizen, provider, admin

#### `accessibilityFeaturesArbitrary()`
Generates arrays of accessibility features.
- Features: wheelchair, parking, elevator, ramp, accessible_restroom, braille, sign_language

#### `coordinatesArbitrary()`
Generates valid coordinates for Algeria.
- Latitude: 18.0 to 37.0
- Longitude: -8.0 to 12.0

#### `isoDateArbitrary()`
Generates ISO date strings between 2020-2030.

### Additional Generators

#### `chatMessageArbitrary()`
Generates chat message objects.
- Includes: content, role (user/assistant), language (fr/ar/en)

#### `verificationDocumentArbitrary()`
Generates verification document objects.
- Document types: license, certificate, id_card, proof_of_ownership
- Includes: document_type, document_url, provider_id

## Usage Example

```typescript
import * as fc from 'fast-check'
import { providerArbitrary, searchQueryArbitrary } from '@/tests/generators'

test('Property: Search returns matching providers', () => {
  fc.assert(
    fc.property(
      searchQueryArbitrary(),
      fc.array(providerArbitrary()),
      (query, providers) => {
        // Your property test logic here
        return true
      }
    ),
    { numRuns: 100 }
  )
})
```

## Testing the Generators

Run the generator validation tests:

```bash
npm test -- src/tests/generators/generators.test.ts
```

All generators are validated to ensure they produce valid data according to the platform's requirements.
