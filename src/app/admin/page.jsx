// File Path: src/app/admin/page.jsx
import connectDB from "@/lib/db"; 
import Product from "@/models/Product"; 
import Category from "@/models/Category"; 
import { Subscriber } from "@/models/Subscriber"; 
import ClickTracker from "@/models/ClickTracker"; 

import { ShoppingBag, Tags, Users, MousePointerClick, Plus, ArrowUpRight } from "lucide-react";
import DashboardChart from "@/components/admin/DashboardChart";
import ClickAnalyticsWidget from "@/components/admin/ClickAnalyticsWidget"; 
import Link from "next/link";

export const dynamic = "force-dynamic";

// =================================================================
// 🏢 SERVER STORY: "Admin Dashboard Home (Real Data Center)"
// =================================================================
export default async function AdminDashboard() {
  
  let stats = { products: 0, categories: 0, subscribers: 0, clicks: 0 };
  let recentProducts = [];
  let recentSubscribers = [];
  let chartData = [];
  let allCategories = [];

  try {
    await connectDB();

    // 1. Parallel Fetching for Stats
    const [totalProducts, totalCategories, totalSubscribers, totalClicks] = await Promise.all([
      Product.countDocuments(),
      Category.countDocuments(),
      Subscriber.countDocuments({ isActive: true }), 
      ClickTracker.countDocuments(), 
    ]);

    stats = {
      products: totalProducts,
      categories: totalCategories,
      subscribers: totalSubscribers,
      clicks: totalClicks,
    };

    // 2. Fetch All Categories for the Analytics Widget Dropdown
    const rawCategories = await Category.find().select("name").lean();
    allCategories = JSON.parse(JSON.stringify(rawCategories));

    // 3. Recent 5 Products
    const rawProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("category", "name")
      .lean();
    recentProducts = JSON.parse(JSON.stringify(rawProducts));

    // 4. Recent 5 Subscribers
    const rawSubscribers = await Subscriber.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    recentSubscribers = JSON.parse(JSON.stringify(rawSubscribers));

    // 5. Category-wise Product Distribution
    const rawChartData = await Product.aggregate([
      { $group: { _id: "$category", total: { $sum: 1 } } },
      { $lookup: { from: "categories", localField: "_id", foreignField: "_id", as: "categoryInfo" } },
      { $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: true } },
      { $project: { name: { $ifNull: ["$categoryInfo.name", "Uncategorized"] }, total: 1 } }
    ]);

    if (rawChartData && rawChartData.length > 0) {
      chartData = rawChartData.map((item) => ({
        name: String(item.name || "Uncategorized"),
        total: Number(item.total || 0),
      }));
    } else {
      chartData = [{ name: "No Data", total: 0 }];
    }

  } catch (error) {
    console.error("❌ [Server Error] Admin dashboard data fetch fail:", error);
  }

  // Cards Array
  const statCards = [
    { title: "Total Products", value: stats.products, icon: ShoppingBag },
    { title: "Total Categories", value: stats.categories, icon: Tags },
    { title: "Active Subscribers", value: stats.subscribers, icon: Users },
    { title: "Total Product Clicks", value: stats.clicks, icon: MousePointerClick },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* 🟢 TOP SECTION: Welcome & Quick Actions */}
      <div className="bg-white border border-cream-dark rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-sage-dark">Welcome back, Admin!</h1>
          <p className="text-xs sm:text-sm text-sage-light mt-1">Yahan aap apni website ka live data aur user interest track kar sakte hain.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link 
            href="/admin/products/new" 
            className="flex items-center gap-2 px-4 py-2.5 bg-sage text-white rounded-xl text-xs sm:text-sm font-medium hover:bg-sage-dark transition-all shadow-xs"
          >
            <Plus size={16} /> Add Product
          </Link>
          <Link 
            href="/" 
            target="_blank"
            className="flex items-center gap-2 px-4 py-2.5 bg-cream border border-cream-dark text-sage-dark rounded-xl text-xs sm:text-sm font-medium hover:bg-cream-dark transition-all"
          >
            Visit Store <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>

      {/* 🟢 ROW 1: STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white border border-cream-dark rounded-2xl p-5 sm:p-6 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-sage-light mb-1">{card.title}</p>
                <h3 className="text-2xl sm:text-3xl font-bold text-sage-dark">{card.value}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-cream flex items-center justify-center border border-cream-dark text-sage">
                <Icon size={22} />
              </div>
            </div>
          );
        })}
      </div>

      {/* 🟢 ROW 2: FULL WIDTH CLICK ANALYTICS CHART */}
      <div className="w-full">
        <ClickAnalyticsWidget categories={allCategories} />
      </div>

      {/* 🟢 ROW 3: FULL WIDTH CATEGORY DISTRIBUTION CHART */}
      <div className="bg-white border border-cream-dark rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col w-full">
        <h3 className="text-base sm:text-lg font-semibold text-sage-dark mb-2">Category Distribution</h3>
        <p className="text-xs text-sage-light mb-4">Har category mein kitne products hain.</p>
        <div className="flex-1 w-full mt-auto">
           <DashboardChart data={chartData} />
        </div>
      </div>

      {/* 🟢 ROW 4: SIDE-BY-SIDE RECENT DATA (Products & Subscribers) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        
        {/* Recent Products */}
        <div className="bg-white border border-cream-dark rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col">
          <h3 className="text-base sm:text-lg font-semibold text-sage-dark mb-4">Recent Products</h3>
          <div className="flex-1 overflow-y-auto">
            {recentProducts.length > 0 ? (
              <ul className="space-y-3">
                {recentProducts.map((product, i) => (
                  <li key={i} className="flex items-center justify-between p-3 rounded-xl bg-cream hover:bg-cream-dark/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-sage/10 flex items-center justify-center text-sage font-bold text-xs">
                        {product.title?.charAt(0) || "P"}
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-sage-dark line-clamp-1">{product.title}</p>
                        <p className="text-[11px] text-sage-light">{product.category?.name || "Uncategorized"}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="h-40 flex items-center justify-center text-xs text-sage-light bg-cream rounded-xl">No products found.</div>
            )}
          </div>
        </div>

        {/* Recent Subscribers */}
        <div className="bg-white border border-cream-dark rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col">
          <h3 className="text-base sm:text-lg font-semibold text-sage-dark mb-4">Latest Subscribers</h3>
          <div className="flex-1 overflow-y-auto">
            {recentSubscribers.length > 0 ? (
              <ul className="space-y-3">
                {recentSubscribers.map((sub, i) => (
                  <li key={i} className="flex items-center justify-between p-3 rounded-xl bg-cream hover:bg-cream-dark/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-sage-light flex items-center justify-center text-white font-bold text-xs">
                        {sub.email?.charAt(0).toUpperCase() || "@"}
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-sage-dark line-clamp-1">{sub.email}</p>
                        <p className="text-[11px] text-sage-light">{new Date(sub.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="h-40 flex items-center justify-center text-xs text-sage-light bg-cream rounded-xl">No subscribers yet.</div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}


