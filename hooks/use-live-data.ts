"use client"

import { useState, useEffect, useCallback } from "react"
import { useLocation } from "@/contexts/location-context"
import {
  fetchWeatherData,
  fetchAirQualityData,
  fetchTrafficData,
  fetchCityMoodData,
  type WeatherData,
  type AirQualityData,
  type TrafficData,
  type CityMoodData,
} from "@/lib/google-services"

export interface LiveData {
  weather: WeatherData | null
  airQuality: AirQualityData | null
  traffic: TrafficData | null
  cityMood: CityMoodData | null
  isLoading: boolean
  lastUpdated: Date | null
}

export function useLiveData() {
  const { coords, district, city } = useLocation()
  const [data, setData] = useState<LiveData>({
    weather: null,
    airQuality: null,
    traffic: null,
    cityMood: null,
    isLoading: true,
    lastUpdated: null,
  })

  const fetchAllData = useCallback(async () => {
    if (!coords) return

    setData((prev) => ({ ...prev, isLoading: true }))

    try {
      // Fetch all data using Google services
      const [weather, airQuality, traffic, cityMood] = await Promise.all([
        fetchWeatherData(coords.lat, coords.lng),
        fetchAirQualityData(coords.lat, coords.lng),
        fetchTrafficData(coords.lat, coords.lng),
        fetchCityMoodData(district, city, coords),
      ])

      setData({
        weather,
        airQuality,
        traffic,
        cityMood,
        isLoading: false,
        lastUpdated: new Date(),
      })
    } catch (error) {
      console.error("Failed to fetch live data:", error)
      setData((prev) => ({ ...prev, isLoading: false }))
    }
  }, [coords, district, city])

  // Listen for location changes
  useEffect(() => {
    const handleLocationChange = () => {
      console.log("Location changed, refreshing data...")
      fetchAllData()
    }

    window.addEventListener("locationChanged", handleLocationChange)
    return () => window.removeEventListener("locationChanged", handleLocationChange)
  }, [fetchAllData])

  // Initial data fetch and periodic refresh
  useEffect(() => {
    fetchAllData()

    // Refresh data every 2 minutes (more frequent since we're using Google APIs)
    const interval = setInterval(fetchAllData, 120000)
    return () => clearInterval(interval)
  }, [fetchAllData])

  return { ...data, refresh: fetchAllData }
}
