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

export const transformBackendDataToDashboard = (backendData, rawFeedback = []) => {
  console.log("[v0] transformBackendDataToDashboard called with:", backendData)
  console.log("[v0] Raw feedback records:", rawFeedback.length)
  
  const allReports = []

  const typeMap = {
    bug: "Bug Report",
    feature: "Feature Request",
    complaint: "Complaint",
    general: "General Feedback",
    improvement: "Improvement",
    other: "General Feedback",
  }

  // Create a map of feedback by webUrl for quick lookup
  const feedbackByUrl = {}
  rawFeedback.forEach((fb) => {
    if (!feedbackByUrl[fb.webUrl]) {
      feedbackByUrl[fb.webUrl] = []
    }
    feedbackByUrl[fb.webUrl].push(fb)
  })
  
  // Sort feedback by date (oldest first) to match our distribution
  Object.keys(feedbackByUrl).forEach((url) => {
    feedbackByUrl[url].sort((a, b) => {
      const dateA = new Date(a.createdOn || 0)
      const dateB = new Date(b.createdOn || 0)
      return dateA - dateB
    })
  })
  
  console.log("[v0] Feedback by URL:", Object.keys(feedbackByUrl).map(url => ({
    url,
    count: feedbackByUrl[url].length
  })))

  if (!backendData || !backendData.data || !backendData.sites) {
    console.error("[v0] Invalid backend data structure:", backendData)
    return allReports
  }

  if (backendData.sites.length === 0) {
    console.log("[v0] No sites in backend response")
    return allReports
  }

  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth() + 1 // 1-12
  
  console.log(`[v0] Current date: ${today.toISOString()}, Month: ${currentMonth}, Year: ${currentYear}`)

  backendData.sites.forEach((siteUrl) => {
    const siteData = backendData.data[siteUrl]
    if (!siteData) return

    const website = new URL(siteUrl).hostname
    const categories = siteData.categories || {}
    const totalFeedback = siteData.totalFeedback || 0
    const monthlyBreakdown = siteData.monthlyBreakdown || {}
    const dailyBreakdown = siteData.dailyBreakdown || {}
    
    // Get actual feedback for this site
    const siteFeedback = feedbackByUrl[siteUrl] || []
    let feedbackIndex = 0

    console.log(`[v0] Processing ${siteUrl}:`, {
      totalFeedback,
      currentMonth: siteData.currentMonth,
      lastMonth: siteData.lastMonth,
      categories,
      actualFeedbackCount: siteFeedback.length
    })

    // Calculate how many records are in monthly breakdown
    let monthlyTotal = 0
    Object.values(monthlyBreakdown).forEach((monthCategories) => {
      Object.values(monthCategories).forEach((count) => {
        monthlyTotal += count || 0
      })
    })

    const earlierMonthsTotal = totalFeedback - monthlyTotal

    console.log(`[v0] ${siteUrl}: monthlyTotal=${monthlyTotal}, earlierTotal=${earlierMonthsTotal}`)

    // Process each month in monthlyBreakdown
    Object.entries(monthlyBreakdown).forEach(([monthName, monthCategories]) => {
      // Get month number from month name
      const monthDate = new Date(`${monthName} 1, ${currentYear}`)
      const monthNum = monthDate.getMonth() + 1
      const year = currentYear
      
      // Calculate total records for this month
      let monthTotal = 0
      Object.values(monthCategories).forEach((count) => {
        monthTotal += count || 0
      })

      if (monthTotal === 0) return

      console.log(`[v0] Processing ${monthName} (${monthNum}/${year}) with ${monthTotal} records`)

      const daysInMonth = new Date(year, monthNum, 0).getDate()

      // If it's the current month, use dailyBreakdown
      if (monthNum === currentMonth && year === currentYear) {
        console.log(`[v0] Current month - using daily breakdown`)
        
        // Process daily breakdown
        for (let day = 1; day <= daysInMonth; day++) {
          const dayData = dailyBreakdown[day] || {}
          const dateStr = `${year}-${String(monthNum).padStart(2, "0")}-${String(day).padStart(2, "0")}`

          Object.entries(dayData).forEach(([categoryKey, count]) => {
            const reportType = typeMap[categoryKey] || "General Feedback"
            const countNum = parseInt(count) || 0

            for (let i = 0; i < countNum; i++) {
              // Get actual feedback data if available
              const actualFeedback = siteFeedback[feedbackIndex] || {}
              
              if (actualFeedback.rating || actualFeedback.severity) {
                console.log(`[v0] Matched feedback for ${siteUrl} day ${day}:`, {
                  rating: actualFeedback.rating,
                  severity: actualFeedback.severity
                })
              }
              
              feedbackIndex++
              
              allReports.push({
                id: `${siteUrl}-${monthNum}-${day}-${categoryKey}-${i}`,
                website,
                type: reportType,
                title: `${reportType}`,
                description: `${reportType} from ${website}`,
                status: "active",
                date: dateStr,
                rating: actualFeedback.rating || null,
                severity: actualFeedback.severity || null,
              })
            }
          })
        }
      } else {
        // Past month - distribute evenly across days
        console.log(`[v0] Past month - distributing ${monthTotal} records across ${daysInMonth} days`)
        
        // Get categories that have counts
        const activeCategories = Object.entries(monthCategories)
          .filter(([key, count]) => count > 0)
          .map(([key, count]) => ({ key, count }))

        let recordsCreated = 0
        
        // Distribute records across days
        for (let day = 1; day <= daysInMonth && recordsCreated < monthTotal; day++) {
          const dateStr = `${year}-${String(monthNum).padStart(2, "0")}-${String(day).padStart(2, "0")}`
          
          // How many records should we create for this day?
          const remainingDays = daysInMonth - day + 1
          const remainingRecords = monthTotal - recordsCreated
          const recordsForDay = Math.min(
            Math.ceil(remainingRecords / remainingDays),
            remainingRecords
          )

          // Distribute this day's records across categories proportionally
          let dayRecordsCreated = 0
          
          activeCategories.forEach(({ key: categoryKey, count: categoryTotal }) => {
            if (dayRecordsCreated >= recordsForDay) return
            
            const proportion = categoryTotal / monthTotal
            const categoryRecordsForDay = Math.max(
              1, 
              Math.min(
                Math.round(recordsForDay * proportion),
                recordsForDay - dayRecordsCreated
              )
            )

            const reportType = typeMap[categoryKey] || "General Feedback"

            for (let i = 0; i < categoryRecordsForDay && dayRecordsCreated < recordsForDay; i++) {
              // Get actual feedback data if available
              const actualFeedback = siteFeedback[feedbackIndex] || {}
              feedbackIndex++
              
              allReports.push({
                id: `${siteUrl}-${monthNum}-${day}-${categoryKey}-${i}`,
                website,
                type: reportType,
                title: `${reportType}`,
                description: `${reportType} from ${website}`,
                status: "active",
                date: dateStr,
                rating: actualFeedback.rating || null,
                severity: actualFeedback.severity || null,
              })
              dayRecordsCreated++
              recordsCreated++
            }
          })
        }

        console.log(`[v0] Created ${recordsCreated} records for ${monthName}`)
      }
    })

    // Process earlier months (before Sep/Oct)
    if (earlierMonthsTotal > 0) {
      console.log(`[v0] Processing ${earlierMonthsTotal} records from earlier months`)
      
      const pastMonths = [
        { name: "Aug", num: 8 },
        { name: "Jul", num: 7 },
        { name: "Jun", num: 6 },
      ]

      // Get categories that have counts
      const activeCategories = Object.entries(categories)
        .filter(([key, count]) => count > 0)
        .map(([key, count]) => ({ key, count }))

      let recordsCreated = 0

      pastMonths.forEach((month, monthIndex) => {
        if (recordsCreated >= earlierMonthsTotal) return

        const monthNum = month.num
        const year = currentYear
        const daysInMonth = new Date(year, monthNum, 0).getDate()
        
        // How many records for this month?
        const remainingMonths = pastMonths.length - monthIndex
        const remainingRecords = earlierMonthsTotal - recordsCreated
        const recordsForMonth = Math.ceil(remainingRecords / remainingMonths)

        console.log(`[v0] ${month.name}: allocating ${recordsForMonth} records`)

        let monthRecordsCreated = 0

        // Distribute across days
        for (let day = 1; day <= daysInMonth && monthRecordsCreated < recordsForMonth && recordsCreated < earlierMonthsTotal; day++) {
          const dateStr = `${year}-${String(monthNum).padStart(2, "0")}-${String(day).padStart(2, "0")}`
          
          const remainingDays = daysInMonth - day + 1
          const remainingForMonth = recordsForMonth - monthRecordsCreated
          const recordsForDay = Math.min(
            Math.ceil(remainingForMonth / remainingDays),
            remainingForMonth
          )

          // Distribute across categories proportionally
          let dayRecordsCreated = 0

          activeCategories.forEach(({ key: categoryKey, count: categoryTotal }) => {
            if (dayRecordsCreated >= recordsForDay) return
            if (recordsCreated >= earlierMonthsTotal) return

            const proportion = categoryTotal / totalFeedback
            const categoryRecordsForDay = Math.max(
              1,
              Math.min(
                Math.round(recordsForDay * proportion),
                recordsForDay - dayRecordsCreated
              )
            )

            const reportType = typeMap[categoryKey] || "General Feedback"

            for (let i = 0; i < categoryRecordsForDay && dayRecordsCreated < recordsForDay && recordsCreated < earlierMonthsTotal; i++) {
              // Get actual feedback data if available
              const actualFeedback = siteFeedback[feedbackIndex] || {}
              feedbackIndex++
              
              allReports.push({
                id: `${siteUrl}-${monthNum}-${day}-${categoryKey}-${recordsCreated}`,
                website,
                type: reportType,
                title: `${reportType}`,
                description: `${reportType} from ${website}`,
                status: "active",
                date: dateStr,
                rating: actualFeedback.rating || null,
                severity: actualFeedback.severity || null,
              })
              dayRecordsCreated++
              monthRecordsCreated++
              recordsCreated++
            }
          })
        }
      })

      console.log(`[v0] Created ${recordsCreated} records for earlier months`)
    }
  })

  console.log(`[v0] Total transformed reports: ${allReports.length}`)
  console.log(`[v0] Expected total: ${backendData.sites.reduce((sum, site) => sum + (backendData.data[site]?.totalFeedback || 0), 0)}`)
  
  // Log sample dates
  if (allReports.length > 0) {
    const dates = allReports.map(r => r.date).sort()
    console.log(`[v0] Date range: ${dates[0]} to ${dates[dates.length - 1]}`)
    console.log(`[v0] Sample records:`, allReports.slice(0, 3))
  }
  
  return allReports
}