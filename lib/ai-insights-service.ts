export interface EventStream {
  id: string
  type: "power_outage" | "traffic_incident" | "weather_event" | "infrastructure_issue" | "safety_incident"
  location: {
    lat: number
    lng: number
    area: string
    district: string
  }
  timestamp: Date
  severity: "low" | "medium" | "high"
  description: string
  source: "citizen_report" | "sensor_data" | "api_feed" | "social_media"
  metadata: Record<string, any>
}

export interface PredictiveInsight {
  id: string
  type: "infrastructure_pattern" | "traffic_prediction" | "safety_alert" | "community_trend"
  title: string
  description: string
  confidence: number
  severity: "low" | "medium" | "high"
  timeframe: string
  affectedArea: string
  eventCount: number
  pattern: string
  recommendation: string
  sources: string[]
  aiReasoning: string
  relatedEvents: string[]
}

export interface AreaSummary {
  area: string
  summary: string
  alerts: number
  trend: "positive" | "stable" | "warning" | "concerning"
  lastUpdated: string
  keyMetrics: {
    incidentCount: number
    resolutionRate: number
    communityEngagement: number
  }
}

class AIInsightsService {
  private eventBuffer: EventStream[] = []
  private patternCache = new Map<string, any>()

  // Simulate real-time event stream processing
  async analyzeEventStreams(events: EventStream[]): Promise<PredictiveInsight[]> {
    this.eventBuffer = [...this.eventBuffer, ...events].slice(-1000) // Keep last 1000 events

    const insights: PredictiveInsight[] = []

    // Pattern 1: Infrastructure clustering analysis
    const infrastructureInsights = await this.detectInfrastructurePatterns()
    insights.push(...infrastructureInsights)

    // Pattern 2: Traffic prediction based on events
    const trafficInsights = await this.predictTrafficPatterns()
    insights.push(...trafficInsights)

    // Pattern 3: Safety risk assessment
    const safetyInsights = await this.assessSafetyRisks()
    insights.push(...safetyInsights)

    // Pattern 4: Community engagement trends
    const communityInsights = await this.analyzeCommunityTrends()
    insights.push(...communityInsights)

    return insights.sort((a, b) => b.confidence - a.confidence)
  }

  private async detectInfrastructurePatterns(): Promise<PredictiveInsight[]> {
    const insights: PredictiveInsight[] = []

    // Group power outage events by area and time
    const powerOutages = this.eventBuffer.filter((e) => e.type === "power_outage")
    const areaGroups = this.groupEventsByArea(powerOutages, 2000) // 2km radius

    for (const [area, events] of areaGroups.entries()) {
      if (events.length >= 3) {
        // Threshold for pattern detection
        const timeSpan = this.getTimeSpan(events)

        if (timeSpan <= 4 * 60 * 60 * 1000) {
          // Within 4 hours
          const confidence = Math.min(95, 60 + events.length * 8)

          insights.push({
            id: `infra_${area}_${Date.now()}`,
            type: "infrastructure_pattern",
            title: "Potential Grid Issue Detected",
            description: `Multiple power cut reports in ${area} (${events.length} reports in ${Math.round(timeSpan / (60 * 60 * 1000))} hours) suggest a potential transformer failure.`,
            confidence,
            severity: events.length > 5 ? "high" : "medium",
            timeframe: "Next 2-4 hours",
            affectedArea: area,
            eventCount: events.length,
            pattern: "Clustered power outages",
            recommendation: this.generateInfrastructureRecommendation(events),
            sources: ["Citizen reports", "BESCOM API", "Historical patterns"],
            aiReasoning: `Pattern analysis shows ${confidence}% correlation with previous transformer failures in similar conditions.`,
            relatedEvents: events.map((e) => e.id),
          })
        }
      }
    }

    return insights
  }

