import { Bell, CheckCircle2, AlertCircle, Info, AlertTriangle, CheckCheck } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";

const NotificationsPage = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Bell className="text-indigo-600" /> All Notifications
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            You have {unreadCount} unread message{unreadCount !== 1 ? 's' : ''} out of {notifications.length} total.
          </p>
        </div>
        
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="flex items-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-4 py-2 rounded-xl font-bold text-xs transition-colors shadow-sm"
          >
            <CheckCheck size={16} />
            MARK ALL AS READ
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {notifications.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {notifications.map((notification) => {
              const getIcon = () => {
                switch(notification.type) {
                  case 'success': return <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><CheckCircle2 size={24} /></div>;
                  case 'warning': return <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><AlertTriangle size={24} /></div>;
                  case 'alert': return <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl"><AlertCircle size={24} /></div>;
                  default: return <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Info size={24} /></div>;
                }
              };

              return (
                <div 
                  key={notification.id} 
                  className={`p-6 transition-all hover:bg-slate-50 relative group ${!notification.read ? "bg-indigo-50/20" : ""}`}
                >
                  {!notification.read && (
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500"></div>
                  )}
                  
                  <div className="flex gap-5">
                    {getIcon()}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                        <h4 className={`text-base font-bold ${notification.read ? "text-slate-700" : "text-indigo-900"}`}>
                          {notification.title}
                        </h4>
                        <span className="text-xs font-semibold text-slate-400 whitespace-nowrap bg-slate-100 px-2.5 py-1 rounded-lg">
                          {notification.timeAgo}
                        </span>
                      </div>
                      <p className={`text-sm leading-relaxed ${notification.read ? "text-slate-500" : "text-slate-700 font-medium"}`}>
                        {notification.message}
                      </p>
                      
                      {!notification.read && (
                        <button 
                          onClick={() => markAsRead(notification.id)}
                          className="mt-4 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
                        >
                          <CheckCircle2 size={14} />
                          MARK AS READ
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-24 flex flex-col items-center justify-center text-center px-6">
             <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300">
                <Bell size={48} />
             </div>
             <h4 className="text-lg font-bold text-slate-800">You're all caught up!</h4>
             <p className="text-sm text-slate-500 mt-2 max-w-sm">
                When you receive notifications about your tickets, bookings, or system updates, they will appear here.
             </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
