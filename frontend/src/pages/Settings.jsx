import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { changePassword, deleteAccount } from "../services/userService";
import {
  Lock,
  Trash2,
  Bell,
  Sun,
  Moon,
  CheckCircle2,
  AlertTriangle,
  X,
  Loader2,
  KeyRound,
} from "lucide-react";

/**
 * Settings page component: Handles user-specific configurations and security.
 */
const Settings = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Password state
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Mock settings state
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    maintenance: true,
  });

  const isGoogleUser = !user?.password;

  /**
   * Handles password change request.
   */
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await changePassword(passwordData.oldPassword, passwordData.newPassword);
      setSuccess("Password changed successfully!");
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles account deletion.
   */
  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await deleteAccount();
      logout();
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
          Account Settings
        </h1>
        <p className="text-slate-500 mt-1">
          Manage your security, notifications, and preferences.
        </p>
      </div>

      <div className="space-y-8">
        {/* Success/Error Alerts */}
        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl flex items-center gap-3 animate-slide-up">
            <CheckCircle2 size={18} />
            <span className="font-medium">{success}</span>
          </div>
        )}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl flex items-center gap-3 animate-slide-up">
            <AlertTriangle size={18} />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Password & Security */}
        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
              <Lock size={18} />
            </div>
            <h2 className="font-bold text-slate-800">Security & Sign-In</h2>
          </div>

          <div className="p-8">
            {isGoogleUser ? (
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm text-amber-500">
                  <KeyRound size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">
                    Google Authentication
                  </h3>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                    Your account is managed via Google Sign-In. Password
                    management is handled by your Google Account settings.
                  </p>
                  <button className="mt-4 text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider">
                    MANAGE GOOGLE ACCOUNT
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      required
                      value={passwordData.oldPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          oldPassword: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 transition-all border-none"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 transition-all border-none"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 transition-all border-none"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2 "
                >
                  {loading && <Loader2 className="animate-spin" size={18} />}
                  Update Password
                </button>
              </form>
            )}
          </div>
        </section>

        {/* Notifications */}
        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
              <Bell size={18} />
            </div>
            <h2 className="font-bold text-slate-800">
              Notification Preferences
            </h2>
          </div>

          <div className="p-8 space-y-4">
            {[
              {
                id: "email",
                title: "Email Notifications",
                desc: "Receive updates about your bookings and assignments via email.",
              },
              {
                id: "push",
                title: "Push Notifications",
                desc: "Get real-time browser alerts when there are important updates.",
              },
              {
                id: "maintenance",
                title: "Maintenance Alerts",
                desc: "Notify me about scheduled system maintenance and downtime.",
              },
            ].map((pref) => (
              <div
                key={pref.id}
                className="flex justify-between items-center p-4 rounded-2xl hover:bg-slate-50 transition-colors group"
              >
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800">{pref.title}</h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {pref.desc}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setNotifications({
                      ...notifications,
                      [pref.id]: !notifications[pref.id],
                    })
                  }
                  className={`w-12 h-6 rounded-full relative transition-all duration-300 ${notifications[pref.id] ? "bg-indigo-600" : "bg-slate-200"}`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${notifications[pref.id] ? "left-7" : "left-1"}`}
                  />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Danger Zone */}
        <section className="border-2 border-rose-100 rounded-3xl overflow-hidden bg-rose-50/30">
          <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex gap-5">
              <div className="mt-1 p-3 bg-white rounded-2xl text-rose-500 shadow-sm border border-rose-100">
                <Trash2 size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-rose-700">Danger Zone</h2>
                <p className="text-sm text-rose-600/80 mt-1 max-w-md font-medium">
                  Once you delete your account, there is no going back. Please
                  be certain before proceeding with this action.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-6 py-4 bg-rose-600 text-white font-bold rounded-2xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-200"
            >
              Delete My Account
            </button>
          </div>
        </section>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl animate-scale-up border border-slate-100">
            <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl w-fit mb-6">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800">
              Are you absolutely sure?
            </h3>
            <p className="text-slate-500 mt-3 leading-relaxed">
              This will permanently delete your account and all associated data.
              This action cannot be undone.
            </p>

            <div className="mt-10 flex gap-4">
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="flex-1 px-4 py-4 bg-rose-600 text-white font-bold rounded-2xl hover:bg-rose-700 transition-all"
              >
                {loading ? "Deleting..." : "Yes, Delete Account"}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading}
                className="flex-1 px-4 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
