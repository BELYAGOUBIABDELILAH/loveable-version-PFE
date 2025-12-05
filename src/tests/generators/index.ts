/**
 * Custom generators for property-based testing with fast-check
 * These generators create valid test data for the CityHealth platform
 */

import * as fc from 'fast-check'
import type { ProviderType, VerificationStatus, UserRole, Provider, MedicalAd } from '@/integrations/firebase/types'

/**
 * Generator for valid UUID strings
 */
export const uuidArbitrary = (): fc.Arbitrary<string> =>
  fc.uuid()

/**
 * Generator for valid phone numbers (Algerian format)
 */
export const phoneArbitrary = (): fc.Arbitrary<string> =>
  fc.oneof(
    // Mobile numbers: 05/06/07 + 8 digits = 10 digits total
    fc.tuple(fc.constantFrom('05', '06', '07'), fc.integer({ min: 10000000, max: 99999999 }))
      .map(([prefix, num]) => `${prefix}${num}`),
    // Landline numbers: 0 + area code (2 digits) + 7 digits = 10 digits total
    fc.tuple(fc.constant('0'), fc.constantFrom('21', '23', '25', '27', '29', '31', '33', '35', '37', '39', '41', '43', '45', '47', '49'), fc.integer({ min: 1000000, max: 9999999 }))
      .map(([zero, prefix, num]) => `${zero}${prefix}${num}`)
  )

/**
 * Generator for valid email addresses
 */
export const emailArbitrary = (): fc.Arbitrary<string> =>
  fc.emailAddress()

/**
 * Generator for Algerian cities
 */
export const cityArbitrary = (): fc.Arbitrary<string> =>
  fc.constantFrom(
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
  )

/**
 * Generator for provider types
 */
export const providerTypeArbitrary = (): fc.Arbitrary<ProviderType> =>
  fc.constantFrom<ProviderType>('doctor', 'clinic', 'hospital', 'pharmacy', 'laboratory')

/**
 * Generator for verification status
 */
export const verificationStatusArbitrary = (): fc.Arbitrary<VerificationStatus> =>
  fc.constantFrom<VerificationStatus>('pending', 'verified', 'rejected')

/**
 * Generator for app roles
 */
export const appRoleArbitrary = (): fc.Arbitrary<UserRole> =>
  fc.constantFrom<UserRole>('citizen', 'provider', 'admin')

/**
 * Generator for accessibility features
 */
export const accessibilityFeaturesArbitrary = (): fc.Arbitrary<string[]> =>
  fc.subarray([
    'wheelchair',
    'parking',
    'elevator',
    'ramp',
    'accessible_restroom',
    'braille',
    'sign_language'
  ])

/**
 * Generator for coordinates (latitude/longitude for Algeria)
 */
export const coordinatesArbitrary = (): fc.Arbitrary<{ latitude: number; longitude: number }> =>
  fc.record({
    latitude: fc.double({ min: 18.0, max: 37.0, noNaN: true }),
    longitude: fc.double({ min: -8.0, max: 12.0, noNaN: true })
  })

/**
 * Generator for ISO date strings
 */
export const isoDateArbitrary = (): fc.Arbitrary<string> =>
  fc.integer({ min: new Date('2020-01-01').getTime(), max: new Date('2030-12-31').getTime() })
    .map(timestamp => new Date(timestamp).toISOString())

/**
 * Generator for valid Provider objects (snake_case for test compatibility)
 */
export const providerArbitrary = (): fc.Arbitrary<{
  id: string
  user_id: string
  business_name: string
  provider_type: ProviderType
  specialty_id: string | null
  phone: string
  email: string | null
  address: string
  city: string | null
  latitude: number | null
  longitude: number | null
  description: string | null
  avatar_url: string | null
  cover_image_url: string | null
  website: string | null
  verification_status: VerificationStatus | null
  is_emergency: boolean | null
  is_preloaded: boolean | null
  is_claimed: boolean | null
  accessibility_features: string[] | null
  home_visit_available: boolean | null
  created_at: string | null
  updated_at: string | null
}> =>
  fc.record({
    id: uuidArbitrary(),
    user_id: uuidArbitrary(),
    business_name: fc.string({ minLength: 3, maxLength: 100 }),
    provider_type: providerTypeArbitrary(),
    specialty_id: fc.option(uuidArbitrary(), { nil: null }),
    phone: phoneArbitrary(),
    email: fc.option(emailArbitrary(), { nil: null }),
    address: fc.string({ minLength: 10, maxLength: 200 }),
    city: fc.option(cityArbitrary(), { nil: null }),
    latitude: fc.option(fc.double({ min: 18.0, max: 37.0, noNaN: true }), { nil: null }),
    longitude: fc.option(fc.double({ min: -8.0, max: 12.0, noNaN: true }), { nil: null }),
    description: fc.option(fc.string({ minLength: 20, maxLength: 500 }), { nil: null }),
    avatar_url: fc.option(fc.webUrl(), { nil: null }),
    cover_image_url: fc.option(fc.webUrl(), { nil: null }),
    website: fc.option(fc.webUrl(), { nil: null }),
    verification_status: fc.option(verificationStatusArbitrary(), { nil: null }),
    is_emergency: fc.option(fc.boolean(), { nil: null }),
    is_preloaded: fc.option(fc.boolean(), { nil: null }),
    is_claimed: fc.option(fc.boolean(), { nil: null }),
    accessibility_features: fc.option(accessibilityFeaturesArbitrary(), { nil: null }),
    home_visit_available: fc.option(fc.boolean(), { nil: null }),
    created_at: fc.option(isoDateArbitrary(), { nil: null }),
    updated_at: fc.option(isoDateArbitrary(), { nil: null })
  })

