import { AlertTriangle, Star, ChevronDown } from "lucide-react";
import { memo, useEffect, useReducer, useState, useMemo } from "react";
import { MessageSquare, Bug, Lightbulb, TrendingUp } from "lucide-react";
import Select from 'react-select';
import AnalyticsLoader, { BackgroundGrid } from "../../../components/loader/Analyticsloader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { FeedbackTrendsAreaChart} from "../../../components/charts/FeedbackTrendsAreaChart"
import axios from "axios";

const apiUrl = process.env.REACT_APP_API_URL;

// Cache helper function
const getCachedData = () => {
  const type = localStorage.getItem('type');
  const cachedData = localStorage.getItem('AnalyticsData');
  
  if(type === 'FETCH_SUCCESS' && cachedData) {
    try {
      const parsed = JSON.parse(cachedData);
      const isRecent = Date.now() - parsed.timestamp < 5 * 60 * 1000; // 5 minutes
      
      if(isRecent && parsed.data) {
        return {
          ...parsed.data,
          isLoading: false
        };
      }
    } catch(e) {
      console.log('Cache parse error:', e);
    }
  }
  return {
    sites: [],
    data: {},
    success: false,
    isLoading: true,
  };
};

const dashboardReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_SUCCESS':
      return {
        ...state,
        ...action.payload,
        isLoading: false
      };
    case 'FETCH_FAIL':
      return {
        ...state,
        isLoading: false,
      };
    default:
      return state;
  }
};

const wait = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Website Selector Component with React Select
const WebsiteSelector = memo(({ sites, selectedSite, onSiteChange }) => {
  const formatSiteName = (url) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  const options = sites.map(site => ({
    value: site,
    label: formatSiteName(site)
  }));

  const selectedOption = selectedSite ? {
    value: selectedSite,
    label: formatSiteName(selectedSite)
  } : null;

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: '40px',
      maxWidth: '300px',
      boxShadow: state.isFocused ? '0 0 0 2px #111828' : provided.boxShadow,
      '&:hover': {
        borderColor: '#111828'
      },
      outline:0,
    
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#111828'
    }),
    clearIndicator: () => ({
      display: 'none'
    }),
    menu: (provided) => ({
      ...provided,
      marginTop: '5px',
      marginBottom: 0,
      borderRadius: '5px',
      
    }),
    menuList: (provided) => ({
      ...provided,
      padding: 0,
      borderRadius: '5px',
    }),
      option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#111828' : state.isFocused ? '#f3f4f6' : 'white',
      color: state.isSelected ? 'white' : '#374151',
      '&:hover': {
        backgroundColor: state.isSelected ? '#111828' : '#f3f4f6'
      }
    })
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-bold text-gray-700 w-[300px] mb-2">
        Select Website
      </label>
      <Select
        options={options}
        value={selectedOption}
        onChange={(option) => onSiteChange(option?.value)}
        placeholder="Select a website"
        isSearchable
        isClearable
        styles={customStyles}
        className="react-select-container"
        classNamePrefix="react-select"
      />
    </div>
  );
});

// Stat Card Component
const StatCard = memo(({ title, value, change, trend, icon: Icon }) => {
  const badgeClass = trend === "up"
    ? "text-xs mt-1 w-fit bg-green-100 text-green-800 border-green-200"
    : "text-xs mt-1 w-fit bg-red-100 text-red-800 border-red-200";

  return (
    // <Card className="bg-white border border-gray-200 shadow-sm h-32 flex flex-col">
    //   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 flex-shrink-0">
    //     <CardTitle className="text-sm font-medium text-gray-600 leading-tight">
    //       {title}
    //     </CardTitle>
    //     <div className="w-4 h-4 flex items-center justify-center">
    //       <Icon className="h-4 w-4 flex-shrink-0 text-blue-500" />
    //     </div>
    //   </CardHeader>
    //   <CardContent className="flex-grow flex flex-col justify-between">
    //     <div className="text-2xl font-bold text-gray-900 leading-none">
    //       {value}
    //     </div>
    //     <div>

    //     </div>
    //   </CardContent>
    // </Card>
    <div className="bg-white border rounded-lg p-3 justify-between border-gray-200 shadow-sm h-32 flex ">
      <div className="flex flex-col justify-between">
        <h2>{title}</h2>
        <div className="text-2xl font-bold text-gray-900 leading-none">
           {value}
    </div>
                     <Badge variant="outline" className={badgeClass}>
            {change}
          </Badge>
      </div>
      <div>
          <Icon className="h-4 w-4 flex-shrink-0 text-blue-500" />
      </div>
    </div>
  );
});

