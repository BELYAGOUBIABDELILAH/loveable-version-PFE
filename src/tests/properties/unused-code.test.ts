/**
 * Property-Based Tests for No Unused Code
 * Feature: cityhealth-platform, Property 73: No unused code
 * Validates: Requirements 22.1
 * 
 * This test verifies that unused components, pages, and imports have been removed.
 */

import { describe, test, expect } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'

// Helper function to check if a file exists
function fileExists(filePath: string): boolean {
  try {
    fs.accessSync(filePath)
    return true
  } catch (e) {
    return false
  }
}

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

// List of components that should have been removed
const removedComponents = [
  'src/pages/Index.tsx',
  'src/components/ParticleBackground.tsx',
  'src/components/NeuralNode.tsx',
  'src/components/Visualization.tsx',
  'src/components/Footer.tsx',
  'src/components/MapPlaceholder.tsx',
  'src/components/MobileAppSection.tsx',
  'src/components/MapSection.tsx',
]

// Patterns for imports of removed components
const removedImportPatterns = [
  /from\s+['"].*\/ParticleBackground['"]/,
  /from\s+['"].*\/NeuralNode['"]/,
  /from\s+['"].*\/Visualization['"]/,
  /from\s+['"].*\/Footer['"](?!.*ModernFooter)/,
  /from\s+['"].*\/MapPlaceholder['"]/,
  /from\s+['"].*\/MobileAppSection['"]/,
  /from\s+['"].*\/MapSection['"]/,
  /from\s+['"]\.\/pages\/Index['"]/,
  /from\s+['"]@\/pages\/Index['"]/,
]

describe('No Unused Code Properties', () => {
  /**
   * Property 73: No unused code
   * Feature: cityhealth-platform, Property 73: No unused code
   * Validates: Requirements 22.1
   */
  test('Property 73: Removed components should not exist', () => {
    const srcPath = path.resolve(__dirname, '../../')
    
    const existingRemovedFiles: string[] = []
    
    removedComponents.forEach((component) => {
      const fullPath = path.resolve(srcPath, '..', component)
      if (fileExists(fullPath)) {
        existingRemovedFiles.push(component)
      }
    })
    
    expect(existingRemovedFiles).toEqual([])
  })

  test('Property 73: No imports of removed components should exist', () => {
    const srcPath = path.resolve(__dirname, '../../')
    const sourceFiles = getAllFiles(srcPath)
    
    const filesWithRemovedImports: { file: string; pattern: string }[] = []
    
    sourceFiles.forEach((filePath) => {
      const content = readFileContent(filePath)
      
      // Skip test files
      if (filePath.includes('.test.')) {
        return
      }
      
      removedImportPatterns.forEach((pattern) => {
        if (pattern.test(content)) {
          filesWithRemovedImports.push({
            file: filePath,
            pattern: pattern.toString(),
          })
        }
      })
    })
    
    expect(filesWithRemovedImports).toEqual([])
  })

  test('Property 73: Old Index.tsx should not exist (replaced by NewIndex.tsx)', () => {
    const oldIndexPath = path.resolve(__dirname, '../../pages/Index.tsx')
    const newIndexPath = path.resolve(__dirname, '../../pages/NewIndex.tsx')
    
    expect(fileExists(oldIndexPath)).toBe(false)
    expect(fileExists(newIndexPath)).toBe(true)
  })

  test('Property 73: NeuralNodeData type should not exist in types.ts', () => {
    const typesPath = path.resolve(__dirname, '../../lib/types.ts')
    const content = readFileContent(typesPath)
    
    expect(content).not.toContain('NeuralNodeData')
  })

  test('Property 73: App.tsx should use NewIndex, not Index', () => {
    const appPath = path.resolve(__dirname, '../../App.tsx')
    const content = readFileContent(appPath)
    
    // Should import NewIndex
    expect(content).toContain('NewIndex')
    
    // Should not import old Index
    expect(content).not.toMatch(/from\s+['"]\.\/pages\/Index['"]/)
    expect(content).not.toMatch(/from\s+['"]@\/pages\/Index['"]/)
  })
})
