/**
 * Property-Based Tests for Favorites System
 * Feature: cityhealth-platform, Properties 14, 15, 16: Favorites functionality
 * Validates: Requirements 5.1, 5.4, 5.5
 */

import { describe, test, expect, beforeEach, vi } from 'vitest'
import * as fc from 'fast-check'
import { FavoritesService } from '@/services/favoritesService'

// Mock the supabase client import
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
    channel: vi.fn(),
  },
}))

// Import the mocked supabase client
import { supabase } from '@/integrations/supabase/client'
const mockSupabaseClient = supabase as any

// Generator for authenticated user
const authenticatedUserGen = fc.record({
  id: fc.uuid(),
  email: fc.emailAddress(),
  role: fc.constantFrom('citizen', 'provider'),
})

// Generator for provider IDs
const providerIdGen = fc.uuid()

// Generator for provider data
const providerGen = fc.record({
  id: fc.uuid(),
  user_id: fc.uuid(),
  business_name: fc.string({ minLength: 1, maxLength: 100 }),
  provider_type: fc.constantFrom('doctor', 'clinic', 'hospital', 'pharmacy', 'laboratory'),
  phone: fc.string({ minLength: 10, maxLength: 15 }),
  address: fc.string({ minLength: 5, maxLength: 200 }),
  verification_status: fc.constantFrom('pending', 'verified', 'rejected'),
  created_at: fc.constantFrom('2023-01-01T00:00:00.000Z', '2023-06-15T12:30:00.000Z', '2024-01-01T00:00:00.000Z'),
})

// Generator for favorite records
const favoriteGen = fc.record({
  id: fc.uuid(),
  user_id: fc.uuid(),
  provider_id: fc.uuid(),
  created_at: fc.constantFrom('2023-01-01T00:00:00.000Z', '2023-06-15T12:30:00.000Z', '2024-01-01T00:00:00.000Z'),
})

// Generator for favorite with provider data
const favoriteWithProviderGen = fc.record({
  id: fc.uuid(),
  user_id: fc.uuid(),
  provider_id: fc.uuid(),
  created_at: fc.constantFrom('2023-01-01T00:00:00.000Z', '2023-06-15T12:30:00.000Z', '2024-01-01T00:00:00.000Z'),
  provider: providerGen,
})

