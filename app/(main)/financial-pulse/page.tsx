"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Building2,
  ShoppingCart,
  Fuel,
  Home,
  Utensils,
  Car,
  Zap,
  MapPin,
  Clock,
  BarChart3,
} from "lucide-react"
import { useLocation } from "@/contexts/location-context"
import { useAuth } from "@/contexts/auth-context"
import { FiMoneyLogo } from "@/components/core/fi-money-logo"

export default function FinancialPulsePage() {
  const { district, city } = useLocation()
  const { authState, requireAuth } = useAuth()

  // Mock financial data for Bengaluru
  const financialMetrics = {
    costOfLiving: {
      index: 42.8,
      change: -2.3,
      rank: "Moderate",
    },
    averageIncome: {
      amount: 85000,
      change: 5.2,
      currency: "INR",
    },
    propertyPrices: {
      residential: 8500,
      commercial: 12000,
      change: 3.8,
      unit: "per sq ft",
    },
    inflation: {
      rate: 4.2,
      change: -0.8,
      category: "Urban",
    },
  }

  // Category-wise expenses
  const expenseCategories = [
    {
      category: "Housing",
      icon: Home,
      amount: 25000,
      percentage: 35,
      change: 2.1,
      color: "bg-blue-500",
    },
    {
      category: "Food & Dining",
      icon: Utensils,
      amount: 12000,
      percentage: 18,
      change: -1.5,
      color: "bg-green-500",
    },
    {
      category: "Transportation",
      icon: Car,
      amount: 8000,
      percentage: 12,
      change: 4.2,
      color: "bg-yellow-500",
    },
    {
      category: "Utilities",
      icon: Zap,
      amount: 6000,
      percentage: 9,
      change: 1.8,
      color: "bg-purple-500",
    },
    {
      category: "Shopping",
      icon: ShoppingCart,
      amount: 10000,
      percentage: 15,
      change: -0.5,
      color: "bg-pink-500",
    },
    {
      category: "Fuel",
      icon: Fuel,
      amount: 5000,
      percentage: 7,
      change: 6.8,
      color: "bg-red-500",
    },
  ]

  // Area-wise cost comparison
  const areaCosts = [
    { area: "Koramangala", costIndex: 95, rent: 35000, category: "Premium" },
    { area: "Indiranagar", costIndex: 92, rent: 32000, category: "Premium" },
    { area: "HSR Layout", costIndex: 88, rent: 28000, category: "High" },
    { area: "Whitefield", costIndex: 75, rent: 22000, category: "Moderate" },
    { area: "Electronic City", costIndex: 68, rent: 18000, category: "Affordable" },
    { area: "Marathahalli", costIndex: 72, rent: 20000, category: "Moderate" },
  ]

  // Financial opportunities
  const opportunities = [
    {
      title: "Tech Sector Growth",
      description: "IT jobs increased 15% in Whitefield and Electronic City",
      impact: "Positive",
      timeframe: "Next 6 months",
    },
    {
      title: "Metro Expansion Impact",
      description: "Property values near new metro stations expected to rise 8-12%",
      impact: "Positive",
      timeframe: "Next 12 months",
    },
    {
      title: "Fuel Price Volatility",
      description: "Petrol prices may increase due to global market conditions",
      impact: "Negative",
      timeframe: "Next 3 months",
    },
  ]

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Premium":
        return "text-red-600 bg-red-100"
      case "High":
        return "text-orange-600 bg-orange-100"
      case "Moderate":
        return "text-blue-600 bg-blue-100"
      case "Affordable":
        return "text-green-600 bg-green-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-IN").format(num)
  }

  return (
    <div className="pb-16 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <IndianRupee className="h-6 w-6 text-primary" />
            Financial Pulse
          </h1>
          <p className="text-sm text-muted-foreground">Economic insights for {city}</p>
        </div>
        <Button variant="outline" size="sm">
          <BarChart3 className="h-4 w-4 mr-1" />
          Reports
        </Button>
      </div>

      {/* Fi Money Integration Banner */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-full">
              <FiMoneyLogo className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-purple-800">Powered by Fi Money</p>
              <p className="text-sm text-purple-700">Real-time financial data and insights for smart city living</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-purple-300 text-purple-700 hover:bg-purple-100 bg-transparent"
            >
              Connect Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Financial Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Cost of Living</span>
            </div>
            <div className="text-2xl font-bold">{financialMetrics.costOfLiving.index}</div>
            <div className="flex items-center justify-center gap-1 text-sm">
              <TrendingDown className="h-3 w-3 text-green-500" />
              <span className="text-green-600">{Math.abs(financialMetrics.costOfLiving.change)}%</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">{financialMetrics.costOfLiving.rank}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              <IndianRupee className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-600">Avg Income</span>
            </div>
            <div className="text-2xl font-bold">{formatCurrency(financialMetrics.averageIncome.amount)}</div>
            <div className="flex items-center justify-center gap-1 text-sm">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-600">{financialMetrics.averageIncome.change}%</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">Monthly</div>
          </CardContent>
        </Card>
      </div>

      {/* Expense Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5 text-primary" />
            Monthly Expense Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {expenseCategories.map((category, index) => {
            const Icon = category.icon
            return (
              <div key={index} className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${category.color.replace("bg-", "bg-")}/10`}>
                  <Icon className={`h-4 w-4 ${category.color.replace("bg-", "text-")}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{category.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{formatCurrency(category.amount)}</span>
                      <div className="flex items-center gap-1">
                        {category.change > 0 ? (
                          <TrendingUp className="h-3 w-3 text-red-500" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-green-500" />
                        )}
                        <span className={`text-xs ${category.change > 0 ? "text-red-600" : "text-green-600"}`}>
                          {Math.abs(category.change)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={category.percentage} className="flex-1 h-2" />
                    <span className="text-xs text-muted-foreground w-8">{category.percentage}%</span>
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Area-wise Cost Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-primary" />
            Area Cost Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {areaCosts.map((area, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <div className="text-lg font-bold">{area.costIndex}</div>
                  <div className="text-xs text-muted-foreground">Index</div>
                </div>
                <div>
                  <p className="font-medium">{area.area}</p>
                  <p className="text-sm text-muted-foreground">Avg Rent: {formatCurrency(area.rent)}</p>
                </div>
              </div>
              <Badge className={getCategoryColor(area.category)}>{area.category}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Financial Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Financial Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {opportunities.map((opportunity, index) => (
            <div key={index} className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-sm">{opportunity.title}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant={opportunity.impact === "Positive" ? "default" : "destructive"} className="text-xs">
                    {opportunity.impact}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {opportunity.timeframe}
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{opportunity.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Property Market Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Home className="h-5 w-5 text-primary" />
            Property Market
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-xl font-bold text-blue-700">
                ₹{formatNumber(financialMetrics.propertyPrices.residential)}
              </div>
              <div className="text-sm text-blue-600">Residential</div>
              <div className="text-xs text-blue-500">{financialMetrics.propertyPrices.unit}</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-xl font-bold text-green-700">
                ₹{formatNumber(financialMetrics.propertyPrices.commercial)}
              </div>
              <div className="text-sm text-green-600">Commercial</div>
              <div className="text-xs text-green-500">{financialMetrics.propertyPrices.unit}</div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <TrendingUp className="h-4 w-4" />
              <span className="font-medium text-sm">Market Trend</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              Property prices increased by {financialMetrics.propertyPrices.change}% this quarter, driven by metro
              expansion and IT sector growth.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Inflation Tracker */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Inflation Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-orange-600">{financialMetrics.inflation.rate}%</div>
            <div className="text-sm text-muted-foreground">Current Inflation Rate</div>
            <div className="flex items-center justify-center gap-1 mt-1">
              <TrendingDown className="h-3 w-3 text-green-500" />
              <span className="text-green-600 text-sm">
                {Math.abs(financialMetrics.inflation.change)}% from last month
              </span>
            </div>
          </div>
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-700">
              Urban inflation remains within RBI target range. Food prices showing seasonal decline while fuel costs
              remain volatile.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
