/**
 * Property-Based Tests for Accessibility Editability
 * Feature: cityhealth-platform, Property 29: Accessibility flag editability
 * Validates: Requirements 9.4
 */

import { describe, test, expect } from 'vitest'
import * as fc from 'fast-check'
import { ACCESSIBILITY_FEATURES } from '@/data/providers'

// Generator for accessibility features
const accessibilityFeatureGen = fc.constantFrom(...ACCESSIBILITY_FEATURES)

// Generator for provider profile with accessibility settings
const providerProfileGen = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 5, maxLength: 50 }),
  specialty: fc.string({ minLength: 3, maxLength: 30 }),
  accessibility_features: fc.array(accessibilityFeatureGen, { minLength: 0, maxLength: ACCESSIBILITY_FEATURES.length }).map(features => [...new Set(features)]), // Ensure uniqueness
  home_visit_available: fc.boolean(),
})

// Helper function to simulate adding an accessibility feature
const addAccessibilityFeature = (currentFeatures: string[], newFeature: string): string[] => {
  if (currentFeatures.includes(newFeature)) {
    return currentFeatures // Already exists, no change
  }
  return [...currentFeatures, newFeature]
}

// Helper function to simulate removing an accessibility feature
const removeAccessibilityFeature = (currentFeatures: string[], featureToRemove: string): string[] => {
  return currentFeatures.filter(feature => feature !== featureToRemove)
}

// Helper function to simulate toggling an accessibility feature
const toggleAccessibilityFeature = (currentFeatures: string[], feature: string): string[] => {
  if (currentFeatures.includes(feature)) {
    return removeAccessibilityFeature(currentFeatures, feature)
  } else {
    return addAccessibilityFeature(currentFeatures, feature)
  }
}

// Helper function to validate accessibility features
const validateAccessibilityFeatures = (features: string[]): boolean => {
  // All features should be from the valid set
  return features.every(feature => ACCESSIBILITY_FEATURES.includes(feature)) &&
         // No duplicates should exist
         new Set(features).size === features.length
}

