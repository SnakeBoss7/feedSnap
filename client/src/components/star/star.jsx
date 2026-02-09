import { Star } from "lucide-react"

export const RatingStar = ({ value }) => {
  return (
    <div className="flex items-center gap-0.5">
      {
        [1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            fill={star <= value ? "#facc15" : "currentColor"}
            stroke={star <= value ? "#facc15" : "currentColor"}
            className={`w-4 h-4 ${star <= value ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
          />
        ))
      }
    </div>
  )
};
