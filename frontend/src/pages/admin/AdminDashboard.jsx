const AdminDashboard = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-6">
        System Administration
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            Total Users
          </h3>
          <p className="mt-2 text-3xl font-bold text-emerald-600">1,248</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            System Health
          </h3>
          <p className="mt-2 text-3xl font-bold text-indigo-600">99.9%</p>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;
