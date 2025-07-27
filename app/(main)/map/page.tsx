"use client"

import { useState } from "react"
import { CityMap } from "@/components/maps/city-map"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Layers, Filter, MapPin, TrafficCone, Cloud, AlertTriangle, Smile, X, Navigation } from "lucide-react"
import { cn } from "@/lib/utils"

export default function MapPage() {
  const [activeFilters, setActiveFilters] = useState<string[]>(["traffic", "incidents"])
  const [selectedIncident, setSelectedIncident] = useState<any>(null)

  const layerToggles = [
    { id: "traffic", label: "Traffic", icon: TrafficCone, color: "text-red-500" },
    { id: "weather", label: "Weather", icon: Cloud, color: "text-blue-500" },
    { id: "incidents", label: "Incidents", icon: AlertTriangle, color: "text-orange-500" },
    { id: "mood", label: "Mood", icon: Smile, color: "text-green-500" },
  ]

  const toggleFilter = (filterId: string) => {
    setActiveFilters((prev) => (prev.includes(filterId) ? prev.filter((id) => id !== filterId) : [...prev, filterId]))
  }

  // Mock incident data
  const mockIncident = {
    id: 1,
    title: "Heavy Traffic Congestion",
    description:
      "AI Analysis: Major bottleneck detected due to ongoing road construction. Alternative routes via Koramangala 5th Block recommended.",
    location: "Silk Board Junction",
    severity: "high",
    category: "traffic",
    time: "5 minutes ago",
    reports: 23,
    aiConfidence: 94,
  }

  return (
    <div className="relative h-[calc(100vh-4rem)] pb-16">
      <CityMap fullscreen />

      {/* Layer Controls */}
      <div className="absolute top-4 left-4 z-10 space-y-2">
        <Card>
          <CardContent className="p-2">
            <div className="flex items-center gap-1 mb-2">
              <Layers className="h-4 w-4" />
              <span className="text-sm font-medium">Layers</span>
            </div>
            <div className="space-y-1">
              {layerToggles.map((layer) => {
                const Icon = layer.icon
                const isActive = activeFilters.includes(layer.id)
                return (
                  <Button
                    key={layer.id}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => toggleFilter(layer.id)}
                    className={cn(
                      "w-full justify-start gap-2 h-8",
                      isActive && "bg-primary/10 text-primary border-primary/20",
                    )}
                  >
                    <Icon className={cn("h-3 w-3", isActive ? "text-primary" : layer.color)} />
                    <span className="text-xs">{layer.label}</span>
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Controls */}
      <div className="absolute top-4 right-4 z-10">
        <Button variant="outline" size="sm" className="bg-white/90 backdrop-blur-sm">
          <Filter className="h-4 w-4 mr-1" />
          Filter
        </Button>
      </div>

      {/* Mock Incident Marker Detail */}
      <div className="absolute bottom-20 left-4 right-4 z-10">
        <Card className="bg-white/95 backdrop-blur-sm border-2 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <Badge variant="destructive" className="text-xs">
                  HIGH SEVERITY
                </Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedIncident(null)} className="h-6 w-6 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <h3 className="font-bold text-lg mb-2">{mockIncident.title}</h3>
            <p className="text-sm text-muted-foreground mb-3">
              <MapPin className="h-3 w-3 inline mr-1" />
              {mockIncident.location}
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-xs font-medium text-blue-700">AI Analysis</span>
                <Badge variant="outline" className="text-xs text-blue-600 border-blue-300">
                  {mockIncident.aiConfidence}% confidence
                </Badge>
              </div>
              <p className="text-sm text-blue-700">{mockIncident.description}</p>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {mockIncident.reports} reports • {mockIncident.time}
              </span>
              <Button variant="outline" size="sm" className="h-7 bg-transparent">
                <Navigation className="h-3 w-3 mr-1" />
                Navigate
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
