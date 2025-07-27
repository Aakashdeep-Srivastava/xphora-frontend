"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useLocation } from "@/contexts/location-context"
import { Search, MapPin, Loader2, Navigation } from "lucide-react"
import type { google } from "google-maps"

interface LocationEditModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LocationEditModal({ isOpen, onClose }: LocationEditModalProps) {
  const { requestLocation, setManualLocation } = useLocation()
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([])
  const [autocompleteService, setAutocompleteService] = useState<google.maps.places.AutocompleteService | null>(null)
  const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      setAutocompleteService(new window.google.maps.places.AutocompleteService())
      setPlacesService(new window.google.maps.places.PlacesService(document.createElement("div")))
    }
  }, [isOpen])

  const fetchSuggestions = useCallback(() => {
    if (!autocompleteService || !query) {
      setSuggestions([])
      return
    }
    autocompleteService.getPlacePredictions(
      { input: query, componentRestrictions: { country: "in" } }, // Restrict to India for relevance
      (predictions, status) => {
        if (status === "OK" && predictions) {
          setSuggestions(predictions)
        } else {
          setSuggestions([])
        }
      },
    )
  }, [autocompleteService, query])

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchSuggestions()
    }, 300) // Debounce requests
    return () => clearTimeout(handler)
  }, [query, fetchSuggestions])

  const handleSelectSuggestion = (placeId: string) => {
    if (!placesService) return
    setIsLoading(true)
    placesService.getDetails({ placeId, fields: ["geometry", "address_components"] }, (place, status) => {
      if (status === "OK" && place?.geometry?.location && place.address_components) {
        const lat = place.geometry.location.lat()
        const lng = place.geometry.location.lng()

        const getAddressComponent = (type: string) =>
          place.address_components?.find((c) => c.types.includes(type))?.long_name || ""

        const district =
          getAddressComponent("sublocality_level_1") ||
          getAddressComponent("locality") ||
          getAddressComponent("administrative_area_level_2") ||
          "Selected Location"
        const city =
          getAddressComponent("locality") || getAddressComponent("administrative_area_level_2") || "Unknown City"
        const country = getAddressComponent("country") || "Unknown Country"

        setManualLocation({ lat, lng, district, city, country })
        setQuery("")
        setSuggestions([])
        onClose()
      }
      setIsLoading(false)
    })
  }

  const handleUseCurrentLocation = () => {
    requestLocation()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Location</DialogTitle>
          <DialogDescription>
            Search for a new area or use your current location. All data will update automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for a city or neighborhood..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">Updating location data...</span>
            </div>
          ) : (
            suggestions.map((suggestion) => (
              <button
                key={suggestion.place_id}
                onClick={() => handleSelectSuggestion(suggestion.place_id)}
                className="w-full text-left p-2 rounded-md hover:bg-accent flex items-start gap-3 transition-colors"
              >
                <MapPin className="h-4 w-4 mt-1 flex-shrink-0 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">{suggestion.structured_formatting.main_text}</p>
                  <p className="text-xs text-muted-foreground">{suggestion.structured_formatting.secondary_text}</p>
                </div>
              </button>
            ))
          )}
        </div>
        <Button variant="outline" onClick={handleUseCurrentLocation} className="w-full bg-transparent">
          <Navigation className="mr-2 h-4 w-4" />
          Use My Current Location
        </Button>
      </DialogContent>
    </Dialog>
  )
}
