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
    <div className="bg-white dark:bg-dark-bg-secondary rounded-3xl p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-dark-border hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 h-full flex flex-col relative overflow-hidden group">
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
      <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#334155" : "#f3f4f6"} horizontal={false} />
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
        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#334155" : "#f3f4f6"} vertical={false} opacity={0.6} />
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

export const SeverityRatingChart = ({ avgSeverity, avgRating }) => {
  const severityColor = getSeverityColor(avgSeverity)
  const ratingColor = getRatingColor(avgRating)

  const formattedSeverity = avgSeverity > 0 ? Number(avgSeverity).toFixed(1) : "0.0"
  const formattedRating = avgRating > 0 ? Number(avgRating).toFixed(1) : "0.0"

  return (
    <div className="flex lg:flex-col gap-4 md:gap-6 flex-row items-center justify-around h-full p-2 md:p-4">
      <div className="text-center group w-full flex flex-col items-center">
        <div
          className="w-24 h-24 md:w-36 md:h-36 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl mb-2 md:mb-4 relative overflow-hidden bg-white dark:bg-dark-bg-tertiary"
          style={{ border: `4px solid ${severityColor}30`, borderWidth: 'var(--border-width, 4px)' }}
        >
          <div className="absolute inset-1 md:inset-2 rounded-full border-[3px] md:border-4" style={{ borderColor: severityColor }}></div>
          <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500" style={{ backgroundColor: severityColor }}></div>
          <div className="text-center z-10 flex flex-col items-center justify-center h-full">
            <p className="text-2xl md:text-4xl font-extrabold" style={{ color: severityColor }}>{formattedSeverity}</p>
            <span className="text-[8px] md:text-[10px] uppercase tracking-wider font-bold text-gray-400 mt-1">/ 5.0</span>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-300 font-semibold tracking-wide uppercase text-xs md:text-sm">Avg Severity</p>
      </div>

      <div className="hidden lg:block w-3/4 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-dark-border to-transparent"></div>
      <div className="block lg:hidden h-16 md:h-24 w-px bg-gradient-to-b from-transparent via-gray-200 dark:via-dark-border to-transparent"></div>

      <div className="text-center group w-full flex flex-col items-center">
        <div
          className="w-24 h-24 md:w-36 md:h-36 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl mb-2 md:mb-4 relative overflow-hidden bg-white dark:bg-dark-bg-tertiary"
          style={{ border: `4px solid ${ratingColor}30`, borderWidth: 'var(--border-width, 4px)' }}
        >
          <div className="absolute inset-1 md:inset-2 rounded-full border-[3px] md:border-4" style={{ borderColor: ratingColor }}></div>
          <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500" style={{ backgroundColor: ratingColor }}></div>
          <div className="text-center z-10 flex flex-col items-center justify-center h-full">
            <p className="text-2xl md:text-4xl font-extrabold" style={{ color: ratingColor }}>{formattedRating}</p>
            <span className="text-[8px] md:text-[10px] uppercase tracking-wider font-bold text-gray-400 mt-1">/ 5.0</span>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-300 font-semibold tracking-wide uppercase text-xs md:text-sm">Avg Rating</p>
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
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#334155" : "#f3f4f6"} />
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

  const colorMap = {
    'low': '#10B981',
    'medium': '#3B82F6',
    'high': '#F59E0B',
    'critical': '#EF4444',
  }

  const getColor = (level) => colorMap[String(level).toLowerCase()] || '#8B5CF6'

  // Clean custom label — no overlapping dots, compact layout
  const CustomAngleLabel = ({ payload, x, y, cx, cy }) => {
    const level = payload.value
    const color = getColor(level)
    const entry = data.find(d => d.level === level)
    const rating = entry ? Number(entry.avgRating) || 0 : 0

    // Push labels significantly further from center
    const dx = x - cx
    const dy = y - cy
    const dist = Math.sqrt(dx * dx + dy * dy)
    const nudge = 28
    const nx = x + (dx / dist) * nudge
    const ny = y + (dy / dist) * nudge

    // Determine text anchor based on horizontal position
    const anchor = Math.abs(dx) < 8 ? 'middle' : dx > 0 ? 'start' : 'end'

    // Vertical alignment tweak — top labels go up, bottom go down
    const verticalShift = dy < -10 ? -4 : dy > 10 ? 8 : 0

    return (
      <g>
        {/* Severity name with inline colored dot */}
        <text
          x={nx}
          y={ny + verticalShift - 2}
          textAnchor={anchor}
          dominantBaseline="central"
          fill={darkMode ? '#cbd5e1' : '#475569'}
          fontSize={11}
          fontWeight="700"
          style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}
        >
          {level}
        </text>
        {/* Rating value — compact, below the label */}
        <text
          x={nx}
          y={ny + verticalShift + 14}
          textAnchor={anchor}
          dominantBaseline="central"
          fill={color}
          fontSize={13}
          fontWeight="800"
        >
          {rating > 0 ? rating.toFixed(1) : '—'}
          <tspan fill={darkMode ? '#475569' : '#b0b8c4'} fontSize={9} fontWeight="500"> /5</tspan>
        </text>
      </g>
    )
  }

  // Premium tooltip
  const RadarTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const entry = payload[0].payload
      const color = getColor(entry.level)
      const rating = Number(entry.avgRating) || 0
      return (
        <div
          className="backdrop-blur-xl p-4 rounded-2xl shadow-2xl border"
          style={{
            background: darkMode ? 'rgba(30,41,59,0.95)' : 'rgba(255,255,255,0.95)',
            borderColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          }}
        >
          <div className="flex items-center gap-2 mb-3 pb-2 border-b" style={{ borderColor: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="font-extrabold text-sm" style={{ color: darkMode ? '#f1f5f9' : '#1e293b' }}>
              {entry.level} Severity
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between gap-8 text-sm">
              <span style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>Avg Rating</span>
              <span className="font-bold" style={{ color }}>
                {rating > 0 ? rating.toFixed(1) : 'N/A'}
                <span className="font-normal" style={{ color: darkMode ? '#475569' : '#9ca3af' }}> / 5.0</span>
              </span>
            </div>
            <div className="flex justify-between gap-8 text-sm">
              <span style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>Reports</span>
              <span className="font-bold" style={{ color: darkMode ? '#e2e8f0' : '#374151' }}>
                {entry.count || 0}
              </span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="52%" data={data}>
        <defs>
          {/* Gradient fill for the radar polygon */}
          <radialGradient id="radarGradientFill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#EC4899" stopOpacity={0.06} />
          </radialGradient>
          {/* Stroke gradient */}
          <linearGradient id="radarStrokeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#A78BFA" />
          </linearGradient>
        </defs>

        <PolarGrid
          stroke={darkMode ? 'rgba(148,163,184,0.1)' : 'rgba(0,0,0,0.06)'}
          strokeWidth={1}
          gridType="polygon"
        />
        <PolarAngleAxis
          dataKey="level"
          tick={<CustomAngleLabel />}
          stroke="transparent"
        />
        <PolarRadiusAxis
          domain={[0, 5]}
          tickCount={6}
          tick={false}
          axisLine={false}
          stroke="transparent"
        />
        <Tooltip content={<RadarTooltip />} />
        <Radar
          name="Avg Rating"
          dataKey="avgRating"
          stroke="#8B5CF6"
          strokeWidth={2}
          fill="url(#radarGradientFill)"
          dot={{
            r: 4.5,
            fill: '#8B5CF6',
            stroke: darkMode ? '#1e293b' : '#ffffff',
            strokeWidth: 2,
          }}
          activeDot={{
            r: 6.5,
            fill: '#A78BFA',
            stroke: darkMode ? '#1e293b' : '#ffffff',
            strokeWidth: 3,
          }}
          animationDuration={1500}
          animationEasing="ease-in-out"
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}