import React, { useState, useEffect } from 'react';
import { Activity, Clock, CheckCircle, Search, Terminal } from 'lucide-react';

export default function Logs() {
  const [logs, setLogs] = useState([]);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();
      setLogs(data);
    } catch (error) {
       console.error(error);
    }
  };

  useEffect(() => {
    fetchLogs();
    const int = setInterval(fetchLogs, 3000);
    return () => clearInterval(int);
  }, []);

  const getLogIcon = (state) => {
    switch (state) {
      case 'RECEIVED': return <Activity className="w-4 h-4 text-blue-500" />;
      case 'UNDERSTOOD': return <Search className="w-4 h-4 text-indigo-500" />;
      case 'PLANNED': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'EXECUTED': return <Terminal className="w-4 h-4 text-purple-500" />;
      case 'VERIFIED': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'COMPLETED': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Activity className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-800">System Logs</h2>
        <p className="text-slate-500 mt-1">Audit trail and state machine transitions for the Autonomous Assistant.</p>
      </div>

      <div className="glass rounded-2xl overflow-hidden bg-white/60">
        <div className="p-4 bg-slate-800 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2 text-slate-200 font-mono text-sm">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <span>Controller Engine Logs</span>
          </div>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          </div>
        </div>
        
        <div className="p-6 bg-[#0f172a] font-mono text-sm h-[600px] overflow-y-auto space-y-3 shadow-inner">
          {logs.length === 0 ? (
            <div className="text-slate-500 flex items-center gap-2">
              <span className="animate-pulse">_</span> Waiting for events...
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex gap-4 p-2 rounded hover:bg-white/5 transition-colors border-l-2 border-transparent hover:border-indigo-500 group">
                <div className="text-slate-500 shrink-0 w-44">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
                <div className={`shrink-0 w-28 font-bold ${
                    log.state === 'COMPLETED' ? 'text-green-400' : 
                    log.state === 'FAILED' ? 'text-red-400' :
                    log.state === 'RECEIVED' ? 'text-blue-400' :
                    'text-indigo-300'
                  }`}>
                  [{log.state}]
                </div>
                <div className="text-slate-300 break-all">
                  <span className="text-slate-500 mr-2">#{log.request_id.split('-')[0]}</span> 
                  {log.message}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
