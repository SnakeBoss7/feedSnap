import { ArrowUpRight, Activity, CheckCircle, AlertTriangle, Star, FileText } from "lucide-react"

export const MetricCard = ({ label, value, color }) => {
  const config = {
    total: {
      icon: <FileText size={24} className="text-blue-500 dark:text-blue-400" />,
      bg: "bg-blue-50 dark:bg-blue-900/20",
      trend: "+12% vs last month",
      trendColor: "text-blue-600 dark:text-blue-400"
    },
    active: {
      icon: <Activity size={24} className="text-yellow-500 dark:text-yellow-400" />,
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
      trend: "5 new today",
      trendColor: "text-yellow-600 dark:text-yellow-400"
    },
    resolved: {
      icon: <CheckCircle size={24} className="text-green-500 dark:text-green-400" />,
      bg: "bg-green-50 dark:bg-green-900/20",
      trend: "+8% completion rate",
      trendColor: "text-green-600 dark:text-green-400"
    },
    critical: {
      icon: <AlertTriangle size={24} className="text-red-500 dark:text-red-400" />,
      bg: "bg-red-50 dark:bg-red-900/20",
      trend: "Requires attention",
      trendColor: "text-red-600 dark:text-red-400"
    },
    rating: {
      icon: <Star size={24} className="text-purple-500 dark:text-purple-400" />,
      bg: "bg-purple-50 dark:bg-purple-900/20",
      trend: "Stable",
      trendColor: "text-purple-600 dark:text-purple-400"
    },
  }

  const theme = config[color] || config.total

  return (
    <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl p-6 shadow-md flex justify-between items-center dark:shadow-none border border-gray-300 dark:border-dark-border hover:shadow-lg transition-all duration-300 group">
      
      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-dark-text-muted mb-1">{label}</h3>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary tracking-tight">{value}</h2>
      </div>
      <div className="flex justify-between items-start mb-4">
       
          {theme.icon}

      </div>
    </div>
  )
}