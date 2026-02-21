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
  Share2,
  Mail,
  Clock,
  Copy,
  Check,
  AlertCircle,
  CheckCircle2,
  MapPin
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

export const FilterTable = React.memo(({ setSelectedData, data, onAction, userRole, onDeleteFeedback, onBulkDeleteFeedback }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [formatType] = useState('csv')
  const [severityFilter, setSeverityFilter] = useState("all")
  const [webUrlFilter, setWebUrlFilter] = useState("all")
  const [dateRange, setDateRange] = useState({})
  const [selectedItems, setSelectedItems] = useState(new Set())
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [viewDetailsItem, setViewDetailsItem] = useState(null)
  const [copiedField, setCopiedField] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, type: null, id: null, count: 0 })
  const [isDeleting, setIsDeleting] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  const canDelete = userRole === 'owner' || userRole === 'editor'

  // Show toast helper
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000)
  }

  // Handle single delete confirmation
  const handleDeleteClick = (itemId) => {
    setDeleteConfirm({ open: true, type: 'single', id: itemId, count: 1 })
  }

  // Handle bulk delete confirmation
  const handleBulkDeleteClick = () => {
    setDeleteConfirm({ open: true, type: 'bulk', id: null, count: selectedItems.size })
  }

  // Execute delete after confirmation
  const executeDelete = async () => {
    setIsDeleting(true)
    try {
      if (deleteConfirm.type === 'single' && onDeleteFeedback) {
        const result = await onDeleteFeedback(deleteConfirm.id)
        if (result.success) {
          showToast(result.message || 'Feedback deleted successfully')
        } else {
          showToast(result.message || 'Failed to delete', 'error')
        }
      } else if (deleteConfirm.type === 'bulk' && onBulkDeleteFeedback) {
        const ids = [...selectedItems]
        const result = await onBulkDeleteFeedback(ids)
        if (result.success) {
          setSelectedItems(new Set())
          showToast(result.message || `${result.deletedCount} feedback(s) deleted`)
        } else {
          showToast(result.message || 'Failed to delete', 'error')
        }
      }
    } catch (err) {
      showToast('An unexpected error occurred', 'error')
    } finally {
      setIsDeleting(false)
      setDeleteConfirm({ open: false, type: null, id: null, count: 0 })
    }
  }

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
    setCopiedField(null)
  }

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const getSeverityAccentColor = (severity) => {
    const s = Number(severity)
    if (s >= 9) return { bar: 'bg-red-600', glow: 'shadow-red-500/20' }
    if (s >= 7) return { bar: 'bg-red-500', glow: 'shadow-red-500/15' }
    if (s >= 4) return { bar: 'bg-amber-500', glow: 'shadow-amber-500/15' }
    if (s >= 1) return { bar: 'bg-emerald-500', glow: 'shadow-emerald-500/15' }
    return { bar: 'bg-gray-400', glow: 'shadow-gray-400/10' }
  }

  const getRelativeTime = (dateStr) => {
    const now = new Date()
    const date = new Date(dateStr)
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
    return `${Math.floor(diffDays / 30)}mo ago`
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
        {/* Search Row */}
        <div className="flex items-center px-4 py-3 border-b border-gray-100 dark:border-dark-border-subtle">
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

        {/* Filters Row - horizontally scrollable on mobile */}
        <div className="flex items-center gap-1 px-2 py-2 overflow-x-auto scrollbar-hide">
          {/* Severity Filter */}
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="h-9 min-w-[120px] flex-shrink-0 bg-gray-50 dark:bg-white/5 border-0 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg px-3 focus:ring-0 focus:outline-none focus:bg-gray-100 dark:focus:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors [&>svg]:text-gray-400" style={{ boxShadow: 'none', outline: 'none' }}>
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
            <SelectTrigger className="h-9 min-w-[120px] flex-shrink-0 bg-gray-50 dark:bg-white/5 border-0 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg px-3 focus:ring-0 focus:outline-none focus:bg-gray-100 dark:focus:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors [&>svg]:text-gray-400" style={{ boxShadow: 'none', outline: 'none' }}>
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
                className="h-9 flex-shrink-0 flex items-center gap-2 px-3 bg-gray-50 dark:bg-white/5 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors outline-none focus:outline-none whitespace-nowrap"
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
              className="h-9 flex-shrink-0 flex items-center gap-1.5 px-3 text-xs font-medium text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors outline-none whitespace-nowrap"
              title="Clear filters"
            >
              <X className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
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
                            {canDelete && (
                              <>
                                <DropdownMenuSeparator className="bg-gray-200 dark:bg-white/10" />
                                <DropdownMenuItem
                                  onClick={(e) => { e.stopPropagation(); handleDeleteClick(item._id); }}
                                  className="text-red-600 dark:text-red-400 cursor-pointer focus:bg-red-50 dark:focus:bg-red-900/20 rounded-lg m-1"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </>
                            )}
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

              {canDelete && (
                <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full text-white/80 dark:text-black/80 hover:bg-red-500/20 hover:text-red-400 dark:hover:text-red-600" title="Delete Selected" onClick={handleBulkDeleteClick}>
                  <Trash2 className="h-2 w-2" />
                </Button>
              )}

              <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full text-white/60 dark:text-black/60 hover:bg-white/20 dark:hover:bg-black/10 hover:text-white dark:hover:text-black ml-1" onClick={() => handleSelectAll(false)} title="Clear Selection">
                <X className="h-2 w-2" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* View Details Dialog */}
      <Dialog open={!!viewDetailsItem} onOpenChange={() => setViewDetailsItem(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto font-sans bg-white dark:bg-[#0a0a0f] border border-gray-200 dark:border-white/[0.08] rounded-2xl shadow-2xl p-0 scrollbar-hide">
          <DialogHeader className="sr-only">
            <DialogTitle>Feedback Details</DialogTitle>
          </DialogHeader>

          {viewDetailsItem && (() => {
            const accent = getSeverityAccentColor(viewDetailsItem.severity)
            return (
              <>
                {/* Severity Accent Bar */}
                <div className={`h-1 w-full ${accent.bar} rounded-t-2xl`} />

                {/* Header Section */}
                <div className="px-6 pt-4 pb-4 border-b border-gray-100 dark:border-white/[0.06]">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h2 className="text-[17px] font-bold text-gray-900 dark:text-white leading-snug flex-1 min-w-0">
                      {viewDetailsItem.title}
                    </h2>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Status Pill */}
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${viewDetailsItem.status
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                        : 'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20'
                        }`}>
                        {viewDetailsItem.status
                          ? <CheckCircle2 className="h-3 w-3" />
                          : <AlertCircle className="h-3 w-3" />
                        }
                        {viewDetailsItem.status ? 'Resolved' : 'Open'}
                      </span>
                    </div>
                  </div>

                  {/* Reporter Info */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-2.5 py-1.5 bg-gray-50 dark:bg-white/[0.04] rounded-lg flex-1 min-w-0">
                      <Mail className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                      <span className="text-sm text-gray-600 dark:text-gray-400 truncate">{viewDetailsItem.email}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(viewDetailsItem.email, 'email')}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-all flex-shrink-0"
                      title="Copy email"
                    >
                      {copiedField === 'email'
                        ? <Check className="h-3.5 w-3.5 text-emerald-500" />
                        : <Copy className="h-3.5 w-3.5" />
                      }
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div className="px-6 py-4 space-y-4">

                  {/* Description */}
                  <div>
                    <label className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5 block">Description</label>
                    <div className="text-[13px] text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-white/[0.03] rounded-xl p-4 max-h-[160px] overflow-y-auto border border-gray-100 dark:border-white/[0.04] scrollbar-hide">
                      <p className="whitespace-pre-wrap break-words">{viewDetailsItem.description || 'No description provided.'}</p>
                    </div>
                  </div>

                  {/* Metrics — Severity + Rating */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Severity Card */}
                    <div className="p-3.5 bg-gray-50 dark:bg-white/[0.03] rounded-xl border border-gray-100 dark:border-white/[0.04]">
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Severity</span>
                        <SeverityBadge severity={viewDetailsItem.severity} />
                      </div>
                      {/* Severity Bar */}
                      <div className="w-full h-1.5 bg-gray-200 dark:bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${accent.bar}`}
                          style={{ width: `${Math.min(Number(viewDetailsItem.severity) * 10, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-gray-400 dark:text-gray-500">0</span>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500">10</span>
                      </div>
                    </div>

                    {/* Rating Card */}
                    <div className="p-3.5 bg-gray-50 dark:bg-white/[0.03] rounded-xl border border-gray-100 dark:border-white/[0.04]">
                      <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-2.5">Rating</span>
                      <div className="flex items-center gap-2">
                        <RatingStar value={viewDetailsItem.rating} />
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {viewDetailsItem.rating}<span className="text-xs text-gray-400 dark:text-gray-500 font-normal">/5</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Source */}
                  <div>
                    <label className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5 block">Source</label>
                    <div className="bg-gray-50 dark:bg-white/[0.03] rounded-xl border border-gray-100 dark:border-white/[0.04] overflow-hidden">
                      <a
                        href={viewDetailsItem.webUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-3.5 py-3 hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.08] flex items-center justify-center flex-shrink-0 shadow-sm">
                          <img
                            src={`https://www.google.com/s2/favicons?domain=${new URL(viewDetailsItem.webUrl).hostname}&sz=32`}
                            alt=""
                            className="w-4 h-4 rounded-sm"
                            onError={(e) => { e.target.style.display = 'none' }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:underline">
                            {new URL(viewDetailsItem.webUrl).hostname.replace('www.', '')}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCopy(viewDetailsItem.webUrl, 'url') }}
                            className="p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
                            title="Copy URL"
                          >
                            {copiedField === 'url'
                              ? <Check className="h-3.5 w-3.5 text-emerald-500" />
                              : <Copy className="h-3.5 w-3.5" />
                            }
                          </button>
                          <ExternalLink className="h-3.5 w-3.5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                        </div>
                      </a>
                      {/* Pathname chip */}
                      {viewDetailsItem.pathname && (
                        <div className="px-3.5 pb-3 pt-0">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3 w-3 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                            <code className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/[0.06] px-2 py-0.5 rounded font-mono truncate">
                              {viewDetailsItem.pathname}
                            </code>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Image Attachment */}
                  {viewDetailsItem.image && (
                    <div>
                      <label className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5 block">Attachment</label>
                      <img
                        src={viewDetailsItem.image}
                        alt="Feedback attachment"
                        className="w-full max-h-[220px] object-contain rounded-xl border border-gray-100 dark:border-white/[0.04] bg-gray-50 dark:bg-white/[0.03]"
                      />
                    </div>
                  )}

                  {/* Timestamps Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/[0.06]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                      <span className="text-[11px] text-gray-400 dark:text-gray-500">
                        Created {format(new Date(viewDetailsItem.createdOn), "MMM dd, yyyy")}
                      </span>
                      <span className="text-[10px] text-gray-300 dark:text-gray-600 font-medium ml-0.5">
                        ({getRelativeTime(viewDetailsItem.createdOn)})
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                      <span className="text-[11px] text-gray-400 dark:text-gray-500">
                        Updated {format(new Date(viewDetailsItem.updatedOn), "MMM dd, yyyy")}
                      </span>
                      <span className="text-[10px] text-gray-300 dark:text-gray-600 font-medium ml-0.5">
                        ({getRelativeTime(viewDetailsItem.updatedOn)})
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirm.open} onOpenChange={(open) => { if (!isDeleting) setDeleteConfirm({ open, type: null, id: null, count: 0 }) }}>
        <DialogContent className="max-w-sm font-sans bg-white dark:bg-dark-bg-secondary border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white">
              {deleteConfirm.type === 'bulk' ? 'Delete Selected Feedback' : 'Delete Feedback'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg">
                <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <p className="text-sm text-red-800 dark:text-red-300">
                {deleteConfirm.type === 'bulk'
                  ? `You are about to permanently delete ${deleteConfirm.count} feedback(s). This action cannot be undone.`
                  : 'This feedback will be permanently deleted. This action cannot be undone.'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm({ open: false, type: null, id: null, count: 0 })}
              disabled={isDeleting}
              className="bg-white dark:bg-dark-bg-secondary border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={executeDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white border-none shadow-lg shadow-red-500/20 transition-all hover:-translate-y-0.5 min-w-[80px]"
            >
              {isDeleting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                'Delete'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border backdrop-blur-sm ${toast.type === 'error'
              ? 'bg-red-50 dark:bg-red-900/90 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
              : 'bg-green-50 dark:bg-green-900/90 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
              }`}
          >
            {toast.type === 'error' ? (
              <X className="h-4 w-4 flex-shrink-0" />
            ) : (
              <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})