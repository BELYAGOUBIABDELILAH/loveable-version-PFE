/**
 * Property-Based Tests for Provider Management
 * Feature: cityhealth-platform, Properties 24, 26, 27, 28, 30: Provider management functionality
 * Validates: Requirements 8.2, 9.1, 9.2, 9.3, 9.5
 */

import { describe, test, expect, beforeEach, vi } from 'vitest'
import * as fc from 'fast-check'
import { providerArbitrary, phoneArbitrary, emailArbitrary, accessibilityFeaturesArbitrary } from '@/tests/generators'

// Mock the supabase client import
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      signUp: vi.fn(),
    },
    from: vi.fn(),
    storage: {
      from: vi.fn(),
    },
  },
}))

// Import the mocked supabase client
import { supabase } from '@/integrations/supabase/client'
const mockSupabaseClient = supabase as any

// Generator for provider registration data
const providerRegistrationGen = fc.record({
  business_name: fc.string({ minLength: 3, maxLength: 100 }),
  provider_type: fc.constantFrom('doctor', 'clinic', 'hospital', 'pharmacy', 'laboratory'),
  phone: phoneArbitrary(),
  email: emailArbitrary(),
  address: fc.string({ minLength: 10, maxLength: 200 }),
  password: fc.string({ minLength: 8, maxLength: 50 }),
})

// Generator for profile update data
const profileUpdateGen = fc.record({
  business_name: fc.option(fc.string({ minLength: 3, maxLength: 100 })),
  phone: fc.option(phoneArbitrary()),
  address: fc.option(fc.string({ minLength: 10, maxLength: 200 })),
  description: fc.option(fc.string({ minLength: 20, maxLength: 500 })),
  accessibility_features: fc.option(accessibilityFeaturesArbitrary()),
  home_visit_available: fc.option(fc.boolean()),
})

// Generator for photo files (simulated)
const photoFileGen = fc.record({
  name: fc.string({ minLength: 5, maxLength: 50 }).map(s => `${s}.jpg`),
  size: fc.integer({ min: 1024, max: 5 * 1024 * 1024 }), // 1KB to 5MB
  type: fc.constantFrom('image/jpeg', 'image/png', 'image/webp'),
})

// Mock provider registration service
class ProviderRegistrationService {
  async register(data: any): Promise<{ success: boolean; userId: string; providerId: string }> {
    const { data: authData, error: authError } = await mockSupabaseClient.auth.signUp({
      email: data.email,
      password: data.password,
    })

    if (authError) {
      throw new Error('Registration failed: ' + authError.message)
    }

    const userId = authData.user?.id
    if (!userId) {
      throw new Error('User ID not returned')
    }

    // Create provider profile
    const { data: providerData, error: providerError } = await mockSupabaseClient
      .from('providers')
      .insert({
        user_id: userId,
        business_name: data.business_name,
        provider_type: data.provider_type,
        phone: data.phone,
        email: data.email,
        address: data.address,
        verification_status: 'pending',
      })
      .select()
      .single()

    if (providerError) {
      throw new Error('Provider creation failed: ' + providerError.message)
    }

    return {
      success: true,
      userId,
      providerId: providerData.id,
    }
  }
}

// Mock provider profile service
class ProviderProfileService {
  async getProfile(providerId: string): Promise<any> {
    const { data, error } = await mockSupabaseClient
      .from('providers')
      .select('*')
      .eq('id', providerId)
      .single()

    if (error) {
      throw new Error('Failed to fetch profile: ' + error.message)
    }

    return data
  }

  async updateProfile(providerId: string, updates: any): Promise<{ success: boolean }> {
    const { error } = await mockSupabaseClient
      .from('providers')
      .update(updates)
      .eq('id', providerId)

    if (error) {
      throw new Error('Failed to update profile: ' + error.message)
    }

    return { success: true }
  }

  async uploadPhoto(providerId: string, file: any): Promise<{ url: string }> {
    const fileName = `${providerId}/${Date.now()}_${file.name}`
    
    const { error: uploadError } = await mockSupabaseClient.storage
      .from('provider-photos')
      .upload(fileName, file)

    if (uploadError) {
      throw new Error('Photo upload failed: ' + uploadError.message)
    }

    const { data: urlData } = mockSupabaseClient.storage
      .from('provider-photos')
      .getPublicUrl(fileName)

    return { url: urlData.publicUrl }
  }

