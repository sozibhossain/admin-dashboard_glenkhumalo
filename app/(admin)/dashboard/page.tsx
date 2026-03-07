"use client";

import React from "react";
import { ChevronDown, TrendingDown, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StatCardProps = {
  title: string;
  value: string;
  percentage: number;
  positive?: boolean;
};

const statCards: StatCardProps[] = [
  { title: "Total Clients", value: "12k", percentage: 36, positive: true },
  { title: "Total Creatives", value: "7k", percentage: 14, positive: false },
  { title: "Total Orders", value: "10k", percentage: 36, positive: true },
  { title: "Total Revenue", value: "$12,426", percentage: 36, positive: true },
];

const revenueData = [
  { month: "Feb", value: 24000 },
  { month: "Mar", value: 27000 },
  { month: "Apr", value: 23500 },
  { month: "May", value: 31500 },
  { month: "Jun", value: 45591 },
  { month: "Jul", value: 39000 },
  { month: "Aug", value: 41000 },
  { month: "Sep", value: 36000 },
  { month: "Oct", value: 52000 },
  { month: "Nov", value: 50000 },
  { month: "Dec", value: 56000 },
  { month: "Jan", value: 59000 },
];

const ordersDistributionData = [
  { name: "Service A", value: 45, color: "#38c95a" },
  { name: "Service B", value: 20, color: "#ececec" },
  { name: "Service C", value: 15, color: "#7f7f7f" },
  { name: "Service D", value: 10, color: "#191b20" },
  { name: "Service E", value: 10, color: "#454b57" },
];

const clientData = [
  { month: "Jan", value: 25000 },
  { month: "Feb", value: 23000 },
  { month: "Mar", value: 29000 },
  { month: "Apr", value: 14000 },
  { month: "May", value: 24000 },
  { month: "Jun", value: 7000 },
  { month: "Jul", value: 17000 },
  { month: "Aug", value: 26000 },
  { month: "Sep", value: 32000 },
  { month: "Oct", value: 15000 },
  { month: "Nov", value: 21000 },
  { month: "Dec", value: 24000 },
];

const creativeData = [
  { month: "Jan", value: 6000 },
  { month: "Feb", value: 11000 },
  { month: "Mar", value: 9000 },
  { month: "Apr", value: 16000 },
  { month: "May", value: 14500 },
  { month: "Jun", value: 23000 },
  { month: "Jul", value: 19000 },
  { month: "Aug", value: 21500 },
  { month: "Sep", value: 18000 },
  { month: "Oct", value: 25000 },
  { month: "Nov", value: 17500 },
  { month: "Dec", value: 28500 },
];

const visitorData = [
  { day: "Sat", top: 170, mid: 80, low: 35 },
  { day: "Sun", top: 120, mid: 45, low: 30 },
  { day: "Mon", top: 210, mid: 105, low: 55 },
  { day: "Tue", top: 175, mid: 85, low: 60 },
  { day: "Wed", top: 160, mid: 70, low: 25 },
  { day: "Thu", top: 230, mid: 175, low: 80 },
  { day: "Fri", top: 165, mid: 95, low: 70 },
];

const userData = [
  { day: "Sat", value: 32, color: "#5f79ad" },
  { day: "Sun", value: 65, color: "#b7dfe7" },
  { day: "Mon", value: 52, color: "#efe2e5" },
  { day: "Tue", value: 112, color: "#cdb2d6" },
  { day: "Wed", value: 66, color: "#190e2d" },
  { day: "Thu", value: 112, color: "#f1c780" },
  { day: "Fri", value: 74, color: "#8ea3cb" },
];

function StatCard({ title, value, percentage, positive = true }: StatCardProps) {
  return (
    <Card className="border border-slate-200/80 bg-white shadow-sm">
      <CardHeader className="pb-2">
        <p className="text-xs font-medium text-slate-500">{title}</p>
      </CardHeader>
      <CardContent className="flex items-end justify-between gap-3">
        <p className="text-2xl font-semibold text-slate-800">{value}</p>
        <div
          className={`flex items-center gap-1 text-xs font-semibold ${
            positive ? "text-emerald-500" : "text-rose-500"
          }`}
        >
          <span>{positive ? `+ ${percentage}%` : `- ${percentage}%`}</span>
          {positive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
        </div>
      </CardContent>
    </Card>
  );
}

const formatThousands = (value: number) => `${Math.round(value / 1000)}k`;

export default function DashboardPage() {
  return (
    <div className=" space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="border border-slate-200/80 bg-white shadow-sm xl:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
            <div>
              <CardTitle className="text-sm font-semibold text-slate-800">Revenue Overview</CardTitle>
              <p className="text-[10px] text-slate-400">
                Track total revenue, platform commission, and payouts over time.
              </p>
            </div>
            <button className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] text-slate-600">
              Monthly <ChevronDown size={12} />
            </button>
          </CardHeader>
          <CardContent className="h-[260px] w-full pb-3 md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ left: 0, right: 4, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.24} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#e6ebf2" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  dy={8}
                />
                <YAxis hide domain={[0, 65000]} />
                <Tooltip
                  cursor={{ stroke: "#cbd5e1", strokeDasharray: "4 4" }}
                  contentStyle={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.06)",
                    fontSize: "12px",
                  }}
                  formatter={(val) => {
                    const numericVal = typeof val === "number" ? val : Number(val ?? 0);
                    return [`$${numericVal.toLocaleString()}`, "Revenue"];
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2.2}
                  fill="url(#revenueFill)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
            <div>
              <CardTitle className="text-sm font-semibold text-slate-800">Orders Distribution</CardTitle>
              <p className="text-[10px] text-slate-400">See which orders are sourced the most by user.</p>
            </div>
            <button className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] text-slate-600">
              Monthly <ChevronDown size={12} />
            </button>
          </CardHeader>
          <CardContent className="flex flex-col items-center pb-4">
            <div className="h-[180px] w-full md:h-[190px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ordersDistributionData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={52}
                    outerRadius={82}
                    paddingAngle={1}
                    label={({ value }) => `${value}%`}
                    labelLine={false}
                  >
                    {ordersDistributionData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => {
                      const numericVal = typeof val === "number" ? val : Number(val ?? 0);
                      return `${numericVal}%`;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 grid w-full grid-cols-2 gap-x-4 gap-y-1 md:gap-x-7">
              {ordersDistributionData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] font-medium text-slate-500">Service Name</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="border border-slate-200/80 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-800">Total Client</CardTitle>
            <p className="text-[10px] text-slate-400">See your client per year.</p>
          </CardHeader>
          <CardContent className="h-[220px] md:h-[245px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clientData} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="clientBars" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f2b85" />
                    <stop offset="100%" stopColor="#0f1021" />
                  </linearGradient>
                </defs>
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  tickFormatter={formatThousands}
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  dy={6}
                />
                <Bar dataKey="value" fill="url(#clientBars)" radius={[3, 3, 0, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-800">Total Creative</CardTitle>
            <p className="text-[10px] text-slate-400">See your client per year.</p>
          </CardHeader>
          <CardContent className="h-[220px] md:h-[245px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={creativeData} margin={{ left: 0, right: 4, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="creativeFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9d4edd" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#9d4edd" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#eceff4" vertical />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  tickFormatter={formatThousands}
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  dy={6}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#8a3ec4"
                  strokeWidth={1.8}
                  fill="url(#creativeFill)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="border border-slate-200/80 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-800">Total Visitor</CardTitle>
          </CardHeader>
          <CardContent className="h-[230px] md:h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visitorData} margin={{ left: 0, right: 4, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="visitorTop" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#77d6ec" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#77d6ec" stopOpacity={0.03} />
                  </linearGradient>
                  <linearGradient id="visitorMid" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff9f9f" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#ff9f9f" stopOpacity={0.04} />
                  </linearGradient>
                  <linearGradient id="visitorLow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9f8cff" stopOpacity={0.38} />
                    <stop offset="100%" stopColor="#9f8cff" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 3" vertical stroke="#e8edf4" />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  domain={[0, 300]}
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  dy={6}
                />
                <Area
                  type="monotone"
                  dataKey="top"
                  stroke="#69cfe8"
                  fill="url(#visitorTop)"
                  strokeWidth={1.7}
                  dot={{ r: 2.5, fill: "#fff", stroke: "#69cfe8", strokeWidth: 1.2 }}
                />
                <Area
                  type="monotone"
                  dataKey="mid"
                  stroke="#ff9b9b"
                  fill="url(#visitorMid)"
                  strokeWidth={1.6}
                  dot={{ r: 2.5, fill: "#fff", stroke: "#ff9b9b", strokeWidth: 1.2 }}
                />
                <Area
                  type="monotone"
                  dataKey="low"
                  stroke="#8f83ff"
                  fill="url(#visitorLow)"
                  strokeWidth={1.6}
                  dot={{ r: 2.5, fill: "#fff", stroke: "#8f83ff", strokeWidth: 1.2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-800">Total Users</CardTitle>
          </CardHeader>
          <CardContent className="h-[230px] md:h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userData} margin={{ left: 0, right: 4, top: 4, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#e9edf3" />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  dy={6}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={30}>
                  {userData.map((entry) => (
                    <Cell key={entry.day} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
