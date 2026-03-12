import { useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  LabelList,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { useThemeContext } from "../../context/themeContext"

// Enhanced Tooltip Component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-dark-bg-tertiary/95 backdrop-blur-xl p-5 border border-gray-200/50 dark:border-dark-border-subtle/50 rounded-2xl shadow-2xl transition-all duration-300">
        {label && <p className="text-sm font-extrabold text-gray-900 dark:text-white mb-3 pb-3 border-b border-gray-100 dark:border-dark-border">{label}</p>}
        <div className="flex flex-col gap-3">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-6 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: entry.color || entry.fill }} />
                <span className="text-gray-600 dark:text-gray-300 font-medium capitalize">{entry.name}</span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}

export const ChartCard = ({ title, children }) => {
  return (
    <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-dark-border hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 h-full flex flex-col relative overflow-hidden group">
      {/* Decorative Blob */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 ease-in-out" />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">{title}</h3>
      </div>

      <div className="flex-1 min-h-[300px] w-full relative z-10">
        {children}
      </div>
    </div>
  )
}

export const ReportsByTypeChart = ({ data }) => {
  const { darkMode } = useThemeContext()

  // Consistent color map matching Feedback Trends
  const colorMap = {
    "Bug Report": "#8B5CF6",
    "Feature Request": "#10B981",
    "Complaint": "#EF4444",
    "General Feedback": "#3B82F6",
    "Improvement": "#F59E0B",
  }
  const fallbackColors = ["#EC4899", "#14B8A6", "#6366F1", "#F97316"]

  const getColor = (name, index) => {
    return colorMap[name] || fallbackColors[index % fallbackColors.length]
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 10 }} className="focus:outline-none">
        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#334155" : "#e2e8f0"} horizontal={false} />
        <XAxis
          type="number"
          stroke={darkMode ? "#64748b" : "#9ca3af"}
          tick={{ fontSize: 12, fontWeight: 500 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          dataKey="name"
          type="category"
          width={130}
          stroke={darkMode ? "#64748b" : "#9ca3af"}
          tick={{ fontSize: 13, fontWeight: 600, fill: darkMode ? "#cbd5e1" : "#374151" }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', radius: 8 }} />
        <Bar
          dataKey="value"
          radius={[0, 8, 8, 0]}
          barSize={24}
          animationDuration={1500}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={getColor(entry.name, index)}
              className="hover:opacity-80 transition-all duration-300 cursor-pointer drop-shadow-sm"
            />
          ))}
          <LabelList
            dataKey="value"
            position="right"
            fill={darkMode ? "#e2e8f0" : "#475569"}
            fontWeight="bold"
            fontSize={13}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export const ReportsOverTimeChart = ({ data }) => {
  const { darkMode } = useThemeContext()

  const colors = {
    "Bug Report": "#8B5CF6",
    "Feature Request": "#10B981",
    "Complaint": "#EF4444",
    "General Feedback": "#3B82F6",
    "Improvement": "#F59E0B",
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
        <defs>
          {Object.entries(colors).map(([key, color]) => (
            <linearGradient key={key} id={`color${key.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.5} />
              <stop offset="100%" stopColor={color} stopOpacity={0.01} />
            </linearGradient>
          ))}
          {/* Subtle glow filter for the active dots */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#334155" : "#e2e8f0"} vertical={false} opacity={0.6} />
        <XAxis
          dataKey="date"
          stroke={darkMode ? "#64748b" : "#9ca3af"}
          tick={{ fontSize: 12, fontWeight: 600, fill: darkMode ? "#cbd5e1" : "#374151" }}
          tickLine={false}
          axisLine={false}
          dy={15}
          minTickGap={20}
        />
        <YAxis
          stroke={darkMode ? "#64748b" : "#9ca3af"}
          tick={{ fontSize: 12, fontWeight: 500 }}
          tickLine={false}
          axisLine={false}
          dx={-15}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ paddingTop: '20px', fontSize: '13px', fontWeight: 600 }}
          iconType="circle"
          iconSize={10}
        />
        {Object.keys(colors).map((key) => (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            stroke={colors[key]}
            fill={`url(#color${key.replace(/\s/g, '')})`}
            strokeWidth={3}
            activeDot={{ r: 6, strokeWidth: 2, stroke: darkMode ? '#1e293b' : '#fff', fill: colors[key], filter: 'url(#glow)' }}
            animationDuration={1500}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}

export const ReportsByTitleChart = ({ data }) => {
  const { darkMode } = useThemeContext()

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#334155" : "#f3f4f6"} horizontal={false} />
        <XAxis type="number" stroke={darkMode ? "#64748b" : "#9ca3af"} hide />
        <YAxis
          dataKey="name"
          type="category"
          width={120}
          stroke={darkMode ? "#64748b" : "#9ca3af"}
          tick={{ fontSize: 12, fontWeight: 500 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', radius: 8 }} />
        <Bar dataKey="value" fill="#10B981" radius={[0, 8, 8, 0]} barSize={24} animationDuration={1500}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={`url(#greenGradient)`} />
          ))}
        </Bar>
        <defs>
          <linearGradient id="greenGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#10B981" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#34D399" stopOpacity={1} />
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  )
}

export const ActiveVsResolvedChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={80}
          outerRadius={110}
          cornerRadius={10}
          paddingAngle={8}
          dataKey="value"
          stroke="none"
          animationDuration={1500}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.fill}
              className="hover:opacity-80 transition-opacity duration-300 outline-none drop-shadow-md"
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontWeight: 500 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

// Minimal arc gauge component
const ArcGauge = ({ value, maxValue, color }) => {
  const size = 120
  const radius = (size - 8) / 2
  const cx = size / 2
  const cy = size / 2
  const strokeWidth = 8
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(value / maxValue, 1)
  const dashOffset = circumference * (1 - progress)

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="-rotate-90 focus:outline-none">
      {/* Track */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke="currentColor"
        className="text-gray-200 dark:text-gray-800/50"
        strokeWidth={strokeWidth}
      />
      {/* Progress */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        className="transition-all duration-1000 ease-out"
        style={{ filter: `drop-shadow(0 0 4px ${color}40)` }}
      />
    </svg>
  )
}

export const SeverityRatingChart = ({ avgSeverity, avgRating }) => {
  const severityColor = getSeverityColor(avgSeverity)
  const ratingColor = getRatingColor(avgRating)

  const formattedSeverity = avgSeverity > 0 ? Number(avgSeverity).toFixed(1) : "0.0"
  const formattedRating = avgRating > 0 ? Number(avgRating).toFixed(1) : "0.0"

  return (
    <div className="flex lg:flex-col gap-6 md:gap-8 flex-row items-center justify-around h-full p-3 md:p-6 focus:outline-none">
      {/* Severity Gauge */}
      <div className="flex flex-col items-center gap-3 w-1/2 lg:w-full">
        <div className="relative">
          <div className="w-[85px] h-[85px] md:w-[130px] md:h-[130px] flex items-center justify-center">
            <ArcGauge value={Number(avgSeverity) || 0} maxValue={5} color={severityColor} />
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: severityColor }}>
              {formattedSeverity}
            </span>
            <span className="text-[10px] md:text-xs text-gray-400 dark:text-gray-500 font-medium">/ 5</span>
          </div>
        </div>
        <span className="text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-center">Avg Severity</span>
      </div>

      {/* Divider */}
      <div className="hidden lg:block w-3/4 h-px bg-gray-200 dark:bg-gray-800"></div>
      <div className="block lg:hidden h-20 md:h-24 w-px bg-gray-200 dark:bg-gray-800"></div>

      {/* Rating Gauge */}
      <div className="flex flex-col items-center gap-3 w-1/2 lg:w-full">
        <div className="relative">
          <div className="w-[85px] h-[85px] md:w-[130px] md:h-[130px] flex items-center justify-center">
            <ArcGauge value={Number(avgRating) || 0} maxValue={5} color={ratingColor} />
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: ratingColor }}>
              {formattedRating}
            </span>
            <span className="text-[10px] md:text-xs text-gray-400 dark:text-gray-500 font-medium">/ 5</span>
          </div>
        </div>
        <span className="text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-center">Avg Rating</span>
      </div>
    </div>
  )
}

const getSeverityColor = (value) => {
  const val = Number.parseFloat(value)
  if (val <= 1.5) return "#10B981"
  if (val <= 2.5) return "#3B82F6"
  if (val <= 3.5) return "#F59E0B"
  if (val <= 4.5) return "#F97316"
  return "#EF4444"
}

const getRatingColor = (value) => {
  const val = Number.parseFloat(value)
  if (val <= 1.5) return "#EF4444"
  if (val <= 2.5) return "#F97316"
  if (val <= 3.5) return "#F59E0B"
  if (val <= 4.5) return "#3B82F6"
  return "#10B981"
}

export const SeverityVsRatingChart = ({ data }) => {
  const { darkMode } = useThemeContext()

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -10 }} className="focus:outline-none">
        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#334155" : "#e2e8f0"} />
        <XAxis
          dataKey="severity"
          name="Severity"
          stroke={darkMode ? "#64748b" : "#9ca3af"}
          tick={{ fontSize: 12, fontWeight: 500 }}
          tickLine={false}
          axisLine={false}
          dy={10}
          domain={[0, 5]}
          type="number"
        />
        <YAxis
          dataKey="rating"
          name="Rating"
          stroke={darkMode ? "#64748b" : "#9ca3af"}
          tick={{ fontSize: 12, fontWeight: 500 }}
          tickLine={false}
          axisLine={false}
          dx={-10}
          domain={[0, 5]}
          type="number"
        />
        <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: darkMode ? '#475569' : '#cbd5e1' }} />
        <Scatter name="Reports" data={data} animationDuration={1500}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.severity > 3 ? "#EF4444" : "#3B82F6"}
              fillOpacity={0.7}
              className="hover:fill-opacity-100 transition-all duration-300 drop-shadow-sm"
            />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  )
}

