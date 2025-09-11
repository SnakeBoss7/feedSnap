import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { issue: "Login Issues", count: 89, type: "Bug" },
  { issue: "Dark Mode", count: 156, type: "Feature" },
  { issue: "Slow Loading", count: 67, type: "Performance" },
  { issue: "Mobile UI", count: 134, type: "Improvement" },
  { issue: "Mobile UI", count: 134, type: "Improvement" },
  { issue: "Export Feature", count: 98, type: "Feature" },
];

export const TopIssuesBarChart = () => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          layout="horizontal"
          margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            type="number" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis 
            type="category" 
            dataKey="issue" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={11}
            width={75}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--dashboard-card))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px'
            }}
            formatter={(value, name, props) => [
              value, 
              `${props.payload.type}: ${props.payload.issue}`
            ]}
          />
          <Bar 
            dataKey="count" 
            fill="hsl(var(--chart-1))"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};