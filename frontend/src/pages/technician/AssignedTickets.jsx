import React from "react";
import TicketList from "../../components/tickets/TicketList";
import ticketService from "../../services/ticketService";

/**
 * Technician view of tickets assigned to them, plus they can see all tickets if they filter.
 * For this view, we'll just show all tickets since TECHNICIAN gets all tickets from backend 
 * by default. The technician can update them.
 */
const AssignedTickets = () => {
  return (
    <div className="p-2 sm:p-6">
      <TicketList
        // The backend returns all tickets for TECHNICIAN role too
        fetchTickets={ticketService.getAll} 
        title="All Service Tickets"
        showCreateButton={false}
        emptyMessage="No tickets available."
      />
    </div>
  );
};

export default AssignedTickets;
