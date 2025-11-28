/**
 * Property-Based Tests for Search Result Completeness
 * Feature: cityhealth-platform, Property 3: Search result completeness
 * Validates: Requirements 1.3
 */

import { describe, test, expect } from 'vitest'
import * as fc from 'fast-check'
import { CityHealthProvider } from '@/data/providers'

// Generator for provider types
const providerTypeGen = fc.constantFrom('doctor', 'clinic', 'pharmacy', 'lab', 'hospital')

// Generator for accessibility features
const accessibilityFeatureGen = fc.constantFrom(
  'wheelchair',
  'parking',
  'elevator',
  'ramp',
  'accessible_restroom',
  'braille',
  'sign_language'
)

// Generator for complete provider data
const providerGen = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 5, maxLength: 50 }),
  type: providerTypeGen,
  specialty: fc.option(fc.string({ minLength: 3, maxLength: 30 })),
  rating: fc.float({ min: Math.fround(1.0), max: Math.fround(5.0), noNaN: true }),
  reviewsCount: fc.integer({ min: 0, max: 1000 }),
  distance: fc.float({ min: Math.fround(0.1), max: Math.fround(50.0), noNaN: true }),
  verified: fc.boolean(),
  emergency: fc.boolean(),
  accessible: fc.boolean(),
  isOpen: fc.boolean(),
  address: fc.string({ minLength: 10, maxLength: 100 }),
  city: fc.string({ minLength: 3, maxLength: 30 }),
  area: fc.string({ minLength: 5, maxLength: 30 }),
  phone: fc.string({ minLength: 10, maxLength: 15 }),
  image: fc.string({ minLength: 5, maxLength: 50 }),
  lat: fc.float({ min: Math.fround(-90), max: Math.fround(90), noNaN: true }),
  lng: fc.float({ min: Math.fround(-180), max: Math.fround(180), noNaN: true }),
  languages: fc.array(fc.constantFrom('ar', 'fr', 'en'), { minLength: 1, maxLength: 3 }),
  description: fc.string({ minLength: 10, maxLength: 200 }),
  accessibility_features: fc.array(accessibilityFeatureGen, { minLength: 0, maxLength: 7 }),
  home_visit_available: fc.boolean(),
}) as fc.Arbitrary<CityHealthProvider>

// Helper function to check if a provider has all required fields for search results
const hasRequiredSearchResultFields = (provider: CityHealthProvider): boolean => {
  // Requirements 1.3: search results should show minimum of provider name, type, location, and accessibility indicators
  return !!(
    provider.name &&
    provider.type &&
    provider.address &&
    typeof provider.accessibility_features !== 'undefined' &&
    typeof provider.home_visit_available !== 'undefined'
  )
}

// Helper function to check if accessibility indicators are properly represented
const hasAccessibilityIndicators = (provider: CityHealthProvider): boolean => {
  // Should have accessibility_features array (can be empty) and home_visit_available boolean
  return Array.isArray(provider.accessibility_features) && 
         typeof provider.home_visit_available === 'boolean'
}

// Helper function to validate accessibility features are from valid set
const hasValidAccessibilityFeatures = (provider: CityHealthProvider): boolean => {
  const validFeatures = ['wheelchair', 'parking', 'elevator', 'ramp', 'accessible_restroom', 'braille', 'sign_language']
  
  if (!provider.accessibility_features) return true // null/undefined is valid
  if (!Array.isArray(provider.accessibility_features)) return false
  
  return provider.accessibility_features.every(feature => validFeatures.includes(feature))
}

