import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { InterventionLog, Student, SupportPlan } from '../types';
import { FileSpreadsheet, Plus, Search, Filter, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';

interface InterventionLogsViewProps {
  onSelectStudent: (studentId: string) => void;
}

export const InterventionLogsView: React.FC<InterventionLogsViewProps> = ({ onSelectStudent }) => {
  const { currentUser, canWriteObservations } = useAuth();

  const [logs, setLogs] = useState<InterventionLog[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Add Log Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form, setForm] = useState({
    studentId: '',
    date: new Date().toISOString().split('T')[0],
    time: '08:30',
    strategyUsed: '',
    durationMinutes: 15,
    studentResponse: '',
    observedResult: '',
    notes: '',
    followUpNeeded: false,
    followUpNotes: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [logsData, studentsData] = await Promise.all([
        api.getInterventionLogs(),
        api.getStudents(),
      ]);
      setLogs(logsData);
      setStudents(studentsData);
      if (studentsData.length > 0 && !form.studentId) {
        setForm(prev => ({ ...prev, studentId: studentsData[0].id }));
      }
    } catch (err) {
      console.error('Failed to load logs', err);
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
      await api.createInterventionLog(form);
      setIsAddModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan log intervensi');
    }
  };

  const filtered = logs.filter(log => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchStudent = log.studentName?.toLowerCase().includes(q);
      const matchStrat = log.strategyUsed.toLowerCase().includes(q);
      const matchResp = log.studentResponse.toLowerCase().includes(q);
      if (!matchStudent && !matchStrat && !matchResp) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Log Pelaksanaan Intervensi & Dukungan</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dokumentasi penerapan strategi berkala, durasi sesi, dan respons konkret siswa saat intervensi berjalan.
          </p>
        </div>

        {canWriteObservations && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Catat Log Sesi</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari nama siswa, strategi yang diterapkan, atau respons..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Logs Feed */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Memuat log intervensi...</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Belum ada log intervensi"
          description="Catat sesi dukungan yang telah dilaksanakan untuk memantau konsistensi implementasi."
          actionLabel={canWriteObservations ? 'Tambah Log Sesi' : undefined}
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(log => (
            <div
              key={log.id}
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3 hover:border-slate-300 transition-all text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-slate-900 text-sm">{log.studentName}</span>
                  <span className="text-slate-300">•</span>
                  <span className="font-semibold text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-100">
                    {log.strategyUsed}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{log.date} ({log.durationMinutes} menit)</span>
                  </span>
                  <button
                    onClick={() => onSelectStudent(log.studentId)}
                    className="text-xs text-sky-600 hover:text-sky-700 font-semibold inline-flex items-center gap-0.5"
                  >
                    <span>Profil Siswa</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Respons Siswa Saat Sesi</div>
                  <p className="text-slate-800 leading-relaxed">{log.studentResponse}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Hasil Konkret yang Teramati</div>
                  <p className="text-slate-800 leading-relaxed">{log.observedResult}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Pelaksana: <strong>{log.loggedByName}</strong> ({log.loggedByRole})</span>
                {log.followUpNeeded && (
                  <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Memerlukan Tindak Lanjut: {log.followUpNotes}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Log Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Catat Sesi Pelaksanaan Intervensi"
        subtitle="Dokumentasikan respon siswa secara faktual terhadap strategi yang diberikan."
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pilih Siswa *</label>
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
              <label className="block font-semibold text-slate-700 mb-1">Tanggal *</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Durasi (Menit) *</label>
              <input
                type="number"
                min={1}
                required
                value={form.durationMinutes}
                onChange={e => setForm({ ...form, durationMinutes: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Strategi / Aktivitas yang Diberikan *</label>
            <input
              type="text"
              required
              value={form.strategyUsed}
              onChange={e => setForm({ ...form, strategyUsed: e.target.value })}
              placeholder="misal: Visual Timer & Pendampingan Transisi Tugas 2 Menit"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Respons Siswa Saat Intervensi *</label>
            <textarea
              rows={2}
              required
              value={form.studentResponse}
              onChange={e => setForm({ ...form, studentResponse: e.target.value })}
              placeholder="Bagaimana respon siswa saat teknik/media visual diterapkan..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Hasil yang Teramati *</label>
            <textarea
              rows={2}
              required
              value={form.observedResult}
              onChange={e => setForm({ ...form, observedResult: e.target.value })}
              placeholder="Perilaku atau keterlibatan konkret siswa setelahnya..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="flwNeeded"
              checked={form.followUpNeeded}
              onChange={e => setForm({ ...form, followUpNeeded: e.target.checked })}
              className="w-4 h-4 text-sky-600 rounded border-slate-300"
            />
            <label htmlFor="flwNeeded" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Perlu Tindak Lanjut Khusus
            </label>
          </div>

          {form.followUpNeeded && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Catatan Tindak Lanjut</label>
              <input
                type="text"
                value={form.followUpNotes}
                onChange={e => setForm({ ...form, followUpNotes: e.target.value })}
                placeholder="misal: Siapkan kartu pilihan baru untuk jadwal esok hari"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
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
              className="px-4 py-2 bg-sky-600 text-white rounded-lg font-semibold shadow-xs"
            >
              Simpan Log Sesi
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
