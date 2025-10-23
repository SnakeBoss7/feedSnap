import axios from "axios"
import { API_CONFIG, getCachedData, transformBackendDataToDashboard } from "./dataConfig"

const apiUrl = process.env.REACT_APP_API_URL

// Fetch raw feedback data to get ratings and severity
export const fetchRawFeedbackData = async () => {
  try {
    console.log("[v0] Fetching raw feedback data from:", `${apiUrl}/api/feedback/allFeedback`)

    const response = await axios.get(`${apiUrl}/api/feedback/allFeedback`, {
      withCredentials: API_CONFIG.WITH_CREDENTIALS,
    })

    console.log("[v0] Raw feedback response:", response.data)

    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      console.log(`[v0] Successfully fetched ${response.data.data.length} raw feedback records`)
      return response.data.data // Array of feedback objects
    }

    console.log("[v0] No raw feedback data in response")
    return []
  } catch (error) {
    console.error("[v0] Error fetching raw feedback:", error)
    console.log("[v0] Continuing without raw feedback data (ratings/severity will be null)")
    return []
  }
}

export const fetchDashboardData = async () => {
  if (!API_CONFIG.USE_REAL_DATA) {
    throw new Error("Demo data mode is disabled. Please enable real data.")
  }

  try {
    console.log("[v0] Fetching analytics data from:", API_CONFIG.API_ENDPOINT)

    const response = await axios.get(API_CONFIG.API_ENDPOINT, {
      withCredentials: API_CONFIG.WITH_CREDENTIALS,
    })

    console.log("[v0] Backend response status:", response.status)
    console.log("[v0] Backend response data:", response.data)

    if (!response.data) {
      throw new Error("Empty response from backend")
    }

    if (!response.data.success) {
      throw new Error(response.data.message || "Backend returned unsuccessful response")
    }

    if (!response.data.data || !response.data.sites) {
      throw new Error("Invalid response structure from backend")
    }

    // Fetch raw feedback to get ratings and severity
    const rawFeedback = await fetchRawFeedbackData()
    console.log("[v0] Raw feedback count:", rawFeedback.length)

    // Transform your aggregated data into individual report records
    const dashboardData = transformBackendDataToDashboard(response.data, rawFeedback)

    console.log("[v0] Transformed data:", dashboardData)
    console.log("[v0] Transformed data length:", dashboardData.length)

    if (!Array.isArray(dashboardData)) {
      throw new Error("Transform function did not return an array")
    }

    // Cache the response with timestamp
    const cacheData = {
      data: response.data,
      rawFeedback: rawFeedback,
      timestamp: Date.now(),
    }

    localStorage.setItem("AnalyticsData", JSON.stringify(cacheData))
    localStorage.setItem("type", "FETCH_SUCCESS")

    return dashboardData
  } catch (error) {
    console.error("[v0] Error fetching data:", error)
    localStorage.setItem("type", "FETCH_FAIL")
    
    // Log more details about the error
    if (error.response) {
      console.error("[v0] Error response:", error.response.data)
      console.error("[v0] Error status:", error.response.status)
      throw new Error(`Backend error: ${error.response.data?.message || error.response.statusText}`)
    } else if (error.request) {
      console.error("[v0] No response received:", error.request)
      throw new Error("No response from server. Please check your connection.")
    } else {
      console.error("[v0] Error message:", error.message)
      throw error
    }
  }
}

export const initializeDashboardData = async () => {
  try {
    // Try to get cached data first
    const cachedData = getCachedData()

    if (!cachedData.isLoading && cachedData.fromCache) {
      console.log("[v0] Using cached data")
      const cachedReports = transformBackendDataToDashboard(cachedData, cachedData.rawFeedback || [])
      
      if (cachedReports && Array.isArray(cachedReports) && cachedReports.length > 0) {
        return cachedReports
      }
      
      console.log("[v0] Cached data invalid, fetching fresh data")
    }

    // Fetch fresh data if cache is missing or expired
    console.log("[v0] Fetching fresh data")
    const freshData = await fetchDashboardData()

    if (!freshData || !Array.isArray(freshData)) {
      throw new Error("Invalid data format received")
    }

    return freshData
  } catch (error) {
    console.error("[v0] Error in initializeDashboardData:", error)
    throw error
  }
}