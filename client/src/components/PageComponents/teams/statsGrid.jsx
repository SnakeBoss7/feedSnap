import React from 'react';
import { Building2, Users, UserCheck2, BriefcaseBusiness } from 'lucide-react';

export const StatsGrid = ({ teams }) => {
  const stats = [
    { title: "Total Teams", value: teams.length, icon: Building2, bgColor: "bg-blue-50", iconColor: "text-blue-600", textColor: "text-blue-600" },
    { title: "Total Members", value: teams.reduce((sum, team) => sum + team.members.length, 0), icon: Users, bgColor: "bg-green-50", iconColor: "text-green-600", textColor: "text-green-600" },
    { title: "Active Members", value: teams.reduce((sum, team) => sum + team.members.length, 0), icon: UserCheck2, bgColor: "bg-purple-50", iconColor: "text-purple-600", textColor: "text-purple-600" },
    { title: "Departments", value: teams.length, icon: BriefcaseBusiness, bgColor: "bg-orange-50", iconColor: "text-orange-600", textColor: "text-orange-600" }
  ];

  return (
    <div className="grid mt-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <div key={stat.title} className={`${stat.bgColor} rounded-lg border`}>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`${stat.iconColor} text-sm font-bold`}>{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
              </div>
              <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};