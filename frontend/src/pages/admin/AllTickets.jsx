import React from "react";
import TicketList from "../../components/tickets/TicketList";
import ticketService from "../../services/ticketService";

/**
 * Admin view of all tickets in the system.
 */
const AllTickets = () => {
  return (
    <div className="p-2 sm:p-6">
      <TicketList
        fetchTickets={ticketService.getAll}
        title="All Campus Tickets"
        showCreateButton={false}
        emptyMessage="No tickets have been reported yet."
      />
    </div>
  );
};

export default AllTickets;
