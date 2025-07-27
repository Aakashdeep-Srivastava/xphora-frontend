"use server"

import { geminiService, type MediaAnalysis } from "@/lib/gemini-service"

export async function submitMultimodalReport(
  prevState: { message: string; success?: boolean; error?: boolean } | null,
  formData: FormData,
) {
  const media = formData.get("media") as File
  const comments = formData.get("comments") as string
  const latitude = formData.get("latitude") as string
  const longitude = formData.get("longitude") as string
  const analysisData = formData.get("analysis") as string

  console.log("New Multimodal Report Submitted:")

  try {
    // Parse AI analysis
    let analysis: MediaAnalysis | null = null
    if (analysisData) {
      analysis = JSON.parse(analysisData)
    }

    // Validate required fields
    if (!media || !(media instanceof File) || media.size === 0) {
      return { message: "Please upload a photo or video.", error: true }
    }

    if (!latitude || !longitude) {
      return { message: "Location is required for incident reporting.", error: true }
    }

    // Generate incident title using AI
    const title = analysis ? await geminiService.generateIncidentTitle(analysis) : "Incident Report"

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Log the complete report data
    console.log({
      title,
      media: {
        fileName: media.name,
        fileSize: media.size,
        fileType: media.type,
      },
      analysis: analysis
        ? {
            category: analysis.category,
            severity: analysis.severity,
            description: analysis.description,
            confidence: analysis.confidence,
            tags: analysis.tags,
            suggestedActions: analysis.suggestedActions,
          }
        : null,
      location: {
        latitude: Number.parseFloat(latitude),
        longitude: Number.parseFloat(longitude),
      },
      additionalComments: comments || "None",
      timestamp: new Date().toISOString(),
    })

    // In a real implementation, you would:
    // 1. Upload the media file to cloud storage (e.g., Vercel Blob, AWS S3)
    // 2. Store the report data in a database
    // 3. Trigger notifications to relevant authorities
    // 4. Update the city map with the new incident
    // 5. Send push notifications to nearby users

    const responseMessage = analysis
      ? `Report submitted successfully! AI detected: ${analysis.category} incident with ${analysis.severity} severity. Authorities have been notified.`
      : "Report submitted successfully! Our team will review it shortly."

    return {
      message: responseMessage,
      success: true,
    }
  } catch (error) {
    console.error("Report submission error:", error)
    return {
      message: "Failed to submit report. Please try again.",
      error: true,
    }
  }
}
