export const MetricCard = ({ label, value, color }) => {
  const colorMap = {
    total: "#4078f0",
    active: "#F59E0B",
    resolved: "#388643",
    critical: "#c90808",
    rating: "#A855F7",
  }

  const bgColor = colorMap[color] || color

  return (
    <div className="bg-white rounded-lg">
    <div
      className="rounded-lg p-3 hover:shadow-sm transition-shadow border border-gray-200 bg-white"
      style={{
        backgroundColor: `${bgColor}20`,
      }}
      >
      <p className="text-sm font-bold" style={{ color: bgColor }}>
        {label}
      </p>
      <p className="text-4xl font-extrabold mt-3" style={{ color: bgColor }}>
        {value}
      </p>
    </div>
      </div>
  )
}