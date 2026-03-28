import { useState, useEffect } from 'react';
import Chat from './components/Chat';
import Dashboard from './components/Dashboard';
import Logs from './components/Logs';
import { UserCircle, Terminal, Bot } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setCurrentUser(data[0]); // Default to first user (student)
      })
      .catch(err => console.error("Failed to load users", err));
  }, []);

  if (!currentUser) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Campus Autonomous Assistant
            </h1>
          </div>
          
          <div className="flex items-center gap-6">
            <nav className="flex gap-1">
              {['chat', 'dashboard', 'logs'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${
                    activeTab === tab 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
            
            <div className="h-6 w-px bg-slate-200"></div>

            <div className="flex items-center gap-2 text-sm bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <UserCircle className="w-4 h-4 text-slate-500" />
              <select 
                className="bg-transparent border-none outline-none font-medium text-slate-700 cursor-pointer"
                value={currentUser?.id}
                onChange={(e) => setCurrentUser(users.find(u => u.id === parseInt(e.target.value)))}
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl -z-10 animate-pulse mix-blend-multiply"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100/50 rounded-full blur-3xl -z-10 animate-pulse mix-blend-multiply delay-1000"></div>
        
        {activeTab === 'chat' && <Chat user={currentUser} />}
        {activeTab === 'dashboard' && <Dashboard user={currentUser} />}
        {activeTab === 'logs' && <Logs />}
      </main>
    </div>
  );
}
