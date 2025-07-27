// lib/gemini-service.ts (Enhanced version - keep all existing interfaces)

export interface MediaAnalysis {
  category: string
  severity: "low" | "medium" | "high"
  description: string
  tags: string[]
  confidence: number
  suggestedActions: string[]
  location?: {
    type: string
    landmarks: string[]
  }
  // Enhanced fields (optional for backward compatibility)
  urgency?: {
    level: number // 1-10
    requiresImmediateAction: boolean
    estimatedResolutionTime: string
  }
  publicSafety?: {
    riskLevel: 'none' | 'low' | 'moderate' | 'high' | 'severe'
    affectedRadius: number // in meters
    vulnerableGroups: string[]
  }
  economicImpact?: {
    estimatedCost: string
    affectedBusinesses: boolean
    trafficDisruption: boolean
  }
  aiTitle?: string
}

export interface IncidentReport {
  id: string
  title: string
  description: string
  category: string
  severity: "low" | "medium" | "high"
  location: {
    lat: number
    lng: number
    address: string
  }
  media: {
    url: string
    type: "image" | "video"
    analysis: MediaAnalysis
  }
  timestamp: Date
  status: "pending" | "verified" | "resolved"
  reporter: {
    id: string
    name: string
  }
  // Enhanced fields (optional)
  views?: number
  helpfulVotes?: number
  userComments?: string
}

