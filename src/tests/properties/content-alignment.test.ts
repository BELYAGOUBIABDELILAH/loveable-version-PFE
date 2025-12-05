/**
 * Property-based tests for Content Alignment
 * Feature: critical-fixes
 * 
 * These tests validate that CityHealth branding is consistent
 * and no Cortex references remain in the codebase.
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

/**
 * Property 13: No Cortex references
 * Feature: critical-fixes, Property 13: No Cortex references
 * Validates: Requirements 5.3
 * 
 * For any page in the application, there should be no references to "Cortex" 
 * or unrelated branding
 */
describe('Content Alignment - No Cortex References', () => {
  it('Property 13: WhyPage should not contain Cortex references', async () => {
    const fs = await import('fs')
    const path = await import('path')
    
    const whyPagePath = path.resolve(process.cwd(), 'src/pages/WhyPage.tsx')
    const whyPageContent = fs.readFileSync(whyPagePath, 'utf-8')
    
    // Should not contain Cortex references
    expect(whyPageContent.toLowerCase()).not.toContain('cortex')
    
    // Should contain CityHealth references
    expect(whyPageContent).toContain('CityHealth')
    
    // Should contain Sidi Bel Abbès references (local context)
    expect(whyPageContent).toContain('Sidi Bel Abbès')
  })

  it('Property 13: HowPage should not contain Cortex references', async () => {
    const fs = await import('fs')
    const path = await import('path')
    
    const howPagePath = path.resolve(process.cwd(), 'src/pages/HowPage.tsx')
    const howPageContent = fs.readFileSync(howPagePath, 'utf-8')
    
    // Should not contain Cortex references
    expect(howPageContent.toLowerCase()).not.toContain('cortex')
    
    // Should contain CityHealth references
    expect(howPageContent).toContain('CityHealth')
    
    // Should contain healthcare-related content
    expect(howPageContent).toContain('prestataire')
    expect(howPageContent).toContain('santé')
  })

  it('Property 13: For any content page name, pages should not contain Cortex', () => {
    // Pre-load the file contents synchronously
    const fs = require('fs')
    const path = require('path')
    
    const pageContents: Record<string, string> = {
      'WhyPage': fs.readFileSync(path.resolve(process.cwd(), 'src/pages/WhyPage.tsx'), 'utf-8'),
      'HowPage': fs.readFileSync(path.resolve(process.cwd(), 'src/pages/HowPage.tsx'), 'utf-8'),
    }
    
    fc.assert(
      fc.property(
        fc.constantFrom('WhyPage', 'HowPage'),
        (pageName) => {
          const pageContent = pageContents[pageName]
          
          // No Cortex references should exist
          const hasCortex = pageContent.toLowerCase().includes('cortex')
          return !hasCortex
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 13: Content pages should have CityHealth branding', () => {
    // Pre-load the file contents synchronously
    const fs = require('fs')
    const path = require('path')
    
    const pageContents: Record<string, string> = {
      'WhyPage': fs.readFileSync(path.resolve(process.cwd(), 'src/pages/WhyPage.tsx'), 'utf-8'),
      'HowPage': fs.readFileSync(path.resolve(process.cwd(), 'src/pages/HowPage.tsx'), 'utf-8'),
    }
    
    fc.assert(
      fc.property(
        fc.constantFrom('WhyPage', 'HowPage'),
        (pageName) => {
          const pageContent = pageContents[pageName]
          
          // Should have CityHealth branding
          return pageContent.includes('CityHealth')
        }
      ),
      { numRuns: 100 }
    )
  })
})
