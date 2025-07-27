// lib/google-services.ts - COMPLETE REPLACEMENT
import { config } from "./config"

// Types for Google APIs
export interface WeatherData {
  temperature: number
  description: string
  humidity: number
  windSpeed: number
  condition: string
}

export interface AirQualityData {
  aqi: number
  level: string
  pm25: number
  pm10: number
  pollutants: string[]
}

export interface TrafficData {
  status: string
  avgSpeed: number
  congestionLevel: number
  duration: string
  distance: string
}

export interface CityMoodData {
  mood: string
  score: number
  trending: string
}

export interface PlaceDetails {
  name: string
  rating: number
  types: string[]
  vicinity: string
  businessStatus: string
}

// Cache utility
class SimpleCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  set(key: string, data: any, ttl: number) {
    this.cache.set(key, { data, timestamp: Date.now(), ttl })
  }

  get(key: string) {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  clear() {
    this.cache.clear()
  }
}

const cache = new SimpleCache()

// Helper function to check if Google Maps is loaded
function isGoogleMapsLoaded(): boolean {
  return !!(window.google && window.google.maps && window.google.maps.places)
}

// Helper function to wait for Google Maps to load
function waitForGoogleMaps(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (isGoogleMapsLoaded()) {
      resolve()
      return
    }

    let attempts = 0
    const maxAttempts = 50 // 5 seconds max wait

    const checkInterval = setInterval(() => {
      attempts++
      if (isGoogleMapsLoaded()) {
        clearInterval(checkInterval)
        resolve()
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval)
        reject(new Error('Google Maps failed to load'))
      }
    }, 100)
  })
}

// Fallback data functions
function getFallbackPlaces(): PlaceDetails[] {
  return [
    {
      name: "Local Restaurant",
      rating: 4.2,
      types: ["restaurant", "food", "establishment"],
      vicinity: "Near you",
      businessStatus: "OPERATIONAL",
    },
    {
      name: "Gas Station",
      rating: 3.8,
      types: ["gas_station", "establishment"],
      vicinity: "Main Road",
      businessStatus: "OPERATIONAL",
    },
    {
      name: "Shopping Mall",
      rating: 4.5,
      types: ["shopping_mall", "establishment"],
      vicinity: "City Center",
      businessStatus: "OPERATIONAL",
    },
  ]
}

function getFallbackAirQualityData(lat: number, lng: number): AirQualityData {
  const locationVariation = Math.abs(Math.sin(lat * lng)) * 20
  const baseAqi = Math.round(60 + locationVariation)
  
  return {
    aqi: baseAqi,
    level: baseAqi < 50 ? "Good" : baseAqi < 80 ? "Moderate" : "Poor",
    pm25: Math.round(35 + locationVariation * 0.5),
    pm10: Math.round(45 + locationVariation * 0.7),
    pollutants: ["PM2.5", "PM10"]
  }
}

function getLocationBasedWeather(lat: number, lng: number): WeatherData {
  const hour = new Date().getHours()
  const locationVariation = Math.abs(Math.sin(lat * lng)) * 10
  
  let baseTemp = 25 + locationVariation
  
  // Time-based temperature adjustment
  if (hour >= 6 && hour <= 18) {
    baseTemp += Math.sin((hour - 6) * Math.PI / 12) * 8
  } else {
    baseTemp -= 5
  }

  const conditions = ["Clear", "Partly Cloudy", "Cloudy", "Light Rain"]
  const condition = conditions[Math.floor(Math.abs(Math.sin(lat + lng)) * conditions.length)]

  return {
    temperature: Math.round(baseTemp),
    description: condition,
    humidity: Math.round(60 + locationVariation),
    windSpeed: Math.round(5 + locationVariation * 0.5),
    condition: condition
  }
}

// Updated fetchNearbyPlaces function with proper error handling
export async function fetchNearbyPlaces(lat: number, lng: number, type = "establishment"): Promise<PlaceDetails[]> {
  const cacheKey = `places_${lat}_${lng}_${type}`
  const cached = cache.get(cacheKey)
  if (cached) return cached

  const API_KEY = config.apis.googleMaps.key

  if (!API_KEY) {
    console.warn("Google Maps API key not configured, using fallback data")
    return getFallbackPlaces()
  }

  try {
    // Wait for Google Maps to be available
    await waitForGoogleMaps()

    // Create a minimal map for the PlacesService
    const mapDiv = document.createElement('div')
    mapDiv.style.display = 'none'
    document.body.appendChild(mapDiv)
    
    const map = new google.maps.Map(mapDiv, {
      center: { lat, lng },
      zoom: 13
    })

    const service = new google.maps.places.PlacesService(map)
    const location = new google.maps.LatLng(lat, lng)

    const results = await new Promise<google.maps.places.PlaceResult[]>((resolve, reject) => {
      const request: google.maps.places.PlaceSearchRequest = {
        location,
        radius: 1000,
        type: type as any
      }

      service.nearbySearch(request, (results, status) => {
        // Clean up the temporary map
        document.body.removeChild(mapDiv)
        
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          resolve(results)
        } else {
          reject(new Error(`Places API error: ${status}`))
        }
      })
    })

    const places: PlaceDetails[] = results.slice(0, 10).map((place) => ({
      name: place.name || "Unknown Place",
      rating: place.rating || 0,
      types: place.types || [],
      vicinity: place.vicinity || "",
      businessStatus: place.business_status || "OPERATIONAL",
    }))

    cache.set(cacheKey, places, config.cache.weatherTTL)
    return places
  } catch (error) {
    console.error("Places API error:", error)
    return getFallbackPlaces()
  }
}

