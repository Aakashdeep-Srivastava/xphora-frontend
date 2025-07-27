"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MapPin,
  Settings,
  Brain,
  AlertTriangle,
  Bell,
  Eye,
  Lightbulb,
  Network,
  Clock,
  Sparkles,
  Bot,
  Cpu,
  Database,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useLocation } from "@/contexts/location-context"
import { useLiveData } from "@/hooks/use-live-data"
import { useState } from "react"

export default function InsightsPage() {
  const { authState, user } = useAuth()
  const { district, city } = useLocation()
  const { weather, airQuality, traffic, cityMood } = useLiveData()
  const [activeTab, setActiveTab] = useState("predictive")
  const [notificationSettings, setNotificationSettings] = useState({
    powerOutages: true,
    trafficPatterns: true,
    weatherAlerts: true,
    safetyIncidents: true,
    infrastructureIssues: true,
    communityEvents: false,
  })

  // Mock predictive insights based on event stream analysis
  const predictiveInsights = [
    {
      id: 1,
      type: "infrastructure_pattern",
      title: "Potential Grid Issue Detected",
      description:
        "Multiple power cut reports in HSR Layout (7 reports in 2 hours) suggest a potential transformer failure at HSR Sector 2 substation.",
      confidence: 94,
      severity: "high",
      timeframe: "Next 2-4 hours",
      affectedArea: "HSR Layout Sectors 1-3",
      eventCount: 7,
      pattern: "Clustered power outages",
      recommendation: "BESCOM has been notified. Backup power recommended for critical operations.",
      sources: ["Citizen reports", "BESCOM API", "Historical patterns"],
      aiReasoning: "Pattern analysis shows 89% correlation with previous transformer failures in similar conditions.",
    },
    {
      id: 2,
      type: "traffic_prediction",
      title: "Unusual Traffic Buildup Predicted",
      description:
        "Concert at Palace Grounds will likely cause 40% increase in traffic on ORR between 8-11 PM. Alternative routes via Hebbal recommended.",
      confidence: 87,
      severity: "medium",
      timeframe: "Today 8:00-11:00 PM",
      affectedArea: "Outer Ring Road, Hebbal-Marathahalli",
      eventCount: 1,
      pattern: "Event-driven congestion",
      recommendation: "Use Tumkur Road or Bellary Road as alternatives. Metro recommended for Palace Grounds area.",
      sources: ["Event calendar", "Historical traffic data", "Social media"],
      aiReasoning: "Similar events historically increased travel time by 35-45% on this route.",
    },
    {
      id: 3,
      type: "safety_alert",
      title: "Waterlogging Risk Assessment",
      description:
        "Heavy rain forecast + blocked drains in Koramangala (3 reports) indicate high flooding probability in low-lying areas.",
      confidence: 82,
      severity: "high",
      timeframe: "Next 6 hours",
      affectedArea: "Koramangala 4th & 5th Block",
      eventCount: 3,
      pattern: "Drainage system stress",
      recommendation: "Avoid Sony World Junction and Forum Mall underpass. BBMP drainage teams deployed.",
      sources: ["Weather API", "Drainage reports", "Topographical data"],
      aiReasoning: "Rainfall intensity (15mm/hr) exceeds drainage capacity (12mm/hr) in reported areas.",
    },
    {
      id: 4,
      type: "community_trend",
      title: "Positive Community Engagement Surge",
      description:
        "Citizen reporting increased 60% in Indiranagar this week, with 85% accuracy rate. Community-driven problem solving is accelerating.",
      confidence: 91,
      severity: "low",
      timeframe: "Ongoing trend",
      affectedArea: "Indiranagar",
      eventCount: 23,
      pattern: "Increased civic participation",
      recommendation: "Excellent community engagement. Consider expanding citizen reporter program.",
      sources: ["Report analytics", "Resolution tracking", "Community feedback"],
      aiReasoning: "Higher reporting correlates with 40% faster issue resolution in similar neighborhoods.",
    },
  ]

  // AI-generated area summaries
  const areaSummaries = [
    {
      area: "HSR Layout",
      summary:
        "Infrastructure stress detected. Power grid showing instability with 7 outage reports. Traffic normal. Air quality moderate (AQI 78).",
      alerts: 2,
      trend: "concerning",
      lastUpdated: "5 minutes ago",
    },
    {
      area: "Koramangala",
      summary:
        "Weather impact expected. Drainage system at capacity with heavy rain forecast. High waterlogging risk in low-lying areas.",
      alerts: 1,
      trend: "warning",
      lastUpdated: "12 minutes ago",
    },
    {
      area: "Indiranagar",
      summary:
        "Community engagement excellent. 23 citizen reports this week with 85% accuracy. Traffic flowing normally, air quality good.",
      alerts: 0,
      trend: "positive",
      lastUpdated: "8 minutes ago",
    },
    {
      area: "Whitefield",
      summary:
        "Tech corridor operating normally. Minor traffic delays on ITPL road due to construction. No major incidents reported.",
      alerts: 0,
      trend: "stable",
      lastUpdated: "15 minutes ago",
    },
  ]

  // Intelligent notification subscriptions
  const intelligentSubscriptions = [
    {
      id: "power_grid",
      title: "Power Grid Intelligence",
      description: "Get notified when AI detects potential power outages or grid issues in your area",
      enabled: notificationSettings.powerOutages,
      examples: ["Transformer failure predictions", "Planned maintenance alerts", "Load balancing issues"],
    },
    {
      id: "traffic_patterns",
      title: "Traffic Pattern Analysis",
      description: "Receive predictions about unusual traffic patterns and optimal route suggestions",
      enabled: notificationSettings.trafficPatterns,
      examples: ["Event-driven congestion", "Construction impact", "Weather-related delays"],
    },
    {
      id: "weather_impact",
      title: "Weather Impact Forecasting",
      description: "Advanced weather alerts with city infrastructure impact analysis",
      enabled: notificationSettings.weatherAlerts,
      examples: ["Flooding risk assessment", "Air quality predictions", "Storm damage potential"],
    },
    {
      id: "safety_incidents",
      title: "Safety Pattern Recognition",
      description: "AI-powered safety alerts based on incident clustering and risk analysis",
      enabled: notificationSettings.safetyIncidents,
      examples: ["Crime pattern alerts", "Accident hotspot warnings", "Emergency response updates"],
    },
    {
      id: "infrastructure",
      title: "Infrastructure Health Monitoring",
      description: "Predictive maintenance alerts for city infrastructure based on citizen reports",
      enabled: notificationSettings.infrastructureIssues,
      examples: ["Road damage predictions", "Utility service issues", "Public facility problems"],
    },
    {
      id: "community_events",
      title: "Community Event Intelligence",
      description: "Smart notifications about events that might affect your daily routine",
      enabled: notificationSettings.communityEvents,
      examples: ["Festival impact analysis", "Protest route planning", "Cultural event crowds"],
    },
  ]

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "border-red-200 bg-red-50 text-red-800"
      case "medium":
        return "border-yellow-200 bg-yellow-50 text-yellow-800"
      case "low":
        return "border-green-200 bg-green-50 text-green-800"
      default:
        return "border-gray-200 bg-gray-50 text-gray-800"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "medium":
        return <Eye className="h-4 w-4 text-yellow-600" />
      case "low":
        return <Lightbulb className="h-4 w-4 text-green-600" />
      default:
        return <Brain className="h-4 w-4 text-gray-600" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "concerning":
        return "text-red-600 bg-red-100"
      case "warning":
        return "text-yellow-600 bg-yellow-100"
      case "positive":
        return "text-green-600 bg-green-100"
      case "stable":
        return "text-blue-600 bg-blue-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const toggleNotification = (key: string) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }))
  }

  if (authState.mode === "anonymous") {
    return (
      <div className="pb-16 p-4 flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-6">
            <Bot className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-bold mb-2">AI-Powered Insights</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Sign in to access predictive analytics, intelligent notifications, and personalized city insights powered
              by advanced AI.
            </p>
            <Button className="w-full">Sign In for AI Insights</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="pb-16 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Cpu className="h-6 w-6 text-primary" />
            AI Insights
          </h1>
          <p className="text-sm text-muted-foreground">Predictive intelligence for {city}</p>
        </div>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-1" />
          Configure
        </Button>
      </div>

      {/* AI Status Banner */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-full">
              <Sparkles className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-purple-800">AI Agent Active</p>
              <p className="text-sm text-purple-700">
                Analyzing {predictiveInsights.reduce((sum, insight) => sum + insight.eventCount, 0)} events across{" "}
                {city}
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-purple-700">94%</div>
              <div className="text-xs text-purple-600">Accuracy</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="predictive">Predictive</TabsTrigger>
          <TabsTrigger value="summaries">Area Intel</TabsTrigger>
          <TabsTrigger value="notifications">Smart Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="predictive" className="space-y-4">
          {/* Predictive Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Brain className="h-5 w-5 text-primary" />
                Predictive Analysis
                <Badge variant="outline" className="ml-auto">
                  Live
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {predictiveInsights.map((insight) => (
                <Card key={insight.id} className={`border-l-4 ${getSeverityColor(insight.severity)}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getSeverityIcon(insight.severity)}
                        <h3 className="font-semibold">{insight.title}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {insight.confidence}% confidence
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {insight.eventCount} events
                        </Badge>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <div className="p-2 bg-muted/50 rounded text-xs">
                        <span className="font-medium">Timeframe:</span> {insight.timeframe}
                      </div>
                      <div className="p-2 bg-muted/50 rounded text-xs">
                        <span className="font-medium">Area:</span> {insight.affectedArea}
                      </div>
                    </div>

                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Lightbulb className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-800 text-sm">AI Recommendation</span>
                      </div>
                      <p className="text-sm text-blue-700">{insight.recommendation}</p>
                    </div>

                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Network className="h-4 w-4 text-gray-600" />
                        <span className="font-medium text-gray-800 text-sm">AI Reasoning</span>
                      </div>
                      <p className="text-sm text-gray-700">{insight.aiReasoning}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span>Pattern: {insight.pattern}</span>
                        <span>Sources: {insight.sources.join(", ")}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-6 text-xs">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summaries" className="space-y-4">
          {/* AI-Generated Area Summaries */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Database className="h-5 w-5 text-primary" />
                Area Intelligence Summaries
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {areaSummaries.map((area, index) => (
                <Card key={index} className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <h3 className="font-semibold">{area.area}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {area.alerts > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {area.alerts} alerts
                          </Badge>
                        )}
                        <Badge className={getTrendColor(area.trend)}>{area.trend}</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{area.summary}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Updated {area.lastUpdated}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-6 text-xs">
                        Subscribe
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          {/* Intelligent Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="h-5 w-5 text-primary" />
                Intelligent Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {intelligentSubscriptions.map((subscription) => (
                <Card key={subscription.id} className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{subscription.title}</h3>
                          <Switch
                            checked={subscription.enabled}
                            onCheckedChange={() => toggleNotification(subscription.id.replace("_", ""))}
                            size="sm"
                          />
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{subscription.description}</p>
                      </div>
                    </div>
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs font-medium text-blue-800 mb-1">Example Notifications:</p>
                      <ul className="text-xs text-blue-700 space-y-1">
                        {subscription.examples.map((example, idx) => (
                          <li key={idx} className="flex items-center gap-1">
                            <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                            {example}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Delivery Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Instant alerts on your device</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">Email Summaries</p>
                  <p className="text-sm text-muted-foreground">Daily AI-generated area reports</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">SMS Alerts</p>
                  <p className="text-sm text-muted-foreground">Critical alerts via text message</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
