import React from 'react';
import { Tooltip } from 'recharts';

const DayBreakdown = ({ data }) => {
  // data expected: [{ day: 'S', value: 10, label: 'Sunday' }, ...]
  // Max value for scaling
  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="w-full h-full flex flex-col justify-between">
      <div className="flex justify-between items-end h-full gap-2 md:gap-6 ">
        {data.map((item, index) => {
          const height = (item.value / maxValue) * 100;
          const isZero = item.value === 0;

          // If value is 0, we want it to look like a placeholder (full height or close to it)
          // The design shows placeholders as full height dashed bars.
          const displayHeight = isZero ? 100 : Math.max(height, 15);

          // Color logic based on value intensity
          let bgColorClass = '';
          if (isZero) {
            // CSS-based striped pattern for better visibility - wider spacing to match image
            bgColorClass = "bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#9ca3af_10px,#9ca3af_12px)] opacity-100";
          } else if (height > 75) {
            bgColorClass = 'bg-[#7E2AC9]'; // primary1
          } else if (height > 40) {
            bgColorClass = 'bg-[#7E2AC9]/70'; // primary1 with 70% opacity
          } else {
            bgColorClass = 'bg-[#7E2AC9]/30'; // primary1 with 30% opacity
          }

          return (
            <div key={index} className="flex flex-col items-center gap-2 flex-1 group relative h-full justify-end">
               {/* Tooltip */}
               <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-gray-200 px-2 py-1 rounded shadow-sm text-xs font-bold z-10 whitespace-nowrap">
                {item.value} Feedback
              </div>

              <div 
                className={`w-full rounded-full transition-all duration-500 ease-out ${bgColorClass}`}
                style={{ 
                  height: `${displayHeight}%`, 
                  minHeight: '20px'
                }}
              ></div>
              <span className="text-xs text-gray-400 font-medium">{item.day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DayBreakdown;
