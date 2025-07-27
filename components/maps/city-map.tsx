// components/maps/city-map.tsx (Enhanced with complete multimodal citizen reporting)
"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { mobileMapOptions, mapOptions } from "@/lib/map-utils"
import { Loader2, Eye, ThumbsUp, Clock, User, MapPin, Star } from "lucide-react"

interface CityMapProps {
  fullscreen?: boolean
  initialCenter?: { lat: number; lng: number }
  initialZoom?: number
  // Enhanced props for multimodal reporting
  showReports?: boolean
  reports?: UserReport[]
  onReportSelect?: (report: UserReport | null) => void
  selectedReport?: UserReport | null
  activeFilters?: string[]
  onReportView?: (reportId: string) => void
}

// Enhanced user report interface
export interface UserReport {
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

// Global map loading state to prevent multiple script loads
let isGoogleMapsLoaded = false
let googleMapsPromise: Promise<void> | null = null

const loadGoogleMapsScript = (): Promise<void> => {
  if (isGoogleMapsLoaded && window.google?.maps) {
    return Promise.resolve()
  }

  if (googleMapsPromise) {
    return googleMapsPromise
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    // Check if script already exists
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      if (window.google?.maps) {
        isGoogleMapsLoaded = true
        resolve()
        return
      }
      // Wait for existing script to load
      existingScript.addEventListener('load', () => {
        isGoogleMapsLoaded = true
        resolve()
      })
      existingScript.addEventListener('error', reject)
      return
    }

    // Create new script
    const script = document.createElement('script')
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    
    if (!apiKey) {
      reject(new Error('Google Maps API key not configured'))
      return
    }

    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`
    script.async = true
    script.defer = true
    
    script.onload = () => {
      isGoogleMapsLoaded = true
      resolve()
    }
    
    script.onerror = () => {
      googleMapsPromise = null
      reject(new Error('Failed to load Google Maps script'))
    }

    document.head.appendChild(script)
  })

  return googleMapsPromise
}

export function CityMap({ 
  fullscreen = false, 
  initialCenter, 
  initialZoom,
  showReports = false,
  reports = [],
  onReportSelect,
  selectedReport,
  activeFilters = [],
  onReportView
}: CityMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)
  const reportMarkersRef = useRef<google.maps.Marker[]>([])
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)
  const isInitialized = useRef(false)
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get stored reports from localStorage
  const getStoredReports = useCallback((): UserReport[] => {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem('xphora_reports')
      if (stored) {
        const parsed = JSON.parse(stored)
        return parsed.map((report: any) => ({
          ...report,
          timestamp: new Date(report.timestamp)
        }))
      }
    } catch (error) {
      console.error('Error loading stored reports:', error)
    }
    return []
  }, [])

  // Get filtered reports
  const getFilteredReports = useCallback((): UserReport[] => {
    const allReports = reports.length > 0 ? reports : getStoredReports()
    if (!showReports) return []
    
    if (activeFilters.length === 0) return allReports
    
    return allReports.filter(report => 
      activeFilters.includes(report.analysis.category) ||
      activeFilters.includes(report.analysis.severity)
    )
  }, [reports, getStoredReports, showReports, activeFilters])

  // Helper functions for markers
  const getCategoryIcon = (category: string): string => {
    const icons = {
      traffic: '🚗',
      infrastructure: '🏗️',
      weather: '🌧️',
      emergency: '🚨',
      environmental: '🌿',
      social: '👥',
      event: '🎉',
      other: '📍'
    }
    return icons[category as keyof typeof icons] || '📍'
  }

  const getSeverityColor = (severity: string): string => {
    const colors = {
      low: '#10B981',      // green
      medium: '#F59E0B',   // yellow  
      high: '#EF4444',     // red
      critical: '#DC2626'  // dark red
    }
    return colors[severity as keyof typeof colors] || '#6B7280'
  }

  const getTimeAgo = (timestamp: Date): string => {
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

  // Create comprehensive info window content
  const createInfoWindowContent = (report: UserReport): string => {
    const timeAgo = getTimeAgo(report.timestamp)
    const icon = getCategoryIcon(report.analysis.category)
    const severityColor = getSeverityColor(report.analysis.severity)
    
    return `
      <div style="max-width: 320px; padding: 16px; font-family: system-ui, -apple-system, sans-serif; line-height: 1.5;">
        <!-- Header with user info -->
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #e5e7eb;">
          <div style="
            width: 44px; 
            height: 44px; 
            background: linear-gradient(135deg, #3B82F6, #8B5CF6); 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            color: white; 
            font-weight: bold;
            font-size: 18px;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          ">
            ${report.userName.charAt(0).toUpperCase()}
          </div>
          <div style="flex: 1;">
            <div style="font-weight: 700; color: #111827; font-size: 16px; margin-bottom: 2px;">${report.userName}</div>
            <div style="font-size: 13px; color: #6B7280; display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 14px;">⏰</span> ${timeAgo}
              <span style="margin-left: 8px; padding: 2px 6px; background: #F3F4F6; border-radius: 8px; font-size: 11px;">
                ${report.analysis.confidence}% AI
              </span>
            </div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 28px; margin-bottom: 4px;">${icon}</div>
            <div style="font-size: 10px; color: #6B7280; text-transform: uppercase; font-weight: 600;">
              ${report.analysis.category}
            </div>
          </div>
        </div>
        
        <!-- Title and severity with enhanced styling -->
        <div style="margin-bottom: 14px;">
          <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 700; color: #111827; line-height: 1.3;">
            ${report.analysis.aiTitle}
          </h3>
          
          <div style="display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap;">
            <span style="
              padding: 4px 12px;
              background: ${severityColor};
              color: white;
              border-radius: 16px;
              font-size: 12px;
              font-weight: 700;
              text-transform: uppercase;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            ">
              ${report.analysis.severity}
            </span>
            <span style="
              padding: 4px 12px;
              background: #F3F4F6;
              color: #6B7280;
              border-radius: 16px;
              font-size: 12px;
              font-weight: 600;
              text-transform: capitalize;
            ">
              ${report.status}
            </span>
          </div>
        </div>
        
        <!-- Description with better formatting -->
        <div style="margin-bottom: 12px;">
          <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.5; background: #F9FAFB; padding: 12px; border-radius: 8px; border-left: 4px solid ${severityColor};">
            ${report.analysis.description.substring(0, 160)}${report.analysis.description.length > 160 ? '...' : ''}
          </p>
        </div>
        
        <!-- User Comments with enhanced styling -->
        ${report.userComments ? `
          <div style="margin-bottom: 12px; padding: 12px; background: linear-gradient(135deg, #EBF8FF, #F0F9FF); border-radius: 8px; border: 1px solid #BFDBFE;">
            <div style="font-size: 11px; font-weight: 600; color: #1D4ED8; margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
              💬 Reporter Comments
            </div>
            <p style="margin: 0; color: #1E40AF; font-size: 13px; font-style: italic; line-height: 1.4;">
              "${report.userComments.substring(0, 120)}${report.userComments.length > 120 ? '...' : ''}"
            </p>
          </div>
        ` : ''}
        
        <!-- Suggested Actions for urgent reports -->
        ${report.analysis.severity === 'high' || report.analysis.severity === 'critical' ? `
          <div style="margin-bottom: 12px; padding: 10px; background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px;">
            <div style="font-size: 12px; font-weight: 700; color: #DC2626; margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
              ⚠️ URGENT ACTIONS NEEDED
            </div>
            <div style="font-size: 12px; color: #B91C1C; line-height: 1.4;">
              ${report.analysis.suggestedActions.slice(0, 2).join(' • ')}
            </div>
          </div>
        ` : ''}
        
        <!-- Tags with better design -->
        ${report.analysis.tags.length > 0 ? `
          <div style="margin-bottom: 12px;">
            <div style="font-size: 12px; color: #6B7280; margin-bottom: 6px; font-weight: 600;">🏷️ Tags:</div>
            <div style="display: flex; flex-wrap: wrap; gap: 4px;">
              ${report.analysis.tags.slice(0, 5).map(tag => `
                <span style="
                  padding: 3px 8px;
                  background: linear-gradient(135deg, #F3F4F6, #E5E7EB);
                  color: #4B5563;
                  border-radius: 10px;
                  font-size: 10px;
                  font-weight: 500;
                  border: 1px solid #D1D5DB;
                ">
                  #${tag}
                </span>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        <!-- Enhanced stats and actions section -->
        <div style="border-top: 2px solid #E5E7EB; padding-top: 12px; margin-top: 12px;">
          <div style="display: flex; align-items: center; justify-between; margin-bottom: 12px;">
            <div style="display: flex; gap: 16px; font-size: 12px; color: #6B7280;">
              <span style="display: flex; align-items: center; gap: 4px; font-weight: 600;">
                <span style="font-size: 14px;">👁️</span> ${report.views} views
              </span>
              <span style="display: flex; align-items: center; gap: 4px; font-weight: 600;">
                <span style="font-size: 14px;">👍</span> ${report.helpfulVotes} helpful
              </span>
              <span style="display: flex; align-items: center; gap: 4px; font-weight: 600;">
                <span style="font-size: 14px;">⭐</span> ${report.analysis.confidence}%
              </span>
            </div>
          </div>
          
          <!-- Action buttons with modern design -->
          <div style="display: flex; gap: 8px;">
            <button onclick="window.postMessage({type: 'HELPFUL_VOTE', reportId: '${report.id}'}, '*')" 
                    style="
                      flex: 1;
                      background: linear-gradient(135deg, #F3F4F6, #E5E7EB);
                      color: #4B5563;
                      border: 1px solid #D1D5DB;
                      padding: 8px 12px;
                      border-radius: 8px;
                      font-size: 11px;
                      font-weight: 600;
                      cursor: pointer;
                      transition: all 0.2s;
                    " 
                    onmouseover="this.style.background='linear-gradient(135deg, #E5E7EB, #D1D5DB)'"
                    onmouseout="this.style.background='linear-gradient(135deg, #F3F4F6, #E5E7EB)'">
              👍 Mark Helpful
            </button>
            <button onclick="window.postMessage({type: 'VIEW_DETAILS', reportId: '${report.id}'}, '*')" 
                    style="
                      flex: 1;
                      background: linear-gradient(135deg, #3B82F6, #2563EB);
                      color: white;
                      border: none;
                      padding: 8px 12px;
                      border-radius: 8px;
                      font-size: 11px;
                      font-weight: 600;
                      cursor: pointer;
                      box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
                      transition: all 0.2s;
                    "
                    onmouseover="this.style.background='linear-gradient(135deg, #2563EB, #1D4ED8)'"
                    onmouseout="this.style.background='linear-gradient(135deg, #3B82F6, #2563EB)'">
              📋 View Details
            </button>
          </div>
        </div>
        
        <!-- Landmark info if available -->
        ${report.analysis.landmarks.length > 0 ? `
          <div style="margin-top: 12px; padding: 8px; background: #F0FDF4; border-radius: 6px; border-left: 3px solid #10B981;">
            <div style="font-size: 11px; font-weight: 600; color: #059669; margin-bottom: 4px;">
              📍 Nearby Landmarks
            </div>
            <div style="font-size: 11px; color: #047857;">
              ${report.analysis.landmarks.slice(0, 3).join(' • ')}
            </div>
          </div>
        ` : ''}
      </div>
    `
  }

  // Show info window for a report
  const showReportInfoWindow = (report: UserReport, marker: google.maps.Marker) => {
    if (!infoWindowRef.current) {
      infoWindowRef.current = new google.maps.InfoWindow({
        maxWidth: 350
      })
    }

    const content = createInfoWindowContent(report)
    infoWindowRef.current.setContent(content)
    infoWindowRef.current.open(mapInstanceRef.current, marker)

    // Increment view count
    incrementReportViews(report.id)
  }

  // Increment view count for a report
  const incrementReportViews = (reportId: string) => {
    try {
      const reports = getStoredReports()
      const reportIndex = reports.findIndex(r => r.id === reportId)
      if (reportIndex !== -1) {
        reports[reportIndex].views += 1
        localStorage.setItem('xphora_reports', JSON.stringify(reports))
      }
    } catch (error) {
      console.error('Error incrementing views:', error)
    }
  }

  // Add helpful vote to a report
  const addHelpfulVote = (reportId: string) => {
    try {
      const reports = getStoredReports()
      const reportIndex = reports.findIndex(r => r.id === reportId)
      if (reportIndex !== -1) {
        reports[reportIndex].helpfulVotes += 1
        localStorage.setItem('xphora_reports', JSON.stringify(reports))
        
        // Refresh info window if it's the selected report
        const marker = reportMarkersRef.current.find(m => m.getTitle() === reports[reportIndex].analysis.aiTitle)
        if (marker && infoWindowRef.current) {
          showReportInfoWindow(reports[reportIndex], marker)
        }
      }
    } catch (error) {
      console.error('Error adding helpful vote:', error)
    }
  }

  // Create enhanced report markers on the map
  const createReportMarkers = useCallback(() => {
    if (!mapInstanceRef.current || !showReports) return

    // Clear existing report markers
    reportMarkersRef.current.forEach(marker => marker.setMap(null))
    reportMarkersRef.current = []

    const reportsToShow = getFilteredReports()

    reportsToShow.forEach((report) => {
      if (!mapInstanceRef.current) return

      // Create enhanced marker based on severity
      const severityConfig = {
        low: { scale: 12, strokeWeight: 2, zIndex: 1 },
        medium: { scale: 14, strokeWeight: 3, zIndex: 2 },
        high: { scale: 16, strokeWeight: 4, zIndex: 3 },
        critical: { scale: 18, strokeWeight: 5, zIndex: 4 }
      }

      const config = severityConfig[report.analysis.severity as keyof typeof severityConfig] || severityConfig.medium

      const marker = new google.maps.Marker({
        position: { lat: report.location.lat, lng: report.location.lng },
        map: mapInstanceRef.current,
        title: report.analysis.aiTitle,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: config.scale,
          fillColor: getSeverityColor(report.analysis.severity),
          fillOpacity: 0.9,
          strokeColor: '#ffffff',
          strokeWeight: config.strokeWeight,
          strokeOpacity: 1
        },
        zIndex: config.zIndex,
        animation: report.analysis.severity === 'critical' ? google.maps.Animation.BOUNCE : undefined
      })

      // Add hover effect
      marker.addListener('mouseover', () => {
        marker.setIcon({
          path: google.maps.SymbolPath.CIRCLE,
          scale: config.scale + 2,
          fillColor: getSeverityColor(report.analysis.severity),
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: config.strokeWeight + 1,
          strokeOpacity: 1
        })
      })

      marker.addListener('mouseout', () => {
        marker.setIcon({
          path: google.maps.SymbolPath.CIRCLE,
          scale: config.scale,
          fillColor: getSeverityColor(report.analysis.severity),
          fillOpacity: 0.9,
          strokeColor: '#ffffff',
          strokeWeight: config.strokeWeight,
          strokeOpacity: 1
        })
      })

      // Add click listener
      marker.addListener('click', () => {
        showReportInfoWindow(report, marker)
        if (onReportSelect) {
          onReportSelect(report)
        }
      })

      reportMarkersRef.current.push(marker)
    })
  }, [showReports, getFilteredReports, onReportSelect])

  const initializeMap = useCallback(async () => {
    if (!mapRef.current || isInitialized.current) return

    try {
      setLoading(true)
      setError(null)

      // Load Google Maps script if not already loaded
      await loadGoogleMapsScript()

      // Verify Google Maps is available
      if (!window.google?.maps) {
        throw new Error('Google Maps failed to initialize')
      }

      // Create map instance
      const options: google.maps.MapOptions = {
        ...(fullscreen ? mobileMapOptions : mapOptions),
        ...(initialCenter && { center: initialCenter }),
        ...(initialZoom && { zoom: initialZoom }),
        // Enhanced map styling
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          },
          {
            featureType: "transit",
            elementType: "labels",
            stylers: [{ visibility: "simplified" }]
          }
        ]
      }

      const mapInstance = new google.maps.Map(mapRef.current, options)
      mapInstanceRef.current = mapInstance
      isInitialized.current = true

      // Add user location marker if initial center is provided
      if (initialCenter) {
        // Clear existing marker
        if (markerRef.current) {
          markerRef.current.setMap(null)
        }

        // Create enhanced user location marker
        markerRef.current = new google.maps.Marker({
          position: initialCenter,
          map: mapInstance,
          title: "Your Current Location",
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3
          },
          zIndex: 1000 // Ensure user location is always on top
        })

        // Add pulsing animation for user location
        const pulseMarker = new google.maps.Marker({
          position: initialCenter,
          map: mapInstance,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 20,
            fillColor: '#4285F4',
            fillOpacity: 0.3,
            strokeColor: '#4285F4',
            strokeWeight: 1
          },
          zIndex: 999
        })

        // Simple pulse animation
        let scale = 20
        let growing = false
        setInterval(() => {
          if (growing) {
            scale += 1
            if (scale >= 30) growing = false
          } else {
            scale -= 1
            if (scale <= 20) growing = true
          }
          
          if (pulseMarker && mapInstance) {
            pulseMarker.setIcon({
              path: google.maps.SymbolPath.CIRCLE,
              scale: scale,
              fillColor: '#4285F4',
              fillOpacity: 0.3 - (scale - 20) * 0.01,
              strokeColor: '#4285F4',
              strokeWeight: 1
            })
          }
        }, 100)
      }

      // Create report markers after map is initialized
      if (showReports) {
        setTimeout(() => createReportMarkers(), 300)
      }

      setLoading(false)
    } catch (err) {
      console.error('Map initialization error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load map')
      setLoading(false)
      isInitialized.current = false
    }
  }, [fullscreen, initialCenter, initialZoom, showReports, createReportMarkers])

  // Initialize map on mount - only once
  useEffect(() => {
    if (!isInitialized.current) {
      initializeMap()
    }

    // Listen for info window messages
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'HELPFUL_VOTE') {
        addHelpfulVote(event.data.reportId)
      } else if (event.data.type === 'VIEW_DETAILS') {
        if (onReportView) {
          onReportView(event.data.reportId)
        }
      }
    }

    window.addEventListener('message', handleMessage)

    // Cleanup function
    return () => {
      window.removeEventListener('message', handleMessage)
      if (markerRef.current) {
        markerRef.current.setMap(null)
        markerRef.current = null
      }
      reportMarkersRef.current.forEach(marker => marker.setMap(null))
      reportMarkersRef.current = []
      if (infoWindowRef.current) {
        infoWindowRef.current.close()
        infoWindowRef.current = null
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null
      }
      isInitialized.current = false
    }
  }, []) // Empty dependency array - only run once

  // Update user location marker when initialCenter changes
  useEffect(() => {
    if (mapInstanceRef.current && initialCenter && isInitialized.current) {
      // Clear existing user location marker
      if (markerRef.current) {
        markerRef.current.setMap(null)
      }

      // Create new user location marker
      markerRef.current = new google.maps.Marker({
        position: initialCenter,
        map: mapInstanceRef.current,
        title: "Your Current Location",
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3
        },
        zIndex: 1000
      })

      // Center map on new location
      mapInstanceRef.current.setCenter(initialCenter)
    }
  }, [initialCenter])

  // Update report markers when reports or filters change
  useEffect(() => {
    if (isInitialized.current && showReports) {
      createReportMarkers()
    }
  }, [showReports, reports, activeFilters, createReportMarkers])

  // Handle retry manually
  const handleRetry = useCallback(async () => {
    isInitialized.current = false
    await initializeMap()
  }, [initializeMap])

  const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!mapsApiKey) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Map Configuration Required</h3>
          <p className="text-sm text-gray-600 mb-4">
            Google Maps API key is missing. Please add your API key to environment variables.
          </p>
          <div className="bg-gray-100 rounded-lg p-3 text-xs text-left">
            <code className="text-gray-800">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here</code>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${fullscreen ? "h-full" : "h-full"} w-full bg-gradient-to-br from-blue-50 to-indigo-100`}>
      <div ref={mapRef} className="w-full h-full" />
      
      {loading && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="animate-spin h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading enhanced city map...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-600 mb-2">Map Loading Failed</h3>
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors"
            >
              Retry Loading Map
            </button>
          </div>
        </div>
      )}

      {/* Enhanced report statistics overlay for fullscreen */}
      {fullscreen && showReports && (
        <div className="absolute bottom-4 left-4 z-10">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <div className="font-bold text-xl text-blue-600">{getFilteredReports().length}</div>
                <div className="text-gray-600 text-xs font-medium">Total Reports</div>
              </div>
              <div className="h-10 w-px bg-gray-300" />
              <div className="text-center">
                <div className="font-bold text-xl text-red-600">
                  {getFilteredReports().filter(r => r.analysis.severity === 'critical' || r.analysis.severity === 'high').length}
                </div>
                <div className="text-gray-600 text-xs font-medium">Urgent</div>
              </div>
              <div className="h-10 w-px bg-gray-300" />
              <div className="text-center">
                <div className="font-bold text-xl text-green-600">
                  {getFilteredReports().filter(r => r.status === 'resolved').length}
                </div>
                <div className="text-gray-600 text-xs font-medium">Resolved</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced legend for report markers */}
      {showReports && getFilteredReports().length > 0 && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
            <div className="text-sm font-bold mb-3 flex items-center gap-2 text-gray-800">
              <MapPin className="h-4 w-4 text-blue-600" />
              Report Severity Legend
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-red-600 border-2 border-white shadow-sm"></div>
                <span className="font-medium text-gray-700">Critical - Immediate Action</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-white shadow-sm"></div>
                <span className="font-medium text-gray-700">High - Urgent</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-yellow-500 border-2 border-white shadow-sm"></div>
                <span className="font-medium text-gray-700">Medium - Monitor</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-sm"></div>
                <span className="font-medium text-gray-700">Low - Routine</span>
              </div>
              <div className="border-t border-gray-200 mt-3 pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-sm"></div>
                  <span className="font-medium text-blue-600">Your Location</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}