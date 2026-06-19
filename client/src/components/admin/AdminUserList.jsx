// client/src/components/admin/AdminUserList.jsx
import React from 'react';
import { Search, ChevronRight } from 'lucide-react';

export default function AdminUserList({ users, selectedId, onSelect }) {
  const [term, setTerm] = React.useState('');

  const filtered = users.filter(u => 
    u.name.toLowerCase().includes(term.toLowerCase()) || 
    u.email.toLowerCase().includes(term.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="font-bold text-gray-900 mb-3">Users Directory</h2>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search users..." 
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            value={term}
            onChange={e => setTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filtered.map(u => (
          <button
            key={u.id}
            onClick={() => onSelect(u.id)}
            className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition-all ${
              selectedId === u.id 
                ? 'bg-indigo-50 border border-indigo-100 shadow-sm' 
                : 'hover:bg-gray-50 border border-transparent'
            }`}
          >
            <div>
              <div className="font-semibold text-gray-900 text-sm">{u.name}</div>
              <div className="text-xs text-gray-500">{u.email}</div>
            </div>
            <ChevronRight 
              size={16} 
              className={`transition-transform ${selectedId === u.id ? 'text-indigo-600 translate-x-1' : 'text-gray-300'}`} 
            />
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            No users found.
          </div>
        )}
      </div>
    </div>
  );
}
