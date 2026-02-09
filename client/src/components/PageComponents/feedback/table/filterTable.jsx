"use client"

import React, { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Filter,
  Calendar,
  MoreHorizontal,
  X,
  ExternalLink,
  Eye,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  Download,
  Trash2,
  Archive,
  Share2
} from "lucide-react"
import { SeverityBadge } from "../../../button/severity"
import { Button } from "../../../ui/button"
import { Checkbox } from "../../../ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "../../../ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "../../../ui/popover"
import { Calendar as CalendarComponent } from "../../../ui/calender"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../ui/dialog"
import { format } from "date-fns"
import { RatingStar } from "../../../star/star"
import { exportData } from "../../../../services/exportData"

export const FilterTable = React.memo(({ setSelectedData, data, onAction }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [formatType] = useState('csv')
  const [severityFilter, setSeverityFilter] = useState("all")
  const [webUrlFilter, setWebUrlFilter] = useState("all")
  const [dateRange, setDateRange] = useState({})
  const [selectedItems, setSelectedItems] = useState(new Set())
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [viewDetailsItem, setViewDetailsItem] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Get unique web URLs for filter dropdown
  const uniqueWebUrls = useMemo(() => {
    const urls = [...new Set(data.map((item) => item.webUrl))]
    return urls.sort()
  }, [data])

  // Filter data based on all filters
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Search filter
      const matchesSearch =
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchTerm.toLowerCase())

      // Severity filter - Updated for 0-10 scale with ranges
      let matchesSeverity = true
      if (severityFilter !== "all") {
        const itemSeverity = Number(item?.severity)
        if (severityFilter === "0") {
          matchesSeverity = itemSeverity === 0
        } else if (severityFilter === "1-3") {
          matchesSeverity = itemSeverity >= 1 && itemSeverity <= 3
        } else if (severityFilter === "4-6") {
          matchesSeverity = itemSeverity >= 4 && itemSeverity <= 6
        } else if (severityFilter === "7-8") {
          matchesSeverity = itemSeverity >= 7 && itemSeverity <= 8
        } else if (severityFilter === "9-10") {
          matchesSeverity = itemSeverity >= 9 && itemSeverity <= 10
        }
      }

      // Web URL filter
      const matchesWebUrl = webUrlFilter === "all" || item.webUrl === webUrlFilter

      // Date range filter - only filter when BOTH dates are selected
      const itemDate = new Date(item.createdOn)
      const matchesDateRange =
        (!dateRange.from || !dateRange.to) || (itemDate >= dateRange.from && itemDate <= dateRange.to)

      return matchesSearch && matchesSeverity && matchesWebUrl && matchesDateRange
    })
  }, [data, searchTerm, severityFilter, webUrlFilter, dateRange])

  // Update setSelectedData whenever filteredData changes
  useEffect(() => {
    if (setSelectedData) {
      setSelectedData(filteredData)
    }
  }, [filteredData, setSelectedData])

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = filteredData.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, severityFilter, webUrlFilter, dateRange])

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems(new Set(paginatedData.map((item) => item._id)))
    } else {
      setSelectedItems(new Set())
    }
  }

  const handleSelectItem = (itemId, checked) => {
    const newSelected = new Set(selectedItems)
    if (checked) {
      newSelected.add(itemId)
    } else {
      newSelected.delete(itemId)
    }
    setSelectedItems(newSelected)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSeverityFilter("all")
    setWebUrlFilter("all")
    setDateRange({})
    setCurrentPage(1)
  }

  const hasActiveFilters =
    searchTerm || severityFilter !== "all" || webUrlFilter !== "all" || dateRange.from || dateRange.to

  const handleViewDetails = (item) => {
    setViewDetailsItem(item)
  }

  return (
    <div className="w-full font-sans space-y-6 p-1">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold text-black dark:text-white tracking-tight">
            Feedback Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-dark-text-secondary font-medium">
            Monitor and analyze user feedback across all your sites.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="bg-white dark:bg-dark-bg-secondary border-gray-300  text-gray-700 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-bg-hover shadow-sm"
            onClick={() => window.location.reload()}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button
            className="bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black border-none shadow-lg shadow-gray-500/20 transition-all hover:-translate-y-0.5"
            onClick={() => exportData(formatType)}
          >
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Filter Bar - Clean Minimal Design */}
      <div className="bg-white dark:bg-dark-bg-secondary rounded-xl border border-gray-200 dark:border-dark-border-subtle mb-6 overflow-hidden">
        <div className="flex flex-wrap items-center">
          {/* Search Input */}
          <div className="flex-1 min-w-[200px] flex items-center px-4 py-3 border-r border-gray-100 dark:border-dark-border-subtle">
            <Search className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search feedback..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none border-none focus:ring-0 focus:outline-none"
              style={{ boxShadow: 'none' }}
            />
          </div>

          {/* Filters Container */}
          <div className="flex items-center gap-1 px-2 py-2">
            {/* Severity Filter */}
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="h-9 min-w-[120px] bg-gray-50 dark:bg-white/5 border-0 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg px-3 focus:ring-0 focus:outline-none focus:bg-gray-100 dark:focus:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors [&>svg]:text-gray-400" style={{ boxShadow: 'none', outline: 'none' }}>
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-dark-bg-secondary border border-gray-200 dark:border-dark-border-subtle rounded-xl shadow-lg z-[100] overflow-hidden" style={{ outline: 'none' }}>
                <SelectItem value="all" className="text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 focus:bg-gray-50 dark:focus:bg-white/5 rounded-lg mx-1 my-0.5">All Severities</SelectItem>
                <SelectItem value="9-10" className="text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 focus:bg-gray-50 dark:focus:bg-white/5 rounded-lg mx-1 my-0.5">Critical (9-10)</SelectItem>
                <SelectItem value="7-8" className="text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 focus:bg-gray-50 dark:focus:bg-white/5 rounded-lg mx-1 my-0.5">High (7-8)</SelectItem>
                <SelectItem value="4-6" className="text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 focus:bg-gray-50 dark:focus:bg-white/5 rounded-lg mx-1 my-0.5">Medium (4-6)</SelectItem>
                <SelectItem value="1-3" className="text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 focus:bg-gray-50 dark:focus:bg-white/5 rounded-lg mx-1 my-0.5">Low (1-3)</SelectItem>
              </SelectContent>
            </Select>

            {/* Website Filter */}
            <Select value={webUrlFilter} onValueChange={setWebUrlFilter}>
              <SelectTrigger className="h-9 min-w-[120px] bg-gray-50 dark:bg-white/5 border-0 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg px-3 focus:ring-0 focus:outline-none focus:bg-gray-100 dark:focus:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors [&>svg]:text-gray-400" style={{ boxShadow: 'none', outline: 'none' }}>
                <SelectValue placeholder="Website" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-dark-bg-secondary border border-gray-200 dark:border-dark-border-subtle rounded-xl shadow-lg z-[100] max-h-[280px] overflow-hidden" style={{ outline: 'none' }}>
                <SelectItem value="all" className="text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 focus:bg-gray-50 dark:focus:bg-white/5 rounded-lg mx-1 my-0.5">All Websites</SelectItem>
                {uniqueWebUrls.map((url) => (
                  <SelectItem key={url} value={url} className="text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 focus:bg-gray-50 dark:focus:bg-white/5 rounded-lg mx-1 my-0.5">
                    {new URL(url).hostname}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date Picker */}
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <button
                  className="h-9 flex items-center gap-2 px-3 bg-gray-50 dark:bg-white/5 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors outline-none focus:outline-none whitespace-nowrap"
                  style={{ boxShadow: 'none' }}
                >
                  <Calendar className="h-4 w-4 text-gray-400" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <span>{format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd")}</span>
                    ) : (
                      <span>{format(dateRange.from, "MMM dd")}</span>
                    )
                  ) : (
                    <span className="text-gray-400">Date range</span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 bg-white dark:bg-dark-bg-secondary border border-gray-200 dark:border-dark-border-subtle rounded-xl shadow-lg z-[100]"
                align="end"
                style={{ outline: 'none' }}
              >
                <CalendarComponent
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => {
                    // Only update if we have a valid selection
                    if (range) {
                      // If clicking same date twice, treat as single day range
                      if (range.from && range.to && range.from.getTime() === range.to.getTime()) {
                        // User clicked the same date - keep it as just 'from'
                        setDateRange({ from: range.from, to: undefined })
                      } else {
                        setDateRange({ from: range.from, to: range.to })
                        // Only close when both dates are different (proper range selected)
                        if (range.from && range.to && range.from.getTime() !== range.to.getTime()) {
                          setIsDatePickerOpen(false)
                        }
                      }
                    }
                  }}
                  numberOfMonths={2}
                  className="p-3"
                />
              </PopoverContent>
            </Popover>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="h-9 w-9 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors outline-none"
                title="Clear filters"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white dark:bg-dark-bg-secondary rounded-xl border border-gray-200 dark:border-dark-border-subtle shadow-sm transition-colors duration-300 relative overflow-hidden">

        {/* Table */}
        <div className="overflow-x-scroll overflow-y-scroll scrollbar-hide">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-dark-border-subtle bg-gray-50/50 dark:bg-white/5">
                <th className="px-2 py-1 w-[10px]">
                  <Checkbox
                    checked={paginatedData.length > 0 && selectedItems.size === paginatedData.length}
                    onCheckedChange={handleSelectAll}
                    className="border border-gray-300 dark:border-gray-600 bg-transparent data-[state=checked]:bg-black dark:data-[state=checked]:bg-white data-[state=checked]:border-black dark:data-[state=checked]:border-white data-[state=checked]:text-white dark:data-[state=checked]:text-black w-4 h-4 rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Details</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Severity</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rating</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Source</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 w-[60px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-y-0">
              <AnimatePresence mode="wait">
                {paginatedData.length > 0 ? (
                  paginatedData.map((item, index) => (
                    <motion.tr
                      key={item._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className={`
                        group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer border-b border-gray-200 dark:border-dark-border-subtle
                        ${selectedItems.has(item._id) ? 'bg-gray-50 dark:bg-white/[0.03] border-l-2 border-l-black dark:border-l-white' : ''}
                      `}
                    >
                      <td className="px-6 py-4">
                        <Checkbox
                          checked={selectedItems.has(item._id)}
                          onCheckedChange={(checked) => handleSelectItem(item._id, checked)}
                          className={`border border-gray-300 dark:border-gray-600 bg-transparent data-[state=checked]:bg-black dark:data-[state=checked]:bg-white data-[state=checked]:border-black dark:data-[state=checked]:border-white data-[state=checked]:text-white dark:data-[state=checked]:text-black w-4 h-4 rounded transition-opacity ${!selectedItems.has(item._id) ? 'opacity-0 group-hover:opacity-100' : ''}`}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-0.5">{item.title}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">{item.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 max-w-[200px]">
                        <div className="group/desc relative">
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate cursor-default">
                            {item.description?.slice(0, 40)}{item.description?.length > 40 ? '...' : ''}
                          </p>
                          {/* Tooltip - shows for all descriptions */}
                          {item.description && (
                            <div className="invisible group-hover/desc:visible opacity-0 group-hover/desc:opacity-100 transition-opacity duration-200 absolute z-[999] bottom-full left-0 mb-2 w-72 pointer-events-none">
                              <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs leading-relaxed rounded-lg p-3 shadow-2xl border border-gray-800 dark:border-gray-200">
                                <p className="whitespace-pre-wrap break-words">{item.description}</p>
                              </div>
                              <div className="absolute top-full left-6 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-900 dark:border-t-gray-100"></div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <SeverityBadge severity={item.severity} />
                      </td>
                      <td className="px-4 py-4">
                        <RatingStar value={item.rating} />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                            <img
                              src={`https://www.google.com/s2/favicons?domain=${new URL(item.webUrl).hostname}&sz=32`}
                              alt=""
                              className="w-4 h-4 rounded-sm"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <ExternalLink className="h-3 w-3 text-gray-500 dark:text-gray-400 hidden" />
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[120px]">
                            {new URL(item.webUrl).hostname.replace('www.', '')}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">
                          {format(new Date(item.createdOn), "MMM dd, yyyy")}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-700 dark:hover:text-white  transition-opacity">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 bg-white dark:bg-dark-bg-secondary border border-gray-200 dark:border-white/10 shadow-xl rounded-xl">
                            <DropdownMenuItem onClick={() => handleViewDetails(item)} className="cursor-pointer text-gray-700 dark:text-gray-200 focus:bg-gray-100 dark:focus:bg-white/10 rounded-lg m-1">
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer text-gray-700 dark:text-gray-200 focus:bg-gray-100 dark:focus:bg-white/10 rounded-lg m-1">
                              <Archive className="mr-2 h-4 w-4" /> Archive
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-gray-200 dark:bg-white/10" />
                            <DropdownMenuItem className="text-red-600 dark:text-red-400 cursor-pointer focus:bg-red-50 dark:focus:bg-red-900/20 rounded-lg m-1">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="p-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400 dark:text-dark-text-muted">
                        <div className="p-4 bg-gray-50 dark:bg-dark-bg-tertiary rounded-full mb-4">
                          <Filter className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No feedback found</h3>
                        <p className="text-sm">Try adjusting your filters or search terms</p>
                        {hasActiveFilters && (
                          <Button
                            variant="link"
                            onClick={clearFilters}
                            className="mt-2 text-black dark:text-white"
                          >
                            Clear all filters
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredData.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-dark-border-subtle bg-gray-50/50 dark:bg-white/5 flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Showing <span className="font-medium text-gray-900 dark:text-white">{startIndex + 1}-{Math.min(endIndex, filteredData.length)}</span> of <span className="font-medium text-gray-900 dark:text-white">{filteredData.length}</span> results
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors disabled:opacity-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors disabled:opacity-50"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Minimal Floating Bulk Actions - Moved to bottom left */}
        <AnimatePresence>
          {selectedItems.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="absolute top-2 left-5 z-10 flex items-center gap-1 bg-black/90 dark:bg-white/90 backdrop-blur-sm text-white dark:text-black shadow-xl rounded-full px-1 py-1 border border-white/10 dark:border-black/10"
            >
              <span className="text-xs font-medium px-2 border-r border-white/20 dark:border-black/20 mr-1">
                {selectedItems.size}
              </span>

              <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full text-white/80 dark:text-black/80 hover:bg-white/20 dark:hover:bg-black/10 hover:text-white dark:hover:text-black" title="Export Selected">
                <Share2 className="h-2 w-2" />
              </Button>

              <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full text-white/80 dark:text-black/80 hover:bg-red-500/20 hover:text-red-400 dark:hover:text-red-600" title="Delete Selected">
                <Trash2 className="h-2 w-2" />
              </Button>

              <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full text-white/60 dark:text-black/60 hover:bg-white/20 dark:hover:bg-black/10 hover:text-white dark:hover:text-black ml-1" onClick={() => handleSelectAll(false)} title="Clear Selection">
                <X className="h-2 w-2" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* View Details Dialog */}
      <Dialog open={!!viewDetailsItem} onOpenChange={() => setViewDetailsItem(null)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto font-sans bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Feedback Details</DialogTitle>
          </DialogHeader>

          {viewDetailsItem && (
            <>
              {/* Sticky Header */}
              <div className="sticky top-0 z-10 bg-white dark:bg-black px-6 py-4 border-b border-gray-100 dark:border-white/10">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">{viewDetailsItem.title}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{viewDetailsItem.email}</p>
                  </div>
                  <SeverityBadge severity={viewDetailsItem.severity} />
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-5 space-y-5">
                {/* Description */}
                <div>
                  <label className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 block">Description</label>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-white/5 rounded-xl p-4">
                    {viewDetailsItem.description}
                  </p>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{viewDetailsItem.rating}<span className="text-xs text-gray-500 dark:text-gray-400 font-normal">/5</span></p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Rating</span>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{viewDetailsItem.severity}</p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Severity</span>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">v{viewDetailsItem.__v}</p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Version</span>
                  </div>
                </div>

                {/* Source */}
                <div>
                  <label className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 block">Source</label>
                  <a
                    href={viewDetailsItem.webUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors group"
                  >
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{new URL(viewDetailsItem.webUrl).hostname}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{viewDetailsItem.pathname}</p>
                    </div>
                  </a>
                </div>

                {/* Timestamps */}
                <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 pt-4 border-t border-gray-100 dark:border-white/10">
                  <span>Created: {format(new Date(viewDetailsItem.createdOn), "MMM dd, yyyy")}</span>
                  <span>Updated: {format(new Date(viewDetailsItem.updatedOn), "MMM dd, yyyy")}</span>
                </div>

                {/* Image Attachment */}
                {viewDetailsItem.image && (
                  <div>
                    <label className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 block">Attachment</label>
                    <img
                      src={viewDetailsItem.image}
                      alt="Feedback attachment"
                      className="w-full max-h-[250px] object-contain rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5"
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
})