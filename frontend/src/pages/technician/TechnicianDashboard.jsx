const TechnicianDashboard = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-6">
        Maintenance Queue
      </h1>
      <div className="space-y-4">
        {[1, 2, 3].map((ticket) => (
          <div
            key={ticket}
            className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center hover:border-indigo-300 transition-colors cursor-pointer"
          >
            <div>
              <p className="font-semibold text-slate-800">
                IT Ticket #{1020 + ticket}
              </p>
              <p className="text-sm text-slate-500">
                Projector malfunction in Hall C
              </p>
            </div>
            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
              Open
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
export default TechnicianDashboard;
