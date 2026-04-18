import React, { useState } from "react";
import TicketList from "../../components/tickets/TicketList";
import ticketService from "../../services/ticketService";
import { Download, FileSpreadsheet, RefreshCw } from "lucide-react";

/**
 * Admin view of all tickets in the system.
 * Enhanced with CSV data export for reporting.
 */
const AllTickets = () => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      // Fetch all tickets for export (ignoring pagination for full report)
      const { data } = await ticketService.getAll("", "", "", "", 0, 1000);
      const tickets = data.content || [];
      
      if (tickets.length === 0) {
        alert("No tickets to export.");
        return;
      }

      // Define CSV headers
      const headers = ["ID", "Reporter", "Location", "Category", "Priority", "Status", "Created At", "Description"];
      const rows = tickets.map(t => [
        t.id,
        t.createdByName || t.createdByEmail,
        `"${t.location.replace(/"/g, '""')}"`,
        t.category,
        t.priority,
        t.status,
        new Date(t.createdAt).toLocaleString(),
        `"${t.description.replace(/"/g, '""')}"`
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map(r => r.join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `campus_tickets_export_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export failed", err);
      alert("Failed to export data.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-2 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Fleet Management</h1>
          <p className="text-slate-500 mt-1 font-medium">Global overview of all campus maintenance incidents.</p>
        </div>
        
        <button
          onClick={handleExportCSV}
          disabled={isExporting}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-emerald-200 disabled:opacity-50"
        >
          {isExporting ? <RefreshCw className="animate-spin" size={16} /> : <FileSpreadsheet size={16} />}
          {isExporting ? "Generating..." : "Export to CSV"}
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 border border-slate-100 shadow-xl shadow-slate-200/40">
        <TicketList
          fetchTickets={ticketService.getAll}
          title="All Campus Tickets"
          showCreateButton={false}
          emptyMessage="No tickets have been reported yet."
        />
      </div>
    </div>
  );
};

export default AllTickets;
