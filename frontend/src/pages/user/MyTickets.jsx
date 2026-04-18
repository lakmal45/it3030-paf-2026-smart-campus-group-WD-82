import React, { useState } from "react";
import TicketList from "../../components/tickets/TicketList";
import ticketService from "../../services/ticketService";
import { Clock, CheckCircle2, Inbox, Plus, RefreshCw } from "lucide-react";

/**
 * User view of their own tickets.
 * Enhanced with status tabs for a more "premium" dashboard feel.
 */
const MyTickets = () => {
  const [activeTab, setActiveTab] = useState("ALL");

  const tabs = [
    { id: "ALL", label: "All Tickets", icon: Inbox, color: "text-slate-500", bg: "bg-slate-50" },
    { id: "OPEN", label: "Active", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { id: "RESOLVED", label: "Resolved", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <div className="p-2 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Support Workspace</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage and monitor your campus service requests.</p>
        </div>
      </div>

      {/* Modern Status Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-100/50 p-1.5 rounded-2xl w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all
                ${isActive 
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                }
              `}
            >
              <Icon size={16} className={isActive ? tab.color : "text-slate-400"} />
              {tab.label}
              {isActive && (
                <span className={`ml-1 w-2 h-2 rounded-full ${tab.bg.replace('bg-', 'bg-').replace('50', '500')}`}></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Ticket List Wrapper */}
      <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-sm shadow-slate-200/50">
        <TicketList
          key={activeTab} // Force re-mount when tab changes for clean state
          fetchTickets={(status, cat, prio, keyword, page, size) => 
            ticketService.getAll(activeTab === "ALL" ? status : activeTab, cat, prio, keyword, page, size)
          }
          title={tabs.find(t => t.id === activeTab)?.label}
          showCreateButton={true}
          createPath="/dashboard/user/tickets/new"
          emptyMessage={
            activeTab === "RESOLVED" 
              ? "You don't have any resolved tickets yet." 
              : activeTab === "OPEN" 
                ? "You don't have any active support requests." 
                : "You haven't reported any tickets yet. Click 'New Ticket' to start."
          }
        />
      </div>
    </div>
  );
};

export default MyTickets;
