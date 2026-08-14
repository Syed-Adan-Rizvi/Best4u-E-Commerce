// File Path: src/components/admin/DashboardChart.jsx
"use client";

import { useEffect, useState } from "react";
import { 
  BarChart, 
  Bar, 
  ComposedChart, 
  Line, 
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

// =================================================================
// 📊 UI STORY: "Smart Dashboard Chart Component"
// Yeh component 'type' prop ('bar' ya 'line') ke hisaab se khud ko badal lega.
// =================================================================
export default function DashboardChart({ data, type = "bar" }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="h-[300px] w-full flex items-center justify-center bg-cream-dark/20 animate-pulse rounded-2xl">Loading Chart...</div>;
  }

  // 📈 1. LINE CHART (For Clicks)
  if (type === "line") {
    return (
      <div className="h-[300px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2EBE1" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8FA397', fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8FA397', fontSize: 12 }} />
            <Tooltip 
              cursor={{ stroke: '#8FA397', strokeWidth: 1, strokeDasharray: '3 3' }}
              contentStyle={{ backgroundColor: '#3A4D41', border: 'none', borderRadius: '8px', color: '#FDFBF7' }}
            />
            <Area type="monotone" dataKey="total" fill="#C2D1C9" stroke="none" fillOpacity={0.3} />
            <Line type="monotone" dataKey="total" stroke="#5A7363" strokeWidth={4} dot={{ r: 4, fill: "#5A7363", strokeWidth: 2, stroke: "#FDFBF7" }} activeDot={{ r: 6, fill: "#3A4D41", stroke: "#FDFBF7", strokeWidth: 2 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // 📊 2. BAR CHART (For Categories - Default)
  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2EBE1" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8FA397', fontSize: 12 }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8FA397', fontSize: 12 }} />
          <Tooltip 
            cursor={{ fill: '#FDFBF7' }} 
            contentStyle={{ backgroundColor: '#3A4D41', border: 'none', borderRadius: '8px', color: '#FDFBF7' }} 
          />
          <Bar dataKey="total" fill="#5A7363" radius={[4, 4, 0, 0]} barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}












