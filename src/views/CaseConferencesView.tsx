import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import {
  CaseConferenceRecord,
  CaseConferenceStatus,
  Student,
  MasterClass,
} from '../types';
import {
  Users,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileText,
  Plus,
  Edit,
  ExternalLink,
  HeartHandshake,
  ShieldCheck,
  ChevronRight,
  Filter,
  Search,
} from 'lucide-react';
import { Modal } from '../components/common/Modal';

interface CaseConferencesViewProps {
  onSelectStudent?: (studentId: string) => void;
}

export const CaseConferencesView: React.FC<CaseConferencesViewProps> = ({ onSelectStudent }) => {
  const { currentUser, canConductReview, isKoordinator, isPimpinan, isAdmin } = useAuth();

  const [conferences, setConferences] = useState<CaseConferenceRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<MasterClass[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'Direkomendasikan' | 'Dijadwalkan' | 'Selesai'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedConference, setSelectedConference] = useState<CaseConferenceRecord | null>(null);

  // Form Fields for new schedule / edit
  const [formStudentId, setFormStudentId] = useState('');
  const [formReason, setFormReason] = useState('');
  const [formDate, setFormDate] = useState('2026-10-15');
  const [formTime, setFormTime] = useState('13:00 - 14:30 WIB');
  const [formLocation, setFormLocation] = useState('Ruang Rapat Inklusif SD Lazuardi GCS');
  const [formParticipants, setFormParticipants] = useState<string[]>([
    'M. Ghofar, M.Psi. (Kabid Pendidikan Inklusif)',
    'Dr. Sari, M.Pd. (Kepala Sekolah)',
    'Ovnica Nitasari, S.Psi. (Koordinator MTSS)',
    'Wali Kelas',
    'Orang Tua Siswa',
  ]);
  const [formDraftBip, setFormDraftBip] = useState('');
  const [formAgreedCommitments, setFormAgreedCommitments] = useState('');
  const [formMinutes, setFormMinutes] = useState('');
  const [formStatus, setFormStatus] = useState<CaseConferenceStatus>('Dijadwalkan');

  const loadData = async () => {
    try {
      setLoading(true);
      const [allConf, allSt, allCls] = await Promise.all([
        api.getCaseConferences(),
        api.getStudents(),
        api.getClasses(),
      ]);
      setConferences(allConf);
      setStudents(allSt);
      setClasses(allCls);
      if (allSt.length > 0 && !formStudentId) {
        setFormStudentId(allSt[0].id);
      }
    } catch (err) {
      console.error('Failed to load case conferences', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openNewScheduleModal = (presetStudent?: Student) => {
    if (presetStudent) {
      setFormStudentId(presetStudent.id);
      setFormReason(presetStudent.flagReason || presetStudent.notes || 'Rekomendasi tindak lanjut komprehensif');
    } else {
      const first = students[0];
      if (first) {
        setFormStudentId(first.id);
        setFormReason(first.flagReason || first.notes || '');
      }
    }
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormTime('13:00 - 14:30 WIB');
    setFormLocation('Ruang Rapat Pendidikan Inklusif SD Lazuardi GCS');
    setFormDraftBip('');
    setFormAgreedCommitments('');
    setFormMinutes('');
    setFormStatus('Dijadwalkan');
    setIsScheduleModalOpen(true);
  };

  const handleSaveConference = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const student = students.find(s => s.id === formStudentId);
    if (!student) return;

    try {
      await api.saveCaseConference({
        studentId: student.id,
        studentName: student.fullName,
        classId: student.classId,
        className: student.className,
        teacherName: classes.find(c => c.id === student.classId)?.homeroomTeacherName || 'Wali Kelas',
        reasonForConference: formReason,
        status: formStatus,
        scheduledDate: formDate,
        scheduledTime: formTime,
        location: formLocation,
        participants: formParticipants,
        draftBipTitle: formDraftBip || undefined,
        agreedCommitments: formAgreedCommitments || undefined,
        minutesDecisions: formMinutes || undefined,
        recommendationDate: new Date().toISOString().split('T')[0],
      });

      setIsScheduleModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan case conference');
    }
  };

  const openDetailsModal = (conf: CaseConferenceRecord) => {
    setSelectedConference(conf);
    setFormReason(conf.reasonForConference || '');
    setFormDate(conf.scheduledDate || '');
    setFormTime(conf.scheduledTime || '');
    setFormLocation(conf.location || '');
    setFormParticipants(conf.participants || []);
    setFormDraftBip(conf.draftBipTitle || '');
    setFormAgreedCommitments(conf.agreedCommitments || '');
    setFormMinutes(conf.minutesDecisions || '');
    setFormStatus(conf.status);
    setIsDetailsModalOpen(true);
  };

  const handleUpdateDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConference) return;

    try {
      await api.updateCaseConference(selectedConference.id, {
        status: formStatus,
        scheduledDate: formDate,
        scheduledTime: formTime,
        location: formLocation,
        draftBipTitle: formDraftBip,
        agreedCommitments: formAgreedCommitments,
        minutesDecisions: formMinutes,
      });

      setIsDetailsModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui case conference');
    }
  };

  const filteredConferences = conferences.filter(c => {
    if (activeTab !== 'all' && c.status !== activeTab) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.studentName.toLowerCase().includes(q) ||
        c.className.toLowerCase().includes(q) ||
        c.reasonForConference.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">
                Rekomendasi & Jadwal Case Conference SD Lazuardi GCS
              </h1>
              <p className="text-xs text-slate-500">
                Forum multi-disiplin: Kepala Sekolah, Kepala Bidang Inklusif, Wali Kelas, Orang Tua, dan Konselor untuk kesepakatan komitmen bersama
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => openNewScheduleModal()}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors shadow-2xs cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Jadwalkan Case Conference</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-2xs bg-amber-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800">📌 Rekomendasi Terbuka</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-1.5">
            {conferences.filter(c => c.status === 'Direkomendasikan').length} Kasus
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Perlu diagendakan tanggal musyawarah</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-2xs bg-blue-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-800">🗓️ Terjadwal Siap Digelar</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-700 mt-1.5">
            {conferences.filter(c => c.status === 'Dijadwalkan').length} Sidang
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Sudah ada penetapan tanggal & peserta</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-2xs bg-emerald-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800">✅ Selesai & Berkomitmen</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-1.5">
            {conferences.filter(c => c.status === 'Selesai').length} Siswa
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Notulensi & komitmen ortu disepakati</p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({conferences.length})
          </button>
          <button
            onClick={() => setActiveTab('Direkomendasikan')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'Direkomendasikan'
                ? 'bg-white text-amber-800 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rekomendasi ({conferences.filter(c => c.status === 'Direkomendasikan').length})
          </button>
          <button
            onClick={() => setActiveTab('Dijadwalkan')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'Dijadwalkan'
                ? 'bg-white text-blue-800 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Terjadwal ({conferences.filter(c => c.status === 'Dijadwalkan').length})
          </button>
          <button
            onClick={() => setActiveTab('Selesai')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'Selesai'
                ? 'bg-white text-emerald-800 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Selesai ({conferences.filter(c => c.status === 'Selesai').length})
          </button>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari siswa atau topik..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Conferences Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3 w-12 text-center">No</th>
                <th className="py-2.5 px-3 min-w-[170px]">Siswa & Rombel</th>
                <th className="py-2.5 px-3 min-w-[110px] text-center">Status</th>
                <th className="py-2.5 px-3 min-w-[170px]">Jadwal Sidang</th>
                <th className="py-2.5 px-3 min-w-[240px]">Latar Belakang & Agenda</th>
                <th className="py-2.5 px-3 min-w-[180px]">Peserta Kunci</th>
                <th className="py-2.5 px-3 min-w-[100px] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredConferences.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Tidak ada case conference yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredConferences.map((conf, idx) => (
                  <tr key={conf.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => onSelectStudent && onSelectStudent(conf.studentId)}
                        className="font-bold text-slate-900 hover:text-purple-600 text-left transition-colors cursor-pointer"
                      >
                        {conf.studentName}
                      </button>
                      <div className="text-[10px] text-slate-400">
                        {conf.className} • Guru: {conf.teacherName}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          conf.status === 'Selesai'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : conf.status === 'Dijadwalkan'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {conf.status}
                      </span>
                    </td>

                    <td className="py-2.5 px-3">
                      {conf.scheduledDate ? (
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-blue-600" />
                            <span>{conf.scheduledDate}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>{conf.scheduledTime || '13:00 WIB'}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-amber-700 italic text-[11px]">Belum ditentukan</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-800 line-clamp-2">{conf.reasonForConference}</div>
                      {conf.draftBipTitle && (
                        <div className="text-[10px] text-purple-700 font-semibold mt-1">
                          📄 BIP: {conf.draftBipTitle}
                        </div>
                      )}
                      {conf.agreedCommitments && (
                        <div className="text-[10px] text-emerald-700 mt-0.5 line-clamp-1">
                          🤝 {conf.agreedCommitments}
                        </div>
                      )}
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="text-[10px] text-slate-600 line-clamp-2">
                        {conf.participants ? conf.participants.join(', ') : 'Tim Inklusif & Orang Tua'}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => openDetailsModal(conf)}
                        className="px-2.5 py-1 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors cursor-pointer"
                      >
                        Notulensi & Hasil
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Penjadwalan Case Conference Baru */}
      {isScheduleModalOpen && (
        <Modal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          title="Jadwalkan Case Conference Baru"
          size="lg"
        >
          <form onSubmit={handleSaveConference} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Pilih Siswa Target:</label>
              <select
                value={formStudentId}
                onChange={e => {
                  setFormStudentId(e.target.value);
                  const st = students.find(s => s.id === e.target.value);
                  if (st) setFormReason(st.flagReason || st.notes || '');
                }}
                className="w-full p-2.5 border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-1 focus:ring-purple-500"
                required
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.className} - {s.currentTier})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Latar Belakang Temuan / Alasan Rekomendasi:
              </label>
              <textarea
                rows={2}
                value={formReason}
                onChange={e => setFormReason(e.target.value)}
                placeholder="Contoh: Gap akademik membaca jauh, perlu penyelarasan pola asuh orang tua..."
                className="w-full p-2.5 border border-slate-200 rounded-xl"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tanggal Sidang:</label>
                <input
                  type="text"
                  value={formDate}
                  onChange={e => setFormDate(e.target.value)}
                  placeholder="Contoh: Senin, 28 September 2026 atau YYYY-MM-DD"
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Waktu Sidang:</label>
                <input
                  type="text"
                  value={formTime}
                  onChange={e => setFormTime(e.target.value)}
                  placeholder="13:00 - 14:30 WIB"
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Lokasi Pertemuan:</label>
              <input
                type="text"
                value={formLocation}
                onChange={e => setFormLocation(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Judul Draft BIP / Program Dukungan:</label>
              <input
                type="text"
                value={formDraftBip}
                onChange={e => setFormDraftBip(e.target.value)}
                placeholder="Contoh: Banyu (Grade 4 Iberian Lynx) - (BIP) atau Individual Reading Support"
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Simpan & Jadwalkan
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Detail Notulensi, Komitmen Bersama & Status */}
      {isDetailsModalOpen && selectedConference && (
        <Modal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          title={`Notulensi & Keputusan Case Conference: ${selectedConference.studentName}`}
          size="lg"
        >
          <form onSubmit={handleUpdateDetails} className="space-y-4 text-xs">
            <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-200">
              <div className="font-bold text-purple-950 text-sm">{selectedConference.studentName} ({selectedConference.className})</div>
              <p className="text-[11px] text-purple-800 mt-0.5">
                Alasan: {selectedConference.reasonForConference}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Status Case Conference:</label>
                <select
                  value={formStatus}
                  onChange={e => setFormStatus(e.target.value as any)}
                  className="w-full p-2 border border-slate-200 rounded-xl font-bold bg-white text-slate-800"
                >
                  <option value="Direkomendasikan">Direkomendasikan (Menunggu Tanggal)</option>
                  <option value="Dijadwalkan">Dijadwalkan (Siap Sidang)</option>
                  <option value="Selesai">Selesai (Komitmen Disepakati)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tanggal Pelaksanaan:</label>
                <input
                  type="text"
                  value={formDate}
                  onChange={e => setFormDate(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl font-bold bg-white"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Draft BIP (Behavior Intervention Plan):</label>
              <input
                type="text"
                value={formDraftBip}
                onChange={e => setFormDraftBip(e.target.value)}
                placeholder="Judul dokumen BIP yang disetujui..."
                className="w-full p-2 border border-slate-200 rounded-xl bg-white"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                🤝 Lembar Komitmen Bersama Orang Tua & Sekolah:
              </label>
              <textarea
                rows={3}
                value={formAgreedCommitments}
                onChange={e => setFormAgreedCommitments(e.target.value)}
                placeholder="Contoh: Orang tua berkomitmen pendampingan fonetik 15 menit setiap malam tanpa gawai..."
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-purple-500 bg-white"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Notulensi Musyawarah & Keputusan:</label>
              <textarea
                rows={3}
                value={formMinutes}
                onChange={e => setFormMinutes(e.target.value)}
                placeholder="Catatan diskusi peserta sidang..."
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-purple-500 bg-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Simpan Pembaruan Case Conference
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
