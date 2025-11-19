import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const ProjectProgress = ({ resolved, total }) => {
  const percentage = total > 0 ? Math.round((resolved / total) * 100) : 0;
  
  // Data for the semi-circle
  // We want a semi-circle, so we can use startAngle 180, endAngle 0
  const data = [
    { name: 'Completed', value: resolved },
    { name: 'Pending', value: total - resolved }
  ];

  const COLORS = ['#065f46', '#e5e7eb']; // Dark Green, Gray

  return (
    <div className="relative w-full h-[200px] flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="70%" // Move down to show semi-circle better
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={0}
            dataKey="value"
            stroke="none"
            cornerRadius={10}
          >
            <Cell key="cell-0" fill="#7E2AC9" /> {/* Completed Color (primary1) */}
            <Cell key="cell-1" fill="url(#stripedPattern)" /> {/* Pending Pattern */}
          </Pie>
          <defs>
            <pattern id="stripedPattern" patternUnits="userSpaceOnUse" width="12" height="12" patternTransform="rotate(45)">
              <rect width="12" height="12" fill="white" />
              <line x1="0" y1="0" x2="0" y2="12" stroke="#9ca3af" strokeWidth="2" />
            </pattern>
          </defs>
        </PieChart>
      </ResponsiveContainer>
      
      <div className="absolute top-[60%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
        <h2 className="text-4xl font-bold text-gray-900">{percentage}%</h2>
        <p className="text-xs text-gray-500 font-medium">Project Ended</p>
      </div>

      {/* Legend */}
      <div className="absolute bottom-0 w-full flex justify-between px-4 text-xs text-gray-500">
         <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-[#7E2AC9]"></div>
            <span>Completed</span>
         </div>
         <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-[url(#stripedPattern)] bg-[length:12px_12px]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, white, white 4px, #e5e7eb 4px, #e5e7eb 5px)' }}></div> 
            {/* Note: Using CSS gradient for legend to mimic SVG pattern simply */}
            <span>Pending</span>
         </div>
      </div>
    </div>
  );
};

export default ProjectProgress;
