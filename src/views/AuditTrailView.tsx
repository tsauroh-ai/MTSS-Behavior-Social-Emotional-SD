import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { AuditLog } from '../types';
import { History, Shield, Search, Filter, Clock, Eye, AlertCircle } from 'lucide-react';
import { EmptyState } from '../components/common/EmptyState';

export const AuditTrailView: React.FC = () => {
  const { currentUser } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = logs.filter(l => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        l.userName.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q) ||
        l.entityType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Audit Trail & Log Keamanan Data</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Jejak rekaman perubahan data sensitif, akses observasi, dan riwayat penyesuaian tier untuk akuntabilitas institusi.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari aktivitas pengguna, entitas data, atau rincian..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Memuat log audit...</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Tidak ada log aktivitas audit"
            description="Semua pencatatan akses dan perubahan data sensitif akan terekam secara otomatis di sini."
          />
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
              <tr>
                <th className="px-5 py-3">Waktu & Tanggal</th>
                <th className="px-4 py-3">Pengguna (Aktor)</th>
                <th className="px-4 py-3">Aksi & Entitas</th>
                <th className="px-5 py-3">Rincian Perubahan / Akses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map(log => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(log.timestamp).toLocaleString('id-ID')}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-slate-900">{log.userName}</span>
                    <div className="text-[10px] text-slate-400">{log.userRole}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-semibold text-[10px]">
                      {log.action}
                    </span>
                    <span className="ml-1.5 text-slate-500 font-mono text-[10px]">({log.entityType})</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="text-slate-800">{log.details}</div>
                    {log.previousState && log.newState && (
                      <div className="mt-1 p-2 bg-slate-50 rounded border border-slate-200 text-[10px] font-mono text-slate-600">
                        Perubahan: {JSON.stringify(log.previousState)} → {JSON.stringify(log.newState)}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
