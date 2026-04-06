import { Link } from "react-router-dom";
import { ArrowRight, Building2, Users, ShieldCheck, Zap, User, Settings, LogOut, ChevronDown, CheckCircle2, LayoutDashboard, Database, Activity } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useState, useRef, useEffect } from "react";

const Home = () => {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileDropdownRef = useRef(null);

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

  const handleLogout = () => {
    setIsProfileOpen(false);
    logout();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-indigo-500/30 overflow-x-hidden relative">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[1000px] overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-indigo-300/40 to-purple-300/40 blur-[120px] animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute top-[40%] -left-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-cyan-300/40 to-blue-300/40 blur-[120px] animate-[pulse_10s_ease-in-out_infinite_alternate]" />
        <div className="absolute -bottom-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-gradient-to-bl from-rose-200/30 to-orange-200/30 blur-[100px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 py-6 px-6 lg:px-12 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
              <span className="text-xl font-bold text-white tracking-widest">SC</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-800 bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-700">
                Smart Campus
              </span>
            </div>
        </div>
        <div className="flex gap-4 items-center">
            {user ? (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-full shadow-sm hover:shadow hover:border-slate-300 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 group"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border border-indigo-200 text-indigo-700 font-bold text-sm">
                     {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <ChevronDown size={14} className={`text-slate-500 group-hover:text-slate-700 transition-all duration-300 ${isProfileOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown Menu */}
                <div 
                  className={`absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_40px_rgb(0,0,0,0.08)] border border-slate-100 py-2 z-50 transform origin-top-right transition-all duration-200 ${
                    isProfileOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                  }`}
                >
                  <div className="px-4 py-3 border-b border-slate-100/80">
                    <p className="text-sm font-bold text-slate-800 truncate">{user.name || "User Account"}</p>
                    <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mt-1">{user.role || "STUDENT"}</p>
                  </div>
                  
                  <div className="px-2 py-2">
                    <Link to="/dashboard" onClick={() => setIsProfileOpen(false)} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl transition-all group">
                      <LayoutDashboard size={16} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                      Dashboard
                    </Link>
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
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-all group"
                    >
                      <LogOut size={16} className="text-rose-500 group-hover:text-rose-600 transition-colors" />
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Link to="/login">
                    <button className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors bg-white/50 hover:bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-full shadow-sm hover:shadow">
                      Sign In
                    </button>
                </Link>
                <Link to="/signup">
                    <button className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all rounded-full shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5">
                      Get Started
                    </button>
                </Link>
              </>
            )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-16 pb-24 flex flex-col items-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50/80 border border-indigo-100/80 backdrop-blur-sm mb-8 animate-[fade-in-down_1s_ease-out]">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-ping absolute"></span>
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 relative"></span>
            <span className="text-sm font-semibold text-indigo-700 uppercase tracking-wider">IT3030 Assignment Portal</span>
        </div>

        {/* Hero Typography */}
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto drop-shadow-sm mb-6">
          Next-Generation <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600">
            Campus Operations
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 font-medium max-w-2xl mx-auto mb-12 leading-relaxed">
          Centralize your facility management, asset tracking, and maintenance workflows into one intelligent platform. Let's make your campus smarter, together.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
          {user ? (
            <Link to="/dashboard" className="group w-full sm:w-auto">
              <button className="w-full relative inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all duration-300 bg-indigo-600 border border-transparent rounded-full shadow-xl shadow-indigo-600/30 hover:bg-indigo-500 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:shadow-indigo-600/50 focus:ring-indigo-600 active:scale-95 leading-none">
                <LayoutDashboard className="w-5 h-5 mr-2" />
                Go to Dashboard
                <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </Link>
          ) : (
            <>
              <Link to="/signup" className="group w-full sm:w-auto">
                <button className="w-full relative inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all duration-300 bg-indigo-600 border border-transparent rounded-full shadow-xl shadow-indigo-600/30 hover:bg-indigo-500 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:shadow-indigo-600/50 focus:ring-indigo-600 active:scale-95 leading-none">
                  Create an Account
                  <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </Link>

              <Link to="/login" className="w-full sm:w-auto">
                <button className="w-full inline-flex items-center justify-center px-8 py-4 text-base font-bold text-slate-700 transition-all duration-300 bg-white shadow-xl shadow-slate-200/50 border border-slate-100 rounded-full hover:bg-slate-50 hover:-translate-y-1 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-200 active:scale-95 leading-none group">
                   Login to Dashboard
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-24 w-full max-w-6xl mx-auto">
           {[
             { icon: Building2, title: "Facility Layout", desc: "Interactive mapping of all campus facilities and real-time room availability.", color: "text-blue-600", bg: "bg-blue-100/50" },
             { icon: ShieldCheck, title: "Secure Access", desc: "Role-based authentication & strict protocols for operations management.", color: "text-emerald-600", bg: "bg-emerald-100/50" },
             { icon: Zap, title: "Quick Workflows", desc: "Automate maintenance tickets and asset tracking perfectly.", color: "text-amber-600", bg: "bg-amber-100/50" },
             { icon: Users, title: "Collaboration", desc: "Seamless communication between students, staff, and campus managers.", color: "text-purple-600", bg: "bg-purple-100/50" },
           ].map((item, idx) => (
             <div key={idx} className="bg-white/60 backdrop-blur-xl border border-white/50 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all hover:-translate-y-1 group text-left">
                <div className={`w-12 h-12 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                   <item.icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{item.title}</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">{item.desc}</p>
             </div>
           ))}
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 bg-white relative z-10 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Streamline Every Operation</h2>
            <p className="text-lg text-slate-600">Our platform is designed to make campus management effortless, bridging the gap between administration and actual campus needs.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6 shadow-sm">
                <Database size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">1. Centralized Data</h3>
              <p className="text-slate-500 leading-relaxed">All your assets, users, and facilities are stored securely in one central unified database accessible anywhere.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-6 shadow-sm">
                <Activity size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">2. Live Tracking</h3>
              <p className="text-slate-500 leading-relaxed">Monitor maintenance requests, facility bookings, and asset conditions in real-time with visual dashboards.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 shadow-sm">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">3. Instant Resolution</h3>
              <p className="text-slate-500 leading-relaxed">Approve requests, assign tasks to maintenance staff, and resolve issues instantly with a few clicks.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
             <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                <span className="text-sm font-bold text-white">SC</span>
             </div>
             <span className="text-white font-semibold text-lg">Smart Campus Group</span>
          </div>
          <p className="text-sm">© 2026 Smart Campus Operations. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;

