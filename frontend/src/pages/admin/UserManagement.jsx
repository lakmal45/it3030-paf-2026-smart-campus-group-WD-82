import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const ROLES = ["USER", "ADMIN", "MANAGER", "TECHNICIAN"];

const roleBadge = {
  ADMIN: "bg-violet-100 text-violet-700",
  MANAGER: "bg-blue-100 text-blue-700",
  TECHNICIAN: "bg-amber-100 text-amber-700",
  USER: "bg-slate-100 text-slate-600",
};

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [editingUser, setEditingUser] = useState(null);
  const [pendingRole, setPendingRole] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // ── Add-user modal state ────────────────────────────────────────
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "USER" });
  const [addErrors, setAddErrors] = useState({});
  const [addLoading, setAddLoading] = useState(false);

  // ── Generated-password notification state ───────────────────────
  const [passwordNotif, setPasswordNotif] = useState(null); // { email, password }
  const [copied, setCopied] = useState(false);

  // ── Fetch all users ──────────────────────────────────────────────
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      setError(
        err.response?.status === 403
          ? "Access denied. Admin privileges required."
          : "Failed to load users. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ── Role update ──────────────────────────────────────────────────
  const handleRoleUpdate = async () => {
    if (!editingUser) return;
    try {
      setActionLoading(true);
      await api.put(`/admin/users/${editingUser.id}/role?role=${pendingRole}`);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id ? { ...u, role: pendingRole } : u,
        ),
      );
      setEditingUser(null);
    } catch {
      alert("Failed to update role. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Delete user ──────────────────────────────────────────────────
  const handleDelete = async (userId) => {
    try {
      setActionLoading(true);
      await api.delete(`/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setDeleteId(null);
    } catch {
      alert("Failed to delete user. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Add user ─────────────────────────────────────────────────────
  const validateAddForm = () => {
    const errs = {};
    if (!newUser.name.trim()) errs.name = "Name is required";
    if (!newUser.email.trim()) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
      errs.email = "Please enter a valid email address";
    }
    setAddErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddUser = async () => {
    if (!validateAddForm()) return;
    try {
      setAddLoading(true);
      const res = await api.post("/admin/users", {
        name: newUser.name.trim(),
        email: newUser.email.trim(),
        role: newUser.role,
      });

      // Close modal, reset form
      setShowAddModal(false);
      setNewUser({ name: "", email: "", role: "USER" });
      setAddErrors({});

      // Show password notification
      setPasswordNotif({
        email: res.data.email,
        password: res.data.generatedPassword,
      });
      setCopied(false);

      // Refresh user list
      fetchUsers();
    } catch (err) {
      if (err.response?.status === 409) {
        setAddErrors({ email: "A user with this email already exists" });
      } else {
        setAddErrors({
          general:
            err.response?.data?.message ||
            "Failed to create user. Please try again.",
        });
      }
    } finally {
      setAddLoading(false);
    }
  };

  const handleCopyPassword = () => {
    if (passwordNotif?.password) {
      navigator.clipboard.writeText(passwordNotif.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ── Filtering ────────────────────────────────────────────────────
  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === "All" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // ── Avatar initials ──────────────────────────────────────────────
  const initials = (name) =>
    name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "?";

  return (
    <div className="p-6">
      {/* ── Password Notification Banner ──────────────────────────── */}
      {passwordNotif &&
        createPortal(
          <div className="fixed top-6 right-6 z-[9999] w-full max-w-md animate-slide-in">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl shadow-2xl shadow-emerald-100/60 p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 text-lg">
                  🔑
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-emerald-800 mb-1">
                    User Created Successfully!
                  </h3>
                  <p className="text-xs text-emerald-600 mb-3">
                    A temporary password has been generated for{" "}
                    <strong>{passwordNotif.email}</strong>. Please share this
                    password with the user securely.
                  </p>

                  {/* Password display box */}
                  <div className="bg-white border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
                    <code className="flex-1 text-base font-mono font-bold text-slate-800 tracking-wider select-all">
                      {passwordNotif.password}
                    </code>
                    <button
                      onClick={handleCopyPassword}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        copied
                          ? "bg-emerald-500 text-white"
                          : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                      }`}
                    >
                      {copied ? "✓ Copied" : "Copy"}
                    </button>
                  </div>

                  <p className="text-[11px] text-amber-600 mt-2 font-medium">
                    ⚠ This password will not be shown again. Make sure to note
                    it down before closing.
                  </p>
                </div>
                <button
                  onClick={() => setPasswordNotif(null)}
                  className="text-slate-400 hover:text-slate-600 text-lg leading-none p-1"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
          <p className="text-slate-500 text-sm mt-1">
            {loading ? "Loading…" : `${users.length} total users`}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center gap-2 active:scale-95"
          >
            <span className="text-lg leading-none">+</span> Add User
          </button>
          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-sm font-semibold transition-colors shadow-sm flex items-center gap-2"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Search & Filter bar */}
        <div className="p-4 border-b border-slate-100 flex gap-4 bg-slate-50/50">
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
          />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none text-slate-600"
          >
            <option value="All">All Roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3" />
            <p className="text-sm">Loading users…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <p className="text-2xl mb-2">👤</p>
            <p className="text-sm font-medium">No users found</p>
            <p className="text-xs mt-1">Try adjusting your search or filter</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">User</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => {
                // Match by email (works for all login methods incl. Google OAuth)
                // Fall back to id comparison only when both sides have an id
                const isSelf =
                  currentUser &&
                  (user.email === currentUser.email ||
                    (currentUser.id && user.id && user.id === currentUser.id));

                return (
                  <tr
                    key={user.id ?? user.email}
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                  >
                    {/* User info */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {initials(user.name)}
                        </div>
                        <div>
                          <p className="text-slate-800 font-semibold text-sm flex items-center gap-2">
                            {user.name || "—"}
                            {isSelf && (
                              <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-600 text-[10px] font-bold rounded-md tracking-wide">
                                You
                              </span>
                            )}
                          </p>
                          <p className="text-slate-500 text-xs">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          roleBadge[user.role] ?? "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right whitespace-nowrap">
                      {isSelf ? (
                        <span
                          className="text-slate-300 text-xs italic select-none"
                          title="You cannot modify your own account"
                        >
                          — own account —
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setPendingRole(user.role);
                            }}
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mr-4"
                          >
                            Edit Role
                          </button>
                          <button
                            onClick={() => setDeleteId(user.id)}
                            className="text-rose-500 hover:text-rose-700 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Add User Modal ──────────────────────────────────────────── */}
      {showAddModal &&
        createPortal(
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4 border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl">
                  👤
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Add New User
                  </h2>
                  <p className="text-slate-500 text-xs">
                    A random password will be generated automatically
                  </p>
                </div>
              </div>

              {/* General error */}
              {addErrors.general && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm">
                  {addErrors.general}
                </div>
              )}

              {/* Name field */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g. John Doe"
                  className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 ${
                    addErrors.name
                      ? "border-rose-300 bg-rose-50/30"
                      : "border-slate-200"
                  }`}
                />
                {addErrors.name && (
                  <p className="text-rose-500 text-xs mt-1">{addErrors.name}</p>
                )}
              </div>

              {/* Email field */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser((p) => ({ ...p, email: e.target.value }))
                  }
                  placeholder="e.g. user@university.edu"
                  className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 ${
                    addErrors.email
                      ? "border-rose-300 bg-rose-50/30"
                      : "border-slate-200"
                  }`}
                />
                {addErrors.email && (
                  <p className="text-rose-500 text-xs mt-1">
                    {addErrors.email}
                  </p>
                )}
              </div>

              {/* Role selection */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Assign Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {ROLES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setNewUser((p) => ({ ...p, role: r }))}
                      className={`px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
                        newUser.role === r
                          ? "bg-indigo-50 border-indigo-500 text-indigo-700 ring-2 ring-indigo-500/10"
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewUser({ name: "", email: "", role: "USER" });
                    setAddErrors({});
                  }}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
                  disabled={addLoading}
                >
                  Cancel
                </button>
                <button
                  disabled={addLoading}
                  onClick={handleAddUser}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-all shadow-md shadow-indigo-200 active:scale-95"
                >
                  {addLoading ? "Creating…" : "Create User"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Edit Role Modal */}
      {editingUser &&
        createPortal(
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4 border border-slate-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
                  {initials(editingUser.name)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Edit User Role
                  </h2>
                  <p className="text-slate-500 text-sm">{editingUser.email}</p>
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Select New Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {ROLES.map((r) => (
                    <button
                      key={r}
                      onClick={() => setPendingRole(r)}
                      className={`px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
                        pendingRole === r
                          ? "bg-indigo-50 border-indigo-500 text-indigo-700 ring-2 ring-indigo-500/10"
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  disabled={actionLoading}
                  onClick={handleRoleUpdate}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-all shadow-md shadow-indigo-200 active:scale-95"
                >
                  {actionLoading ? "Saving..." : "Update Role"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Delete confirmation modal */}
      {deleteId &&
        createPortal(
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-4 text-xl">
                ⚠️
              </div>
              <h2 className="text-lg font-bold text-slate-800 mb-2">
                Delete User
              </h2>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                Are you sure you want to delete this user? This action is
                permanent and cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteId(null)}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  disabled={actionLoading}
                  onClick={() => handleDelete(deleteId)}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-all shadow-md shadow-rose-200 active:scale-95"
                >
                  {actionLoading ? "Deleting..." : "Delete User"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Slide-in animation style */}
      <style>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(100%) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default UserManagement;
