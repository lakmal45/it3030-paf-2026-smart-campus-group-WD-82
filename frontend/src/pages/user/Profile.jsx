import React from "react";
import { useAuth } from "../../context/AuthContext";
import { User, Mail, Shield, MapPin, Calendar, Edit2 } from "lucide-react";

/**
 * User Profile Page
 * Displays current user information from AuthContext
 */
const Profile = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="p-6 text-center text-slate-500">
        Please log in to view your profile.
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 animate-fade-in-up max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full bg-indigo-100 border-4 border-white shadow-lg flex items-center justify-center text-indigo-600">
            <User size={64} />
          </div>
          <button className="absolute bottom-1 right-1 p-2 bg-indigo-600 text-white rounded-full shadow-md hover:bg-indigo-700 transition-colors">
            <Edit2 size={16} />
          </button>
        </div>
        
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-slate-900">{user.username || user.name || "User Profile"}</h1>
          <p className="text-slate-500 font-medium">Student • Smart Campus Group</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
            <span className="flex items-center gap-1.5 text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              <Shield size={14} className="text-indigo-600" />
              {user.role?.replace('ROLE_', '') || 'USER'}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              <MapPin size={14} className="text-slate-500" />
              Main Campus
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            Personal Information
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-slate-50 rounded-lg text-slate-500">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</p>
                <p className="text-slate-700 font-medium">{user.email || "N/A"}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 bg-slate-50 rounded-lg text-slate-500">
                <Shield size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Account Role</p>
                <p className="text-slate-700 font-medium">{user.role || "USER"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-slate-50 rounded-lg text-slate-500">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Member Since</p>
                <p className="text-slate-700 font-medium">April 2024</p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Security/Status */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Account Status</h3>
          <div className="space-y-6">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-emerald-800">Verification Status</span>
                <span className="px-2 py-0.5 bg-emerald-200 text-emerald-800 text-[10px] font-bold uppercase rounded-full">Verified</span>
              </div>
              <p className="text-xs text-emerald-700">Your student identity has been successfully verified.</p>
            </div>

            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-indigo-800">Two-Factor Auth</span>
                <span className="px-2 py-0.5 bg-indigo-200 text-indigo-800 text-[10px] font-bold uppercase rounded-full">Enabled</span>
              </div>
              <p className="text-xs text-indigo-700">Your account is secured with a secondary verification layer.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
