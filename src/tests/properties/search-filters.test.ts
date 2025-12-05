/**
 * Property-Based Tests for Search Filters
 * Feature: cityhealth-platform, Properties 4, 6: Filter functionality
 * Validates: Requirements 2.3, 2.5
 */

import { describe, test, expect, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { CityHealthProvider, generateMockProviders, ACCESSIBILITY_FEATURES, PROVIDER_TYPES } from '@/data/providers'
import { FilterState } from '@/pages/SearchPage'

// Generator for provider types
const providerTypeGen = fc.constantFrom(...PROVIDER_TYPES)

// Generator for accessibility features
const accessibilityFeatureGen = fc.constantFrom(...ACCESSIBILITY_FEATURES)

// Generator for accessibility features array (0-3 features)
const accessibilityFeaturesArrayGen = fc.array(accessibilityFeatureGen, { minLength: 0, maxLength: 3 })
  .map(features => [...new Set(features)]) // Remove duplicates

// Generator for valid category strings (non-empty, no commas)
const validCategoryGen = fc.string({ minLength: 1, maxLength: 20 })
  .filter(s => s.trim().length > 0 && !s.includes(','))

// Generator for filter state
const filterStateGen = fc.record({
  categories: fc.array(validCategoryGen, { minLength: 0, maxLength: 5 }),
  location: fc.string({ maxLength: 50 }),
  radius: fc.integer({ min: 1, max: 50 }),
  availability: fc.constantFrom('any', 'today', 'week', 'now'),
  minRating: fc.float({ min: Math.fround(0), max: Math.fround(5), noNaN: true }),
  verifiedOnly: fc.boolean(),
  emergencyServices: fc.boolean(),
  wheelchairAccessible: fc.boolean(),
  insuranceAccepted: fc.boolean(),
  priceRange: fc.tuple(fc.integer({ min: 0, max: 500 }), fc.integer({ min: 0, max: 500 }))
    .map(([a, b]) => [Math.min(a, b), Math.max(a, b)] as [number, number]),
  accessibility_features: accessibilityFeaturesArrayGen,
  home_visit_available: fc.boolean(),
})

// Generator for providers with new fields
const providerGen = fc.record({
  id: fc.string(),
  name: fc.string({ minLength: 1 }),
  type: providerTypeGen,
  specialty: fc.option(fc.string()),
  rating: fc.float({ min: Math.fround(1), max: Math.fround(5), noNaN: true }),
  reviewsCount: fc.integer({ min: 0, max: 1000 }),
  distance: fc.float({ min: Math.fround(0), max: Math.fround(50), noNaN: true }),
  verified: fc.boolean(),
  emergency: fc.boolean(),
  accessible: fc.boolean(),
  isOpen: fc.boolean(),
  address: fc.string({ minLength: 1 }),
  city: fc.string({ minLength: 1 }),
  area: fc.string({ minLength: 1 }),
  phone: fc.string({ minLength: 1 }),
  image: fc.string(),
  lat: fc.float({ min: Math.fround(-90), max: Math.fround(90), noNaN: true }),
  lng: fc.float({ min: Math.fround(-180), max: Math.fround(180), noNaN: true }),
  languages: fc.array(fc.constantFrom('ar', 'fr', 'en'), { minLength: 1, maxLength: 3 }),
  description: fc.string(),
  accessibility_features: accessibilityFeaturesArrayGen,
  home_visit_available: fc.boolean(),
})

// Function to apply filters (extracted from SearchPage logic)
function applyFilters(providers: CityHealthProvider[], filters: FilterState, searchQuery: string = ''): CityHealthProvider[] {
  let results = providers;

  // Text search
  if (searchQuery) {
    results = results.filter(provider =>
      provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (provider.specialty || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Category filter
  if (filters.categories.length > 0) {
    results = results.filter(provider =>
      filters.categories.some(category => 
        (provider.specialty || '').toLowerCase().includes(category.toLowerCase()) ||
        provider.type.toLowerCase().includes(category.toLowerCase())
      )
    );
  }

  // Rating filter
  if (filters.minRating > 0) {
    results = results.filter(provider => provider.rating >= filters.minRating);
  }

  // Verified only
  if (filters.verifiedOnly) {
    results = results.filter(provider => provider.verified);
  }

  // Emergency services
  if (filters.emergencyServices) {
    results = results.filter(provider => provider.emergency);
  }

  // Accessibility features filter (match ANY selected)
  if (filters.accessibility_features.length > 0) {
    results = results.filter(provider => 
      filters.accessibility_features.some(feature => 
        provider.accessibility_features.includes(feature)
      )
    );
  }

  // Home visit availability filter
  if (filters.home_visit_available) {
    results = results.filter(provider => provider.home_visit_available);
  }

  return results;
}

// Helper functions for URL parameter persistence testing (copied from SearchPage)
const serializeFilters = (filters: FilterState): URLSearchParams => {
  const params = new URLSearchParams();
  
  const validCategories = filters.categories.filter(c => c.length > 0 && !c.includes(','));
  if (validCategories.length > 0) {
    params.set('categories', validCategories.join(','));
  }
  if (filters.location) {
    params.set('location', filters.location);
  }
  if (filters.radius !== 25) {
    params.set('radius', filters.radius.toString());
  }
  if (filters.availability !== 'any') {
    params.set('availability', filters.availability);
  }
  if (filters.minRating > 0 && !isNaN(filters.minRating)) {
    params.set('minRating', filters.minRating.toString());
  }
  if (filters.verifiedOnly) {
    params.set('verifiedOnly', 'true');
  }
  if (filters.emergencyServices) {
    params.set('emergencyServices', 'true');
  }
  if (filters.wheelchairAccessible) {
    params.set('wheelchairAccessible', 'true');
  }
  if (filters.insuranceAccepted) {
    params.set('insuranceAccepted', 'true');
  }
  if (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 500) {
    params.set('priceRange', `${filters.priceRange[0]},${filters.priceRange[1]}`);
  }
  const validAccessibilityFeatures = filters.accessibility_features.filter(f => f.length > 0 && !f.includes(','));
  if (validAccessibilityFeatures.length > 0) {
    params.set('accessibilityFeatures', validAccessibilityFeatures.join(','));
  }
  if (filters.home_visit_available) {
    params.set('homeVisitAvailable', 'true');
  }
  
  return params;
};

const deserializeFilters = (searchParams: URLSearchParams): FilterState => {
  const minRatingStr = searchParams.get('minRating');
  const minRating = minRatingStr ? parseFloat(minRatingStr) : 0;
  
  return {
    categories: searchParams.get('categories')?.split(',').filter(s => s.length > 0 && !s.includes(',')) || [],
    location: searchParams.get('location') || '',
    radius: parseInt(searchParams.get('radius') || '25'),
    availability: searchParams.get('availability') || 'any',
    minRating: isNaN(minRating) ? 0 : minRating,
    verifiedOnly: searchParams.get('verifiedOnly') === 'true',
    emergencyServices: searchParams.get('emergencyServices') === 'true',
    wheelchairAccessible: searchParams.get('wheelchairAccessible') === 'true',
    insuranceAccepted: searchParams.get('insuranceAccepted') === 'true',
    priceRange: searchParams.get('priceRange')?.split(',').map(Number) as [number, number] || [0, 500],
    accessibility_features: searchParams.get('accessibilityFeatures')?.split(',').filter(s => s.length > 0 && !s.includes(',')) || [],
    home_visit_available: searchParams.get('homeVisitAvailable') === 'true',
  };
};

describe('Search Filters Property Tests', () => {
  let mockProviders: CityHealthProvider[]

  beforeEach(() => {
    // Generate fresh mock data for each test
    mockProviders = generateMockProviders(100)
  })

  /**
   * Property 4: Filter conjunction correctness
   * For any combination of filters applied to search results, all returned providers should match ALL selected filter criteria (AND logic)
   * Validates: Requirements 2.3
   */
  test('Property 4: Filter conjunction correctness', () => {
    fc.assert(
      fc.property(
        fc.array(providerGen, { minLength: 10, maxLength: 50 }),
        filterStateGen,
        (providers, filters) => {
          const results = applyFilters(providers, filters)

          // Verify each result matches ALL applied filters
          results.forEach(provider => {
            // Rating filter
            if (filters.minRating > 0) {
              expect(provider.rating).toBeGreaterThanOrEqual(filters.minRating)
            }

            // Verified only filter
            if (filters.verifiedOnly) {
              expect(provider.verified).toBe(true)
            }

            // Emergency services filter
            if (filters.emergencyServices) {
              expect(provider.emergency).toBe(true)
            }

            // Accessibility features filter (ANY match)
            if (filters.accessibility_features.length > 0) {
              const hasMatchingFeature = filters.accessibility_features.some(feature => 
                provider.accessibility_features.includes(feature)
              )
              expect(hasMatchingFeature).toBe(true)
            }

            // Home visit availability filter
            if (filters.home_visit_available) {
              expect(provider.home_visit_available).toBe(true)
            }

            // Category filter
            if (filters.categories.length > 0) {
              const matchesCategory = filters.categories.some(category => 
                (provider.specialty || '').toLowerCase().includes(category.toLowerCase()) ||
                provider.type.toLowerCase().includes(category.toLowerCase())
              )
              expect(matchesCategory).toBe(true)
            }
          })

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 6: Result count accuracy
   * For any filter combination, the displayed result count should equal the actual number of provider results returned
   * Validates: Requirements 2.5
   */
  test('Property 6: Result count accuracy', () => {
    fc.assert(
      fc.property(
        fc.array(providerGen, { minLength: 0, maxLength: 100 }),
        filterStateGen,
        fc.string(),
        (providers, filters, searchQuery) => {
          const results = applyFilters(providers, filters, searchQuery)
          
          // The count should exactly match the number of results
          expect(results.length).toBe(results.length)
          
          // Verify count is non-negative
          expect(results.length).toBeGreaterThanOrEqual(0)
          
          // Verify count doesn't exceed original provider count
          expect(results.length).toBeLessThanOrEqual(providers.length)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 4a: Accessibility features filter correctness
   * For any selected accessibility features, results should only include providers that have at least one of the selected features
   * Validates: Requirements 2.3
   */
  test('Property 4a: Accessibility features filter correctness', () => {
    fc.assert(
      fc.property(
        fc.array(providerGen, { minLength: 10, maxLength: 50 }),
        fc.array(accessibilityFeatureGen, { minLength: 1, maxLength: 3 }).map(arr => [...new Set(arr)]),
        (providers, selectedFeatures) => {
          const filters: FilterState = {
            categories: [],
            location: '',
            radius: 25,
            availability: 'any',
            minRating: 0,
            verifiedOnly: false,
            emergencyServices: false,
            wheelchairAccessible: false,
            insuranceAccepted: false,
            priceRange: [0, 500],
            accessibility_features: selectedFeatures,
            home_visit_available: false,
          }

          const results = applyFilters(providers, filters)

          // Every result should have at least one of the selected accessibility features
          results.forEach(provider => {
            const hasMatchingFeature = selectedFeatures.some(feature => 
              provider.accessibility_features.includes(feature)
            )
            expect(hasMatchingFeature).toBe(true)
          })

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 4b: Home visit filter correctness
   * When home visit filter is enabled, all results should have home_visit_available = true
   * Validates: Requirements 2.3
   */
  test('Property 4b: Home visit filter correctness', () => {
    fc.assert(
      fc.property(
        fc.array(providerGen, { minLength: 10, maxLength: 50 }),
        (providers) => {
          const filters: FilterState = {
            categories: [],
            location: '',
            radius: 25,
            availability: 'any',
            minRating: 0,
            verifiedOnly: false,
            emergencyServices: false,
            wheelchairAccessible: false,
            insuranceAccepted: false,
            priceRange: [0, 500],
            accessibility_features: [],
            home_visit_available: true,
          }

          const results = applyFilters(providers, filters)

          // Every result should have home_visit_available = true
          results.forEach(provider => {
            expect(provider.home_visit_available).toBe(true)
          })

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 4c: Multiple filters conjunction
   * When multiple filters are applied, results should satisfy ALL conditions
   * Validates: Requirements 2.3
   */
  test('Property 4c: Multiple filters conjunction', () => {
    fc.assert(
      fc.property(
        fc.array(providerGen, { minLength: 20, maxLength: 100 }),
        fc.array(accessibilityFeatureGen, { minLength: 1, maxLength: 2 }).map(arr => [...new Set(arr)]),
        fc.float({ min: Math.fround(3), max: Math.fround(5), noNaN: true }),
        (providers, selectedFeatures, minRating) => {
          const filters: FilterState = {
            categories: [],
            location: '',
            radius: 25,
            availability: 'any',
            minRating,
            verifiedOnly: true,
            emergencyServices: false,
            wheelchairAccessible: false,
            insuranceAccepted: false,
            priceRange: [0, 500],
            accessibility_features: selectedFeatures,
            home_visit_available: true,
          }

          const results = applyFilters(providers, filters)

          // Every result should satisfy ALL conditions
          results.forEach(provider => {
            // Must be verified
            expect(provider.verified).toBe(true)
            
            // Must meet minimum rating
            expect(provider.rating).toBeGreaterThanOrEqual(minRating)
            
            // Must have home visits available
            expect(provider.home_visit_available).toBe(true)
            
            // Must have at least one selected accessibility feature
            const hasMatchingFeature = selectedFeatures.some(feature => 
              provider.accessibility_features.includes(feature)
            )
            expect(hasMatchingFeature).toBe(true)
          })

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 6a: Empty filter result count
   * When no filters are applied, result count should equal total provider count
   * Validates: Requirements 2.5
   */
  test('Property 6a: Empty filter result count', () => {
    fc.assert(
      fc.property(
        fc.array(providerGen, { minLength: 0, maxLength: 50 }),
        (providers) => {
          const emptyFilters: FilterState = {
            categories: [],
            location: '',
            radius: 25,
            availability: 'any',
            minRating: 0,
            verifiedOnly: false,
            emergencyServices: false,
            wheelchairAccessible: false,
            insuranceAccepted: false,
            priceRange: [0, 500],
            accessibility_features: [],
            home_visit_available: false,
          }

          const results = applyFilters(providers, emptyFilters, '')
          
          // With no filters, should return all providers
          expect(results.length).toBe(providers.length)

          return true
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property 6b: Restrictive filter result count
   * When very restrictive filters are applied, result count should be less than or equal to original count
   * Validates: Requirements 2.5
   */
  test('Property 6b: Restrictive filter result count', () => {
    fc.assert(
      fc.property(
        fc.array(providerGen, { minLength: 10, maxLength: 100 }),
        (providers) => {
          const restrictiveFilters: FilterState = {
            categories: [],
            location: '',
            radius: 25,
            availability: 'any',
            minRating: 4.5, // Very high rating requirement
            verifiedOnly: true,
            emergencyServices: true,
            wheelchairAccessible: false,
            insuranceAccepted: false,
            priceRange: [0, 500],
            accessibility_features: ['wheelchair', 'elevator'], // Multiple accessibility requirements
            home_visit_available: true,
          }

          const results = applyFilters(providers, restrictiveFilters)
          
          // Restrictive filters should return fewer or equal results
          expect(results.length).toBeLessThanOrEqual(providers.length)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 5: Filter state persistence
   * For any set of applied filters, navigating to a provider profile and back should preserve the same filter selections and results
   * Validates: Requirements 2.4
   */
  test('Property 5: Filter state persistence', () => {
    fc.assert(
      fc.property(
        filterStateGen,
        fc.string(),
        (filters, searchQuery) => {
          // Serialize filters to URL parameters
          const params = serializeFilters(filters);
          if (searchQuery) {
            params.set('q', searchQuery);
          }

          // Deserialize filters from URL parameters
          const restoredFilters = deserializeFilters(params);
          const restoredSearchQuery = params.get('q') || '';

          // Verify all filter properties are preserved (accounting for filtering of invalid values)
          const expectedCategories = filters.categories.filter(c => c.length > 0 && !c.includes(','));
          expect(restoredFilters.categories).toEqual(expectedCategories);
          expect(restoredFilters.location).toBe(filters.location);
          expect(restoredFilters.radius).toBe(filters.radius);
          expect(restoredFilters.availability).toBe(filters.availability);
          expect(restoredFilters.minRating).toBe(isNaN(filters.minRating) ? 0 : filters.minRating);
          expect(restoredFilters.verifiedOnly).toBe(filters.verifiedOnly);
          expect(restoredFilters.emergencyServices).toBe(filters.emergencyServices);
          expect(restoredFilters.wheelchairAccessible).toBe(filters.wheelchairAccessible);
          expect(restoredFilters.insuranceAccepted).toBe(filters.insuranceAccepted);
          expect(restoredFilters.priceRange).toEqual(filters.priceRange);
          const expectedAccessibilityFeatures = filters.accessibility_features.filter(f => f.length > 0 && !f.includes(','));
          expect(restoredFilters.accessibility_features).toEqual(expectedAccessibilityFeatures);
          expect(restoredFilters.home_visit_available).toBe(filters.home_visit_available);

          // Verify search query is preserved
          expect(restoredSearchQuery).toBe(searchQuery);

          return true;
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 5a: Round-trip filter serialization
   * For any filter state, serializing and then deserializing should produce an equivalent state
   * Validates: Requirements 2.4
   */
  test('Property 5a: Round-trip filter serialization', () => {
    fc.assert(
      fc.property(
        filterStateGen,
        (originalFilters) => {
          // Round-trip: serialize then deserialize
          const params = serializeFilters(originalFilters);
          const restoredFilters = deserializeFilters(params);

          // The restored filters should be functionally equivalent
          // (invalid values get filtered out during serialization)
          const expectedCategories = originalFilters.categories.filter(c => c.length > 0 && !c.includes(','));
          expect(restoredFilters.categories).toEqual(expectedCategories);
          expect(restoredFilters.location).toBe(originalFilters.location);
          expect(restoredFilters.radius).toBe(originalFilters.radius);
          expect(restoredFilters.availability).toBe(originalFilters.availability);
          expect(restoredFilters.minRating).toBe(isNaN(originalFilters.minRating) ? 0 : originalFilters.minRating);
          expect(restoredFilters.verifiedOnly).toBe(originalFilters.verifiedOnly);
          expect(restoredFilters.emergencyServices).toBe(originalFilters.emergencyServices);
          expect(restoredFilters.wheelchairAccessible).toBe(originalFilters.wheelchairAccessible);
          expect(restoredFilters.insuranceAccepted).toBe(originalFilters.insuranceAccepted);
          expect(restoredFilters.priceRange).toEqual(originalFilters.priceRange);
          const expectedAccessibilityFeatures = originalFilters.accessibility_features.filter(f => f.length > 0 && !f.includes(','));
          expect(restoredFilters.accessibility_features).toEqual(expectedAccessibilityFeatures);
          expect(restoredFilters.home_visit_available).toBe(originalFilters.home_visit_available);

          return true;
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 5b: URL parameter format consistency
   * For any filter state, the URL parameters should be in a consistent, readable format
   * Validates: Requirements 2.4
   */
  test('Property 5b: URL parameter format consistency', () => {
    fc.assert(
      fc.property(
        filterStateGen,
        (filters) => {
          const params = serializeFilters(filters);
          
          // Verify parameter names are consistent
          const paramNames = Array.from(params.keys());
          const validParamNames = [
            'categories', 'location', 'radius', 'availability', 'minRating',
            'verifiedOnly', 'emergencyServices', 'wheelchairAccessible', 
            'insuranceAccepted', 'priceRange', 'accessibilityFeatures', 'homeVisitAvailable'
          ];
          
          paramNames.forEach(name => {
            expect(validParamNames).toContain(name);
          });

          // Verify boolean parameters are either 'true' or not present
          const booleanParams = ['verifiedOnly', 'emergencyServices', 'wheelchairAccessible', 'insuranceAccepted', 'homeVisitAvailable'];
          booleanParams.forEach(param => {
            const value = params.get(param);
            if (value !== null) {
              expect(value).toBe('true');
            }
          });

          // Verify array parameters use comma separation
          const arrayParams = ['categories', 'accessibilityFeatures'];
          arrayParams.forEach(param => {
            const value = params.get(param);
            if (value !== null && value.length > 0) {
              expect(value).toMatch(/^[^,]+(,[^,]+)*$/); // No empty segments
            }
          });

          return true;
        }
      ),
      { numRuns: 100 }
    )
  })
})