import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from "recharts";

const data = [
  { category: "Detail Level", current: 4.2, target: 4.5 },
  { category: "Clarity", current: 3.8, target: 4.0 },
  { category: "Actionability", current: 2.1, target: 4.3 },
  { category: "Reproducibility", current: 3.5, target: 4.0 },
  { category: "Priority Accuracy", current: 0, target: 4.2 },
  { category: "User Impact", current: 3.9, target: 4.1 },
];

export const QualityRadarChart = () => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis 
            dataKey="category" 
            tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 5]} 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
          />
          <Radar
            name="Current Score"
            dataKey="current"
            stroke="hsl(var(--chart-1))"
            fill="hsl(var(--chart-1))"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Radar
            name="Target Score"
            dataKey="target"
            stroke="hsl(var(--chart-3))"
            fill="hsl(var(--chart-3))"
            fillOpacity={0.1}
            strokeWidth={2}
            strokeDasharray="5 5"
          />
          <Legend 
            wrapperStyle={{ 
              fontSize: '12px',
              color: 'hsl(var(--foreground))'
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};