import { config } from "./config"

// Types
export interface WeatherData {
  temperature: number
  description: string
  humidity: number
  windSpeed: number
}

export interface AirQualityData {
  aqi: number
  level: string
  pm25: number
  pm10: number
}

export interface TrafficData {
  status: string
  avgSpeed: number
  congestionLevel: number
}

export interface CityMoodData {
  mood: string
  score: number
  trending: string
}

// Error handling utility
class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public service?: string,
  ) {
    super(message)
    this.name = "APIError"
  }
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

// OpenWeatherMap API with enhanced error handling and rate limiting
export async function fetchWeatherData(lat: number, lng: number): Promise<WeatherData> {
  const cacheKey = `weather_${lat}_${lng}`
  const cached = cache.get(cacheKey)
  if (cached) return cached

  const API_KEY = config.apis.openWeather.key

  if (!API_KEY) {
    console.warn("OpenWeather API key not configured, using fallback data")
    return getFallbackWeatherData(lat, lng)
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(
      `${config.endpoints.weather}/weather?lat=${lat}&lon=${lng}&appid=${API_KEY}&units=metric`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "XphoraPulse/1.0",
        },
        signal: controller.signal,
        // Remove Next.js caching to avoid conflicts
      },
    )

    clearTimeout(timeoutId)

    if (response.status === 429) {
      console.warn("Weather API rate limit exceeded, using fallback data")
      const fallbackData = getFallbackWeatherData(lat, lng)
      // Cache fallback data for shorter duration during rate limiting
      cache.set(cacheKey, fallbackData, 60000) // 1 minute cache
      return fallbackData
    }

    if (response.status === 401) {
      console.error("Weather API authentication failed - invalid API key")
      return getFallbackWeatherData(lat, lng)
    }

    if (!response.ok) {
      throw new APIError(`Weather API failed: ${response.status}`, response.status, "openweather")
    }

    const data = await response.json()

    if (!data.main || !data.weather || !data.weather[0]) {
      throw new Error("Invalid weather data structure")
    }

    const weatherData: WeatherData = {
      temperature: Math.round(data.main.temp),
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: Math.round((data.wind?.speed || 0) * 10) / 10,
    }

    cache.set(cacheKey, weatherData, config.cache.weatherTTL)
    return weatherData
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.error("Weather API request timeout")
    } else {
      console.error("Weather API error:", error)
    }

    const fallbackData = getFallbackWeatherData(lat, lng)
    // Cache fallback data briefly to avoid repeated failed requests
    cache.set(cacheKey, fallbackData, 30000) // 30 seconds cache for errors
    return fallbackData
  }
}

// OpenWeatherMap Air Pollution API with enhanced error handling
export async function fetchAirQualityData(lat: number, lng: number): Promise<AirQualityData> {
  const cacheKey = `air_${lat}_${lng}`
  const cached = cache.get(cacheKey)
  if (cached) return cached

  const API_KEY = config.apis.openWeather.key

  if (!API_KEY) {
    console.warn("OpenWeather API key not configured, using fallback data")
    return getFallbackAirQualityData(lat, lng)
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(`${config.endpoints.weather}/air_pollution?lat=${lat}&lon=${lng}&appid=${API_KEY}`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "XphoraPulse/1.0",
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (response.status === 429) {
      console.warn("Air Quality API rate limit exceeded, using fallback data")
      const fallbackData = getFallbackAirQualityData(lat, lng)
      cache.set(cacheKey, fallbackData, 60000) // 1 minute cache
      return fallbackData
    }

    if (response.status === 401) {
      console.error("Air Quality API authentication failed - invalid API key")
      return getFallbackAirQualityData(lat, lng)
    }

    if (!response.ok) {
      throw new APIError(`Air Quality API failed: ${response.status}`, response.status, "openweather")
    }

    const data = await response.json()

    if (!data.list || !data.list[0] || !data.list[0].main) {
      throw new Error("Invalid air quality data structure")
    }

    const aqi = data.list[0].main.aqi
    const components = data.list[0].components

    const getAQILevel = (aqi: number) => {
      switch (aqi) {
        case 1:
          return "Good"
        case 2:
          return "Fair"
        case 3:
          return "Moderate"
        case 4:
          return "Poor"
        case 5:
          return "Very Poor"
        default:
          return "Unknown"
      }
    }

    const airQualityData: AirQualityData = {
      aqi: aqi * 20, // Convert to 0-100 scale
      level: getAQILevel(aqi),
      pm25: Math.round(components?.pm2_5 || 0),
      pm10: Math.round(components?.pm10 || 0),
    }

    cache.set(cacheKey, airQualityData, config.cache.weatherTTL)
    return airQualityData
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.error("Air Quality API request timeout")
    } else {
      console.error("Air Quality API error:", error)
    }

    const fallbackData = getFallbackAirQualityData(lat, lng)
    cache.set(cacheKey, fallbackData, 30000) // 30 seconds cache for errors
    return fallbackData
  }
}

