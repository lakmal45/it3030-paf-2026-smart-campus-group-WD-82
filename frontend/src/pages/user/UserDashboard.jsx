const UserDashboard = () => {
  return (
    <div className="animate-fade-in-up">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Student Portal</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold text-slate-800">
            My Assignments
          </h3>
          <p className="mt-2 text-3xl font-bold text-indigo-600">4</p>
          <p className="text-sm text-slate-500 mt-1">Due this week</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold text-slate-800">
            Campus Facilities
          </h3>
          <button className="mt-4 w-full py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors font-medium">
            Book a Room
          </button>
        </div>
      </div>
    </div>
  );
};
export default UserDashboard;
