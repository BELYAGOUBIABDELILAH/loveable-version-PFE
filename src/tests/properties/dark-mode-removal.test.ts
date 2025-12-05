/**
 * Property-Based Tests for Dark Mode Removal
 * Feature: cityhealth-platform, Property 68: Dark mode removal
 * Validates: Requirements 20.8
 * 
 * This test verifies that all dark mode functionality has been removed
 * from the application per Google Antigravity Design System requirements.
 */

import { describe, test, expect } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'

// Get project root directory
const projectRoot = process.cwd()

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
          if (filePath.match(/\.(ts|tsx|js|jsx|css)$/) && !filePath.includes('.test.')) {
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

describe('Dark Mode Removal Properties', () => {
  /**
   * Property 68: Dark mode removal
   * Feature: cityhealth-platform, Property 68: Dark mode removal
   * Validates: Requirements 20.8
   */
  
  test('Property 68: No dark: Tailwind variants should exist in source files', () => {
    const srcPath = path.join(projectRoot, 'src')
    const sourceFiles = getAllFiles(srcPath)
    
    const filesWithDarkVariants: string[] = []
    
    sourceFiles.forEach((filePath) => {
      const content = readFileContent(filePath)
      
      // Skip test files
      if (filePath.includes('.test.')) {
        return
      }
      
      // Check for dark: Tailwind variants
      if (/\bdark:/.test(content)) {
        filesWithDarkVariants.push(filePath)
      }
    })
    
    expect(filesWithDarkVariants).toEqual([])
  })

  test('Property 68: CSS should not contain .dark class styles', () => {
    const cssPath = path.join(projectRoot, 'src/index.css')
    const content = readFileContent(cssPath)
    
    // Check that .dark class is not defined
    expect(content).not.toMatch(/\.dark\s*\{/)
  })

  test('Property 68: ThemeContext should not toggle to dark mode', () => {
    const themeContextPath = path.join(projectRoot, 'src/contexts/ThemeContext.tsx')
    const content = readFileContent(themeContextPath)
    
    // Check that theme is always 'light'
    expect(content).toContain("theme: Theme = 'light'")
    // Check that dark mode is mentioned as removed
    expect(content).toContain('Dark mode has been removed')
  })

  test('Property 68: Navbar should not have dark mode toggle button', () => {
    const navbarPath = path.join(projectRoot, 'src/components/Navbar.tsx')
    const content = readFileContent(navbarPath)
    
    // Check that Moon and Sun icons are not imported
    expect(content).not.toContain('Moon')
    expect(content).not.toContain('Sun')
    // Check that toggleTheme is not used
    expect(content).not.toContain('toggleTheme')
  })

  test('Property 68: Tailwind config should not have darkMode setting', () => {
    const tailwindConfigPath = path.join(projectRoot, 'tailwind.config.ts')
    const content = readFileContent(tailwindConfigPath)
    
    // Check that darkMode is not configured
    expect(content).not.toMatch(/darkMode:\s*\[/)
  })

  test('Property 68: No localStorage dark theme persistence', () => {
    const themeContextPath = path.join(projectRoot, 'src/contexts/ThemeContext.tsx')
    const content = readFileContent(themeContextPath)
    
    // Check that localStorage is not used for theme
    expect(content).not.toContain("localStorage.getItem('theme')")
    expect(content).not.toContain("localStorage.setItem('theme'")
  })
})