// Location-aware traffic data (mock implementation)
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
  }

  cache.set(cacheKey, trafficData, config.cache.trafficTTL)
  return trafficData
}

// Location-aware city mood data
export async function fetchCityMoodData(district?: string | null, city?: string | null): Promise<CityMoodData> {
  const cacheKey = `mood_${district}_${city}`
  const cached = cache.get(cacheKey)
  if (cached) return cached

  await new Promise((resolve) => setTimeout(resolve, 200))

  const moods = ["Positive", "Neutral", "Concerned", "Excited", "Calm"]
  const trends = ["Trending up", "Stable", "Declining", "Improving", "Mixed signals"]

  const locationSeed = district ? district.length + (city?.length || 0) : Math.random() * 100
  const moodIndex = Math.floor(locationSeed % moods.length)
  const trendIndex = Math.floor((locationSeed * 1.5) % trends.length)

  const cityMoodData: CityMoodData = {
    mood: moods[moodIndex],
    score: Math.round(50 + (locationSeed % 40)),
    trending: trends[trendIndex],
  }

  cache.set(cacheKey, cityMoodData, config.cache.weatherTTL)
  return cityMoodData
}

// Fallback data functions
function getFallbackWeatherData(lat: number, lng: number): WeatherData {
  const locationVariation = Math.sin(lat * lng) * 5
  return {
    temperature: Math.round(28 + locationVariation),
    description: "partly cloudy",
    humidity: Math.round(65 + locationVariation),
    windSpeed: Math.round((3.2 + locationVariation) * 10) / 10,
  }
}

function getFallbackAirQualityData(lat: number, lng: number): AirQualityData {
  const locationVariation = Math.abs(Math.sin(lat * lng)) * 30
  const baseAqi = 78 + locationVariation
  return {
    aqi: Math.round(Math.min(100, baseAqi)),
    level: baseAqi < 50 ? "Good" : baseAqi < 80 ? "Moderate" : "Poor",
    pm25: Math.round(35 + locationVariation * 0.5),
    pm10: Math.round(45 + locationVariation * 0.7),
  }
}

// Utility to clear all caches
export function clearAPICache() {
  cache.clear()
}

// Rate limiting utility
class RateLimiter {
  private requests: Map<string, number[]> = new Map()
  private maxRequests: number
  private windowMs: number

  constructor(maxRequests = 60, windowMs = 60000) {
    // 60 requests per minute
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  canMakeRequest(key: string): boolean {
    const now = Date.now()
    const requests = this.requests.get(key) || []

    // Remove old requests outside the window
    const validRequests = requests.filter((time) => now - time < this.windowMs)

    if (validRequests.length >= this.maxRequests) {
      return false
    }

    // Add current request
    validRequests.push(now)
    this.requests.set(key, validRequests)
    return true
  }

  getWaitTime(key: string): number {
    const requests = this.requests.get(key) || []
    if (requests.length === 0) return 0

    const oldestRequest = Math.min(...requests)
    const waitTime = this.windowMs - (Date.now() - oldestRequest)
    return Math.max(0, waitTime)
  }
}

export const weatherRateLimiter = new RateLimiter(60, 60000) // 60 requests per minute
