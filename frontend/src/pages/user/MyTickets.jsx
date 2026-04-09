import React from "react";
import TicketList from "../../components/tickets/TicketList";
import ticketService from "../../services/ticketService";

/**
 * User view of their own tickets.
 */
const MyTickets = () => {
  return (
    <div className="p-2 sm:p-6">
      <TicketList
        fetchTickets={ticketService.getAll} // Backend filters by currentUser if role is USER
        title="My IT Tickets"
        showCreateButton={true}
        createPath="/dashboard/user/tickets/new"
        emptyMessage="You haven't reported any tickets yet."
      />
    </div>
  );
};

export default MyTickets;