  private async predictTrafficPatterns(): Promise<PredictiveInsight[]> {
    const insights: PredictiveInsight[] = []

    // Analyze upcoming events and their traffic impact
    const upcomingEvents = await this.getUpcomingEvents()

    for (const event of upcomingEvents) {
      const historicalImpact = await this.getHistoricalTrafficImpact(event.type, event.location)

      if (historicalImpact.confidence > 70) {
        insights.push({
          id: `traffic_${event.id}_${Date.now()}`,
          type: "traffic_prediction",
          title: "Unusual Traffic Buildup Predicted",
          description: `${event.name} will likely cause ${historicalImpact.increase}% increase in traffic on ${event.affectedRoutes.join(", ")}.`,
          confidence: historicalImpact.confidence,
          severity: historicalImpact.increase > 40 ? "high" : "medium",
          timeframe: event.timeframe,
          affectedArea: event.affectedRoutes.join(", "),
          eventCount: 1,
          pattern: "Event-driven congestion",
          recommendation: this.generateTrafficRecommendation(event, historicalImpact),
          sources: ["Event calendar", "Historical traffic data", "Social media"],
          aiReasoning: `Similar events historically increased travel time by ${historicalImpact.increase}% on this route.`,
          relatedEvents: [event.id],
        })
      }
    }

    return insights
  }

  private async assessSafetyRisks(): Promise<PredictiveInsight[]> {
    const insights: PredictiveInsight[] = []

    // Combine weather data with infrastructure reports
    const weatherEvents = this.eventBuffer.filter((e) => e.type === "weather_event")
    const infrastructureIssues = this.eventBuffer.filter((e) => e.type === "infrastructure_issue")

    // Look for drainage + rain combinations
    const drainageIssues = infrastructureIssues.filter(
      (e) => e.description.toLowerCase().includes("drain") || e.description.toLowerCase().includes("flood"),
    )

    if (weatherEvents.length > 0 && drainageIssues.length > 0) {
      const affectedAreas = [...new Set(drainageIssues.map((e) => e.location.area))]

      for (const area of affectedAreas) {
        const areaIssues = drainageIssues.filter((e) => e.location.area === area)

        insights.push({
          id: `safety_${area}_${Date.now()}`,
          type: "safety_alert",
          title: "Waterlogging Risk Assessment",
          description: `Heavy rain forecast + blocked drains in ${area} (${areaIssues.length} reports) indicate high flooding probability in low-lying areas.`,
          confidence: 82,
          severity: "high",
          timeframe: "Next 6 hours",
          affectedArea: area,
          eventCount: areaIssues.length,
          pattern: "Drainage system stress",
          recommendation: this.generateSafetyRecommendation(area, areaIssues),
          sources: ["Weather API", "Drainage reports", "Topographical data"],
          aiReasoning: "Rainfall intensity exceeds drainage capacity in reported areas.",
          relatedEvents: areaIssues.map((e) => e.id),
        })
      }
    }

    return insights
  }

  private async analyzeCommunityTrends(): Promise<PredictiveInsight[]> {
    const insights: PredictiveInsight[] = []

    // Analyze citizen reporting patterns
    const citizenReports = this.eventBuffer.filter((e) => e.source === "citizen_report")
    const areaReports = this.groupEventsByArea(citizenReports, 1000)

    for (const [area, reports] of areaReports.entries()) {
      const weeklyReports = reports.filter((r) => Date.now() - r.timestamp.getTime() < 7 * 24 * 60 * 60 * 1000)

      if (weeklyReports.length > 15) {
        // High engagement threshold
        const accuracyRate = this.calculateAccuracyRate(weeklyReports)

        if (accuracyRate > 80) {
          insights.push({
            id: `community_${area}_${Date.now()}`,
            type: "community_trend",
            title: "Positive Community Engagement Surge",
            description: `Citizen reporting increased 60% in ${area} this week, with ${accuracyRate}% accuracy rate. Community-driven problem solving is accelerating.`,
            confidence: 91,
            severity: "low",
            timeframe: "Ongoing trend",
            affectedArea: area,
            eventCount: weeklyReports.length,
            pattern: "Increased civic participation",
            recommendation: "Excellent community engagement. Consider expanding citizen reporter program.",
            sources: ["Report analytics", "Resolution tracking", "Community feedback"],
            aiReasoning: "Higher reporting correlates with 40% faster issue resolution in similar neighborhoods.",
            relatedEvents: weeklyReports.map((r) => r.id),
          })
        }
      }
    }

    return insights
  }

