import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import { Clock, MapPin, AlertCircle, ChevronRight, Filter } from "lucide-react";

/**
 * Renders a list of tickets as cards.
 * Accepts a generic fetch function so it can be reused for USER, ADMIN, and TECHNICIAN.
 */
const TicketList = ({ fetchTickets, title, showCreateButton = false, createPath = "", emptyMessage = "No tickets found." }) => {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [error, setError] = useState(null);

  const loadData = async (statusFilter = "", catFilter = "", prioFilter = "") => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await fetchTickets(statusFilter, catFilter, prioFilter);
      setTickets(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load tickets. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(filter, categoryFilter, priorityFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, categoryFilter, priorityFilter]);

  return (
    <div className="py-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
           <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">{title}</h1>
           <p className="text-slate-500 mt-1 text-sm">Track and manage service requests.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          
          <div className="relative flex-1 sm:flex-none">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full sm:w-40 pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none shadow-sm cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">▼</div>
          </div>

          <div className="relative flex-1 sm:flex-none">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full sm:w-40 pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none shadow-sm cursor-pointer"
            >
              <option value="">All Categories</option>
              <option value="ELECTRICAL">Electrical</option>
              <option value="PLUMBING">Plumbing</option>
              <option value="EQUIPMENT">Equipment</option>
              <option value="STRUCTURAL">Structural</option>
              <option value="OTHER">Other</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">▼</div>
          </div>

          <div className="relative flex-1 sm:flex-none">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full sm:w-40 pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none shadow-sm cursor-pointer"
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">▼</div>
          </div>

          {showCreateButton && (
            <Link
              to={createPath}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-indigo-200 whitespace-nowrap"
            >
              + New Ticket
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl mb-6 flex items-center gap-3">
          <AlertCircle size={20} /> <span className="font-medium text-sm">{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
           {[...Array(4)].map((_, i) => (
             <div key={i} className="h-32 bg-slate-100 rounded-2xl w-full"></div>
           ))}
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-3xl py-16 flex flex-col items-center justify-center text-center px-4">
           <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
             <Filter className="text-slate-300" size={24} />
           </div>
           <h3 className="text-lg font-bold text-slate-700 mb-1">No Tickets Found</h3>
           <p className="text-slate-500 text-sm max-w-sm">{emptyMessage}</p>
           {(filter || categoryFilter || priorityFilter) && (
             <button onClick={() => { setFilter(""); setCategoryFilter(""); setPriorityFilter(""); }} className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-700">
               Clear Filters
             </button>
           )}
        </div>
      ) : (
        <div className="grid gap-4">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              to={`./${ticket.id}`} // relative link works from parent path
              className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-5 hover:border-indigo-300 hover:shadow-md transition-all group"
            >
              <div className="flex gap-5 items-start">
                {/* ID & Priority Badge */}
                <div className="hidden sm:flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 shrink-0">
                   <span className="text-[10px] uppercase font-bold text-slate-400 mb-0.5 tracking-widest">ID</span>
                   <span className="text-sm font-black text-slate-700">{ticket.id}</span>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                    <span className="sm:hidden font-black text-slate-800">#{ticket.id}</span>
                    <span className={`px-2 py-0.5 rounded uppercase tracking-wider text-[10px] font-bold ${
                      ticket.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                      ticket.priority === 'HIGH' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 
                      ticket.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 
                      'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {ticket.priority} Priority
                    </span>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{ticket.category}</span>
                  </div>
                  
                  <h3 className="text-slate-800 font-bold sm:text-lg leading-tight mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">{ticket.description}</h3>
                  
                  <div className="flex flex-wrap gap-4 mt-2">
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                      <MapPin size={14} className="text-slate-400" /> {ticket.location}
                    </p>
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                      <Clock size={14} className="text-slate-400" /> {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between sm:justify-end gap-5 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                <div className="text-left sm:text-right">
                   <StatusBadge status={ticket.status} />
                   {ticket.assignedTechnicianName && (
                     <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mt-2">
                       Assigned: <span className="text-slate-600">{ticket.assignedTechnicianName}</span>
                     </p>
                   )}
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 text-slate-400 transition-colors border border-slate-100">
                  <ChevronRight size={18} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketList;
