"use client"

import { useState, useMemo, useEffect } from "react"
import { MetricCard } from "../../../components/newCharts/MetricCard"
import {
  ChartCard,
  ReportsByTypeChart,
  ReportsOverTimeChart,
  ActiveVsResolvedChart,
  SeverityRatingChart,
  SeverityVsRatingChart,
  AvgRatingBySeverityChart,
} from "../../../components/newCharts/ChartCard"
import { Selectors } from "../../../components/newCharts/Selector"
import { filterDataByTimeframe, getChartData, getMetrics } from "../../../components/newCharts/utils"
import { initializeDashboardData } from "../../../components/newCharts/dataAdapter"
import AddButton from "../../../components/button/addButton"
import { Link } from "react-router-dom"
import { SimpleHeader } from "../../../components/header/header"

export const Analytics = () => {
  const [selectedWebsite, setSelectedWebsite] = useState("all")
  const [selectedTimeframe, setSelectedTimeframe] = useState("all")
  const [allData, setAllData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        console.log("[v0] Starting data load...")
        const backendData = await initializeDashboardData()
        
        console.log("[v0] Received data:", backendData)
        
        if (!backendData) {
          throw new Error("No data returned from backend")
        }
        
        if (!Array.isArray(backendData)) {
          throw new Error(`Expected array but got ${typeof backendData}`)
        }
        
        if (backendData.length === 0) {
          setError("No feedback data available. Please add some feedback first.")
          setAllData([])
          setIsLoading(false)
          return
        }
        
        console.log(`[v0] Successfully loaded ${backendData.length} records`)
        setAllData(backendData)
        
      } catch (error) {
        console.error("[v0] Error loading data:", error)
        setError(error.message || "Failed to load analytics data")
        setAllData([])
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const websites = useMemo(() => {
    if (!Array.isArray(allData) || allData.length === 0) return []
    const uniqueWebsites = [...new Set(allData.map((item) => item.website))]
    return uniqueWebsites.sort()
  }, [allData])

  const filteredData = useMemo(() => {
    if (!Array.isArray(allData) || allData.length === 0) return []
    const filtered = filterDataByTimeframe(allData, selectedTimeframe)
    console.log(`[v0] Filtered data: ${filtered.length} records for timeframe: ${selectedTimeframe}`)
    return filtered
  }, [allData, selectedTimeframe])

  const chartData = useMemo(() => {
    const data = getChartData(filteredData, selectedWebsite)
    console.log(`[v0] Chart data:`, data)
    return data
  }, [filteredData, selectedWebsite])

  const metrics = useMemo(() => {
    const data = getMetrics(filteredData, selectedWebsite)
    console.log(`[v0] Metrics:`, data)
    return data
  }, [filteredData, selectedWebsite])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Analytics</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!Array.isArray(allData) || allData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <svg className="w-12 h-12 text-blue-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-600">No feedback data found. Start collecting feedback to see analytics.</p>
          </div>
        </div>
      </div>
    )
  }

  // Allow rendering with empty filtered data (will show graphs with 0 values)
  const hasFilteredData = filteredData.length > 0
  
  // Always ensure we have valid data structures
  const displayChartData = chartData || {
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
  
  const displayMetrics = metrics || {
    totalReports: 0,
    activeReports: 0,
    resolvedReports: 0,
    websites: 0,
  }

  return (
    <div className="min-h-screen  overflow-y-scroll scrollbar-hide font-sans">
           {/* <Background color={'/#e0e0e0ff'}/> */}
            <SimpleHeader color={'#c5b5ff'}/>
      <div className="relative h-full  md:px-10 px-5 py-8">
        {/* Header */}
        <div className="mb-0">
         <div className="relative header flex flex-col gap-5 sm:flex-row justify-between items-start md:items-center">
              <div className="heading flex flex-col gap-1">
                <h1 className="text-5xl md:text-5xl md font-bold bg-gradient-to-r tracking-tight from-blue-500 via-purple-400  to-purple-800 bg-clip-text text-transparent ">
                  Analytics Dashboard
                </h1>
                <p className="text-md text-gray-700 tracking-tight">
                  Welcome back! Here's your Analytics Overview.
                </p>
              </div>
              <Link
                to="scriptGen"
                className="flex items-center justify-center hidden md:flex"
              >
                {" "}
               <AddButton/>
              </Link>
            </div>
          {!hasFilteredData && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                No data available for the selected timeframe. Showing empty charts. Try selecting "All Time" to see all data.
              </p>
            </div>
          )}
        </div>

        {/* Selectors */}
        <Selectors
          websites={websites}
          selectedWebsite={selectedWebsite}
          onWebsiteChange={setSelectedWebsite}
          selectedTimeframe={selectedTimeframe}
          onTimeframeChange={setSelectedTimeframe}
        />

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 p-4 gap-4 mb-8">
          <MetricCard label="Total Reports" value={displayMetrics.totalReports || 0} color="total" />
          <MetricCard label="Active" value={displayMetrics.activeReports || 0} color="active" />
          <MetricCard label="Resolved" value={displayMetrics.resolvedReports || 0} color="resolved" />
          <MetricCard
            label="Critical"
            value={filteredData.filter((item) => item.severity && item.severity >= 4).length}
            color="critical"
          />
          <MetricCard
            label="Avg Rating"
            value={displayChartData.avgRating > 0 ? displayChartData.avgRating.toFixed(1) : "N/A"}
            color="rating"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Reports by Type">
            <ReportsByTypeChart data={displayChartData.reportsByType} />
          </ChartCard>

          <ChartCard title="Reports Over Time">
            <ReportsOverTimeChart data={displayChartData.reportsOverTime} />
          </ChartCard>

          <ChartCard title="Average Rating by Severity">
            <AvgRatingBySeverityChart data={displayChartData.avgRatingBySeverity} />
          </ChartCard>

          <ChartCard title="Active vs Resolved">
            <ActiveVsResolvedChart data={displayChartData.activeVsResolved} />
          </ChartCard>

          <ChartCard title="Average Severity & Rating">
            <SeverityRatingChart avgSeverity={displayChartData.avgSeverity} avgRating={displayChartData.avgRating} />
          </ChartCard>

          <ChartCard title="Severity vs Rating">
            <SeverityVsRatingChart data={displayChartData.severityVsRating} />
          </ChartCard>
        </div>
      </div>
    </div>
  )
}