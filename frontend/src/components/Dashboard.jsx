import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, XCircle, Search } from 'lucide-react';

export default function Dashboard({ user }) {
  const [tickets, setTickets] = useState([]);
  const [metrics, setMetrics] = useState({ total: 0, pending: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);

  if (user.role !== 'faculty') {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500 glass rounded-2xl mx-auto max-w-2xl mt-12 bg-white/70">
        <AlertCircle className="w-12 h-12 text-slate-400 mb-4" />
        <h2 className="text-xl font-semibold text-slate-700">Faculty Access Required</h2>
        <p className="mt-2 text-sm">Please switch to a Faculty account to view the dashboard.</p>
      </div>
    );
  }

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tickets?assignedTo=${user.id}`);
      const data = await res.json();
      setTickets(data.tickets);
      setMetrics(data.metrics);
    } catch (error) {
       console.error(error);
    } finally {
       setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    const int = setInterval(fetchTickets, 5000); // refresh every 5s
    return () => clearInterval(int);
  }, [user.id]);

  const handleAction = async (id, status) => {
    await fetch(`/api/tickets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchTickets();
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'approved': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'rejected': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 w-full animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-800">Faculty Dashboard</h2>
          <p className="text-slate-500 mt-1">Manage student requests and autonomous assistant escalations.</p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Tickets</p>
            <p className="text-3xl font-bold tracking-tight text-slate-900">{metrics.total}</p>
          </div>
          <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center">
            <Search className="w-6 h-6 text-indigo-600" />
          </div>
        </div>
        <div className="glass p-6 rounded-2xl border-l-[6px] border-l-amber-400 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-amber-800 mb-1">Require Action</p>
            <p className="text-3xl font-bold tracking-tight text-amber-600">{metrics.pending}</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center">
            <Clock className="w-6 h-6 text-amber-500" />
          </div>
        </div>
        <div className="glass p-6 rounded-2xl border-l-[6px] border-l-emerald-500 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-800 mb-1">Resolved</p>
            <p className="text-3xl font-bold tracking-tight text-emerald-600">{metrics.resolved}</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-emerald-500" />
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="glass rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-slate-200/50 bg-white/50 backdrop-blur-sm flex items-center justify-between">
          <h3 className="font-semibold text-slate-800 text-lg">Assigned Tickets</h3>
          <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg shrink-0">
            {tickets.length} total
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/80 text-slate-500 font-medium border-b border-slate-200 tracking-wider text-xs uppercase">
              <tr>
                <th className="px-6 py-4 rounded-tl-lg">ID</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Course/Entity</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white/40 backdrop-blur-md">
              {loading && tickets.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500">Loading tickets...</td></tr>
              ) : tickets.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500 italic">No tickets assigned to you currently.</td></tr>
              ) : tickets.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4 font-mono text-slate-500">#{t.id}</td>
                  <td className="px-6 py-4 font-medium text-slate-800 capitalize">{t.type.replace('_', ' ')}</td>
                  <td className="px-6 py-4">{t.student_name}</td>
                  <td className="px-6 py-4 text-slate-600">{t.course_name || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(t.status)}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {t.status === 'pending' ? (
                      <div className="flex items-center justify-end gap-2 opacity-100">
                        <button 
                          onClick={() => handleAction(t.id, 'approved')}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium rounded-lg text-xs transition border border-emerald-100 shadow-sm"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button 
                          onClick={() => handleAction(t.id, 'rejected')}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium rounded-lg text-xs transition border border-rose-100 shadow-sm"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs italic">Reviewed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
