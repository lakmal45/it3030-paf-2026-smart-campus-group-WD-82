import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!localStorage.getItem("user")) {
      navigate("/login");
    }
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("user");
    window.location.href = "http://localhost:8081/logout";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center gap-3 cursor-pointer transition-transform duration-300 hover:scale-105">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                SC
              </div>
              <h1 className="text-xl font-extrabold text-slate-800 tracking-tight hidden sm:block">
                Smart Campus
              </h1>
            </div>
            <div>
              <button
                onClick={logout}
                className="inline-flex items-center px-5 py-2.5 border border-slate-200 text-sm font-semibold rounded-lg text-slate-600 bg-white hover:bg-slate-50 hover:text-red-600 hover:border-red-200 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-200 shadow-sm active:scale-95"
              >
                Sign Out
                <svg
                  className="ml-2 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8 animate-[fadeIn_0.5s_ease-out]">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-cyan-500 rounded-2xl shadow-lg p-8 text-white transform transition-all duration-300 hover:shadow-xl">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {user?.name?.split(" ")[0] || "User"}! 👋
          </h2>
          <p className="text-indigo-100 text-lg">
            Manage your campus bookings, assets, and incident reports from here.
          </p>
        </div>

        {/* Profile Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center transform transition-all duration-300 hover:-translate-y-1 hover:shadow-md group">
            <div className="h-20 w-20 rounded-full bg-indigo-50 border-4 border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {user?.name || "N/A"}
            </h3>
            <p className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full mt-2">
              {user?.role || "N/A"}
            </p>
          </div>

          <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transform transition-all duration-300 hover:shadow-md">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">
                Account Details
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              <div className="px-6 py-5 flex items-center justify-between group hover:bg-slate-50 transition-colors duration-200">
                <span className="text-sm font-semibold text-slate-500">
                  Email Address
                </span>
                <span className="text-sm font-medium text-slate-900">
                  {user?.email || "N/A"}
                </span>
              </div>
              <div className="px-6 py-5 flex items-center justify-between group hover:bg-slate-50 transition-colors duration-200">
                <span className="text-sm font-semibold text-slate-500">
                  Account Status
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse"></span>
                  Active
                </span>
              </div>
              <div className="px-6 py-5 flex items-center justify-between group hover:bg-slate-50 transition-colors duration-200">
                <span className="text-sm font-semibold text-slate-500">
                  Last Login
                </span>
                <span className="text-sm font-medium text-slate-900">
                  Just now
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
