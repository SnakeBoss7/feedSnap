import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Star,
  Globe,
  Plus,
  ArrowUpRight,
  Zap,
} from "lucide-react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import DayBreakdown from "../../../components/Visual/DayBreakdown";
import ProjectProgress from "../../../components/Visual/ProjectProgress";
import { SimpleHeader } from "../../../components/header/header";

const apiUrl = process.env.REACT_APP_API_URL;

export const DashboardHome = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/feedback/dashboard-data`, {
          withCredentials: true,
        });
        setData(res.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen overflow-scroll  scrollbar-hide bg-gradient-to-br from-purple-400 to-gray-100 dark:from-dark-bg-primary dark:to-dark-bg-primary font-sans text-gray-900 dark:text-dark-text-primary">
        <SimpleHeader color={'#c5b5ff'} />
        <div className="">
          <SkeletonTheme
            baseColor="var(--skeleton-base)"
            highlightColor="var(--skeleton-highlight)"
          >
            <div className="p-6 md:p-10">
              {/* Header Skeleton */}
              <div className="flex flex-col md:flex-row mt-5 md:mt-0 justify-between items-start md:items-center mb-5 md:mb-12">
                <div>
                  <Skeleton height={48} width={250} className="mb-1" />
                  <Skeleton height={24} width={300} />
                </div>
                <div className="flex gap-4 mt-10 md:mt-0">
                  <Skeleton height={44} width={140} borderRadius={9999} />
                  <Skeleton height={44} width={140} borderRadius={9999} />
                </div>
              </div>

              {/* Stats Grid Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Skeleton height={150} borderRadius={16} />
                <Skeleton height={150} borderRadius={16} />
                <Skeleton height={150} borderRadius={16} />
                <Skeleton height={150} borderRadius={16} />
              </div>

              {/* Main Content Grid Skeleton */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Skeleton height={400} borderRadius={16} />
                </div>
                <div>
                  <Skeleton height={400} borderRadius={16} />
                </div>
              </div>

              {/* Bottom Section Skeleton */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                <div>
                  <Skeleton height={300} borderRadius={16} />
                </div>
                <div className="lg:col-span-2">
                  <Skeleton height={300} borderRadius={16} />
                </div>
              </div>
            </div>
          </SkeletonTheme>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col  items-center  h-screen bg-gray-50 dark:bg-dark-bg-primary">
        <SimpleHeader color={'#b563f9ff'} />
        <div className="text-center h-full flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-text-primary mb-2">Oops!</h2>
          <p className="text-gray-600 dark:text-dark-text-muted">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { stats, analytics, teamMembers, widgets } = data;

  // Transform analytics for DayBreakdown
  // Assuming analytics is [{ date: 'Mon', count: 5 }, ...]
  const dayBreakdownData = analytics.map(a => ({
    day: a.date ? a.date.charAt(0) : '', // 'M' from 'Mon'
    value: a.count,
    label: a.date
  }));



  const resolvedCount = stats.resolvedCount || 0;
  const totalCount = stats.totalFeedbacks || 0;

  return (
    <div className="min-h-screen overflow-scroll  scrollbar-hide bg-gradient-to-br from-purple-400 to-gray-100 dark:from-dark-bg-primary dark:to-dark-bg-primary font-sans text-gray-900 dark:text-dark-text-primary transition-colors duration-300">
      {/* Header */}
      {/* <Background color={"#c5b5ff"} /> */}
      <SimpleHeader color={'#c5b5ff'} />
      <div className="p-6 md:p-10">
        <div className="flex flex-col md:flex-row mt-5 md:mt-0 justify-between items-start md:items-center mb-5 md:mb-12">
          <div>
            <h1 className="text-5xl font-extrabold tracking-tight text-white dark:text-dark-text-primary mb-1 drop-shadow-sm">
              Dashboard
            </h1>
            <p className="text-purple-900 dark:text-dark-purple-light font-medium">
              Overview of your feedback performance
            </p>
          </div>
          <div className="flex gap-4 mt-10 md:mt-0">
            <Link
              to="scriptGen"
              className="flex group text-primary1 dark:text-primary1 transition-all ease-in-out duration-300 items-center gap-2 px-5 py-2.5 bg-white dark:bg-dark-bg-secondary rounded-full text-sm font-semibold text-gray-700 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary transition-all shadow-sm"
            >
              <Plus size={18} className=" group-hover:rotate-90 transition-all ease-in-out duration-300" />
              Add Widget
            </Link>
            <button className="px-5 py-2.5 text-white rounded-full text-sm font-semibold transition-all bg-gradient-to-br from-primary1 to-purple-600 hover:shadow-lg hover:shadow-purple-500/30 flex items-center gap-2">
              <ArrowUpRight size={18} />
              Export Data
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Feedback"
            value={stats.totalFeedbacks}
            icon={<div className="p-2 bg-white/20 rounded-full top-4 right-7 group-hover:right-5 absolute backdrop-blur-sm group-hover:scale-[1.04] ease-in-out transition-all duration-300"> <ArrowUpRight size={24} className="group-hover:rotate-45 ease-in-out transition-all duration-300 text-white" /></div>}
            trend="+12% from last month"
            text_col="text-white/90"
            to="feedbacks"
            // group-hover:scale-[1.06] ease-in-out transition-all duration-300
            color="bg-gradient-to-br from-primary1 to-purple-600 dark:from-purple-900 dark:to-purple-800"
          />
          <StatCard
            title="Average Rating"
            value={stats.avgRating}
            icon={<div className="p-3 bg-gray-50 dark:bg-dark-bg-tertiary rounded-full backdrop-blur-sm"> <Star size={24} className="text-yellow-500" /></div>}
            trend="Stable"
            color="bg-white dark:bg-dark-bg-secondary"
            to="/dashboard"
            text_col="text-gray-900 dark:text-dark-text-primary"
            isRating
          />
          <StatCard
            title="Active Widgets"
            value={stats.totalWidgets}
            icon={<div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-full backdrop-blur-sm"><Globe size={24} className="text-blue-500 dark:text-blue-400" /></div>}
            trend="Across all sites"
            to="/dashboard"
            color="bg-white dark:bg-dark-bg-secondary"
            text_col="text-gray-900 dark:text-dark-text-primary"
          />
          <StatCard
            title="New Today"
            value={stats.newFeedbackToday}
            icon={<div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-full backdrop-blur-sm"> <Zap size={24} className="text-green-500 dark:text-green-400" /></div>}
            trend="Daily activity"
            to="/dashboard"
            color="bg-white dark:bg-dark-bg-secondary"
            text_col="text-gray-900 dark:text-dark-text-primary"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Analytics Chart (DayBreakdown) */}
          <div className="lg:col-span-2 bg-white dark:bg-dark-bg-secondary rounded-2xl p-8 shadow-[0_20px_50px_rgb(0,0,0,0.06)] dark:shadow-none border border-gray-100/50 dark:border-dark-border hover:shadow-[0_20px_50px_rgb(0,0,0,0.10)] transition-all duration-300">
            <div className="flex justify-between items-center lg:mb-8 mb-12">
              <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">Feedback Analytics</h2>
              <div className="px-3 py-1 bg-gray-100 dark:bg-dark-bg-tertiary rounded-full text-xs font-bold text-gray-600 dark:text-dark-text-tertiary">
                Weekly
              </div>
            </div>
            <div className="lg:h-[300px] h-[150px] w-full">
              <DayBreakdown data={dayBreakdownData} />
            </div>
          </div>

          {/* Project Progress */}
          <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl p-8 shadow-[0_20px_50px_rgb(0,0,0,0.06)] dark:shadow-none border border-gray-100/50 dark:border-dark-border flex flex-col hover:shadow-[0_20px_50px_rgb(0,0,0,0.10)] transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">Feedbacks Progress</h2>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <ProjectProgress resolved={resolvedCount} total={totalCount} />
            </div>
          </div>
        </div>

        {/* Bottom Section: Team & Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Team Members */}
          <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl p-8 shadow-[0_20px_50px_rgb(0,0,0,0.06)] dark:shadow-none border border-gray-100/50 dark:border-dark-border hover:shadow-[0_20px_50px_rgb(0,0,0,0.10)] transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">Team Members</h2>
              <button className="text-sm font-semibold text-purple-600 dark:text-dark-purple hover:text-purple-700 dark:hover:text-dark-purple-light">
                Manage
              </button>
            </div>
            <div className="space-y-5">
              {teamMembers.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-dark-text-muted text-center py-4">No team members found.</p>
              ) : (
                teamMembers.map((member, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center text-sm font-bold text-gray-700 dark:text-dark-text-secondary border border-white dark:border-dark-border-emphasis shadow-sm">
                        {member.name ? member.name.charAt(0) : '?'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-dark-text-primary">{member.name}</p>
                        <p className="text-xs text-gray-500 dark:text-dark-text-muted">{member.role || "Member"}</p>
                      </div>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Widgets List */}
          <div className="lg:col-span-2 bg-white dark:bg-dark-bg-secondary rounded-2xl p-8 shadow-[0_20px_50px_rgb(0,0,0,0.06)] dark:shadow-none border border-gray-100/50 dark:border-dark-border hover:shadow-[0_20px_50px_rgb(0,0,0,0.10)] transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">Active Projects</h2>
              <Link to="scriptGen" className="text-sm font-semibold text-purple-600 dark:text-dark-purple hover:text-purple-700 dark:hover:text-dark-purple-light">
                View All
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-100 dark:border-dark-border">
                    <th className="pb-4 text-xs font-bold text-gray-400 dark:text-dark-text-disabled uppercase tracking-wider">Project Name</th>
                    <th className="pb-4 text-xs font-bold text-gray-400 dark:text-dark-text-disabled uppercase tracking-wider">Status</th>
                    <th className="pb-4 text-xs font-bold text-gray-400 dark:text-dark-text-disabled uppercase tracking-wider">Rating</th>
                    <th className="pb-4 text-xs font-bold text-gray-400 dark:text-dark-text-disabled uppercase tracking-wider">Feedback</th>
                    <th className="pb-4 text-xs font-bold text-gray-400 dark:text-dark-text-disabled uppercase tracking-wider">Last Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
                  {widgets.map((widget, idx) => (
                    <tr key={idx} className="group hover:bg-gray-50/50 dark:hover:bg-dark-bg-tertiary/50 transition-colors">
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gray-100 dark:bg-dark-bg-tertiary text-gray-600 dark:text-dark-text-tertiary">
                            <LayoutDashboard size={16} />
                          </div>
                          <span className="text-sm font-semibold text-gray-900 dark:text-dark-text-primary">
                            {widget.webUrl.replace(/(^\w+:|^)\/\//, "")}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          Active
                        </span>
                      </td>
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-1">
                          <Star size={14} className="text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-bold text-gray-900 dark:text-dark-text-primary">{widget.avgRating}</span>
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="text-sm text-gray-600 dark:text-dark-text-muted">{widget.totalFeedback}</span>
                      </td>
                      <td className="py-4">
                        <span className="text-sm text-gray-500 dark:text-dark-text-muted">
                          {new Date(widget.lastActive).toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="h-24 lg:h-0 w-full" ></div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ to, title, value, text_col, icon, trend, color, isRating }) => {
  return (
    <Link to={to} className={`h-[150px] group relative overflow-hidden rounded-2xl p-6 flex justify-between items-start shadow-lg ${color} transition-all duration-300`}>
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="mt-4">
          <h3 className={`text-sm font-medium ${text_col} mb-1`}>{title}</h3>
          <div className="flex items-end gap-2">
            <h2 className={`text-4xl font-bold tracking-tight ${text_col}`}>{value}</h2>
          </div>
          <p className={`text-xs mt-2 font-medium opacity-70 ${text_col}`}>{trend}</p>
        </div>

      </div>
      <div className="flex justify-between items-start">
        {icon}

      </div>

    </Link>
  );
};