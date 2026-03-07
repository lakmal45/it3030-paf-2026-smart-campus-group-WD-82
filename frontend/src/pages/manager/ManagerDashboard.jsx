const ManagerDashboard = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-6">
        Operations Overview
      </h1>
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">
          Pending Approvals
        </h2>
        <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-200 rounded-xl">
          No pending approvals at this time.
        </div>
      </div>
    </div>
  );
};
export default ManagerDashboard;
