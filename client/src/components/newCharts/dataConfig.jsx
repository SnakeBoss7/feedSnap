// Get your API URL from environment variables
const apiUrl = process.env.REACT_APP_API_URL

export const API_CONFIG = {
  API_ENDPOINT: `${apiUrl}/api/feedback/getAnalytics`,
  USE_REAL_DATA: true,
  CACHE_DURATION: 5 * 60 * 1000,
  WITH_CREDENTIALS: true,
}

export const getCachedData = () => {
  const type = localStorage.getItem("type")
  const cachedData = localStorage.getItem("AnalyticsData")

  if (type === "FETCH_SUCCESS" && cachedData) {
    try {
      const parsed = JSON.parse(cachedData)
      const isRecent = Date.now() - parsed.timestamp < API_CONFIG.CACHE_DURATION

      if (isRecent && parsed.data) {
        return {
          ...parsed.data,
          rawFeedback: parsed.rawFeedback || [],
          isLoading: false,
          fromCache: true,
        }
      }
    } catch (e) {
      console.log("[v0] Cache parse error:", e)
    }
  }
  return {
    sites: [],
    data: {},
    rawFeedback: [],
    success: false,
    isLoading: true,
    fromCache: false,
  }
}

// Map backend categories to display types
const FEEDBACK_CATEGORIES = {
  "Bug Report": "bug",
  "Bug Reports": "bug",
  "Complaints": "complaint",
  "Complaint": "complaint",
  "Feature Requests": "feature",
  "Feature Request": "feature",
  "General Feedback": "general",
  "Improvements": "improvement",
  "Improvement": "improvement",
}

const typeMap = {
  bug: "Bug Report",
  feature: "Feature Request",
  complaint: "Complaint",
  general: "General Feedback",
  improvement: "Improvement",
  other: "General Feedback",
}

function getCategoryFromTitle(title) {
  if (!title) return 'general'
  
  // Direct match
  if (FEEDBACK_CATEGORIES[title]) {
    return FEEDBACK_CATEGORIES[title]
  }
  
  const titleLower = title.toLowerCase().trim()
  if (titleLower.includes('bug')) return 'bug'
  if (titleLower.includes('complaint')) return 'complaint'
  if (titleLower.includes('feature')) return 'feature'
  if (titleLower.includes('improvement')) return 'improvement'
  if (titleLower.includes('general')) return 'general'
  
  return 'general'
}

export const transformBackendDataToDashboard = (backendData, rawFeedback = []) => {
  console.log("[v0] transformBackendDataToDashboard called")
  console.log("[v0] Raw feedback records:", rawFeedback.length)
  
  if (!rawFeedback || rawFeedback.length === 0) {
    console.log("[v0] No raw feedback data available")
    return []
  }

  // Transform raw feedback directly into dashboard format
  const allReports = rawFeedback.map((fb, index) => {
    const category = getCategoryFromTitle(fb.title)
    const reportType = typeMap[category] || "General Feedback"
    
    // Parse the date correctly
    let dateStr = ''
    try {
      const fbDate = new Date(fb.createdOn)
      dateStr = fbDate.toISOString().split('T')[0] // YYYY-MM-DD format
    } catch (e) {
      console.error("Error parsing date for feedback:", fb._id, e)
      dateStr = new Date().toISOString().split('T')[0]
    }
    
    // Extract website hostname
    let website = fb.webUrl
    try {
      website = new URL(fb.webUrl).hostname
    } catch (e) {
      // If URL parsing fails, use as is
      website = fb.webUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
    }
    
    return {
      id: fb._id || `feedback-${index}`,
      website: website,
      type: reportType,
      title: fb.title || reportType,
      description: fb.description || `${reportType} from ${website}`,
      status: fb.status === true ? "resolved" : "active",
      date: dateStr,
      rating: fb.rating || null,
      severity: fb.severity || null,
      createdOn: fb.createdOn,
      pathname: fb.pathname || '/',
      email: fb.email || ''
    }
  })

  // Sort by date (oldest to newest) to maintain chronological order
  allReports.sort((a, b) => new Date(a.date) - new Date(b.date))

  console.log(`[v0] Total transformed reports: ${allReports.length}`)
  
  // Log distribution by type
  const typeBreakdown = {}
  allReports.forEach(r => {
    typeBreakdown[r.type] = (typeBreakdown[r.type] || 0) + 1
  })
  console.log(`[v0] Type breakdown:`, typeBreakdown)
  
  // Log date range
  if (allReports.length > 0) {
    const dates = allReports.map(r => r.date).sort()
    console.log(`[v0] Date range: ${dates[0]} to ${dates[dates.length - 1]}`)
  }
  
  // Log sample records
  console.log(`[v0] Sample records:`, allReports.slice(0, 3))
  
  return allReports
}