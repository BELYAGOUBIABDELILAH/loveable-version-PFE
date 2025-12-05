/**
 * Tests to verify custom generators work correctly
 * This ensures all generators produce valid data
 */

import { describe, test, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  providerArbitrary,
  searchQueryArbitrary,
  filterStateArbitrary,
  userArbitrary,
  medicalAdArbitrary,
  phoneArbitrary,
  emailArbitrary,
  cityArbitrary,
  providerTypeArbitrary,
  verificationStatusArbitrary,
  appRoleArbitrary,
  accessibilityFeaturesArbitrary,
  coordinatesArbitrary,
  uuidArbitrary,
  isoDateArbitrary,
  chatMessageArbitrary,
  verificationDocumentArbitrary
} from './index'

describe('Custom Generators Validation', () => {
  test('providerArbitrary generates valid provider objects', () => {
    fc.assert(
      fc.property(providerArbitrary(), (provider) => {
        // Verify required fields exist
        expect(provider).toHaveProperty('id')
        expect(provider).toHaveProperty('user_id')
        expect(provider).toHaveProperty('business_name')
        expect(provider).toHaveProperty('provider_type')
        expect(provider).toHaveProperty('phone')
        expect(provider).toHaveProperty('address')
        
        // Verify types
        expect(typeof provider.id).toBe('string')
        expect(typeof provider.user_id).toBe('string')
        expect(typeof provider.business_name).toBe('string')
        expect(['doctor', 'clinic', 'hospital', 'pharmacy', 'laboratory']).toContain(provider.provider_type)
        expect(typeof provider.phone).toBe('string')
        expect(typeof provider.address).toBe('string')
        
        // Verify business name length
        expect(provider.business_name.length).toBeGreaterThanOrEqual(3)
        expect(provider.business_name.length).toBeLessThanOrEqual(100)
        
        return true
      }),
      { numRuns: 50 }
    )
  })

  test('searchQueryArbitrary generates valid search queries', () => {
    fc.assert(
      fc.property(searchQueryArbitrary(), (query) => {
        expect(typeof query).toBe('string')
        expect(query.length).toBeGreaterThan(0)
        return true
      }),
      { numRuns: 50 }
    )
  })

  test('filterStateArbitrary generates valid filter state objects', () => {
    fc.assert(
      fc.property(filterStateArbitrary(), (filterState) => {
        // Verify structure
        expect(filterState).toHaveProperty('provider_type')
        expect(filterState).toHaveProperty('city')
        expect(filterState).toHaveProperty('accessibility_features')
        expect(filterState).toHaveProperty('home_visit_available')
        expect(filterState).toHaveProperty('is_emergency')
        expect(filterState).toHaveProperty('verification_status')
        
        // Verify types
        expect(Array.isArray(filterState.provider_type)).toBe(true)
        expect(Array.isArray(filterState.accessibility_features)).toBe(true)
        
        // Verify provider_type values
        filterState.provider_type.forEach(type => {
          expect(['doctor', 'clinic', 'hospital', 'pharmacy', 'laboratory']).toContain(type)
        })
        
        return true
      }),
      { numRuns: 50 }
    )
  })

  test('userArbitrary generates valid user objects', () => {
    fc.assert(
      fc.property(userArbitrary(), (user) => {
        // Verify required fields
        expect(user).toHaveProperty('id')
        expect(user).toHaveProperty('full_name')
        expect(user).toHaveProperty('email')
        expect(user).toHaveProperty('role')
        expect(user).toHaveProperty('language')
        
        // Verify types
        expect(typeof user.id).toBe('string')
        expect(typeof user.full_name).toBe('string')
        expect(typeof user.email).toBe('string')
        expect(['citizen', 'provider', 'admin']).toContain(user.role)
        expect(['fr', 'ar', 'en']).toContain(user.language)
        
        // Verify email format
        expect(user.email).toMatch(/@/)
        
        return true
      }),
      { numRuns: 50 }
    )
  })

  test('medicalAdArbitrary generates valid medical ad objects', () => {
    fc.assert(
      fc.property(medicalAdArbitrary(), (ad) => {
        // Verify required fields
        expect(ad).toHaveProperty('id')
        expect(ad).toHaveProperty('provider_id')
        expect(ad).toHaveProperty('title')
        expect(ad).toHaveProperty('content')
        expect(ad).toHaveProperty('status')
        
        // Verify types
        expect(typeof ad.id).toBe('string')
        expect(typeof ad.provider_id).toBe('string')
        expect(typeof ad.title).toBe('string')
        expect(typeof ad.content).toBe('string')
        expect(['pending', 'approved', 'rejected']).toContain(ad.status)
        
        // Verify content lengths
        expect(ad.title.length).toBeGreaterThanOrEqual(10)
        expect(ad.title.length).toBeLessThanOrEqual(100)
        expect(ad.content.length).toBeGreaterThanOrEqual(20)
        expect(ad.content.length).toBeLessThanOrEqual(500)
        
        return true
      }),
      { numRuns: 50 }
    )
  })

  test('phoneArbitrary generates valid Algerian phone numbers', () => {
    fc.assert(
      fc.property(phoneArbitrary(), (phone) => {
        expect(typeof phone).toBe('string')
        // Algerian phone numbers start with 0 and have 10 digits
        expect(phone).toMatch(/^0[0-9]{9}$/)
        return true
      }),
      { numRuns: 50 }
    )
  })

  test('emailArbitrary generates valid email addresses', () => {
    fc.assert(
      fc.property(emailArbitrary(), (email) => {
        expect(typeof email).toBe('string')
        expect(email).toMatch(/@/)
        expect(email).toMatch(/\..+$/)
        return true
      }),
      { numRuns: 50 }
    )
  })

  test('cityArbitrary generates valid Algerian cities', () => {
    fc.assert(
      fc.property(cityArbitrary(), (city) => {
        const validCities = [
          'Sidi Bel Abbès',
          'Algiers',
          'Oran',
          'Constantine',
          'Annaba',
          'Blida',
          'Batna',
          'Djelfa',
          'Sétif',
          'Tlemcen'
        ]
        expect(validCities).toContain(city)
        return true
      }),
      { numRuns: 50 }
    )
  })

  test('providerTypeArbitrary generates valid provider types', () => {
    fc.assert(
      fc.property(providerTypeArbitrary(), (type) => {
        expect(['doctor', 'clinic', 'hospital', 'pharmacy', 'laboratory']).toContain(type)
        return true
      }),
      { numRuns: 50 }
    )
  })

  test('verificationStatusArbitrary generates valid verification statuses', () => {
    fc.assert(
      fc.property(verificationStatusArbitrary(), (status) => {
        expect(['pending', 'verified', 'rejected']).toContain(status)
        return true
      }),
      { numRuns: 50 }
    )
  })

  test('appRoleArbitrary generates valid app roles', () => {
    fc.assert(
      fc.property(appRoleArbitrary(), (role) => {
        expect(['citizen', 'provider', 'admin']).toContain(role)
        return true
      }),
      { numRuns: 50 }
    )
  })

  test('accessibilityFeaturesArbitrary generates valid accessibility features', () => {
    fc.assert(
      fc.property(accessibilityFeaturesArbitrary(), (features) => {
        expect(Array.isArray(features)).toBe(true)
        const validFeatures = [
          'wheelchair',
          'parking',
          'elevator',
          'ramp',
          'accessible_restroom',
          'braille',
          'sign_language'
        ]
        features.forEach(feature => {
          expect(validFeatures).toContain(feature)
        })
        return true
      }),
      { numRuns: 50 }
    )
  })

  test('coordinatesArbitrary generates valid Algerian coordinates', () => {
    fc.assert(
      fc.property(coordinatesArbitrary(), (coords) => {
        expect(coords).toHaveProperty('latitude')
        expect(coords).toHaveProperty('longitude')
        
        // Algeria coordinates range
        expect(coords.latitude).toBeGreaterThanOrEqual(18.0)
        expect(coords.latitude).toBeLessThanOrEqual(37.0)
        expect(coords.longitude).toBeGreaterThanOrEqual(-8.0)
        expect(coords.longitude).toBeLessThanOrEqual(12.0)
        
        return true
      }),
      { numRuns: 50 }
    )
  })

  test('uuidArbitrary generates valid UUIDs', () => {
    fc.assert(
      fc.property(uuidArbitrary(), (uuid) => {
        expect(typeof uuid).toBe('string')
        // Valid UUID format (any version)
        expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
        return true
      }),
      { numRuns: 50 }
    )
  })

  test('isoDateArbitrary generates valid ISO date strings', () => {
    fc.assert(
      fc.property(isoDateArbitrary(), (dateStr) => {
        expect(typeof dateStr).toBe('string')
        const date = new Date(dateStr)
        expect(date.toString()).not.toBe('Invalid Date')
        expect(date.getFullYear()).toBeGreaterThanOrEqual(2020)
        expect(date.getFullYear()).toBeLessThanOrEqual(2030)
        return true
      }),
      { numRuns: 50 }
    )
  })

  test('chatMessageArbitrary generates valid chat messages', () => {
    fc.assert(
      fc.property(chatMessageArbitrary(), (message) => {
        expect(message).toHaveProperty('content')
        expect(message).toHaveProperty('role')
        expect(message).toHaveProperty('language')
        
        expect(typeof message.content).toBe('string')
        expect(message.content.length).toBeGreaterThan(0)
        expect(['user', 'assistant']).toContain(message.role)
        expect(['fr', 'ar', 'en']).toContain(message.language)
        
        return true
      }),
      { numRuns: 50 }
    )
  })

  test('verificationDocumentArbitrary generates valid verification documents', () => {
    fc.assert(
      fc.property(verificationDocumentArbitrary(), (doc) => {
        expect(doc).toHaveProperty('document_type')
        expect(doc).toHaveProperty('document_url')
        expect(doc).toHaveProperty('provider_id')
        
        expect(['license', 'certificate', 'id_card', 'proof_of_ownership']).toContain(doc.document_type)
        expect(typeof doc.document_url).toBe('string')
        expect(doc.document_url).toMatch(/^https?:\/\//)
        expect(typeof doc.provider_id).toBe('string')
        
        return true
      }),
      { numRuns: 50 }
    )
  })
})
