import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  Package,
  ShoppingCart,
  Users,
  FolderTree,
  Tag,
  Settings,
  Search,
  ChevronDown,
  Download,
  Calendar,
  TrendingUp,
  Menu,
  LogOut,
  ShoppingBag,
  ExternalLink,
  Star
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Core Data States
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('Last 7 Days');
  const [hoveredPoint, setHoveredPoint] = useState(null);
  
  // Interactive UI States
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const searchInputRef = useRef(null);

  // Keyboard shortcut Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch Dashboard Analytics
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/analytics/overview');
        setData(res.data.data);
      } catch (err) {
        console.error('Failed to load admin analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const formatMoney = (amount) => {
    return `$${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleDownloadReport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        'MarketVerse Platform Performance Report',
        `Generated At: ${new Date().toLocaleString()}`,
        `Reporting Period: ${dateRange}`,
        '',
        'METRIC,VALUE,TREND',
        `Total Sales,$${kpis.totalSales},+18.6%`,
        `Total Orders,${kpis.totalOrders},+12.4%`,
        `Total Vendors,${kpis.totalVendors},+15.7%`,
        `Total Customers,${kpis.totalCustomers},+20.1%`,
        `Total Products,${kpis.totalProducts},+10.3%`,
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `marketverse_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Clean, focused sidebar links for functional modules only
  const sidebarItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { name: 'Vendors', icon: Store, path: '/admin/vendors' },
    { name: 'Orders', icon: ShoppingCart, path: '/admin/orders' },
    { name: 'Products', icon: Package, path: '/products' },
    { name: 'Users', icon: Users, path: '/admin/users' },
    { name: 'Categories', icon: FolderTree, path: '/admin/categories' },
    { name: 'Coupons', icon: Tag, path: '/admin/coupons' },
    { name: 'Settings', icon: Settings, path: '/profile' },
  ];

  const kpis = data?.kpis || {
    totalSales: 124560,
    totalOrders: 1840,
    totalVendors: 42,
    totalCustomers: 5890,
    totalProducts: 480,
  };

  const salesDataPoints = [
    { day: 'Mon', value: 14000, x: 50, y: 150 },
    { day: 'Tue', value: 18500, x: 125, y: 120 },
    { day: 'Wed', value: 16200, x: 200, y: 135 },
    { day: 'Thu', value: 21500, x: 275, y: 100 },
    { day: 'Fri', value: 19000, x: 350, y: 125 },
    { day: 'Sat', value: 28000, x: 425, y: 55 },
    { day: 'Sun', value: 25400, x: 500, y: 75 },
  ];

  const curvePath =
    'M 50 150 C 90 125, 100 120, 125 120 C 160 120, 175 135, 200 135 C 240 135, 250 100, 275 100 C 315 100, 325 125, 350 125 C 385 125, 400 55, 425 55 C 460 55, 475 75, 500 75';
  const areaPath = `${curvePath} L 500 200 L 50 200 Z`;

  const recentOrders = [
    { id: '#ORD-1089', customer: 'John Doe', amount: 249.99, status: 'Completed' },
    { id: '#ORD-1088', customer: 'Sarah Connor', amount: 89.50, status: 'Processing' },
    { id: '#ORD-1087', customer: 'Alex Rivera', amount: 499.00, status: 'Shipped' },
    { id: '#ORD-1086', customer: 'Emily Watson', amount: 129.99, status: 'Completed' },
    { id: '#ORD-1085', customer: 'Michael Chang', amount: 64.00, status: 'Pending' },
  ];

  const topVendors = [
    { name: 'Apex Tech Goods', rating: 4.9, sales: '840 Sales' },
    { name: 'Urban Threads Apparel', rating: 4.8, sales: '620 Sales' },
    { name: 'SoundMaster Audio', rating: 4.7, sales: '510 Sales' },
    { name: 'HomeStyle Co.', rating: 4.6, sales: '390 Sales' },
  ];

  return (
    <div className="min-h-screen bg-yellow-50/40 text-slate-800 flex font-sans antialiased">
      
      {/* SIDEBAR */}
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-yellow-200/90 flex flex-col shrink-0 transition-all duration-300 ease-in-out sticky top-0 h-screen z-40 select-none shadow-xs`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-yellow-100 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 overflow-hidden group">
            <div className="w-9 h-9 rounded-xl bg-yellow-400 flex items-center justify-center text-slate-950 font-black shadow-xs shrink-0 group-hover:scale-105 transition">
              <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col leading-tight whitespace-nowrap">
                <span className="text-lg font-black tracking-tight text-slate-900">
                  Market<span className="text-amber-500">Verse</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                  Admin Console
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-yellow-50 transition hidden lg:block"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Clean, Functional Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.path === '/admin/dashboard';

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? 'bg-yellow-400 text-slate-950 font-black shadow-xs'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-yellow-50/70'
                }`}
                title={!isSidebarOpen ? item.name : undefined}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950 stroke-[2.5]' : 'text-slate-400'}`} />
                  {isSidebarOpen && <span className="truncate">{item.name}</span>}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Live Marketplace Link Footer */}
        {isSidebarOpen && (
          <div className="p-3 border-t border-yellow-100 bg-yellow-50/30">
            <Link
              to="/"
              className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-yellow-200 text-xs font-bold text-slate-800 hover:text-slate-950 hover:border-yellow-400 transition shadow-xs"
            >
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-amber-600" />
                <span>Live Marketplace</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        )}
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-yellow-200/90 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl text-slate-500 hover:bg-yellow-50 transition lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vendors, products, orders..."
                className="w-full pl-10 pr-4 py-2 bg-yellow-50/40 border border-yellow-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 transition font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full hover:bg-yellow-50 transition border border-transparent hover:border-yellow-200"
              >
                <div className="w-7 h-7 rounded-full bg-yellow-400 text-slate-950 font-black flex items-center justify-center text-xs">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <span className="text-xs font-bold text-slate-900 hidden sm:inline">
                  {user?.name || 'Admin'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-yellow-200 py-1.5 z-50 text-xs font-semibold">
                  <div className="px-3.5 py-2 border-b border-yellow-100 bg-yellow-50/40">
                    <p className="font-bold text-slate-900">{user?.name || 'Administrator'}</p>
                    <p className="text-slate-500 text-[11px] truncate">{user?.email || 'admin@marketverse.com'}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center gap-2 px-3.5 py-2 text-slate-700 hover:bg-yellow-50"
                  >
                    <Settings className="w-3.5 h-3.5 text-amber-600" /> Account Settings
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      navigate('/login');
                    }}
                    className="w-full text-left flex items-center gap-2 px-3.5 py-2 text-rose-600 hover:bg-rose-50 border-t border-yellow-100 font-bold"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6 sm:p-8 space-y-6 flex-1">
          
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Overview</h1>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Real-time performance and multi-vendor metrics
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setShowDateDropdown(!showDateDropdown)}
                  className="flex items-center gap-2 px-3.5 py-2 bg-white border border-yellow-200 rounded-xl text-xs font-bold text-slate-700 hover:border-yellow-400 shadow-xs transition"
                >
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  <span>{dateRange}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
                {showDateDropdown && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-yellow-200 py-1 z-40 text-xs">
                    {['Last 7 Days', 'Last 30 Days', 'This Month'].map((range) => (
                      <button
                        key={range}
                        onClick={() => {
                          setDateRange(range);
                          setShowDateDropdown(false);
                        }}
                        className="w-full text-left px-3.5 py-1.5 hover:bg-yellow-50 font-semibold text-slate-700"
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleDownloadReport}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black rounded-xl text-xs shadow-xs transition"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Export Report</span>
              </button>
            </div>
          </div>

          {/* 5 KPI Cards in Light Yellow & White Theme */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-yellow-200/90 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Sales</span>
                <div className="w-8 h-8 rounded-xl bg-yellow-100 text-amber-800 flex items-center justify-center font-bold">
                  <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">{formatMoney(kpis.totalSales)}</p>
              <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold mt-2">
                <TrendingUp className="w-3 h-3" /> 18.6% vs last week
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-yellow-200/90 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Orders</span>
                <div className="w-8 h-8 rounded-xl bg-yellow-100 text-amber-800 flex items-center justify-center font-bold">
                  <ShoppingCart className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">{Number(kpis.totalOrders).toLocaleString()}</p>
              <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold mt-2">
                <TrendingUp className="w-3 h-3" /> 12.4% growth
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-yellow-200/90 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vendors</span>
                <div className="w-8 h-8 rounded-xl bg-yellow-100 text-amber-800 flex items-center justify-center font-bold">
                  <Store className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">{Number(kpis.totalVendors).toLocaleString()}</p>
              <span className="text-[11px] text-slate-400 font-medium block mt-2">Active stores</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-yellow-200/90 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Customers</span>
                <div className="w-8 h-8 rounded-xl bg-yellow-100 text-amber-800 flex items-center justify-center font-bold">
                  <Users className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">{Number(kpis.totalCustomers).toLocaleString()}</p>
              <span className="text-[11px] text-slate-400 font-medium block mt-2">Registered buyers</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-yellow-200/90 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Products</span>
                <div className="w-8 h-8 rounded-xl bg-yellow-100 text-amber-800 flex items-center justify-center font-bold">
                  <Package className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">{Number(kpis.totalProducts).toLocaleString()}</p>
              <span className="text-[11px] text-slate-400 font-medium block mt-2">Live catalog items</span>
            </div>
          </div>

          {/* Middle Row: Sales Trend + Recent Orders + Top Vendors */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Sales Chart */}
            <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-yellow-200/90 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-900">Revenue Performance</h2>
                <span className="text-xs font-bold text-amber-700 bg-yellow-50 px-2 py-0.5 rounded-lg border border-yellow-200">
                  Last 7 Days
                </span>
              </div>

              <div className="relative w-full h-56 pt-2">
                <svg viewBox="0 0 550 200" className="w-full h-44 overflow-visible" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#facc15" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#fef9c3" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d={areaPath} fill="url(#salesGrad)" />
                  <path d={curvePath} fill="none" stroke="#eab308" strokeWidth="3" strokeLinecap="round" />
                  {salesDataPoints.map((pt, i) => (
                    <circle
                      key={i}
                      cx={pt.x}
                      cy={pt.y}
                      r="4"
                      fill="#ffffff"
                      stroke="#ca8a04"
                      strokeWidth="2.5"
                      className="cursor-pointer hover:r-6 transition-all"
                      onMouseEnter={() => setHoveredPoint(pt)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  ))}
                </svg>

                <div className="flex justify-between text-[11px] text-slate-400 font-semibold px-4 mt-2">
                  {salesDataPoints.map((pt, i) => (
                    <span key={i}>{pt.day}</span>
                  ))}
                </div>

                {hoveredPoint && (
                  <div
                    className="absolute bg-slate-950 text-yellow-300 text-[11px] font-bold px-2 py-1 rounded-lg pointer-events-none transform -translate-x-1/2 -translate-y-full"
                    style={{ left: `${(hoveredPoint.x / 550) * 100}%`, top: `${(hoveredPoint.y / 200) * 100}%` }}
                  >
                    ${hoveredPoint.value.toLocaleString()}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Orders Feed */}
            <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-yellow-200/90 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-900">Recent Orders</h2>
                <Link to="/admin/orders" className="text-xs font-bold text-amber-700 hover:underline">
                  View All
                </Link>
              </div>

              <div className="divide-y divide-yellow-100/60">
                {recentOrders.map((ord) => (
                  <div key={ord.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{ord.id}</p>
                      <p className="text-[11px] text-slate-400">{ord.customer}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-900">${ord.amount.toFixed(2)}</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-900">
                        {ord.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Vendors */}
            <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-yellow-200/90 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-900">Top Vendors</h2>
                <Link to="/admin/vendors" className="text-xs font-bold text-amber-700 hover:underline">
                  View All
                </Link>
              </div>

              <div className="space-y-3">
                {topVendors.map((v) => (
                  <div key={v.name} className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{v.name}</p>
                      <div className="flex items-center gap-1 text-[11px] text-amber-600 font-semibold">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{v.rating}</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500">{v.sales}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </main>
      </div>

    </div>
  );
}
