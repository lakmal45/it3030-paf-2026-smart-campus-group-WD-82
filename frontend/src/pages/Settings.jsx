import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  changePassword,
  deleteAccount,
  updateNotificationPrefs,
} from "../services/userService";
import {
  Lock,
  Trash2,
  Bell,
  BellRing,
  Sun,
  Moon,
  CheckCircle2,
  AlertTriangle,
  X,
  Loader2,
  KeyRound,
  Mail,
  Wrench,
} from "lucide-react";

/**
 * Settings page component: Handles user-specific configurations and security.
 */
const Settings = () => {
  const { user, setUser, logout } = useAuth();
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

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    email: user?.emailNotificationsEnabled ?? true,
    push: user?.pushNotificationsEnabled ?? true,
    maintenance: true,
  });
  // Per-key saving / feedback state
  const [notifSaving, setNotifSaving] = useState({});
  const [notifSuccess, setNotifSuccess] = useState({});
  const [notifError, setNotifError] = useState({});

  // Keep toggles in sync if the user object updates (e.g. after re-login)
  useEffect(() => {
    if (user) {
      setNotifications((prev) => ({
        ...prev,
        email: user.emailNotificationsEnabled ?? true,
        push: user.pushNotificationsEnabled ?? true,
      }));
    }
  }, [user]);

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
   * Handles toggling a notification preference.
   * For "email" and "push", persists the change to the backend.
   * Each key has its own independent saving/success/error state.
   */
  const handleNotificationToggle = async (key) => {
    const newValue = !notifications[key];
    setNotifications({ ...notifications, [key]: newValue });

    if (key === "email" || key === "push") {
      setNotifSaving((prev) => ({ ...prev, [key]: true }));
      setNotifSuccess((prev) => ({ ...prev, [key]: null }));
      setNotifError((prev) => ({ ...prev, [key]: null }));
      try {
        const updatedUser = await updateNotificationPrefs({
          [key === "email" ? "emailNotificationsEnabled" : "pushNotificationsEnabled"]: newValue,
        });
        // Sync context + localStorage so the value survives a page refresh
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        const label = key === "email" ? "Email" : "Push";
        setNotifSuccess((prev) => ({
          ...prev,
          [key]: newValue ? `${label} notifications enabled.` : `${label} notifications disabled.`,
        }));
        setTimeout(() => setNotifSuccess((prev) => ({ ...prev, [key]: null })), 3000);
      } catch (err) {
        // Revert toggle on failure
        setNotifications((prev) => ({ ...prev, [key]: !newValue }));
        setNotifError((prev) => ({
          ...prev,
          [key]: typeof err === "string" ? err : "Could not save preference.",
        }));
        setTimeout(() => setNotifError((prev) => ({ ...prev, [key]: null })), 4000);
      } finally {
        setNotifSaving((prev) => ({ ...prev, [key]: false }));
      }
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

          <div className="p-8 space-y-2">
            {[
              {
                id: "email",
                title: "Email Notifications",
                desc: "Receive ticket updates, comments, and bookings confirmations via email.",
                icon: <Mail size={15} className="text-indigo-400" />,
              },
              {
                id: "push",
                title: "Push Notifications",
                desc: "Get real-time browser alerts when there are important updates.",
                icon: <BellRing size={15} className="text-indigo-400" />,
              },
              {
                id: "maintenance",
                title: "Maintenance Alerts",
                desc: "Notify me about scheduled system maintenance and downtime.",
                icon: <Wrench size={15} className="text-indigo-400" />,
              },
            ].map((pref) => (
              <div
                key={pref.id}
                className="rounded-2xl hover:bg-slate-50 transition-colors group"
              >
                {/* Row */}
                <div className="flex justify-between items-center p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      {pref.icon}
                      <h4 className="font-bold text-slate-800">{pref.title}</h4>
                      {notifSaving[pref.id] && (
                        <span className="flex items-center gap-1 text-xs text-slate-400 ml-2">
                          <Loader2 size={12} className="animate-spin" />
                          Saving…
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {pref.desc}
                    </p>
                  </div>
                  <button
                    onClick={() => handleNotificationToggle(pref.id)}
                    disabled={notifSaving[pref.id]}
                    aria-pressed={notifications[pref.id]}
                    aria-label={`${pref.title} toggle`}
                    className={`w-12 h-6 rounded-full relative transition-all duration-300 disabled:opacity-60 ${
                      notifications[pref.id] ? "bg-indigo-600" : "bg-slate-200"
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${
                        notifications[pref.id] ? "left-7" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Per-row inline feedback */}
                {notifSuccess[pref.id] && (
                  <div className="mx-4 mb-3 px-3 py-2 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl flex items-center gap-2 text-xs animate-slide-up">
                    <CheckCircle2 size={13} />
                    <span className="font-medium">{notifSuccess[pref.id]}</span>
                  </div>
                )}
                {notifError[pref.id] && (
                  <div className="mx-4 mb-3 px-3 py-2 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl flex items-center gap-2 text-xs animate-slide-up">
                    <AlertTriangle size={13} />
                    <span className="font-medium">{notifError[pref.id]}</span>
                  </div>
                )}
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
