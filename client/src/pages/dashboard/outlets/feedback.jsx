import { useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell,
  ResponsiveContainer,
} from "recharts";

// import { CopilotChat, CopilotSidebar } from "@copilotkit/react-ui";
// import { useCopilotAction } from "@copilotkit/react-core";

export const Feedback = () => {
  const [chartData, setChartData] = useState([
    { label: "Website A", value: 120 },
    { label: "Website B", value: 80 },
    { label: "Website C", value: 150 },
  ]);

  const [ratingsOverTime, setRatingsOverTime] = useState([
    { date: "2024-01", rating: 3 },
    { date: "2024-02", rating: 4 },
    { date: "2024-03", rating: 4.5 },
    { date: "2024-04", rating: 4.8 },
  ]);

  const [feedbackTypeData, setFeedbackTypeData] = useState([
    { type: "Bug", value: 12 },
    { type: "UI", value: 8 },
    { type: "Performance", value: 5 },
    { type: "Feature Request", value: 15 },
  ]);

  // ✅ Use the hook instead of JSX component
  // useCopilotAction({
  //   name: "clear-charts",
  //   description: "Clear all chart data from feedback dashboard including bar chart, pie chart, and line chart data",
  //   handler: async () => {
  //     console.log("Clearing charts data...");
  //     setChartData([]);
  //     setRatingsOverTime([]);
  //     setFeedbackTypeData([]);
  //     return "Charts cleared successfully!";
  //   },
  // });

  // Additional action for removing specific website
  // useCopilotAction({
  //   name: "remove-website",
  //   description: "Remove a specific website from the bar chart data",
  //   parameters: [
  //     {
  //       name: "websiteName",
  //       type: "string",
  //       description: "Name of the website to remove (e.g., 'Website A', 'Website B', 'Website C')",
  //       required: true,
  //     },
  //   ],
  //   handler: async ({ websiteName }) => {
  //     console.log(`Removing ${websiteName}...`);
  //     setChartData(prev => prev.filter(item => 
  //       item.label.toLowerCase() !== websiteName.toLowerCase()
  //     ));
  //     return `${websiteName} removed successfully!`;
  //   },
  // });

  const COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444"];

  return (
    <div className="p-4 pb-20 relative h-full bg-[#F9FAFB]">
      {/* <div className="p-6">
        <h1 className="text-4xl font-bold">Script Generator</h1>
        <p className="text-lg text-gray-600">
          Generate and customize your feedback widget script
        </p>
      </div> */}

      📊 Bar Chart
      {/* {chartData.length > 0 && (
        <div className="bg-white shadow rounded-xl p-6 mt-6 max-w-3xl mx-auto">
          <h3 className="text-xl font-semibold mb-4">Feedback Count per Website</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#2563EB" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )} */}

      {/* 🥧 Pie Chart */}
      {/* {feedbackTypeData.length > 0 && (
        <div className="bg-white shadow rounded-xl p-6 mt-6 max-w-3xl mx-auto">
          <h3 className="text-xl font-semibold mb-4">Feedback by Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={feedbackTypeData}
                dataKey="value"
                nameKey="type"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {feedbackTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )} */}

      {/* 📉 Line Chart */}
      {/* {ratingsOverTime.length > 0 && (
        <div className="bg-white shadow rounded-xl p-6 mt-6 max-w-3xl mx-auto">
          <h3 className="text-xl font-semibold mb-4">Average Rating Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ratingsOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="rating" stroke="#10B981" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )} */}

      {/* 💬 Chat */}
      {/* <div className="max-w-3xl mx-auto shadow-lg border rounded-xl overflow-hidden mt-6">
        <CopilotSidebar defaultOpen={true}>
          <CopilotChat
            instructions="You are FeedSnap AI. Help analyze and manage dashboard charts. Available actions: 
            - Use 'clear-charts' to clear all chart data
            - Use 'remove-website' to remove a specific website from the bar chart
            When user asks to remove a website or clear data, execute the appropriate action."
            labels={{
              user: "You",
              assistant: "FeedSnap AI",
            }}
          />
        </CopilotSidebar> */}
      </div>
    // </div>
  );
};