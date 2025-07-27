// lib/google-maps-sdk.ts - COMPLETE REPLACEMENT
declare global {
  interface Window {
    google: typeof google
    initMap?: () => void
  }
}

interface LoaderOptions {
  apiKey: string
  version?: string
  libraries?: string[]
  language?: string
  region?: string
}

class GoogleMapsLoader {
  private static instance: GoogleMapsLoader
  private loaded = false
  private loading = false
  private loadPromise: Promise<typeof google.maps> | null = null
  private options: LoaderOptions | null = null

  private constructor() {}

  static getInstance(): GoogleMapsLoader {
    if (!GoogleMapsLoader.instance) {
      GoogleMapsLoader.instance = new GoogleMapsLoader()
    }
    return GoogleMapsLoader.instance
  }

  async load(options: LoaderOptions): Promise<typeof google.maps> {
    // If already loaded, return immediately
    if (this.loaded && window.google?.maps) {
      return window.google.maps
    }

    // If currently loading, return the existing promise
    if (this.loading && this.loadPromise) {
      return this.loadPromise
    }

    // Store options for potential retries
    this.options = options

    // Start loading
    this.loading = true
    this.loadPromise = this.loadScript(options)

    try {
      const maps = await this.loadPromise
      this.loaded = true
      this.loading = false
      return maps
    } catch (error) {
      this.loading = false
      this.loadPromise = null
      throw error
    }
  }

  private async loadScript(options: LoaderOptions): Promise<typeof google.maps> {
    return new Promise((resolve, reject) => {
      // Check if script already exists
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
      
      if (existingScript) {
        if (window.google?.maps) {
          resolve(window.google.maps)
          return
        }
        
        // Wait for existing script to complete
        existingScript.addEventListener('load', () => {
          if (window.google?.maps) {
            resolve(window.google.maps)
          } else {
            reject(new Error('Google Maps API loaded but not available'))
          }
        })
        
        existingScript.addEventListener('error', () => {
          reject(new Error('Failed to load existing Google Maps script'))
        })
        return
      }

      // Create new script element
      const script = document.createElement('script')
      const params = new URLSearchParams({
        key: options.apiKey,
        v: options.version || 'weekly',
        libraries: (options.libraries || ['places', 'geometry']).join(','),
        ...(options.language && { language: options.language }),
        ...(options.region && { region: options.region })
      })

      script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`
      script.async = true
      script.defer = true

      script.onload = () => {
        if (window.google?.maps) {
          resolve(window.google.maps)
        } else {
          reject(new Error('Google Maps API loaded but not available'))
        }
      }

      script.onerror = () => {
        reject(new Error('Failed to load Google Maps script'))
      }

      document.head.appendChild(script)
    })
  }

  // Force reload the script (useful for error recovery)
  async reload(): Promise<typeof google.maps> {
    // Remove existing script
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      existingScript.remove()
    }

    // Reset state
    this.loaded = false
    this.loading = false
    this.loadPromise = null

    // Reload with last used options
    if (!this.options) {
      throw new Error('No loader options available for reload')
    }

    return this.load(this.options)
  }

  isLoaded(): boolean {
    return this.loaded && !!window.google?.maps
  }

  isLoading(): boolean {
    return this.loading
  }
}

// Main initialization function
export async function initializeGoogleMaps(): Promise<typeof google.maps> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  
  if (!apiKey) {
    throw new Error('Google Maps API key not configured')
  }

  const loader = GoogleMapsLoader.getInstance()
  
  try {
    return await loader.load({
      apiKey,
      version: 'weekly',
      libraries: ['places', 'geometry', 'marker']
    })
  } catch (error) {
    console.error('Failed to initialize Google Maps:', error)
    throw error
  }
}

// Enhanced Services Classes
export class PlacesService {
  private service: google.maps.places.PlacesService | null = null
  private map: google.maps.Map | null = null

  async initialize(): Promise<void> {
    await initializeGoogleMaps()
    
    // Create a hidden div for the service
    const div = document.createElement('div')
    div.style.display = 'none'
    document.body.appendChild(div)
    
    this.map = new google.maps.Map(div)
    this.service = new google.maps.places.PlacesService(this.map)
  }

  async nearbySearch(
    location: google.maps.LatLng, 
    radius: number, 
    type?: string
  ): Promise<google.maps.places.PlaceResult[]> {
    if (!this.service) {
      throw new Error('PlacesService not initialized')
    }

    return new Promise((resolve, reject) => {
      const request: google.maps.places.PlaceSearchRequest = {
        location,
        radius,
        ...(type && { type: type as any })
      }

      this.service!.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          resolve(results)
        } else {
          reject(new Error(`Places API error: ${status}`))
        }
      })
    })
  }

  async textSearch(query: string): Promise<google.maps.places.PlaceResult[]> {
    if (!this.service) {
      throw new Error('PlacesService not initialized')
    }

    return new Promise((resolve, reject) => {
      const request: google.maps.places.TextSearchRequest = {
        query
      }

      this.service!.textSearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          resolve(results)
        } else {
          reject(new Error(`Places API error: ${status}`))
        }
      })
    })
  }
}

export class DirectionsService {
  private service: google.maps.DirectionsService | null = null

  async initialize(): Promise<void> {
    await initializeGoogleMaps()
    this.service = new google.maps.DirectionsService()
  }

  async getDirections(
    origin: google.maps.LatLng | string,
    destination: google.maps.LatLng | string,
    travelMode: google.maps.TravelMode = google.maps.TravelMode.DRIVING
  ): Promise<google.maps.DirectionsResult> {
    if (!this.service) {
      throw new Error('DirectionsService not initialized')
    }

    return new Promise((resolve, reject) => {
      const request: google.maps.DirectionsRequest = {
        origin,
        destination,
        travelMode
      }

      this.service!.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          resolve(result)
        } else {
          reject(new Error(`Directions API error: ${status}`))
        }
      })
    })
  }
}

export class GeocodingService {
  private service: google.maps.Geocoder | null = null

  async initialize(): Promise<void> {
    await initializeGoogleMaps()
    this.service = new google.maps.Geocoder()
  }

  async reverseGeocode(location: google.maps.LatLng): Promise<google.maps.GeocoderResult[]> {
    if (!this.service) {
      throw new Error('GeocodingService not initialized')
    }

    return new Promise((resolve, reject) => {
      const request: google.maps.GeocoderRequest = {
        location
      }

      this.service!.geocode(request, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results) {
          resolve(results)
        } else {
          reject(new Error(`Geocoding API error: ${status}`))
        }
      })
    })
  }

  async geocode(address: string): Promise<google.maps.GeocoderResult[]> {
    if (!this.service) {
      throw new Error('GeocodingService not initialized')
    }

    return new Promise((resolve, reject) => {
      const request: google.maps.GeocoderRequest = {
        address
      }

      this.service!.geocode(request, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results) {
          resolve(results)
        } else {
          reject(new Error(`Geocoding API error: ${status}`))
        }
      })
    })
  }
}

// Utility function to get the loader instance
export function getGoogleMapsLoader(): GoogleMapsLoader {
  return GoogleMapsLoader.getInstance()
}

// Export the main loader for manual control
export { GoogleMapsLoader }