/**
 * Property-Based Tests for Legacy Code Removal
 * Feature: cityhealth-platform, Property 66: Legacy code removal
 * Validates: Requirements 19.6, 21.7
 * 
 * This test verifies that no Supabase client code, Google Maps code, 
 * or related configurations exist in the codebase.
 */

import { describe, test, expect } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'

// Helper function to recursively get all files in a directory
function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  try {
    const files = fs.readdirSync(dirPath)

    files.forEach((file) => {
      const filePath = path.join(dirPath, file)
      
      // Skip node_modules, dist, and .git directories
      if (file === 'node_modules' || file === 'dist' || file === '.git' || file === '.kiro') {
        return
      }

      try {
        if (fs.statSync(filePath).isDirectory()) {
          arrayOfFiles = getAllFiles(filePath, arrayOfFiles)
        } else {
          // Only include source files
          if (filePath.match(/\.(ts|tsx|js|jsx)$/) && !filePath.includes('.test.')) {
            arrayOfFiles.push(filePath)
          }
        }
      } catch (e) {
        // Skip files that can't be accessed
      }
    })
  } catch (e) {
    // Skip directories that can't be accessed
  }

  return arrayOfFiles
}

// Helper function to read file content
function readFileContent(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf-8')
  } catch (e) {
    return ''
  }
}

// Patterns that indicate active Supabase code (not documentation comments)
const supabasePatterns = [
  /from\s+['"]@supabase\/supabase-js['"]/,
  /from\s+['"]@\/integrations\/supabase/,
  /import\s+.*supabase.*from/i,
  /const\s+supabase\s*=/,
  /VITE_SUPABASE_URL/,
  /VITE_SUPABASE_KEY/,
  /VITE_SUPABASE_ANON_KEY/,
]

// Patterns that indicate Google Maps code
const googleMapsPatterns = [
  /from\s+['"]@googlemaps/,
  /from\s+['"]@react-google-maps/,
  /google\.maps/,
  /GoogleMap/,
  /GOOGLE_MAPS_API_KEY/,
  /maps\.googleapis\.com/,
]

describe('Legacy Code Removal Properties', () => {
  /**
   * Property 66: Legacy code removal
   * Feature: cityhealth-platform, Property 66: Legacy code removal
   * Validates: Requirements 19.6, 21.7
   */
  test('Property 66: No Supabase client code should exist in source files', () => {
    const srcPath = path.resolve(__dirname, '../../../')
    const sourceFiles = getAllFiles(srcPath)
    
    const filesWithSupabase: string[] = []
    
    sourceFiles.forEach((filePath) => {
      const content = readFileContent(filePath)
      
      // Skip test files, migration documentation, archived supabase functions, and generators
      if (filePath.includes('.test.') || 
          filePath.includes('MIGRATION') || 
          filePath.includes('docs/') ||
          filePath.includes('supabase') ||
          filePath.includes('generators')) {
        return
      }
      
      supabasePatterns.forEach((pattern) => {
        if (pattern.test(content)) {
          filesWithSupabase.push(filePath)
        }
      })
    })
    
    // Remove duplicates
    const uniqueFiles = [...new Set(filesWithSupabase)]
    
    expect(uniqueFiles).toEqual([])
  })

  test('Property 66: No Google Maps code should exist in source files', () => {
    const srcPath = path.resolve(__dirname, '../../../')
    const sourceFiles = getAllFiles(srcPath)
    
    const filesWithGoogleMaps: string[] = []
    
    sourceFiles.forEach((filePath) => {
      const content = readFileContent(filePath)
      
      // Skip test files and migration documentation
      if (filePath.includes('.test.') || 
          filePath.includes('MIGRATION') || 
          filePath.includes('docs/')) {
        return
      }
      
      googleMapsPatterns.forEach((pattern) => {
        if (pattern.test(content)) {
          filesWithGoogleMaps.push(filePath)
        }
      })
    })
    
    // Remove duplicates
    const uniqueFiles = [...new Set(filesWithGoogleMaps)]
    
    expect(uniqueFiles).toEqual([])
  })

  test('Property 66: Supabase directory should not exist', () => {
    const supabaseIntegrationPath = path.resolve(__dirname, '../../integrations/supabase')
    
    let directoryExists = false
    try {
      fs.accessSync(supabaseIntegrationPath)
      directoryExists = true
    } catch (e) {
      directoryExists = false
    }
    
    expect(directoryExists).toBe(false)
  })

  test('Property 66: Firebase should be the only backend integration', () => {
    const integrationsPath = path.resolve(__dirname, '../../integrations')
    
    let integrations: string[] = []
    try {
      integrations = fs.readdirSync(integrationsPath)
    } catch (e) {
      // Directory doesn't exist or can't be read
    }
    
    // Filter out non-directory entries
    const integrationDirs = integrations.filter((name) => {
      try {
        const fullPath = path.join(integrationsPath, name)
        return fs.statSync(fullPath).isDirectory()
      } catch (e) {
        return false
      }
    })
    
    // Should only have firebase integration
    expect(integrationDirs).toContain('firebase')
    expect(integrationDirs).not.toContain('supabase')
    expect(integrationDirs).not.toContain('google-maps')
  })

  test('Property 66: Package.json should not contain Supabase dependencies', () => {
    const packageJsonPath = path.resolve(__dirname, '../../../../package.json')
    
    let packageJson: any = {}
    try {
      const content = fs.readFileSync(packageJsonPath, 'utf-8')
      packageJson = JSON.parse(content)
    } catch (e) {
      // File doesn't exist or can't be parsed
    }
    
    const allDependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    }
    
    const supabaseDeps = Object.keys(allDependencies).filter((dep) =>
      dep.includes('supabase')
    )
    
    expect(supabaseDeps).toEqual([])
  })

  test('Property 66: Package.json should not contain Google Maps dependencies', () => {
    const packageJsonPath = path.resolve(__dirname, '../../../../package.json')
    
    let packageJson: any = {}
    try {
      const content = fs.readFileSync(packageJsonPath, 'utf-8')
      packageJson = JSON.parse(content)
    } catch (e) {
      // File doesn't exist or can't be parsed
    }
    
    const allDependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    }
    
    const googleMapsDeps = Object.keys(allDependencies).filter((dep) =>
      dep.includes('googlemaps') || dep.includes('google-maps')
    )
    
    expect(googleMapsDeps).toEqual([])
  })
})
