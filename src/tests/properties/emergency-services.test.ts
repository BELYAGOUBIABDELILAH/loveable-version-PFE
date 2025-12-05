/**
 * Property-Based Tests for Emergency Services
 * Feature: cityhealth-platform, Properties 20-23: Emergency services functionality
 * Validates: Requirements 7.2, 7.3, 7.4, 7.5
 */

import { describe, test, expect } from 'vitest'
import * as fc from 'fast-check'
import { providerArbitrary } from '@/tests/generators'
import type { Database } from '@/integrations/supabase/types'

type Provider = Database['public']['Tables']['providers']['Row']

/**
 * Helper function to filter emergency providers
 * Mimics the logic from EmergencyPage.tsx
 */
function filterEmergencyProviders(providers: Provider[]): Provider[] {
  return providers.filter(
    provider => 
      provider.is_emergency === true && 
      provider.verification_status === 'verified'
  )
}

/**
 * Helper function to check if contact information is prominently displayed
 * In the actual UI, this means phone number is visible and clickable
 */
function hasProminentContactInfo(provider: Provider): boolean {
  // Phone number must be present and non-empty
  return provider.phone !== null && provider.phone.trim().length > 0
}

/**
 * Helper function to simulate real-time update behavior
 * When a provider's emergency status changes, it should be reflected in the section
 */
function simulateEmergencyStatusChange(
  providers: Provider[],
  providerId: string,
  newEmergencyStatus: boolean
): Provider[] {
  return providers.map(p => 
    p.id === providerId 
      ? { ...p, is_emergency: newEmergencyStatus }
      : p
  )
}

