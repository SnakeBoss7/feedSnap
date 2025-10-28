"use client"

import { useState, useMemo } from "react"
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
} from "lucide-react"
import { SeverityBadge } from "../button/severity"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Badge } from "../../components/ui/badge"
import { Checkbox } from "../../components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover"
import { Calendar as CalendarComponent } from "../../components/ui/calender"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog"
import { format } from "date-fns"
import { cn } from "../../lib/utils"
import { RatingStar } from "../star/star"
import { exportData } from "../../services/exportData"

export function FilterTable({ data, onAction }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [formatType, setFormatType] = useState('csv')
  const [severityFilter, setSeverityFilter] = useState("all")
  const [webUrlFilter, setWebUrlFilter] = useState("all")
  const [dateRange, setDateRange] = useState({})
  const [selectedItems, setSelectedItems] = useState(new Set())
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [viewDetailsItem, setViewDetailsItem] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

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
    <div className="w-full overflow-y-scroll scrollbar-hide md:px-10 px-5 py-8 font-sans">
      <div className="flex md:flex-row flex-col mb-0 md:mb-5 justify-between">
        <div className="heading flex flex-col pb-4 gap-1">
          <h1 className="text-4xl pb-1 font-extrabold text-black tracking-tight">
            Feedback Management
          </h1>
          <p className="text-md text-gray-700 tracking-tight">
            Welcome back! Here's your feedback overview.
          </p>
        </div>
        <div>
          <div className="flex gap-4 mb-2">
            <button className="flex items-center gap-2 text-sm border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all group">
              <RefreshCcw 
                size={15} 
                className="text-black transition-transform duration-300 group-hover:rotate-180" 
              />
              <span className="text-black font-medium">Refresh</span>
            </button>
            <button 
              onClick={() => exportData(formatType)} 
              className="flex items-center gap-2 text-sm border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all group"
            >
              <Download 
                size={15} 
                className="text-black transition-transform duration-300 group-hover:-translate-y-1" 
              />
              <span className="text-black font-medium">Export All</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col bg-white rounded-t-lg gap-5 border border-gray-200 p-0">
        <div className="p-3">
          <div className="flex font-medium mb-8 justify-between sm:flex-row h-5 sm:items-center gap-4">
            {selectedItems.size > 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex mt-5  items-center gap-2"
              >
                <div className="w-[30px] text-center md:w-fit md:py-1 md:h-fit text-[12px] bg-backgr rounded-3xl text-white px-2 h-[20px] hover:text-white">
                  {selectedItems.size} selected
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Actions <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white font-sans">
                    <DropdownMenuItem 
                      className="hover:bg-primary5/20 hover:text-black p-1 rounded-lg" 
                      onClick={() =>
                        onAction?.(
                          filteredData.filter((item) => selectedItems.has(item._id)),
                          "export",
                        )
                      }
                    >
                      Export Selected
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="hover:bg-primary/10 hover:text-black p-1 rounded-lg" 
                      onClick={() =>
                        onAction?.(
                          filteredData.filter((item) => selectedItems.has(item._id)),
                          "delete",
                        )
                      }
                    >
                      Delete Selected
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="hover:bg-primary/10 hover:text-black p-1 rounded-lg" 
                      onClick={() =>
                        onAction?.(
                          filteredData.filter((item) => selectedItems.has(item._id)),
                          "archive",
                        )
                      }
                    >
                      Archive Selected
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            ) : (
              <h2 className="mt-2 text-lg font-bold  ">Feedbacks data</h2>
            )}
          </div>

          <div className="">
            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 bg-white lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative sm:col-span-2 bg-white rounded-md border border-gray-200 focus-within:border-gray-200 transition-colors">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search titles, descriptions, emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-0 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>

              {/* Severity Filter - Updated for 0-10 scale */}
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="bg-white border border-gray-200 focus:border-gray-200 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent className="bg-white font-sans">
                  <SelectItem value="all" className="hover:bg-primary/10 hover:text-black p-1 rounded-lg">
                    All Severities
                  </SelectItem>
                  <SelectItem value="0" className="hover:bg-primary/10 hover:text-black p-1 rounded-lg">
                    None (0)
                  </SelectItem>
                  <SelectItem value="1-3" className="hover:bg-primary/10 hover:text-black p-1 rounded-lg">
                    Low (1-3)
                  </SelectItem>
                  <SelectItem value="4-6" className="hover:bg-primary/10 hover:text-black p-1 rounded-lg">
                    Medium (4-6)
                  </SelectItem>
                  <SelectItem value="7-8" className="hover:bg-primary/10 hover:text-black p-1 rounded-lg">
                    High (7-8)
                  </SelectItem>
                  <SelectItem value="9-10" className="hover:bg-primary/10 hover:text-black p-1 rounded-lg">
                    Critical (9-10)
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Web URL Filter */}
              <Select value={webUrlFilter} onValueChange={setWebUrlFilter}>
                <SelectTrigger className="bg-white border border-gray-200 focus:border-gray-200 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors">
                  <SelectValue placeholder="Web URL" />
                </SelectTrigger>
                <SelectContent className="bg-white font-sans">
                  <SelectItem value="all" className="hover:bg-primary/10 hover:text-black p-1 rounded-lg">
                    All URLs
                  </SelectItem>
                  {uniqueWebUrls.map((url) => (
                    <SelectItem key={url} value={url} className="hover:bg-primary/10 hover:text-black p-1 rounded-lg">
                      {new URL(url).hostname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range and Clear Filters */}
            <div className="flex flex-row items-center bg-white sm:flex-row sm:items-center mb-5 mt-3 justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-start bg-white sm:items-center gap-2">
                <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-start text-left font-normal bg-transparent w-full sm:w-auto"
                    >
                      <Calendar className="h-4 bg-white w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        "Pick a date range"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="bg-white border border-gray-300 shadow-xl z-[999999999999999] w-auto p-0" align="start">
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
                    />
                  </PopoverContent>
                </Popover>

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="mr-1 h-4 w-4" />
                    Clear Filters
                  </Button>
                )}
              </div>

              <div className="text-sm text-muted-foreground bg-white">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredData.length)} of {filteredData.length} items
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden rounded-b-lg">
          <div className="overflow-x-auto overflow-hidden">
            <table className="w-full min-w-[800px]">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="p-3 sm:p-4 text-left">
                    <Checkbox 
                      checked={selectedItems.size === paginatedData.length && paginatedData.length > 0}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                    />
                  </th>
                  <th className="p-3 sm:p-4 text-left max-w-[100px] font-bold text-gray-700">Title</th>
                  <th className="p-3 sm:p-4 text-left font-bold text-gray-700">Severity</th>
                  <th className="p-3 sm:p-4 text-left font-bold text-gray-700">Rating</th>
                  <th className="p-3 sm:p-4 text-left font-bold text-gray-700">Web URL</th>
                  <th className="p-3 sm:p-4 text-left font-bold text-gray-700">Email</th>
                  <th className="text-left min-w-[100px] font-bold text-gray-700">Created</th>
                  <th className="p-3 sm:p-4 text-left font-bold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {paginatedData.map((item, index) => (
                    <motion.tr
                      key={`${item._id}-${currentPage}`}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: 0.2,
                        delay: index * 0.03,
                        ease: "easeOut",
                      }}
                      className="border-b hover:bg-muted/50 transition-colors duration-150"
                    >
                      <td className="p-3 sm:p-4">
                        <Checkbox
                          checked={selectedItems.has(item._id)}
                          onCheckedChange={(checked) => handleSelectItem(item._id, checked)}
                          aria-label={`Select ${item.title}`}
                        />
                      </td>
                      <td className="p-3 sm:p-4">
                        <div className="space-y-1 max-w-[200px] sm:max-w-[150px]">
                          <div className="font-thin text-sm truncate">{item.title}</div>
                          <div className="text-xs text-muted-foreground line-clamp-2">{item.description}</div>
                        </div>
                      </td>
                      <td className="p-3 sm:p-4">
                        <SeverityBadge severity={item.severity} />
                      </td>
                      <td className="p-3 sm:p-4">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-bold">
                            <RatingStar value={item.rating} />
                          </span>
                        </div>
                      </td>
                      <td className="p-3 sm:p-4">
                        <a
                          href={item.webUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 max-w-[150px] truncate"
                        >
                          {new URL(item.webUrl).hostname}
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        </a>
                      </td>
                      <td className="p-3 sm:p-4">
                        <span className="text-sm text-muted-foreground truncate max-w-[150px] block">{item.email}</span>
                      </td>
                      <td className="">
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(item.createdOn), "MMM dd, yyyy")}
                        </span>
                      </td>
                      <td className="p-3 sm:p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="font-sans">
                            <DropdownMenuItem onClick={() => handleViewDetails(item)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-500 bg-red-100 hover:bg-red-100 hover:text-red-500 text-destructive">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>

            {filteredData.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                <Filter className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No results found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your filters or search terms</p>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear all filters
                  </Button>
                )}
              </motion.div>
            )}
          </div>

          {filteredData.length > 0 && (
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t bg-muted/20"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="transition-all duration-150 hover:bg-muted/50 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>

                <div className="flex items-center gap-1 transition-all ease-in-out duration-300">
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
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8 h-8 p-0 transition-all ease-in-out duration-500 hover:scale-105"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="transition-all duration-150 hover:bg-muted/50 disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
               <div className="lg:hidden h-10"></div>
            </motion.div>
          )}
          <div className="lg:h-5 h-10"></div>
        </div>
      </div>

      {/* View Details Dialog */}
      <Dialog open={!!viewDetailsItem} onOpenChange={() => setViewDetailsItem(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto font-sans">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Item Details</DialogTitle>
          </DialogHeader>
          {viewDetailsItem && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Title</label>
                  <p className="text-sm">{viewDetailsItem.title}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm">{viewDetailsItem.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-sm">{viewDetailsItem.description}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Severity</label>
                  <SeverityBadge severity={viewDetailsItem.severity} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Rating</label>
                  <p className="text-sm">{viewDetailsItem.rating}/5</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Vector</label>
                  <p className="text-sm">{viewDetailsItem.vector}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Version</label>
                  <p className="text-sm">{viewDetailsItem.__v}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Web URL</label>
                  <a
                    href={viewDetailsItem.webUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                  >
                    {viewDetailsItem.webUrl}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Pathname</label>
                  <p className="text-sm font-mono">{viewDetailsItem.pathname}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Created On</label>
                  <p className="text-sm">{format(new Date(viewDetailsItem.createdOn), "PPpp")}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Updated On</label>
                  <p className="text-sm">{format(new Date(viewDetailsItem.updatedOn), "PPpp")}</p>
                </div>
              </div>

              {viewDetailsItem.image && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Image</label>
                  <img
                    src={viewDetailsItem.image || "/placeholder.svg"}
                    alt={viewDetailsItem.title}
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}