import React from 'react';

const DayBreakdown = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="w-full h-full flex flex-col justify-between px-1 md:px-2 pb-2 mt-2 md:mt-4">
      <div className="flex justify-between items-end h-full gap-2 md:gap-6 pt-6 md:pt-10">
        {data.map((item, index) => {
          const height = (item.value / maxValue) * 100;
          const isZero = item.value === 0;

          const displayHeight = isZero ? 100 : Math.max(height, 12);

          let bgColorClass = '';
          if (isZero) {
            bgColorClass = "bg-[repeating-linear-gradient(45deg,transparent,transparent_6px,rgba(120,120,140,0.35)_6px,rgba(120,120,140,0.35)_8px)] dark:bg-[repeating-linear-gradient(45deg,transparent,transparent_6px,rgba(148,163,184,0.35)_6px,rgba(148,163,184,0.35)_8px)] border-2 border-gray-300/40 dark:border-slate-500/40";
          } else if (height > 75) {
            bgColorClass = 'bg-gradient-to-t from-[#6020A0] to-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.5)]'; 
          } else if (height > 40) {
            bgColorClass = 'bg-gradient-to-t from-[#6020A0]/80 to-[#8B5CF6]/80'; 
          } else {
            bgColorClass = 'bg-gradient-to-t from-[#6020A0]/40 to-[#8B5CF6]/50'; 
          }

          return (
            <div key={index} className="flex flex-col items-center gap-2 md:gap-3 flex-1 group relative h-full justify-end cursor-pointer">
              {/* Enhanced Tooltip */}
              <div className="absolute -top-14 opacity-0 group-hover:opacity-100 group-hover:-translate-y-2 transition-all duration-300 pointer-events-none bg-white/95 dark:bg-dark-bg-tertiary/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-xl border border-gray-100 dark:border-dark-border z-20 whitespace-nowrap flex flex-col items-center">
                <span className="text-xs font-extrabold text-gray-900 dark:text-white">{item.value}</span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Feedback</span>
                {/* Tooltip Arrow */}
                <div className="absolute -bottom-1 w-2 h-2 bg-white/95 dark:bg-dark-bg-tertiary/95 border-b border-r border-gray-100 dark:border-dark-border transform rotate-45"></div>
              </div>

              {/* Bar element */}
              <div
                className={`w-full rounded-t-full rounded-b-full transition-all duration-300 ease-in-out group-hover:brightness-110 origin-bottom ${bgColorClass}`}
                style={{
                  height: `${displayHeight}%`,
                  minHeight: '40px'
                }}
              ></div>
              <span className="text-xs md:text-sm text-gray-700 font-bold dark:text-gray-300 transition-colors group-hover:text-purple-600 dark:group-hover:text-purple-400">{item.day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DayBreakdown;
