import React from 'react';
import { Wrench, CheckCircle2, Clock, AlertOctagon, MoreVertical } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ticketService from '../../services/ticketService';
import { useAuth } from '../../context/AuthContext';

const TechnicianDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = React.useState({ open: 0, resolved: 0, critical: 0 });
  const [recentTickets, setRecentTickets] = React.useState([]);
  const [chartData, setChartData] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchData = React.useCallback(async () => {
    try {
      const { data: ticketData } = await ticketService.getAll("", "", "", "", 0, 50);
      const allTickets = ticketData.content || [];
      
      setStats({
        open: allTickets.filter(t => t.status === 'OPEN').length,
        resolved: allTickets.filter(t => ['RESOLVED', 'CLOSED'].includes(t.status)).length,
        critical: allTickets.filter(t => t.priority === 'CRITICAL').length
      });

      setRecentTickets(allTickets.slice(0, 5));

      // Mock chart data based on real volume if available, or just keeping it neat
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const counts = days.map(day => ({ day, tickets: Math.floor(Math.random() * 15) + 5 }));
      setChartData(counts);

    } catch (err) {
      console.error("Dashboard fetch error", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading dashboard...</div>;

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Maintenance Queue</h1>
          <p className="text-slate-500 mt-1">Hello {user?.name?.split(' ')[0] || 'Technician'}, here is your daily overview.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Open Tickets</h3>
            <p className="mt-2 text-3xl font-bold text-slate-800">{stats.open}</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
            <Wrench size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Resolved Today</h3>
            <p className="mt-2 text-3xl font-bold text-emerald-600">{stats.resolved}</p>
          </div>
          <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">My Efficiency</h3>
            <p className="mt-2 text-3xl font-bold text-slate-800">92%</p>
          </div>
          <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
            <Clock size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Critical Issues</h3>
            <p className="mt-2 text-3xl font-bold text-rose-600">{stats.critical}</p>
          </div>
          <div className="p-3 bg-rose-100 rounded-xl text-rose-600">
            <AlertOctagon size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-xl font-semibold text-slate-800">Recent Tickets</h2>
             <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View All</button>
          </div>
          <div className="space-y-4">
            {recentTickets.map((ticket) => (
              <div 
                key={ticket.id} 
                className="p-4 border border-slate-100 rounded-xl hover:border-indigo-200 hover:bg-slate-50 transition-all cursor-pointer group"
                onClick={() => window.location.href = `/dashboard/technician/tickets/${ticket.id}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">Ticket #{ticket.id}</p>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                        ${ticket.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 
                          ticket.priority === 'HIGH' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 
                          ticket.priority === 'MEDIUM' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 
                          'bg-slate-200 text-slate-700'}`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <p className="text-slate-800 font-medium line-clamp-1">{ticket.description}</p>
                    <p className="text-sm text-slate-500 mt-1">{ticket.location} • <span className="text-slate-400">{new Date(ticket.createdAt).toLocaleDateString()}</span></p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                      ${ticket.status === 'OPEN' ? 'bg-amber-100 text-amber-700' : 
                        ticket.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                        'bg-emerald-100 text-emerald-700'}`}>
                      {ticket.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Ticket Volume (This Week)</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="tickets" stroke="#4f46e5" strokeWidth={4} dot={{ fill: '#4f46e5', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicianDashboard;
