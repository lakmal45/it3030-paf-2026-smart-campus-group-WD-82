import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useRef, useEffect } from "react";
import { Menu, X, LogOut, User, Settings, ChevronDown, Bell, LayoutDashboard, Search, HelpCircle } from "lucide-react";
import { roleNavigation } from "../routes/navigation";

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const location = useLocation();

  const userRole = user?.role?.toUpperCase() || "USER";
  const navigationLinks = roleNavigation[userRole] || roleNavigation.USER;

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    if (isMobileMenuOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsMobileMenuOpen(false);
    }
  }, [location.pathname, isMobileMenuOpen]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex overflow-hidden font-sans selection:bg-indigo-500/30">
      
      {/* Decorative Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-indigo-200/40 to-purple-200/40 blur-[100px]" />
        <div className="absolute top-[60%] -left-[10%] w-[40%] h-[40%] rounded-full bg-gradient-to-tr from-blue-200/40 to-teal-200/40 blur-[100px]" />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 md:hidden transition-all duration-300 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-50 w-[280px] m-0 md:m-4 md:rounded-3xl bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-slate-600 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] md:translate-x-0 md:static flex flex-col overflow-hidden`}
      >
        {/* Logo Area */}
        <div className="flex items-center justify-between md:justify-start h-20 px-6 border-b border-slate-100/80">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/30 transition-shadow">
              <span className="text-xl font-bold text-white tracking-widest">SC</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-slate-800 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                Smart Campus
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Portal</span>
            </div>
          </Link>
          <button 
            className="md:hidden p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar">
          <div className="mb-8">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Main Menu</p>
            <nav className="space-y-1.5">
              {navigationLinks.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                      isActive 
                        ? "bg-indigo-50 text-indigo-700 font-semibold shadow-sm" 
                        : "hover:bg-slate-50 hover:text-slate-900 font-medium text-slate-500"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-600 rounded-r-md" />
                    )}
                    <Icon size={20} className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-700"}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Sidebar area */}
        <div className="p-4 border-t border-slate-100/80 mt-auto bg-slate-50/50">
           <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-100 shadow-sm cursor-pointer hover:border-indigo-200 hover:shadow-md transition-all">
               <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 text-indigo-700 flex items-center justify-center font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
               </div>
               <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-semibold text-slate-800 truncate">
                    {user?.name || "User"}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {user?.role || "STUDENT"}
                  </span>
               </div>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden z-10 relative">
        {/* Topbar */}
        <header className="h-20 flex items-center justify-between px-4 sm:px-8 bg-transparent sticky top-0 z-30 transition-all">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-500 bg-white shadow-sm border border-slate-100 hover:text-indigo-600 transition-colors focus:outline-none"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div className="hidden md:flex flex-col">
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                Welcome back, {user?.name?.split(' ')[0] || "User"} 👋
              </h1>
              <p className="text-sm text-slate-500 mt-0.5 font-medium">Here's what's happening on campus today.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            {/* Search */}
            <div className="hidden lg:flex items-center bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-full px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400 transition-all">
                <Search size={16} className="text-slate-400 mr-2" />
                <input 
                  type="text" 
                  placeholder="Search anything..." 
                  className="bg-transparent border-none outline-none text-sm w-48 text-slate-700 placeholder:text-slate-400"
                />
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
                <button className="p-2.5 text-slate-500 hover:text-indigo-600 bg-white/80 backdrop-blur-sm hover:bg-white border border-slate-200/80 rounded-full shadow-sm hover:shadow transition-all relative">
                    <HelpCircle size={18} />
                </button>
                <button className="p-2.5 text-slate-500 hover:text-indigo-600 bg-white/80 backdrop-blur-sm hover:bg-white border border-slate-200/80 rounded-full shadow-sm hover:shadow transition-all relative">
                    <Bell size={18} />
                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
                </button>
            </div>

            {/* Separator */}
            <div className="w-px h-8 bg-slate-200/80 hidden sm:block"></div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1.5 pr-3 bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-full shadow-sm hover:shadow hover:border-slate-300 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 group"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                   <User size={16} className="text-slate-500" />
                </div>
                <ChevronDown size={14} className={`text-slate-400 group-hover:text-slate-600 transition-all duration-300 ${isProfileOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Menu */}
              <div 
                className={`absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_40px_rgb(0,0,0,0.08)] border border-slate-100 py-2 z-50 transform origin-top-right transition-all duration-200 ${
                  isProfileOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                }`}
              >
                <div className="px-4 py-3 border-b border-slate-100/80">
                  <p className="text-sm font-bold text-slate-800 truncate">{user?.name || "User Account"}</p>
                  <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mt-1">{user?.role || "STUDENT"}</p>
                </div>
                
                <div className="px-2 py-2">
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl transition-all group">
                    <User size={16} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                    My Profile
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl transition-all group">
                    <Settings size={16} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                    Account Settings
                  </button>
                </div>
                
                <div className="px-2 py-2 border-t border-slate-100/80">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-all group"
                  >
                    <LogOut size={16} className="text-rose-500 group-hover:text-rose-600 transition-colors" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-8 custom-scrollbar relative z-10">
          <div className="mx-auto max-w-[1600px] h-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
