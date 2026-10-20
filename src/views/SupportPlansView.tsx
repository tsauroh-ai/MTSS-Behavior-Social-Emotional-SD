import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { SupportPlan, Student, MasterClass, TierLevel } from '../types';
import { Target, Plus, Search, Filter, Calendar, Clock, ArrowRight, CheckCircle, RefreshCw, XCircle } from 'lucide-react';
import { TierBadge, SupportStatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';

interface SupportPlansViewProps {
  onSelectStudent: (studentId: string) => void;
}

export const SupportPlansView: React.FC<SupportPlansViewProps> = ({ onSelectStudent }) => {
  const { currentUser, canManageSupportPlans } = useAuth();

  const [plans, setPlans] = useState<SupportPlan[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<MasterClass[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Status Change Dialog
  const [statusTarget, setStatusTarget] = useState<SupportPlan | null>(null);
  const [newStatus, setNewStatus] = useState<any>('Under Review');
  const [statusReason, setStatusReason] = useState('');
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  // Create Plan Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form, setForm] = useState({
    studentId: '',
    tier: 'Tier 2' as TierLevel,
    areaOfNeed: '',
    targetGoals: '',
    strategies: [''],
    frequency: 'Setiap hari',
    duration: '4 minggu',
    personInCharge: currentUser?.name || 'Wali Kelas',
    startDate: new Date().toISOString().split('T')[0],
    targetReviewDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Active' as const,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [plansData, studentsData, classesData] = await Promise.all([
        api.getSupportPlans(),
        api.getStudents(),
        api.getClasses(),
      ]);
      setPlans(plansData);
      setStudents(studentsData);
      setClasses(classesData);
      if (studentsData.length > 0 && !form.studentId) {
        setForm(prev => ({ ...prev, studentId: studentsData[0].id }));
      }
    } catch (err) {
      console.error('Failed to load support plans', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const student = students.find(s => s.id === form.studentId);
      await api.createSupportPlan({
        ...form,
        className: student?.className || 'Kelas',
        strategies: form.strategies.filter(s => s.trim().length > 0),
      });
      setIsAddModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal membuat rencana dukungan');
    }
  };

  const handleUpdateStatus = async () => {
    if (!statusTarget) return;
    try {
      await api.updateSupportPlan(statusTarget.id, {
        status: newStatus,
        reason: statusReason,
      });
      setIsStatusModalOpen(false);
      setStatusTarget(null);
      setStatusReason('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah status rencana');
    }
  };

  const filtered = plans.filter(p => {
    if (selectedStatus !== 'all' && p.status !== selectedStatus) return false;
    if (selectedTier !== 'all' && p.tier !== selectedTier) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchStudent = p.studentName?.toLowerCase().includes(q);
      const matchArea = p.areaOfNeed.toLowerCase().includes(q);
      if (!matchStudent && !matchArea) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Rencana Dukungan MTSS (Support Plans)</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dokumentasi tujuan intervensi terarah, strategi terpilih, dan jadwal evaluasi berkala per siswa.
          </p>
        </div>

        {canManageSupportPlans && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Buat Rencana Baru</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari nama siswa atau area kebutuhan..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="w-48">
          <select
            value={selectedTier}
            onChange={e => setSelectedTier(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">Semua Tier Dukungan</option>
            <option value="Tier 1">Tier 1 (Universal)</option>
            <option value="Tier 2">Tier 2 (Targeted)</option>
            <option value="Tier 3">Tier 3 (Intensif)</option>
          </select>
        </div>

        <div className="w-48">
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">Semua Status Rencana</option>
            <option value="Draft">Draft</option>
            <option value="Active">Active (Berjalan)</option>
            <option value="Under Review">Under Review (Evaluasi)</option>
            <option value="Completed">Completed (Selesai)</option>
            <option value="Discontinued">Discontinued (Dihentikan)</option>
          </select>
        </div>
      </div>

      {/* Plans List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Memuat data rencana dukungan...</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Tidak ada rencana dukungan yang sesuai"
          description="Belum ada Support Plan yang cocok dengan filter yang dipilih."
          actionLabel={canManageSupportPlans ? 'Buat Support Plan Baru' : undefined}
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map(plan => (
            <div
              key={plan.id}
              className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-base font-bold text-slate-900">{plan.studentName}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-700 font-semibold rounded">
                      {plan.className}
                    </span>
                    <TierBadge tier={plan.tier} size="sm" />
                    <SupportStatusBadge status={plan.status} />
                  </div>
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-sky-600" />
                    <span>Area Fokus: {plan.areaOfNeed}</span>
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {canManageSupportPlans && (
                    <button
                      onClick={() => {
                        setStatusTarget(plan);
                        setNewStatus(plan.status);
                        setIsStatusModalOpen(true);
                      }}
                      className="px-2.5 py-1 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium transition-colors"
                    >
                      Ubah Status
                    </button>
                  )}
                  <button
                    onClick={() => onSelectStudent(plan.studentId)}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                  >
                    <span>Profil Siswa</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Tujuan Target (Goals)</div>
                  <p className="text-slate-800 font-medium leading-relaxed">{plan.targetGoals}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Strategi Intervensi</div>
                  <ul className="space-y-1 text-slate-700">
                    {plan.strategies.map((strat, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-600 mt-1.5 shrink-0" />
                        <span>{strat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                <div>
                  <span>Frekuensi:</span>
                  <div className="font-semibold text-slate-800">{plan.frequency}</div>
                </div>
                <div>
                  <span>Durasi & Mulai:</span>
                  <div className="font-semibold text-slate-800">{plan.duration} ({plan.startDate})</div>
                </div>
                <div>
                  <span>Target Review:</span>
                  <div className="font-semibold text-amber-700">{plan.targetReviewDate}</div>
                </div>
                <div>
                  <span>Penanggung Jawab:</span>
                  <div className="font-semibold text-slate-800">{plan.personInCharge}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Change Status Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title={`Perbarui Status Rencana Dukungan: ${statusTarget?.studentName}`}
        subtitle="Setiap perubahan siklus status rencana dicatat dalam riwayat audit sistem."
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-800 mb-1">Status Rencana Baru *</label>
            <select
              value={newStatus}
              onChange={e => setNewStatus(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold focus:ring-2 focus:ring-sky-500"
            >
              <option value="Draft">Draft (Dalam Penyusunan)</option>
              <option value="Active">Active (Sedang Diterapkan)</option>
              <option value="Under Review">Under Review (Dalam Evaluasi Tim)</option>
              <option value="Completed">Completed (Target Tercapai / Selesai)</option>
              <option value="Discontinued">Discontinued (Diganti Strategi Lain)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Alasan / Catatan Perubahan Status <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={statusReason}
              onChange={e => setStatusReason(e.target.value)}
              placeholder="Jelaskan alasan perubahan status (misal: target kemandirian telah tercapai konsisten selama 4 pekan)..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsStatusModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={!statusReason.trim()}
              onClick={handleUpdateStatus}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-lg font-semibold shadow-xs"
            >
              Simpan Perubahan
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Plan Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Penyusunan Rencana Dukungan (Support Plan) Baru"
        subtitle="Rancang strategi bertahap dengan tujuan yang jelas dan dapat diobservasi."
      >
        <form onSubmit={handleCreatePlan} className="space-y-4 text-xs">
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
                    {s.fullName} ({s.className}) - {s.currentTier}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tingkat Tier Dukungan *</label>
              <select
                value={form.tier}
                onChange={e => setForm({ ...form, tier: e.target.value as TierLevel })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 font-semibold"
              >
                <option value="Tier 1">Tier 1 — Universal Support</option>
                <option value="Tier 2">Tier 2 — Targeted Support</option>
                <option value="Tier 3">Tier 3 — Intensive Individual Support</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Area Kebutuhan / Fokus Dukungan *</label>
            <input
              type="text"
              required
              value={form.areaOfNeed}
              onChange={e => setForm({ ...form, areaOfNeed: e.target.value })}
              placeholder="misal: Regulasi Emosi saat Frustrasi Tugas atau Adaptasi Transisi Kegiatan"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tujuan Target yang Terukur (Goals) *</label>
            <textarea
              rows={2}
              required
              value={form.targetGoals}
              onChange={e => setForm({ ...form, targetGoals: e.target.value })}
              placeholder="Siswa mampu... dalam kurun waktu 4 pekan dengan indikator..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Strategi & Intervensi Terpilih *</label>
            <div className="space-y-2">
              {form.strategies.map((strat, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={strat}
                    onChange={e => {
                      const updated = [...form.strategies];
                      updated[idx] = e.target.value;
                      setForm({ ...form, strategies: updated });
                    }}
                    placeholder={`Strategi #${idx + 1}`}
                    className="flex-1 p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                  {form.strategies.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        setForm({
                          ...form,
                          strategies: form.strategies.filter((_, i) => i !== idx),
                        });
                      }}
                      className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setForm({ ...form, strategies: [...form.strategies, ''] })}
                className="text-xs text-sky-600 font-semibold hover:underline"
              >
                + Tambah Poin Strategi
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Frekuensi Pelaksanaan</label>
              <input
                type="text"
                value={form.frequency}
                onChange={e => setForm({ ...form, frequency: e.target.value })}
                placeholder="misal: 3x seminggu"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Durasi Rencana</label>
              <input
                type="text"
                value={form.duration}
                onChange={e => setForm({ ...form, duration: e.target.value })}
                placeholder="misal: 4 minggu"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Tanggal Review *</label>
              <input
                type="date"
                required
                value={form.targetReviewDate}
                onChange={e => setForm({ ...form, targetReviewDate: e.target.value })}
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
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold shadow-xs"
            >
              Simpan Rencana Dukungan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
