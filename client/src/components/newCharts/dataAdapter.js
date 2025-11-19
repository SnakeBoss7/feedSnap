import axios from "axios"
import { API_CONFIG, getCachedData, transformBackendDataToDashboard } from "./dataConfig"

const apiUrl = process.env.REACT_APP_API_URL

export const fetchRawFeedbackData = async () => {
  try {
    console.log("[v0] Fetching raw feedback data from:", `${apiUrl}/api/feedback/allFeedback`)

    const response = await axios.get(`${apiUrl}/api/feedback/allFeedback`, {
      withCredentials: API_CONFIG.WITH_CREDENTIALS,
    })

    console.log("[v0] Raw feedback response:", response.data)

    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      console.log(`[v0] Successfully fetched ${response.data.data.length} raw feedback records`)
      
      // Log sample of data to verify
      if (response.data.data.length > 0) {
        console.log("[v0] Sample feedback:", response.data.data[0])
      }
      
      return response.data.data
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

    // Fetch both analytics and raw feedback in parallel
    const [analyticsResponse, rawFeedback] = await Promise.all([
      axios.get(API_CONFIG.API_ENDPOINT, {
        withCredentials: API_CONFIG.WITH_CREDENTIALS,
      }),
      fetchRawFeedbackData()
    ])

    console.log("[v0] Analytics response status:", analyticsResponse.status)
    console.log("[v0] Raw feedback count:", rawFeedback.length)

    if (!analyticsResponse.data) {
      throw new Error("Empty response from backend")
    }

    if (!analyticsResponse.data.success) {
      throw new Error(analyticsResponse.data.message || "Backend returned unsuccessful response")
    }

    // Transform using raw feedback data
    const dashboardData = transformBackendDataToDashboard(analyticsResponse.data, rawFeedback)

    console.log("[v0] Transformed data count:", dashboardData.length)

    if (!Array.isArray(dashboardData)) {
      throw new Error("Transform function did not return an array")
    }

    if (dashboardData.length === 0) {
      console.warn("[v0] Warning: No data after transformation")
    }

    // Cache the data
    const cacheData = {
      data: analyticsResponse.data,
      rawFeedback: rawFeedback,
      timestamp: Date.now(),
    }

    localStorage.setItem("AnalyticsData", JSON.stringify(cacheData))
    localStorage.setItem("type", "FETCH_SUCCESS")

    return dashboardData
  } catch (error) {
    console.error("[v0] Error fetching data:", error)
    localStorage.setItem("type", "FETCH_FAIL")
    
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
    const cachedData = getCachedData()

    if (!cachedData.isLoading && cachedData.fromCache && cachedData.rawFeedback) {
      console.log("[v0] Using cached data")
      const cachedReports = transformBackendDataToDashboard(cachedData, cachedData.rawFeedback)
      
      if (cachedReports && Array.isArray(cachedReports) && cachedReports.length > 0) {
        console.log("[v0] Returning cached reports:", cachedReports.length)
        return cachedReports
      }
      
      console.log("[v0] Cached data invalid, fetching fresh data")
    }

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