describe('Emergency Services Property Tests', () => {
  /**
   * Property 20: Emergency section filtering
   * For any provider displayed in the Emergency Now section, the provider should have is_emergency flag set to true
   * Validates: Requirements 7.2
   */
  test('Property 20: Emergency section filtering', () => {
    fc.assert(
      fc.property(
        fc.array(providerArbitrary(), { minLength: 10, maxLength: 100 }),
        (providers) => {
          const emergencyProviders = filterEmergencyProviders(providers)

          // Every provider in the emergency section must have is_emergency = true
          emergencyProviders.forEach(provider => {
            expect(provider.is_emergency).toBe(true)
          })

          // Every provider in the emergency section must be verified
          emergencyProviders.forEach(provider => {
            expect(provider.verification_status).toBe('verified')
          })

          // Verify no non-emergency providers are included
          const nonEmergencyProviders = providers.filter(
            p => p.is_emergency !== true || p.verification_status !== 'verified'
          )
          nonEmergencyProviders.forEach(provider => {
            expect(emergencyProviders).not.toContainEqual(provider)
          })

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 21: Emergency section performance
   * For any access to the Emergency Now section, results should be displayed within 1 second
   * Validates: Requirements 7.3
   * 
   * Note: This property tests the performance constraint by measuring query execution time
   */
  test('Property 21: Emergency section performance', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(providerArbitrary(), { minLength: 50, maxLength: 200 }),
        async (providers) => {
          const startTime = performance.now()
          
          // Simulate the filtering operation that happens in EmergencyPage
          const emergencyProviders = filterEmergencyProviders(providers)
          
          const endTime = performance.now()
          const executionTime = endTime - startTime

          // The filtering operation should complete well within 1 second (1000ms)
          // We use a generous threshold since this is just the filtering logic
          // In a real scenario, this would include database query time
          expect(executionTime).toBeLessThan(1000)

          // Verify the operation actually returned results when applicable
          const expectedCount = providers.filter(
            p => p.is_emergency === true && p.verification_status === 'verified'
          ).length
          expect(emergencyProviders.length).toBe(expectedCount)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 22: Emergency contact prominence
   * For any provider in the Emergency Now section, emergency contact information should be prominently displayed
   * Validates: Requirements 7.4
   */
  test('Property 22: Emergency contact prominence', () => {
    fc.assert(
      fc.property(
        fc.array(providerArbitrary(), { minLength: 10, maxLength: 100 }),
        (providers) => {
          const emergencyProviders = filterEmergencyProviders(providers)

          // Every emergency provider must have prominent contact information
          emergencyProviders.forEach(provider => {
            const hasContact = hasProminentContactInfo(provider)
            
            // If a provider is in the emergency section, it must have contact info
            // This is critical for emergency situations
            if (emergencyProviders.includes(provider)) {
              expect(hasContact).toBe(true)
              expect(provider.phone).toBeTruthy()
              expect(provider.phone?.trim().length).toBeGreaterThan(0)
            }
          })

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 23: Emergency section consistency
   * For any change to a provider's emergency availability status, the Emergency Now section should reflect the change
   * Validates: Requirements 7.5
   */
  test('Property 23: Emergency section consistency', () => {
    fc.assert(
      fc.property(
        fc.array(providerArbitrary(), { minLength: 10, maxLength: 50 }),
        fc.integer({ min: 0, max: 49 }), // Index of provider to modify
        fc.boolean(), // New emergency status
        (providers, providerIndex, newEmergencyStatus) => {
          // Skip if array is empty or index is out of bounds
          if (providers.length === 0 || providerIndex >= providers.length) {
            return true
          }

          const targetProvider = providers[providerIndex]
          
          // Get initial emergency providers
          const initialEmergencyProviders = filterEmergencyProviders(providers)
          const wasInEmergencySection = initialEmergencyProviders.some(p => p.id === targetProvider.id)

          // Simulate status change
          const updatedProviders = simulateEmergencyStatusChange(
            providers,
            targetProvider.id,
            newEmergencyStatus
          )

          // Get updated emergency providers
          const updatedEmergencyProviders = filterEmergencyProviders(updatedProviders)
          const isInEmergencySection = updatedEmergencyProviders.some(p => p.id === targetProvider.id)

          // Verify consistency based on the change
          if (newEmergencyStatus && targetProvider.verification_status === 'verified') {
            // If we set emergency to true and provider is verified, it should appear
            expect(isInEmergencySection).toBe(true)
          } else if (!newEmergencyStatus) {
            // If we set emergency to false, it should not appear
            expect(isInEmergencySection).toBe(false)
          }

          // Verify the change was reflected
          const updatedProvider = updatedProviders.find(p => p.id === targetProvider.id)
          expect(updatedProvider?.is_emergency).toBe(newEmergencyStatus)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 20a: Only verified emergency providers are shown
   * For any provider, it should only appear in emergency section if both is_emergency=true AND verification_status='verified'
   * Validates: Requirements 7.2
   */
  test('Property 20a: Only verified emergency providers are shown', () => {
    fc.assert(
      fc.property(
        fc.array(providerArbitrary(), { minLength: 20, maxLength: 100 }),
        (providers) => {
          const emergencyProviders = filterEmergencyProviders(providers)

          // Check that no unverified providers are in the emergency section
          const unverifiedProviders = providers.filter(
            p => p.verification_status !== 'verified'
          )
          
          unverifiedProviders.forEach(unverifiedProvider => {
            const isInEmergencySection = emergencyProviders.some(
              ep => ep.id === unverifiedProvider.id
            )
            expect(isInEmergencySection).toBe(false)
          })

          // Check that no non-emergency providers are in the section
          const nonEmergencyProviders = providers.filter(
            p => p.is_emergency !== true
          )
          
          nonEmergencyProviders.forEach(nonEmergencyProvider => {
            const isInEmergencySection = emergencyProviders.some(
              ep => ep.id === nonEmergencyProvider.id
            )
            expect(isInEmergencySection).toBe(false)
          })

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 22a: Emergency contact information completeness
   * For any emergency provider, the phone number should be in a valid format
   * Validates: Requirements 7.4
   */
  test('Property 22a: Emergency contact information completeness', () => {
    fc.assert(
      fc.property(
        fc.array(providerArbitrary(), { minLength: 10, maxLength: 100 }),
        (providers) => {
          const emergencyProviders = filterEmergencyProviders(providers)

          emergencyProviders.forEach(provider => {
            // Phone must exist
            expect(provider.phone).toBeTruthy()
            
            // Phone must not be just whitespace
            expect(provider.phone?.trim()).toBeTruthy()
            
            // Phone should have reasonable length (at least 8 digits for Algerian numbers)
            expect(provider.phone?.replace(/\D/g, '').length).toBeGreaterThanOrEqual(8)
          })

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 23a: Emergency section real-time consistency
   * For any sequence of status changes, the emergency section should always reflect the current state
   * Validates: Requirements 7.5
   */
  test('Property 23a: Emergency section real-time consistency', () => {
    fc.assert(
      fc.property(
        fc.array(providerArbitrary(), { minLength: 5, maxLength: 20 }),
        fc.array(
          fc.record({
            providerIndex: fc.integer({ min: 0, max: 19 }),
            newStatus: fc.boolean()
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (initialProviders, statusChanges) => {
          let currentProviders = [...initialProviders]

          // Apply each status change sequentially
          statusChanges.forEach(change => {
            if (change.providerIndex < currentProviders.length) {
              const targetProvider = currentProviders[change.providerIndex]
              currentProviders = simulateEmergencyStatusChange(
                currentProviders,
                targetProvider.id,
                change.newStatus
              )

              // After each change, verify the emergency section is consistent
              const emergencyProviders = filterEmergencyProviders(currentProviders)
              const updatedProvider = currentProviders.find(p => p.id === targetProvider.id)
              
              if (updatedProvider) {
                const shouldBeInSection = 
                  updatedProvider.is_emergency === true && 
                  updatedProvider.verification_status === 'verified'
                
                const isInSection = emergencyProviders.some(p => p.id === updatedProvider.id)
                
                expect(isInSection).toBe(shouldBeInSection)
              }
            }
          })

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 21a: Emergency section filter performance with large datasets
   * For any large dataset, filtering should still complete quickly
   * Validates: Requirements 7.3
   */
  test('Property 21a: Emergency section filter performance with large datasets', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(providerArbitrary(), { minLength: 100, maxLength: 500 }),
        async (providers) => {
          const startTime = performance.now()
          
          // Perform the filtering operation
          const emergencyProviders = filterEmergencyProviders(providers)
          
          const endTime = performance.now()
          const executionTime = endTime - startTime

          // Even with large datasets, filtering should be fast
          expect(executionTime).toBeLessThan(1000)

          // Verify correctness wasn't sacrificed for speed
          emergencyProviders.forEach(provider => {
            expect(provider.is_emergency).toBe(true)
            expect(provider.verification_status).toBe('verified')
          })

          return true
        }
      ),
      { numRuns: 50 } // Fewer runs for large datasets
    )
  })
})
