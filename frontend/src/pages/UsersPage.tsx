import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Shield, 
  ShieldOff, 
  Trash2, 
  Mail, 
  Calendar,
  CheckCircle2,
  XCircle,
  ExternalLink
} from 'lucide-react';
import toast from '../utils/toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'BANNED';
  joinedAt: string;
  postCount: number;
}

const mockUsers: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'USER', status: 'ACTIVE', joinedAt: '2026-01-15', postCount: 45 },
  { id: '2', name: 'Sarah Smith', email: 'sarah@design.co', role: 'USER', status: 'ACTIVE', joinedAt: '2026-02-10', postCount: 12 },
  { id: '3', name: 'Mike Johnson', email: 'mike@tech.io', role: 'USER', status: 'BANNED', joinedAt: '2026-01-05', postCount: 0 },
  { id: '4', name: 'Admin One', email: 'admin@karktech.com', role: 'ADMIN', status: 'ACTIVE', joinedAt: '2025-12-01', postCount: 156 },
  { id: '5', name: 'Emily Brown', email: 'emily@social.me', role: 'USER', status: 'ACTIVE', joinedAt: '2026-03-01', postCount: 28 },
];

interface LayoutContext {
  isDarkMode: boolean;
}

export default function UsersPage() {
  const { isDarkMode } = useOutletContext<LayoutContext>();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBan = (id: string) => {
    setUsers(users.map(u => {
      if (u.id === id) {
        const newStatus = u.status === 'ACTIVE' ? 'BANNED' : 'ACTIVE';
        toast.success(`User ${u.name} has been ${newStatus.toLowerCase()}!`);
        return { ...u, status: newStatus as 'ACTIVE' | 'BANNED' };
      }
      return u;
    }));
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this user forever? This action cannot be undone.')) {
      setUsers(users.filter(u => u.id !== id));
      toast.success('User deleted successfully');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className={`text-3xl font-extrabold tracking-tight mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>User Management</h2>
          <p className={`font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Manage, monitor, and moderate all platform users.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={`relative flex items-center group transition-all ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            <Search className={`absolute left-4 w-4 h-4 transition-colors ${isDarkMode ? 'text-slate-500 group-focus-within:text-blue-400' : 'text-slate-400 group-focus-within:text-blue-600'}`} />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-11 pr-6 py-3 rounded-2xl border-2 outline-none transition-all w-full md:w-64 font-semibold text-sm ${isDarkMode ? 'bg-slate-900/50 border-slate-800 focus:border-blue-500/50 text-white' : 'bg-white border-slate-100 focus:border-blue-600/30'}`}
            />
          </div>
          <button className={`p-3 rounded-2xl border-2 transition-all ${isDarkMode ? 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-white' : 'bg-white border-slate-100 text-slate-500 hover:text-slate-900'}`}>
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className={`rounded-3xl border overflow-hidden backdrop-blur-xl ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-50 bg-slate-50/50'}`}>
                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Posts</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-transparent">
              {filteredUsers.map((user) => (
                <tr key={user.id} className={`group transition-colors ${isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-blue-50/30'}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${isDarkMode ? 'bg-slate-800 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{user.name}</div>
                        <div className={`text-xs font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      user.status === 'ACTIVE' 
                        ? (isDarkMode ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-700')
                        : (isDarkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-100 text-red-700')
                    }`}>
                      {user.status === 'ACTIVE' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{user.role}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {user.joinedAt}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-500">
                    {user.postCount}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleBan(user.id)}
                        title={user.status === 'ACTIVE' ? 'Ban User' : 'Unban User'}
                        className={`p-2 rounded-lg transition-all ${user.status === 'ACTIVE' ? 'text-amber-500 hover:bg-amber-50' : 'text-green-500 hover:bg-green-50'}`}
                      >
                        {user.status === 'ACTIVE' ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        title="Delete User"
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className={`p-2 rounded-lg transition-all ${isDarkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}>
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="py-20 text-center">
            <div className={`w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
              <Users className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className={`text-lg font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>No users found</h3>
            <p className="text-slate-400 font-medium">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 rounded-3xl border backdrop-blur-xl ${isDarkMode ? 'bg-blue-600/10 border-blue-500/20 shadow-none' : 'bg-blue-50/50 border-blue-100 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDarkMode ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-600 text-white'}`}>
              <Users className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-blue-600">{users.length}</span>
          </div>
          <p className={`text-sm font-bold uppercase tracking-wider ${isDarkMode ? 'text-blue-300/60' : 'text-blue-600/60'}`}>Total Registrations</p>
        </div>

        <div className={`p-6 rounded-3xl border backdrop-blur-xl ${isDarkMode ? 'bg-green-600/10 border-green-500/20 shadow-none' : 'bg-green-50/50 border-green-100 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDarkMode ? 'bg-green-600/20 text-green-400' : 'bg-green-600 text-white'}`}>
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-green-600">{users.filter(u => u.status === 'ACTIVE').length}</span>
          </div>
          <p className={`text-sm font-bold uppercase tracking-wider ${isDarkMode ? 'text-green-300/60' : 'text-green-600/60'}`}>Active Users</p>
        </div>

        <div className={`p-6 rounded-3xl border backdrop-blur-xl ${isDarkMode ? 'bg-red-600/10 border-red-500/20 shadow-none' : 'bg-red-50/50 border-red-100 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDarkMode ? 'bg-red-600/20 text-red-400' : 'bg-red-600 text-white'}`}>
              <XCircle className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-red-600">{users.filter(u => u.status === 'BANNED').length}</span>
          </div>
          <p className={`text-sm font-bold uppercase tracking-wider ${isDarkMode ? 'text-red-300/60' : 'text-red-600/60'}`}>Restricted Accounts</p>
        </div>
      </div>
    </div>
  );
}
