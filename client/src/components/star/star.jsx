import { Star } from "lucide-react"

export const RatingStar = ({value}) => {
  return(
    <div className="flex">
      {
          [1,2,3,4,5].map(star=>(
            <Star
          key={star}
          fill={star <= value ? "#EAB307" : "none"} // yellow-400
          stroke="#EAB307"
          className="w-4 h-4"
            />
          ))
     
      }
    </div>
  )
};
