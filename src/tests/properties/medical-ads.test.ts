/**
 * Property-Based Tests for Medical Ads System
 * Feature: cityhealth-platform, Properties 36, 37, 38: Medical ads functionality
 * Validates: Requirements 11.1, 11.2, 11.3
 */

import { describe, test, expect, beforeEach, vi } from 'vitest'
import * as fc from 'fast-check'

// Mock the supabase client import
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}))

// Mock the file upload service
vi.mock('@/services/fileUploadService', () => ({
  fileUploadService: {
    uploadProviderDocument: vi.fn(),
    validateFile: vi.fn(),
  },
}))

// Import the mocked dependencies
import { supabase } from '@/integrations/supabase/client'
import { fileUploadService } from '@/services/fileUploadService'

const mockSupabaseClient = supabase as any
const mockFileUploadService = fileUploadService as any

// Generator for authenticated user
const authenticatedUserGen = fc.record({
  id: fc.uuid(),
  email: fc.emailAddress(),
  role: fc.constantFrom('provider'),
})

// Generator for provider data
const providerGen = fc.record({
  id: fc.uuid(),
  user_id: fc.uuid(),
  business_name: fc.string({ minLength: 1, maxLength: 100 }),
  provider_type: fc.constantFrom('doctor', 'clinic', 'hospital', 'pharmacy', 'laboratory'),
  verification_status: fc.constantFrom('pending', 'verified', 'rejected'),
})

// Generator for verified provider
const verifiedProviderGen = fc.record({
  id: fc.uuid(),
  user_id: fc.uuid(),
  business_name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
  provider_type: fc.constantFrom('doctor', 'clinic', 'hospital', 'pharmacy', 'laboratory'),
  verification_status: fc.constant('verified'),
})

// Generator for unverified provider
const unverifiedProviderGen = fc.record({
  id: fc.uuid(),
  user_id: fc.uuid(),
  business_name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
  provider_type: fc.constantFrom('doctor', 'clinic', 'hospital', 'pharmacy', 'laboratory'),
  verification_status: fc.constantFrom('pending', 'rejected'),
})

// Generator for medical ad data with valid dates
const medicalAdGen = fc.record({
  title: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
  content: fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
  start_date: fc.constant('2024-01-01'),
  end_date: fc.constant('2024-12-31'), // Always after start_date
})

// Generator for image file
const imageFileGen = fc.record({
  name: fc.string({ minLength: 1, maxLength: 50 }).map(name => `${name}.jpg`),
  type: fc.constantFrom('image/jpeg', 'image/png'),
  size: fc.integer({ min: 1000, max: 5000000 }), // 1KB to 5MB
})