describe('Favorites System Property Tests', () => {
  let favoritesService: FavoritesService

  beforeEach(() => {
    vi.clearAllMocks()
    favoritesService = new FavoritesService()
  })

  /**
   * Property 14: Favorite addition
   * For any authenticated user and any provider, clicking the favorite button should add the provider to the user's favorites list
   * Validates: Requirements 5.1
   */
  test('Property 14: Favorite addition', async () => {
    await fc.assert(
      fc.asyncProperty(
        authenticatedUserGen,
        providerIdGen,
        async (user, providerId) => {
          // Mock authenticated user
          mockSupabaseClient.auth.getUser.mockResolvedValue({
            data: { user: { id: user.id } },
            error: null,
          })

          // Mock successful insert
          const mockFrom = {
            insert: vi.fn().mockReturnValue({
              error: null,
            }),
          }
          mockSupabaseClient.from.mockReturnValue(mockFrom)

          // Test adding favorite
          await expect(favoritesService.addFavorite(providerId)).resolves.not.toThrow()

          // Verify the insert was called with correct data
          expect(mockSupabaseClient.from).toHaveBeenCalledWith('favorites')
          expect(mockFrom.insert).toHaveBeenCalledWith({
            user_id: user.id,
            provider_id: providerId,
          })

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 14a: Favorite addition requires authentication', async () => {
    await fc.assert(
      fc.asyncProperty(
        providerIdGen,
        async (providerId) => {
          // Mock unauthenticated user
          mockSupabaseClient.auth.getUser.mockResolvedValue({
            data: { user: null },
            error: null,
          })

          // Test adding favorite without authentication should throw
          await expect(favoritesService.addFavorite(providerId)).rejects.toThrow(
            'Authentication required to add favorites'
          )

          return true
        }
      ),
      { numRuns: 50 }
    )
  })

  test('Property 14b: Duplicate favorite addition handling', async () => {
    await fc.assert(
      fc.asyncProperty(
        authenticatedUserGen,
        providerIdGen,
        async (user, providerId) => {
          // Mock authenticated user
          mockSupabaseClient.auth.getUser.mockResolvedValue({
            data: { user: { id: user.id } },
            error: null,
          })

          // Mock unique constraint violation (already favorited)
          const mockFrom = {
            insert: vi.fn().mockReturnValue({
              error: { code: '23505', message: 'duplicate key value violates unique constraint' },
            }),
          }
          mockSupabaseClient.from.mockReturnValue(mockFrom)

          // Test adding duplicate favorite should throw appropriate error
          await expect(favoritesService.addFavorite(providerId)).rejects.toThrow(
            'Provider is already in your favorites'
          )

          return true
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property 16: Favorite removal
   * For any provider in a user's favorites list, removing it should immediately update the favorites list to exclude that provider
   * Validates: Requirements 5.5
   */
  test('Property 16: Favorite removal', async () => {
    await fc.assert(
      fc.asyncProperty(
        authenticatedUserGen,
        providerIdGen,
        async (user, providerId) => {
          // Mock authenticated user
          mockSupabaseClient.auth.getUser.mockResolvedValue({
            data: { user: { id: user.id } },
            error: null,
          })

          // Mock successful delete
          const mockFrom = {
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  error: null,
                }),
              }),
            }),
          }
          mockSupabaseClient.from.mockReturnValue(mockFrom)

          // Test removing favorite
          await expect(favoritesService.removeFavorite(providerId)).resolves.not.toThrow()

          // Verify the delete was called with correct filters
          expect(mockSupabaseClient.from).toHaveBeenCalledWith('favorites')
          expect(mockFrom.delete).toHaveBeenCalled()

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 16a: Favorite removal requires authentication', async () => {
    await fc.assert(
      fc.asyncProperty(
        providerIdGen,
        async (providerId) => {
          // Mock unauthenticated user
          mockSupabaseClient.auth.getUser.mockResolvedValue({
            data: { user: null },
            error: null,
          })

          // Test removing favorite without authentication should throw
          await expect(favoritesService.removeFavorite(providerId)).rejects.toThrow(
            'Authentication required to remove favorites'
          )

          return true
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property 15: Favorites display completeness
   * For any authenticated user, all providers they have favorited should be visible in their favorites section
   * Validates: Requirements 5.4
   */
  test('Property 15: Favorites display completeness', async () => {
    await fc.assert(
      fc.asyncProperty(
        authenticatedUserGen,
        fc.array(favoriteWithProviderGen, { minLength: 0, maxLength: 10 }),
        async (user, userFavorites) => {
          // Mock authenticated user
          mockSupabaseClient.auth.getUser.mockResolvedValue({
            data: { user: { id: user.id } },
            error: null,
          })

          // Mock successful select with join
          const mockFrom = {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  data: userFavorites,
                  error: null,
                }),
              }),
            }),
          }
          mockSupabaseClient.from.mockReturnValue(mockFrom)

          // Test getting favorites
          const result = await favoritesService.getFavorites()

          // Verify all favorites are returned
          expect(result).toHaveLength(userFavorites.length)
          
          // Verify each favorite has provider data
          result.forEach((favorite, index) => {
            expect(favorite).toHaveProperty('id')
            expect(favorite).toHaveProperty('user_id')
            expect(favorite).toHaveProperty('provider_id')
            expect(favorite).toHaveProperty('provider')
            expect(favorite.provider).toHaveProperty('business_name')
            expect(favorite.provider).toHaveProperty('provider_type')
          })

          // Verify the query was constructed correctly
          expect(mockSupabaseClient.from).toHaveBeenCalledWith('favorites')
          expect(mockFrom.select).toHaveBeenCalledWith(`
        *,
        provider:providers(*)
      `)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 15a: Favorites display requires authentication', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant(null),
        async () => {
          // Mock unauthenticated user
          mockSupabaseClient.auth.getUser.mockResolvedValue({
            data: { user: null },
            error: null,
          })

          // Test getting favorites without authentication should throw
          await expect(favoritesService.getFavorites()).rejects.toThrow(
            'Authentication required to get favorites'
          )

          return true
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property 15b: Favorite status checking
   * For any provider and authenticated user, the isFavorite method should correctly identify if the provider is favorited
   * Validates: Requirements 5.1, 5.4
   */
  test('Property 15b: Favorite status checking', async () => {
    await fc.assert(
      fc.asyncProperty(
        authenticatedUserGen,
        providerIdGen,
        fc.boolean(),
        async (user, providerId, isFavorited) => {
          // Mock authenticated user
          mockSupabaseClient.auth.getUser.mockResolvedValue({
            data: { user: { id: user.id } },
            error: null,
          })

          // Mock the response based on whether it should be favorited
          const mockFrom = {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockReturnValue(
                    isFavorited
                      ? { data: { id: fc.sample(fc.uuid(), 1)[0] }, error: null }
                      : { data: null, error: { code: 'PGRST116' } }
                  ),
                }),
              }),
            }),
          }
          mockSupabaseClient.from.mockReturnValue(mockFrom)

          // Test checking favorite status
          const result = await favoritesService.isFavorite(providerId)

          // Verify the result matches expected status
          expect(result).toBe(isFavorited)

          // Verify the query was constructed correctly
          expect(mockSupabaseClient.from).toHaveBeenCalledWith('favorites')
          expect(mockFrom.select).toHaveBeenCalledWith('id')

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 15c: Unauthenticated favorite status checking', async () => {
    await fc.assert(
      fc.asyncProperty(
        providerIdGen,
        async (providerId) => {
          // Mock unauthenticated user
          mockSupabaseClient.auth.getUser.mockResolvedValue({
            data: { user: null },
            error: null,
          })

          // Test checking favorite status without authentication should return false
          const result = await favoritesService.isFavorite(providerId)
          expect(result).toBe(false)

          return true
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property 14c: Toggle favorite functionality
   * For any provider, toggling favorite status should correctly add or remove the favorite
   * Validates: Requirements 5.1, 5.5
   */
  test('Property 14c: Toggle favorite functionality', async () => {
    await fc.assert(
      fc.asyncProperty(
        authenticatedUserGen,
        providerIdGen,
        fc.boolean(),
        async (user, providerId, initiallyFavorited) => {
          // Mock authenticated user
          mockSupabaseClient.auth.getUser.mockResolvedValue({
            data: { user: { id: user.id } },
            error: null,
          })

          // Mock isFavorite check
          const mockFromCheck = {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockReturnValue(
                    initiallyFavorited
                      ? { data: { id: fc.sample(fc.uuid(), 1)[0] }, error: null }
                      : { data: null, error: { code: 'PGRST116' } }
                  ),
                }),
              }),
            }),
          }

          // Mock add/remove operations
          const mockFromAction = initiallyFavorited
            ? {
                delete: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                      error: null,
                    }),
                  }),
                }),
              }
            : {
                insert: vi.fn().mockReturnValue({
                  error: null,
                }),
              }

          mockSupabaseClient.from
            .mockReturnValueOnce(mockFromCheck) // First call for isFavorite check
            .mockReturnValueOnce(mockFromAction) // Second call for add/remove action

          // Test toggling favorite
          const result = await favoritesService.toggleFavorite(providerId)

          // Verify the result is opposite of initial state
          expect(result).toBe(!initiallyFavorited)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})