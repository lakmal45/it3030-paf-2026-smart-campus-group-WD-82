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
        // Now filtered by the backend to only show tickets assigned to this technician
        fetchTickets={ticketService.getAll} 
        title="My Assigned Tickets"
        showCreateButton={false}
        emptyMessage="No tickets assigned to you."
      />
    </div>
  );
};

export default AssignedTickets;
