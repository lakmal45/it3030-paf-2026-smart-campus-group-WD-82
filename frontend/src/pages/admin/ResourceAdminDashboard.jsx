import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  AlertTriangle, 
  TrendingUp,
  TrendingDown,
  Plus,
  Settings,
  BarChart3,
  CheckCircle2,
  Clock,
  Activity,
  ChevronRight,
  Filter,
  RefreshCw,
  Download,
  MoreVertical,
  Users
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import resourceService from '../../services/resourceService';

const ResourceAdminDashboard = () => {
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    maintenance: 0,
    outOfService: 0,
    utilization: 0,
    avgCapacity: 0
  });
  const [chartData, setChartData] = useState([]);
  const [maintenanceAlerts, setMaintenanceAlerts] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await resourceService.getAllResources();
      setResources(data);

      // Calculate stats
      const total = data.length;
      const active = data.filter(r => r.status === 'ACTIVE').length;
      const maintenance = data.filter(r => r.status === 'IN_MAINTENANCE').length;
      const outOfService = data.filter(r => r.status === 'OUT_OF_SERVICE').length;
      const utilization = Math.round((data.filter(r => !r.available).length / total) * 100);
      const avgCapacity = Math.round(data.reduce((sum, r) => sum + (r.capacity || 0), 0) / total);

      setStats({
        total,
        active,
        maintenance,
        outOfService,
        utilization,
        avgCapacity
      });

      // Generate mock chart data
      setChartData([
        { time: 'Mon', available: 45, booked: 35, maintenance: 5 },
        { time: 'Tue', available: 52, booked: 38, maintenance: 3 },
        { time: 'Wed', available: 48, booked: 42, maintenance: 2 },
        { time: 'Thu', available: 61, booked: 39, maintenance: 4 },
        { time: 'Fri', available: 55, booked: 45, maintenance: 2 },
        { time: 'Sat', available: 67, booked: 23, maintenance: 3 },
        { time: 'Sun', available: 72, booked: 18, maintenance: 2 }
      ]);

      // Create maintenance alerts (resources in maintenance)
      const alerts = data
        .filter(r => r.status === 'IN_MAINTENANCE' || r.status === 'OUT_OF_SERVICE')
        .slice(0, 5)
        .map(r => ({
          id: r.id,
          name: r.name,
          status: r.status,
          location: r.location
        }));
      setMaintenanceAlerts(alerts);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const statusDistribution = [
    { name: 'Active', value: stats.active, color: '#10b981' },
    { name: 'Maintenance', value: stats.maintenance, color: '#f59e0b' },
    { name: 'Out of Service', value: stats.outOfService, color: '#ef4444' }
  ];

  const resourcesByType = resources.reduce((acc, r) => {
    const existing = acc.find(item => item.name === r.type);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ name: r.type, count: 1 });
    }
    return acc;
  }, []);

  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Type', 'Location', 'Status', 'Available', 'Capacity'];
    const csv = [
      headers.join(','),
      ...resources.map(r =>
        [r.id, r.name, r.type, r.location, r.status, r.available ? 'Yes' : 'No', r.capacity].join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resources-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filterResourcesByStatus = () => {
    if (filterStatus === 'all') return resources;
    return resources.filter(r => r.status === filterStatus);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">Resource Management</h1>
          <p className="text-slate-600 text-sm sm:text-base mt-2">Central hub for facilities and equipment oversight</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors font-bold text-sm text-slate-700"
          >
            <Download className="h-4 w-4" /> Export
          </button>
          <button 
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors font-bold text-sm text-slate-700"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <Link 
            to="/dashboard/manager/resources/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold text-sm"
          >
            <Plus className="h-4 w-4" /> New Resource
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-6">
        <div className="lg:col-span-1 bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 sm:p-6 rounded-2xl border border-blue-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Total</p>
              <p className="text-2xl sm:text-3xl font-black text-blue-900 mt-2">{stats.total}</p>
              <p className="text-xs text-blue-700 mt-1 font-medium">All resources</p>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-4 sm:p-6 rounded-2xl border border-emerald-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Operational</p>
              <p className="text-2xl sm:text-3xl font-black text-emerald-900 mt-2">{stats.active}</p>
              <p className="text-xs text-emerald-700 mt-1 font-medium">Ready to use</p>
            </div>
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 bg-gradient-to-br from-amber-50 to-amber-100/50 p-4 sm:p-6 rounded-2xl border border-amber-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Maintenance</p>
              <p className="text-2xl sm:text-3xl font-black text-amber-900 mt-2">{stats.maintenance}</p>
              <p className="text-xs text-amber-700 mt-1 font-medium">Being serviced</p>
            </div>
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 bg-gradient-to-br from-rose-50 to-rose-100/50 p-4 sm:p-6 rounded-2xl border border-rose-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-rose-600 uppercase tracking-wider">Out of Service</p>
              <p className="text-2xl sm:text-3xl font-black text-rose-900 mt-2">{stats.outOfService}</p>
              <p className="text-xs text-rose-700 mt-1 font-medium">Unavailable</p>
            </div>
            <div className="p-2 bg-rose-500/10 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-rose-600" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 bg-gradient-to-br from-indigo-50 to-indigo-100/50 p-4 sm:p-6 rounded-2xl border border-indigo-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Utilization</p>
              <p className="text-2xl sm:text-3xl font-black text-indigo-900 mt-2">{stats.utilization}%</p>
              <p className="text-xs text-indigo-700 mt-1 font-medium">Currently in use</p>
            </div>
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <Activity className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 bg-gradient-to-br from-purple-50 to-purple-100/50 p-4 sm:p-6 rounded-2xl border border-purple-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">Avg Capacity</p>
              <p className="text-2xl sm:text-3xl font-black text-purple-900 mt-2">{stats.avgCapacity}</p>
              <p className="text-xs text-purple-700 mt-1 font-medium">Per resource</p>
            </div>
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Availability Trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-black text-slate-900">Availability Trend</h2>
              <p className="text-xs text-slate-500 font-medium mt-1">7-day resource utilization pattern</p>
            </div>
            <BarChart3 className="h-5 w-5 text-slate-400" />
          </div>
          {isLoading ? (
            <div className="h-72 bg-slate-100 rounded-lg animate-pulse"></div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#64748b" style={{ fontSize: '12px' }} />
                <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#f8fafc', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Line type="monotone" dataKey="booked" stroke="#3b82f6" strokeWidth={3} dot={false} name="Booked" />
                <Line type="monotone" dataKey="available" stroke="#10b981" strokeWidth={3} dot={false} name="Available" />
                <Line type="monotone" dataKey="maintenance" stroke="#f59e0b" strokeWidth={3} dot={false} name="Maintenance" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-black text-slate-900">Status Distribution</h2>
              <p className="text-xs text-slate-500 font-medium mt-1">Current resource state</p>
            </div>
            <Activity className="h-5 w-5 text-slate-400" />
          </div>
          {isLoading ? (
            <div className="h-72 bg-slate-100 rounded-lg animate-pulse"></div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={statusDistribution} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={100} fill="#8884d8" dataKey="value">
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Resources by Type */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
        <h2 className="text-lg font-black text-slate-900 mb-6">Resources by Type</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {resourcesByType.map((type, idx) => (
            <div key={idx} className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl border border-slate-200">
              <p className="text-sm font-bold text-slate-600 uppercase tracking-wider">{type.name}</p>
              <p className="text-3xl font-black text-slate-900 mt-2">{type.count}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">items in catalog</p>
            </div>
          ))}
        </div>
      </div>

      {/* Maintenance Alerts */}
      {maintenanceAlerts.length > 0 && (
        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl border border-amber-200 p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Maintenance & Service Alerts
          </h2>
          <div className="space-y-3">
            {maintenanceAlerts.map(alert => (
              <div key={alert.id} className="flex items-start justify-between p-4 bg-white rounded-lg border border-amber-100">
                <div className="flex-1">
                  <p className="font-bold text-slate-900">{alert.name}</p>
                  <p className="text-xs text-slate-500">{alert.location}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-bold rounded-lg ${
                  alert.status === 'IN_MAINTENANCE' 
                    ? 'bg-amber-100 text-amber-700' 
                    : 'bg-rose-100 text-rose-700'
                }`}>
                  {alert.status === 'IN_MAINTENANCE' ? 'Maintenance' : 'Out of Service'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Resources */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-black text-slate-900">Resource Inventory</h2>
          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="IN_MAINTENANCE">Maintenance</option>
              <option value="OUT_OF_SERVICE">Out of Service</option>
            </select>
            <Link to="/dashboard/manager/resources" className="text-blue-600 hover:text-blue-700 text-sm font-bold flex items-center gap-1">
              Manage All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-bold text-slate-600 uppercase tracking-wider text-xs">Resource</th>
                  <th className="text-left py-3 px-4 font-bold text-slate-600 uppercase tracking-wider text-xs">Type</th>
                  <th className="text-left py-3 px-4 font-bold text-slate-600 uppercase tracking-wider text-xs">Status</th>
                  <th className="text-left py-3 px-4 font-bold text-slate-600 uppercase tracking-wider text-xs">Availability</th>
                  <th className="text-center py-3 px-4 font-bold text-slate-600 uppercase tracking-wider text-xs">Action</th>
                </tr>
              </thead>
              <tbody>
                {filterResourcesByStatus().slice(0, 10).map((resource) => (
                  <tr key={resource.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Building2 className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{resource.name}</p>
                          <p className="text-xs text-slate-500 truncate">{resource.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold">{resource.type}</span>
                    </td>
                    <td className="py-3 px-4">
                      {resource.status === 'ACTIVE' ? (
                        <span className="flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold w-fit">
                          <CheckCircle2 className="h-3 w-3" /> Active
                        </span>
                      ) : resource.status === 'IN_MAINTENANCE' ? (
                        <span className="flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold w-fit">
                          <Clock className="h-3 w-3" /> Maintenance
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-700 rounded-lg text-xs font-bold w-fit">
                          <AlertTriangle className="h-3 w-3" /> Out of Service
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold ${resource.available ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {resource.available ? 'Available' : 'Booked'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Link 
                        to={`/dashboard/manager/resources/${resource.id}`}
                        className="text-blue-600 hover:text-blue-700 font-bold"
                      >
                        <Settings className="h-4 w-4 inline" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Link
          to="/dashboard/manager/resources/new"
          className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-2xl p-6 hover:shadow-lg transition-shadow group"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900 mb-2">Add Resource</h3>
              <p className="text-sm text-slate-600">Create a new resource entry</p>
            </div>
            <div className="p-3 bg-blue-200 group-hover:bg-blue-300 rounded-xl transition-colors">
              <Plus className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Link>

        <Link
          to="/dashboard/manager/resources"
          className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-2xl p-6 hover:shadow-lg transition-shadow group"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900 mb-2">View Resources</h3>
              <p className="text-sm text-slate-600">Browse full inventory</p>
            </div>
            <div className="p-3 bg-emerald-200 group-hover:bg-emerald-300 rounded-xl transition-colors">
              <Building2 className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </Link>

        <div
          onClick={exportToCSV}
          className="cursor-pointer bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200 rounded-2xl p-6 hover:shadow-lg transition-shadow group"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900 mb-2">Export Data</h3>
              <p className="text-sm text-slate-600">Download as CSV</p>
            </div>
            <div className="p-3 bg-amber-200 group-hover:bg-amber-300 rounded-xl transition-colors">
              <Download className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceAdminDashboard;
