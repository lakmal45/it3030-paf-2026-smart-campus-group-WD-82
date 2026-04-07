import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../services/userService";
import {
  Camera,
  User,
  Mail,
  Shield,
  Save,
  Edit2,
  X,
  Loader2,
} from "lucide-react";

/**
 * Profile page component: Displays and allows editing of user profile information.
 */
const Profile = () => {
  const { user, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: user?.name || "",
    profileImageUrl: user?.profileImageUrl || "",
  });

  /**
   * Handles profile update.
   */
  const handleUpdate = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const updatedUser = await updateProfile(formData);
      login(updatedUser); // Update context
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cancels editing mode and restores original data.
   */
  const cancelEdit = () => {
    setFormData({
      name: user?.name || "",
      profileImageUrl: user?.profileImageUrl || "",
    });
    setIsEditing(false);
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            Your Profile
          </h1>
          <p className="text-slate-500 mt-1">
            Manage your account information and how you appear to others.
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all shadow-sm group"
          >
            <Edit2
              size={16}
              className="text-slate-400 group-hover:text-indigo-600"
            />
            Edit Profile
          </button>
        )}
      </div>

      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl flex items-center gap-3 animate-slide-up">
          <div className="p-1 bg-emerald-500 rounded-full text-white">
            <Save size={14} />
          </div>
          <span className="font-medium">{success}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl flex items-center gap-3 animate-slide-up">
          <div className="p-1 bg-rose-500 rounded-full text-white">
            <X size={14} />
          </div>
          <span className="font-medium">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-8 flex flex-col items-center">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-4 border-slate-50 shadow-inner overflow-hidden bg-slate-100 flex items-center justify-center">
                {formData.profileImageUrl || user?.profileImageUrl ? (
                  <img
                    src={formData.profileImageUrl || user?.profileImageUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <User size={48} className="text-slate-300" />
                )}
              </div>
              {isEditing && (
                <label className="absolute bottom-1 right-1 p-2 bg-indigo-600 text-white rounded-full cursor-pointer hover:bg-indigo-700 transition-all shadow-lg ring-4 ring-white">
                  <Camera size={16} />
                  <input
                    type="text"
                    className="hidden"
                    placeholder="Image URL"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        profileImageUrl: e.target.value,
                      })
                    }
                  />
                </label>
              )}
            </div>
            <h2 className="mt-6 text-xl font-bold text-slate-800">
              {user?.name}
            </h2>
            <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mt-1 bg-indigo-50 px-3 py-1 rounded-full">
              {user?.role?.replace("ROLE_", "") || "STUDENT"}
            </p>

            <div className="w-full mt-8 space-y-4 pt-8 border-t border-slate-50">
              <div className="flex items-center gap-3 text-slate-600">
                <Mail size={16} className="text-slate-400" />
                <span className="text-sm font-medium">{user?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <Shield size={16} className="text-slate-400" />
                <span className="text-sm font-medium">
                  {user?.role} Permissions
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Account Details</h3>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Display Name
                </label>
                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all disabled:opacity-60 disabled:bg-slate-50/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ""}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50/30 border border-slate-100 rounded-2xl text-slate-400"
                  />
                </div>
                <p className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                  <Shield size={12} />
                  Email cannot be changed for security reasons.
                </p>
              </div>

              {isEditing && (
                <div className="flex items-center gap-4 pt-6 border-t border-slate-50">
                  <button
                    onClick={handleUpdate}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <Save size={18} />
                    )}
                    Save Profile Changes
                  </button>
                  <button
                    onClick={cancelEdit}
                    disabled={loading}
                    className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