// Updated fetchLocationDetails function
export async function fetchLocationDetails(lat: number, lng: number): Promise<any> {
  const cacheKey = `location_${lat}_${lng}`
  const cached = cache.get(cacheKey)
  if (cached) return cached

  const API_KEY = config.apis.googleMaps.key

  if (!API_KEY) {
    console.warn("Google Maps API key not configured")
    return null
  }

  try {
    await waitForGoogleMaps()

    const geocoder = new google.maps.Geocoder()
    const location = new google.maps.LatLng(lat, lng)

    const results = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
      geocoder.geocode({ location }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results) {
          resolve(results)
        } else {
          reject(new Error(`Geocoding API error: ${status}`))
        }
      })
    })

    const data = { results }
    cache.set(cacheKey, data, config.cache.locationTTL)
    return data
  } catch (error) {
    console.error("Geocoding API error:", error)
    return null
  }
}

// Weather data function (location-based simulation)
export async function fetchWeatherData(lat: number, lng: number): Promise<WeatherData> {
  const cacheKey = `weather_${lat}_${lng}`
  const cached = cache.get(cacheKey)
  if (cached) return cached

  // Use location and time-based simulation for realistic weather
  const weatherData = getLocationBasedWeather(lat, lng)
  cache.set(cacheKey, weatherData, config.cache.weatherTTL)
  return weatherData
}

// Air quality data function
export async function fetchAirQualityData(lat: number, lng: number): Promise<AirQualityData> {
  const cacheKey = `air_${lat}_${lng}`
  const cached = cache.get(cacheKey)
  if (cached) return cached

  try {
    // Get nearby places to estimate air quality
    const places = await fetchNearbyPlaces(lat, lng, "establishment")
    const industrialPlaces = places.filter((p) =>
      p.types.some(
        (type) => type.includes("gas_station") || type.includes("car_repair") || type.includes("bus_station"),
      ),
    )

    // Base AQI calculation on location and nearby industrial activity
    let baseAqi = 60 + Math.abs(Math.sin(lat * lng)) * 30

    // Adjust based on industrial activity
    baseAqi += industrialPlaces.length * 5

    // Time-based adjustment (worse during peak hours)
    const hour = new Date().getHours()
    if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19)) {
      baseAqi += 15
    }

    const aqi = Math.round(Math.min(150, Math.max(20, baseAqi)))

    const getAQILevel = (aqi: number) => {
      if (aqi <= 50) return "Good"
      if (aqi <= 100) return "Moderate"
      if (aqi <= 150) return "Unhealthy for Sensitive Groups"
      return "Unhealthy"
    }

    const airQualityData: AirQualityData = {
      aqi,
      level: getAQILevel(aqi),
      pm25: Math.round(aqi * 0.4),
      pm10: Math.round(aqi * 0.6),
      pollutants: industrialPlaces.length > 2 ? ["NO2", "PM2.5", "PM10"] : ["PM2.5", "PM10"],
    }

    cache.set(cacheKey, airQualityData, config.cache.weatherTTL)
    return airQualityData
  } catch (error) {
    console.error("Air Quality estimation error:", error)
    return getFallbackAirQualityData(lat, lng)
  }
}

// Traffic data function
export async function fetchTrafficData(lat: number, lng: number): Promise<TrafficData> {
  const cacheKey = `traffic_${lat}_${lng}`
  const cached = cache.get(cacheKey)
  if (cached) return cached

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  const hour = new Date().getHours()
  let baseCongestion = 0.3

  // Peak hours adjustment
  if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19)) {
    baseCongestion = 0.8
  } else if ((hour >= 11 && hour <= 16) || (hour >= 20 && hour <= 22)) {
    baseCongestion = 0.5
  }

  // Location-based adjustment
  const locationFactor = Math.abs(Math.sin(lat * lng)) * 0.3
  const congestionLevel = Math.min(1, baseCongestion + locationFactor)
  const avgSpeed = Math.round(50 - congestionLevel * 30)

  const getStatus = (level: number) => {
    if (level < 0.3) return "Light"
    if (level < 0.6) return "Moderate"
    return "Heavy"
  }

  const trafficData: TrafficData = {
    status: getStatus(congestionLevel),
    avgSpeed,
    congestionLevel,
    duration: `${Math.round(15 + congestionLevel * 10)} min`,
    distance: `${Math.round(5 + Math.random() * 10)} km`
  }

  cache.set(cacheKey, trafficData, config.cache.trafficTTL)
  return trafficData
}

// City mood data function
export async function fetchCityMoodData(
  district?: string | null,
  city?: string | null,
  coords?: { lat: number; lng: number } | null
): Promise<CityMoodData> {
  const cacheKey = `mood_${district}_${city}`
  const cached = cache.get(cacheKey)
  if (cached) return cached

  await new Promise((resolve) => setTimeout(resolve, 200))

  const moods = ["Positive", "Neutral", "Concerned", "Excited", "Calm"]
  const trends = ["up", "stable", "down", "improving", "mixed"]

  const locationSeed = district ? district.charCodeAt(0) + (city?.charCodeAt(0) || 0) : Math.random() * 100
  const moodIndex = Math.floor(locationSeed) % moods.length
  const trendIndex = Math.floor(locationSeed * 1.5) % trends.length

  const score = Math.round(60 + (locationSeed % 40))

  const cityMoodData: CityMoodData = {
    mood: moods[moodIndex],
    score,
    trending: trends[trendIndex]
  }

  cache.set(cacheKey, cityMoodData, config.cache.weatherTTL)
  return cityMoodData
}

// Utility to clear all caches
export function clearAPICache() {
  cache.clear()
}