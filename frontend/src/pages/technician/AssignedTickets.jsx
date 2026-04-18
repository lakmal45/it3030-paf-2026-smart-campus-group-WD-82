import React, { useState, useEffect } from "react";
import TicketList from "../../components/tickets/TicketList";
import ticketService from "../../services/ticketService";
import { Wrench, Clock, AlertCircle, CheckCircle2, LayoutGrid } from "lucide-react";

/**
 * Technician view of tickets assigned to them.
 * Enhanced for high productivity with quick stats and priority focus.
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
    <div className="p-2 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Main Workspace */}
        <div className="flex-1 min-w-0">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <LayoutGrid className="text-indigo-600" />
              Technician Workspace
            </h1>
            <p className="text-slate-500 mt-2 font-medium">Resolving campus incidents with efficiency.</p>
          </div>

          <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 border border-slate-100 shadow-xl shadow-slate-200/40">
            <TicketList
              fetchTickets={ticketService.getAll} 
              title="My Assigned Tickets"
              showCreateButton={false}
              emptyMessage="You have no tickets assigned to you right now. Great job!"
            />
          </div>
        </div>

        {/* Productivity Sidebar */}
        <div className="w-full lg:w-72 space-y-6 shrink-0 pt-20">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-900/20">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
              <Wrench size={14} className="text-indigo-400" /> Workload Summary
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-black text-white">{stats.total}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Assigned</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                   <Clock size={18} className="text-slate-300" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-black text-amber-400">{stats.open}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Awaiting Start</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-amber-400/10 flex items-center justify-center">
                   <AlertCircle size={18} className="text-amber-400" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-black text-emerald-400">{stats.resolved}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resolved Today</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-400/10 flex items-center justify-center">
                   <CheckCircle2 size={18} className="text-emerald-400" />
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/10">
               <div className="bg-indigo-600/20 rounded-2xl p-4 border border-indigo-500/30 text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-1">Focus Mode</p>
                  <p className="text-xs text-indigo-100/70 leading-relaxed font-medium">Resolving critical issues first improves campus uptime.</p>
               </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
             <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 text-center">Quick Tips</h3>
             <ul className="space-y-4">
                <li className="flex gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                   <p className="text-xs text-slate-600 font-medium">Always add resolution notes before closing.</p>
                </li>
                <li className="flex gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                   <p className="text-xs text-slate-600 font-medium">Use comments to ask student for more info.</p>
                </li>
             </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AssignedTickets;