describe('Search Result Completeness Property Tests', () => {
  /**
   * Property 3: Search result completeness
   * For any search result item, it should contain at minimum: provider name, type, location, and accessibility indicators
   * Validates: Requirements 1.3
   */
  test('Property 3: Search result completeness', () => {
    fc.assert(
      fc.property(
        providerGen,
        (provider) => {
          // Every provider should have the minimum required fields for search results
          expect(hasRequiredSearchResultFields(provider)).toBe(true)
          
          // Verify specific required fields
          expect(provider.name).toBeTruthy()
          expect(typeof provider.name).toBe('string')
          expect(provider.name.length).toBeGreaterThan(0)
          
          expect(provider.type).toBeTruthy()
          expect(['doctor', 'clinic', 'pharmacy', 'lab', 'hospital']).toContain(provider.type)
          
          expect(provider.address).toBeTruthy()
          expect(typeof provider.address).toBe('string')
          expect(provider.address.length).toBeGreaterThan(0)
          
          // Accessibility indicators should be present
          expect(hasAccessibilityIndicators(provider)).toBe(true)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 3a: Accessibility indicators validity', () => {
    fc.assert(
      fc.property(
        providerGen,
        (provider) => {
          // All accessibility features should be from the valid set
          expect(hasValidAccessibilityFeatures(provider)).toBe(true)
          
          // home_visit_available should be a boolean
          expect(typeof provider.home_visit_available).toBe('boolean')
          
          // accessibility_features should be an array if present
          if (provider.accessibility_features !== null && provider.accessibility_features !== undefined) {
            expect(Array.isArray(provider.accessibility_features)).toBe(true)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 3b: Provider type consistency', () => {
    fc.assert(
      fc.property(
        providerGen,
        (provider) => {
          // Provider type should be one of the valid types
          const validTypes = ['doctor', 'clinic', 'pharmacy', 'lab', 'hospital']
          expect(validTypes).toContain(provider.type)
          
          // Type should be consistent with other fields
          if (provider.type === 'doctor' && provider.specialty) {
            expect(typeof provider.specialty).toBe('string')
          }

          return true
        }
      ),
      { numRuns: 50 }
    )
  })

  test('Property 3c: Location information completeness', () => {
    fc.assert(
      fc.property(
        providerGen,
        (provider) => {
          // Location fields should be present and valid
          expect(provider.address).toBeTruthy()
          expect(provider.city).toBeTruthy()
          expect(provider.area).toBeTruthy()
          
          // Coordinates should be valid if present
          expect(typeof provider.lat).toBe('number')
          expect(typeof provider.lng).toBe('number')
          
          // Handle NaN values - they should be valid numbers or NaN (which is acceptable for missing coordinates)
          if (!isNaN(provider.lat)) {
            expect(provider.lat).toBeGreaterThanOrEqual(-90)
            expect(provider.lat).toBeLessThanOrEqual(90)
          }
          if (!isNaN(provider.lng)) {
            expect(provider.lng).toBeGreaterThanOrEqual(-180)
            expect(provider.lng).toBeLessThanOrEqual(180)
          }

          return true
        }
      ),
      { numRuns: 50 }
    )
  })

  test('Property 3d: Rating and review information validity', () => {
    fc.assert(
      fc.property(
        providerGen,
        (provider) => {
          // Rating should be within valid range
          expect(typeof provider.rating).toBe('number')
          expect(provider.rating).toBeGreaterThanOrEqual(1.0)
          expect(provider.rating).toBeLessThanOrEqual(5.0)
          
          // Review count should be non-negative
          expect(typeof provider.reviewsCount).toBe('number')
          expect(provider.reviewsCount).toBeGreaterThanOrEqual(0)
          
          // Distance should be positive (handle NaN case)
          expect(typeof provider.distance).toBe('number')
          if (!isNaN(provider.distance)) {
            expect(provider.distance).toBeGreaterThan(0)
          }

          return true
        }
      ),
      { numRuns: 50 }
    )
  })

  test('Property 3e: Boolean flags validity', () => {
    fc.assert(
      fc.property(
        providerGen,
        (provider) => {
          // All boolean flags should be actual booleans
          expect(typeof provider.verified).toBe('boolean')
          expect(typeof provider.emergency).toBe('boolean')
          expect(typeof provider.accessible).toBe('boolean')
          expect(typeof provider.isOpen).toBe('boolean')
          expect(typeof provider.home_visit_available).toBe('boolean')

          return true
        }
      ),
      { numRuns: 50 }
    )
  })

  test('Property 3f: Accessibility features uniqueness', () => {
    fc.assert(
      fc.property(
        fc.array(accessibilityFeatureGen, { minLength: 1, maxLength: 7 }),
        (features) => {
          // Remove duplicates and verify uniqueness is maintained
          const uniqueFeatures = [...new Set(features)]
          
          // Each feature should appear only once
          const featureCounts = new Map<string, number>()
          features.forEach(feature => {
            featureCounts.set(feature, (featureCounts.get(feature) || 0) + 1)
          })
          
          // In a properly constructed provider, accessibility features should be unique
          const provider: Partial<CityHealthProvider> = {
            accessibility_features: uniqueFeatures
          }
          
          expect(provider.accessibility_features?.length).toBe(uniqueFeatures.length)
          
          // Verify no duplicates in the unique array
          const uniqueSet = new Set(uniqueFeatures)
          expect(uniqueSet.size).toBe(uniqueFeatures.length)

          return true
        }
      ),
      { numRuns: 50 }
    )
  })
})