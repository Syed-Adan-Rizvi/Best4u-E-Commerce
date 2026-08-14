// File Path: src/components/admin/ClickAnalyticsWidget.jsx
"use client";

import { useState, useEffect } from "react";
import DashboardChart from "./DashboardChart";
import { Loader2, Filter } from "lucide-react";

export default function ClickAnalyticsWidget({ categories }) {
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [timeRange, setTimeRange] = useState("1month"); // Default 1 month
  const [limit, setLimit] = useState("top10"); // Default Top 10
  const [category, setCategory] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/analytics?timeRange=${timeRange}&limit=${limit}&category=${category}`);
        const result = await res.json();
        
        if (result.success) {
          // Recharts ko naam chhote chahiyein hote hain, warna graph kharab ho jata hai
          const formattedData = result.data.map(item => ({
            name: item.name.length > 20 ? item.name.substring(0, 20) + "..." : item.name,
            total: item.total
          }));
          setChartData(formattedData.length > 0 ? formattedData : [{ name: "No Clicks Yet", total: 0 }]);
        }
      } catch (error) {
        console.error("Fetch error", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timeRange, limit, category]);

  return (
    <div className="bg-white border border-cream-dark rounded-2xl p-5 sm:p-6 shadow-sm w-full">
      
      {/* HEADER & FILTERS */}
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4 mb-6 border-b border-cream-dark pb-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-sage-dark">Product Clicks Analytics</h3>
          <p className="text-xs text-sage-light mt-1">Dekiye kis product ki deal logo ko sabse zyada pasand aa rahi hai.</p>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-cream/50 border border-cream-dark rounded-lg px-2 py-1.5">
            <Filter size={14} className="text-sage-light" />
            
            <select 
              value={timeRange} onChange={(e) => setTimeRange(e.target.value)}
              className="bg-transparent text-xs text-sage-dark outline-none cursor-pointer"
            >
              <option value="today">Last 24h</option>
              <option value="7days">Last 7 Days</option>
              <option value="1month">Last 1 Month</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last 1 Year</option>
              <option value="all">All Time</option>
            </select>
          </div>

          <div className="bg-cream/50 border border-cream-dark rounded-lg px-2 py-1.5">
            <select 
              value={category} onChange={(e) => setCategory(e.target.value)}
              className="bg-transparent text-xs text-sage-dark outline-none cursor-pointer w-full max-w-[120px] truncate"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="bg-cream/50 border border-cream-dark rounded-lg px-2 py-1.5">
            <select 
              value={limit} onChange={(e) => setLimit(e.target.value)}
              className="bg-transparent text-xs text-sage-dark outline-none cursor-pointer"
            >
              <option value="top5">Top 5</option>
              <option value="top10">Top 10</option>
              <option value="top20">Top 20</option>
              <option value="lowest">Lowest 10</option>
            </select>
          </div>
        </div>
      </div>

      {/* CHART AREA */}
      <div className="h-[350px] w-full relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-xl">
            <Loader2 size={30} className="text-sage animate-spin" />
          </div>
        )}
        {/* 🟢 YAHAN CHANGE KIYA HAI: type="line" add kar diya */}
        <DashboardChart data={chartData} type="line" />
      </div>

    </div>
  );
}
















// // File Path: src/components/admin/ClickAnalyticsWidget.jsx
// "use client";

// import { useState, useEffect } from "react";
// import DashboardChart from "./DashboardChart";
// import { Loader2, Filter } from "lucide-react";

// export default function ClickAnalyticsWidget({ categories }) {
//   const [chartData, setChartData] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);

//   // Filters State
//   const [timeRange, setTimeRange] = useState("1month"); // Default 1 month
//   const [limit, setLimit] = useState("top10"); // Default Top 10
//   const [category, setCategory] = useState("all");

//   useEffect(() => {
//     const fetchData = async () => {
//       setIsLoading(true);
//       try {
//         const res = await fetch(`/api/analytics?timeRange=${timeRange}&limit=${limit}&category=${category}`);
//         const result = await res.json();
        
//         if (result.success) {
//           // Recharts ko naam chhote chahiyein hote hain, warna graph kharab ho jata hai
//           const formattedData = result.data.map(item => ({
//             name: item.name.length > 20 ? item.name.substring(0, 20) + "..." : item.name,
//             total: item.total
//           }));
//           setChartData(formattedData.length > 0 ? formattedData : [{ name: "No Clicks Yet", total: 0 }]);
//         }
//       } catch (error) {
//         console.error("Fetch error", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchData();
//   }, [timeRange, limit, category]);

//   return (
//     <div className="bg-white border border-cream-dark rounded-2xl p-5 sm:p-6 shadow-sm w-full">
      
//       {/* HEADER & FILTERS */}
//       <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4 mb-6 border-b border-cream-dark pb-4">
//         <div>
//           <h3 className="text-base sm:text-lg font-semibold text-sage-dark">Product Clicks Analytics</h3>
//           <p className="text-xs text-sage-light mt-1">Dekiye kis product ki deal logo ko sabse zyada pasand aa rahi hai.</p>
//         </div>

//         {/* Filter Dropdowns */}
//         <div className="flex flex-wrap items-center gap-2">
//           <div className="flex items-center gap-1.5 bg-cream/50 border border-cream-dark rounded-lg px-2 py-1.5">
//             <Filter size={14} className="text-sage-light" />
            
//             <select 
//               value={timeRange} onChange={(e) => setTimeRange(e.target.value)}
//               className="bg-transparent text-xs text-sage-dark outline-none cursor-pointer"
//             >
//               <option value="today">Last 24h</option>
//               <option value="7days">Last 7 Days</option>
//               <option value="1month">Last 1 Month</option>
//               <option value="6months">Last 6 Months</option>
//               <option value="1year">Last 1 Year</option>
//               <option value="all">All Time</option>
//             </select>
//           </div>

//           <div className="bg-cream/50 border border-cream-dark rounded-lg px-2 py-1.5">
//             <select 
//               value={category} onChange={(e) => setCategory(e.target.value)}
//               className="bg-transparent text-xs text-sage-dark outline-none cursor-pointer w-full max-w-[120px] truncate"
//             >
//               <option value="all">All Categories</option>
//               {categories.map(cat => (
//                 <option key={cat._id} value={cat._id}>{cat.name}</option>
//               ))}
//             </select>
//           </div>

//           <div className="bg-cream/50 border border-cream-dark rounded-lg px-2 py-1.5">
//             <select 
//               value={limit} onChange={(e) => setLimit(e.target.value)}
//               className="bg-transparent text-xs text-sage-dark outline-none cursor-pointer"
//             >
//               <option value="top5">Top 5</option>
//               <option value="top10">Top 10</option>
//               <option value="top20">Top 20</option>
//               <option value="lowest">Lowest 10</option>
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* CHART AREA */}
//       <div className="h-[350px] w-full relative">
//         {isLoading && (
//           <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-xl">
//             <Loader2 size={30} className="text-sage animate-spin" />
//           </div>
//         )}
//         <DashboardChart data={chartData} />
//       </div>

//     </div>
//   );
// }