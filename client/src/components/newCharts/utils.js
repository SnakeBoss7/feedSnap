// Filtering utilities for analytics dashboard

export const filterDataByTimeframe = (data, days) => {
  if (!data || !Array.isArray(data)) {
    console.error("[v0] filterDataByTimeframe: Invalid data", data)
    return []
  }
  
  if (days === "all") {
    console.log(`[v0] Returning all ${data.length} records`)
    return data
  }

  // Get today's date at end of day
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  
  // Calculate cutoff date (days ago from today)
  const cutoffDate = new Date(today)
  cutoffDate.setDate(cutoffDate.getDate() - days)
  cutoffDate.setHours(0, 0, 0, 0)

  // Filter data within the date range
  const filtered = data.filter((item) => {
    if (!item.date) return false
    const itemDate = new Date(item.date)
    return itemDate >= cutoffDate && itemDate <= today
  })

  const cutoffStr = cutoffDate.toISOString().split('T')[0]
  const todayStr = today.toISOString().split('T')[0]
  
  console.log(`[v0] Timeframe: ${days} days | From: ${cutoffStr} To: ${todayStr}`)
  console.log(`[v0] Filtered: ${filtered.length} / ${data.length} records`)
  
  return filtered
}

export const getChartData = (data, website) => {
  if (!data || !Array.isArray(data)) {
    console.error("[v0] getChartData: Invalid data", data)
    return getEmptyChartData()
  }

  const filtered = website === "all" ? data : data.filter((item) => item.website === website)

  console.log(`[v0] Processing chart data for ${website}: ${filtered.length} records`)
  
  // Log website filtering for debugging
  if (website !== "all") {
    console.log(`[v0] Filtering for website: ${website}`)
    console.log(`[v0] Available websites in data:`, [...new Set(data.map(d => d.website))])
  }

  if (filtered.length === 0) {
    console.log(`[v0] No data for website: ${website}`)
    return getEmptyChartData()
  }

  // Reports by Type
  const reportsByType = {}
  filtered.forEach((item) => {
    reportsByType[item.type] = (reportsByType[item.type] || 0) + 1
  })

  // Reports by Date and Type (for stacked area chart)
  const reportsByDateAndType = {}
  filtered.forEach((item) => {
    if (!item.date) return;
    
    if (!reportsByDateAndType[item.date]) {
      reportsByDateAndType[item.date] = {
        "Bug Report": 0,
        "Feature Request": 0,
        "Complaint": 0,
        "General Feedback": 0,
        "Improvement": 0,
        total: 0
      }
    }
    reportsByDateAndType[item.date][item.type] = (reportsByDateAndType[item.date][item.type] || 0) + 1
    reportsByDateAndType[item.date].total += 1
  })

  // Sort dates and format for chart
  const sortedDates = Object.keys(reportsByDateAndType).sort()
  const reportsOverTime = sortedDates.map((date) => {
    const dateObj = new Date(date)
    return {
      date: dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      fullDate: date,
      "Bug Report": reportsByDateAndType[date]["Bug Report"],
      "Feature Request": reportsByDateAndType[date]["Feature Request"],
      "Complaint": reportsByDateAndType[date]["Complaint"],
      "General Feedback": reportsByDateAndType[date]["General Feedback"],
      "Improvement": reportsByDateAndType[date]["Improvement"],
      total: reportsByDateAndType[date].total
    }
  })

  console.log(`[v0] Reports over time - Date points: ${reportsOverTime.length}`)
  console.log(`[v0] Sample time data:`, reportsOverTime.slice(0, 3))

  // Reports by Title (top 8)
  const reportsByTitle = {}
  filtered.forEach((item) => {
    const title = item.title || item.type
    reportsByTitle[title] = (reportsByTitle[title] || 0) + 1
  })

  // Active vs Resolved
  const activeCount = filtered.filter((item) => item.status === "active").length
  const resolvedCount = filtered.filter((item) => item.status === "resolved").length

  console.log(`[v0] Active: ${activeCount}, Resolved: ${resolvedCount}`)

  // Average Severity & Rating (only from items that have these values)
  const itemsWithSeverity = filtered.filter((item) => 
    item.severity != null && item.severity > 0 && !isNaN(item.severity)
  )
  const itemsWithRating = filtered.filter((item) => 
    item.rating != null && item.rating > 0 && !isNaN(item.rating)
  )
  
  const avgSeverity = itemsWithSeverity.length > 0 
    ? itemsWithSeverity.reduce((sum, item) => sum + Number(item.severity), 0) / itemsWithSeverity.length 
    : 0
  
  const avgRating = itemsWithRating.length > 0 
    ? itemsWithRating.reduce((sum, item) => sum + Number(item.rating), 0) / itemsWithRating.length 
    : 0

  console.log(`[v0] Website: ${website}`)
  console.log(`[v0] Items with severity: ${itemsWithSeverity.length}, severities:`, itemsWithSeverity.map(i => i.severity))
  console.log(`[v0] Items with rating: ${itemsWithRating.length}, ratings:`, itemsWithRating.map(i => i.rating))
  console.log(`[v0] Avg Severity: ${avgSeverity.toFixed(2)} (from ${itemsWithSeverity.length} items)`)
  console.log(`[v0] Avg Rating: ${avgRating.toFixed(2)} (from ${itemsWithRating.length} items)`)

  // Severity vs Rating scatter (only items with both values)
  const severityVsRating = filtered
    .filter((item) => 
      item.severity != null && item.severity > 0 && !isNaN(item.severity) &&
      item.rating != null && item.rating > 0 && !isNaN(item.rating)
    )
    .map((item) => ({
      severity: Number(item.severity),
      rating: Number(item.rating),
    }))

  console.log(`[v0] Severity vs Rating points: ${severityVsRating.length}`)

  // Average Rating by Severity Level
  const avgRatingBySeverity = []
  const severityLevels = [
    { name: "Low", min: 1, max: 3 },
    { name: "Medium", min: 4, max: 6 },
    { name: "High", min: 7, max: 8 },
    { name: "Critical", min: 9, max: 10 },
  ]

  severityLevels.forEach((level) => {
    const itemsInLevel = filtered.filter(
      (item) =>
        item.severity != null &&
        item.rating != null &&
        !isNaN(item.severity) &&
        !isNaN(item.rating) &&
        Number(item.severity) >= level.min &&
        Number(item.severity) <= level.max
    )

    if (itemsInLevel.length > 0) {
      const levelAvgRating =
        itemsInLevel.reduce((sum, item) => sum + Number(item.rating), 0) / itemsInLevel.length

      avgRatingBySeverity.push({
        level: level.name,
        avgRating: Number(levelAvgRating.toFixed(2)),
        count: itemsInLevel.length,
      })
    } else {
      avgRatingBySeverity.push({
        level: level.name,
        avgRating: 0,
        count: 0,
      })
    }
  })

  return {
    reportsByType: Object.entries(reportsByType)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value),
    reportsOverTime,
    reportsByTitle: Object.entries(reportsByTitle)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8),
    activeVsResolved: [
      { name: "Active", value: activeCount, fill: "#F59E0B" },
      { name: "Resolved", value: resolvedCount, fill: "#5BAE83" },
    ],
    avgSeverity: Number(avgSeverity.toFixed(2)),
    avgRating: Number(avgRating.toFixed(2)),
    severityVsRating,
    avgRatingBySeverity,
  }
}

