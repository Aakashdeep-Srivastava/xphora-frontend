"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Bell, MapPin, Clock, TrendingUp, AlertTriangle, Settings, Zap } from "lucide-react"
import { useLocation } from "@/contexts/location-context"

export default function AlertsPage() {
  const { district, city } = useLocation()
  const [alertPreferences, setAlertPreferences] = useState({
    traffic: true,
    weather: true,
    incidents: true,
    events: false,
    predictions: true,
  })

  const togglePreference = (key: string) => {
    setAlertPreferences((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }))
  }

  // Mock alerts data
  const recentAlerts = [
    {
      id: 1,
      type: "prediction",
      title: "Heavy Traffic Predicted",
      message: "AI predicts 40% increase in traffic on ORR between 6-8 PM today",
      location: "Outer Ring Road",
      time: "2 hours ago",
      severity: "medium",
      read: false,
    },
    {
      id: 2,
      type: "incident",
      title: "Waterlogging Alert",
      message: "Flooding reported near Silk Board. Avoid the area if possible.",
      location: "Silk Board Junction",
      time: "45 minutes ago",
      severity: "high",
      read: false,
    },
    {
      id: 3,
      type: "weather",
      title: "Rain Expected",
      message: "Moderate rainfall expected in your area within the next 2 hours",
      location: district || "Your Area",
      time: "1 hour ago",
      severity: "low",
      read: true,
    },
    {
      id: 4,
      type: "traffic",
      title: "Route Cleared",
      message: "Traffic congestion on MG Road has been cleared. Normal flow resumed.",
      location: "MG Road",
      time: "3 hours ago",
      severity: "low",
      read: true,
    },
  ]

  const subscribedAreas = [
    { name: district || "Current Location", active: true },
    { name: "Koramangala", active: true },
    { name: "Indiranagar", active: false },
    { name: "Whitefield", active: true },
    { name: "Electronic City", active: false },
  ]

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "prediction":
        return TrendingUp
      case "incident":
        return AlertTriangle
      case "weather":
        return Clock
      case "traffic":
        return MapPin
      default:
        return Bell
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "border-red-200 bg-red-50"
      case "medium":
        return "border-yellow-200 bg-yellow-50"
      case "low":
        return "border-green-200 bg-green-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <div className="pb-16 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Alerts</h1>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-1" />
          Settings
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Bell className="h-6 w-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold text-primary">{recentAlerts.filter((a) => !a.read).length}</div>
            <div className="text-sm text-muted-foreground">Unread</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <MapPin className="h-6 w-6 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-600">{subscribedAreas.filter((a) => a.active).length}</div>
            <div className="text-sm text-muted-foreground">Areas</div>
          </CardContent>
        </Card>
      </div>

      {/* Subscribed Areas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-primary" />
            Your Areas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {subscribedAreas.map((area, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${area.active ? "bg-green-500" : "bg-gray-300"}`} />
                <span className="font-medium">{area.name}</span>
              </div>
              <Switch checked={area.active} onCheckedChange={() => {}} size="sm" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Alert Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5 text-primary" />
            Alert Types
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(alertPreferences).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="capitalize font-medium">{key}</div>
              </div>
              <Switch checked={value} onCheckedChange={() => togglePreference(key)} size="sm" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-primary" />
            Recent Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentAlerts.map((alert) => {
            const Icon = getAlertIcon(alert.type)
            return (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border-2 ${getSeverityColor(alert.severity)} ${!alert.read ? "border-l-4 border-l-primary" : ""}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-sm">{alert.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getSeverityBadge(alert.severity) as any} className="text-xs">
                      {alert.severity.toUpperCase()}
                    </Badge>
                    {!alert.read && <div className="w-2 h-2 bg-primary rounded-full" />}
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {alert.location}
                  </span>
                  <span>{alert.time}</span>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* AI Predictions */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="h-5 w-5 text-blue-600" />
            AI Predictions for {city}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-white/60 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-700 text-sm">Traffic Forecast</span>
            </div>
            <p className="text-sm text-blue-600">Peak congestion expected on ORR at 7:30 PM (85% confidence)</p>
          </div>
          <div className="p-3 bg-white/60 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-purple-600" />
              <span className="font-medium text-purple-700 text-sm">Event Impact</span>
            </div>
            <p className="text-sm text-purple-600">
              Cricket match at Chinnaswamy Stadium may cause traffic delays (72% confidence)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
