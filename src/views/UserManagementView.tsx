import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { User, UserRole, MasterClass } from '../types';
import { UserCog, Plus, Shield, CheckCircle2, Search, Edit2 } from 'lucide-react';
import { Modal } from '../components/common/Modal';

export const UserManagementView: React.FC = () => {
  const { currentUser, allUsers, isAdmin } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<MasterClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Add User Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'guru' as UserRole,
    roleTitle: 'Guru Kelas',
    assignedClassIds: [] as string[],
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, classesData] = await Promise.all([
        api.getUsers(),
        api.getClasses(),
      ]);
      setUsers(usersData);
      setClasses(classesData);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createUser({
        ...form,
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`,
      });
      setIsAddModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal menambahkan pengguna');
    }
  };

  const filtered = users.filter(u => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.roleTitle.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Manajemen Pengguna & Role Akses</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola akun tenaga pendidik, konselor, koordinator, dan pembatasan rombongan belajar yang ditugaskan.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Akun Staff</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari nama staff, email, atau jabatan..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
            <tr>
              <th className="px-5 py-3">Nama Staff & Email</th>
              <th className="px-4 py-3">Peran (RBAC)</th>
              <th className="px-4 py-3">Penugasan Rombel</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filtered.map(user => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <div className="font-bold text-slate-900">{user.name}</div>
                      <div className="text-[11px] text-slate-400">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className="font-semibold text-slate-900">{user.roleTitle}</span>
                  <div className="text-[10px] text-slate-400 font-mono">role: {user.role}</div>
                </td>
                <td className="px-4 py-3.5">
                  {user.assignedClassIds && user.assignedClassIds.length > 0 ? (
                    <div className="flex gap-1 flex-wrap">
                      {user.assignedClassIds.map(cId => {
                        const cls = classes.find(c => c.id === cId);
                        return (
                          <span key={cId} className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded font-semibold text-[10px]">
                            {cls?.name || cId}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-slate-400">Seluruh Kelas (Koordinator/Admin)</span>
                  )}
                </td>
                <td className="px-4 py-3.5">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Aktif</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Pendaftaran Akun Pengguna Baru"
        subtitle="Tetapkan hak akses dan batasan rombel kelas."
      >
        <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap & Gelar *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="misal: Siti Rahmawati, S.Pd."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Sekolah *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="nama@sekolah.sch.id"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Peran Sistem (Role) *</label>
              <select
                value={form.role}
                onChange={e => {
                  const r = e.target.value as UserRole;
                  let title = 'Guru Kelas';
                  if (r === 'koordinator_mtss') title = 'Koordinator MTSS';
                  if (r === 'konselor') title = 'Guru Bimbingan Konseling';
                  if (r === 'admin') title = 'Administrator Sekolah';
                  if (r === 'pimpinan') title = 'Kepala Sekolah';
                  setForm({ ...form, role: r, roleTitle: title });
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
              >
                <option value="guru">Guru / Wali Kelas</option>
                <option value="koordinator_mtss">Koordinator MTSS</option>
                <option value="konselor">Konselor / Guru BK</option>
                <option value="admin">Administrator</option>
                <option value="pimpinan">Pimpinan Sekolah</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Judul Jabatan *</label>
              <input
                type="text"
                required
                value={form.roleTitle}
                onChange={e => setForm({ ...form, roleTitle: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {form.role === 'guru' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Rombel Kelas yang Ditugaskan</label>
              <select
                onChange={e => {
                  if (e.target.value && !form.assignedClassIds.includes(e.target.value)) {
                    setForm({ ...form, assignedClassIds: [...form.assignedClassIds, e.target.value] });
                  }
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg mb-2"
              >
                <option value="">+ Pilih Kelas Binaan</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <div className="flex gap-1.5 flex-wrap">
                {form.assignedClassIds.map(cId => {
                  const cls = classes.find(c => c.id === cId);
                  return (
                    <span key={cId} className="px-2 py-1 bg-blue-100 text-blue-900 rounded font-semibold text-xs flex items-center gap-1">
                      <span>{cls?.name || cId}</span>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, assignedClassIds: form.assignedClassIds.filter(id => id !== cId) })}
                        className="text-blue-500 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow-xs"
            >
              Simpan Akun
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
