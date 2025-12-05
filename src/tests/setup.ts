// Test setup file for Vitest
import { beforeAll, afterAll } from 'vitest'
import '@testing-library/jest-dom'
import * as fc from 'fast-check'

// Configure fast-check for property-based testing
// Run at least 100 iterations per property test as per design document
fc.configureGlobal({
  numRuns: 100,
  verbose: true,
})

beforeAll(() => {
  // Setup test environment
})

afterAll(() => {
  // Cleanup test environment
})