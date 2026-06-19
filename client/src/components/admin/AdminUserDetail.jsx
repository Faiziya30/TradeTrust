// client/src/components/admin/AdminUserDetail.jsx
import React, { useState } from 'react';
import { 
  CreditCard, 
  ShoppingBag, 
  Activity, 
  User, 
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function AdminUserDetail({ detail }) {
  const [tab, setTab] = useState('overview');

  if (!detail) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
        <User size={48} className="mb-4 opacity-20" />
        <p>Select a user to view details</p>
      </div>
    );
  }

  const { user, orders, scores, plans } = detail;
  const lastScore = user.lastScore ?? scores[0]?.score ?? 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-gray-400">{user.email}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-green-400">{lastScore}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">Credit Score</div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-6 mt-8 border-b border-gray-700/50">
          <button 
            onClick={() => setTab('overview')}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              tab === 'overview' ? 'text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Overview
            {tab === 'overview' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white rounded-t-full" />}
          </button>
          <button 
            onClick={() => setTab('orders')}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              tab === 'orders' ? 'text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Orders ({orders.length})
            {tab === 'orders' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white rounded-t-full" />}
          </button>
          <button 
            onClick={() => setTab('plans')}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              tab === 'plans' ? 'text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Financials ({plans.length})
            {tab === 'plans' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white rounded-t-full" />}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
        
        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-xs text-gray-500 uppercase">Total Orders</p>
                <p className="text-2xl font-bold mt-1">{orders.length}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-xs text-gray-500 uppercase">Active Plans</p>
                <p className="text-2xl font-bold mt-1">{plans.filter(p => p.status !== 'completed').length}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-xs text-gray-500 uppercase">Member Since</p>
                <p className="text-lg font-bold mt-1">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <section>
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Activity size={18} className="text-indigo-600" />
                Score History
              </h3>
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                 {scores.length === 0 && <div className="p-4 text-center text-gray-400 text-sm">No history</div>}
                 {scores.map((s, i) => (
                   <div key={s._id} className="p-4 border-b last:border-0 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-gray-900">{s.score} Points</div>
                        <div className="text-xs text-gray-500 mt-0.5">{(s.reasons || []).join(', ')}</div>
                      </div>
                      <div className="text-xs text-gray-400 font-medium">{new Date(s.createdAt).toLocaleDateString()}</div>
                   </div>
                 ))}
              </div>
            </section>
          </div>
        )}

        {tab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 && (
               <div className="text-center py-10 text-gray-400">
                 <ShoppingBag size={32} className="mx-auto mb-2 opacity-50" />
                 No orders placed yet.
               </div>
            )}
            {orders.map(o => (
              <div key={o._id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
                <div>
                   <p className="font-bold text-gray-900">Order #{String(o._id).slice(-6)}</p>
                   <p className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                   <p className="font-bold text-indigo-600">₹{o.amount?.toFixed(2)}</p>
                   <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium uppercase mt-1 ${
                       o.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                   }`}>
                       {o.status}
                   </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'plans' && (
          <div className="space-y-4">
             {plans.length === 0 && (
               <div className="text-center py-10 text-gray-400">
                 <CreditCard size={32} className="mx-auto mb-2 opacity-50" />
                 No financial plans found.
               </div>
            )}
             {plans.map(p => (
              <div key={p._id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                    <div>
                         <p className="font-bold text-gray-900">{p.type === 'pay_later_30' ? 'Pay Later (30 Days)' : 'Installment Plan'}</p>
                         <p className="text-xs text-gray-500">{p._id}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${
                        p.status === 'active' ? 'bg-indigo-100 text-indigo-700' : 
                        p.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                        {p.status}
                    </span>
                </div>
                <div className="flex justify-between items-end border-t pt-3 mt-1">
                    <div>
                        <p className="text-xs text-gray-400 uppercase">Total Amount</p>
                        <p className="font-bold text-lg">₹{p.totalAmount}</p>
                    </div>
                    {p.dueDate && (
                        <div className="text-right">
                             <p className="text-xs text-gray-400 uppercase">Due Date</p>
                             <p className="font-medium text-sm">{new Date(p.dueDate).toLocaleDateString()}</p>
                        </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
