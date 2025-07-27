// app/(main)/report/page.tsx (Enhanced with complete multimodal citizen reporting)
"use client"

import type React from "react"
import { useState, useActionState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useLocation } from "@/contexts/location-context"
import { CityMap } from "@/components/maps/city-map"
import { 
  Loader2, 
  CheckCircle, 
  AlertTriangle, 
  Camera, 
  Video, 
  X, 
  MapPin, 
  Brain, 
  Zap, 
  User, 
  Clock, 
  Shield, 
  TrendingUp,
  Upload,
  Eye,
  ThumbsUp,
  Star,
  Award,
  Activity
} from "lucide-react"
import { submitMultimodalReport } from "./action"
import { geminiService, type MediaAnalysis } from "@/lib/gemini-service"

// Enhanced user report interface
interface UserReport {
  id: string
  userId: string
  userName: string
  userEmail?: string
  location: {
    lat: number
    lng: number
    address?: string
  }
  media: {
    url: string
    type: 'image' | 'video'
    fileName: string
    size: number
  }
  analysis: {
    category: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    description: string
    tags: string[]
    confidence: number
    suggestedActions: string[]
    landmarks: string[]
    aiTitle: string
  }
  userComments?: string
  timestamp: Date
  status: 'pending' | 'analyzed' | 'verified' | 'resolved'
  views: number
  helpfulVotes: number
}

// Simple user management
const getCurrentUser = () => {
  if (typeof window === 'undefined') return null
  
  try {
    const userData = localStorage.getItem('xphora_user')
    if (userData) {
      return JSON.parse(userData)
    }
    
    // Create anonymous user if none exists
    const anonymousUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `Citizen ${Math.floor(Math.random() * 1000)}`,
      email: undefined
    }
    localStorage.setItem('xphora_user', JSON.stringify(anonymousUser))
    return anonymousUser
  } catch (error) {
    console.error('Error managing user:', error)
    return null
  }
}

// Enhanced report storage
const saveReport = (reportData: Omit<UserReport, 'id' | 'timestamp' | 'views' | 'helpfulVotes' | 'status'>): string => {
  try {
    const reports = getStoredReports()
    const newReport: UserReport = {
      ...reportData,
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      views: 0,
      helpfulVotes: 0,
      status: 'analyzed'
    }

    reports.unshift(newReport) // Add to beginning (newest first)
    localStorage.setItem('xphora_reports', JSON.stringify(reports))
    
    console.log('Report saved successfully:', newReport.id)
    return newReport.id
  } catch (error) {
    console.error('Error saving report:', error)
    throw new Error('Failed to save report')
  }
}

const getStoredReports = (): UserReport[] => {
  try {
    const reportsData = localStorage.getItem('xphora_reports')
    if (!reportsData) return []
    
    const reports = JSON.parse(reportsData)
    return reports.map((report: any) => ({
      ...report,
      timestamp: new Date(report.timestamp)
    }))
  } catch (error) {
    console.error('Error getting reports:', error)
    return []
  }
}

