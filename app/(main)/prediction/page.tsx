"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  TrendingDown,
  Brain,
  Clock,
  MapPin,
  CheckCircle,
  Zap,
  BarChart3,
  Activity,
  Cloud,
  Car,
} from "lucide-react"
import { useLocation } from "@/contexts/location-context"
import { useLiveData } from "@/hooks/use-live-data"

export default function PredictionPage() {
  const { district, city } = useLocation()
  const { weather, traffic, isLoading } = useLiveData()

  // Mock prediction data - in real app, this would come from AI models
  const predictions = [
    {
      id: 1,
      title: "Traffic Surge Prediction",
      description: `Heavy traffic expected on major routes in ${district || "your area"} between 6:30-8:00 PM`,
      confidence: 89,
      timeframe: "Next 2 hours",
      impact: "High",
      category: "traffic",
      trend: "increasing",
      probability: 89,
      factors: ["Rush hour pattern", "Weather conditions", "Event schedules"],
    },
    {
      id: 2,
      title: "Weather Impact Forecast",
      description: "Light rain may cause 25% increase in travel time on outer ring road",
      confidence: 76,
      timeframe: "Next 4 hours",
      impact: "Medium",
      category: "weather",
      trend: "stable",
      probability: 76,
      factors: ["Weather forecast", "Historical patterns", "Road conditions"],
    },
    {
      id: 3,
      title: "Air Quality Improvement",
      description: "AQI expected to improve by 15-20 points due to wind patterns",
      confidence: 82,
      timeframe: "Next 6 hours",
      impact: "Low",
      category: "environment",
      trend: "improving",
      probability: 82,
      factors: ["Wind direction", "Pollution sources", "Time of day"],
    },
    {
      id: 4,
      title: "Incident Probability",
      description: "Low probability of major incidents in your area today",
      confidence: 94,
      timeframe: "Next 12 hours",
      impact: "Low",
      category: "safety",
      trend: "stable",
      probability: 6, // Low probability of incidents
      factors: ["Historical data", "Current conditions", "Event calendar"],
    },
  ]

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "traffic":
        return Car
      case "weather":
        return Cloud
      case "environment":
        return Activity
      case "safety":
        return CheckCircle
      default:
        return Brain
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "traffic":
        return "bg-red-500/10 text-red-600 border-red-200"
      case "weather":
        return "bg-blue-500/10 text-blue-600 border-blue-200"
      case "environment":
        return "bg-green-500/10 text-green-600 border-green-200"
      case "safety":
        return "bg-purple-500/10 text-purple-600 border-purple-200"
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-200"
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "High":
        return "destructive"
      case "Medium":
        return "secondary"
      case "Low":
        return "outline"
      default:
        return "outline"
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing":
        return <TrendingUp className="h-4 w-4 text-red-500" />
      case "decreasing":
        return <TrendingDown className="h-4 w-4 text-green-500" />
      case "improving":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "stable":
        return <Activity className="h-4 w-4 text-blue-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="pb-16 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            AI Predictions
          </h1>
          <p className="text-sm text-muted-foreground">
            Smart forecasts for {district || "your area"}, {city}
          </p>
        </div>
        <Button variant="outline" size="sm">
          <BarChart3 className="h-4 w-4 mr-1" />
          Analytics
        </Button>
      </div>

      {/* Current Conditions Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="h-5 w-5 text-blue-600" />
            Current Conditions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-white/60 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">
                {isLoading ? "--" : `${weather?.temperature || 28}°C`}
              </div>
              <div className="text-sm text-blue-600">Temperature</div>
            </div>
            <div className="text-center p-3 bg-white/60 rounded-lg">
              <div className="text-2xl font-bold text-purple-700">
                {isLoading ? "--" : traffic?.status || "Moderate"}
              </div>
              <div className="text-sm text-purple-600">Traffic</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Predictions List */}
      <div className="space-y-4">
        {predictions.map((prediction) => {
          const CategoryIcon = getCategoryIcon(prediction.category)
          return (
            <Card key={prediction.id} className="border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getCategoryColor(prediction.category)}`}>
                      <CategoryIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{prediction.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{prediction.timeframe}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(prediction.trend)}
                    <Badge variant={getImpactColor(prediction.impact) as any} className="text-xs">
                      {prediction.impact}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{prediction.description}</p>

                {/* Confidence and Probability */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Confidence</span>
                      <span>{prediction.confidence}%</span>
                    </div>
                    <Progress value={prediction.confidence} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Probability</span>
                      <span>{prediction.probability}%</span>
                    </div>
                    <Progress value={prediction.probability} className="h-2" />
                  </div>
                </div>

                {/* Contributing Factors */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Key Factors:</p>
                  <div className="flex flex-wrap gap-1">
                    {prediction.factors.map((factor, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {factor}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex justify-between items-center pt-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{district || "Your area"}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* AI Model Info */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-green-800 mb-2">
            <Brain className="h-5 w-5" />
            <span className="font-medium">AI Prediction Engine</span>
          </div>
          <div className="space-y-2 text-sm text-green-700">
            <p>Powered by machine learning models analyzing:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Historical traffic patterns and weather data</li>
              <li>Real-time sensor data and user reports</li>
              <li>Event schedules and seasonal trends</li>
              <li>Social media sentiment and news feeds</li>
            </ul>
            <div className="flex items-center gap-2 mt-3 p-2 bg-white/60 rounded border border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-xs font-medium">Model accuracy: 87% over last 30 days</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
