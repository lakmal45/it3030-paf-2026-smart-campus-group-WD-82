import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ticketService from "../../services/ticketService";
import { useAuth } from "../../context/AuthContext";
import StatusBadge from "./StatusBadge";
import CommentSection from "./CommentSection";
import { ArrowLeft, Clock, MapPin, User, Tag, Key, CheckCircle2, AlertCircle, Wrench, Calendar, Trash2, Image as ImageIcon, Pencil } from "lucide-react";

/**
 * Simple in-memory cache for ticket details to provide instant loading on return.
 */
const detailsCache = {};

/**
 * Renders full ticket details. Used by User, Admin, and Technician.
 * Includes admin/technician controls if the user has correct roles.
 */
const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [ticket, setTicket] = useState(detailsCache[id] || null);
  const [isLoading, setIsLoading] = useState(!detailsCache[id]);
  const [error, setError] = useState(null);
  
  // Status update state
  const [newStatus, setNewStatus] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Assign technician state (ADMIN only)
  const [technicians, setTechnicians] = useState([]);
  const [technicianId, setTechnicianId] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTicket = useCallback(async () => {
    try {
      const { data } = await ticketService.getById(id);
      setTicket(data);
      setNewStatus(data.status);
      detailsCache[id] = data; // Update cache
    } catch (err) {
      console.error(err);
      setError("Failed to load ticket details.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const fetchTechnicians = useCallback(async () => {
    if (user?.role !== "ADMIN") return;
    try {
      const { data } = await ticketService.getTechnicians();
      setTechnicians(data);
    } catch (err) {
      console.error("Failed to load technicians", err);
    }
  }, [user?.role]);

  useEffect(() => {
    fetchTicket();
    fetchTechnicians();
  }, [fetchTicket, fetchTechnicians]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setIsUpdatingStatus(true);
    try {
      await ticketService.updateStatus(id, newStatus, resolutionNotes);
      await fetchTicket();
      // Only clear notes if successfully moved to resolved/closed
      if (newStatus === "RESOLVED" || newStatus === "CLOSED") {
         setResolutionNotes("");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!technicianId.trim()) return;
    setIsAssigning(true);
    try {
      await ticketService.assign(id, parseInt(technicianId, 10));
      setTechnicianId("");
      await fetchTicket();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to assign technician");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this ticket? This action cannot be undone.")) return;
    
    setIsDeleting(true);
    try {
      await ticketService.deleteTicket(id);
      navigate(-1);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete ticket");
      setIsDeleting(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500 animate-pulse">Loading ticket details...</div>;
  if (error) return <div className="p-8 text-center text-rose-500">{error}</div>;
  if (!ticket) return null;

  const role = user?.role || "USER";
  const isAdmin = role === "ADMIN";
  const isTechnician = role === "TECHNICIAN";
  const canUpdateStatus = isAdmin || isTechnician;

  // The baseUrl for uploaded files. Assuming Spring Boot runs on 8081 and serves static content.
  // We'll just construct the full URL.
  const API_BASE = "http://localhost:8081/";

  return (
    <div className="max-w-5xl mx-auto py-6 pb-20">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-6"
      >
        <ArrowLeft size={16} /> Back to List
      </button>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          
          {/* Header Card */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden">
             <div className={`absolute top-0 left-0 w-1.5 h-full ${
                ticket.priority === 'CRITICAL' ? 'bg-rose-500' :
                ticket.priority === 'HIGH' ? 'bg-orange-500' :
                ticket.priority === 'MEDIUM' ? 'bg-amber-500' : 'bg-slate-300'
             }`}></div>

             <div className="flex justify-between items-start mb-6">
               <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl font-black text-slate-800">#{ticket.id}</span>
                    <StatusBadge status={ticket.status} />
                  </div>
                  <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-snug">{ticket.description}</h1>
               </div>

                {(isAdmin || (ticket.status === 'OPEN' && ticket.createdById === user?.id)) && (
                   <button
                     onClick={() => navigate(`./edit`)}
                     className="p-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl transition-all border border-indigo-100 flex items-center gap-2 font-bold text-sm"
                   >
                     <Pencil size={16} /> Edit
                   </button>
                )}
             </div>

             <div className="flex flex-wrap gap-y-4 gap-x-8 pb-6 border-b border-slate-100">
                <div className="flex items-start gap-3">
                   <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                     <MapPin size={18} />
                   </div>
                   <div>
                     <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Location</p>
                     <p className="text-sm font-semibold text-slate-700">{ticket.location}</p>
                   </div>
                </div>
                <div className="flex items-start gap-3">
                   <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                     <Tag size={18} />
                   </div>
                   <div>
                     <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Category</p>
                     <p className="text-sm font-semibold text-slate-700">{ticket.category}</p>
                   </div>
                </div>
                {ticket.resourceId && (
                <div className="flex items-start gap-3">
                   <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                     <Key size={18} />
                   </div>
                   <div>
                     <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Resource ID</p>
                     <p className="text-sm font-semibold text-slate-700">{ticket.resourceId}</p>
                   </div>
                </div>
                )}
             </div>

             <div className="mt-6 flex flex-wrap gap-8">
                <div>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Reporter</p>
                   <div className="flex items-center gap-2">
                     <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs border border-slate-200">
                       {ticket.createdByName ? ticket.createdByName.charAt(0) : "U"}
                     </div>
                     <div>
                       <p className="text-sm font-semibold text-slate-700">{ticket.createdByName}</p>
                       <p className="text-xs text-slate-500">{ticket.createdByEmail}</p>
                     </div>
                   </div>
                   {ticket.preferredContact && (
                     <p className="text-xs text-slate-500 mt-2 flex gap-1"><span className="font-semibold text-slate-600">Contact:</span> {ticket.preferredContact}</p>
                   )}
                </div>

                <div>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Timeline</p>
                   <div className="space-y-1.5">
                     <p className="text-xs text-slate-600 flex items-center gap-2">
                       <Calendar size={14} className="text-slate-400" /> 
                       Created: <span className="font-medium">{new Date(ticket.createdAt).toLocaleString()}</span>
                     </p>
                     <p className="text-xs text-slate-600 flex items-center gap-2">
                       <Clock size={14} className="text-slate-400" /> 
                       Updated: <span className="font-medium">{new Date(ticket.updatedAt).toLocaleString()}</span>
                     </p>
                   </div>
                </div>
             </div>
          </div>

          {/* Attachments */}
          {ticket.imageUrls && ticket.imageUrls.length > 0 && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                <ImageIcon size={18} className="text-slate-400" /> Attachments
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {ticket.imageUrls.map((url, i) => {
                  const isAbsolute = url.startsWith("http");
                  const fullUrl = isAbsolute ? url : API_BASE + url;
                  
                  return (
                    <a key={i} href={fullUrl} target="_blank" rel="noreferrer" className="block relative aspect-video rounded-xl overflow-hidden border border-slate-200 group bg-slate-50">
                       <img 
                         src={fullUrl} 
                         alt={`Attachment ${i}`}
                         loading="lazy"
                         className="w-full h-full object-cover px-1"
                         onError={(e) => { e.target.src = "https://placehold.co/300?text=Image+Not+Found" }}
                       />
                       <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <span className="text-white text-xs font-bold tracking-wider uppercase">View Full</span>
                       </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Resolution Notes */}
          {ticket.resolutionNotes && (
             <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100">
               <h3 className="text-emerald-800 font-bold mb-2 flex items-center gap-2">
                 <CheckCircle2 size={18} className="text-emerald-600" /> Resolution Notes
               </h3>
               <p className="text-sm text-emerald-900/80 whitespace-pre-wrap">{ticket.resolutionNotes}</p>
             </div>
          )}

          {/* Comments */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
             <CommentSection ticketId={ticket.id} currentUser={user} />
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="w-full md:w-80 space-y-6 shrink-0">
          
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
             <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
               <Wrench size={16} className="text-slate-400" /> Assignment
             </h3>
             {ticket.assignedTechnicianName ? (
               <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                 <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold font-lg shrink-0">
                   {ticket.assignedTechnicianName.charAt(0)}
                 </div>
                 <div>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Technician</p>
                   <p className="text-sm font-bold text-slate-700">{ticket.assignedTechnicianName}</p>
                 </div>
               </div>
             ) : (
               <div className="p-4 rounded-2xl border border-dashed border-slate-300 text-center text-sm text-slate-500 bg-white">
                 Unassigned
               </div>
             )}

             {isAdmin && !['CLOSED', 'REJECTED'].includes(ticket.status) && (
               <form onSubmit={handleAssign} className="mt-6">
                 <label className="block text-xs font-bold text-slate-600 mb-2">Assign to Technician:</label>
                 <div className="flex gap-2">
                   <select
                     value={technicianId}
                     onChange={(e) => setTechnicianId(e.target.value)}
                     className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                   >
                     <option value="">Select Technician</option>
                     {technicians.map(tech => (
                       <option key={tech.id} value={tech.id}>
                         {tech.name} (ID: {tech.id})
                       </option>
                     ))}
                   </select>
                   <button
                     disabled={isAssigning || !technicianId}
                     className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-50 shadow-sm whitespace-nowrap"
                   >
                     Assign
                   </button>
                 </div>
               </form>
             )}
          </div>

           {canUpdateStatus && !['CLOSED', 'REJECTED'].includes(ticket.status) && (
             <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
               <h3 className="text-sm font-bold text-slate-800 mb-4 pb-4 border-b border-slate-100 uppercase tracking-widest text-center">
                 Update Status
               </h3>
               <form onSubmit={handleUpdateStatus}>
                 <div className="mb-4">
                   <select
                     value={newStatus}
                     onChange={(e) => setNewStatus(e.target.value)}
                     className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-500"
                   >
                     <option value="OPEN" disabled={ticket.status !== 'OPEN'}>OPEN</option>
                     <option value="IN_PROGRESS" disabled={ticket.status !== 'OPEN' && ticket.status !== 'IN_PROGRESS'}>IN_PROGRESS</option>
                     <option value="RESOLVED" disabled={ticket.status !== 'IN_PROGRESS' && ticket.status !== 'RESOLVED'}>RESOLVED</option>
                     <option value="CLOSED" disabled={ticket.status !== 'RESOLVED'}>CLOSED</option>
                     <option value="REJECTED">REJECTED</option>
                   </select>
                 </div>
                 
                 {['RESOLVED', 'CLOSED', 'REJECTED'].includes(newStatus) && (
                   <div className="mb-4">
                     <textarea
                       rows="3"
                       placeholder="Resolution notes / reason..."
                       value={resolutionNotes}
                       required
                       onChange={(e) => setResolutionNotes(e.target.value)}
                       className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 resize-none"
                     ></textarea>
                   </div>
                 )}
                 <button
                   disabled={isUpdatingStatus || newStatus === ticket.status}
                   className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:bg-slate-400 shadow-sm"
                 >
                   {isUpdatingStatus ? "Updating..." : "Save Status"}
                 </button>
               </form>
               <p className="text-[10px] text-slate-400 text-center mt-3 font-medium">Valid transitions are strictly enforced.</p>
             </div>
           )}

           {/* Delete Ticket Button Section */}
           {(isAdmin || (ticket.createdById === user?.id && ticket.status === 'OPEN')) && (
             <div className="bg-rose-50 rounded-3xl p-6 border border-rose-100/50">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-all shadow-md shadow-rose-200 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Trash2 size={18} />
                  {isDeleting ? "Deleting..." : "Delete Ticket"}
                </button>
                <p className="text-[10px] text-rose-400 text-center mt-3 font-medium">
                  {isAdmin ? "Admin privilege: Hard delete" : "This will permanently remove the ticket."}
                </p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
