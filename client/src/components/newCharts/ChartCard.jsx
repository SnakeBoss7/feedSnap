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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { useThemeContext } from "../../context/themeContext"

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-dark-bg-tertiary p-4 border border-gray-100 dark:border-dark-border-subtle rounded-xl shadow-lg">
        <p className="text-sm font-bold text-gray-900 dark:text-dark-text-primary mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-600 dark:text-dark-text-secondary">{entry.name}:</span>
            <span className="font-bold text-gray-900 dark:text-dark-text-primary">{entry.value}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export const ChartCard = ({ title, children }) => {
  return (
    <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl p-6 shadow-lg dark:shadow-none border border-gray-300 dark:border-dark-border hover:shadow-xl transition-all duration-300 h-full flex flex-col">
      <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text-primary mb-6">{title}</h3>
      <div className="flex-1 min-h-[300px] w-full">
        {children}
      </div>
    </div>
  )
}

export const ReportsByTypeChart = ({ data }) => {
  const { darkMode } = useThemeContext()

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#334155" : "#e5e7eb"} vertical={false} />
        <XAxis
          dataKey="name"
          stroke={darkMode ? "#94a3b8" : "#6b7280"}
          tick={{ fontSize: 11, angle: -20, textAnchor: 'end' }}
          interval={0}
          tickLine={false}
          axisLine={false}
          height={60}
          dy={10}
        />
        <YAxis
          stroke={darkMode ? "#94a3b8" : "#6b7280"}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          dx={-10}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />
        <Bar
          dataKey="value"
          fill="#8B5CF6"
          radius={[6, 6, 0, 0]}
          barSize={40}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={["#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#EF4444"][index % 5]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export const ReportsOverTimeChart = ({ data }) => {
  const { darkMode } = useThemeContext()

  const colors = {
    "Bug Report": "#8B5CF6", // Purple
    "Feature Request": "#10B981", // Green
    Complaint: "#EF4444", // Red
    "General Feedback": "#3B82F6", // Blue
    Improvement: "#F59E0B", // Orange
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          {Object.entries(colors).map(([key, color]) => (
            <linearGradient key={key} id={`color${key.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#334155" : "#e5e7eb"} vertical={false} />
        <XAxis
          dataKey="date"
          stroke={darkMode ? "#94a3b8" : "#6b7280"}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          dy={10}
        />
        <YAxis
          stroke={darkMode ? "#94a3b8" : "#6b7280"}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          dx={-10}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
        {Object.keys(colors).map((key) => (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            stroke={colors[key]}
            fill={`url(#color${key.replace(/\s/g, '')})`}
            strokeWidth={2}
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
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#334155" : "#e5e7eb"} horizontal={false} />
        <XAxis type="number" stroke={darkMode ? "#94a3b8" : "#6b7280"} hide />
        <YAxis
          dataKey="name"
          type="category"
          width={100}
          stroke={darkMode ? "#94a3b8" : "#6b7280"}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />
        <Bar dataKey="value" fill="#10B981" radius={[0, 4, 4, 0]} barSize={20} />
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
          outerRadius={120}
          paddingAngle={5}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend verticalAlign="bottom" height={36} iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  )
}

export const SeverityRatingChart = ({ avgSeverity, avgRating }) => {
  const severityColor = getSeverityColor(avgSeverity)
  const ratingColor = getRatingColor(avgRating)

  // Format numbers to 1 decimal place
  const formattedSeverity = avgSeverity > 0 ? Number(avgSeverity).toFixed(1) : "0.0"
  const formattedRating = avgRating > 0 ? Number(avgRating).toFixed(1) : "0.0"

  return (
    <div className="flex lg:flex-col gap-3 flex-row items-center justify-around h-full p-4">
      <div className="text-center group">
        <div
          className="w-32 h-32 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 mb-4 mx-auto relative overflow-hidden"
          style={{ backgroundColor: `${severityColor}20`, border: `4px solid ${severityColor}` }}
        >
          <div className="absolute inset-0 opacity-20" style={{ backgroundColor: severityColor }}></div>
          <div className="text-center z-10">
            <p className="text-3xl font-bold" style={{ color: severityColor }}>{formattedSeverity}</p>
          </div>
        </div>
        <p className="text-gray-500 dark:text-dark-text-muted text-sm font-medium">Avg Severity</p>
      </div>

      {/* <div className="h-20 w-px bg-gray-200 dark:bg-dark-border-subtle"></div> */}

      <div className="text-center group">
        <div
          className="w-32 h-32 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 mb-4 mx-auto relative overflow-hidden"
          style={{ backgroundColor: `${ratingColor}20`, border: `4px solid ${ratingColor}` }}
        >
          <div className="absolute inset-0 opacity-20" style={{ backgroundColor: ratingColor }}></div>
          <div className="text-center z-10">
            <p className="text-3xl font-bold" style={{ color: ratingColor }}>{formattedRating}</p>
          </div>
        </div>
        <p className="text-gray-500 dark:text-dark-text-muted text-sm font-medium">Avg Rating</p>
      </div>
    </div>
  )
}

// Helper function for severity heatmap colors
const getSeverityColor = (value) => {
  const val = Number.parseFloat(value)
  if (val <= 1.5) return "#10B981" // Green
  if (val <= 2.5) return "#3B82F6" // Blue
  if (val <= 3.5) return "#F59E0B" // Orange
  if (val <= 4.5) return "#EF4444" // Red
  return "#DC2626" // Dark Red
}

// Helper function for rating heatmap colors
const getRatingColor = (value) => {
  const val = Number.parseFloat(value)
  if (val <= 1.5) return "#DC2626" // Dark Red
  if (val <= 2.5) return "#EF4444" // Red
  if (val <= 3.5) return "#F59E0B" // Orange
  if (val <= 4) return "#3B82F6" // Blue
  return "#10B981" // Green
}

export const SeverityVsRatingChart = ({ data }) => {
  const { darkMode } = useThemeContext()

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#334155" : "#e5e7eb"} />
        <XAxis
          dataKey="severity"
          name="Severity"
          stroke={darkMode ? "#94a3b8" : "#6b7280"}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          dy={10}
        />
        <YAxis
          dataKey="rating"
          name="Rating"
          stroke={darkMode ? "#94a3b8" : "#6b7280"}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          dx={-10}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
        <Scatter name="Reports" data={data} fill="#EF4444">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.severity > 3 ? "#EF4444" : "#3B82F6"} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  )
}

export const AvgRatingBySeverityChart = ({ data }) => {
  const { darkMode } = useThemeContext()

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid stroke={darkMode ? "#334155" : "#e5e7eb"} />
        <PolarAngleAxis dataKey="level" stroke={darkMode ? "#94a3b8" : "#6b7280"} tick={{ fontSize: 12 }} />
        <PolarRadiusAxis angle={30} domain={[0, 5]} stroke={darkMode ? "#94a3b8" : "#6b7280"} />
        <Radar
          name="Avg Rating"
          dataKey="avgRating"
          stroke="#8B5CF6"
          fill="#8B5CF6"
          fillOpacity={0.5}
        />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  )
}