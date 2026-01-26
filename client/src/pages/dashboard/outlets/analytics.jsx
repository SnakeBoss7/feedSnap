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
import { filterDataByTimeframe, getChartData, getMetrics, getDayBreakdownData } from "../../../components/newCharts/utils"
import { initializeDashboardData } from "../../../components/newCharts/dataAdapter"
import AddButton from "../../../components/button/addButton"
import { Link } from "react-router-dom"
import { SimpleHeader } from "../../../components/header/header"
import { Background } from "../../../components/background/background"
import DayBreakdown from "../../../components/Visual/DayBreakdown"

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

  const dayBreakdownData = useMemo(() => {
    const data = getDayBreakdownData(filteredData)
    return data
  }, [filteredData])

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-gray-50 dark:bg-dark-bg-primary flex flex-col overflow-hidden">
        <SimpleHeader color={'#E94057'} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary3  mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 font-medium">Loading feedback data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg-primary transition-colors duration-300">
        <SimpleHeader color={'#E94057'} />
        <div className="flex items-center justify-center h-[80vh] p-6">
          <div className="text-center max-w-md w-full">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 shadow-sm">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-2">Error Loading Analytics</h3>
              <p className="text-gray-600 dark:text-dark-text-muted mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-purple-500/30"
              >
                Try Again
              </button>
            </div>
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
      { name: "Resolved", value: 0, fill: "#10B981" },
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
    <div className="min-h-screen overflow-y-scroll scrollbar-hide font-sans bg-gray-100 dark:bg-dark-bg-primary transition-colors duration-300">
      <Background color={"#b3a2ebff"} />
      <SimpleHeader color={'#c5b5ff'} />

      <div className="relative h-full max-w-[1600px] mx-auto md:px-10 px-5 py-8 ">
        {/* Header Section */}
        <div className="mb-10">
          <div className="relative header flex flex-col gap-6 sm:flex-row justify-between items-start md:items-center mb-8">
            <div className="heading flex flex-col gap-2">
              <div className="flex items-center gap-3">

                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r tracking-tight from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                  Analytics
                </h1>
              </div>
              <p className="text-gray-600 dark:text-dark-text-muted text-lg ml-1">
                Comprehensive overview of your feedback performance
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Link
                to="/dashboard/scriptGen"
                className="hidden md:flex"
              >
                <AddButton />
              </Link>
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-white dark:bg-dark-bg-secondary p-6 rounded-2xl shadow-md border border-gray-300 dark:border-dark-border mb-8 flex justify-between w-full items-center gap-4">

            <div className="flex justify-between w-full">
              <Selectors
                websites={websites}
                selectedWebsite={selectedWebsite}
                onWebsiteChange={setSelectedWebsite}
                selectedTimeframe={selectedTimeframe}
                onTimeframeChange={setSelectedTimeframe}
              />
            </div>
          </div>

          {!hasFilteredData && (
            <div className="mb-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 flex items-start gap-3">
              <div className="mt-0.5 text-yellow-600 dark:text-yellow-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                No data available for the selected timeframe. Showing empty charts. Try selecting "All Time" to see all data.
              </p>
            </div>
          )}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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

        {/* Main Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          {/* Reports Over Time - Spans 8 columns */}
          <div className="lg:col-span-8">
            <ChartCard title="Feedback Trends">
              <ReportsOverTimeChart data={displayChartData.reportsOverTime} />
            </ChartCard>
          </div>

          {/* Active vs Resolved - Spans 4 columns */}
          <div className="lg:col-span-4">
            <ChartCard title="Resolution Status">
              <ActiveVsResolvedChart data={displayChartData.activeVsResolved} />
            </ChartCard>
          </div>
        </div>

        {/* Secondary Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <ChartCard title="Reports by Type">
              <ReportsByTypeChart data={displayChartData.reportsByType} />
            </ChartCard>
          </div>

          <div className="lg:col-span-4">
            <ChartCard title="Severity vs Rating">
              <SeverityVsRatingChart data={displayChartData.severityVsRating} />
            </ChartCard>
          </div>

          <div className="lg:col-span-3">
            <ChartCard title="Impact Analysis">
              <SeverityRatingChart avgSeverity={displayChartData.avgSeverity} avgRating={displayChartData.avgRating} />
            </ChartCard>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ChartCard title="Rating Distribution by Severity">
            <div className="h-[400px]">
              <AvgRatingBySeverityChart data={displayChartData.avgRatingBySeverity} />
            </div>
          </ChartCard>

          <ChartCard title="Weekly Breakdown">
            <div className="h-[400px] p-4">
              <DayBreakdown data={dayBreakdownData} />
            </div>
          </ChartCard>
          <div classname="h-[100px] w-full" ></div>
        </div>

      </div>

    </div>
  )
}