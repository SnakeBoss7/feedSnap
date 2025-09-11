import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const data = [
  { name: "Very Satisfied", value: 1247, color: "hsl(var(--chart-3))" },
  { name: "Satisfied", value: 892, color: "hsl(var(--chart-2))" },
  { name: "Neutral", value: 456, color: "hsl(var(--chart-6))" },
  { name: "Dissatisfied", value: 178, color: "hsl(var(--chart-4))" },
  { name: "Very Dissatisfied", value: 74, color: "hsl(var(--chart-5))" },
];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx, cy, midAngle, innerRadius, outerRadius, percent, index
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export const SatisfactionDonutChart = () => {
  const totalResponses = data.reduce((sum, item) => sum + item.value, 0);
  const averageScore = data.reduce((sum, item, index) => {
    const score = 5 - index; // Very Satisfied = 5, Very Dissatisfied = 1
    return sum + (item.value * score);
  }, 0) / totalResponses;

  return (
    <div className="h-[400px] w-full">
      <div className="flex items-center justify-center mb-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-foreground">
            {averageScore.toFixed(1)}/5.0
          </div>
          <div className="text-sm text-muted-foreground">
            Average Satisfaction Score
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {totalResponses.toLocaleString()} total responses
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="300">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={100}
            innerRadius={40}
            fill="#8884d8"
            dataKey="value"
            paddingAngle={2}
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
            formatter={(value) => [`${value} responses`, '']}
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