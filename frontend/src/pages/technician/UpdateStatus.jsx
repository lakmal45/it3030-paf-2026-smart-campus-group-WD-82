import React, { useState, useEffect } from "react";
import ticketService from "../../services/ticketService";
import { CheckCircle2, Ticket, MessageSquare, AlertCircle, Loader2 } from "lucide-react";

/**
 * Technician view to update ticket status.
 * Replaces the mock form with real backend API integration.
 */
const UpdateStatus = () => {
  const [assignedTickets, setAssignedTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [ticketId, setTicketId] = useState("");
  // Using backend enum values: OPEN, IN_PROGRESS, RESOLVED, CLOSED
  const [status, setStatus] = useState("IN_PROGRESS");
  const [notes, setNotes] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssigned = async () => {
      try {
        const { data } = await ticketService.getAll("", "", "", "", 0, 100);
        // Exclude CLOSED tickets since they shouldn't be updated normally
        const activeTickets = (data.content || []).filter(t => t.status !== 'CLOSED');
        setAssignedTickets(activeTickets);
        if (activeTickets.length > 0) {
          setTicketId(activeTickets[0].id.toString());
          setStatus(activeTickets[0].status === 'OPEN' ? 'IN_PROGRESS' : activeTickets[0].status);
        }
      } catch (err) {
        console.error("Failed to load assigned tickets", err);
        setError("Failed to load your active tickets.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssigned();
  }, []);

  // When ticket selection changes, default the status switch accurately
  const handleTicketChange = (e) => {
    const tid = e.target.value;
    setTicketId(tid);
    const selected = assignedTickets.find(t => t.id.toString() === tid);
    if(selected) {
      setStatus(selected.status === 'OPEN' ? 'IN_PROGRESS' : selected.status);
    }
    setSubmitSuccess(false);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ticketId) return;

    if (status === 'RESOLVED' && !notes.trim()) {
      setError("Resolution notes are required when marking a ticket as resolved.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSubmitSuccess(false);

    try {
      await ticketService.updateStatus(ticketId, status, notes);
      setSubmitSuccess(true);
      setNotes(""); // clear notes on success
      
      // Update local state ticket status
      setAssignedTickets(prev => prev.map(t => 
        t.id.toString() === ticketId ? { ...t, status } : t
      ));
      
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to update ticket status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusOptions = [
    { value: 'OPEN', label: 'Open', color: 'slate' },
    { value: 'IN_PROGRESS', label: 'In Progress', color: 'amber' },
    { value: 'RESOLVED', label: 'Resolved', color: 'emerald' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center shadow-inner border border-indigo-100">
            <CheckCircle2 className="text-indigo-600" size={24} />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
            Update Ticket Status
          </span>
        </h1>
        <p className="text-slate-500 mt-3 font-medium text-lg ml-1">Advance your assigned tickets and securely log resolution updates.</p>
      </div>
      
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 -mr-20 -mt-20 pointer-events-none" />
        
        <div className="p-8 sm:p-12 relative z-10">
          
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center gap-3 shadow-sm">
              <AlertCircle size={20} className="shrink-0" /> <span className="font-medium text-sm">{error}</span>
            </div>
          )}

          {submitSuccess && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl flex items-center gap-3 shadow-sm animate-fade-in-up">
              <CheckCircle2 size={20} className="shrink-0" /> <span className="font-medium text-sm">Status successfully updated!</span>
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-4">
              <Loader2 size={32} className="animate-spin text-indigo-400" />
              <p className="font-medium">Loading assigned tickets...</p>
            </div>
          ) : assignedTickets.length === 0 ? (
            <div className="text-center py-12">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <Ticket className="text-slate-300" size={24} />
               </div>
               <h3 className="text-lg font-bold text-slate-700 mb-1">No Active Tickets</h3>
               <p className="text-slate-500 text-sm">You have no tickets requiring updates right now.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Ticket Selection */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">
                  <Ticket size={16} className="text-indigo-500" /> Select Target Ticket
                </label>
                <div className="relative">
                  <select 
                    className="w-full pl-5 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 shadow-sm appearance-none transition-all cursor-pointer"
                    value={ticketId}
                    onChange={handleTicketChange}
                    required
                  >
                    <option value="" disabled>-- Select a ticket --</option>
                    {assignedTickets.map(t => (
                      <option key={t.id} value={t.id}>
                        {`ID: ${t.id} - ${t.category} (${t.status.replace('_', ' ')})`}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
                </div>
                
                {/* Active Ticket Context Preview */}
                {ticketId && (
                  <div className="mt-3 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/50 text-sm text-indigo-900/80 font-medium line-clamp-2 leading-relaxed">
                    <span className="font-bold text-indigo-900 opacity-60 uppercase text-[10px] tracking-widest block mb-1">Issue Overview</span>
                    "{assignedTickets.find(t => t.id.toString() === ticketId)?.description}"
                  </div>
                )}
              </div>
              
              {/* Status Modules */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Set Target Status</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {statusOptions.map(opt => {
                    const isSelected = status === opt.value;
                    return (
                      <button 
                        type="button"
                        key={opt.value}
                        onClick={() => { setStatus(opt.value); setSubmitSuccess(false); }}
                        className={`relative py-4 px-5 rounded-2xl border-2 text-sm font-bold transition-all flex items-center justify-center gap-2 overflow-hidden group ${
                          isSelected 
                            ? opt.color === 'emerald' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md shadow-emerald-100' :
                              opt.color === 'amber' ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-md shadow-amber-100' :
                              'border-slate-500 bg-slate-50 text-slate-700 shadow-md shadow-slate-100'
                            : 'border-slate-100 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {isSelected && <span className={`absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] ${opt.color === 'emerald' ? 'from-emerald-400' : opt.color === 'amber' ? 'from-amber-400' : 'from-slate-400'} to-transparent`} />}
                        {isSelected && <CheckCircle2 size={16} />}
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Resolution Notes */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">
                  <MessageSquare size={16} className="text-indigo-500" /> Resolution & Action Log
                </label>
                <textarea 
                  rows="4"
                  placeholder="Securely log the actions taken, components replaced, or reasons for any delay..."
                  className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none text-slate-700 font-medium resize-none shadow-sm transition-all"
                  value={notes}
                  onChange={(e) => { setNotes(e.target.value); setSubmitSuccess(false); }}
                  required={status === 'RESOLVED'}
                ></textarea>
                {status === 'RESOLVED' && (
                  <p className="text-[11px] font-black text-amber-600 mt-2 uppercase tracking-wide flex items-center gap-1">
                    <AlertCircle size={12} /> Notes are strictly required for resolution
                  </p>
                )}
              </div>
              
              {/* Submit Action */}
              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-wider text-sm rounded-2xl transition-all shadow-xl shadow-indigo-200 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:active:scale-100"
                >
                  {isSubmitting ? (
                    <><Loader2 size={18} className="animate-spin" /> Saving Update...</>
                  ) : (
                    'Submit Status Update'
                  )}
                </button>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateStatus;
