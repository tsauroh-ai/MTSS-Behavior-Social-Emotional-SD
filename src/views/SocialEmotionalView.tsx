import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import {
  SocialEmotionalObservation,
  Student,
  MasterClass,
  MasterIndicatorGroup,
  SocialEmotionalScale,
} from '../types';
import { HeartHandshake, Plus, Search, Filter, Sparkles, ArrowRight, BookOpen, Layers } from 'lucide-react';
import { SocialEmotionalBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';

interface SocialEmotionalViewProps {
  onSelectStudent: (studentId: string) => void;
}

export const SocialEmotionalView: React.FC<SocialEmotionalViewProps> = ({ onSelectStudent }) => {
  const { currentUser, isGuru, canWriteObservations } = useAuth();

  const [observations, setObservations] = useState<SocialEmotionalObservation[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<MasterClass[]>([]);
  const [indicatorGroups, setIndicatorGroups] = useState<MasterIndicatorGroup[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form, setForm] = useState({
    studentId: '',
    classId: '',
    date: new Date().toISOString().split('T')[0],
    indicatorGroupId: 'grp-self-management',
    indicatorId: 'ind-sm-1',
    ratingScale: 'mulai_berkembang' as SocialEmotionalScale,
    evidenceNotes: '',
    context: '',
    supportStrategy: '',
    followUpResult: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [obsData, studentsData, classesData, groupsData] = await Promise.all([
        api.getSocialEmotionalObservations(),
        api.getStudents(),
        api.getClasses(),
        api.getIndicatorGroups(),
      ]);
      setObservations(obsData);
      setStudents(studentsData);
      setClasses(classesData);
      setIndicatorGroups(groupsData);
      if (studentsData.length > 0 && !form.studentId) {
        setForm(prev => ({
          ...prev,
          studentId: studentsData[0].id,
          classId: studentsData[0].classId,
        }));
      }
    } catch (err) {
      console.error('Failed to load SE observations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleStudentSelectInForm = (stdId: string) => {
    const std = students.find(s => s.id === stdId);
    setForm(prev => ({
      ...prev,
      studentId: stdId,
      classId: std?.classId || '',
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const grp = indicatorGroups.find(g => g.id === form.indicatorGroupId);
      const ind = grp?.indicators.find(i => i.id === form.indicatorId);
      await api.createSocialEmotionalObservation({
        ...form,
        indicatorGroupName: grp?.name || 'Kelompok Indikator',
        indicatorName: ind?.name || 'Nama Indikator',
      });
      setIsAddModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan observasi social-emotional');
    }
  };

  const filtered = observations.filter(obs => {
    if (selectedClass !== 'all' && obs.classId !== selectedClass) return false;
    if (selectedGroup !== 'all' && obs.indicatorGroupId !== selectedGroup) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchStudent = obs.studentName?.toLowerCase().includes(q);
      const matchEvidence = obs.evidenceNotes.toLowerCase().includes(q);
      const matchInd = obs.indicatorName.toLowerCase().includes(q);
      if (!matchStudent && !matchEvidence && !matchInd) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Pemantauan Kompetensi Social-Emotional (SEL)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Observasi perkembangan kompetensi sosial-emosional siswa SD dalam 5 domain CASEL berbasis bukti konkrit.
          </p>
        </div>

        {canWriteObservations && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Catat Observasi SE</span>
          </button>
        )}
      </div>

      {/* 5 Domains Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {indicatorGroups.map(grp => (
          <div
            key={grp.id}
            onClick={() => setSelectedGroup(selectedGroup === grp.id ? 'all' : grp.id)}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              selectedGroup === grp.id
                ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-500/20'
                : 'bg-white border-slate-200 hover:border-purple-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-bold text-purple-700">Domain</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-purple-100/60 text-purple-800 rounded font-semibold">
                {grp.indicators.length} Indikator
              </span>
            </div>
            <div className="text-xs font-bold text-slate-900 line-clamp-1">{grp.name}</div>
            <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">{grp.description}</p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari nama siswa, indikator, atau bukti catatan..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="w-48">
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Semua Rombel Kelas</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="w-56">
          <select
            value={selectedGroup}
            onChange={e => setSelectedGroup(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Semua 5 Domain CASEL</option>
            {indicatorGroups.map(g => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Observations Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Memuat penilaian social-emotional...</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Tidak ada penilaian SE yang sesuai"
          description="Belum ada data observasi social-emotional untuk kriteria filter ini."
          actionLabel={canWriteObservations ? 'Catat Penilaian Baru' : undefined}
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(obs => (
            <div
              key={obs.id}
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3 hover:border-purple-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{obs.studentName}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-700 font-semibold rounded">
                        {obs.className}
                      </span>
                    </div>
                    <div className="text-[11px] font-semibold text-purple-700 mt-0.5">
                      {obs.indicatorGroupName} • <span className="text-slate-800">{obs.indicatorName}</span>
                    </div>
                  </div>
                  <SocialEmotionalBadge scale={obs.ratingScale} />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Bukti Konkret Observasi</div>
                  <p className="text-slate-800 leading-relaxed">{obs.evidenceNotes}</p>
                </div>

                {obs.supportStrategy && (
                  <div className="p-2.5 bg-purple-50/60 border border-purple-100 rounded-xl text-xs space-y-0.5">
                    <span className="text-[10px] font-bold uppercase text-purple-800">Strategi Terkait:</span>
                    <p className="text-purple-950">{obs.supportStrategy}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                <span>Konteks: {obs.context} ({obs.date})</span>
                <button
                  onClick={() => onSelectStudent(obs.studentId)}
                  className="text-xs text-purple-700 hover:text-purple-800 font-semibold inline-flex items-center gap-0.5"
                >
                  <span>Profil Siswa</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Pencatatan Observasi Social-Emotional Baru"
        subtitle="Evaluasi indikator perilaku sosial dan regulasi diri berdasarkan bukti konkret di lingkungan sekolah."
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pilih Siswa *</label>
              <select
                required
                value={form.studentId}
                onChange={e => handleStudentSelectInForm(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-medium"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.className})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal Observasi *</label>
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
              <label className="block font-semibold text-slate-700 mb-1">Domain Kompetensi (CASEL) *</label>
              <select
                value={form.indicatorGroupId}
                onChange={e => {
                  const grp = indicatorGroups.find(g => g.id === e.target.value);
                  setForm({
                    ...form,
                    indicatorGroupId: e.target.value,
                    indicatorId: grp?.indicators[0]?.id || '',
                  });
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              >
                {indicatorGroups.map(grp => (
                  <option key={grp.id} value={grp.id}>
                    {grp.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Indikator Spesifik *</label>
              <select
                value={form.indicatorId}
                onChange={e => setForm({ ...form, indicatorId: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              >
                {indicatorGroups
                  .find(g => g.id === form.indicatorGroupId)
                  ?.indicators.map(ind => (
                    <option key={ind.id} value={ind.id}>
                      {ind.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Skala Penilaian Perkembangan *</label>
              <select
                value={form.ratingScale}
                onChange={e => setForm({ ...form, ratingScale: e.target.value as SocialEmotionalScale })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
              >
                <option value="belum_terlihat">1 — Belum Terlihat (Membutuhkan arahan penuh)</option>
                <option value="mulai_berkembang">2 — Mulai Berkembang (Kadang muncul dengan pengingat)</option>
                <option value="berkembang">3 — Berkembang (Sering muncul secara mandiri)</option>
                <option value="konsisten">4 — Konsisten (Terbiasa dan menjadi kebiasaan)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Konteks / Waktu Kegiatan *</label>
              <input
                type="text"
                required
                value={form.context}
                onChange={e => setForm({ ...form, context: e.target.value })}
                placeholder="misal: Diskusi kelompok proyek sains, Istirahat makan siang"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Bukti Catatan Perilaku Konkret *</label>
            <textarea
              rows={3}
              required
              value={form.evidenceNotes}
              onChange={e => setForm({ ...form, evidenceNotes: e.target.value })}
              placeholder="Deskripsikan contoh nyata ucapan atau tindakan siswa yang mendasari pemberian skala..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Strategi Penguatan yang Diberikan (Opsional)</label>
            <input
              type="text"
              value={form.supportStrategy}
              onChange={e => setForm({ ...form, supportStrategy: e.target.value })}
              placeholder="misal: Apresiasi lisan langsung saat siswa mampu berbagi peran"
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
              className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold shadow-xs"
            >
              Simpan Observasi SE
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
