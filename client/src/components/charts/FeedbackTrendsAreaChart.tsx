import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type FeedbackData = {
  totalFeedback: number;
  currentMonth: { count: number; name: string };
  lastMonth: { count: number; name: string };
  categories: Record<string, number>;
  monthlyBreakdown: Record<string, Record<string, number>>;
  dailyBreakdown: Record<string, Record<string, number>>;
};

type FeedbackTrendsAreaChartProps = {
  data: FeedbackData;
};

export const FeedbackTrendsAreaChart = ({ data }: FeedbackTrendsAreaChartProps) => {
  const dailyData = useMemo(() => {
    if (!data?.dailyBreakdown) return [];

    return Object.entries(data.dailyBreakdown)
      .map(([day, breakdown]) => {
        const total = Object.values(breakdown).reduce(
          (sum, count) => sum + count,
          0
        );

        return {
          date: `Day ${day}`,
          ...breakdown,
          total,
        };
      })
      .filter((item) => item.total > 0); // only show days with feedback
  }, [data]);

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={dailyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--dashboard-card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px",
            }}
          />
          <Legend />

          <Area
            type="monotone"
            dataKey="feature"
            stackId="1"
            stroke="hsl(var(--chart-3))"
            fill="hsl(var(--chart-3))"
            fillOpacity={0.8}
            name="Feature Requests"
          />
          <Area
            type="monotone"
            dataKey="improvement"
            stackId="1"
            stroke="hsl(var(--chart-2))"
            fill="hsl(var(--chart-2))"
            fillOpacity={0.8}
            name="Improvements"
          />
          <Area
            type="monotone"
            dataKey="bug"
            stackId="1"
            stroke="hsl(var(--chart-5))"
            fill="hsl(var(--chart-5))"
            fillOpacity={0.8}
            name="Bug Reports"
          />
          <Area
            type="monotone"
            dataKey="complaint"
            stackId="1"
            stroke="hsl(var(--chart-4))"
            fill="hsl(var(--chart-4))"
            fillOpacity={0.8}
            name="Complaints"
          />
          <Area
            type="monotone"
            dataKey="general"
            stackId="1"
            stroke="hsl(var(--chart-1))"
            fill="hsl(var(--chart-1))"
            fillOpacity={0.8}
            name="General Feedback"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