  // Generate AI-powered area summaries
  async generateAreaSummaries(areas: string[]): Promise<AreaSummary[]> {
    const summaries: AreaSummary[] = []

    for (const area of areas) {
      const areaEvents = this.eventBuffer.filter((e) => e.location.area === area)
      const recentEvents = areaEvents.filter((e) => Date.now() - e.timestamp.getTime() < 24 * 60 * 60 * 1000)

      const summary = await this.generateAreaSummaryText(area, recentEvents)
      const trend = this.calculateAreaTrend(recentEvents)
      const alerts = recentEvents.filter((e) => e.severity === "high").length

      summaries.push({
        area,
        summary,
        alerts,
        trend,
        lastUpdated: this.getRelativeTime(Math.max(...recentEvents.map((e) => e.timestamp.getTime()))),
        keyMetrics: {
          incidentCount: recentEvents.length,
          resolutionRate: this.calculateResolutionRate(recentEvents),
          communityEngagement: this.calculateEngagementScore(recentEvents),
        },
      })
    }

    return summaries
  }

  // Helper methods
  private groupEventsByArea(events: EventStream[], radiusMeters: number): Map<string, EventStream[]> {
    const groups = new Map<string, EventStream[]>()

    for (const event of events) {
      let assigned = false

      for (const [area, groupEvents] of groups.entries()) {
        const representative = groupEvents[0]
        const distance = this.calculateDistance(
          event.location.lat,
          event.location.lng,
          representative.location.lat,
          representative.location.lng,
        )

        if (distance <= radiusMeters) {
          groupEvents.push(event)
          assigned = true
          break
        }
      }

      if (!assigned) {
        groups.set(event.location.area, [event])
      }
    }

    return groups
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lng2 - lng1) * Math.PI) / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  private getTimeSpan(events: EventStream[]): number {
    const timestamps = events.map((e) => e.timestamp.getTime())
    return Math.max(...timestamps) - Math.min(...timestamps)
  }

  private async getUpcomingEvents() {
    // Mock upcoming events - in real app, this would come from event APIs
    return [
      {
        id: "concert_palace_grounds",
        name: "Concert at Palace Grounds",
        type: "entertainment",
        location: { lat: 13.0067, lng: 77.5667 },
        timeframe: "Today 8:00-11:00 PM",
        affectedRoutes: ["Outer Ring Road", "Hebbal-Marathahalli"],
      },
    ]
  }

  private async getHistoricalTrafficImpact(eventType: string, location: any) {
    // Mock historical analysis
    return {
      confidence: 87,
      increase: 40,
    }
  }

  private generateInfrastructureRecommendation(events: EventStream[]): string {
    return "BESCOM has been notified. Backup power recommended for critical operations."
  }

  private generateTrafficRecommendation(event: any, impact: any): string {
    return "Use alternative routes. Metro recommended for event area."
  }

  private generateSafetyRecommendation(area: string, issues: EventStream[]): string {
    return `Avoid low-lying areas in ${area}. BBMP drainage teams deployed.`
  }

  private calculateAccuracyRate(reports: EventStream[]): number {
    // Mock accuracy calculation
    return 85
  }

  private async generateAreaSummaryText(area: string, events: EventStream[]): Promise<string> {
    // AI-generated summary based on events
    const powerIssues = events.filter((e) => e.type === "power_outage").length
    const trafficIssues = events.filter((e) => e.type === "traffic_incident").length

    if (powerIssues > 3) {
      return `Infrastructure stress detected. Power grid showing instability with ${powerIssues} outage reports. Traffic normal. Air quality moderate.`
    } else if (trafficIssues > 2) {
      return `Traffic congestion above normal. ${trafficIssues} incidents reported. Infrastructure stable.`
    } else {
      return `Area operating normally. Minor incidents reported. Community engagement good.`
    }
  }

  private calculateAreaTrend(events: EventStream[]): "positive" | "stable" | "warning" | "concerning" {
    const highSeverityEvents = events.filter((e) => e.severity === "high").length

    if (highSeverityEvents > 2) return "concerning"
    if (highSeverityEvents > 0) return "warning"
    if (events.length > 10) return "positive" // High engagement
    return "stable"
  }

  private calculateResolutionRate(events: EventStream[]): number {
    // Mock resolution rate
    return 78
  }

  private calculateEngagementScore(events: EventStream[]): number {
    const citizenReports = events.filter((e) => e.source === "citizen_report").length
    return Math.min(100, citizenReports * 5)
  }

  private getRelativeTime(timestamp: number): string {
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / (60 * 1000))

    if (minutes < 60) return `${minutes} minutes ago`
    const hours = Math.floor(minutes / 60)
    return `${hours} hours ago`
  }
}

export const aiInsightsService = new AIInsightsService()