// Pie Chart Component
const FeedbackPieChart = memo(({ data }) => {
  const COLORS = {
    bug: '#ef4444',
    complaint: '#f97316', 
    feature: '#22c55e',
    general: '#3b82f6',
    improvement: '#8b5cf6',
    other: '#6b7280'
  };

  const pieData = Object.entries(data.categories || {})
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      fill: COLORS[name]
    }));

  if (pieData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No feedback data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
        >
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
});

// Daily Breakdown Chart Component
const DailyBreakdownChart = memo(({ data }) => {
  const dailyData = useMemo(() => {
    console.log(data)
    if (!data.dailyBreakdown) return [];

    return Object.entries(data.dailyBreakdown).map(([day, breakdown]) => {
      const total = Object.values(breakdown).reduce((sum, count) => sum + count, 0);
      return {
        day: `Day ${day}`,
        ...breakdown,
        total
      };
    }).filter(item => item.total > 0); // Only show days with feedback
  }, [data.dailyBreakdown]);

  if (dailyData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No daily feedback data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={dailyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="bug" stackId="a" fill="#ef4444" name="Bug Reports" />
        <Bar dataKey="complaint" stackId="a" fill="#f97316" name="Complaints" />
        <Bar dataKey="feature" stackId="a" fill="#22c55e" name="Feature Requests" />
        <Bar dataKey="general" stackId="a" fill="#3b82f6" name="General" />
        <Bar dataKey="improvement" stackId="a" fill="#8b5cf6" name="Improvements" />
        <Bar dataKey="other" stackId="a" fill="#6b7280" name="Other" />
      </BarChart>
    </ResponsiveContainer>
  );
});

// Stats Grid Component
const StatsGrid = memo(({ siteData }) => {
  if (!siteData) return null;

  const calculateChange = (current, last) => {
    if (last === 0) return current > 0 ? "+100%" : "0%";
    const change = ((current - last) / last * 100).toFixed(1);
    return `${change >= 0 ? '+' : ''}${change}%`;
  };

  const stats = [
    {
      title: "Total Feedback",
      value: siteData.totalFeedback?.toString() || "0",
      change: calculateChange(siteData.currentMonth?.count || 0, siteData.lastMonth?.count || 0),
      trend: (siteData.currentMonth?.count || 0) >= (siteData.lastMonth?.count || 0) ? "up" : "down",
      icon: MessageSquare,
    },
    {
      title: "Bug Reports",
      value: siteData.categories?.bug?.toString() || "0",
      change: calculateChange(
        siteData.monthlyBreakdown?.[siteData.currentMonth?.name]?.bug || 0,
        siteData.monthlyBreakdown?.[siteData.lastMonth?.name]?.bug || 0
      ),
      trend: (siteData.monthlyBreakdown?.[siteData.currentMonth?.name]?.bug || 0) >= (siteData.monthlyBreakdown?.[siteData.lastMonth?.name]?.bug || 0) ? "down" : "up",
      icon: Bug,
    },
    {
      title: "Feature Requests",
      value: siteData.categories?.feature?.toString() || "0",
      change: calculateChange(
        siteData.monthlyBreakdown?.[siteData.currentMonth?.name]?.feature || 0,
        siteData.monthlyBreakdown?.[siteData.lastMonth?.name]?.feature || 0
      ),
      trend: (siteData.monthlyBreakdown?.[siteData.currentMonth?.name]?.feature || 0) >= (siteData.monthlyBreakdown?.[siteData.lastMonth?.name]?.feature || 0) ? "up" : "down",
      icon: Lightbulb,
    },
    {
      title: "Avg Resolution Time",
      value: "N/A",
      change: "N/A",
      trend: "up",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
});

// Background Component
export const Background = memo(() => (
  <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_1050px_at_50%_200px,#c5b5ff,transparent)] pointer-events-none">
    <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#e8e8e8_1px,transparent_2px),linear-gradient(to_bottom,#e8e8e8_0.5px,transparent_2px)] bg-[size:4.5rem_3.5rem]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_700px_at_0%_250px,#111828,transparent)] lg:bg-none"></div>
      <div className="absolute inset-0 bg-none lg:bg-[radial-gradient(circle_1800px_at_0%_500px,#111828,transparent)]"></div>
    </div>
  </div>
));

// Main Analytics Component
export const Analytics = memo(() => {
  const [state, dispatch] = useReducer(dashboardReducer, getCachedData());
  const [selectedSite, setSelectedSite] = useState(null);

  // Set first site as selected when data loads
  useEffect(() => {
    if (state.sites?.length > 0 && !selectedSite) {
      setSelectedSite(state.sites[0]);
    }
  }, [state.sites, selectedSite]);

  useEffect(() => {
    async function fetchData() {
      try {
        console.log('Fetching fresh analytics data...');
        const res = await axios.get(`${apiUrl}/api/feedback/getAnalytics`, {
          withCredentials: true
        });
        await wait(2000);
        console.log(res);
        dispatch({
          type: 'FETCH_SUCCESS',
          payload: res.data,
        });
        
        // Store with timestamp
        const cacheData = {
          data: res.data,
          timestamp: Date.now()
        };

        localStorage.setItem("AnalyticsData", JSON.stringify(cacheData));
        localStorage.setItem("type", 'FETCH_SUCCESS');
      }
      catch(err) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: err.response?.data,
        });
        console.log(err);
        localStorage.setItem("type", 'FETCH_FAIL');
      }
    }

    // Fetch fresh data if cache is missing, old, or invalid
    if(state.isLoading) {
      fetchData();
    }
  }, [state.isLoading]);

  const selectedSiteData = useMemo(() => {
    return selectedSite && state.data ? state.data[selectedSite] : null;
  }, [selectedSite, state.data]);

  const consoleShow = () => {
    const type = localStorage.getItem('type');
    const cachedData = localStorage.getItem('AnalyticsData');
    console.log(JSON.parse(cachedData));
  };

  if (state.isLoading) {
    return (
     <AnalyticsLoader
        isVisible={true} 
        message="Loading your content..." 
      />
    );
  }

  return (
    <div className="h-full w-full overflow-y-scroll scrollbar-hide  font-sans">
      <Background />
    
      <div className="relative h-full  md:px-10 px-5 py-8">
        {/* Header */}
        <div className="mb-8 flex md:flex-row  flex-col justify-between">
         <div>
           <h1 className="text-4xl font-bold bg-gradient-to-r tracking-tight from-backgr/70 via-backgr/40 to-white/50 bg-clip-text text-transparent mb-2">
            Feedback Analytics Dashboard
          </h1>
          <p className="text-white text-lg  mb-6">
            Comprehensive insights into your product feedback and user sentiment
          </p>
         </div>
          
          {/* Website Selector */}
          <WebsiteSelector
            sites={state.sites || []}
            selectedSite={selectedSite}
            onSiteChange={setSelectedSite}
          />
        </div>

        {selectedSiteData ? (
          <>
            {/* Stats Overview */}
            {/* <div className="mb-8">
              <StatsGrid siteData={selectedSiteData} />
            </div> */}
              <div className="mb-5">

              <StatsGrid siteData={selectedSiteData} />
              </div>
            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Pie Chart */}
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-500" />
                    Feedback Type Distribution
                  </CardTitle>
                  <CardDescription>
                    Breakdown of feedback categories for {selectedSite}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div style={{ width: "100%", height: "300px" }}>
                    <FeedbackPieChart data={selectedSiteData} />
                  </div>
                </CardContent>
              </Card>

              {/* Daily Breakdown Chart */}
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    Daily Feedback Breakdown
                  </CardTitle>
                  <CardDescription>
                    Daily feedback distribution for {selectedSiteData.currentMonth?.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div style={{ width: "100%", height: "300px" }}>
                    <DailyBreakdownChart data={selectedSiteData} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">
              {state.sites?.length === 0 ? 'No websites found' : 'Select a website to view analytics'}
            </div>
          </div>
        )}
        {/* <FeedbackTrendsAreaChart
          data={selectedSiteData}
          onClick={() => console.log(selectedSiteData)}
        /> */}
        <button 
          onClick={consoleShow}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Show Cached Data
        </button>
      </div>
    </div>
  );
});