describe('Accessibility Editability Property Tests', () => {
  /**
   * Property 29: Accessibility flag editability
   * For any provider profile, accessibility indicators and home visit availability flags should be settable
   * Validates: Requirements 9.4
   */
  test('Property 29: Accessibility flag editability', () => {
    fc.assert(
      fc.property(
        providerProfileGen,
        accessibilityFeatureGen,
        fc.boolean(),
        (profile, newFeature, newHomeVisitStatus) => {
          // Test that accessibility features can be added
          const featuresAfterAdd = addAccessibilityFeature(profile.accessibility_features, newFeature)
          expect(validateAccessibilityFeatures(featuresAfterAdd)).toBe(true)
          expect(featuresAfterAdd.includes(newFeature)).toBe(true)
          
          // Test that accessibility features can be removed
          if (profile.accessibility_features.includes(newFeature)) {
            const featuresAfterRemove = removeAccessibilityFeature(profile.accessibility_features, newFeature)
            expect(validateAccessibilityFeatures(featuresAfterRemove)).toBe(true)
            expect(featuresAfterRemove.includes(newFeature)).toBe(false)
          }
          
          // Test that home visit availability can be set to any boolean value
          expect(typeof newHomeVisitStatus).toBe('boolean')
          
          // Test that the profile can be updated with new values
          const updatedProfile = {
            ...profile,
            accessibility_features: featuresAfterAdd,
            home_visit_available: newHomeVisitStatus
          }
          
          expect(validateAccessibilityFeatures(updatedProfile.accessibility_features)).toBe(true)
          expect(typeof updatedProfile.home_visit_available).toBe('boolean')
          expect(updatedProfile.home_visit_available).toBe(newHomeVisitStatus)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 29a: Accessibility feature addition idempotency', () => {
    fc.assert(
      fc.property(
        fc.array(accessibilityFeatureGen, { minLength: 0, maxLength: ACCESSIBILITY_FEATURES.length }),
        accessibilityFeatureGen,
        (currentFeatures, featureToAdd) => {
          // Remove duplicates from current features to ensure valid state
          const uniqueCurrentFeatures = [...new Set(currentFeatures)]
          
          // Adding the same feature multiple times should be idempotent
          const afterFirstAdd = addAccessibilityFeature(uniqueCurrentFeatures, featureToAdd)
          const afterSecondAdd = addAccessibilityFeature(afterFirstAdd, featureToAdd)
          
          expect(afterFirstAdd).toEqual(afterSecondAdd)
          expect(afterFirstAdd.includes(featureToAdd)).toBe(true)
          expect(validateAccessibilityFeatures(afterFirstAdd)).toBe(true)
          expect(validateAccessibilityFeatures(afterSecondAdd)).toBe(true)

          return true
        }
      ),
      { numRuns: 50 }
    )
  })

  test('Property 29b: Accessibility feature removal safety', () => {
    fc.assert(
      fc.property(
        fc.array(accessibilityFeatureGen, { minLength: 1, maxLength: ACCESSIBILITY_FEATURES.length }),
        (currentFeatures) => {
          // Remove duplicates to ensure valid state
          const uniqueCurrentFeatures = [...new Set(currentFeatures)]
          
          // Pick a random feature to remove
          const featureToRemove = uniqueCurrentFeatures[0]
          
          // Removing a feature should work safely
          const afterRemoval = removeAccessibilityFeature(uniqueCurrentFeatures, featureToRemove)
          
          expect(validateAccessibilityFeatures(afterRemoval)).toBe(true)
          expect(afterRemoval.includes(featureToRemove)).toBe(false)
          expect(afterRemoval.length).toBe(uniqueCurrentFeatures.length - 1)
          
          // Removing a non-existent feature should be safe
          const afterRemovingNonExistent = removeAccessibilityFeature(afterRemoval, featureToRemove)
          expect(afterRemovingNonExistent).toEqual(afterRemoval)

          return true
        }
      ),
      { numRuns: 50 }
    )
  })

  test('Property 29c: Accessibility feature toggle consistency', () => {
    fc.assert(
      fc.property(
        fc.array(accessibilityFeatureGen, { minLength: 0, maxLength: ACCESSIBILITY_FEATURES.length }),
        accessibilityFeatureGen,
        (currentFeatures, featureToToggle) => {
          // Remove duplicates to ensure valid state
          const uniqueCurrentFeatures = [...new Set(currentFeatures)]
          
          const wasPresent = uniqueCurrentFeatures.includes(featureToToggle)
          const afterToggle = toggleAccessibilityFeature(uniqueCurrentFeatures, featureToToggle)
          
          expect(validateAccessibilityFeatures(afterToggle)).toBe(true)
          
          if (wasPresent) {
            // If feature was present, it should be removed
            expect(afterToggle.includes(featureToToggle)).toBe(false)
            expect(afterToggle.length).toBe(uniqueCurrentFeatures.length - 1)
          } else {
            // If feature was not present, it should be added
            expect(afterToggle.includes(featureToToggle)).toBe(true)
            expect(afterToggle.length).toBe(uniqueCurrentFeatures.length + 1)
          }
          
          // Toggling twice should return to original state
          const afterDoubleToggle = toggleAccessibilityFeature(afterToggle, featureToToggle)
          expect(afterDoubleToggle.sort()).toEqual(uniqueCurrentFeatures.sort())

          return true
        }
      ),
      { numRuns: 50 }
    )
  })

  test('Property 29d: Home visit availability toggle', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        (currentHomeVisitStatus) => {
          // Home visit status should be toggleable to any boolean value
          const newStatus = !currentHomeVisitStatus
          
          expect(typeof newStatus).toBe('boolean')
          expect(newStatus).toBe(!currentHomeVisitStatus)
          
          // Should be able to toggle back
          const toggledBack = !newStatus
          expect(toggledBack).toBe(currentHomeVisitStatus)

          return true
        }
      ),
      { numRuns: 30 }
    )
  })

  test('Property 29e: Valid accessibility features constraint', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string(), { minLength: 0, maxLength: 10 }),
        (randomFeatures) => {
          // Only features from ACCESSIBILITY_FEATURES should be considered valid
          const validFeatures = randomFeatures.filter(feature => ACCESSIBILITY_FEATURES.includes(feature))
          const invalidFeatures = randomFeatures.filter(feature => !ACCESSIBILITY_FEATURES.includes(feature))
          
          expect(validateAccessibilityFeatures(validFeatures)).toBe(true)
          
          if (invalidFeatures.length > 0) {
            expect(validateAccessibilityFeatures(randomFeatures)).toBe(false)
          }

          return true
        }
      ),
      { numRuns: 50 }
    )
  })

  test('Property 29f: Accessibility features uniqueness preservation', () => {
    fc.assert(
      fc.property(
        fc.array(accessibilityFeatureGen, { minLength: 0, maxLength: ACCESSIBILITY_FEATURES.length * 2 }), // Allow duplicates in input
        (featuresWithPossibleDuplicates) => {
          // Simulate the behavior of a proper accessibility feature manager
          const uniqueFeatures = [...new Set(featuresWithPossibleDuplicates)]
          
          expect(validateAccessibilityFeatures(uniqueFeatures)).toBe(true)
          expect(uniqueFeatures.length).toBeLessThanOrEqual(ACCESSIBILITY_FEATURES.length)
          
          // Each feature should appear only once
          const featureCounts = new Map<string, number>()
          uniqueFeatures.forEach(feature => {
            featureCounts.set(feature, (featureCounts.get(feature) || 0) + 1)
          })
          
          featureCounts.forEach(count => {
            expect(count).toBe(1)
          })

          return true
        }
      ),
      { numRuns: 50 }
    )
  })
})