/**
 * Generator for search queries
 */
export const searchQueryArbitrary = (): fc.Arbitrary<string> =>
  fc.oneof(
    fc.constantFrom('doctor', 'clinic', 'hospital', 'pharmacy', 'laboratory'),
    fc.constantFrom('médecin', 'clinique', 'hôpital', 'pharmacie', 'laboratoire'),
    fc.constantFrom('طبيب', 'عيادة', 'مستشفى', 'صيدلية', 'مختبر'),
    fc.string({ minLength: 3, maxLength: 50 })
  )

/**
 * Generator for filter state
 */
export const filterStateArbitrary = (): fc.Arbitrary<{
  provider_type: ProviderType[]
  city: string | null
  accessibility_features: string[]
  home_visit_available: boolean | null
  is_emergency: boolean | null
  verification_status: VerificationStatus | null
}> =>
  fc.record({
    provider_type: fc.subarray(['doctor', 'clinic', 'hospital', 'pharmacy', 'laboratory'] as ProviderType[]),
    city: fc.option(cityArbitrary(), { nil: null }),
    accessibility_features: accessibilityFeaturesArbitrary(),
    home_visit_available: fc.option(fc.boolean(), { nil: null }),
    is_emergency: fc.option(fc.boolean(), { nil: null }),
    verification_status: fc.option(verificationStatusArbitrary(), { nil: null })
  })

/**
 * Generator for user profiles
 */
export const userArbitrary = (): fc.Arbitrary<{
  id: string
  full_name: string
  email: string
  role: UserRole
  phone: string | null
  language: 'fr' | 'ar' | 'en'
}> =>
  fc.record({
    id: uuidArbitrary(),
    full_name: fc.string({ minLength: 3, maxLength: 100 }),
    email: emailArbitrary(),
    role: appRoleArbitrary(),
    phone: fc.option(phoneArbitrary(), { nil: null }),
    language: fc.constantFrom<'fr' | 'ar' | 'en'>('fr', 'ar', 'en')
  })

/**
 * Generator for medical ads (snake_case for test compatibility)
 */
export const medicalAdArbitrary = (): fc.Arbitrary<{
  id: string
  provider_id: string
  title: string
  content: string
  image_url: string | null
  status: 'pending' | 'approved' | 'rejected'
  display_priority: number | null
  start_date: string | null
  end_date: string | null
  created_at: string | null
}> =>
  fc.record({
    id: uuidArbitrary(),
    provider_id: uuidArbitrary(),
    title: fc.string({ minLength: 10, maxLength: 100 }),
    content: fc.string({ minLength: 20, maxLength: 500 }),
    image_url: fc.option(fc.webUrl(), { nil: null }),
    status: fc.constantFrom('pending', 'approved', 'rejected'),
    display_priority: fc.option(fc.integer({ min: 0, max: 100 }), { nil: null }),
    start_date: fc.option(isoDateArbitrary(), { nil: null }),
    end_date: fc.option(isoDateArbitrary(), { nil: null }),
    created_at: fc.option(isoDateArbitrary(), { nil: null })
  })

/**
 * Generator for chat messages
 */
export const chatMessageArbitrary = (): fc.Arbitrary<{
  content: string
  role: 'user' | 'assistant'
  language: 'fr' | 'ar' | 'en'
}> =>
  fc.record({
    content: fc.string({ minLength: 1, maxLength: 500 }),
    role: fc.constantFrom<'user' | 'assistant'>('user', 'assistant'),
    language: fc.constantFrom<'fr' | 'ar' | 'en'>('fr', 'ar', 'en')
  })

/**
 * Generator for verification documents
 */
export const verificationDocumentArbitrary = (): fc.Arbitrary<{
  document_type: string
  document_url: string
  provider_id: string
}> =>
  fc.record({
    document_type: fc.constantFrom('license', 'certificate', 'id_card', 'proof_of_ownership'),
    document_url: fc.webUrl(),
    provider_id: uuidArbitrary()
  })


/**
 * Generator for appointment status
 */
export const appointmentStatusArbitrary = (): fc.Arbitrary<'pending' | 'confirmed' | 'cancelled' | 'completed'> =>
  fc.constantFrom<'pending' | 'confirmed' | 'cancelled' | 'completed'>('pending', 'confirmed', 'cancelled', 'completed')

/**
 * Generator for appointment contact info
 */
export const appointmentContactInfoArbitrary = (): fc.Arbitrary<{
  name: string
  phone: string
  email?: string
}> =>
  fc.record({
    name: fc.string({ minLength: 2, maxLength: 100 }),
    phone: phoneArbitrary(),
    email: fc.option(emailArbitrary(), { nil: undefined })
  })

/**
 * Generator for future dates (for appointments)
 */
export const futureDateArbitrary = (): fc.Arbitrary<Date> =>
  fc.integer({ min: Date.now() + 86400000, max: Date.now() + 365 * 86400000 }) // 1 day to 1 year from now
    .map(timestamp => new Date(timestamp))

/**
 * Generator for CreateAppointmentData
 */
export const createAppointmentDataArbitrary = (): fc.Arbitrary<{
  providerId: string
  userId: string
  datetime: Date
  contactInfo: {
    name: string
    phone: string
    email?: string
  }
  notes?: string
}> =>
  fc.record({
    providerId: uuidArbitrary(),
    userId: uuidArbitrary(),
    datetime: futureDateArbitrary(),
    contactInfo: appointmentContactInfoArbitrary(),
    notes: fc.option(fc.string({ minLength: 0, maxLength: 500 }), { nil: undefined })
  })
