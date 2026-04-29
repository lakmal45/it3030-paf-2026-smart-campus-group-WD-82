import React, { useState, useEffect } from "react";
import TicketList from "../../components/tickets/TicketList";
import ticketService from "../../services/ticketService";
import { Wrench, Clock, AlertCircle, CheckCircle2, LayoutGrid, Zap } from "lucide-react";

/**
 * Technician view of tickets assigned to them.
 * Enhanced for high productivity with premium stats UI and priority focus.
 */
const AssignedTickets = () => {
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0 });

  // Simple stats fetch for the sidebar
  const fetchStats = async () => {
    try {
      const { data } = await ticketService.getAll("", "", "", "", 0, 100);
      const tickets = data.content || [];
      setStats({
        total:      tickets.length,
        open:       tickets.filter(t => t.status === 'OPEN').length,
        inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
        resolved:   tickets.filter(t => ['RESOLVED','CLOSED'].includes(t.status)).length
      });
    } catch (err) {
      console.error("Failed to fetch tech stats", err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-[90rem] mx-auto animate-fade-in-up">
      <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">
        
        {/* Main Workspace */}
        <div className="flex-1 min-w-0">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center shadow-inner border border-indigo-100">
                <LayoutGrid className="text-indigo-600" size={24} />
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                Technician Workspace
              </span>
            </h1>
            <p className="text-slate-500 mt-3 font-medium text-lg ml-1">Resolve campus incidents with precision and speed.</p>
          </div>

          <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:shadow-2xl transition-shadow duration-500">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-30 -mr-20 -mt-20 pointer-events-none" />
            <div className="relative z-10">
              <TicketList
                fetchTickets={ticketService.getAll} 
                title="My Active Queue"
                showCreateButton={false}
                emptyMessage="You have no tickets assigned right now. Enjoy the breather!"
              />
            </div>
          </div>
        </div>

        {/* Productivity Sidebar */}
        <div className="w-full lg:w-80 space-y-6 shrink-0 lg:pt-24 hidden lg:block">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:shadow-2xl transition-shadow duration-500">
            
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-[40px] opacity-60 pointer-events-none" />

            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-8 flex items-center gap-2">
              <Wrench size={14} className="text-indigo-500" /> Workload Summary
            </h3>
            
            <div className="space-y-8 relative z-10">
              {/* Stat Row */}
              <div className="flex items-center justify-between group cursor-default">
                <div>
                  <p className="text-3xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{stats.total}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total Assigned</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-indigo-50 transition-colors">
                   <Clock size={20} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                </div>
              </div>

              {/* Stat Row */}
              <div className="flex items-center justify-between group cursor-default border-t border-slate-100 pt-6">
                <div>
                  <p className="text-3xl font-black text-amber-500 group-hover:text-amber-600 transition-colors">{stats.open}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Awaiting Start</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-100 group-hover:bg-amber-100 transition-colors">
                   <AlertCircle size={20} className="text-amber-500" />
                </div>
              </div>

              {/* Stat Row */}
              <div className="flex items-center justify-between group cursor-default border-t border-slate-100 pt-6">
                <div>
                  <p className="text-3xl font-black text-emerald-500 group-hover:text-emerald-600 transition-colors">{stats.resolved}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Resolved Today</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100 group-hover:bg-emerald-100 transition-colors">
                   <CheckCircle2 size={20} className="text-emerald-500" />
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 relative z-10">
               <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-100 text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-2 flex justify-center items-center gap-1.5">
                    <Zap size={14} className="text-amber-500 fill-amber-500" /> Focus Mode
                  </p>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">Resolving critical issues first drastically improves campus uptime metrics.</p>
               </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:shadow-2xl transition-shadow duration-500">
             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-5 text-center">Pro Tips</h3>
             <ul className="space-y-4">
                <li className="flex gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors cursor-pointer">
                   <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0 group-hover:scale-125 transition-transform" />
                   <p className="text-[13px] text-slate-600 font-medium leading-relaxed">Always attach complete resolution notes before closing a task.</p>
                </li>
                <li className="flex gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors cursor-pointer">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0 group-hover:scale-125 transition-transform" />
                   <p className="text-[13px] text-slate-600 font-medium leading-relaxed">Interact using comments to request more info from students.</p>
                </li>
             </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AssignedTickets;