class GeminiService {
  private apiKey: string
  private baseUrl = "https://generativelanguage.googleapis.com/v1beta"

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
    if (!this.apiKey) {
      console.warn("Gemini API key not configured. Using enhanced mock analysis.")
    }
  }

  async analyzeMedia(
    file: File, 
    location?: { lat: number; lng: number },
    options?: {
      enhanced?: boolean // Enable enhanced analysis features
      userContext?: { previousReports: number; trustScore: number }
    }
  ): Promise<MediaAnalysis> {
    if (!this.apiKey) {
      return this.getEnhancedMockAnalysis(file.name, location, options?.enhanced)
    }

    try {
      // Convert file to base64
      const base64Data = await this.fileToBase64(file)
      const mimeType = file.type

      const prompt = this.createEnhancedPrompt(file.type, location, options)

      const response = await fetch(`${this.baseUrl}/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            topK: 32,
            topP: 1,
            maxOutputTokens: options?.enhanced ? 2048 : 1024,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`)
      }

      const data = await response.json()
      const analysisText = data.candidates[0].content.parts[0].text

      // Parse JSON response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0])
        return {
          ...analysis,
          confidence: Math.min(100, Math.max(0, analysis.confidence || 85)),
        }
      }

      throw new Error("Invalid response format from Gemini")
    } catch (error) {
      console.error("Gemini analysis error:", error)
      return this.getEnhancedMockAnalysis(file.name, location, options?.enhanced)
    }
  }

  private createEnhancedPrompt(
    fileType: string,
    location?: { lat: number; lng: number },
    options?: {
      enhanced?: boolean
      userContext?: { previousReports: number; trustScore: number }
    }
  ): string {
    const mediaType = fileType.startsWith("image") ? "image" : "video"
    const isEnhanced = options?.enhanced || false

    let basePrompt = `
      Analyze this ${mediaType} for city incident reporting:
      
      1. Categorize the incident (traffic, infrastructure, weather, event, emergency, other)
      2. Assess severity (low, medium, high)
      3. Provide a clear description of what's happening
      4. Suggest relevant tags
      5. Recommend actions that should be taken
      6. Identify any visible landmarks or location indicators
      
      ${location ? `Location context: Latitude ${location.lat}, Longitude ${location.lng}` : ""}
      ${options?.userContext ? `User context: ${options.userContext.previousReports} previous reports, trust score: ${options.userContext.trustScore}/10` : ""}
    `

    if (isEnhanced) {
      basePrompt += `
      
      ENHANCED ANALYSIS (provide additional fields):
      7. Assess urgency level (1-10) and if immediate action is required
      8. Evaluate public safety risk level and affected radius
      9. Estimate economic impact and affected areas
      10. Generate a descriptive title for the incident
      `
    }

    const responseFormat = isEnhanced ? `
      {
        "category": "string",
        "severity": "low|medium|high",
        "description": "string",
        "tags": ["string"],
        "confidence": number (0-100),
        "suggestedActions": ["string"],
        "location": {
          "type": "string",
          "landmarks": ["string"]
        },
        "urgency": {
          "level": number (1-10),
          "requiresImmediateAction": boolean,
          "estimatedResolutionTime": "string"
        },
        "publicSafety": {
          "riskLevel": "none|low|moderate|high|severe",
          "affectedRadius": number,
          "vulnerableGroups": ["string"]
        },
        "economicImpact": {
          "estimatedCost": "string",
          "affectedBusinesses": boolean,
          "trafficDisruption": boolean
        },
        "aiTitle": "string"
      }
    ` : `
      {
        "category": "string",
        "severity": "low|medium|high",
        "description": "string",
        "tags": ["string"],
        "confidence": number (0-100),
        "suggestedActions": ["string"],
        "location": {
          "type": "string",
          "landmarks": ["string"]
        }
      }
    `

    return basePrompt + `\n\nRespond in JSON format with the following structure:${responseFormat}`
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  private getMockAnalysis(filename: string): MediaAnalysis {
    // Original mock analysis for backward compatibility
    const mockAnalyses = [
      {
        category: "traffic",
        severity: "high" as const,
        description: "Heavy traffic congestion detected with multiple vehicles at standstill",
        tags: ["traffic", "congestion", "road", "vehicles"],
        confidence: 87,
        suggestedActions: ["Alert traffic authorities", "Suggest alternate routes", "Monitor situation"],
        location: {
          type: "road intersection",
          landmarks: ["traffic signal", "commercial buildings"],
        },
      },
      {
        category: "infrastructure",
        severity: "medium" as const,
        description: "Pothole or road damage visible affecting vehicle movement",
        tags: ["pothole", "road damage", "infrastructure", "maintenance"],
        confidence: 92,
        suggestedActions: ["Report to municipal corporation", "Mark area for repair", "Issue public advisory"],
        location: {
          type: "road surface",
          landmarks: ["street signs", "nearby buildings"],
        },
      },
      {
        category: "weather",
        severity: "high" as const,
        description: "Waterlogging or flooding observed on street with water accumulation",
        tags: ["flooding", "waterlogging", "rain", "drainage"],
        confidence: 94,
        suggestedActions: ["Issue flood warning", "Deploy drainage teams", "Restrict traffic"],
        location: {
          type: "street level",
          landmarks: ["drainage systems", "road markings"],
        },
      },
    ]

    return mockAnalyses[Math.floor(Math.random() * mockAnalyses.length)]
  }

  private getEnhancedMockAnalysis(
    filename: string, 
    location?: { lat: number; lng: number },
    enhanced: boolean = false
  ): MediaAnalysis {
    const baseAnalysis = this.getMockAnalysis(filename)
    
    if (!enhanced) {
      return baseAnalysis
    }

    // Add enhanced fields for better functionality
    const enhancedAnalysis: MediaAnalysis = {
      ...baseAnalysis,
      urgency: {
        level: baseAnalysis.severity === 'high' ? 8 : baseAnalysis.severity === 'medium' ? 5 : 3,
        requiresImmediateAction: baseAnalysis.severity === 'high',
        estimatedResolutionTime: baseAnalysis.severity === 'high' ? '1-2 hours' : baseAnalysis.severity === 'medium' ? '2-6 hours' : '1-3 days'
      },
      publicSafety: {
        riskLevel: baseAnalysis.severity === 'high' ? 'high' : baseAnalysis.severity === 'medium' ? 'moderate' : 'low',
        affectedRadius: baseAnalysis.category === 'traffic' ? 500 : baseAnalysis.category === 'infrastructure' ? 100 : 200,
        vulnerableGroups: baseAnalysis.category === 'traffic' ? ['pedestrians', 'cyclists'] : ['general public']
      },
      economicImpact: {
        estimatedCost: baseAnalysis.severity === 'high' ? 'High - ₹50K-2L' : baseAnalysis.severity === 'medium' ? 'Medium - ₹10K-50K' : 'Low - Under ₹10K',
        affectedBusinesses: baseAnalysis.category === 'traffic' || baseAnalysis.category === 'infrastructure',
        trafficDisruption: baseAnalysis.category === 'traffic' || baseAnalysis.category === 'weather'
      },
      aiTitle: this.generateAITitle(baseAnalysis)
    }

    return enhancedAnalysis
  }

  private generateAITitle(analysis: MediaAnalysis): string {
    const categoryTitles = {
      traffic: "Traffic Congestion Detected",
      infrastructure: "Infrastructure Damage Reported",
      weather: "Weather-Related Incident",
      event: "Public Event in Progress",
      emergency: "Emergency Situation",
      other: "Community Incident Report",
    }

    const severityPrefixes = {
      high: "🚨 URGENT:",
      medium: "⚠️ ALERT:",
      low: "📍 INFO:",
    }

    const baseTitle = categoryTitles[analysis.category as keyof typeof categoryTitles] || "Incident Report"
    const prefix = severityPrefixes[analysis.severity]
    
    return `${prefix} ${baseTitle}`
  }

  async generateIncidentTitle(analysis: MediaAnalysis): Promise<string> {
    // Enhanced title generation
    if (analysis.aiTitle) {
      return analysis.aiTitle
    }

    const categoryTitles = {
      traffic: "Traffic Incident",
      infrastructure: "Infrastructure Issue",
      weather: "Weather-Related Event",
      event: "Public Event",
      emergency: "Emergency Situation",
      other: "Incident Report",
    }

    const baseTitle = categoryTitles[analysis.category as keyof typeof categoryTitles] || "Incident Report"

    // Add severity indicator
    const severityPrefix = {
      high: "🚨 Urgent:",
      medium: "⚠️ Alert:",
      low: "ℹ️ Notice:",
    }

    return `${severityPrefix[analysis.severity]} ${baseTitle}`
  }

  // New helper methods for enhanced functionality
  async analyzeMediaEnhanced(
    file: File, 
    location?: { lat: number; lng: number },
    userContext?: { previousReports: number; trustScore: number }
  ): Promise<MediaAnalysis> {
    return this.analyzeMedia(file, location, { 
      enhanced: true, 
      userContext 
    })
  }

  getCategoryIcon(category: string): string {
    const icons = {
      traffic: "🚗",
      infrastructure: "🏗️",
      weather: "🌧️",
      emergency: "🚨",
      event: "🎉",
      other: "📍"
    }
    return icons[category as keyof typeof icons] || "📍"
  }

  getSeverityColor(severity: string): string {
    const colors = {
      low: "#10B981",     // green
      medium: "#F59E0B",  // yellow
      high: "#EF4444"     // red
    }
    return colors[severity as keyof typeof colors] || "#6B7280"
  }

  formatTimeAgo(timestamp: Date): string {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  // Validation helpers
  validateFile(file: File): { isValid: boolean; error?: string } {
    const validTypes = [
      'image/jpeg', 'image/png', 'image/webp', 
      'video/mp4', 'video/webm', 'video/quicktime'
    ]
    
    if (!validTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Invalid file type. Please upload JPEG, PNG, WebP images or MP4, WebM, MOV videos.'
      }
    }
    
    if (file.size > 100 * 1024 * 1024) { // 100MB
      return {
        isValid: false,
        error: 'File size too large. Maximum size is 100MB.'
      }
    }
    
    return { isValid: true }
  }

  validateLocation(location: { lat: number; lng: number }): { isValid: boolean; error?: string } {
    if (isNaN(location.lat) || isNaN(location.lng)) {
      return {
        isValid: false,
        error: 'Invalid location coordinates'
      }
    }
    
    if (location.lat < -90 || location.lat > 90 || location.lng < -180 || location.lng > 180) {
      return {
        isValid: false,
        error: 'Location coordinates out of valid range'
      }
    }
    
    return { isValid: true }
  }
}

export const geminiService = new GeminiService()