export default function ReportPage() {
  const [state, formAction, isPending] = useActionState(submitMultimodalReport, null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<MediaAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentUser, setCurrentUser] = useState<{id: string; name: string; email?: string} | null>(null)
  const [submissionSuccess, setSubmissionSuccess] = useState(false)
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [step, setStep] = useState(1) // 1: Upload, 2: Analyze, 3: Review, 4: Success
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { coords } = useLocation()

  // Initialize user and sample data on component mount
  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
    initializeSampleData()
  }, [])

  // Initialize comprehensive sample data for demonstration
  const initializeSampleData = () => {
    const existingReports = getStoredReports()
    if (existingReports.length > 0) return

    const sampleReports: Omit<UserReport, 'id' | 'timestamp' | 'views' | 'helpfulVotes' | 'status'>[] = [
      {
        userId: 'sample_user_1',
        userName: 'Priya Sharma',
        userEmail: 'priya@example.com',
        location: { lat: 12.9716, lng: 77.5946, address: 'MG Road, Bengaluru' },
        media: {
          url: '/placeholder.jpg',
          type: 'image',
          fileName: 'traffic_jam.jpg',
          size: 1024000
        },
        analysis: {
          category: 'traffic',
          severity: 'high',
          description: 'Heavy traffic congestion causing significant delays during peak hours. Multiple lanes affected with vehicles at standstill.',
          tags: ['congestion', 'peak-hour', 'vehicles', 'delay', 'junction'],
          confidence: 92,
          suggestedActions: ['Deploy traffic coordinators', 'Activate alternate route guidance', 'Contact traffic authorities'],
          landmarks: ['MG Road Metro Station', 'Trinity Circle', 'Commercial Street Junction'],
          aiTitle: '🚨 URGENT: Major Traffic Congestion on MG Road'
        },
        userComments: 'Traffic has been like this for the past 30 minutes. Alternative route via Richmond Road is also congested. Suggest using metro.'
      },
      {
        userId: 'sample_user_2',
        userName: 'Rajesh Kumar',
        userEmail: 'rajesh@example.com',
        location: { lat: 12.9698, lng: 77.6048, address: 'Koramangala, Bengaluru' },
        media: {
          url: '/placeholder.jpg',
          type: 'image',
          fileName: 'waterlogging.jpg',
          size: 856000
        },
        analysis: {
          category: 'infrastructure',
          severity: 'medium',
          description: 'Water logging on main road due to poor drainage system. Affecting pedestrian and vehicle movement.',
          tags: ['waterlogging', 'drainage', 'rain', 'infrastructure', 'pedestrian-safety'],
          confidence: 88,
          suggestedActions: ['Report to BBMP', 'Deploy pumping systems', 'Avoid the area', 'Use elevated walkways'],
          landmarks: ['Forum Mall', 'Koramangala Bus Stop', 'Jyoti Nivas College'],
          aiTitle: '⚠️ ALERT: Waterlogging Issue Near Forum Mall'
        },
        userComments: 'This happens every time it rains. The drainage system needs urgent attention. Water is knee-deep in some areas.'
      },
      {
        userId: 'sample_user_3',
        userName: 'Anita Reddy',
        userEmail: 'anita@example.com',
        location: { lat: 12.9279, lng: 77.6271, address: 'HSR Layout, Bengaluru' },
        media: {
          url: '/placeholder.jpg',
          type: 'image',
          fileName: 'pothole.jpg',
          size: 742000
        },
        analysis: {
          category: 'infrastructure',
          severity: 'critical',
          description: 'Large pothole causing vehicle damage and safety hazard. Multiple vehicles have been affected.',
          tags: ['pothole', 'road-damage', 'vehicle-safety', 'urgent-repair'],
          confidence: 95,
          suggestedActions: ['Immediate road repair', 'Deploy safety barriers', 'Issue public advisory'],
          landmarks: ['HSR Layout Main Road', 'BDA Complex', 'Agara Lake'],
          aiTitle: '🚨 CRITICAL: Large Pothole on HSR Layout Main Road'
        },
        userComments: 'This pothole has caused damage to at least 5 vehicles today. Needs immediate attention before someone gets seriously hurt.'
      },
      {
        userId: 'sample_user_4',
        userName: 'Vikram Singh',
        userEmail: 'vikram@example.com',
        location: { lat: 12.9352, lng: 77.6245, address: 'BTM Layout, Bengaluru' },
        media: {
          url: '/placeholder.jpg',
          type: 'video',
          fileName: 'community_event.mp4',
          size: 2100000
        },
        analysis: {
          category: 'social',
          severity: 'low',
          description: 'Community cultural event in progress with good crowd management. Temporary traffic diversion in place.',
          tags: ['community-event', 'cultural', 'crowd', 'traffic-diversion'],
          confidence: 90,
          suggestedActions: ['Monitor crowd levels', 'Maintain traffic flow', 'Ensure safety protocols'],
          landmarks: ['BTM Layout Park', 'Madiwala Market', 'BTM Bus Depot'],
          aiTitle: '📍 INFO: Community Cultural Event at BTM Layout'
        },
        userComments: 'Beautiful community event celebrating local culture. Well organized with proper crowd control measures.'
      }
    ]

    // Add some views and votes to make it realistic
    sampleReports.forEach((reportData, index) => {
      const reportId = saveReport(reportData)
      
      // Simulate some engagement
      const reports = getStoredReports()
      const reportIndex = reports.findIndex(r => r.id === reportId)
      if (reportIndex !== -1) {
        reports[reportIndex].views = Math.floor(Math.random() * 50) + 10
        reports[reportIndex].helpfulVotes = Math.floor(Math.random() * 20) + 5
        if (index === 2) reports[reportIndex].status = 'verified' // Mark pothole as verified
        localStorage.setItem('xphora_reports', JSON.stringify(reports))
      }
    })
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    await processFile(file)
  }

  const processFile = async (file: File) => {
    // Enhanced file validation using gemini service
    const validation = geminiService.validateFile ? geminiService.validateFile(file) : { isValid: true }
    if (!validation.isValid) {
      alert(validation.error || 'Invalid file')
      return
    }

    setSelectedFile(file)
    setStep(2)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setFilePreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Enhanced AI analysis
    setIsAnalyzing(true)
    try {
      // Try enhanced analysis first, fallback to regular if not available
      let mediaAnalysis: MediaAnalysis
      if (geminiService.analyzeMediaEnhanced) {
        const userContext = currentUser ? {
          previousReports: getStoredReports().filter(r => r.userId === currentUser.id).length,
          trustScore: 8
        } : undefined

        mediaAnalysis = await geminiService.analyzeMediaEnhanced(file, coords || undefined, userContext)
      } else {
        mediaAnalysis = await geminiService.analyzeMedia(file, coords || undefined)
      }
      
      setAnalysis(mediaAnalysis)
      setStep(3)
    } catch (error) {
      console.error("Analysis failed:", error)
      // Still allow submission with fallback analysis
      setAnalysis({
        category: 'other',
        severity: 'medium',
        description: 'Manual review required - AI analysis unavailable',
        tags: ['manual-review'],
        confidence: 60,
        suggestedActions: ['Manual inspection needed'],
        location: {
          type: 'unknown',
          landmarks: []
        }
      })
      setStep(3)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Enhanced drag and drop handlers
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      processFile(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const removeFile = () => {
    setSelectedFile(null)
    setFilePreview(null)
    setAnalysis(null)
    setIsAnalyzing(false)
    setStep(1)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Enhanced form submission with storage
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    
    if (!selectedFile || !currentUser || !coords) {
      alert('Please ensure you have uploaded a file, user is set, and location is available.')
      return
    }

    try {
      // Create media URL (in real implementation, this would be uploaded to cloud storage)
      const mediaUrl = URL.createObjectURL(selectedFile)
      
      // Get form data
      const formData = new FormData(event.currentTarget)
      const userComments = formData.get('comments') as string

      // Generate title using AI if analysis available
      const aiTitle = analysis 
        ? await geminiService.generateIncidentTitle(analysis)
        : `Incident Report - ${selectedFile.name}`

      // Prepare enhanced report data
      const reportData: Omit<UserReport, 'id' | 'timestamp' | 'views' | 'helpfulVotes' | 'status'> = {
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        location: {
          lat: coords.lat,
          lng: coords.lng,
          address: `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`
        },
        media: {
          url: mediaUrl,
          type: selectedFile.type.startsWith('video/') ? 'video' : 'image',
          fileName: selectedFile.name,
          size: selectedFile.size
        },
        analysis: analysis ? {
          category: analysis.category,
          severity: analysis.severity as 'low' | 'medium' | 'high' | 'critical',
          description: analysis.description,
          tags: analysis.tags,
          confidence: analysis.confidence,
          suggestedActions: analysis.suggestedActions,
          landmarks: analysis.location?.landmarks || [],
          aiTitle: analysis.aiTitle || aiTitle
        } : {
          category: 'general',
          severity: 'medium' as const,
          description: 'User submitted incident report',
          tags: ['user-report'],
          confidence: 70,
          suggestedActions: ['Review required'],
          landmarks: [],
          aiTitle: aiTitle
        },
        userComments: userComments.trim() || undefined
      }

      // Save report to storage
      const reportId = saveReport(reportData)
      
      setSubmissionSuccess(true)
      setSubmittedReportId(reportId)
      setStep(4)

      // Reset form after delay
      setTimeout(() => {
        resetForm()
      }, 5000)

    } catch (error) {
      console.error('Submission failed:', error)
      alert('Failed to submit report. Please try again.')
    }
  }

  const resetForm = () => {
    setSelectedFile(null)
    setFilePreview(null)
    setAnalysis(null)
    setSubmissionSuccess(false)
    setSubmittedReportId(null)
    setStep(1)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500/10 text-red-600 border-red-200"
      case "high":
        return "bg-orange-500/10 text-orange-600 border-orange-200"
      case "medium":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-200"
      case "low":
        return "bg-green-500/10 text-green-600 border-green-200"
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-200"
    }
  }

  // Get user's report statistics
  const getUserStats = () => {
    const userReports = getStoredReports().filter(r => r.userId === currentUser?.id)
    return {
      totalReports: userReports.length,
      totalViews: userReports.reduce((sum, r) => sum + r.views, 0),
      totalHelpful: userReports.reduce((sum, r) => sum + r.helpfulVotes, 0),
      resolvedReports: userReports.filter(r => r.status === 'resolved').length
    }
  }

  const userStats = getUserStats()

  return (
    <div className="p-4 space-y-6">
      {/* Enhanced header with user info and progress */}
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Submit Incident Report</h1>
            <p className="text-sm text-muted-foreground">Help your community with AI-powered reporting</p>
          </div>
          {currentUser && (
            <div className="text-center">
              <div className="flex items-center gap-2 text-sm bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-full border">
                <User className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-700">{currentUser.name}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {userStats.totalReports} reports • {userStats.totalViews} views
              </div>
            </div>
          )}
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3, 4].map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step >= stepNum 
                  ? stepNum === 4 ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {stepNum === 4 && step >= 4 ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  stepNum
                )}
              </div>
              {stepNum < 4 && (
                <div className={`w-12 h-1 mx-2 rounded ${
                  step > stepNum ? 'bg-blue-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Success message */}
      {submissionSuccess && step === 4 && (
        <Card className="w-full max-w-lg mx-auto border-green-500 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-green-800 mb-3">Report Submitted Successfully!</h3>
            <p className="text-green-700 mb-4">
              {analysis 
                ? `AI detected: ${analysis.category} incident with ${analysis.severity} severity. ${
                    analysis.severity === 'critical' || analysis.severity === 'high' 
                      ? 'Emergency authorities have been notified automatically.'
                      : 'Relevant authorities have been notified.'
                  }`
                : 'Your report has been submitted for review by our team.'
              }
            </p>
            {submittedReportId && (
              <div className="bg-white p-4 rounded-lg mb-4 border border-green-200">
                <div className="text-sm text-gray-600 mb-2">
                  <strong>Report ID:</strong> 
                </div>
                <code className="bg-gray-100 px-3 py-2 rounded text-sm font-mono">
                  {submittedReportId}
                </code>
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={resetForm} className="flex-1">
                Submit Another Report
              </Button>
              <Button onClick={() => window.location.href = '/map'} className="flex-1">
                View on Map
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main form */}
      {!submissionSuccess && (
        <Card className="w-full max-w-lg mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI-Powered Incident Report
            </CardTitle>
            <CardDescription>Upload a photo or video and let AI analyze the situation automatically.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Enhanced Media Upload with drag & drop */}
              {step >= 1 && (
                <div>
                  <Label htmlFor="media">Upload Photo or Video</Label>
                  <div className="mt-2">
                    {!selectedFile ? (
                      <div 
                        className={`flex justify-center rounded-xl border-2 border-dashed px-6 py-12 transition-all cursor-pointer ${
                          dragActive 
                            ? 'border-blue-500 bg-blue-50 scale-105' 
                            : 'border-border hover:border-primary/50'
                        }`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <div className="text-center">
                          <div className="flex justify-center gap-2 mb-4">
                            <Camera className="h-8 w-8 text-muted-foreground" />
                            <Video className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <div className="mt-4 flex text-sm leading-6 text-muted-foreground">
                            <span className="font-semibold text-primary">
                              Click to upload
                            </span>
                            <span className="pl-1">or drag and drop</span>
                          </div>
                          <p className="text-xs leading-5 text-muted-foreground mt-2">
                            Images: PNG, JPG, WebP up to 50MB
                            <br />
                            Videos: MP4, WebM up to 50MB
                          </p>
                          <input
                            ref={fileInputRef}
                            id="media"
                            name="media"
                            type="file"
                            className="hidden"
                            accept="image/*,video/*"
                            onChange={handleFileChange}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="rounded-lg border overflow-hidden">
                          {selectedFile.type.startsWith("image/") ? (
                            <img
                              src={filePreview || ''}
                              alt="Preview"
                              className="w-full h-48 object-cover"
                            />
                          ) : (
                            <video
                              src={filePreview || ''}
                              className="w-full h-48 object-cover"
                              controls
                            />
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={removeFile}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <div className="mt-3 p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-2 text-sm">
                            <Upload className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{selectedFile.name}</span>
                            <Badge variant="secondary">
                              {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: AI Analysis Loading */}
              {step >= 2 && isAnalyzing && (
                <Card className="border-blue-200 bg-blue-50/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Brain className="h-6 w-6 text-blue-600" />
                        <div className="absolute -top-1 -right-1">
                          <Zap className="h-3 w-3 text-yellow-500 animate-pulse" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-blue-800">AI Analysis in Progress</h3>
                        <p className="text-sm text-blue-600">Analyzing your media for incident detection...</p>
                      </div>
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600 ml-auto" />
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                      </div>
                      <p className="text-xs text-blue-600">Processing visual content and location data...</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: AI Analysis Results */}
              {step >= 3 && analysis && !isAnalyzing && (
                <div className="space-y-4">
                  <Card className="border-green-200 bg-green-50/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="h-5 w-5" />
                        AI Analysis Complete
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* AI Generated Title */}
                      <div>
                        <Label className="text-sm font-medium">AI Generated Title</Label>
                        <div className="mt-1 p-3 bg-white rounded-lg border">
                          <p className="font-medium text-gray-900">{analysis.aiTitle || 'Incident Detected'}</p>
                        </div>
                      </div>

                      {/* Category and Severity */}
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <Label className="text-sm font-medium">Category</Label>
                          <Badge variant="outline" className="mt-1 capitalize">
                            {analysis.category}
                          </Badge>
                        </div>
                        <div className="flex-1">
                          <Label className="text-sm font-medium">Severity</Label>
                          <Badge className={`mt-1 capitalize ${getSeverityStyle(analysis.severity)}`}>
                            {analysis.severity}
                          </Badge>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <Label className="text-sm font-medium">AI Description</Label>
                        <div className="mt-1 p-3 bg-white rounded-lg border">
                          <p className="text-sm text-gray-700">{analysis.description}</p>
                        </div>
                      </div>

                      {/* Tags */}
                      {analysis.tags && analysis.tags.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium">Detected Tags</Label>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {analysis.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Confidence Score */}
                      <div>
                        <Label className="text-sm font-medium">AI Confidence</Label>
                        <div className="mt-1 flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{width: `${analysis.confidence}%`}}
                            />
                          </div>
                          <span className="text-sm font-medium">{analysis.confidence}%</span>
                        </div>
                      </div>

                      {/* Suggested Actions */}
                      {analysis.suggestedActions && analysis.suggestedActions.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium">Suggested Actions</Label>
                          <div className="mt-1 space-y-1">
                            {analysis.suggestedActions.map((action, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                <AlertTriangle className="h-3 w-3 text-amber-500" />
                                <span>{action}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Landmarks */}
                      {analysis.location?.landmarks && analysis.location.landmarks.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium">Nearby Landmarks</Label>
                          <div className="mt-1 space-y-1">
                            {analysis.location.landmarks.map((landmark, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                <MapPin className="h-3 w-3 text-blue-500" />
                                <span>{landmark}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Hidden input for analysis data */}
                  <input
                    type="hidden"
                    name="analysis"
                    value={JSON.stringify(analysis)}
                  />
                </div>
              )}

              {/* Location Information */}
              {coords && (
                <div>
                  <Label htmlFor="location">Location</Label>
                  <div className="mt-2 p-3 bg-muted rounded-lg flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                    </span>
                    <Badge variant="secondary" className="ml-auto">
                      <Activity className="h-3 w-3 mr-1" />
                      Live GPS
                    </Badge>
                  </div>
                  <input type="hidden" name="latitude" value={coords.lat} />
                  <input type="hidden" name="longitude" value={coords.lng} />
                </div>
              )}

              {/* Additional Comments */}
              <div>
                <Label htmlFor="comments">Additional Comments (Optional)</Label>
                <Textarea
                  id="comments"
                  name="comments"
                  placeholder="Provide any additional context or details about the incident..."
                  className="mt-2"
                  rows={3}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!selectedFile || !coords || isPending || isAnalyzing}
                className="w-full"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting Report...
                  </>
                ) : isAnalyzing ? (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Submit Report
                  </>
                )}
              </Button>

              {/* Status Messages */}
              {state?.error && (
                <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-700">{state.message}</span>
                  </div>
                </div>
              )}

              {state?.success && (
                <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700">{state.message}</span>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      )}

      {/* Live Map Preview */}
      {coords && (
        <Card className="w-full max-w-lg mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Incident Location
            </CardTitle>
            <CardDescription>
              Your report will be geotagged to this location
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video rounded-lg overflow-hidden border">
              <CityMap />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}