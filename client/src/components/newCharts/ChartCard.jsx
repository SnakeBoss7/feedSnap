import { bg } from "date-fns/locale"
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

export const ChartCard = ({ title, children }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  )
}

export const ReportsByTypeChart = ({ data }) => {
  const colors = ["#A855F7", "#5BAE83", "#E94057", "#2563EB", "#F59E0B"]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="name" stroke="#6b7280" />
        <YAxis stroke="#6b7280" />
        <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb" }} />
        <Bar dataKey="value" fill="#A855F7" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export const ReportsOverTimeChart = ({ data }) => {
  const colors = {
    "Bug Report": "#A855F7",
    "Feature Request": "#5BAE83",
    Complaint: "#E94057",
    "General Feedback": "#2563EB",
    Improvement: "#F59E0B",
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="date" stroke="#6b7280" />
        <YAxis stroke="#6b7280" />
        <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb" }} />
        <Legend />
        <Area
          type="monotone"
          dataKey="Bug Report"
          stroke={colors["Bug Report"]}
          fill={colors["Bug Report"]}
          fillOpacity={0.3}
        />
        <Area
          type="monotone"
          dataKey="Feature Request"
          stroke={colors["Feature Request"]}
          fill={colors["Feature Request"]}
          fillOpacity={0.3}
        />
        <Area
          type="monotone"
          dataKey="Complaint"
          stroke={colors["Complaint"]}
          fill={colors["Complaint"]}
          fillOpacity={0.3}
        />
        <Area
          type="monotone"
          dataKey="General Feedback"
          stroke={colors["General Feedback"]}
          fill={colors["General Feedback"]}
          fillOpacity={0.3}
        />
        <Area
          type="monotone"
          dataKey="Improvement"
          stroke={colors["Improvement"]}
          fill={colors["Improvement"]}
          fillOpacity={0.3}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export const ReportsByTitleChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis type="number" stroke="#6b7280" />
        <YAxis dataKey="name" type="category" width={150} stroke="#6b7280" tick={{ fontSize: 12 }} />
        <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb" }} />
        <Bar dataKey="value" fill="#5BAE83" radius={[0, 8, 8, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export const ActiveVsResolvedChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb" }} />
        <Legend />
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
    <div className="flex items-center justify-around h-80 p-0">
      <div className="text-center">
        <div
          className="w-32 h-32 rounded-full flex items-center justify-center shadow-lg"
          style={{ backgroundColor: severityColor }}
        >
          <div className="text-center">
            <p className="text-white text-sm font-medium">Avg Severity</p>
            <p className="text-white text-4xl font-bold">{formattedSeverity}</p>
          </div>
        </div>
      </div>
      <div className="text-center">
        <div
          className="w-32 h-32 rounded-full flex items-center justify-center shadow-lg"
          style={{ backgroundColor: ratingColor }}
        >
          <div className="text-center">
            <p className="text-white text-sm font-medium">Avg Rating</p>
            <p className="text-white text-4xl font-bold">{formattedRating}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function for severity heatmap colors
const getSeverityColor = (value) => {
  const val = Number.parseFloat(value)
  if (val <= 1.5) return "#5BAE83" // Green
  if (val <= 2.5) return "#2563EB" // Blue
  if (val <= 3.5) return "#F59E0B" // Orange
  if (val <= 4.5) return "#E94057" // Red
  return "#DC2626" // Dark Red
}

// Helper function for rating heatmap colors
const getRatingColor = (value) => {
  const val = Number.parseFloat(value)
  if (val <= 1.5) return "#DC2626" // Dark Red
  if (val <= 2.5) return "#E94057" // Red
  if (val <= 3.5) return "#F59E0B" // Orange
  if (val <= 4) return "#2563EB" // Blue
  return "#5BAE83" // Green
}

export const SeverityVsRatingChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="severity" name="Severity" stroke="#6b7280" />
        <YAxis dataKey="rating" name="Rating" stroke="#6b7280" />
        <Tooltip
          contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb" }}
          cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
        />
        <Scatter name="Reports" data={data} fill="#E94057" />
      </ScatterChart>
    </ResponsiveContainer>
  )
}

export const AvgRatingBySeverityChart = ({ data }) => {
  return (
    <ResponsiveContainer 
    width="100%" height={300}>
      <RadarChart data={data}>
        <PolarGrid stroke="#e5e7eb" />
        <PolarAngleAxis dataKey="level" stroke="#6b7280" />
        <PolarRadiusAxis angle={90} domain={[0, 5]} stroke="#6b7280" />
        <Radar
          name="Avg Rating"
          dataKey="avgRating"
          stroke="#A855F7"
          fill="#A855F7"
          fillOpacity={0.6}
        />
        <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb" }} />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  )
}