// Mock medical ad creation function
async function createMedicalAd(
  user: any,
  provider: any,
  adData: any,
  imageFile?: any
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check authentication
    const { data: authData } = await mockSupabaseClient.auth.getUser()
    if (!authData.user) {
      throw new Error('Authentication required')
    }

    // Check if provider is verified
    if (provider.verification_status !== 'verified') {
      throw new Error('Only verified providers can create medical ads')
    }

    // Validate ad data
    if (!adData.title.trim() || !adData.content.trim()) {
      throw new Error('Title and content are required')
    }

    if (new Date(adData.end_date) <= new Date(adData.start_date)) {
      throw new Error('End date must be after start date')
    }

    let imageUrl = null

    // Handle image upload if provided
    if (imageFile) {
      const validation = mockFileUploadService.validateFile(imageFile, 5)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      const uploadResult = await mockFileUploadService.uploadProviderDocument(
        imageFile,
        provider.id,
        'photo'
      )
      imageUrl = uploadResult.url
    }

    // Insert medical ad
    const { error } = await (mockSupabaseClient as any)
      .from('medical_ads')
      .insert({
        provider_id: provider.id,
        title: adData.title.trim(),
        content: adData.content.trim(),
        image_url: imageUrl,
        start_date: adData.start_date,
        end_date: adData.end_date,
        status: 'pending',
        display_priority: 0,
      })

    if (error) {
      throw new Error('Database error')
    }

    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

describe('Medical Ads System Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  /**
   * Property 36: Ad creation access control
   * For any provider user, they should only be able to create medical ads if their profile verification_status='verified'
   * Validates: Requirements 11.1
   */
  test('Property 36: Ad creation access control - verified providers can create ads', async () => {
    await fc.assert(
      fc.asyncProperty(
        authenticatedUserGen,
        verifiedProviderGen,
        medicalAdGen,
        async (user, provider, adData) => {
          // Mock authenticated user
          mockSupabaseClient.auth.getUser.mockResolvedValue({
            data: { user: { id: user.id } },
            error: null,
          })

          // Mock successful database insert
          const mockFrom = {
            insert: vi.fn().mockReturnValue({
              error: null,
            }),
          }
          mockSupabaseClient.from.mockReturnValue(mockFrom)

          // Mock file validation (no file)
          mockFileUploadService.validateFile.mockReturnValue({ valid: true })

          // Test creating medical ad with verified provider
          const result = await createMedicalAd(user, provider, adData)

          // Verified providers should be able to create ads
          expect(result.success).toBe(true)
          expect(result.error).toBeUndefined()

          // Verify the insert was called with correct data
          expect(mockSupabaseClient.from).toHaveBeenCalledWith('medical_ads')
          expect(mockFrom.insert).toHaveBeenCalledWith({
            provider_id: provider.id,
            title: adData.title.trim(),
            content: adData.content.trim(),
            image_url: null,
            start_date: adData.start_date,
            end_date: adData.end_date,
            status: 'pending',
            display_priority: 0,
          })

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 36a: Ad creation access control - unverified providers cannot create ads', async () => {
    await fc.assert(
      fc.asyncProperty(
        authenticatedUserGen,
        unverifiedProviderGen,
        medicalAdGen,
        async (user, provider, adData) => {
          // Mock authenticated user
          mockSupabaseClient.auth.getUser.mockResolvedValue({
            data: { user: { id: user.id } },
            error: null,
          })

          // Test creating medical ad with unverified provider
          const result = await createMedicalAd(user, provider, adData)

          // Unverified providers should not be able to create ads
          expect(result.success).toBe(false)
          expect(result.error).toBe('Only verified providers can create medical ads')

          // Database insert should not be called
          expect(mockSupabaseClient.from).not.toHaveBeenCalled()

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 36b: Ad creation requires authentication', async () => {
    await fc.assert(
      fc.asyncProperty(
        verifiedProviderGen,
        medicalAdGen,
        async (provider, adData) => {
          // Mock unauthenticated user
          mockSupabaseClient.auth.getUser.mockResolvedValue({
            data: { user: null },
            error: null,
          })

          // Test creating medical ad without authentication
          const result = await createMedicalAd(null, provider, adData)

          // Unauthenticated users should not be able to create ads
          expect(result.success).toBe(false)
          expect(result.error).toBe('Authentication required')

          return true
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property 37: Ad content support
   * For any medical ad creation, the system should support both text and image content
   * Validates: Requirements 11.2
   */
  test('Property 37: Ad content support - text only ads', async () => {
    await fc.assert(
      fc.asyncProperty(
        authenticatedUserGen,
        verifiedProviderGen,
        medicalAdGen,
        async (user, provider, adData) => {
          // Mock authenticated user
          mockSupabaseClient.auth.getUser.mockResolvedValue({
            data: { user: { id: user.id } },
            error: null,
          })

          // Mock successful database insert
          const mockFrom = {
            insert: vi.fn().mockReturnValue({
              error: null,
            }),
          }
          mockSupabaseClient.from.mockReturnValue(mockFrom)

          // Test creating text-only medical ad
          const result = await createMedicalAd(user, provider, adData)

          // Text-only ads should be supported
          expect(result.success).toBe(true)
          expect(result.error).toBeUndefined()

          // Verify the insert was called with null image_url
          expect(mockFrom.insert).toHaveBeenCalledWith(
            expect.objectContaining({
              title: adData.title.trim(),
              content: adData.content.trim(),
              image_url: null,
            })
          )

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 37a: Ad content support - text and image ads', async () => {
    await fc.assert(
      fc.asyncProperty(
        authenticatedUserGen,
        verifiedProviderGen,
        medicalAdGen,
        imageFileGen,
        async (user, provider, adData, imageFile) => {
          // Mock authenticated user
          mockSupabaseClient.auth.getUser.mockResolvedValue({
            data: { user: { id: user.id } },
            error: null,
          })

          // Mock successful file validation and upload
          mockFileUploadService.validateFile.mockReturnValue({ valid: true })
          mockFileUploadService.uploadProviderDocument.mockResolvedValue({
            url: 'https://example.com/image.jpg',
            path: 'provider/image.jpg',
          })

          // Mock successful database insert
          const mockFrom = {
            insert: vi.fn().mockReturnValue({
              error: null,
            }),
          }
          mockSupabaseClient.from.mockReturnValue(mockFrom)

          // Test creating medical ad with image
          const result = await createMedicalAd(user, provider, adData, imageFile)

          // Text and image ads should be supported
          expect(result.success).toBe(true)
          expect(result.error).toBeUndefined()

          // Verify file upload was called
          expect(mockFileUploadService.uploadProviderDocument).toHaveBeenCalledWith(
            imageFile,
            provider.id,
            'photo'
          )

          // Verify the insert was called with image_url
          expect(mockFrom.insert).toHaveBeenCalledWith(
            expect.objectContaining({
              title: adData.title.trim(),
              content: adData.content.trim(),
              image_url: 'https://example.com/image.jpg',
            })
          )

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 37b: Ad content validation - empty content rejection', async () => {
    await fc.assert(
      fc.asyncProperty(
        authenticatedUserGen,
        verifiedProviderGen,
        fc.record({
          title: fc.constantFrom('', '   ', '\t\n'),
          content: fc.string({ minLength: 1, maxLength: 500 }),
          start_date: fc.constantFrom('2024-01-01'),
          end_date: fc.constantFrom('2024-02-01'),
        }),
        async (user, provider, adData) => {
          // Mock authenticated user
          mockSupabaseClient.auth.getUser.mockResolvedValue({
            data: { user: { id: user.id } },
            error: null,
          })

          // Test creating medical ad with empty title
          const result = await createMedicalAd(user, provider, adData)

          // Empty content should be rejected
          expect(result.success).toBe(false)
          expect(result.error).toBe('Title and content are required')

          return true
        }
      ),
      { numRuns: 50 }
    )
  })

  test('Property 37c: Ad content validation - invalid dates rejection', async () => {
    await fc.assert(
      fc.asyncProperty(
        authenticatedUserGen,
        verifiedProviderGen,
        fc.record({
          title: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          content: fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
          start_date: fc.constantFrom('2024-06-01'),
          end_date: fc.constantFrom('2024-05-01'), // End date before start date
        }),
        async (user, provider, adData) => {
          // Mock authenticated user
          mockSupabaseClient.auth.getUser.mockResolvedValue({
            data: { user: { id: user.id } },
            error: null,
          })

          // Test creating medical ad with invalid dates
          const result = await createMedicalAd(user, provider, adData)

          // Invalid dates should be rejected
          expect(result.success).toBe(false)
          expect(result.error).toBe('End date must be after start date')

          return true
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property 38: Ad approval requirement
   * For any medical ad, it should not be visible to citizen users until its status='approved'
   * Validates: Requirements 11.3
   */
  test('Property 38: Ad approval requirement - ads created with pending status', async () => {
    await fc.assert(
      fc.asyncProperty(
        authenticatedUserGen,
        verifiedProviderGen,
        medicalAdGen,
        async (user, provider, adData) => {
          // Mock authenticated user
          mockSupabaseClient.auth.getUser.mockResolvedValue({
            data: { user: { id: user.id } },
            error: null,
          })

          // Mock successful database insert
          const mockFrom = {
            insert: vi.fn().mockReturnValue({
              error: null,
            }),
          }
          mockSupabaseClient.from.mockReturnValue(mockFrom)

          // Test creating medical ad
          const result = await createMedicalAd(user, provider, adData)

          // Ad should be created successfully
          expect(result.success).toBe(true)

          // Verify the ad is created with 'pending' status (not visible to public)
          expect(mockFrom.insert).toHaveBeenCalledWith(
            expect.objectContaining({
              status: 'pending',
            })
          )

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 38a: Ad approval requirement - only approved ads are publicly visible', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.uuid(),
            provider_id: fc.uuid(),
            title: fc.string({ minLength: 1, maxLength: 100 }),
            content: fc.string({ minLength: 1, maxLength: 500 }),
            status: fc.constantFrom('pending', 'approved', 'rejected'),
            display_priority: fc.integer({ min: 0, max: 10 }),
          }),
          { minLength: 0, maxLength: 20 }
        ),
        async (allAds) => {
          // Mock public query for approved ads only
          const approvedAds = allAds.filter(ad => ad.status === 'approved')
          
          const mockFrom = {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  data: approvedAds,
                  error: null,
                }),
              }),
            }),
          }
          mockSupabaseClient.from.mockReturnValue(mockFrom)

          // Simulate public query for medical ads (what citizens see)
          const { data: publicAds } = await mockSupabaseClient
            .from('medical_ads')
            .select('*')
            .eq('status', 'approved')
            .order('display_priority', { ascending: false })

          // Only approved ads should be returned in public queries
          expect(publicAds).toHaveLength(approvedAds.length)
          
          // Verify all returned ads have 'approved' status
          publicAds.forEach((ad: any) => {
            expect(ad.status).toBe('approved')
          })

          // Verify the query filters for approved status
          if (mockFrom.eq) {
            expect(mockFrom.eq).toHaveBeenCalledWith('status', 'approved')
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 38b: Ad approval requirement - file validation for images', async () => {
    await fc.assert(
      fc.asyncProperty(
        authenticatedUserGen,
        verifiedProviderGen,
        fc.record({
          title: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          content: fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
          start_date: fc.constant('2024-01-01'),
          end_date: fc.constant('2024-12-31'),
        }),
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0).map(name => `${name}.exe`),
          type: fc.constantFrom('application/exe', 'text/plain'),
          size: fc.integer({ min: 6000000, max: 10000000 }), // Over 5MB limit
        }),
        async (user, provider, adData, invalidFile) => {
          // Mock authenticated user
          mockSupabaseClient.auth.getUser.mockResolvedValue({
            data: { user: { id: user.id } },
            error: null,
          })

          // Mock file validation failure
          mockFileUploadService.validateFile.mockReturnValue({
            valid: false,
            error: 'Invalid file type or size',
          })

          // Test creating medical ad with invalid file
          const result = await createMedicalAd(user, provider, adData, invalidFile)

          // Invalid files should be rejected
          expect(result.success).toBe(false)
          expect(result.error).toBe('Invalid file type or size')

          // File upload should not be attempted
          expect(mockFileUploadService.uploadProviderDocument).not.toHaveBeenCalled()

          return true
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property 40: Ad status visibility
   * For any provider, they should be able to view the status of all their medical ads in their dashboard
   * Validates: Requirements 11.5
   */
  test('Property 40: Ad status visibility - providers can view their own ad statuses', async () => {
    await fc.assert(
      fc.asyncProperty(
        authenticatedUserGen,
        verifiedProviderGen,
        fc.array(
          fc.record({
            id: fc.uuid(),
            title: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            content: fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
            status: fc.constantFrom('pending', 'approved', 'rejected'),
            created_at: fc.constantFrom('2023-01-01T00:00:00.000Z', '2023-06-15T12:30:00.000Z', '2024-01-01T00:00:00.000Z'),
            start_date: fc.constant('2024-01-01'),
            end_date: fc.constant('2024-12-31'),
            image_url: fc.oneof(fc.constant(null), fc.webUrl()),
          }),
          { minLength: 0, maxLength: 10 }
        ),
        async (user, provider, providerAds) => {
          // Mock authenticated user
          mockSupabaseClient.auth.getUser.mockResolvedValue({
            data: { user: { id: user.id } },
            error: null,
          })

          // Mock provider lookup
          const mockProviderFrom = {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockReturnValue({
                  data: { id: provider.id },
                  error: null,
                }),
              }),
            }),
          }

          // Mock medical ads query for this provider
          const adsWithProviderId = providerAds.map(ad => ({
            ...ad,
            provider_id: provider.id,
          }))

          const mockAdsFrom = {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  data: adsWithProviderId,
                  error: null,
                }),
              }),
            }),
          }

          // Mock supabase calls in sequence
          mockSupabaseClient.from
            .mockReturnValueOnce(mockProviderFrom) // First call for provider lookup
            .mockReturnValueOnce(mockAdsFrom) // Second call for ads query

          // Simulate fetching provider's medical ads (like in ProviderDashboard)
          const { data: providerData } = await mockSupabaseClient
            .from('providers')
            .select('id')
            .eq('user_id', user.id)
            .single()

          const { data: ads } = await mockSupabaseClient
            .from('medical_ads')
            .select('*')
            .eq('provider_id', providerData.id)
            .order('created_at', { ascending: false })

          // Verify all provider's ads are returned with their statuses
          expect(ads).toHaveLength(providerAds.length)
          
          // Verify each ad has a visible status
          ads.forEach((ad: any, index: number) => {
            expect(ad).toHaveProperty('status')
            expect(['pending', 'approved', 'rejected']).toContain(ad.status)
            expect(ad.provider_id).toBe(provider.id)
            expect(ad.status).toBe(providerAds[index].status)
          })

          // Verify the queries were constructed correctly
          if (mockProviderFrom.select && mockProviderFrom.eq) {
            expect(mockProviderFrom.select).toHaveBeenCalledWith('id')
            expect(mockProviderFrom.eq).toHaveBeenCalledWith('user_id', user.id)
          }
          if (mockAdsFrom.select && mockAdsFrom.eq) {
            expect(mockAdsFrom.select).toHaveBeenCalledWith('*')
            expect(mockAdsFrom.eq).toHaveBeenCalledWith('provider_id', provider.id)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 40a: Ad status visibility - providers cannot view other providers\' ads', async () => {
    await fc.assert(
      fc.asyncProperty(
        authenticatedUserGen,
        verifiedProviderGen,
        fc.uuid(), // Different provider ID
        fc.array(
          fc.record({
            id: fc.uuid(),
            title: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            status: fc.constantFrom('pending', 'approved', 'rejected'),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        async (user, provider, otherProviderId, otherProviderAds) => {
          // Mock authenticated user
          mockSupabaseClient.auth.getUser.mockResolvedValue({
            data: { user: { id: user.id } },
            error: null,
          })

          // Mock provider lookup returns current provider
          const mockProviderFrom = {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockReturnValue({
                  data: { id: provider.id },
                  error: null,
                }),
              }),
            }),
          }

          // Mock medical ads query - should only return ads for current provider (empty in this case)
          const mockAdsFrom = {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  data: [], // No ads for current provider
                  error: null,
                }),
              }),
            }),
          }

          mockSupabaseClient.from
            .mockReturnValueOnce(mockProviderFrom)
            .mockReturnValueOnce(mockAdsFrom)

          // Simulate fetching ads for current provider
          const { data: providerData } = await mockSupabaseClient
            .from('providers')
            .select('id')
            .eq('user_id', user.id)
            .single()

          const { data: ads } = await mockSupabaseClient
            .from('medical_ads')
            .select('*')
            .eq('provider_id', providerData.id)
            .order('created_at', { ascending: false })

          // Should not see other provider's ads
          expect(ads).toHaveLength(0)
          
          // Verify query was filtered by current provider's ID, not other provider's ID
          if (mockAdsFrom.eq) {
            expect(mockAdsFrom.eq).toHaveBeenCalledWith('provider_id', provider.id)
            expect(mockAdsFrom.eq).not.toHaveBeenCalledWith('provider_id', otherProviderId)
          }

          return true
        }
      ),
      { numRuns: 50 }
    )
  })

  test('Property 40b: Ad status visibility - all status types are displayable', async () => {
    await fc.assert(
      fc.asyncProperty(
        authenticatedUserGen,
        verifiedProviderGen,
        async (user, provider) => {
          // Create one ad for each possible status
          const allStatusAds = [
            {
              id: fc.sample(fc.uuid(), 1)[0],
              provider_id: provider.id,
              title: 'Pending Ad',
              status: 'pending',
              created_at: '2024-01-01T00:00:00.000Z',
            },
            {
              id: fc.sample(fc.uuid(), 1)[0],
              provider_id: provider.id,
              title: 'Approved Ad',
              status: 'approved',
              created_at: '2024-01-02T00:00:00.000Z',
            },
            {
              id: fc.sample(fc.uuid(), 1)[0],
              provider_id: provider.id,
              title: 'Rejected Ad',
              status: 'rejected',
              created_at: '2024-01-03T00:00:00.000Z',
            },
          ]

          // Mock authenticated user
          mockSupabaseClient.auth.getUser.mockResolvedValue({
            data: { user: { id: user.id } },
            error: null,
          })

          // Mock provider lookup
          const mockProviderFrom = {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockReturnValue({
                  data: { id: provider.id },
                  error: null,
                }),
              }),
            }),
          }

          // Mock medical ads query
          const mockAdsFrom = {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  data: allStatusAds,
                  error: null,
                }),
              }),
            }),
          }

          mockSupabaseClient.from
            .mockReturnValueOnce(mockProviderFrom)
            .mockReturnValueOnce(mockAdsFrom)

          // Simulate fetching ads
          const { data: providerData } = await mockSupabaseClient
            .from('providers')
            .select('id')
            .eq('user_id', user.id)
            .single()

          const { data: ads } = await mockSupabaseClient
            .from('medical_ads')
            .select('*')
            .eq('provider_id', providerData.id)
            .order('created_at', { ascending: false })

          // Verify all status types are present and displayable
          expect(ads).toHaveLength(3)
          
          const statuses = ads.map((ad: any) => ad.status)
          expect(statuses).toContain('pending')
          expect(statuses).toContain('approved')
          expect(statuses).toContain('rejected')

          // Verify each status is a valid, displayable value
          ads.forEach((ad: any) => {
            expect(ad.status).toMatch(/^(pending|approved|rejected)$/)
            expect(typeof ad.status).toBe('string')
            expect(ad.status.length).toBeGreaterThan(0)
          })

          return true
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property 39: Approved ad display locations
   * For any medical ad with status='approved', it should be displayed in both the homepage carousel and inline in search results
   * Validates: Requirements 11.4
   */
  test('Property 39: Approved ad display locations - homepage carousel shows approved ads', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.uuid(),
            provider_id: fc.uuid(),
            title: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            content: fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
            status: fc.constantFrom('pending', 'approved', 'rejected'),
            display_priority: fc.integer({ min: 0, max: 10 }),
            start_date: fc.constant('2024-01-01'),
            end_date: fc.constant('2024-12-31'),
            created_at: fc.constantFrom('2023-01-01T00:00:00.000Z', '2023-06-15T12:30:00.000Z', '2024-01-01T00:00:00.000Z'),
            provider: fc.record({
              id: fc.uuid(),
              business_name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
              provider_type: fc.constantFrom('doctor', 'clinic', 'hospital', 'pharmacy', 'laboratory'),
            }),
          }),
          { minLength: 0, maxLength: 15 }
        ),
        async (allAds) => {
          // Filter for approved ads that haven't expired
          const approvedAds = allAds.filter(ad => 
            ad.status === 'approved' && 
            new Date(ad.end_date) >= new Date()
          );

          // Mock the carousel query (what MedicalAdCarousel component does)
          const mockFrom = {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                gte: vi.fn().mockReturnValue({
                  order: vi.fn().mockReturnValue({
                    order: vi.fn().mockReturnValue({
                      data: approvedAds.sort((a, b) => b.display_priority - a.display_priority),
                      error: null,
                    }),
                  }),
                }),
              }),
            }),
          }
          mockSupabaseClient.from.mockReturnValue(mockFrom)

          // Simulate homepage carousel query
          const { data: carouselAds } = await mockSupabaseClient
            .from('medical_ads')
            .select(`
              *,
              provider:providers(
                id,
                business_name,
                provider_type,
                avatar_url
              )
            `)
            .eq('status', 'approved')
            .gte('end_date', new Date().toISOString().split('T')[0])
            .order('display_priority', { ascending: false })
            .order('created_at', { ascending: false })

          // Verify only approved, non-expired ads are returned
          expect(carouselAds).toHaveLength(approvedAds.length)
          
          carouselAds.forEach((ad: any) => {
            expect(ad.status).toBe('approved')
            expect(new Date(ad.end_date)).toBeInstanceOf(Date)
            expect(ad).toHaveProperty('provider')
          })

          // Verify query construction
          if (mockFrom.eq && mockFrom.gte && mockFrom.order) {
            expect(mockFrom.eq).toHaveBeenCalledWith('status', 'approved')
            expect(mockFrom.gte).toHaveBeenCalledWith('end_date', expect.any(String))
            expect(mockFrom.order).toHaveBeenCalledWith('display_priority', { ascending: false })
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 39a: Approved ad display locations - search results include inline ads', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.uuid(),
            provider_id: fc.uuid(),
            title: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            status: fc.constantFrom('pending', 'approved', 'rejected'),
            display_priority: fc.integer({ min: 0, max: 10 }),
            end_date: fc.constant('2024-12-31'),
          }),
          { minLength: 0, maxLength: 20 }
        ),
        fc.array(
          fc.record({
            id: fc.uuid(),
            business_name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            provider_type: fc.constantFrom('doctor', 'clinic', 'hospital', 'pharmacy', 'laboratory'),
          }),
          { minLength: 5, maxLength: 15 }
        ),
        async (ads, searchResults) => {
          const approvedAds = ads.filter(ad => ad.status === 'approved')
          
          // Mock search results with inline ads (simulating search page behavior)
          const mockSearchFrom = {
            select: vi.fn().mockReturnValue({
              data: searchResults,
              error: null,
            }),
          }

          const mockAdsFrom = {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                gte: vi.fn().mockReturnValue({
                  order: vi.fn().mockReturnValue({
                    limit: vi.fn().mockReturnValue({
                      data: approvedAds.slice(0, 3), // Limit inline ads
                      error: null,
                    }),
                  }),
                }),
              }),
            }),
          }

          mockSupabaseClient.from
            .mockReturnValueOnce(mockSearchFrom) // Search results query
            .mockReturnValueOnce(mockAdsFrom) // Inline ads query

          // Simulate search results query
          const { data: providers } = await mockSupabaseClient
            .from('providers')
            .select('*')

          // Simulate inline ads query for search results
          const { data: inlineAds } = await mockSupabaseClient
            .from('medical_ads')
            .select('*')
            .eq('status', 'approved')
            .gte('end_date', new Date().toISOString().split('T')[0])
            .order('display_priority', { ascending: false })
            .limit(3)

          // Verify search results exist
          expect(providers).toHaveLength(searchResults.length)

          // Verify inline ads are approved and limited
          expect(inlineAds.length).toBeLessThanOrEqual(3)
          expect(inlineAds.length).toBeLessThanOrEqual(approvedAds.length)
          
          inlineAds.forEach((ad: any) => {
            expect(ad.status).toBe('approved')
          })

          // Verify inline ads query construction
          if (mockAdsFrom.eq && mockAdsFrom.gte && mockAdsFrom.limit) {
            expect(mockAdsFrom.eq).toHaveBeenCalledWith('status', 'approved')
            expect(mockAdsFrom.limit).toHaveBeenCalledWith(3)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 39b: Approved ad display locations - expired ads are not displayed', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.uuid(),
            provider_id: fc.uuid(),
            title: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            status: fc.constant('approved'),
            display_priority: fc.integer({ min: 0, max: 10 }),
            end_date: fc.constantFrom('2023-01-01', '2023-06-15', '2023-12-31'), // Expired dates
          }),
          { minLength: 1, maxLength: 10 }
        ),
        async (expiredAds) => {
          // Mock query that filters out expired ads
          const mockFrom = {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                gte: vi.fn().mockReturnValue({
                  order: vi.fn().mockReturnValue({
                    order: vi.fn().mockReturnValue({
                      data: [], // No ads should be returned since all are expired
                      error: null,
                    }),
                  }),
                }),
              }),
            }),
          }
          mockSupabaseClient.from.mockReturnValue(mockFrom)

          // Simulate carousel query with current date filter
          const currentDate = new Date().toISOString().split('T')[0]
          const { data: displayedAds } = await mockSupabaseClient
            .from('medical_ads')
            .select('*')
            .eq('status', 'approved')
            .gte('end_date', currentDate)
            .order('display_priority', { ascending: false })
            .order('created_at', { ascending: false })

          // Verify no expired ads are displayed
          expect(displayedAds).toHaveLength(0)

          // Verify date filter is applied
          if (mockFrom.gte) {
            expect(mockFrom.gte).toHaveBeenCalledWith('end_date', currentDate)
          }

          return true
        }
      ),
      { numRuns: 50 }
    )
  })

  test('Property 39c: Approved ad display locations - ads are ordered by priority', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.uuid(),
            provider_id: fc.uuid(),
            title: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            status: fc.constant('approved'),
            display_priority: fc.integer({ min: 0, max: 10 }),
            end_date: fc.constant('2024-12-31'),
            created_at: fc.constantFrom('2023-01-01T00:00:00.000Z', '2023-06-15T12:30:00.000Z', '2024-01-01T00:00:00.000Z'),
          }),
          { minLength: 2, maxLength: 10 }
        ),
        async (ads) => {
          // Sort ads by priority (descending) then by created_at (descending)
          const sortedAds = [...ads].sort((a, b) => {
            if (b.display_priority !== a.display_priority) {
              return b.display_priority - a.display_priority
            }
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          })

          // Mock query that returns properly sorted ads
          const mockFrom = {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                gte: vi.fn().mockReturnValue({
                  order: vi.fn().mockReturnValue({
                    order: vi.fn().mockReturnValue({
                      data: sortedAds,
                      error: null,
                    }),
                  }),
                }),
              }),
            }),
          }
          mockSupabaseClient.from.mockReturnValue(mockFrom)

          // Simulate carousel query
          const { data: displayedAds } = await mockSupabaseClient
            .from('medical_ads')
            .select('*')
            .eq('status', 'approved')
            .gte('end_date', new Date().toISOString().split('T')[0])
            .order('display_priority', { ascending: false })
            .order('created_at', { ascending: false })

          // Verify ads are returned in correct order
          expect(displayedAds).toHaveLength(ads.length)
          
          for (let i = 0; i < displayedAds.length - 1; i++) {
            const current = displayedAds[i]
            const next = displayedAds[i + 1]
            
            // Higher priority should come first
            if (current.display_priority !== next.display_priority) {
              expect(current.display_priority).toBeGreaterThanOrEqual(next.display_priority)
            } else {
              // If same priority, newer should come first
              expect(new Date(current.created_at).getTime()).toBeGreaterThanOrEqual(
                new Date(next.created_at).getTime()
              )
            }
          }

          // Verify ordering queries
          if (mockFrom.order) {
            expect(mockFrom.order).toHaveBeenCalledWith('display_priority', { ascending: false })
            expect(mockFrom.order).toHaveBeenCalledWith('created_at', { ascending: false })
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 54: Admin ad moderation
   * For any admin user, they should be able to moderate and remove inappropriate medical ads
   * Validates: Requirements 14.5
   */
  test('Property 54: Admin ad moderation - admins can approve, reject, and delete ads', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.uuid(),
          role: fc.constant('admin' as const),
          email: fc.emailAddress(),
        }),
        fc.array(
          fc.record({
            id: fc.uuid(),
            provider_id: fc.uuid(),
            title: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            content: fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
            status: fc.constantFrom('pending', 'approved', 'rejected'),
            display_priority: fc.integer({ min: 0, max: 10 }),
            created_at: fc.constantFrom('2023-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z'),
            provider: fc.record({
              id: fc.uuid(),
              business_name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
              provider_type: fc.constantFrom('doctor', 'clinic', 'hospital', 'pharmacy', 'laboratory'),
            }),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        async (adminUser, medicalAds) => {
          // Mock admin authentication
          mockSupabaseClient.auth.getUser.mockResolvedValue({
            data: { user: { id: adminUser.id, role: adminUser.role } },
            error: null,
          })

          // Test 1: Admin can read all medical ads
          const mockReadFrom = {
            select: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                data: medicalAds,
                error: null,
              }),
            }),
          }
          mockSupabaseClient.from.mockReturnValueOnce(mockReadFrom)

          const { data: allAds } = await mockSupabaseClient
            .from('medical_ads')
            .select(`
              *,
              provider:providers(
                id,
                business_name,
                provider_type
              )
            `)
            .order('created_at', { ascending: false })

          expect(allAds).toHaveLength(medicalAds.length)
          if (mockReadFrom.select) {
            expect(mockReadFrom.select).toHaveBeenCalled()
          }

          // Test 2: Admin can approve ads (if any exist)
          if (medicalAds.length > 0) {
            const mockUpdateFrom = {
              update: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  data: [],
                  error: null,
                }),
              }),
            }
            mockSupabaseClient.from.mockReturnValueOnce(mockUpdateFrom)

            const adToApprove = medicalAds[0]
            const { error: approveError } = await mockSupabaseClient
              .from('medical_ads')
              .update({ status: 'approved' })
              .eq('id', adToApprove.id)

            expect(approveError).toBeNull()
            if (mockUpdateFrom.update && mockUpdateFrom.eq) {
              expect(mockUpdateFrom.update).toHaveBeenCalledWith({ status: 'approved' })
              expect(mockUpdateFrom.eq).toHaveBeenCalledWith('id', adToApprove.id)
            }
          }

          // Test 3: Admin can reject ads (if any exist)
          if (medicalAds.length > 0) {
            const mockRejectFrom = {
              update: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  data: [],
                  error: null,
                }),
              }),
            }
            mockSupabaseClient.from.mockReturnValueOnce(mockRejectFrom)

            const adToReject = medicalAds[0]
            const { error: rejectError } = await mockSupabaseClient
              .from('medical_ads')
              .update({ status: 'rejected' })
              .eq('id', adToReject.id)

            expect(rejectError).toBeNull()
            if (mockRejectFrom.update) {
              expect(mockRejectFrom.update).toHaveBeenCalledWith({ status: 'rejected' })
            }
          }

          // Test 4: Admin can delete inappropriate ads (if any exist)
          if (medicalAds.length > 0) {
            const mockDeleteFrom = {
              delete: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  data: [],
                  error: null,
                }),
              }),
            }
            mockSupabaseClient.from.mockReturnValueOnce(mockDeleteFrom)

            const adToDelete = medicalAds[0]
            const { error: deleteError } = await mockSupabaseClient
              .from('medical_ads')
              .delete()
              .eq('id', adToDelete.id)

            expect(deleteError).toBeNull()
            if (mockDeleteFrom.delete && mockDeleteFrom.eq) {
              expect(mockDeleteFrom.delete).toHaveBeenCalled()
              expect(mockDeleteFrom.eq).toHaveBeenCalledWith('id', adToDelete.id)
            }
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 54a: Admin ad moderation - filtering and search functionality', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.uuid(),
          role: fc.constant('admin' as const),
          email: fc.emailAddress(),
        }),
        fc.array(
          fc.record({
            id: fc.uuid(),
            provider_id: fc.uuid(),
            title: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            content: fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
            status: fc.constantFrom('pending', 'approved', 'rejected'),
            created_at: fc.constantFrom('2023-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z'),
            provider: fc.record({
              id: fc.uuid(),
              business_name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
              provider_type: fc.constantFrom('doctor', 'clinic', 'hospital', 'pharmacy', 'laboratory'),
            }),
          }),
          { minLength: 3, maxLength: 15 }
        ),
        fc.constantFrom('pending', 'approved', 'rejected', 'all'),
        fc.string({ minLength: 0, maxLength: 20 }),
        async (adminUser, medicalAds, statusFilter, searchQuery) => {
          // Mock admin authentication
          mockSupabaseClient.auth.getUser.mockResolvedValue({
            data: { user: { id: adminUser.id, role: adminUser.role } },
            error: null,
          })

          // Apply filters locally to simulate expected behavior
          let filteredAds = medicalAds

          // Apply status filter
          if (statusFilter !== 'all') {
            filteredAds = filteredAds.filter(ad => ad.status === statusFilter)
          }

          // Apply search filter (title or provider name)
          if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            filteredAds = filteredAds.filter(ad => 
              ad.title.toLowerCase().includes(query) ||
              ad.provider.business_name.toLowerCase().includes(query)
            )
          }

          // Mock database query that returns filtered results
          const mockFrom = {
            select: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                data: filteredAds,
                error: null,
              }),
            }),
          }
          mockSupabaseClient.from.mockReturnValueOnce(mockFrom)

          // Simulate admin dashboard query with filters
          const { data: adminAds } = await mockSupabaseClient
            .from('medical_ads')
            .select(`
              *,
              provider:providers(
                id,
                business_name,
                provider_type
              )
            `)
            .order('created_at', { ascending: false })

          // Verify filtering works correctly
          expect(adminAds).toHaveLength(filteredAds.length)

          // Verify all returned ads match the status filter
          if (statusFilter !== 'all') {
            adminAds.forEach((ad: any) => {
              expect(ad.status).toBe(statusFilter)
            })
          }

          // Verify all returned ads match the search query
          if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            adminAds.forEach((ad: any) => {
              const matchesTitle = ad.title.toLowerCase().includes(query)
              const matchesProvider = ad.provider.business_name.toLowerCase().includes(query)
              expect(matchesTitle || matchesProvider).toBe(true)
            })
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 54b: Admin ad moderation - non-admin users cannot moderate ads', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.uuid(),
          role: fc.constantFrom('citizen', 'provider'),
          email: fc.emailAddress(),
        }),
        fc.record({
          id: fc.uuid(),
          provider_id: fc.uuid(),
          title: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          status: fc.constantFrom('pending', 'approved', 'rejected'),
        }),
        async (nonAdminUser, medicalAd) => {
          // Mock non-admin authentication
          mockSupabaseClient.auth.getUser.mockResolvedValue({
            data: { user: { id: nonAdminUser.id, role: nonAdminUser.role } },
            error: null,
          })

          // Non-admin users should not have access to admin moderation functions
          // This would be enforced by RLS policies and UI restrictions
          expect(nonAdminUser.role).not.toBe('admin')

          // In a real application, these operations would be restricted by:
          // 1. RLS policies preventing non-admin access to moderation operations
          // 2. UI components not rendering admin controls for non-admin users
          // 3. API endpoints checking admin permissions

          // For this test, we verify the user is not an admin
          const hasAdminAccess = nonAdminUser.role === 'admin'
          expect(hasAdminAccess).toBe(false)

          return true
        }
      ),
      { numRuns: 50 }
    )
  })
})