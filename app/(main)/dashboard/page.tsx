"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Wind,
  Thermometer,
  TrafficCone,
  Smile,
  AlertTriangle,
  Camera,
  RefreshCw,
  Wifi,
  WifiOff,
  TrendingUp,
  MapPin,
  Zap,
} from "lucide-react"
import { CityMap } from "@/components/maps/city-map"
import { useLiveData } from "@/hooks/use-live-data"
import { useLocation } from "@/contexts/location-context"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const { weather, airQuality, traffic, cityMood, isLoading, lastUpdated, refresh } = useLiveData()
  const { district, city, coords, isLoading: locationLoading } = useLocation()
  const router = useRouter()

  // Calculate city pulse score (0-100)
  const calculateCityPulse = () => {
    if (!weather || !airQuality || !traffic || !cityMood) return 0

    const weatherScore = Math.max(0, 100 - Math.abs(weather.temperature - 25) * 2)
    const airScore = Math.max(0, 100 - airQuality.aqi)
    const trafficScore = traffic.status === "Light" ? 90 : traffic.status === "Moderate" ? 60 : 30
    const moodScore = cityMood.score

    return Math.round((weatherScore + airScore + trafficScore + moodScore) / 4)
  }

  const cityPulse = calculateCityPulse()
  const getPulseColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    if (score >= 40) return "text-orange-600"
    return "text-red-600"
  }

  const getPulseBgColor = (score: number) => {
    if (score >= 80) return "bg-green-500/10 border-green-400/30"
    if (score >= 60) return "bg-yellow-500/10 border-yellow-400/30"
    if (score >= 40) return "bg-orange-500/10 border-orange-400/30"
    return "bg-red-500/10 border-red-400/30"
  }

  const getLiveStatus = () => {
    if (isLoading || locationLoading) {
      return {
        status: "UPDATING",
        color: "text-amber-600",
        bgColor: "bg-amber-500/20 border-amber-400/40",
        icon: RefreshCw,
        animate: "animate-spin",
      }
    }

    if (!lastUpdated) {
      return {
        status: "OFFLINE",
        color: "text-red-600",
        bgColor: "bg-red-500/20 border-red-400/40",
        icon: WifiOff,
        animate: "",
      }
    }

    const timeSinceUpdate = Date.now() - lastUpdated.getTime()
    if (timeSinceUpdate > 60000) {
      return {
        status: "STALE",
        color: "text-orange-600",
        bgColor: "bg-orange-500/20 border-orange-400/40",
        icon: Wifi,
        animate: "",
      }
    }

    return {
      status: "LIVE",
      color: "text-green-600",
      bgColor: "bg-green-500/20 border-green-400/40",
      icon: Wifi,
      animate: "animate-pulse",
    }
  }

  const liveStatus = getLiveStatus()
  const LiveIcon = liveStatus.icon

  // Mock current incidents - these would also be location-based in a real app
  const currentIncidents = [
    {
      id: 1,
      title: `Heavy traffic near ${district || "your area"}`,
      location: `${district || "Local area"} Junction`,
      severity: "high",
      time: "5m ago",
      category: "traffic",
    },
    {
      id: 2,
      title: "Waterlogging reported",
      location: `${city || "City"} Center`,
      severity: "medium",
      time: "12m ago",
      category: "infrastructure",
    },
    {
      id: 3,
      title: "Cultural event causing crowd",
      location: `${district || "Local"} Market`,
      severity: "low",
      time: "18m ago",
      category: "event",
    },
  ]

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="pb-16">
      {/* Compact Map Section */}
      <div className="relative h-64">
        <CityMap initialCenter={coords || undefined} />

        {/* Live Status Indicator */}
        <div className="absolute top-2 left-2 z-10">
          <Card className={cn("transition-all duration-300 border", liveStatus.bgColor)}>
            <CardContent className="p-1.5 flex items-center gap-1.5">
              <LiveIcon className={cn("h-3 w-3", liveStatus.color, liveStatus.animate)} />
              <span className={cn("text-xs font-bold", liveStatus.color)}>{liveStatus.status}</span>
            </CardContent>
          </Card>
        </div>

        {/* City Pulse Score */}
        <div className="absolute top-2 right-2 z-10">
          <Card className={cn("transition-all duration-300 border-2", getPulseBgColor(cityPulse))}>
            <CardContent className="p-2 text-center">
              <div className={cn("text-2xl font-bold", getPulseColor(cityPulse))}>{isLoading ? "--" : cityPulse}</div>
              <div className="text-xs font-medium text-gray-600">City Pulse</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Area Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-primary" />
              {district || "Your Area"} Status
              {locationLoading && <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-400/30">
                <Thermometer className="h-6 w-6 mx-auto mb-1 text-green-600" />
                <div className="font-bold text-green-700">{isLoading ? "--" : `${weather?.temperature || "--"}°C`}</div>
                <div className="text-xs text-green-600">Weather</div>
              </div>
              <div className="text-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-400/30">
                <Wind className="h-6 w-6 mx-auto mb-1 text-yellow-600" />
                <div className="font-bold text-yellow-700">{isLoading ? "--" : `AQI ${airQuality?.aqi || "--"}`}</div>
                <div className="text-xs text-yellow-600">Air Quality</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg border border-blue-400/30">
              <div className="flex items-center gap-2">
                <TrafficCone className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-700">
                  Traffic: {isLoading ? "Loading..." : traffic?.status || "Loading..."}
                </span>
              </div>
              <Badge variant="outline" className="text-blue-600 border-blue-400">
                {isLoading ? "--" : traffic?.avgSpeed || "--"} km/h
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Quick Report Button */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <Button onClick={() => router.push("/report")} className="w-full h-12 text-base font-semibold" size="lg">
              <Camera className="mr-2 h-5 w-5" />
              Report an Incident
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Help your community by reporting what you see
            </p>
          </CardContent>
        </Card>

        {/* Current Incidents */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                Top Incidents
              </div>
              <Button variant="ghost" size="sm" onClick={() => router.push("/map")}>
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentIncidents.map((incident) => (
              <div key={incident.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <div className={cn("w-2 h-2 rounded-full mt-2", getSeverityColor(incident.severity))} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{incident.title}</p>
                  <p className="text-xs text-muted-foreground">{incident.location}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="outline" className="text-xs">
                    {incident.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{incident.time}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* AI Updates */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-5 w-5 text-primary" />
              AI Insights for {city || "Your City"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-400/30">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-700 text-sm">Traffic Prediction</span>
              </div>
              <p className="text-sm text-blue-600">
                {isLoading
                  ? "Analyzing traffic patterns..."
                  : `Heavy traffic expected in ${district || "your area"} between 6-8 PM due to ongoing construction.`}
              </p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg border border-green-400/30">
              <div className="flex items-center gap-2 mb-2">
                <Smile className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-700 text-sm">Community Mood</span>
              </div>
              <p className="text-sm text-green-600">
                {isLoading
                  ? "Analyzing community sentiment..."
                  : `${cityMood?.mood || "Positive"} sentiment in ${district || "your area"} after successful waste management initiative.`}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
