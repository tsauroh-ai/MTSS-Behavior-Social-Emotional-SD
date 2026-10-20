import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import {
  LdssRecord,
  LdssStatus,
  LdssScores,
  Student,
  MasterClass,
  TierLevel,
} from '../types';
import {
  ClipboardCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Plus,
  Eye,
  Edit3,
  ExternalLink,
  ShieldCheck,
  Printer,
  FileText,
  UserCheck,
} from 'lucide-react';
import { Modal } from '../components/common/Modal';

interface LdssScreeningViewProps {
  onSelectStudent?: (studentId: string) => void;
}

export const LdssScreeningView: React.FC<LdssScreeningViewProps> = ({ onSelectStudent }) => {
  const { currentUser, canWriteObservations, isKoordinator, isPimpinan, isAdmin } = useAuth();

  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<MasterClass[]>([]);
  const [ldssRecords, setLdssRecords] = useState<LdssRecord[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State for filling/editing LDSS
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedStudentForForm, setSelectedStudentForForm] = useState<Student | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewRecord, setPreviewRecord] = useState<LdssRecord | null>(null);

  // Form Fields
  const [findingsSummary, setFindingsSummary] = useState('');
  const [targetGoals, setTargetGoals] = useState('');
  const [scores, setScores] = useState<LdssScores>({
    motorikSensori: 4,
    komunikasiBahasa: 4,
    kognitifAkademik: 4,
    perilakuRegulasiEmosi: 3,
    interaksiSosial: 4,
    kemandirian: 4,
  });
  const [recommendedTier, setRecommendedTier] = useState<TierLevel>('Tier 2');
  const [followUpRecommendations, setFollowUpRecommendations] = useState<string[]>(['Supervisi']);
  const [documentDriveUrl, setDocumentDriveUrl] = useState('');
  const [notes, setNotes] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [allStudents, allClasses, allLdss] = await Promise.all([
        api.getStudents(),
        api.getClasses(),
        api.getLdssRecords(),
      ]);
      setStudents(allStudents);
      setClasses(allClasses);
      setLdssRecords(allLdss);
    } catch (err) {
      console.error('Failed to load LDSS data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter students
  const filteredStudents = students.filter(st => {
    if (selectedClassId !== 'all' && st.classId !== selectedClassId) return false;
    const rec = ldssRecords.find(l => l.studentId === st.id);
    const recStatus = rec ? rec.status : 'Belum Diisi';
    if (statusFilter !== 'all' && recStatus !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!st.fullName.toLowerCase().includes(q) && !st.className.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const openFormModal = (student: Student) => {
    setSelectedStudentForForm(student);
    const existing = ldssRecords.find(l => l.studentId === student.id);
    if (existing) {
      setFindingsSummary(existing.findingsSummary || '');
      setTargetGoals(existing.targetGoals || '');
      setScores(existing.scores || {
        motorikSensori: 4,
        komunikasiBahasa: 4,
        kognitifAkademik: 4,
        perilakuRegulasiEmosi: 3,
        interaksiSosial: 4,
        kemandirian: 4,
      });
      setRecommendedTier(existing.recommendedTier || student.currentTier);
      setFollowUpRecommendations(existing.followUpRecommendations || ['Supervisi']);
      setDocumentDriveUrl(existing.documentDriveUrl || '');
      setNotes(existing.notes || '');
    } else {
      setFindingsSummary(student.notes || '');
      setTargetGoals('Pengisian LDSS, melihat behavior dan school readiness');
      setScores({
        motorikSensori: 4,
        komunikasiBahasa: 4,
        kognitifAkademik: 4,
        perilakuRegulasiEmosi: 3,
        interaksiSosial: 4,
        kemandirian: 4,
      });
      setRecommendedTier(student.currentTier);
      setFollowUpRecommendations(['Supervisi']);
      setDocumentDriveUrl('');
      setNotes('');
    }
    setIsFormModalOpen(true);
  };

  const handleSaveLdss = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedStudentForForm) return;

    try {
      await api.saveLdssRecord({
        studentId: selectedStudentForForm.id,
        studentName: selectedStudentForForm.fullName,
        classId: selectedStudentForForm.classId,
        className: selectedStudentForForm.className,
        dateFilled: new Date().toISOString().split('T')[0],
        status: 'Selesai',
        findingsSummary,
        targetGoals,
        scores,
        recommendedTier,
        followUpRecommendations,
        documentDriveUrl: documentDriveUrl || undefined,
        notes: notes || undefined,
      });

      setIsFormModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan instrumen LDSS');
    }
  };

  const toggleRecommendation = (item: string) => {
    if (followUpRecommendations.includes(item)) {
      setFollowUpRecommendations(followUpRecommendations.filter(r => r !== item));
    } else {
      setFollowUpRecommendations([...followUpRecommendations, item]);
    }
  };

  const completedCount = ldssRecords.filter(l => l.status === 'Selesai').length;
  const inProgressCount = ldssRecords.filter(l => l.status === 'Dalam Proses').length;
  const uncompletedCount = students.length - completedCount - inProgressCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Instrumen Skrining LDSS SD Lazuardi GCS</h1>
              <p className="text-xs text-slate-500">
                Lazuardi Disability Screening System: Deteksi dini 6 dimensi sensori, motorik, komunikasi, kognitif, perilaku, dan interaksi
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 font-medium">
            Status: <strong className="text-emerald-700">{completedCount} Selesai</strong> / {students.length} Siswa
          </span>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-2xs bg-emerald-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800">✅ LDSS Terisi & Selesai</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-1.5">{completedCount} Siswa</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Telah memiliki profil komprehensif</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-2xs bg-amber-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800">⏳ Dalam Proses Asesmen</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-1.5">{inProgressCount} Siswa</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Menunggu kelengkapan observasi</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">📋 Belum Diisi</span>
            <AlertCircle className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-700 mt-1.5">{Math.max(0, uncompletedCount)} Siswa</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Prioritaskan siswa dengan flag MTSS</p>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500 font-medium">Kelas:</span>
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="font-bold text-slate-800 bg-transparent border-none focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Rombel</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
            <span className="text-slate-500 font-medium">Status LDSS:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="font-bold text-slate-800 bg-transparent border-none focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="Selesai">Selesai</option>
              <option value="Dalam Proses">Dalam Proses</option>
              <option value="Belum Diisi">Belum Diisi</option>
            </select>
          </div>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari siswa atau kelas..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3 w-12 text-center">No</th>
                <th className="py-2.5 px-3 min-w-[180px]">Siswa & Kelas</th>
                <th className="py-2.5 px-3 min-w-[70px]">Tier</th>
                <th className="py-2.5 px-3 min-w-[110px] text-center">Status LDSS</th>
                <th className="py-2.5 px-3 min-w-[220px]">Temuan Observasi & Target</th>
                <th className="py-2.5 px-3 min-w-[150px]">Skor 6 Dimensi</th>
                <th className="py-2.5 px-3 min-w-[140px]">Tindak Lanjut</th>
                <th className="py-2.5 px-3 min-w-[100px] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tidak ditemukan data siswa sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st, idx) => {
                  const rec = ldssRecords.find(l => l.studentId === st.id);
                  const isDone = rec && rec.status === 'Selesai';

                  return (
                    <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-3">
                        <button
                          onClick={() => onSelectStudent && onSelectStudent(st.id)}
                          className="font-bold text-slate-900 hover:text-purple-600 text-left transition-colors cursor-pointer"
                        >
                          {st.fullName}
                        </button>
                        <div className="text-[10px] text-slate-400">
                          {st.className} • NISN: {st.nisn}
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            st.currentTier === 'Tier 3'
                              ? 'bg-rose-100 text-rose-800'
                              : st.currentTier === 'Tier 2'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {st.currentTier}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3 text-center">
                        {isDone ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Selesai</span>
                          </span>
                        ) : rec?.status === 'Dalam Proses' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Dalam Proses</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                            Belum Diisi
                          </span>
                        )}
                      </td>

                      {/* Temuan & Target */}
                      <td className="py-2.5 px-3">
                        {rec ? (
                          <div className="space-y-1">
                            {rec.findingsSummary && (
                              <p className="text-[11px] text-slate-800 font-medium line-clamp-2">
                                <span className="text-slate-500 font-normal">Temuan:</span> {rec.findingsSummary}
                              </p>
                            )}
                            {rec.targetGoals && (
                              <p className="text-[10px] text-purple-700 font-semibold line-clamp-1">
                                🎯 {rec.targetGoals}
                              </p>
                            )}
                            {rec.documentDriveUrl && (
                              <a
                                href={rec.documentDriveUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] text-sky-600 hover:underline font-semibold"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Folder Google Drive Asesmen</span>
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Belum ada temuan tercatat</span>
                        )}
                      </td>

                      {/* Skor Dimensi */}
                      <td className="py-2.5 px-3">
                        {rec?.scores ? (
                          <div className="grid grid-cols-3 gap-1 text-[10px]">
                            <div className="bg-slate-50 p-1 rounded border border-slate-100 text-center">
                              <span className="text-slate-400 block text-[9px]">Sensori</span>
                              <strong className="text-slate-800">{rec.scores.motorikSensori}/5</strong>
                            </div>
                            <div className="bg-slate-50 p-1 rounded border border-slate-100 text-center">
                              <span className="text-slate-400 block text-[9px]">Bahasa</span>
                              <strong className="text-slate-800">{rec.scores.komunikasiBahasa}/5</strong>
                            </div>
                            <div className="bg-slate-50 p-1 rounded border border-slate-100 text-center">
                              <span className="text-slate-400 block text-[9px]">Emosi</span>
                              <strong className={rec.scores.perilakuRegulasiEmosi <= 2 ? 'text-rose-700' : 'text-slate-800'}>
                                {rec.scores.perilakuRegulasiEmosi}/5
                              </strong>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Tindak Lanjut */}
                      <td className="py-2.5 px-3">
                        {rec?.followUpRecommendations && rec.followUpRecommendations.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {rec.followUpRecommendations.map((r, i) => (
                              <span
                                key={i}
                                className="text-[9px] font-semibold bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded border border-purple-200"
                              >
                                {r}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {canWriteObservations && (
                            <button
                              onClick={() => openFormModal(st)}
                              className="px-2.5 py-1 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors cursor-pointer"
                            >
                              {rec ? 'Edit LDSS' : '+ Isi LDSS'}
                            </button>
                          )}
                          {rec && (
                            <button
                              onClick={() => {
                                setPreviewRecord(rec);
                                setIsPreviewModalOpen(true);
                              }}
                              className="p-1 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                              title="Lihat Detail Skrining"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Form Pengisian Skrining LDSS */}
      {isFormModalOpen && selectedStudentForForm && (
        <Modal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          title={`Formulir Skrining LDSS: ${selectedStudentForForm.fullName} (${selectedStudentForForm.className})`}
          size="xl"
        >
          <form onSubmit={handleSaveLdss} className="space-y-4 text-xs">
            <div className="bg-purple-50/60 p-3 rounded-xl border border-purple-200 flex items-start gap-2.5">
              <ClipboardCheck className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div className="text-[11px] text-purple-900 leading-relaxed">
                Instrumen <strong>Lazuardi Disability Screening System (LDSS)</strong> digunakan oleh wali kelas dan tim inklusi untuk memetakan kesiapan belajar, regulasi emosi, dan kebutuhan adaptasi kurikulum.
              </div>
            </div>

            {/* 6 Dimensi Skrining */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 text-xs">Penilaian 6 Dimensi Perkembangan (Skala 1 s/d 5):</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {/* Motorik & Sensori */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">1. Motorik & Sensori</span>
                    <strong className="text-purple-700 font-mono text-sm">{scores.motorikSensori}/5</strong>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={scores.motorikSensori}
                    onChange={e => setScores({ ...scores, motorikSensori: parseInt(e.target.value) })}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400">Keseimbangan, motorik kasar/halus, toleransi suara</p>
                </div>

                {/* Komunikasi & Bahasa */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">2. Komunikasi & Bahasa</span>
                    <strong className="text-purple-700 font-mono text-sm">{scores.komunikasiBahasa}/5</strong>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={scores.komunikasiBahasa}
                    onChange={e => setScores({ ...scores, komunikasiBahasa: parseInt(e.target.value) })}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400">Pemahaman instruksi, artikulasi bicara, ekspresi</p>
                </div>

                {/* Kognitif & Akademik */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">3. Kesiapan Akademik</span>
                    <strong className="text-purple-700 font-mono text-sm">{scores.kognitifAkademik}/5</strong>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={scores.kognitifAkademik}
                    onChange={e => setScores({ ...scores, kognitifAkademik: parseInt(e.target.value) })}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400">Daya ingat, pemahaman angka/huruf, atensi</p>
                </div>

                {/* Perilaku & Regulasi Emosi */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">4. Perilaku & Regulasi Emosi</span>
                    <strong className="text-purple-700 font-mono text-sm">{scores.perilakuRegulasiEmosi}/5</strong>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={scores.perilakuRegulasiEmosi}
                    onChange={e => setScores({ ...scores, perilakuRegulasiEmosi: parseInt(e.target.value) })}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400">Toleransi frustrasi, kontrol diri, transisi rutinitas</p>
                </div>

                {/* Interaksi Sosial */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">5. Interaksi Sosial</span>
                    <strong className="text-purple-700 font-mono text-sm">{scores.interaksiSosial}/5</strong>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={scores.interaksiSosial}
                    onChange={e => setScores({ ...scores, interaksiSosial: parseInt(e.target.value) })}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400">Kontak mata, relasi teman sebaya, berbagi peran</p>
                </div>

                {/* Kemandirian Diri */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">6. Kemandirian Diri</span>
                    <strong className="text-purple-700 font-mono text-sm">{scores.kemandirian}/5</strong>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={scores.kemandirian}
                    onChange={e => setScores({ ...scores, kemandirian: parseInt(e.target.value) })}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400">Toilet training, merapikan barang, makan mandiri</p>
                </div>
              </div>
            </div>

            {/* Temuan & Target */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Temuan Observasi / Catatan Khusus:
                </label>
                <textarea
                  rows={3}
                  value={findingsSummary}
                  onChange={e => setFindingsSummary(e.target.value)}
                  placeholder="Contoh: Kesulitan mempertahankan fokus klasikal, picky eater, butuh instruksi individual..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Target Perkembangan / Kesiapan Belajar:
                </label>
                <textarea
                  rows={3}
                  value={targetGoals}
                  onChange={e => setTargetGoals(e.target.value)}
                  placeholder="Contoh: Peningkatan durasi fokus 15 menit, evaluasi berkala bersama wali kelas..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-purple-500"
                  required
                />
              </div>
            </div>

            {/* Rekomendasi Tier MTSS & Tindak Lanjut */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Rekomendasi Tingkat Tier MTSS:</label>
                <select
                  value={recommendedTier}
                  onChange={e => setRecommendedTier(e.target.value as TierLevel)}
                  className="w-full p-2 border border-slate-200 rounded-xl bg-white font-bold text-slate-800"
                >
                  <option value="Tier 1">Tier 1: Dukungan Universal Kelas</option>
                  <option value="Tier 2">Tier 2: Targeted Support / Kelompok Kecil</option>
                  <option value="Tier 3">Tier 3: Intensive Individual / BIP & Terapi</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Link Google Drive Asesmen (Jika Ada):</label>
                <input
                  type="url"
                  value={documentDriveUrl}
                  onChange={e => setDocumentDriveUrl(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/..."
                  className="w-full p-2 border border-slate-200 rounded-xl bg-white"
                />
              </div>
            </div>

            {/* Checklist Tindak Lanjut */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Rekomendasi Tindak Lanjut Sekolah:</label>
              <div className="flex flex-wrap gap-2">
                {[
                  'Supervisi',
                  'Case Conference',
                  'Check in & Check Out 21x',
                  'Pertemuan Orang Tua',
                  'Rujukan Klinis / Psikotes',
                  'Terapi Wicara',
                  'Okupasi Terapi',
                ].map(item => {
                  const isChecked = followUpRecommendations.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleRecommendation(item)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {isChecked ? '✓ ' : '+ '} {item}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Simpan & Validasi LDSS
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Preview Detail LDSS */}
      {isPreviewModalOpen && previewRecord && (
        <Modal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          title={`Lembar Deteksi Dini LDSS: ${previewRecord.studentName}`}
          size="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-200">
              <div>
                <h4 className="font-bold text-purple-950 text-sm">{previewRecord.studentName}</h4>
                <p className="text-[11px] text-purple-700">
                  {previewRecord.className} • Tanggal Pengisian: {previewRecord.dateFilled}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-600 text-white">
                Rekomendasi: {previewRecord.recommendedTier}
              </span>
            </div>

            {/* Scores Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-2.5 bg-slate-50 font-bold text-slate-700 border-b border-slate-200">
                Skor 6 Dimensi Skrining (Skala 1 - 5)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 divide-x divide-y divide-slate-100 text-center">
                <div className="p-2">
                  <span className="text-[10px] text-slate-500 block">Sensori & Motorik</span>
                  <strong className="text-sm font-bold text-slate-800">{previewRecord.scores.motorikSensori} / 5</strong>
                </div>
                <div className="p-2">
                  <span className="text-[10px] text-slate-500 block">Komunikasi & Bahasa</span>
                  <strong className="text-sm font-bold text-slate-800">{previewRecord.scores.komunikasiBahasa} / 5</strong>
                </div>
                <div className="p-2">
                  <span className="text-[10px] text-slate-500 block">Kesiapan Belajar</span>
                  <strong className="text-sm font-bold text-slate-800">{previewRecord.scores.kognitifAkademik} / 5</strong>
                </div>
                <div className="p-2">
                  <span className="text-[10px] text-slate-500 block">Regulasi Emosi</span>
                  <strong className="text-sm font-bold text-slate-800">{previewRecord.scores.perilakuRegulasiEmosi} / 5</strong>
                </div>
                <div className="p-2">
                  <span className="text-[10px] text-slate-500 block">Interaksi Sosial</span>
                  <strong className="text-sm font-bold text-slate-800">{previewRecord.scores.interaksiSosial} / 5</strong>
                </div>
                <div className="p-2">
                  <span className="text-[10px] text-slate-500 block">Kemandirian</span>
                  <strong className="text-sm font-bold text-slate-800">{previewRecord.scores.kemandirian} / 5</strong>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700 block mb-0.5">Temuan Observasi:</span>
                <p className="text-slate-800">{previewRecord.findingsSummary}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700 block mb-0.5">Target Capaian:</span>
                <p className="text-slate-800">{previewRecord.targetGoals}</p>
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-700 block mb-1">Rekomendasi Tindak Lanjut:</span>
              <div className="flex flex-wrap gap-1.5">
                {previewRecord.followUpRecommendations.map((r, i) => (
                  <span key={i} className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-md font-bold text-[10px]">
                    {r}
                  </span>
                ))}
              </div>
            </div>

            {previewRecord.documentDriveUrl && (
              <div className="p-2.5 bg-sky-50 rounded-xl border border-sky-200 flex items-center justify-between">
                <span className="text-sky-900 font-medium text-[11px]">Berkas Pendukung / Google Drive:</span>
                <a
                  href={previewRecord.documentDriveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-sky-700 hover:underline flex items-center gap-1 text-[11px]"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka Folder Drive</span>
                </a>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-semibold cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Lembar Skrining</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
