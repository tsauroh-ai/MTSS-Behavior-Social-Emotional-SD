import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { ProgressMonitoringRecord, Student } from '../types';
import { TrendingUp, Plus, Search, Filter, ArrowRight, Activity } from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ProgressMonitoringViewProps {
  onSelectStudent: (studentId: string) => void;
}

export const ProgressMonitoringView: React.FC<ProgressMonitoringViewProps> = ({ onSelectStudent }) => {
  const { currentUser, canWriteObservations } = useAuth();

  const [records, setRecords] = useState<ProgressMonitoringRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form, setForm] = useState({
    studentId: '',
    date: new Date().toISOString().split('T')[0],
    periodLabel: 'Pekan 1',
    domain: 'Regulasi Diri & Adaptasi',
    targetMetricName: 'Kemandirian Transisi Tugas',
    scoreNumeric: 3,
    ratingLabel: 'Berkembang Positif',
    operationalStatus: 'menunjukkan_kemajuan' as const,
    notes: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [recordsData, studentsData] = await Promise.all([
        api.getProgressRecords(),
        api.getStudents(),
      ]);
      setRecords(recordsData);
      setStudents(studentsData);
      if (studentsData.length > 0 && !form.studentId) {
        setForm(prev => ({ ...prev, studentId: studentsData[0].id }));
      }
    } catch (err) {
      console.error('Failed to load progress records', err);
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
      await api.createProgressRecord(form);
      setIsAddModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan progress monitoring');
    }
  };

  const filteredRecords = records.filter(r => {
    if (selectedStudentId !== 'all' && r.studentId !== selectedStudentId) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Progress Monitoring Perkembangan</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pelacakan longitudinal dan visualisasi kemajuan siswa berdasarkan indikator kemandirian objektif.
          </p>
        </div>

        {canWriteObservations && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Catat Titik Monitoring</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
        <span className="text-xs font-semibold text-slate-700">Filter Siswa:</span>
        <select
          value={selectedStudentId}
          onChange={e => setSelectedStudentId(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 max-w-xs"
        >
          <option value="all">Semua Siswa Terpantau</option>
          {students.map(s => (
            <option key={s.id} value={s.id}>
              {s.fullName} ({s.className})
            </option>
          ))}
        </select>
      </div>

      {/* Visual Chart if Single Student Selected or Aggregate */}
      {filteredRecords.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {selectedStudentId === 'all'
                  ? 'Tren Skor Progress Terkini'
                  : `Grafik Perkembangan: ${students.find(s => s.id === selectedStudentId)?.fullName}`}
              </h3>
              <p className="text-xs text-slate-500">Skor skala 1.0 (Bantuan Penuh) s/d 4.0 (Mandiri Konsisten)</p>
            </div>
            <span className="text-xs text-sky-700 font-semibold bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
              {filteredRecords.length} Titik Data
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredRecords}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="periodLabel" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis domain={[1, 4]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                <Line
                  type="monotone"
                  dataKey="scoreNumeric"
                  name="Skor Indikator"
                  stroke="#0284c7"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#0284c7' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Records Feed */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Memuat catatan progress...</div>
      ) : filteredRecords.length === 0 ? (
        <EmptyState
          title="Belum ada data progress monitoring"
          description="Catat titik evaluasi secara berkala (mingguan/dwimingguan) untuk melihat arah perkembangan."
          actionLabel={canWriteObservations ? 'Catat Titik Monitoring' : undefined}
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {filteredRecords.map(rec => (
            <div
              key={rec.id}
              className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2 hover:border-slate-300 transition-all text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{rec.studentName}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-600 font-semibold">{rec.periodLabel}</span>
                  <span className="px-2 py-0.5 bg-sky-50 text-sky-700 font-bold rounded">
                    Skor: {rec.scoreNumeric} / 4
                  </span>
                </div>
                <div className="flex items-center gap-3 text-slate-500">
                  <span>{rec.date}</span>
                  <button
                    onClick={() => onSelectStudent(rec.studentId)}
                    className="text-xs text-sky-600 hover:text-sky-700 font-semibold inline-flex items-center gap-0.5"
                  >
                    <span>Profil Siswa</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="text-[10px] font-bold uppercase text-slate-400">
                  Domain: {rec.domain} — {rec.targetMetricName}
                </div>
                <p className="text-slate-800">{rec.notes}</p>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                <span>Pencatat: <strong>{rec.recordedByName}</strong> ({rec.recordedByRole})</span>
                <span className="text-emerald-700 font-medium">{rec.ratingLabel}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Record Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Pencatatan Titik Progress Monitoring"
        subtitle="Evaluasi berkala terhadap target kemandirian atau regulasi yang direncanakan."
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <label className="block font-semibold text-slate-700 mb-1">Tanggal Evaluasi *</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Label Periode *</label>
              <input
                type="text"
                required
                value={form.periodLabel}
                onChange={e => setForm({ ...form, periodLabel: e.target.value })}
                placeholder="misal: Pekan 2 (Bulan 1)"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Skor Kemandirian (1 - 4) *</label>
              <input
                type="number"
                step="0.1"
                min={1}
                max={4}
                required
                value={form.scoreNumeric}
                onChange={e => setForm({ ...form, scoreNumeric: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Catatan Evaluasi Perkembangan *</label>
            <textarea
              rows={3}
              required
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="Deskripsikan bukti kemajuan yang konsisten atau area yang masih membutuhkan penyesuaian..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
            />
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
              Simpan Titik Monitoring
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
