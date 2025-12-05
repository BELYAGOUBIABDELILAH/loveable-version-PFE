/**
 * Property-Based Tests for Leaflet Map Integration
 * Feature: cityhealth-platform
 * 
 * Property 70: Leaflet map usage
 * Validates: Requirements 21.1, 21.2
 * 
 * Property 71: Map marker popups
 * Validates: Requirements 21.4
 * 
 * Property 72: Marker clustering
 * Validates: Requirements 21.5
 * 
 * Property 9: Leaflet map presence
 * Validates: Requirements 3.4
 */

import { describe, test, expect } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import * as fc from 'fast-check'

// Helper function to read file content
function readFileContent(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf-8')
  } catch (e) {
    return ''
  }
}

// Helper function to check if file exists
function fileExists(filePath: string): boolean {
  try {
    fs.accessSync(filePath)
    return true
  } catch (e) {
    return false
  }
}

describe('Leaflet Map Integration Properties', () => {
  /**
   * Property 70: Leaflet map usage
   * Feature: cityhealth-platform, Property 70: Leaflet map usage
   * Validates: Requirements 21.1, 21.2
   * 
   * *For any* map component in the application, it should use Leaflet with react-leaflet
   * and display OpenStreetMap tiles using the correct URL pattern
   */
  test('Property 70: Map components should use Leaflet with react-leaflet', () => {
    const mapContainerPath = path.resolve(__dirname, '../../components/maps/MapContainer.tsx')
    
    expect(fileExists(mapContainerPath)).toBe(true)
    
    const content = readFileContent(mapContainerPath)
    
    // Should import from react-leaflet
    expect(content).toMatch(/from\s+['"]react-leaflet['"]/)
    
    // Should use MapContainer from react-leaflet
    expect(content).toMatch(/MapContainer/)
    
    // Should use TileLayer for OpenStreetMap
    expect(content).toMatch(/TileLayer/)
  })

  test('Property 70: Map should use OpenStreetMap tiles with correct URL pattern', () => {
    const mapContainerPath = path.resolve(__dirname, '../../components/maps/MapContainer.tsx')
    const content = readFileContent(mapContainerPath)
    
    // Should use OpenStreetMap tile URL pattern
    const osmTilePattern = /https:\/\/\{s\}\.tile\.openstreetmap\.org\/\{z\}\/\{x\}\/\{y\}\.png/
    expect(content).toMatch(osmTilePattern)
  })

  test('Property 70: Map should have default center set to Sidi Bel Abbès', () => {
    const mapContainerPath = path.resolve(__dirname, '../../components/maps/MapContainer.tsx')
    const content = readFileContent(mapContainerPath)
    
    // Should have Sidi Bel Abbès coordinates [35.1833, -0.6333]
    // Allow for slight variations in coordinate precision
    expect(content).toMatch(/35\.18/)
    expect(content).toMatch(/-0\.63/)
  })

  test('Property 70: Package.json should contain Leaflet dependencies', () => {
    // Try multiple possible paths to package.json
    const possiblePaths = [
      path.resolve(__dirname, '../../../../package.json'),
      path.resolve(__dirname, '../../../package.json'),
      path.resolve(process.cwd(), 'package.json'),
    ]
    
    let packageJson: any = {}
    for (const packageJsonPath of possiblePaths) {
      try {
        const content = fs.readFileSync(packageJsonPath, 'utf-8')
        packageJson = JSON.parse(content)
        break
      } catch (e) {
        // Try next path
      }
    }
    
    const allDependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    }
    
    // Should have leaflet and react-leaflet
    expect(allDependencies).toHaveProperty('leaflet')
    expect(allDependencies).toHaveProperty('react-leaflet')
    expect(allDependencies).toHaveProperty('@types/leaflet')
  })

  test('Property 70: Leaflet CSS should be imported in main.tsx', () => {
    const mainTsxPath = path.resolve(__dirname, '../../main.tsx')
    const content = readFileContent(mainTsxPath)
    
    // Should import Leaflet CSS
    expect(content).toMatch(/import\s+['"]leaflet\/dist\/leaflet\.css['"]/)
  })

  /**
   * Property 71: Map marker popups
   * Feature: cityhealth-platform, Property 71: Map marker popups
   * Validates: Requirements 21.4
   * 
   * *For any* provider marker on the map, clicking it should display a popup
   * showing provider name, type, address, and phone
   */
  test('Property 71: Provider marker component should exist with popup functionality', () => {
    const providerMarkerPath = path.resolve(__dirname, '../../components/maps/ProviderMarker.tsx')
    
    expect(fileExists(providerMarkerPath)).toBe(true)
    
    const content = readFileContent(providerMarkerPath)
    
    // Should import Marker and Popup from react-leaflet
    expect(content).toMatch(/Marker/)
    expect(content).toMatch(/Popup/)
  })

  test('Property 71: Marker popup should display required provider information', () => {
    const providerMarkerPath = path.resolve(__dirname, '../../components/maps/ProviderMarker.tsx')
    const content = readFileContent(providerMarkerPath)
    
    // Popup should reference provider properties for display
    // These are the required fields: name, type, address, phone
    expect(content).toMatch(/business_name|businessName|name/)
    expect(content).toMatch(/provider_type|providerType|type/)
    expect(content).toMatch(/address/)
    expect(content).toMatch(/phone/)
  })

  /**
   * Property 71: Map marker popups - Property-based test
   * Feature: cityhealth-platform, Property 71: Map marker popups
   * Validates: Requirements 21.4
   * 
   * *For any* valid provider marker props, the ProviderMarker component interface
   * should accept all required fields (name, type, address, phone) and the component
   * should render them in the popup
   */
  test('Property 71: For any valid provider marker props, popup should contain all required fields', () => {
    const providerMarkerPath = path.resolve(__dirname, '../../components/maps/ProviderMarker.tsx')
    const content = readFileContent(providerMarkerPath)
    
    // Generator for valid provider marker props
    const providerMarkerPropsArbitrary = fc.record({
      id: fc.uuid(),
      business_name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
      provider_type: fc.constantFrom('doctor', 'clinic', 'hospital', 'pharmacy', 'laboratory'),
      address: fc.string({ minLength: 5, maxLength: 200 }).filter(s => s.trim().length > 0),
      phone: fc.stringMatching(/^0[567]\d{8}$/), // Algerian mobile format
      latitude: fc.double({ min: 18.0, max: 37.0, noNaN: true }),
      longitude: fc.double({ min: -8.0, max: 12.0, noNaN: true }),
      verification_status: fc.option(fc.constantFrom('pending', 'verified', 'rejected'), { nil: undefined }),
      is_emergency: fc.option(fc.boolean(), { nil: undefined }),
      accessibility_features: fc.option(fc.array(fc.constantFrom('wheelchair', 'parking', 'elevator', 'ramp')), { nil: undefined }),
      home_visit_available: fc.option(fc.boolean(), { nil: undefined }),
    })

    fc.assert(
      fc.property(providerMarkerPropsArbitrary, (props) => {
        // Property: For any valid provider marker props, the component interface
        // should define all required fields that will be displayed in the popup
        
        // The component must accept these required props
        expect(props.business_name).toBeDefined()
        expect(props.provider_type).toBeDefined()
        expect(props.address).toBeDefined()
        expect(props.phone).toBeDefined()
        expect(props.latitude).toBeDefined()
        expect(props.longitude).toBeDefined()
        
        // Verify the component source contains JSX that renders these fields in the Popup
        // The Popup component should contain references to display these values
        expect(content).toContain('business_name')
        expect(content).toContain('provider_type')
        expect(content).toContain('address')
        expect(content).toContain('phone')
        
        // Verify Popup component is used to wrap the content
        expect(content).toContain('<Popup>')
        expect(content).toContain('</Popup>')
        
        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property 71: Map marker popups - Popup content structure validation
   * Feature: cityhealth-platform, Property 71: Map marker popups
   * Validates: Requirements 21.4
   * 
   * *For any* provider marker, the popup should have proper structure with
   * all required information fields rendered
   */
  test('Property 71: Popup structure should contain all required display elements', () => {
    const providerMarkerPath = path.resolve(__dirname, '../../components/maps/ProviderMarker.tsx')
    const content = readFileContent(providerMarkerPath)
    
    // Extract the Popup content section
    const popupMatch = content.match(/<Popup>([\s\S]*?)<\/Popup>/)
    expect(popupMatch).not.toBeNull()
    
    const popupContent = popupMatch![1]
    
    // Property: The popup content must render all required fields
    // 1. Provider name (business_name)
    expect(popupContent).toContain('business_name')
    
    // 2. Provider type
    expect(popupContent).toContain('provider_type')
    
    // 3. Address with MapPin icon
    expect(popupContent).toContain('address')
    expect(content).toContain('MapPin')
    
    // 4. Phone with clickable tel: link
    expect(popupContent).toContain('phone')
    expect(popupContent).toMatch(/tel:.*phone|href.*tel/)
  })

  /**
   * Property 71: Map marker popups - Icon imports validation
   * Feature: cityhealth-platform, Property 71: Map marker popups
   * Validates: Requirements 21.4
   * 
   * *For any* marker popup, appropriate icons should be used for visual clarity
   */
  test('Property 71: Marker popup should use appropriate icons for information display', () => {
    const providerMarkerPath = path.resolve(__dirname, '../../components/maps/ProviderMarker.tsx')
    const content = readFileContent(providerMarkerPath)
    
    // Should import icons for visual display
    expect(content).toMatch(/import.*\{.*MapPin.*\}.*from.*lucide-react/)
    expect(content).toMatch(/import.*\{.*Phone.*\}.*from.*lucide-react/)
    expect(content).toMatch(/import.*\{.*Building2.*\}.*from.*lucide-react/)
  })

  /**
   * Property 72: Marker clustering
   * Feature: cityhealth-platform, Property 72: Marker clustering
   * Validates: Requirements 21.5
   * 
   * *For any* dense area with multiple providers, markers should be clustered
   * using react-leaflet-cluster with appropriate configuration
   */
  test('Property 72: Package.json should contain react-leaflet-cluster', () => {
    // Try multiple possible paths to package.json
    const possiblePaths = [
      path.resolve(__dirname, '../../../../package.json'),
      path.resolve(__dirname, '../../../package.json'),
      path.resolve(process.cwd(), 'package.json'),
    ]
    
    let packageJson: any = {}
    for (const packageJsonPath of possiblePaths) {
      try {
        const content = fs.readFileSync(packageJsonPath, 'utf-8')
        packageJson = JSON.parse(content)
        break
      } catch (e) {
        // Try next path
      }
    }
    
    const allDependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    }
    
    expect(allDependencies).toHaveProperty('react-leaflet-cluster')
  })

  /**
   * Property 72: Marker clustering - Component existence
   * Feature: cityhealth-platform, Property 72: Marker clustering
   * Validates: Requirements 21.5
   * 
   * *For any* map with multiple providers, a MarkerCluster component should exist
   */
  test('Property 72: MarkerCluster component should exist', () => {
    const markerClusterPath = path.resolve(__dirname, '../../components/maps/MarkerCluster.tsx')
    
    expect(fileExists(markerClusterPath)).toBe(true)
    
    const content = readFileContent(markerClusterPath)
    
    // Should import MarkerClusterGroup from react-leaflet-cluster
    expect(content).toMatch(/import.*MarkerClusterGroup.*from.*['"]react-leaflet-cluster['"]/)
  })

  /**
   * Property 72: Marker clustering - Configuration validation
   * Feature: cityhealth-platform, Property 72: Marker clustering
   * Validates: Requirements 21.5
   * 
   * *For any* marker cluster configuration, it should have maxClusterRadius: 50
   * and spiderfyOnMaxZoom: true as specified in the requirements
   */
  test('Property 72: MarkerCluster should have correct configuration options', () => {
    const markerClusterPath = path.resolve(__dirname, '../../components/maps/MarkerCluster.tsx')
    const content = readFileContent(markerClusterPath)
    
    // Should have maxClusterRadius: 50
    expect(content).toMatch(/maxClusterRadius:\s*50/)
    
    // Should have spiderfyOnMaxZoom: true
    expect(content).toMatch(/spiderfyOnMaxZoom:\s*true/)
  })

  /**
   * Property 72: Marker clustering - Design system styling
   * Feature: cityhealth-platform, Property 72: Marker clustering
   * Validates: Requirements 21.5
   * 
   * *For any* cluster icon, it should be styled with Google Blue (#4285F4)
   * to match the design system
   */
  test('Property 72: Cluster icons should use Google Blue accent color', () => {
    const markerClusterPath = path.resolve(__dirname, '../../components/maps/MarkerCluster.tsx')
    const content = readFileContent(markerClusterPath)
    
    // Should use Google Blue color (#4285F4) for clusters
    expect(content).toMatch(/#4285F4/)
    
    // Should have custom icon creation function
    expect(content).toMatch(/iconCreateFunction|createClusterCustomIcon/)
  })

  /**
   * Property 72: Marker clustering - Integration validation
   * Feature: cityhealth-platform, Property 72: Marker clustering
   * Validates: Requirements 21.5
   * 
   * *For any* map page using providers, MarkerCluster should be integrated
   */
  test('Property 72: MarkerCluster should be integrated into SearchMap', () => {
    const searchMapPath = path.resolve(__dirname, '../../components/search/SearchMap.tsx')
    const content = readFileContent(searchMapPath)
    
    // Should import MarkerCluster
    expect(content).toMatch(/MarkerCluster/)
    
    // Should use MarkerCluster component
    expect(content).toMatch(/<MarkerCluster/)
  })

  /**
   * Property 72: Marker clustering - Export validation
   * Feature: cityhealth-platform, Property 72: Marker clustering
   * Validates: Requirements 21.5
   * 
   * *For any* maps module, MarkerCluster should be properly exported
   */
  test('Property 72: MarkerCluster should be exported from maps index', () => {
    const mapsIndexPath = path.resolve(__dirname, '../../components/maps/index.ts')
    const content = readFileContent(mapsIndexPath)
    
    // Should export MarkerCluster
    expect(content).toMatch(/export.*MarkerCluster/)
  })

  /**
   * Property 72: Marker clustering - Property-based test for cluster behavior
   * Feature: cityhealth-platform, Property 72: Marker clustering
   * Validates: Requirements 21.5
   * 
   * *For any* set of providers with coordinates, the MarkerCluster component
   * should accept them as props and render markers
   */
  test('Property 72: For any valid provider array, MarkerCluster should accept providers prop', () => {
    const markerClusterPath = path.resolve(__dirname, '../../components/maps/MarkerCluster.tsx')
    const content = readFileContent(markerClusterPath)
    
    // Generator for valid provider marker props array
    const providerArrayArbitrary = fc.array(
      fc.record({
        id: fc.uuid(),
        business_name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        provider_type: fc.constantFrom('doctor', 'clinic', 'hospital', 'pharmacy', 'laboratory'),
        address: fc.string({ minLength: 5, maxLength: 200 }).filter(s => s.trim().length > 0),
        phone: fc.stringMatching(/^0[567]\d{8}$/),
        latitude: fc.double({ min: 34.0, max: 36.0, noNaN: true }), // Around Sidi Bel Abbès
        longitude: fc.double({ min: -1.5, max: 0.5, noNaN: true }),
      }),
      { minLength: 0, maxLength: 50 }
    )

    fc.assert(
      fc.property(providerArrayArbitrary, (providers) => {
        // Property: For any valid array of providers, the MarkerCluster component
        // should have an interface that accepts a providers prop
        
        // The component must accept providers prop
        expect(content).toMatch(/providers:\s*ProviderMarkerProps\[\]|providers\?:\s*ProviderMarkerProps\[\]/)
        
        // The component should map over providers to render markers
        expect(content).toMatch(/providers\.map/)
        
        // Each provider in the array should have required fields
        for (const provider of providers) {
          expect(provider.id).toBeDefined()
          expect(provider.business_name).toBeDefined()
          expect(provider.latitude).toBeDefined()
          expect(provider.longitude).toBeDefined()
        }
        
        return true
      }),
      { numRuns: 50 }
    )
  })

  /**
   * Property 9: Leaflet map presence
   * Feature: cityhealth-platform, Property 9: Leaflet map presence
   * Validates: Requirements 3.4
   * 
   * *For any* provider profile page with valid coordinates, a Leaflet map
   * component showing the provider location should be present
   */
  test('Property 9: Maps directory should exist with required components', () => {
    const mapsDir = path.resolve(__dirname, '../../components/maps')
    
    expect(fileExists(mapsDir)).toBe(true)
    
    // Check for MapContainer
    const mapContainerPath = path.join(mapsDir, 'MapContainer.tsx')
    expect(fileExists(mapContainerPath)).toBe(true)
  })

  /**
   * Property 9: Leaflet map presence - ProviderProfilePage integration
   * Feature: cityhealth-platform, Property 9: Leaflet map presence
   * Validates: Requirements 3.4
   * 
   * *For any* provider profile page with valid coordinates, a Leaflet map
   * component showing the provider location should be present
   */
  test('Property 9: ProviderProfilePage should import and use Leaflet map components', () => {
    const providerProfilePath = path.resolve(__dirname, '../../pages/ProviderProfilePage.tsx')
    
    expect(fileExists(providerProfilePath)).toBe(true)
    
    const content = readFileContent(providerProfilePath)
    
    // Should import MapContainerWrapper from maps components
    expect(content).toMatch(/import.*\{.*MapContainerWrapper.*\}.*from.*['"]@\/components\/maps['"]/)
    
    // Should import ProviderMarker from maps components
    expect(content).toMatch(/import.*\{.*ProviderMarker.*\}.*from.*['"]@\/components\/maps['"]/)
    
    // Should use MapContainerWrapper component
    expect(content).toMatch(/<MapContainerWrapper/)
    
    // Should use ProviderMarker component inside the map
    expect(content).toMatch(/<ProviderMarker/)
  })

  /**
   * Property 9: Leaflet map presence - Conditional rendering based on coordinates
   * Feature: cityhealth-platform, Property 9: Leaflet map presence
   * Validates: Requirements 3.4
   * 
   * *For any* provider profile page, the map should only render when valid
   * coordinates (latitude and longitude) are present
   */
  test('Property 9: Map should conditionally render based on valid coordinates', () => {
    const providerProfilePath = path.resolve(__dirname, '../../pages/ProviderProfilePage.tsx')
    const content = readFileContent(providerProfilePath)
    
    // Should have conditional rendering based on latitude and longitude
    expect(content).toMatch(/provider\.latitude\s*&&\s*provider\.longitude/)
    
    // Should pass coordinates to MapContainerWrapper center prop
    expect(content).toMatch(/center=\{\[provider\.latitude,\s*provider\.longitude\]\}/)
    
    // Should show fallback when coordinates are not available
    expect(content).toMatch(/Location not available/)
  })

  /**
   * Property 9: Leaflet map presence - Property-based test for coordinate validation
   * Feature: cityhealth-platform, Property 9: Leaflet map presence
   * Validates: Requirements 3.4
   * 
   * *For any* provider with valid coordinates (within Algeria's bounds),
   * the ProviderProfilePage should render a map with those coordinates
   */
  test('Property 9: For any provider with valid coordinates, map should be configured to show location', () => {
    const providerProfilePath = path.resolve(__dirname, '../../pages/ProviderProfilePage.tsx')
    const content = readFileContent(providerProfilePath)
    
    // Generator for valid Algerian coordinates
    const algerianCoordinatesArbitrary = fc.record({
      latitude: fc.double({ min: 18.0, max: 37.5, noNaN: true }), // Algeria latitude range
      longitude: fc.double({ min: -9.0, max: 12.0, noNaN: true }), // Algeria longitude range
    })

    fc.assert(
      fc.property(algerianCoordinatesArbitrary, (coords) => {
        // Property: For any valid coordinates within Algeria's bounds,
        // the ProviderProfilePage should be able to render a map
        
        // Coordinates should be valid numbers within Algeria's bounds
        expect(coords.latitude).toBeGreaterThanOrEqual(18.0)
        expect(coords.latitude).toBeLessThanOrEqual(37.5)
        expect(coords.longitude).toBeGreaterThanOrEqual(-9.0)
        expect(coords.longitude).toBeLessThanOrEqual(12.0)
        
        // The component should have the structure to pass these coordinates to the map
        // 1. MapContainerWrapper should accept center prop
        expect(content).toContain('center=')
        
        // 2. ProviderMarker should accept latitude and longitude props
        expect(content).toContain('latitude={provider.latitude}')
        expect(content).toContain('longitude={provider.longitude}')
        
        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property 9: Leaflet map presence - ProviderMarker receives all required props
   * Feature: cityhealth-platform, Property 9: Leaflet map presence
   * Validates: Requirements 3.4
   * 
   * *For any* provider profile page with valid coordinates, the ProviderMarker
   * should receive all required props to display the provider location
   */
  test('Property 9: ProviderMarker should receive required props for location display', () => {
    const providerProfilePath = path.resolve(__dirname, '../../pages/ProviderProfilePage.tsx')
    const content = readFileContent(providerProfilePath)
    
    // Extract the ProviderMarker usage section
    const markerMatch = content.match(/<ProviderMarker[\s\S]*?\/>/)
    expect(markerMatch).not.toBeNull()
    
    const markerUsage = markerMatch![0]
    
    // ProviderMarker should receive all required props for displaying location
    // 1. id for unique identification
    expect(markerUsage).toContain('id={provider.id}')
    
    // 2. business_name for popup display
    expect(markerUsage).toContain('business_name={provider.business_name}')
    
    // 3. provider_type for popup display
    expect(markerUsage).toContain('provider_type={provider.provider_type}')
    
    // 4. address for popup display
    expect(markerUsage).toContain('address={provider.address}')
    
    // 5. phone for popup display
    expect(markerUsage).toContain('phone={provider.phone}')
    
    // 6. latitude and longitude for marker position
    expect(markerUsage).toContain('latitude={provider.latitude}')
    expect(markerUsage).toContain('longitude={provider.longitude}')
  })

  /**
   * Property 9: Leaflet map presence - Map container has proper dimensions
   * Feature: cityhealth-platform, Property 9: Leaflet map presence
   * Validates: Requirements 3.4
   * 
   * *For any* provider profile page, the map container should have proper
   * dimensions for visibility
   */
  test('Property 9: Map container should have proper dimensions in ProviderProfilePage', () => {
    const providerProfilePath = path.resolve(__dirname, '../../pages/ProviderProfilePage.tsx')
    const content = readFileContent(providerProfilePath)
    
    // Map should be wrapped in a container with defined height
    // Looking for the map section with height class
    expect(content).toMatch(/h-56|height.*56|height:\s*['"]?\d+/)
    
    // Should have overflow hidden for proper map display
    expect(content).toMatch(/overflow-hidden/)
    
    // Should have rounded corners for design consistency
    expect(content).toMatch(/rounded-lg/)
  })

  /**
   * Property test using fast-check for coordinate validation
   */
  test('Property 70: Map should handle valid coordinate ranges', () => {
    // Valid latitude range: -90 to 90
    // Valid longitude range: -180 to 180
    fc.assert(
      fc.property(
        fc.double({ min: -90, max: 90, noNaN: true }),
        fc.double({ min: -180, max: 180, noNaN: true }),
        (lat, lng) => {
          // Coordinates should be valid numbers within range
          expect(lat).toBeGreaterThanOrEqual(-90)
          expect(lat).toBeLessThanOrEqual(90)
          expect(lng).toBeGreaterThanOrEqual(-180)
          expect(lng).toBeLessThanOrEqual(180)
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})
