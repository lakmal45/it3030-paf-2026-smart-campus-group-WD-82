import React, { useEffect, useState, useRef, useMemo } from "react";
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

  // ── Dropdown state ──────────────────────────────────────────────
  const [openDropdown, setOpenDropdown] = useState(null);

  // ── Add-user modal state ────────────────────────────────────────
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "USER" });
  const [addErrors, setAddErrors] = useState({});
  const [addLoading, setAddLoading] = useState(false);

  // ── Generated-password notification state ───────────────────────
  const [passwordNotif, setPasswordNotif] = useState(null);
  const [copied, setCopied] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdown((prev) => (prev !== null ? null : prev));
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

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

      setShowAddModal(false);
      setNewUser({ name: "", email: "", role: "USER" });
      setAddErrors({});

      setPasswordNotif({
        email: res.data.email,
        password: res.data.generatedPassword,
      });
      setCopied(false);

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
  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase());
      const matchesRole = filterRole === "All" || u.role === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [users, search, filterRole]);

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
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Password Notification Banner */}
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            User Management
          </h1>
          <p className="text-slate-500 text-sm mt-1.5 font-medium">
            {loading ? "Loading…" : `Managing ${users.length} total users`}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchUsers}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center gap-2 active:scale-95"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 2v6h-6"></path>
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
              <path d="M3 22v-6h6"></path>
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
            </svg>
            Refresh
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-200 flex items-center gap-2 active:scale-95"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add User
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-medium flex items-center gap-3">
          <span className="text-rose-500 bg-white rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-sm">
            !
          </span>
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-visible">
        {/* Search & Filter bar */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 bg-slate-50/50 rounded-t-2xl">
          <div className="relative flex-1">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all shadow-sm"
            />
          </div>
          <div className="relative min-w-[160px]">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none text-slate-700 font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all shadow-sm appearance-none cursor-pointer"
            >
              <option value="All">All Roles</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <svg
              className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium">Loading users…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-slate-300"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <p className="text-base font-semibold text-slate-600">
              No users found
            </p>
            <p className="text-sm mt-1">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-100 text-slate-500 text-xs uppercase tracking-widest">
                  <th className="p-5 font-bold">User Name</th>
                  <th className="p-5 font-bold">User Email</th>
                  <th className="p-5 font-bold">System Role</th>
                  <th className="p-5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => {
                  const uniqueKey = user.id ?? user.email;
                  const isSelf =
                    currentUser &&
                    (user.email === currentUser.email ||
                      (currentUser.id &&
                        user.id &&
                        user.id === currentUser.id));

                  return (
                    <tr
                      key={uniqueKey}
                      className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* User Name */}
                      <td className="p-5">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-sm">
                            {initials(user.name)}
                          </div>
                          <div>
                            <p className="text-slate-900 font-bold text-sm flex items-center gap-2 mb-0.5">
                              {user.name || "—"}
                              {isSelf && (
                                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-md tracking-widest uppercase">
                                  You
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* User Email */}
                      <td className="p-5">
                        <p className="text-slate-600 text-sm font-medium">
                          {user.email}
                        </p>
                      </td>

                      {/* Role */}
                      <td className="p-5">
                        <span
                          className={`px-3 py-1.5 rounded-lg text-[11px] uppercase tracking-wider font-bold border ${
                            roleBadge[user.role]
                              ? `${roleBadge[user.role]} border-${roleBadge[user.role].split("-")[1]}-200`
                              : "bg-slate-50 text-slate-600 border-slate-200"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-5 text-right whitespace-nowrap">
                        {isSelf ? (
                          <span
                            className="text-slate-300 text-xs italic select-none font-medium"
                            title="You cannot modify your own account"
                          >
                            — own account —
                          </span>
                        ) : (
                          <div
                            className="relative inline-block text-left"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() =>
                                setOpenDropdown(
                                  openDropdown === uniqueKey ? null : uniqueKey,
                                )
                              }
                              className={`p-2 rounded-xl transition-all ${
                                openDropdown === uniqueKey
                                  ? "bg-slate-200 text-slate-800"
                                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100 active:scale-95"
                              }`}
                              aria-label="Options"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <circle cx="12" cy="12" r="1.5"></circle>
                                <circle cx="12" cy="5" r="1.5"></circle>
                                <circle cx="12" cy="19" r="1.5"></circle>
                              </svg>
                            </button>

                            {/* Dropdown Menu */}
                            {openDropdown === uniqueKey && (
                              <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-slate-100 z-50 overflow-hidden animate-fade-in origin-top-right">
                                <div className="py-1">
                                  <button
                                    onClick={() => {
                                      setEditingUser(user);
                                      setPendingRole(user.role);
                                      setOpenDropdown(null);
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center gap-3"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <path d="M12 20h9"></path>
                                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                                    </svg>
                                    Edit Role
                                  </button>
                                  <div className="h-px bg-slate-50 my-1 mx-2"></div>
                                  <button
                                    onClick={() => {
                                      setDeleteId(user.id);
                                      setOpenDropdown(null);
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-3"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <polyline points="3 6 5 6 21 6"></polyline>
                                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                      <line
                                        x1="10"
                                        y1="11"
                                        x2="10"
                                        y2="17"
                                      ></line>
                                      <line
                                        x1="14"
                                        y1="11"
                                        x2="14"
                                        y2="17"
                                      ></line>
                                    </svg>
                                    Delete
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal &&
        createPortal(
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border border-slate-100 transform transition-all animate-slide-up">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <line x1="20" y1="8" x2="20" y2="14"></line>
                    <line x1="23" y1="11" x2="17" y2="11"></line>
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Add New User
                  </h2>
                  <p className="text-slate-500 text-xs mt-0.5 font-medium">
                    A secure password will be generated automatically
                  </p>
                </div>
              </div>

              {addErrors.general && (
                <div className="mb-5 p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm font-medium">
                  {addErrors.general}
                </div>
              )}

              <div className="space-y-5 mb-8">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="e.g. John Doe"
                    className={`w-full px-4 py-3 bg-slate-50/50 border rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all ${
                      addErrors.name
                        ? "border-rose-300 bg-rose-50/30"
                        : "border-slate-200"
                    }`}
                  />
                  {addErrors.name && (
                    <p className="text-rose-500 text-xs mt-1.5 font-medium">
                      {addErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser((p) => ({ ...p, email: e.target.value }))
                    }
                    placeholder="e.g. user@university.edu"
                    className={`w-full px-4 py-3 bg-slate-50/50 border rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all ${
                      addErrors.email
                        ? "border-rose-300 bg-rose-50/30"
                        : "border-slate-200"
                    }`}
                  />
                  {addErrors.email && (
                    <p className="text-rose-500 text-xs mt-1.5 font-medium">
                      {addErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Assign Role
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {ROLES.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setNewUser((p) => ({ ...p, role: r }))}
                        className={`px-4 py-3 rounded-xl border text-sm font-bold transition-all ${
                          newUser.role === r
                            ? "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm ring-2 ring-indigo-500/10"
                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewUser({ name: "", email: "", role: "USER" });
                    setAddErrors({});
                  }}
                  className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
                  disabled={addLoading}
                >
                  Cancel
                </button>
                <button
                  disabled={addLoading}
                  onClick={handleAddUser}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold disabled:opacity-50 transition-all shadow-md shadow-indigo-200 active:scale-95 flex items-center gap-2"
                >
                  {addLoading && (
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  )}
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
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border border-slate-100 transform transition-all animate-slide-up">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xl shadow-sm">
                  {initials(editingUser.name)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-0.5">
                    Edit User Role
                  </h2>
                  <p className="text-slate-500 text-sm font-medium">
                    {editingUser.email}
                  </p>
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                  Select New Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {ROLES.map((r) => (
                    <button
                      key={r}
                      onClick={() => setPendingRole(r)}
                      className={`px-4 py-3.5 rounded-xl border text-sm font-bold transition-all ${
                        pendingRole === r
                          ? "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm ring-2 ring-indigo-500/10"
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
                <button
                  onClick={() => setEditingUser(null)}
                  className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  disabled={actionLoading || pendingRole === editingUser.role}
                  onClick={handleRoleUpdate}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold disabled:opacity-50 transition-all shadow-md shadow-indigo-200 active:scale-95 flex items-center gap-2"
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
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-slate-100 transform transition-all animate-slide-up">
              <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 flex items-center justify-center mb-5 shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Delete User
              </h2>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium">
                Are you sure you want to delete this user? This action is
                permanent and{" "}
                <strong className="text-rose-600">cannot be undone</strong>.
              </p>
              <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
                <button
                  onClick={() => setDeleteId(null)}
                  className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  disabled={actionLoading}
                  onClick={() => handleDelete(deleteId)}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold disabled:opacity-50 transition-all shadow-md shadow-rose-200 active:scale-95 flex items-center gap-2"
                >
                  {actionLoading ? "Deleting..." : "Delete User"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Hardware Acceleration for Animations */}
      <style>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(100%) scale(0.95); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-slide-in {
          will-change: transform, opacity;
          animation: slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-in {
          will-change: opacity;
          animation: fade-in 0.15s ease-out forwards;
        }
        .animate-slide-up {
          will-change: transform, opacity;
          animation: slide-up 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default UserManagement;
