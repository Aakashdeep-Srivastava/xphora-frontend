"use client"

import { createContext, useContext, useState, type ReactNode, useCallback, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { fetchLocationDetails } from "@/lib/google-services"

interface LocationState {
  district: string | null
  city: string | null
  country: string | null
  coords: { lat: number; lng: number } | null
  error: string | null
  isLoading: boolean
  requestLocation: () => void
  setManualLocation: (details: {
    lat: number
    lng: number
    district: string
    city: string
    country: string
  }) => void
  refreshLocationData: () => void
}

const LocationContext = createContext<LocationState | undefined>(undefined)

export function LocationProvider({ children }: { children: ReactNode }) {
  const [district, setDistrict] = useState<string | null>(null)
  const [city, setCity] = useState<string | null>(null)
  const [country, setCountry] = useState<string | null>(null)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const fetchCityName = useCallback(
    async (lat: number, lng: number) => {
      setIsLoading(true)
      try {
        const data = await fetchLocationDetails(lat, lng)

        if (data && data.results && data.results.length > 0) {
          const result = data.results[0]
          const addressComponents = result.address_components

          let newDistrict = "Current Location"
          let newCity = "Unknown City"
          let newCountry = "Unknown Country"

          // Parse address components
          for (const component of addressComponents) {
            const types = component.types

            if (types.includes("sublocality_level_1") || types.includes("neighborhood")) {
              newDistrict = component.long_name
            } else if (types.includes("locality")) {
              newCity = component.long_name
            } else if (types.includes("administrative_area_level_2") && newCity === "Unknown City") {
              newCity = component.long_name
            } else if (types.includes("country")) {
              newCountry = component.long_name
            }
          }

          setDistrict(newDistrict)
          setCity(newCity)
          setCountry(newCountry)
          setCoords({ lat, lng })
          setError(null)

          // Trigger a custom event to notify other components about location change
          window.dispatchEvent(
            new CustomEvent("locationChanged", {
              detail: { lat, lng, district: newDistrict, city: newCity, country: newCountry },
            }),
          )

          toast({
            title: "Location Updated",
            description: `Now showing data for ${newDistrict}, ${newCity}`,
          })
        } else {
          throw new Error("No location data found")
        }
      } catch (e) {
        console.error("Google Geocoding failed", e)
        setError("Could not determine city name.")
        toast({
          title: "Location Error",
          description: "Could not determine location details.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  const requestLocation = useCallback(() => {
    setIsLoading(true)
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.")
      setIsLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        fetchCityName(latitude, longitude)
      },
      () => {
        setError("Unable to retrieve your location.")
        setIsLoading(false)
        toast({
          title: "Location Access Denied",
          description: "Please enable location services to get city-specific data.",
          variant: "destructive",
        })
      },
    )
  }, [fetchCityName, toast])

  const setManualLocation = useCallback(
    (details: {
      lat: number
      lng: number
      district: string
      city: string
      country: string
    }) => {
      setIsLoading(true)
      setCoords({ lat: details.lat, lng: details.lng })
      setDistrict(details.district)
      setCity(details.city)
      setCountry(details.country)
      setError(null)

      // Trigger location change event
      window.dispatchEvent(
        new CustomEvent("locationChanged", {
          detail: details,
        }),
      )

      toast({
        title: "Location Changed",
        description: `Now showing data for ${details.district}, ${details.city}`,
      })

      // Simulate loading for smooth UX
      setTimeout(() => setIsLoading(false), 500)
    },
    [toast],
  )

  const refreshLocationData = useCallback(() => {
    if (coords) {
      fetchCityName(coords.lat, coords.lng)
    }
  }, [coords, fetchCityName])

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem("hasCompletedOnboarding")
    if (hasCompletedOnboarding) {
      requestLocation()
    } else {
      setIsLoading(false)
    }
  }, [requestLocation])

  return (
    <LocationContext.Provider
      value={{
        district,
        city,
        country,
        coords,
        error,
        isLoading,
        requestLocation,
        setManualLocation,
        refreshLocationData,
      }}
    >
      {children}
    </LocationContext.Provider>
  )
}

export const useLocation = () => {
  const context = useContext(LocationContext)
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider")
  }
  return context
}
