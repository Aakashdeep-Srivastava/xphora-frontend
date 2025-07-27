"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  User,
  MapPin,
  Camera,
  Star,
  TrendingUp,
  Settings,
  Award,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useLocation } from "@/contexts/location-context"

export default function ProfilePage() {
  const { authState, user } = useAuth()
  const { district, city } = useLocation()

  // Mock user stats
  const userStats = {
    reportsSubmitted: 23,
    impactScore: 847,
    accuracy: 94,
    rank: "Community Champion",
    level: 7,
    nextLevelProgress: 65,
  }

  // Mock submitted reports
  const submittedReports = [
    {
      id: 1,
      title: "Pothole on 100 Feet Road",
      location: "Koramangala 4th Block",
      status: "resolved",
      date: "2 days ago",
      impact: 45,
      category: "infrastructure",
    },
    {
      id: 2,
      title: "Traffic signal malfunction",
      location: "Silk Board Junction",
      status: "in-progress",
      date: "5 days ago",
      impact: 78,
      category: "traffic",
    },
    {
      id: 3,
      title: "Street light not working",
      location: "HSR Layout Sector 1",
      status: "verified",
      date: "1 week ago",
      impact: 23,
      category: "infrastructure",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "text-green-600 bg-green-100"
      case "in-progress":
        return "text-yellow-600 bg-yellow-100"
      case "verified":
        return "text-blue-600 bg-blue-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return CheckCircle
      case "in-progress":
        return Clock
      case "verified":
        return AlertTriangle
      default:
        return Clock
    }
  }

  if (authState.mode === "anonymous") {
    return (
      <div className="pb-16 p-4 flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-6">
            <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-bold mb-2">Sign In Required</h2>
            <p className="text-muted-foreground mb-4">
              Sign in to view your profile, track your contributions, and manage your preferences.
            </p>
            <Button className="w-full">Sign In with Google</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="pb-16 p-4 space-y-4">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || ""} />
              <AvatarFallback className="text-lg">{user?.displayName?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{user?.displayName}</h1>
              <p className="text-muted-foreground">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm text-primary">
                  {district}, {city}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              <Award className="h-3 w-3 mr-1" />
              {userStats.rank}
            </Badge>
            <Badge variant="outline">Level {userStats.level}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Impact Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Impact Score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-1">{userStats.impactScore}</div>
            <p className="text-sm text-muted-foreground">Your contributions have helped improve city intelligence</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to Level {userStats.level + 1}</span>
              <span>{userStats.nextLevelProgress}%</span>
            </div>
            <Progress value={userStats.nextLevelProgress} className="h-2" />
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">{userStats.reportsSubmitted}</div>
              <div className="text-xs text-muted-foreground">Reports</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">{userStats.accuracy}%</div>
              <div className="text-xs text-muted-foreground">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-600">#{Math.floor(userStats.impactScore / 100)}</div>
              <div className="text-xs text-muted-foreground">City Rank</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Camera className="h-5 w-5 text-primary" />
            Your Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {submittedReports.map((report) => {
            const StatusIcon = getStatusIcon(report.status)
            return (
              <div key={report.id} className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-sm">{report.title}</h3>
                  <Badge className={getStatusColor(report.status)}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {report.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  <MapPin className="h-3 w-3 inline mr-1" />
                  {report.location}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{report.date}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {report.category}
                    </Badge>
                    <span className="text-primary font-medium">+{report.impact} impact</span>
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="h-5 w-5 text-primary" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
              <Award className="h-6 w-6 mx-auto mb-1 text-yellow-600" />
              <div className="text-sm font-medium text-yellow-700">First Reporter</div>
              <div className="text-xs text-yellow-600">Submitted first report</div>
            </div>
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
              <CheckCircle className="h-6 w-6 mx-auto mb-1 text-green-600" />
              <div className="text-sm font-medium text-green-700">Problem Solver</div>
              <div className="text-xs text-green-600">5 reports resolved</div>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-1 text-blue-600" />
              <div className="text-sm font-medium text-blue-700">Rising Star</div>
              <div className="text-xs text-blue-600">Top 10% contributor</div>
            </div>
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-center opacity-50">
              <Star className="h-6 w-6 mx-auto mb-1 text-purple-600" />
              <div className="text-sm font-medium text-purple-700">Community Hero</div>
              <div className="text-xs text-purple-600">50 reports needed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardContent className="p-4">
          <Button variant="outline" className="w-full bg-transparent">
            <Settings className="h-4 w-4 mr-2" />
            Account Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
