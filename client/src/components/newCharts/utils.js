// Filtering utilities for analytics dashboard

export const filterDataByTimeframe = (data, days) => {
  if (!data || !Array.isArray(data)) {
    console.error("[v0] filterDataByTimeframe: Invalid data", data)
    return []
  }
  
  if (days === "all") return data

  const today = new Date()
  const cutoffDate = new Date(today)
  cutoffDate.setDate(cutoffDate.getDate() - days)

  const filtered = data.filter((item) => {
    if (!item.date) return false
    return new Date(item.date) >= cutoffDate
  })

  console.log(`[v0] Filtered ${data.length} records to ${filtered.length} for ${days} days`)
  return filtered
}

export const getChartData = (data, website) => {
  if (!data || !Array.isArray(data)) {
    console.error("[v0] getChartData: Invalid data", data)
    // Return empty structure instead of null
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

  const filtered = website === "all" ? data : data.filter((item) => item.website === website)

  console.log(`[v0] Processing chart data for ${website}: ${filtered.length} records`)

  // If no data, return empty structure
  if (filtered.length === 0) {
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

  // Reports by Type
  const reportsByType = {}
  filtered.forEach((item) => {
    reportsByType[item.type] = (reportsByType[item.type] || 0) + 1
  })

  // Reports by Date and Type
  const reportsByDateAndType = {}
  filtered.forEach((item) => {
    if (!reportsByDateAndType[item.date]) {
      reportsByDateAndType[item.date] = {}
    }
    reportsByDateAndType[item.date][item.type] = (reportsByDateAndType[item.date][item.type] || 0) + 1
  })

  const sortedDates = Object.keys(reportsByDateAndType).sort()
  const reportsOverTime = sortedDates.map((date) => ({
    date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    "Bug Report": reportsByDateAndType[date]["Bug Report"] || 0,
    "Feature Request": reportsByDateAndType[date]["Feature Request"] || 0,
    Complaint: reportsByDateAndType[date]["Complaint"] || 0,
    "General Feedback": reportsByDateAndType[date]["General Feedback"] || 0,
    Improvement: reportsByDateAndType[date]["Improvement"] || 0,
  }))

  // Reports by Title
  const reportsByTitle = {}
  filtered.forEach((item) => {
    reportsByTitle[item.title] = (reportsByTitle[item.title] || 0) + 1
  })

  // Active vs Resolved
  const activeCount = filtered.filter((item) => item.status === "active").length
  const resolvedCount = filtered.filter((item) => item.status === "resolved").length

  // Average Severity & Rating
  const itemsWithSeverity = filtered.filter((item) => item.severity != null && item.severity > 0)
  const itemsWithRating = filtered.filter((item) => item.rating != null && item.rating > 0)
  
  const avgSeverity =
    itemsWithSeverity.length > 0 
      ? itemsWithSeverity.reduce((sum, item) => sum + item.severity, 0) / itemsWithSeverity.length 
      : 0
  
  const avgRating =
    itemsWithRating.length > 0 
      ? itemsWithRating.reduce((sum, item) => sum + item.rating, 0) / itemsWithRating.length 
      : 0

  // Severity vs Rating scatter
  const severityVsRating = filtered
    .filter((item) => item.severity != null && item.rating != null)
    .map((item) => ({
      severity: item.severity,
      rating: item.rating,
    }))

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
        item.severity >= level.min &&
        item.severity <= level.max
    )

    if (itemsInLevel.length > 0) {
      const avgRating =
        itemsInLevel.reduce((sum, item) => sum + item.rating, 0) / itemsInLevel.length

      avgRatingBySeverity.push({
        level: level.name,
        avgRating: Number(avgRating.toFixed(2)),
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
    reportsByType: Object.entries(reportsByType).map(([name, value]) => ({ name, value })),
    reportsOverTime,
    reportsByTitle: Object.entries(reportsByTitle)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8),
    activeVsResolved: [
      { name: "Active", value: activeCount, fill: "#F59E0B" },
      { name: "Resolved", value: resolvedCount, fill: "#5BAE83" },
    ],
    avgSeverity,
    avgRating,
    severityVsRating,
    avgRatingBySeverity,
  }
}

export const getMetrics = (data, website) => {
  if (!data || !Array.isArray(data)) {
    console.error("[v0] getMetrics: Invalid data", data)
    return null
  }

  const filtered = website === "all" ? data : data.filter((item) => item.website === website)
  const websites = new Set(data.map((item) => item.website)).size

  return {
    totalReports: filtered.length,
    activeReports: filtered.filter((item) => item.status === "active").length,
    resolvedReports: filtered.filter((item) => item.status === "resolved").length,
    websites,
  }
}