function getEmptyChartData() {
  return {
    reportsByType: [],
    reportsOverTime: [],
    reportsByTitle: [],
    activeVsResolved: [
      { name: "Active", value: 0, fill: "#F59E0B" },
      { name: "Resolved", value: 0, fill: "#5BAE83" },
    ],
    avgSeverity: 0,
    avgRating: 0,
    severityVsRating: [],
    avgRatingBySeverity: [
      { level: "Low", avgRating: 0, count: 0 },
      { level: "Medium", avgRating: 0, count: 0 },
      { level: "High", avgRating: 0, count: 0 },
      { level: "Critical", avgRating: 0, count: 0 },
    ],
  }
}

export const getMetrics = (data, website) => {
  if (!data || !Array.isArray(data)) {
    console.error("[v0] getMetrics: Invalid data", data)
    return {
      totalReports: 0,
      activeReports: 0,
      resolvedReports: 0,
      websites: 0,
    }
  }

  const filtered = website === "all" ? data : data.filter((item) => item.website === website)
  const websites = new Set(data.map((item) => item.website)).size

  const metrics = {
    totalReports: filtered.length,
    activeReports: filtered.filter((item) => item.status === "active").length,
    resolvedReports: filtered.filter((item) => item.status === "resolved").length,
    websites,
  }

  console.log("[v0] Metrics:", metrics)

  return metrics
}