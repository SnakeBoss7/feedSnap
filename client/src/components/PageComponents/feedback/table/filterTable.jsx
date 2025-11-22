"use client"

import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Filter,
  Calendar,
  ChevronDown,
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
  SlidersHorizontal,
  CheckSquare
} from "lucide-react"
import { SeverityBadge } from "../../../button/severity"
import { Button } from "../../../ui/button"
import { Input } from "../../../ui/input"
import { Checkbox } from "../../../ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "../../../ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "../../../ui/popover"
import { Calendar as CalendarComponent } from "../../../ui/calender"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../ui/dialog"
import { format } from "date-fns"
import { RatingStar } from "../../../star/star"
import { exportData } from "../../../../services/exportData"

export function FilterTable({ setSelectedData, data, onAction }) {
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

      // Date range filter
      const itemDate = new Date(item.createdOn)
      const matchesDateRange =
        (!dateRange.from || itemDate >= dateRange.from) && (!dateRange.to || itemDate <= dateRange.to)

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
  useMemo(() => {
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

      {/* Main Content Card */}
      <div className="bg-white dark:bg-dark-bg-secondary rounded-xl border border-gray-300 dark:border-0 shadow-sm overflow-hidden transition-colors duration-300 relative">
        
        {/* Toolbar */}
        <div className="p-5 border-b border-gray-200 dark:border-0 space-y-4 bg-white dark:bg-transparent">
          <div className="flex flex-col">
            {/* Search */}
            <div className="pb-3">
              <h1>Feedbacks</h1>
            </div>
           <div  className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
             <div className="relative w-full xl:w-96 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors h-4 w-4" />
              <Input
                placeholder="Search feedback..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white dark:bg-dark-bg-tertiary border-gray-300 dark:border-dark-border-emphasis focus:border-black dark:focus:border-white focus:ring-0 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-dark-text-tertiary shadow-sm"
              />
            </div>

            {/* Filters Group - Forced Single Line */}
            <div className="flex items-center gap-3 overflow-x-auto pb-1 xl:pb-0 w-full xl:w-auto scrollbar-hide">
              {/* Severity Filter */}
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="min-w-[140px] bg-white dark:bg-dark-bg-secondary border-gray-300 dark:border-0 focus:ring-0 focus:border-black dark:focus:border-white text-gray-700 dark:text-dark-text-secondary shadow-sm">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent className="dark:bg-dark-bg-secondary dark:border-0">
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="0">None (0)</SelectItem>
                  <SelectItem value="1-3">Low (1-3)</SelectItem>
                  <SelectItem value="4-6">Medium (4-6)</SelectItem>
                  <SelectItem value="7-8">High (7-8)</SelectItem>
                  <SelectItem value="9-10">Critical (9-10)</SelectItem>
                </SelectContent>
              </Select>

              {/* Web URL Filter */}
              <Select value={webUrlFilter} onValueChange={setWebUrlFilter}>
                  <SelectTrigger className="min-w-[160px] bg-white dark:bg-dark-bg-secondary border-gray-300 dark:border-0 focus:ring-0 focus:border-black dark:focus:border-white text-gray-700 dark:text-dark-text-secondary shadow-sm">
                  <SelectValue placeholder="Website" />
                </SelectTrigger>
                <SelectContent className="dark:bg-dark-bg-secondary dark:border-0">
                  <SelectItem value="all">All Websites</SelectItem>
                  {uniqueWebUrls.map((url) => (
                    <SelectItem key={url} value={url}>
                      {new URL(url).hostname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Date Picker */}
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`min-w-[240px] justify-start text-left font-normal bg-white dark:bg-dark-bg-secondary border-gray-300 dark:border-0 focus:ring-0 focus:border-black dark:focus:border-white text-gray-700 dark:text-dark-text-secondary shadow-sm ${
                      !dateRange.from && "text-muted-foreground"
                    }`}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-50 dark:bg-dark-bg-secondary dark:border-0 shadow-xl" align="end">
                  <CalendarComponent
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(range) => {
                      setDateRange({ from: range?.from, to: range?.to })
                      if (range?.from && range?.to) {
                        setIsDatePickerOpen(false)
                      }
                    }}
                    numberOfMonths={2}
                    className="dark:bg-dark-bg-secondary dark:text-white"
                  />
                </PopoverContent>
              </Popover>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={clearFilters}
                  className="text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0"
                  title="Clear filters"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
           </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-scroll overflow-y-scroll scrollbar-hide">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-dark-bg-tertiary dark:border-0">
              <tr>
                <th className="p-4 w-[50px]">
                  <Checkbox 
                    checked={paginatedData.length > 0 && selectedItems.size === paginatedData.length}
                    onCheckedChange={handleSelectAll}
                    className="border-1 border-gray-400 dark:border-gray-500 data-[state=checked]:bg-black dark:data-[state=checked]:bg-white data-[state=checked]:border-black dark:data-[state=checked]:border-white data-[state=checked]:text-white dark:data-[state=checked]:text-black w-3 h-3 rounded-md"
                  />
                </th>
                <th className="p-4 text-left text-xs font-bold text-gray-700 dark:text-dark-text-secondary border-0 uppercase tracking-wider">Title</th>
                <th className="p-4 text-left text-xs font-bold text-gray-700 dark:text-dark-text-secondary uppercase tracking-wider">Severity</th>
                <th className="p-4 text-left text-xs font-bold text-gray-700 dark:text-dark-text-secondary uppercase tracking-wider">Rating</th>
                <th className="p-4 text-left text-xs font-bold text-gray-700 dark:text-dark-text-secondary uppercase tracking-wider">Source</th>
                <th className="p-4 text-left text-xs font-bold text-gray-700 dark:text-dark-text-secondary uppercase tracking-wider">Date</th>
                <th className="p-4 text-right text-xs font-bold text-gray-700 dark:text-dark-text-secondary uppercase tracking-wider">Actions</th>
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
                        group hover:bg-gray-50 dark:hover:bg-dark-bg-hover transition-colors
                        ${selectedItems.has(item._id) ? 'bg-gray-50 dark:bg-dark-bg-tertiary' : ''}
                      `}
                    >
                      <td className="p-4">
                        <Checkbox
                          checked={selectedItems.has(item._id)}
                          onCheckedChange={(checked) => handleSelectItem(item._id, checked)}
                          className="border-1 border-gray-400 dark:border-gray-500 data-[state=checked]:bg-black dark:data-[state=checked]:bg-white data-[state=checked]:border-black dark:data-[state=checked]:border-white data-[state=checked]:text-white dark:data-[state=checked]:text-black w-3 h-3 rounded-md"
                        />
                      </td>
                      <td className="p-4">
                        <div className="max-w-[250px]">
                          <div className="font-medium text-gray-900 dark:text-gray-100 truncate" title={item.title}>
                            {item.title}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-dark-text-secondary truncate mt-0.5">
                            {item.email}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <SeverityBadge severity={item.severity} />
                      </td>
                      <td className="p-4">
                        <RatingStar value={item.rating} />
                      </td>
                      <td className="p-4">
                        <a
                          href={item.webUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-dark-text-secondary hover:text-black dark:hover:text-white transition-colors max-w-[180px] truncate"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {new URL(item.webUrl).hostname}
                        </a>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-600 dark:text-dark-text-secondary whitespace-nowrap">
                          {format(new Date(item.createdOn), "MMM dd, yyyy")}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-700 dark:hover:text-dark-text-primary">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 dark:bg-dark-bg-secondary dark:border-0">
                            <DropdownMenuItem onClick={() => handleViewDetails(item)} className="cursor-pointer dark:focus:bg-dark-bg-hover dark:text-dark-text-primary">
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer dark:focus:bg-dark-bg-hover dark:text-dark-text-primary">
                              <Archive className="mr-2 h-4 w-4" /> Archive
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="dark:bg-dark-border-DEFAULT" />
                            <DropdownMenuItem className="text-red-600 dark:text-red-400 cursor-pointer dark:focus:bg-red-900/20">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-12 text-center">
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
          <div className="p-4 border-t border-gray-300 dark:border-0 flex items-center justify-between bg-gray-50 dark:bg-dark-bg-tertiary">
            <div className="text-sm text-gray-500 dark:text-dark-text-secondary">
              Showing <span className="font-medium text-gray-900 dark:text-white">{startIndex + 1}</span> to <span className="font-medium text-gray-900 dark:text-white">{Math.min(endIndex, filteredData.length)}</span> of <span className="font-medium text-gray-900 dark:text-white">{filteredData.length}</span> results
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="bg-white dark:bg-dark-bg-secondary border-gray-300 dark:border-0 text-gray-700 dark:text-dark-text-secondary disabled:opacity-50 shadow-sm hover:bg-gray-50 dark:hover:bg-dark-bg-hover"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`
                        w-8 h-8 rounded-lg text-sm font-medium transition-all
                        ${currentPage === pageNum 
                          ? 'bg-black dark:bg-white text-white dark:text-black shadow-md' 
                          : 'text-gray-600 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-bg-hover'}
                      `}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="bg-white dark:bg-dark-bg-secondary border-gray-300 dark:border-0 text-gray-700 dark:text-dark-text-secondary disabled:opacity-50 shadow-sm hover:bg-gray-50 dark:hover:bg-dark-bg-hover"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
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
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto font-sans bg-white dark:bg-dark-bg-secondary border-gray-200 dark:border-0">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Eye className="h-5 w-5 text-black dark:text-white" />
              Feedback Details
            </DialogTitle>
          </DialogHeader>
          
          {viewDetailsItem && (
            <div className="space-y-6 mt-4">
              {/* Header Info */}
              <div className="flex flex-col md:flex-row gap-6 p-4 bg-gray-50 dark:bg-dark-bg-tertiary rounded-xl border border-gray-100 dark:border-dark-border-subtle">
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">Title</label>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">{viewDetailsItem.title}</p>
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">Email</label>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-black dark:text-white">
                      {viewDetailsItem.email?.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{viewDetailsItem.email}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">Description</label>
                <div className="p-4 bg-white dark:bg-dark-bg-secondary border border-gray-200 dark:border-0 rounded-xl text-sm text-gray-700 dark:text-dark-text-secondary leading-relaxed">
                  {viewDetailsItem.description}
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-dark-bg-tertiary rounded-lg border border-gray-100 dark:border-dark-border-subtle space-y-1">
                  <label className="text-xs font-medium text-gray-500 dark:text-dark-text-secondary">Severity</label>
                  <div><SeverityBadge severity={viewDetailsItem.severity} /></div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-dark-bg-tertiary rounded-lg border border-gray-100 dark:border-dark-border-subtle space-y-1">
                  <label className="text-xs font-medium text-gray-500 dark:text-dark-text-secondary">Rating</label>
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{viewDetailsItem.rating}</span>
                    <span className="text-xs text-gray-500">/ 5</span>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-dark-bg-tertiary rounded-lg border border-gray-100 dark:border-dark-border-subtle space-y-1">
                  <label className="text-xs font-medium text-gray-500 dark:text-dark-text-secondary">Vector</label>
                  <p className="text-sm font-mono text-gray-700 dark:text-dark-text-secondary">{viewDetailsItem.vector || 'N/A'}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-dark-bg-tertiary rounded-lg border border-gray-100 dark:border-dark-border-subtle space-y-1">
                  <label className="text-xs font-medium text-gray-500 dark:text-dark-text-secondary">Version</label>
                  <p className="text-sm font-mono text-gray-700 dark:text-dark-text-secondary">v{viewDetailsItem.__v}</p>
                </div>
              </div>

              {/* Technical Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">Source</label>
                  <a
                    href={viewDetailsItem.webUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-dark-bg-tertiary border border-gray-200 dark:border-dark-border-subtle rounded-lg text-black dark:text-white hover:underline transition-all"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="text-sm truncate">{viewDetailsItem.webUrl}</span>
                  </a>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">Pathname</label>
                  <div className="p-3 bg-gray-50 dark:bg-dark-bg-tertiary border border-gray-200 dark:border-dark-border-subtle rounded-lg">
                    <code className="text-xs font-mono text-gray-700 dark:text-dark-text-secondary">{viewDetailsItem.pathname}</code>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="flex items-center justify-between text-xs text-gray-400 dark:text-dark-text-muted pt-4 border-t border-gray-100 dark:border-dark-border-subtle">
                <span>Created: {format(new Date(viewDetailsItem.createdOn), "PPpp")}</span>
                <span>Updated: {format(new Date(viewDetailsItem.updatedOn), "PPpp")}</span>
              </div>

              {viewDetailsItem.image && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">Attachment</label>
                  <img
                    src={viewDetailsItem.image}
                    alt="Feedback attachment"
                    className="w-full max-h-[300px] object-contain rounded-lg border border-gray-200 dark:border-dark-border-subtle bg-gray-50 dark:bg-dark-bg-secondary"
                  />
                </div>
              )}
            </div>
          )}
        </DialogContent>
            <div classname="h-[100px] w-full" ></div>
      </Dialog>
    </div>
  )
}