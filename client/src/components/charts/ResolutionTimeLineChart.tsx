import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const data = [
  { month: "Sep", bugs: 5.2, features: 12.8, improvements: 7.3, complaints: 3.1 },
  { month: "Oct", bugs: 4.8, features: 11.5, improvements: 6.9, complaints: 2.8 },
  { month: "Nov", bugs: 4.3, features: 10.2, improvements: 6.1, complaints: 2.5 },
  { month: "Dec", bugs: 3.9, features: 9.8, improvements: 5.7, complaints: 2.2 },
  { month: "Jan", bugs: 4.2, features: 11.1, improvements: 6.3, complaints: 2.6 },
];

export const ResolutionTimeLineChart = () => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="month" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            label={{ value: 'Days', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--dashboard-card))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px'
            }}
            formatter={(value) => [`${value} days`, '']}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="bugs"
            stroke="hsl(var(--chart-5))"
            strokeWidth={3}
            dot={{ fill: 'hsl(var(--chart-5))', r: 4 }}
            name="Bug Reports"
          />
          <Line
            type="monotone"
            dataKey="features"
            stroke="hsl(var(--chart-3))"
            strokeWidth={3}
            dot={{ fill: 'hsl(var(--chart-3))', r: 4 }}
            name="Feature Requests"
          />
          <Line
            type="monotone"
            dataKey="improvements"
            stroke="hsl(var(--chart-2))"
            strokeWidth={3}
            dot={{ fill: 'hsl(var(--chart-2))', r: 4 }}
            name="Improvements"
          />
          <Line
            type="monotone"
            dataKey="complaints"
            stroke="hsl(var(--chart-4))"
            strokeWidth={3}
            dot={{ fill: 'hsl(var(--chart-4))', r: 4 }}
            name="Complaints"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};