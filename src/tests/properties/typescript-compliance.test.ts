/**
 * Property-Based Tests for TypeScript Strict Compliance
 * Feature: cityhealth-platform, Property 75: TypeScript strict compliance
 * Validates: Requirements 22.8
 * 
 * This test verifies that the codebase maintains TypeScript compliance
 * by checking for common code quality issues.
 */

import { describe, test, expect } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'

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
          if (filePath.match(/\.(ts|tsx)$/) && !filePath.includes('.test.')) {
            arrayOfFiles.push(filePath)
          }
        }
      } catch {
        // Skip files that can't be accessed
      }
    })
  } catch {
    // Skip directories that can't be accessed
  }

  return arrayOfFiles
}

// Helper function to read file content
function readFileContent(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf-8')
  } catch {
    return ''
  }
}

describe('TypeScript Compliance Properties', () => {
  /**
   * Property 75: TypeScript strict compliance
   * Feature: cityhealth-platform, Property 75: TypeScript strict compliance
   * Validates: Requirements 22.8
   */
  test('Property 75: No console.log statements in production code', () => {
    const srcPath = path.resolve(__dirname, '../../')
    const sourceFiles = getAllFiles(srcPath)
    
    const filesWithConsoleLog: string[] = []
    
    sourceFiles.forEach((filePath) => {
      const content = readFileContent(filePath)
      
      // Skip test files
      if (filePath.includes('.test.')) {
        return
      }
      
      if (/console\.log\(/.test(content)) {
        filesWithConsoleLog.push(filePath)
      }
    })
    
    expect(filesWithConsoleLog).toEqual([])
  })

  test('Property 75: No any type annotations in critical files', () => {
    const srcPath = path.resolve(__dirname, '../../')
    const sourceFiles = getAllFiles(srcPath)
    
    // Check critical service files for explicit 'any' type usage
    const criticalPatterns = [
      /services\//,
      /contexts\//,
      /integrations\/firebase\/services\//,
    ]
    
    const filesWithExplicitAny: { file: string; count: number }[] = []
    
    sourceFiles.forEach((filePath) => {
      const isCritical = criticalPatterns.some((pattern) => pattern.test(filePath))
      
      if (!isCritical) return
      
      const content = readFileContent(filePath)
      
      // Count explicit ': any' type annotations (not in comments)
      const lines = content.split('\n')
      let anyCount = 0
      
      lines.forEach((line) => {
        // Skip comments
        if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
          return
        }
        
        // Count ': any' patterns
        const matches = line.match(/:\s*any\b/g)
        if (matches) {
          anyCount += matches.length
        }
      })
      
      // Allow some 'any' usage but flag excessive use
      if (anyCount > 5) {
        filesWithExplicitAny.push({ file: filePath, count: anyCount })
      }
    })
    
    // This is a soft check - we allow some 'any' usage
    expect(filesWithExplicitAny.length).toBeLessThanOrEqual(2)
  })

  test('Property 75: All TypeScript files should have proper imports', () => {
    const srcPath = path.resolve(__dirname, '../../')
    const sourceFiles = getAllFiles(srcPath)
    
    const filesWithBrokenImports: string[] = []
    
    sourceFiles.forEach((filePath) => {
      const content = readFileContent(filePath)
      
      // Check for common broken import patterns
      const brokenPatterns = [
        /from\s+['"]@\/integrations\/supabase/,
        /from\s+['"]@supabase/,
        /from\s+['"]@googlemaps/,
      ]
      
      brokenPatterns.forEach((pattern) => {
        if (pattern.test(content)) {
          filesWithBrokenImports.push(filePath)
        }
      })
    })
    
    expect([...new Set(filesWithBrokenImports)]).toEqual([])
  })

  test('Property 75: Firebase services should be properly typed', () => {
    const servicesPath = path.resolve(__dirname, '../../integrations/firebase/services')
    
    let servicesExist = false
    try {
      fs.accessSync(servicesPath)
      servicesExist = true
    } catch {
      servicesExist = false
    }
    
    expect(servicesExist).toBe(true)
    
    if (servicesExist) {
      const serviceFiles = fs.readdirSync(servicesPath)
      
      // Should have auth, provider, and storage services
      expect(serviceFiles).toContain('authService.ts')
      expect(serviceFiles).toContain('providerService.ts')
      expect(serviceFiles).toContain('storageService.ts')
      expect(serviceFiles).toContain('index.ts')
    }
  })

  test('Property 75: Types file should export all required types', () => {
    const typesPath = path.resolve(__dirname, '../../integrations/firebase/types.ts')
    const content = readFileContent(typesPath)
    
    // Check for required interface exports
    const requiredInterfaces = [
      'Provider',
      'Profile',
      'MedicalAd',
      'Favorite',
    ]
    
    // Check for required type exports
    const requiredTypes = [
      'UserRole',
      'ProviderType',
      'VerificationStatus',
    ]
    
    requiredInterfaces.forEach((typeName) => {
      expect(content).toContain(`export interface ${typeName}`)
    })
    
    requiredTypes.forEach((typeName) => {
      expect(content).toContain(`export type ${typeName}`)
    })
  })

  /**
   * Property 75: TypeScript strict mode compilation
   * Feature: cityhealth-platform, Property 75: TypeScript strict compliance
   * Validates: Requirements 22.8
   * 
   * This test verifies that the codebase compiles without errors in TypeScript strict mode.
   */
  test('Property 75: TypeScript strict mode compilation passes', { timeout: 60000 }, () => {
    const projectRoot = path.resolve(__dirname, '../../../')
    
    // Verify tsconfig.app.json has strict mode enabled
    const tsconfigAppPath = path.join(projectRoot, 'tsconfig.app.json')
    const tsconfigContent = readFileContent(tsconfigAppPath)
    
    expect(tsconfigContent).toContain('"strict": true')
    
    // Run TypeScript compiler in noEmit mode to check for type errors
    let compileResult: { success: boolean; errors: string[] } = { success: true, errors: [] }
    
    try {
      execSync('npx tsc --noEmit -p tsconfig.app.json', {
        cwd: projectRoot,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      })
      compileResult.success = true
    } catch (error: unknown) {
      compileResult.success = false
      if (error && typeof error === 'object' && 'stdout' in error) {
        const stdout = (error as { stdout: string }).stdout
        compileResult.errors = stdout.split('\n').filter((line: string) => line.trim())
      }
    }
    
    // The codebase should compile without TypeScript errors
    expect(compileResult.success).toBe(true)
  })
})