export const AvgRatingBySeverityChart = ({ data }) => {
  const { darkMode } = useThemeContext()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const handler = (e) => setIsMobile(e.matches)
    setIsMobile(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Distinct but clean modern palette for the severity radar
  const colorMap = {
    'Low': '#10B981',      // Emerald green
    'Medium': '#3B82F6',   // Blue
    'High': '#F59E0B',     // Amber
    'Critical': '#EF4444', // Red
  }

  const getColor = (level) => colorMap[level] || '#A78BFA'

  // Responsive label — larger, rotated 45°
  const SimpleLabel = ({ payload, x, y, cx, cy }) => {
    const level = payload.value

    const dx = x - cx
    const dy = y - cy
    const dist = Math.sqrt(dx * dx + dy * dy) || 1

    const nudge = isMobile ? 16 : 24
    const fontSize = isMobile ? 11 : 14
    const nx = x + (dx / dist) * nudge
    const ny = y + (dy / dist) * nudge

    const anchor = Math.abs(dx) < 10 ? 'middle' : dx > 0 ? 'start' : 'end'

    return (
      <text
        x={nx}
        y={ny}
        textAnchor={anchor}
        dominantBaseline="central"
        fill={darkMode ? '#cbd5e1' : '#374151'}
        fontSize={fontSize}
        fontWeight="700"
        style={{ letterSpacing: '0.02em' }}
      >
        {level}
      </text>
    )
  }

  // Minimal dot — no glow, just clean circle
  const CustomDot = (props) => {
    const { cx, cy, payload } = props
    const color = getColor(payload.level)
    const dotR = isMobile ? 3.5 : 4.5
    return (
      <circle
        cx={cx}
        cy={cy}
        r={dotR}
        fill={color}
        stroke={darkMode ? '#1e293b' : '#ffffff'}
        strokeWidth={2}
      />
    )
  }

  // Minimal tooltip
  const RadarTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const entry = payload[0].payload
      const color = getColor(entry.level)
      const rating = Number(entry.avgRating) || 0
      return (
        <div
          className="px-4 py-3 rounded-xl shadow-lg border"
          style={{
            background: darkMode ? '#1e293b' : '#ffffff',
            borderColor: darkMode ? '#334155' : '#e2e8f0',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="font-semibold text-[13px]" style={{ color: darkMode ? '#e2e8f0' : '#1e293b' }}>
              {entry.level}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold" style={{ color }}>
              {rating > 0 ? rating.toFixed(1) : '—'}
            </span>
            <span className="text-xs" style={{ color: darkMode ? '#475569' : '#94a3b8' }}>/ 5</span>
            <span className="text-xs ml-2" style={{ color: darkMode ? '#64748b' : '#94a3b8' }}>
              {entry.count || 0} reports
            </span>
          </div>
        </div>
      )
    }
    return null
  }

  const outerRadius = isMobile ? '60%' : '70%'

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart
        cx="50%"
        cy="50%"
        outerRadius={outerRadius}
        data={data}
        margin={{ top: 30, right: 30, bottom: 30, left: 30 }}
      >
        <defs>
          <linearGradient id="severityRadarFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={darkMode ? '#60A5FA' : '#3B82F6'} stopOpacity={0.15} />
            <stop offset="100%" stopColor={darkMode ? '#A78BFA' : '#8B5CF6'} stopOpacity={0.03} />
          </linearGradient>
        </defs>

        <PolarGrid
          stroke={darkMode ? 'rgba(148,163,184,0.25)' : 'rgba(0,0,0,0.12)'}
          strokeWidth={1}
          gridType="polygon"
        />
        <PolarAngleAxis
          dataKey="level"
          tick={<SimpleLabel />}
          stroke="transparent"
        />
        <PolarRadiusAxis
          domain={[0, 5]}
          angle={45}
          tickCount={6}
          tick={({ x, y, payload, cx, cy }) => {
            if (payload.value === 0) return null
            
            // PolarRadiusAxis calculates coordinates for a circle.
            // Since we use a polygon grid (diamond), the line at 45 degrees
            // is closer to the center by a factor of cos(45deg) ≈ 0.7071.
            const scale = 0.7071
            const nx = cx + (x - cx) * scale
            const ny = cy + (y - cy) * scale

            return (
              <text
                x={nx + 3}
                y={ny - 3}
                fill={darkMode ? '#94a3b8' : '#6b7280'}
                fontSize={isMobile ? 10 : 11}
                fontWeight="600"
                textAnchor="start"
                dominantBaseline="auto"
              >
                {payload.value}
              </text>
            )
          }}
          axisLine={false}
          stroke="transparent"
        />
        <Tooltip content={<RadarTooltip />} />
        <Radar
          name="Avg Rating"
          dataKey="avgRating"
          stroke={darkMode ? '#60A5FA' : '#3B82F6'}
          strokeWidth={1.5}
          fill="url(#severityRadarFill)"
          dot={<CustomDot />}
          activeDot={{
            r: 6,
            fill: darkMode ? '#60A5FA' : '#3B82F6',
            stroke: darkMode ? '#1e293b' : '#ffffff',
            strokeWidth: 2,
          }}
          animationDuration={1200}
          animationEasing="ease-out"
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}