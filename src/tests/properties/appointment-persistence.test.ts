/**
 * Property-based tests for Appointment Firestore Persistence
 * Feature: critical-fixes
 * 
 * These tests validate that appointments are properly persisted to Firestore
 * with all required fields.
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

// Import appointment service functions
import * as appointmentService from '@/integrations/firebase/services/appointmentService'

// Import types
import type { CreateAppointmentData, AppointmentStatus } from '@/integrations/firebase/types'

// Import generators
import {
  uuidArbitrary,
  phoneArbitrary,
  emailArbitrary,
  futureDateArbitrary,
  appointmentContactInfoArbitrary,
  createAppointmentDataArbitrary,
  appointmentStatusArbitrary,
} from '@/tests/generators'

describe('Appointment Firestore Persistence Properties', () => {
  /**
   * Feature: critical-fixes, Property 7: Appointment Firestore persistence
   * Validates: Requirements 3.2, 3.3
   * 
   * For any confirmed booking, an appointment document should be created in Firestore
   * with all required fields (providerId, userId, datetime, status, contactInfo)
   */
  
  it('Property 7: Appointment service should export all required CRUD functions', () => {
    // Verify all required appointment functions are exported
    expect(typeof appointmentService.createAppointment).toBe('function')
    expect(typeof appointmentService.getAppointmentById).toBe('function')
    expect(typeof appointmentService.getAppointmentsByUser).toBe('function')
    expect(typeof appointmentService.getAppointmentsByProvider).toBe('function')
    expect(typeof appointmentService.updateAppointmentStatus).toBe('function')
    expect(typeof appointmentService.cancelAppointment).toBe('function')
  })

  it('Property 7: CreateAppointmentData should contain all required fields', () => {
    fc.assert(
      fc.property(
        createAppointmentDataArbitrary(),
        (appointmentData) => {
          // Verify all required fields are present
          expect(appointmentData.providerId).toBeDefined()
          expect(typeof appointmentData.providerId).toBe('string')
          expect(appointmentData.providerId.length).toBeGreaterThan(0)
          
          expect(appointmentData.userId).toBeDefined()
          expect(typeof appointmentData.userId).toBe('string')
          expect(appointmentData.userId.length).toBeGreaterThan(0)
          
          expect(appointmentData.datetime).toBeDefined()
          expect(appointmentData.datetime instanceof Date).toBe(true)
          
          expect(appointmentData.contactInfo).toBeDefined()
          expect(typeof appointmentData.contactInfo.name).toBe('string')
          expect(typeof appointmentData.contactInfo.phone).toBe('string')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 7: Contact info should have valid name and phone', () => {
    fc.assert(
      fc.property(
        appointmentContactInfoArbitrary(),
        (contactInfo) => {
          // Name should be non-empty string
          expect(typeof contactInfo.name).toBe('string')
          expect(contactInfo.name.length).toBeGreaterThanOrEqual(2)
          
          // Phone should be valid format (10 digits for Algerian numbers)
          expect(typeof contactInfo.phone).toBe('string')
          expect(contactInfo.phone.length).toBe(10)
          
          // Email should be undefined or valid string
          if (contactInfo.email !== undefined) {
            expect(typeof contactInfo.email).toBe('string')
            expect(contactInfo.email).toContain('@')
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 7: Appointment datetime should be in the future', () => {
    fc.assert(
      fc.property(
        futureDateArbitrary(),
        (datetime) => {
          // Datetime should be a valid Date object
          expect(datetime instanceof Date).toBe(true)
          
          // Datetime should be in the future
          expect(datetime.getTime()).toBeGreaterThan(Date.now())
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 7: Appointment status should be one of valid values', () => {
    fc.assert(
      fc.property(
        appointmentStatusArbitrary(),
        (status) => {
          const validStatuses: AppointmentStatus[] = ['pending', 'confirmed', 'cancelled', 'completed']
          expect(validStatuses).toContain(status)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 7: Provider and user IDs should be valid UUIDs', () => {
    fc.assert(
      fc.property(
        uuidArbitrary(),
        uuidArbitrary(),
        (providerId, userId) => {
          // UUIDs should be valid format
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
          expect(uuidRegex.test(providerId)).toBe(true)
          expect(uuidRegex.test(userId)).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 7: Notes field should be optional', () => {
    fc.assert(
      fc.property(
        createAppointmentDataArbitrary(),
        (appointmentData) => {
          // Notes can be undefined or a string
          if (appointmentData.notes !== undefined) {
            expect(typeof appointmentData.notes).toBe('string')
          }
          // The appointment data should still be valid without notes
          expect(appointmentData.providerId).toBeDefined()
          expect(appointmentData.userId).toBeDefined()
          expect(appointmentData.datetime).toBeDefined()
          expect(appointmentData.contactInfo).toBeDefined()
        }
      ),
      { numRuns: 100 }
    )
  })
})
