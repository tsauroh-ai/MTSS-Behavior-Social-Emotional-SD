import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { saveWorkResultToFirestore } from '../../lib/firebaseSync';
import { firebaseConfig } from '../../lib/firebase';
import { Student, MasterClass, WorkResult, WorkResultType, WorkStatus } from '../../types';
import {
  FileCheck2,
  X,
  Flame,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  User,
  Calendar,
  Clock,
  School,
  Layers,
  Tag,
  ArrowRight,
  Save,
} from 'lucide-react';

interface SaveWorkResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (work: WorkResult) => void;
  initialStudentId?: string;
  initialClassId?: string;
  initialWorkType?: WorkResultType;
}

const WORK_TYPES: { id: WorkResultType; label: string; description: string; badgeColor: string }[] = [
  {
    id: 'intervensi_siswa',
    label: 'Catatan Intervensi & Hasil Belajar/Perilaku',
    description: 'Catatan hasil pelaksanaan intervensi terstruktur dan respon langsung siswa',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    id: 'evaluasi_emosi',
    label: 'Evaluasi Emosi Siswa & CICO 21 Hari',
    description: 'Hasil evaluasi rutinitas check-in dan check-out emosi serta kemajuan regulasi diri',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    id: 'skrining_ldss',
    label: 'Hasil Skrining & Pengamatan LDSS',
    description: 'Hasil pengamatan 6 dimensi Lazuardi Disability Screening System',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  {
    id: 'case_conference',
    label: 'Rekomendasi / Notulensi Case Conference',
    description: 'Hasil musyawarah multidisipliner guru, orang tua, pimpinan, dan terapis',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  {
    id: 'supervisi_inklusif',
    label: 'Laporan Supervisi Pimpinan & Kabid Inklusif',
    description: 'Hasil observasi kelas dan supervisi pembelajaran inklusif oleh Kepala Sekolah & Kabid',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    id: 'observasi_perilaku',
    label: 'Catatan Observasi Perilaku & Temuan Kelas',
    description: 'Uraian temuan insiden atau pola perilaku konkret di lingkungan sekolah',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  {
    id: 'portofolio_siswa',
    label: 'Portofolio & Bukti Hasil Belajar Siswa',
    description: 'Dokumentasi karya, pengerjaan proyek, dan pencapaian tugas mandiri siswa',
    badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  },
  {
    id: 'rapat_koordinasi',
    label: 'Hasil Rapat Koordinasi Tim MTSS & Guru Paralel',
    description: 'Catatan kesepakatan strategi pembelajaran tim kelas paralel atau lintas jenjang',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  {
    id: 'laporan_ortu',
    label: 'Komunikasi & Kesepakatan Bersama Orang Tua',
    description: 'Hasil home-visit, pertemuan berkala, atau kesepakatan tindak lanjut di rumah',
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
  },
];

export const SaveWorkResultModal: React.FC<SaveWorkResultModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialStudentId,
  initialClassId,
  initialWorkType = 'intervensi_siswa',
}) => {
  const { currentUser, updateUserName } = useAuth();

  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<MasterClass[]>([]);

  // Form Fields
  const [authorName, setAuthorName] = useState('');
  const [authorRole, setAuthorRole] = useState('');
  const [saveAuthorAsDefault, setSaveAuthorAsDefault] = useState(false);

  const [title, setTitle] = useState('');
  const [workType, setWorkType] = useState<WorkResultType>(initialWorkType);
  const [classId, setClassId] = useState(initialClassId || '');
  const [studentId, setStudentId] = useState(initialStudentId || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [status, setStatus] = useState<WorkStatus>('Selesai');
  const [scoreOrRating, setScoreOrRating] = useState('');
  const [description, setDescription] = useState('');
  const [outcomes, setOutcomes] = useState('');
  const [followUpPlan, setFollowUpPlan] = useState('');
  const [tagInput, setTagInput] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ docId: string; timestamp: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load students & classes
  useEffect(() => {
    if (isOpen) {
      Promise.all([api.getStudents(), api.getClasses()])
        .then(([sList, cList]) => {
          setStudents(sList);
          setClasses(cList);
        })
        .catch(console.error);

      // Prepopulate author name
      const storedAuthor = localStorage.getItem('mtss_last_author_name') || currentUser?.name || '';
      const storedRole = currentUser?.roleTitle || 'Wali Kelas';
      setAuthorName(storedAuthor);
      setAuthorRole(storedRole);

      if (initialStudentId) setStudentId(initialStudentId);
      if (initialClassId) setClassId(initialClassId);
      if (initialWorkType) setWorkType(initialWorkType);

      setSuccessInfo(null);
      setErrorMsg(null);
    }
  }, [isOpen, currentUser, initialStudentId, initialClassId, initialWorkType]);

  if (!isOpen) return null;

  // Selected student info
  const selectedStudent = students.find(s => s.id === studentId);
  const selectedClass = classes.find(c => c.id === (classId || selectedStudent?.classId));

  const filteredStudents = classId ? students.filter(s => s.classId === classId) : students;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !authorName.trim() || !description.trim()) {
      setErrorMsg('Mohon isi Judul, Nama Pengisi, dan Uraian Hasil Kerja.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // 1. If saveAuthorAsDefault is checked, update user name everywhere
      if (saveAuthorAsDefault && authorName.trim() !== currentUser?.name) {
        await updateUserName(authorName.trim(), authorRole.trim());
      } else {
        localStorage.setItem('mtss_last_author_name', authorName.trim());
      }

      const activeWorkTypeObj = WORK_TYPES.find(w => w.id === workType);
      const generatedId = `wr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

      const tagsList = tagInput
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const workPayload: WorkResult = {
        id: generatedId,
        title: title.trim(),
        workType,
        workTypeLabel: activeWorkTypeObj?.label || 'Hasil Kerja MTSS',
        authorName: authorName.trim(),
        authorRole: authorRole.trim() || 'Tim MTSS',
        authorId: currentUser?.id,
        studentId: studentId || undefined,
        studentName: selectedStudent?.fullName || undefined,
        classId: selectedClass?.id || selectedStudent?.classId || undefined,
        className: selectedClass?.name || selectedStudent?.className || undefined,
        date,
        time,
        description: description.trim(),
        outcomes: outcomes.trim() || 'Aktivitas berhasil dilaksanakan sesuai rencana.',
        followUpPlan: followUpPlan.trim() || 'Pantau perkembangan pada siklus berikutnya.',
        status,
        scoreOrRating: scoreOrRating.trim() || undefined,
        tags: tagsList.length > 0 ? tagsList : ['MTSS', selectedClass?.name || 'SD Lazuardi GCS'],
        firebaseSynced: true,
        firebaseDocId: generatedId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 2. Direct save to Firebase Firestore
      const firestoreResult = await saveWorkResultToFirestore(workPayload);

      // 3. Save to backend local database for offline safety
      const savedToLocal = await api.saveWorkResult(workPayload);

      setSuccessInfo({
        docId: firestoreResult.docId,
        timestamp: new Date().toLocaleTimeString('id-ID'),
      });

      if (onSuccess) {
        onSuccess(savedToLocal || workPayload);
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Failed to save work result:', err);
      setErrorMsg(err.message || 'Gagal menyimpan hasil kerja ke Firebase.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-4 animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Header with Firebase Live Status */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base leading-tight">Simpan Data Hasil Kerja ke Firebase</h3>
                <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-semibold">
                  Firestore: {firebaseConfig.projectId}
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Pencatatan resmi hasil intervensi, asesmen, atau observasi siswa SD Lazuardi GCS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successInfo && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-emerald-900 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-xs sm:text-sm">Data Hasil Kerja Berhasil Disimpan di Firebase!</p>
                <p className="text-[11px] text-emerald-700">
                  ID Dokumen Firestore: <code className="font-mono font-semibold">{successInfo.docId}</code> • Jam {successInfo.timestamp}
                </p>
              </div>
            </div>
          )}

          {/* Section 1: Data Pengisi (Simpan Nama) */}
          <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                Identitas Pengisi / Penulis Hasil Kerja
              </span>
              <span className="text-[10px] text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md font-medium">
                Fitur Simpan Nama
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nama Guru / Petugas <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={e => setAuthorName(e.target.value)}
                  placeholder="Contoh: Ibu Dewi Sartika, S.Pd. / Bu Tsauroh"
                  required
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Jabatan / Peran
                </label>
                <input
                  type="text"
                  value={authorRole}
                  onChange={e => setAuthorRole(e.target.value)}
                  placeholder="Contoh: Wali Kelas 1 Kinabalu, Koordinator MTSS"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-600">
              <input
                type="checkbox"
                id="saveAuthorAsDefault"
                checked={saveAuthorAsDefault}
                onChange={e => setSaveAuthorAsDefault(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="saveAuthorAsDefault" className="cursor-pointer select-none">
                Simpan nama ini sebagai profil default dan sinkronkan ke Firebase Users
              </label>
            </div>
          </div>

          {/* Section 2: Kategori & Subjek Pekerjaan */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kategori / Jenis Tugas <span className="text-rose-500">*</span>
              </label>
              <select
                value={workType}
                onChange={e => setWorkType(e.target.value as WorkResultType)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none font-medium text-slate-800"
              >
                {WORK_TYPES.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Rombel / Kelas
              </label>
              <select
                value={classId}
                onChange={e => {
                  setClassId(e.target.value);
                  setStudentId('');
                }}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none text-slate-800"
              >
                <option value="">Semua Rombel / Umum</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} (Tingkat {c.grade})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Siswa Terkait (Opsional)
              </label>
              <select
                value={studentId}
                onChange={e => setStudentId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none text-slate-800"
              >
                <option value="">-- Umum / Rekap Rombel --</option>
                {filteredStudents.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.className}) - {s.currentTier}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 3: Detail Kegiatan & Hasil */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Judul Hasil Kerja / Kegiatan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Contoh: Evaluasi Progres Regulasi Emosi Siswa Kinabalu Siklus 2"
              required
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none font-semibold text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tanggal</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Waktu</label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Status Dokumen</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as WorkStatus)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none font-medium"
              >
                <option value="Selesai">Selesai</option>
                <option value="Dalam Proses">Dalam Proses</option>
                <option value="Ditinjau Pimpinan">Ditinjau Pimpinan</option>
                <option value="Disetujui">Disetujui</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Skor / Capaian</label>
              <input
                type="text"
                value={scoreOrRating}
                onChange={e => setScoreOrRating(e.target.value)}
                placeholder="Contoh: 85%, Sangat Baik"
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Uraian Pelaksanaan & Kegiatan Hasil Kerja <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Deskripsikan proses pengerjaan, observasi yang dilakukan, atau intervensi yang diterapkan..."
              required
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none leading-relaxed text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Hasil / Temuan / Capaian yang Diperoleh
            </label>
            <textarea
              rows={2}
              value={outcomes}
              onChange={e => setOutcomes(e.target.value)}
              placeholder="Hasil konkret yang teramati (misal: siswa dapat tenang dalam 10 menit, tugas mandiri selesai 80%)..."
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none leading-relaxed text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Rencana Tindak Lanjut & Rekomendasi
            </label>
            <textarea
              rows={2}
              value={followUpPlan}
              onChange={e => setFollowUpPlan(e.target.value)}
              placeholder="Langkah berikutnya yang akan dilakukan (misal: lanjutkan token economy, jadwalkan supervisi kepsek)..."
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none leading-relaxed text-slate-800"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Tag / Kata Kunci (Pisahkan dengan koma)
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              placeholder="Contoh: Tier 2, Regulasi Sensori, CICO, Case Conference"
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none text-slate-700"
            />
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Tersimpan di Cloud Firestore & Local Cache</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 rounded-xl shadow-md transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Menyimpan ke Firebase...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Data ke Firebase</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