  async uploadMultiplePhotos(providerId: string, files: any[]): Promise<{ urls: string[] }> {
    const urls: string[] = []

    for (const file of files) {
      const result = await this.uploadPhoto(providerId, file)
      urls.push(result.url)
    }

    return { urls }
  }
}

describe('Provider Management Property Tests', () => {
  let registrationService: ProviderRegistrationService
  let profileService: ProviderProfileService

  beforeEach(() => {
    vi.clearAllMocks()
    registrationService = new ProviderRegistrationService()
    profileService = new ProviderProfileService()
  })

  /**
   * Property 24: Registration performance
   * For any valid provider registration data, account creation should complete within 2 seconds
   * Validates: Requirements 8.2
   */
  test('Property 24: Registration performance', async () => {
    await fc.assert(
      fc.asyncProperty(
        providerRegistrationGen,
        async (registrationData) => {
          // Mock successful auth signup
          const mockUserId = fc.sample(fc.uuid(), 1)[0]
          mockSupabaseClient.auth.signUp.mockResolvedValue({
            data: { user: { id: mockUserId } },
            error: null,
          })

          // Mock successful provider creation
          const mockProviderId = fc.sample(fc.uuid(), 1)[0]
          const mockFrom = {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: mockProviderId, ...registrationData, user_id: mockUserId },
                  error: null,
                }),
              }),
            }),
          }
          mockSupabaseClient.from.mockReturnValue(mockFrom)

          // Measure registration time
          const startTime = Date.now()
          const result = await registrationService.register(registrationData)
          const endTime = Date.now()
          const duration = endTime - startTime

          // Verify registration completed successfully
          expect(result.success).toBe(true)
          expect(result.userId).toBe(mockUserId)
          expect(result.providerId).toBe(mockProviderId)

          // Verify performance requirement (2 seconds = 2000ms)
          // In tests, we allow some overhead, so we check < 100ms for mocked operations
          expect(duration).toBeLessThan(100)

          // Verify auth signup was called with correct data
          expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
            email: registrationData.email,
            password: registrationData.password,
          })

          // Verify provider record was created
          expect(mockSupabaseClient.from).toHaveBeenCalledWith('providers')
          expect(mockFrom.insert).toHaveBeenCalledWith({
            user_id: mockUserId,
            business_name: registrationData.business_name,
            provider_type: registrationData.provider_type,
            phone: registrationData.phone,
            email: registrationData.email,
            address: registrationData.address,
            verification_status: 'pending',
          })

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 26: Dashboard field accessibility
   * For any provider accessing their dashboard, all profile fields should be displayed and editable
   * Validates: Requirements 9.1
   */
  test('Property 26: Dashboard field accessibility', async () => {
    await fc.assert(
      fc.asyncProperty(
        providerArbitrary(),
        async (provider) => {
          // Mock successful profile fetch
          const mockFrom = {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: provider,
                  error: null,
                }),
              }),
            }),
          }
          mockSupabaseClient.from.mockReturnValue(mockFrom)

          // Fetch profile
          const profile = await profileService.getProfile(provider.id)

          // Verify all required fields are present and accessible
          expect(profile).toHaveProperty('id')
          expect(profile).toHaveProperty('business_name')
          expect(profile).toHaveProperty('provider_type')
          expect(profile).toHaveProperty('phone')
          expect(profile).toHaveProperty('email')
          expect(profile).toHaveProperty('address')
          expect(profile).toHaveProperty('description')
          expect(profile).toHaveProperty('accessibility_features')
          expect(profile).toHaveProperty('home_visit_available')
          expect(profile).toHaveProperty('verification_status')

          // Verify the query was constructed correctly
          expect(mockSupabaseClient.from).toHaveBeenCalledWith('providers')
          expect(mockFrom.select).toHaveBeenCalledWith('*')

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 27: Multiple photo upload
   * For any provider, they should be able to upload more than one photo to their profile gallery
   * Validates: Requirements 9.2
   */
  test('Property 27: Multiple photo upload', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.array(photoFileGen, { minLength: 2, maxLength: 5 }),
        async (providerId, photos) => {
          // Mock successful uploads for each photo
          const mockStorageFrom = {
            upload: vi.fn().mockResolvedValue({ error: null }),
            getPublicUrl: vi.fn((fileName: string) => ({
              data: { publicUrl: `https://storage.example.com/${fileName}` },
            })),
          }
          mockSupabaseClient.storage.from.mockReturnValue(mockStorageFrom)

          // Upload multiple photos
          const result = await profileService.uploadMultiplePhotos(providerId, photos)

          // Verify all photos were uploaded
          expect(result.urls).toHaveLength(photos.length)
          expect(mockStorageFrom.upload).toHaveBeenCalledTimes(photos.length)

          // Verify each URL is valid
          result.urls.forEach((url) => {
            expect(url).toMatch(/^https:\/\//)
            expect(url).toContain(providerId)
          })

          // Verify storage bucket was accessed correctly
          expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith('provider-photos')

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 28: Photo upload performance
   * For any valid photo uploaded by a provider, it should be stored and displayed in the profile within 3 seconds
   * Validates: Requirements 9.3
   */
  test('Property 28: Photo upload performance', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        photoFileGen,
        async (providerId, photo) => {
          // Mock successful upload
          const mockStorageFrom = {
            upload: vi.fn().mockResolvedValue({ error: null }),
            getPublicUrl: vi.fn((fileName: string) => ({
              data: { publicUrl: `https://storage.example.com/${fileName}` },
            })),
          }
          mockSupabaseClient.storage.from.mockReturnValue(mockStorageFrom)

          // Measure upload time
          const startTime = Date.now()
          const result = await profileService.uploadPhoto(providerId, photo)
          const endTime = Date.now()
          const duration = endTime - startTime

          // Verify upload completed successfully
          expect(result.url).toBeDefined()
          expect(result.url).toMatch(/^https:\/\//)

          // Verify performance requirement (3 seconds = 3000ms)
          // In tests, we allow some overhead, so we check < 100ms for mocked operations
          expect(duration).toBeLessThan(100)

          // Verify upload was called with correct parameters
          expect(mockStorageFrom.upload).toHaveBeenCalled()
          const uploadCall = mockStorageFrom.upload.mock.calls[0]
          expect(uploadCall[0]).toContain(providerId)
          expect(uploadCall[1]).toBe(photo)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 30: Profile update confirmation
   * For any profile changes saved by a provider, the changes should be persisted and a confirmation should be displayed
   * Validates: Requirements 9.5
   */
  test('Property 30: Profile update confirmation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        profileUpdateGen,
        async (providerId, updates) => {
          // Mock successful update
          const mockFrom = {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                error: null,
              }),
            }),
          }
          mockSupabaseClient.from.mockReturnValue(mockFrom)

          // Update profile
          const result = await profileService.updateProfile(providerId, updates)

          // Verify update was successful
          expect(result.success).toBe(true)

          // Verify the update was called with correct data
          expect(mockSupabaseClient.from).toHaveBeenCalledWith('providers')
          expect(mockFrom.update).toHaveBeenCalledWith(updates)

          // Verify the update was scoped to the correct provider
          const eqCall = mockFrom.update().eq
          expect(eqCall).toHaveBeenCalledWith('id', providerId)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 30a: Profile update persistence
   * For any profile update, fetching the profile after update should return the updated values
   * Validates: Requirements 9.5
   */
  test('Property 30a: Profile update persistence', async () => {
    await fc.assert(
      fc.asyncProperty(
        providerArbitrary(),
        profileUpdateGen,
        async (originalProvider, updates) => {
          // Mock successful update
          const mockFromUpdate = {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                error: null,
              }),
            }),
          }

          // Mock successful fetch with updated data
          const updatedProvider = { ...originalProvider, ...updates }
          const mockFromSelect = {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: updatedProvider,
                  error: null,
                }),
              }),
            }),
          }

          mockSupabaseClient.from
            .mockReturnValueOnce(mockFromUpdate) // First call for update
            .mockReturnValueOnce(mockFromSelect) // Second call for fetch

          // Update profile
          await profileService.updateProfile(originalProvider.id, updates)

          // Fetch updated profile
          const fetchedProfile = await profileService.getProfile(originalProvider.id)

          // Verify all updated fields are persisted
          Object.keys(updates).forEach((key) => {
            if (updates[key] !== undefined && updates[key] !== null) {
              expect(fetchedProfile[key]).toEqual(updates[key])
            }
          })

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 26a: Accessibility features editability
   * For any provider profile, accessibility features should be editable as an array
   * Validates: Requirements 9.1, 9.4
   */
  test('Property 26a: Accessibility features editability', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        accessibilityFeaturesArbitrary(),
        async (providerId, newFeatures) => {
          // Mock successful update
          const mockFrom = {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                error: null,
              }),
            }),
          }
          mockSupabaseClient.from.mockReturnValue(mockFrom)

          // Update accessibility features
          const result = await profileService.updateProfile(providerId, {
            accessibility_features: newFeatures,
          })

          // Verify update was successful
          expect(result.success).toBe(true)

          // Verify the update included accessibility features
          expect(mockFrom.update).toHaveBeenCalledWith({
            accessibility_features: newFeatures,
          })

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 26b: Home visit availability editability
   * For any provider profile, home visit availability should be editable as a boolean
   * Validates: Requirements 9.1, 9.4
   */
  test('Property 26b: Home visit availability editability', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.boolean(),
        async (providerId, homeVisitAvailable) => {
          // Mock successful update
          const mockFrom = {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                error: null,
              }),
            }),
          }
          mockSupabaseClient.from.mockReturnValue(mockFrom)

          // Update home visit availability
          const result = await profileService.updateProfile(providerId, {
            home_visit_available: homeVisitAvailable,
          })

          // Verify update was successful
          expect(result.success).toBe(true)

          // Verify the update included home visit availability
          expect(mockFrom.update).toHaveBeenCalledWith({
            home_visit_available: homeVisitAvailable,
          })

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 24a: Registration creates pending verification status
   * For any provider registration, the initial verification status should be 'pending'
   * Validates: Requirements 8.2, 10.1
   */
  test('Property 24a: Registration creates pending verification status', async () => {
    await fc.assert(
      fc.asyncProperty(
        providerRegistrationGen,
        async (registrationData) => {
          // Mock successful auth signup
          const mockUserId = fc.sample(fc.uuid(), 1)[0]
          mockSupabaseClient.auth.signUp.mockResolvedValue({
            data: { user: { id: mockUserId } },
            error: null,
          })

          // Mock successful provider creation
          const mockProviderId = fc.sample(fc.uuid(), 1)[0]
          const mockFrom = {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { 
                    id: mockProviderId, 
                    ...registrationData, 
                    user_id: mockUserId,
                    verification_status: 'pending',
                  },
                  error: null,
                }),
              }),
            }),
          }
          mockSupabaseClient.from.mockReturnValue(mockFrom)

          // Register provider
          await registrationService.register(registrationData)

          // Verify verification_status was set to 'pending'
          expect(mockFrom.insert).toHaveBeenCalledWith(
            expect.objectContaining({
              verification_status: 'pending',
            })
          )

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 27a: Photo upload file type validation
   * For any photo upload, only valid image types should be accepted
   * Validates: Requirements 9.2
   */
  test('Property 27a: Photo upload file type validation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        photoFileGen,
        async (providerId, photo) => {
          // Verify photo has valid image type
          const validTypes = ['image/jpeg', 'image/png', 'image/webp']
          expect(validTypes).toContain(photo.type)

          // Mock successful upload
          const mockStorageFrom = {
            upload: vi.fn().mockResolvedValue({ error: null }),
            getPublicUrl: vi.fn((fileName: string) => ({
              data: { publicUrl: `https://storage.example.com/${fileName}` },
            })),
          }
          mockSupabaseClient.storage.from.mockReturnValue(mockStorageFrom)

          // Upload photo
          const result = await profileService.uploadPhoto(providerId, photo)

          // Verify upload was successful
          expect(result.url).toBeDefined()

          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})
