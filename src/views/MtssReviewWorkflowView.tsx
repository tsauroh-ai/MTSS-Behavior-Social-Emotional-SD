import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { MtssReview, Student, TierLevel } from '../types';
import {
  GitBranch,
  Plus,
  Search,
  Filter,
  AlertCircle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  FileText,
} from 'lucide-react';
import { TierBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { HumanDecisionBanner } from '../components/common/HumanDecisionBanner';

interface MtssReviewWorkflowViewProps {
  onSelectStudent: (studentId: string) => void;
}

export const MtssReviewWorkflowView: React.FC<MtssReviewWorkflowViewProps> = ({ onSelectStudent }) => {
  const { currentUser, canConductReview } = useAuth();

  const [reviews, setReviews] = useState<MtssReview[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Review Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [form, setForm] = useState({
    reviewDate: new Date().toISOString().split('T')[0],
    reviewType: 'Flagged Eskalasi' as const,
    recommendedTier: 'Tier 2' as TierLevel,
    observationsSummary: '',
    interventionSummary: '',
    decisionNotes: '',
    nextReviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    committeeMembers: [currentUser?.name || 'Staff Reviewer'],
    status: 'Approved' as const,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [reviewsData, studentsData] = await Promise.all([
        api.getMtssReviews(),
        api.getStudents(),
      ]);
      setReviews(reviewsData);
      setStudents(studentsData);
      const flagged = studentsData.find(s => s.needsReviewFlag);
      if (flagged) {
        setSelectedStudentId(flagged.id);
        setForm(prev => ({
          ...prev,
          recommendedTier: flagged.currentTier,
          observationsSummary: flagged.flagReason || '',
        }));
      } else if (studentsData.length > 0) {
        setSelectedStudentId(studentsData[0].id);
      }
    } catch (err) {
      console.error('Failed to load MTSS reviews', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const flaggedStudents = students.filter(s => s.needsReviewFlag);

  const handleStartReviewForStudent = (student: Student) => {
    setSelectedStudentId(student.id);
    setForm({
      reviewDate: new Date().toISOString().split('T')[0],
      reviewType: student.needsReviewFlag ? 'Flagged Eskalasi' : 'Rutin',
      recommendedTier: student.currentTier,
      observationsSummary: student.flagReason ? `Penandaan otomatis: ${student.flagReason}` : '',
      interventionSummary: '',
      decisionNotes: '',
      nextReviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      committeeMembers: [currentUser?.name || 'Koordinator MTSS'],
      status: 'Approved',
    });
    setIsModalOpen(true);
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const student = students.find(s => s.id === selectedStudentId);
      await api.createMtssReview({
        ...form,
        studentId: selectedStudentId,
        currentTier: student?.currentTier || 'Tier 1',
      });
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan keputusan review MTSS');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Forum & Alur Review MTSS (Multi-Disciplinary Team)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Musyawarah tim profesional (Wali Kelas, Konselor, Koordinator MTSS) untuk peninjauan berkala dan penyesuaian tier.
          </p>
        </div>

        {canConductReview && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Laksanakan Forum Review MTSS</span>
          </button>
        )}
      </div>

      <HumanDecisionBanner />

      {/* Flagged Review Queue */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Antrean Siswa yang Memerlukan Review Tim ({flaggedStudents.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400">Dipicu oleh aturan ambang batas sekolah</span>
        </div>

        {flaggedStudents.length === 0 ? (
          <div className="p-6 text-center bg-emerald-50/50 rounded-xl border border-emerald-100">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
            <p className="text-xs font-semibold text-emerald-900">
              Tidak ada siswa dalam antrean peninjauan mendesak.
            </p>
            <p className="text-[11px] text-emerald-700 mt-0.5">
              Semua siswa berada dalam pemantauan rutin sesuai rencana masing-masing.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {flaggedStudents.map(std => (
              <div
                key={std.id}
                className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">{std.fullName}</span>
                    <TierBadge tier={std.currentTier} size="sm" />
                  </div>
                  <div className="text-[11px] text-slate-500">{std.className} • NISN: {std.nisn}</div>
                  <p className="text-xs text-amber-900 mt-2 bg-amber-100/60 p-2 rounded-lg font-medium">
                    {std.flagReason || 'Perlu evaluasi pola data observasi terkini.'}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-200/60">
                  <button
                    onClick={() => onSelectStudent(std.id)}
                    className="px-2.5 py-1 text-slate-700 bg-white hover:bg-slate-50 rounded-lg text-xs font-medium border border-slate-200"
                  >
                    Lihat Profil
                  </button>
                  {canConductReview && (
                    <button
                      onClick={() => handleStartReviewForStudent(std)}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-2xs"
                    >
                      Buka Musyawarah Review
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historical Reviews Feed */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-900">Riwayat Keputusan Musyawarah MTSS</h3>
          </div>
          <span className="text-xs text-slate-400">{reviews.length} Keputusan Dicatat</span>
        </div>

        {reviews.length === 0 ? (
          <EmptyState
            title="Belum ada riwayat review tim"
            description="Dokumentasikan keputusan forum tim MTSS untuk transparansi akuntabilitas sekolah."
          />
        ) : (
          <div className="space-y-4">
            {reviews.map(rev => (
              <div
                key={rev.id}
                className="p-5 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-3 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{rev.studentName}</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-semibold text-purple-800 bg-purple-100/70 px-2 py-0.5 rounded">
                      {rev.reviewType}
                    </span>
                    <span className="text-slate-400">({rev.reviewDate})</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-slate-500">Tier Awal: <strong>{rev.currentTier}</strong></span>
                    <span className="text-slate-300">→</span>
                    <span className="flex items-center gap-1">
                      <span className="text-slate-500">Hasil:</span>
                      <TierBadge tier={rev.recommendedTier} size="sm" />
                    </span>
                    <button
                      onClick={() => onSelectStudent(rev.studentId)}
                      className="text-sky-600 hover:text-sky-700 font-semibold inline-flex items-center gap-0.5 ml-2"
                    >
                      <span>Profil</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-slate-100 space-y-1">
                    <div className="text-[10px] font-bold uppercase text-slate-400">Sintesis Observasi Siswa</div>
                    <p className="text-slate-800">{rev.observationsSummary}</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-100 space-y-1">
                    <div className="text-[10px] font-bold uppercase text-slate-400">Evaluasi Intervensi Sebelumnya</div>
                    <p className="text-slate-800">{rev.interventionSummary}</p>
                  </div>
                </div>

                <div className="p-3.5 bg-purple-50/80 border border-purple-100 rounded-xl space-y-1">
                  <div className="text-[10px] font-bold uppercase text-purple-900">Keputusan & Arahan Tim MTSS</div>
                  <p className="text-purple-950 font-medium leading-relaxed">{rev.decisionNotes}</p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Anggota Tim Pengkaji: <strong>{rev.committeeMembers.join(', ')}</strong></span>
                  <span>Jadwal Review Berikutnya: <strong className="text-slate-700">{rev.nextReviewDate}</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Dialog Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Dokumentasi Forum Musyawarah MTSS"
        subtitle="Evaluasi data observasi multi-sumber dan tetapkan tindak lanjut profesional."
      >
        <form onSubmit={handleSaveReview} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pilih Siswa *</label>
              <select
                required
                value={selectedStudentId}
                onChange={e => {
                  setSelectedStudentId(e.target.value);
                  const std = students.find(s => s.id === e.target.value);
                  if (std) setForm(prev => ({ ...prev, recommendedTier: std.currentTier }));
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.className}) — {s.currentTier} {s.needsReviewFlag ? '⚠️ [Flagged]' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Jenis Review *</label>
              <select
                value={form.reviewType}
                onChange={e => setForm({ ...form, reviewType: e.target.value as any })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              >
                <option value="Rutin">Rutin Siklus 4-6 Pekan</option>
                <option value="Flagged Eskalasi">Eskalasi Penandaan Otomatis</option>
                <option value="Permintaan Guru">Permintaan Wali Kelas</option>
                <option value="Evaluasi Selesai">Evaluasi Target Tercapai (De-eskalasi)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hasil Rekomendasi Tier *</label>
              <select
                value={form.recommendedTier}
                onChange={e => setForm({ ...form, recommendedTier: e.target.value as TierLevel })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
              >
                <option value="Tier 1">Tier 1 — Universal Support</option>
                <option value="Tier 2">Tier 2 — Targeted Support</option>
                <option value="Tier 3">Tier 3 — Intensive Support</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Sintesis Bukti Observasi & Catatan Guru *
            </label>
            <textarea
              rows={2}
              required
              value={form.observationsSummary}
              onChange={e => setForm({ ...form, observationsSummary: e.target.value })}
              placeholder="Rangkum bukti perilaku, sosial-emosional, dan catatan kontekstual siswa..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Evaluasi Intervensi yang Telah Berjalan *
            </label>
            <textarea
              rows={2}
              required
              value={form.interventionSummary}
              onChange={e => setForm({ ...form, interventionSummary: e.target.value })}
              placeholder="Bagaimana efektivitas strategi terdahulu (respon siswa, konsistensi pelaksanaan)..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Kesepakatan Musyawarah & Keputusan Final Tim MTSS *
            </label>
            <textarea
              rows={3}
              required
              value={form.decisionNotes}
              onChange={e => setForm({ ...form, decisionNotes: e.target.value })}
              placeholder="Dokumentasikan justifikasi profesional, strategi baru yang disepakati, dan komitmen pembagian peran tim..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Tanggal Review Berikutnya *</label>
              <input
                type="date"
                required
                value={form.nextReviewDate}
                onChange={e => setForm({ ...form, nextReviewDate: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Daftar Anggota Tim yang Hadir *</label>
              <input
                type="text"
                required
                value={form.committeeMembers.join(', ')}
                onChange={e =>
                  setForm({ ...form, committeeMembers: e.target.value.split(',').map(s => s.trim()) })
                }
                placeholder="misal: Bu Ratna (Wali Kelas), Pak Budi (Koord MTSS), Bu Maya (Konselor)"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold shadow-xs"
            >
              Simpan Keputusan Review MTSS
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
