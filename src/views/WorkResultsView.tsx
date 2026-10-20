import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import {
  saveWorkResultToFirestore,
  deleteWorkResultFromFirestore,
  pushLocalToFirestore,
} from '../lib/firebaseSync';
import { firebaseConfig } from '../lib/firebase';
import { WorkResult, WorkResultType, WorkStatus, Student, MasterClass } from '../types';
import { SaveWorkResultModal } from '../components/modals/SaveWorkResultModal';
import { SaveNameModal } from '../components/modals/SaveNameModal';
import {
  FileCheck2,
  Plus,
  Flame,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Printer,
  Trash2,
  User,
  Calendar,
  Layers,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Tag,
  ChevronRight,
  UserCheck,
  Eye,
  X,
  FileText,
} from 'lucide-react';

interface WorkResultsViewProps {
  onSelectStudent?: (studentId: string) => void;
}

export const WorkResultsView: React.FC<WorkResultsViewProps> = ({ onSelectStudent }) => {
  const { currentUser } = useAuth();

  const [workList, setWorkList] = useState<WorkResult[]>([]);
  const [classes, setClasses] = useState<MasterClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [viewingWork, setViewingWork] = useState<WorkResult | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [works, cls] = await Promise.all([
        api.getWorkResults(),
        api.getClasses(),
      ]);
      setWorkList(works);
      setClasses(cls);
    } catch (err) {
      console.error('Failed to load work results:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSyncFirebase = async () => {
    setIsSyncing(true);
    try {
      await pushLocalToFirestore();
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteWork = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Yakin ingin menghapus dokumen hasil kerja ini dari database dan Firebase?')) {
      return;
    }

    try {
      await api.deleteWorkResult(id);
      await deleteWorkResultFromFirestore(id);
      setWorkList(prev => prev.filter(w => w.id !== id));
      if (viewingWork?.id === id) setViewingWork(null);
    } catch (err) {
      console.error('Failed to delete work result:', err);
    }
  };

  // Filtered list
  const filteredWorks = workList.filter(item => {
    const matchesSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.studentName && item.studentName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.className && item.className.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === 'all' || item.workType === selectedType;
    const matchesClass = selectedClass === 'all' || item.classId === selectedClass;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;

    return matchesSearch && matchesType && matchesClass && matchesStatus;
  });

  const getStatusBadge = (status: WorkStatus) => {
    switch (status) {
      case 'Selesai':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Dalam Proses':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Ditinjau Pimpinan':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Disetujui':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Draft':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getWorkTypeBadge = (type: WorkResultType) => {
    switch (type) {
      case 'intervensi_siswa':
        return { label: 'Intervensi & Hasil Belajar', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'evaluasi_emosi':
        return { label: 'Evaluasi Emosi & CICO', color: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'skrining_ldss':
        return { label: 'Skrining LDSS', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' };
      case 'case_conference':
        return { label: 'Case Conference', color: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'supervisi_inklusif':
        return { label: 'Supervisi Inklusif', color: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'observasi_perilaku':
        return { label: 'Observasi Perilaku', color: 'bg-rose-50 text-rose-800 border-rose-200' };
      case 'portofolio_siswa':
        return { label: 'Portofolio Siswa', color: 'bg-cyan-50 text-cyan-800 border-cyan-200' };
      default:
        return { label: 'Dokumen MTSS', color: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  // Metrics
  const totalCount = workList.length;
  const selesaiCount = workList.filter(w => w.status === 'Selesai' || w.status === 'Disetujui').length;
  const inReviewCount = workList.filter(w => w.status === 'Ditinjau Pimpinan' || w.status === 'Dalam Proses').length;

  return (
    <div className="space-y-5">
      {/* Top Banner Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="p-2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-xl shadow-xs">
                <FileCheck2 className="w-5 h-5" />
              </span>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Data Hasil Kerja & Dokumen MTSS
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-300">
                <Flame className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                Firebase Firestore: <strong className="font-mono">{firebaseConfig.projectId}</strong>
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Pencatatan data intervensi, asesmen, supervisi, dan observasi perilaku lengkap dengan identitas pengisi dan tersimpan permanen di cloud.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Simpan / Ganti Nama Button */}
            <button
              onClick={() => setIsNameModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
              title="Ubah nama pengisi aktif yang tersimpan di sistem"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Nama: <strong className="text-slate-900">{currentUser?.name.split(',')[0]}</strong></span>
            </button>

            {/* Sync Cloud Button */}
            <button
              onClick={handleSyncFirebase}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-900 bg-amber-100/70 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-700 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkron Cloud'}</span>
            </button>

            {/* Primary Add Button */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Simpan Data Hasil Kerja Baru</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
            <div className="text-[11px] font-semibold text-slate-500">Total Hasil Kerja Tersimpan</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{totalCount} Dokumen</div>
          </div>
          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/60">
            <div className="text-[11px] font-semibold text-emerald-800">Tersimpan di Cloud Firebase</div>
            <div className="text-xl font-bold text-emerald-900 mt-0.5 flex items-center gap-1">
              <span>{totalCount}</span>
              <span className="text-[10px] font-normal text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded">100% Synced</span>
            </div>
          </div>
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/60">
            <div className="text-[11px] font-semibold text-blue-800">Status Selesai / Disetujui</div>
            <div className="text-xl font-bold text-blue-900 mt-0.5">{selesaiCount} Dokumen</div>
          </div>
          <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200/60">
            <div className="text-[11px] font-semibold text-purple-800">Dalam Proses / Review</div>
            <div className="text-xl font-bold text-purple-900 mt-0.5">{inReviewCount} Dokumen</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan judul, nama pengisi, siswa, atau uraian kegiatan..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-slate-700"
          >
            <option value="all">Semua Kategori Tugas</option>
            <option value="intervensi_siswa">Intervensi & Belajar</option>
            <option value="evaluasi_emosi">Evaluasi Emosi & CICO</option>
            <option value="skrining_ldss">Skrining LDSS</option>
            <option value="case_conference">Case Conference</option>
            <option value="supervisi_inklusif">Supervisi Pimpinan</option>
            <option value="observasi_perilaku">Observasi Perilaku</option>
            <option value="portofolio_siswa">Portofolio Siswa</option>
            <option value="rapat_koordinasi">Rapat Koordinasi</option>
            <option value="laporan_ortu">Komunikasi Ortu</option>
          </select>

          {/* Class Filter */}
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-slate-700"
          >
            <option value="all">Semua Rombel</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-slate-700"
          >
            <option value="all">Semua Status</option>
            <option value="Selesai">Selesai</option>
            <option value="Dalam Proses">Dalam Proses</option>
            <option value="Ditinjau Pimpinan">Ditinjau Pimpinan</option>
            <option value="Disetujui">Disetujui</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>

      {/* List of Work Results */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <div className="w-8 h-8 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-medium">Memuat data hasil kerja dari database & Firebase...</p>
        </div>
      ) : filteredWorks.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">Belum ada hasil kerja yang cocok</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-0.5">
              Mulai catat dan simpan hasil kerja Anda ke Firebase menggunakan tombol di bawah ini.
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Simpan Hasil Kerja Baru</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredWorks.map(item => {
            const typeInfo = getWorkTypeBadge(item.workType);
            return (
              <div
                key={item.id}
                onClick={() => setViewingWork(item)}
                className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group space-y-4"
              >
                {/* Header card */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${typeInfo.color}`}>
                      {typeInfo.label}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full font-semibold">
                        <Flame className="w-3 h-3 text-amber-600" />
                        Firebase
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h3>

                  {/* Author & Student metadata */}
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 pt-1">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center">
                        {item.authorName.charAt(0)}
                      </div>
                      <span className="font-semibold text-slate-800">{item.authorName}</span>
                      <span className="text-[10px] text-slate-400">({item.authorRole})</span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{item.date} {item.time ? `• ${item.time}` : ''}</span>
                    </div>
                  </div>

                  {/* Student Tag if assigned */}
                  {(item.studentName || item.className) && (
                    <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 truncate">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-800 truncate">{item.studentName || 'Seluruh Siswa'}</span>
                        {item.className && (
                          <span className="text-[10px] text-slate-500 bg-slate-200/70 px-1.5 py-0.2 rounded font-medium">
                            {item.className}
                          </span>
                        )}
                      </div>
                      {item.scoreOrRating && (
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded shrink-0">
                          {item.scoreOrRating}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Description Preview */}
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Outcomes & Follow up preview */}
                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  {item.outcomes && (
                    <div className="text-[11px] text-slate-700">
                      <strong className="text-slate-900 font-semibold">Capaian:</strong> {item.outcomes}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                      <span>Doc: {item.id}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleDeleteWork(item.id, e)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus dari Firebase"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setViewingWork(item)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform"
                      >
                        <span>Lihat Rincian</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal for Viewing / Printing Work Result */}
      {viewingWork && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-4 animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-300">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base leading-tight">Lembar Dokumen Hasil Kerja MTSS</h3>
                  <p className="text-[11px] text-slate-300">SD Lazuardi Global Compassionate School</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Cetak Dokumen"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewingWork(null)}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Firestore Badge */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-600" />
                  <span className="font-semibold text-amber-900">
                    Tersimpan di Cloud Firestore ({firebaseConfig.projectId})
                  </span>
                </div>
                <span className="font-mono text-[10px] text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded">
                  Doc ID: {viewingWork.id}
                </span>
              </div>

              {/* Title & Metadata */}
              <div className="space-y-2">
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-lg border ${getWorkTypeBadge(viewingWork.workType).color}`}>
                  {getWorkTypeBadge(viewingWork.workType).label}
                </span>
                <h2 className="text-lg font-bold text-slate-900 leading-snug">
                  {viewingWork.title}
                </h2>
                <div className="flex flex-wrap gap-y-1 gap-x-4 text-xs text-slate-500 pt-1 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-slate-400">Pengisi: </span>
                    <strong className="text-slate-800">{viewingWork.authorName}</strong> ({viewingWork.authorRole})
                  </div>
                  <div>
                    <span className="text-slate-400">Tanggal: </span>
                    <strong className="text-slate-800">{viewingWork.date} {viewingWork.time ? `• ${viewingWork.time}` : ''}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Status: </span>
                    <strong className="text-slate-800">{viewingWork.status}</strong>
                  </div>
                </div>
              </div>

              {/* Student info */}
              {(viewingWork.studentName || viewingWork.className) && (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Siswa Terkait:</span>
                    <span className="font-bold text-slate-900 text-sm">{viewingWork.studentName || 'Seluruh Kelas'}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Rombel / Kelas:</span>
                    <span className="font-bold text-slate-900 text-sm">{viewingWork.className || '-'}</span>
                  </div>
                  {viewingWork.scoreOrRating && (
                    <div className="col-span-2 pt-1 border-t border-slate-200/60">
                      <span className="text-[11px] text-slate-400 block font-medium">Capaian / Skor Terukur:</span>
                      <span className="font-semibold text-blue-700">{viewingWork.scoreOrRating}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Sections */}
              <div className="space-y-4 text-xs sm:text-sm">
                <div>
                  <h4 className="font-bold text-slate-800 mb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-500">
                    Uraian Pelaksanaan & Temuan Kegiatan
                  </h4>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 text-slate-800 leading-relaxed whitespace-pre-line">
                    {viewingWork.description}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 mb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-500">
                    Hasil & Capaian yang Diperoleh
                  </h4>
                  <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100 text-slate-800 leading-relaxed whitespace-pre-line">
                    {viewingWork.outcomes || '-'}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 mb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-500">
                    Rencana Tindak Lanjut & Rekomendasi
                  </h4>
                  <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100 text-slate-800 leading-relaxed whitespace-pre-line">
                    {viewingWork.followUpPlan || '-'}
                  </div>
                </div>

                {viewingWork.tags && viewingWork.tags.length > 0 && (
                  <div className="pt-2 flex items-center gap-1.5 flex-wrap">
                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                    {viewingWork.tags.map(t => (
                      <span key={t} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-400">
                Dicatat pada {new Date(viewingWork.createdAt).toLocaleString('id-ID')}
              </span>
              <button
                onClick={() => setViewingWork(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create & Save Work Result */}
      <SaveWorkResultModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          loadData();
        }}
      />

      {/* Modal: Save / Change Author Name */}
      <SaveNameModal
        isOpen={isNameModalOpen}
        onClose={() => setIsNameModalOpen(false)}
        onSuccess={() => {
          loadData();
        }}
      />
    </div>
  );
};
