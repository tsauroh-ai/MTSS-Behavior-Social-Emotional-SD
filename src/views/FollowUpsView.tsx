import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { FollowUp, Student } from '../types';
import { CheckSquare, Plus, Search, Filter, Calendar, Clock, ArrowRight, CheckCircle2, User } from 'lucide-react';
import { PriorityBadge, FollowUpStatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';

interface FollowUpsViewProps {
  onSelectStudent: (studentId: string) => void;
}

export const FollowUpsView: React.FC<FollowUpsViewProps> = ({ onSelectStudent }) => {
  const { currentUser } = useAuth();

  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form, setForm] = useState({
    studentId: '',
    title: '',
    description: '',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'Sedang' as const,
    status: 'Pending' as const,
    assignedToId: currentUser?.id || 'usr-guru-1',
    assignedToName: currentUser?.name || 'Wali Kelas',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [flwData, studentsData] = await Promise.all([
        api.getFollowUps(),
        api.getStudents(),
      ]);
      setFollowUps(flwData);
      setStudents(studentsData);
      if (studentsData.length > 0 && !form.studentId) {
        setForm(prev => ({ ...prev, studentId: studentsData[0].id }));
      }
    } catch (err) {
      console.error('Failed to load follow-ups', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createFollowUp(form);
      setIsAddModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal membuat tindak lanjut');
    }
  };

  const handleToggleStatus = async (flw: FollowUp) => {
    try {
      const nextStatus = flw.status === 'Completed' ? 'Pending' : 'Completed';
      await api.updateFollowUp(flw.id, {
        status: nextStatus,
        resolutionNotes: nextStatus === 'Completed' ? 'Diselesaikan oleh staf pendamping' : undefined,
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = followUps.filter(flw => {
    if (selectedStatus !== 'all' && flw.status !== selectedStatus) return false;
    if (selectedPriority !== 'all' && flw.priority !== selectedPriority) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = flw.title.toLowerCase().includes(q);
      const matchDesc = flw.description.toLowerCase().includes(q);
      const matchStudent = flw.studentName?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchStudent) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Daftar Tindak Lanjut (Follow-Up Tracker)</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen tugas koordinasi orang tua, persiapan alat bantu visual, dan agenda tindak lanjut tim sekolah.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>+ Buat Action Item Baru</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari judul tindak lanjut, siswa, atau deskripsi..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="w-44">
          <select
            value={selectedPriority}
            onChange={e => setSelectedPriority(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">Semua Prioritas</option>
            <option value="Tinggi">Tinggi</option>
            <option value="Sedang">Sedang</option>
            <option value="Rendah">Rendah</option>
          </select>
        </div>

        <div className="w-44">
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">Semua Status</option>
            <option value="Pending">Pending (Tertunda)</option>
            <option value="In Progress">In Progress (Dikerjakan)</option>
            <option value="Completed">Completed (Selesai)</option>
          </select>
        </div>
      </div>

      {/* Follow-up Items */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Memuat daftar tindak lanjut...</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Tidak ada tindak lanjut"
          description="Semua action item tindak lanjut telah terselesaikan atau belum ada tugas terdaftar."
          actionLabel="Buat Action Item Baru"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(flw => (
            <div
              key={flw.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 text-xs ${
                flw.status === 'Completed'
                  ? 'bg-slate-50/70 border-slate-200 opacity-80'
                  : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <input
                  type="checkbox"
                  checked={flw.status === 'Completed'}
                  onChange={() => handleToggleStatus(flw)}
                  className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 mt-1 cursor-pointer"
                />
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-sm font-bold ${
                        flw.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      {flw.title}
                    </span>
                    <PriorityBadge priority={flw.priority} size="sm" />
                    <FollowUpStatusBadge status={flw.status} size="sm" />
                  </div>

                  <p className="text-slate-600 leading-relaxed">{flw.description}</p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                    <span>Siswa: <strong className="text-slate-700">{flw.studentName}</strong></span>
                    <span>•</span>
                    <span>Penanggung Jawab: <strong className="text-slate-700">{flw.assignedToName}</strong></span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-amber-700 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Jatuh Tempo: {flw.dueDate}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => onSelectStudent(flw.studentId)}
                  className="text-xs text-sky-600 hover:text-sky-700 font-semibold inline-flex items-center gap-0.5"
                >
                  <span>Profil</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Follow-Up Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tambah Tugas Tindak Lanjut Baru"
        subtitle="Tetapkan penanggung jawab dan batas waktu pelaksanaan tugas koordinasi."
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Pilih Siswa Terkait *</label>
            <select
              required
              value={form.studentId}
              onChange={e => setForm({ ...form, studentId: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 font-medium"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.className})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Judul Tindak Lanjut *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="misal: Diskusi strategi visual dengan orang tua"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Rincian Deskripsi Tugas *</label>
            <textarea
              rows={3}
              required
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Jelaskan langkah konkret yang perlu dilakukan..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Prioritas *</label>
              <select
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value as any })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              >
                <option value="Rendah">Rendah</option>
                <option value="Sedang">Sedang</option>
                <option value="Tinggi">Tinggi (Penting & Mendesak)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Batas Waktu (Due Date) *</label>
              <input
                type="date"
                required
                value={form.dueDate}
                onChange={e => setForm({ ...form, dueDate: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

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
              className="px-4 py-2 bg-sky-600 text-white rounded-lg font-semibold shadow-xs"
            >
              Simpan Tindak Lanjut
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
