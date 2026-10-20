import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { BehaviorObservation, Student, MasterClass } from '../types';
import { Eye, Plus, Search, Filter, Calendar, MapPin, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';

interface BehaviorObservationsViewProps {
  onSelectStudent: (studentId: string) => void;
}

export const BehaviorObservationsView: React.FC<BehaviorObservationsViewProps> = ({ onSelectStudent }) => {
  const { currentUser, isGuru, canWriteObservations } = useAuth();

  const [observations, setObservations] = useState<BehaviorObservation[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<MasterClass[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedClass, setSelectedClass] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form, setForm] = useState({
    studentId: '',
    classId: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    locationContext: 'Ruang Kelas',
    situationBefore: '',
    behaviorObserved: '',
    staffResponse: '',
    impactOnActivity: '',
    supportStrategyGiven: '',
    resultAfterSupport: '',
    additionalNotes: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [obsData, studentsData, classesData] = await Promise.all([
        api.getBehaviorObservations(),
        api.getStudents(),
        api.getClasses(),
      ]);
      setObservations(obsData);
      setStudents(studentsData);
      setClasses(classesData);
      if (studentsData.length > 0 && !form.studentId) {
        setForm(prev => ({
          ...prev,
          studentId: studentsData[0].id,
          classId: studentsData[0].classId,
        }));
      }
    } catch (err) {
      console.error('Failed to load behavior observations', err);
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
      await api.createBehaviorObservation(form);
      setIsAddModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan observasi');
    }
  };

  const filtered = observations.filter(obs => {
    if (selectedClass !== 'all' && obs.classId !== selectedClass) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchStudent = obs.studentName?.toLowerCase().includes(q);
      const matchBehavior = obs.behaviorObserved.toLowerCase().includes(q);
      const matchLocation = obs.locationContext.toLowerCase().includes(q);
      if (!matchStudent && !matchBehavior && !matchLocation) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Observasi Perilaku (Behavior)</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan faktual, terstruktur, dan objektif untuk memahami anteseden serta efektivitas strategi dukungan.
          </p>
        </div>

        {canWriteObservations && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Catat Observasi Behavior</span>
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
            placeholder="Cari nama siswa, konteks lokasi, atau perilaku..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="w-48">
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">Semua Rombel Kelas</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Observations Feed */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Memuat catatan observasi...</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Tidak ada observasi yang sesuai"
          description="Belum ada catatan observasi behavior yang cocok dengan filter atau kata kunci."
          actionLabel={canWriteObservations ? 'Buat Observasi Baru' : undefined}
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map(obs => (
            <div
              key={obs.id}
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3 hover:border-sky-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-slate-900 text-sm">{obs.studentName}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-700 font-semibold rounded">
                    {obs.className}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{obs.locationContext}</span>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>{obs.date} pukul {obs.time}</span>
                  <button
                    onClick={() => onSelectStudent(obs.studentId)}
                    className="text-xs text-sky-600 hover:text-sky-700 font-semibold inline-flex items-center gap-0.5"
                  >
                    <span>Lihat Profil</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Situasi Sebelum Kejadian (Antecedent)</div>
                  <p className="text-slate-800 leading-relaxed">{obs.situationBefore}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Perilaku yang Diamati (Objektif)</div>
                  <p className="text-slate-900 font-medium leading-relaxed">{obs.behaviorObserved}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-sky-50/70 border border-sky-100 rounded-xl space-y-1">
                  <div className="text-[10px] uppercase font-bold text-sky-800">Strategi Dukungan Diberikan</div>
                  <p className="text-sky-950 font-medium">{obs.supportStrategyGiven}</p>
                </div>
                <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl space-y-1">
                  <div className="text-[10px] uppercase font-bold text-emerald-800">Hasil Setelah Dukungan</div>
                  <p className="text-emerald-950">{obs.resultAfterSupport}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Dampak Pembelajaran</div>
                  <p className="text-slate-700">{obs.impactOnActivity || '-'}</p>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                <span>Observer: <strong>{obs.observerName}</strong> ({obs.observerRole})</span>
                {obs.additionalNotes && <span className="italic">Catatan: {obs.additionalNotes}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Observasi Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Pencatatan Observasi Behavior Baru"
        subtitle="Gunakan deskripsi perilaku objektif. Hindari atribusi atau diagnosis sepihak."
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pilih Siswa *</label>
              <select
                required
                value={form.studentId}
                onChange={e => handleStudentSelectInForm(e.target.value)}
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
              <label className="block font-semibold text-slate-700 mb-1">Waktu Kejadian *</label>
              <input
                type="time"
                required
                value={form.time}
                onChange={e => setForm({ ...form, time: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Lokasi / Konteks Kegiatan *</label>
            <input
              type="text"
              required
              value={form.locationContext}
              onChange={e => setForm({ ...form, locationContext: e.target.value })}
              placeholder="misal: Ruang Kelas saat pelajaran tematik, Koridor, Perpustakaan"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Situasi Sebelum Kejadian (Antecedent / Konteks Pemicu) *
            </label>
            <textarea
              rows={2}
              required
              value={form.situationBefore}
              onChange={e => setForm({ ...form, situationBefore: e.target.value })}
              placeholder="Jelaskan apa yang sedang terjadi sesaat sebelum perilaku muncul..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Perilaku yang Diamati Secara Faktual (Objektif) *
            </label>
            <textarea
              rows={2}
              required
              value={form.behaviorObserved}
              onChange={e => setForm({ ...form, behaviorObserved: e.target.value })}
              placeholder="Gambarkan apa yang terdengar atau terlihat jelas tanpa prasangka..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Respons / Tindakan Langsung Staf *</label>
              <textarea
                rows={2}
                required
                value={form.staffResponse}
                onChange={e => setForm({ ...form, staffResponse: e.target.value })}
                placeholder="Bagaimana guru/pendamping merespons saat kejadian..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Strategi Dukungan yang Diberikan *</label>
              <textarea
                rows={2}
                required
                value={form.supportStrategyGiven}
                onChange={e => setForm({ ...form, supportStrategyGiven: e.target.value })}
                placeholder="misal: Jam pasir visual, sudut tenang, atau bimbingan pilihan..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hasil Setelah Dukungan Diberikan *</label>
              <textarea
                rows={2}
                required
                value={form.resultAfterSupport}
                onChange={e => setForm({ ...form, resultAfterSupport: e.target.value })}
                placeholder="Kondisi siswa sesudah strategi dijalankan..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dampak Terhadap Pembelajaran</label>
              <textarea
                rows={2}
                value={form.impactOnActivity}
                onChange={e => setForm({ ...form, impactOnActivity: e.target.value })}
                placeholder="Pengaruh terhadap alur kegiatan atau rekan sekelas..."
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
              Simpan Observasi Behavior
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
