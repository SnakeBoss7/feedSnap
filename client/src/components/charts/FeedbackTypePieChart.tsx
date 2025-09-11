import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const data = [
  { name: "Bug Reports", value: 324, color: "hsl(var(--chart-5))" },
  { name: "Feature Requests", value: 1156, color: "hsl(var(--chart-3))" },
  { name: "Improvements", value: 892, color: "hsl(var(--chart-2))" },
  { name: "Complaints", value: 267, color: "hsl(var(--chart-4))" },
  { name: "General Feedback", value: 208, color: "hsl(var(--chart-1))" },
];

export const FeedbackTypePieChart = () => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={120}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--dashboard-card))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px'
            }}
          />
          <Legend 
            wrapperStyle={{ 
              fontSize: '12px',
              color: 'hsl(var(--foreground))'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};