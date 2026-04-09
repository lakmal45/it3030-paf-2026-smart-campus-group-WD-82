import React, { useState, useEffect } from "react";
import ticketService from "../../services/ticketService";
import { User, Trash2, Edit2, Send, Clock } from "lucide-react";

/**
 * Renders comments for a ticket. Handles fetching, adding, editing, and deleting.
 */
const CommentSection = ({ ticketId, currentUser }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");

  const isAdmin = currentUser?.role === "ADMIN";

  const fetchComments = async () => {
    try {
      const { data } = await ticketService.getComments(ticketId);
      setComments(data);
    } catch (err) {
      console.error("Failed to load comments", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [ticketId]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      await ticketService.addComment(ticketId, newComment);
      setNewComment("");
      await fetchComments();
    } catch (err) {
      console.error("Failed to add comment", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await ticketService.deleteComment(ticketId, commentId);
      setComments(comments.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error("Failed to delete comment", err);
    }
  };

  const handleEditStart = (comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleEditSubmit = async (commentId) => {
    if (!editContent.trim()) return;
    try {
      await ticketService.editComment(ticketId, commentId, editContent);
      setEditingId(null);
      await fetchComments();
    } catch (err) {
      console.error("Failed to edit comment", err);
    }
  };

  if (isLoading) return <div className="text-sm text-slate-500 animate-pulse mt-6">Loading comments...</div>;

  return (
    <div className="mt-8 border-t border-slate-100 pt-8">
      <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
        Discussion <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-xs">{comments.length}</span>
      </h3>

      {/* Add Comment Form */}
      <form onSubmit={handleAddSubmit} className="mb-8 relative">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold shrink-0">
            {currentUser?.name?.charAt(0) || "U"}
          </div>
          <div className="flex-1 relative">
            <textarea
              rows="3"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment or update..."
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none text-sm bg-slate-50 focus:bg-white"
            />
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="absolute bottom-3 right-3 p-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl transition-colors shadow-sm"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </form>

      {/* Comment List */}
      <div className="space-y-6">
        {comments.map((c) => {
          const isOwner = c.authorId === currentUser?.id;
          const canModify = isOwner || isAdmin;

          return (
            <div key={c.id} className="flex gap-4 group">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold shrink-0 border border-slate-200">
                <User size={18} />
              </div>
              <div className="flex-1">
                <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-bold text-slate-800 text-sm">{c.authorName || "User"}</span>
                      {isOwner && <span className="ml-2 px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold uppercase tracking-wider">Author</span>}
                    </div>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(c.createdAt).toLocaleDateString()} {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {editingId === c.id ? (
                    <div className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">
                      <textarea
                        className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none mb-2"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows="2"
                      />
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => setEditingId(null)} className="text-xs px-2 py-1 bg-slate-200 rounded">Cancel</button>
                        <button onClick={() => handleEditSubmit(c.id)} className="text-xs px-2 py-1 bg-indigo-600 text-white rounded">Save</button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">
                      {c.content}
                    </div>
                  )}
                </div>
                
                {canModify && editingId !== c.id && (
                  <div className="flex gap-3 mt-1.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEditStart(c)} className="text-xs font-semibold text-slate-400 hover:text-indigo-600 flex items-center gap-1">
                      <Edit2 size={12} /> Edit
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="text-xs font-semibold text-slate-400 hover:text-rose-600 flex items-center gap-1">
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {comments.length === 0 && (
          <div className="text-center py-10 text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            No comments yet. Start the conversation.
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
