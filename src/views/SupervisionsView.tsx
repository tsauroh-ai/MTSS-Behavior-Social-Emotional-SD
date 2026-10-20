import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import {
  SupervisionSchedule,
  SupervisorRole,
  SupervisionStatus,
  Student,
  MasterClass,
} from '../types';
import {
  ShieldCheck,
  Calendar,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  FileEdit,
  Filter,
  Search,
  School,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import { Modal } from '../components/common/Modal';

interface SupervisionsViewProps {
  onSelectStudent?: (studentId: string) => void;
}

export const SupervisionsView: React.FC<SupervisionsViewProps> = ({ onSelectStudent }) => {
  const { currentUser, isPimpinan, isKoordinator, isAdmin } = useAuth();

  const [supervisions, setSupervisions] = useState<SupervisionSchedule[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<MasterClass[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSupervision, setSelectedSupervision] = useState<SupervisionSchedule | null>(null);

  // Schedule Form Fields
  const [formStudentId, setFormStudentId] = useState('');
  const [formSupervisorRole, setFormSupervisorRole] = useState<SupervisorRole>('Kepala Bidang Inklusif');
  const [formSupervisorName, setFormSupervisorName] = useState('M. Ghofar, M.Psi.');
  const [formDate, setFormDate] = useState('2026-10-14');
  const [formTime, setFormTime] = useState('09:00');
  const [formTopic, setFormTopic] = useState('Supervisi fokus belajar klasikal & adaptasi rutinitas');

  // Edit / Checking Form Fields
  const [editHasil, setEditHasil] = useState('');
  const [editTindakLanjut, setEditTindakLanjut] = useState('');
  const [editKepsekStatus, setEditKepsekStatus] = useState<'Pending' | 'In Progress' | 'Complete'>('Pending');
  const [editKepsekRevisi, setEditKepsekRevisi] = useState('');
  const [editKabidStatus, setEditKabidStatus] = useState<'Pending' | 'In Progress' | 'Complete'>('Pending');
  const [editKabidCatatan, setEditKabidCatatan] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [allSup, allSt, allCls] = await Promise.all([
        api.getSupervisions(),
        api.getStudents(),
        api.getClasses(),
      ]);
      setSupervisions(allSup);
      setStudents(allSt);
      setClasses(allCls);
      if (allSt.length > 0 && !formStudentId) {
        setFormStudentId(allSt[0].id);
      }
    } catch (err) {
      console.error('Failed to load supervisions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const student = students.find(s => s.id === formStudentId);
    if (!student) return;

    try {
      await api.saveSupervision({
        studentId: student.id,
        studentName: student.fullName,
        classId: student.classId,
        className: student.className,
        teacherName: classes.find(c => c.id === student.classId)?.homeroomTeacherName || 'Wali Kelas',
        supervisorRole: formSupervisorRole,
        supervisorName: formSupervisorName,
        scheduledDate: formDate,
        time: formTime,
        topic: formTopic,
        status: 'Terjadwal',
        chekingKepalaSekolah: { status: 'Pending' },
        chekingKepalaBidangInklusif: { status: 'Pending' },
      });

      setIsScheduleModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal menjadwalkan supervisi');
    }
  };

  const openEditModal = (sup: SupervisionSchedule) => {
    setSelectedSupervision(sup);
    setEditHasil(sup.hasilSupervisi || '');
    setEditTindakLanjut(sup.catatanTindakLanjut || '');
    setEditKepsekStatus(sup.chekingKepalaSekolah?.status || 'Pending');
    setEditKepsekRevisi(sup.chekingKepalaSekolah?.revisiReport || '');
    setEditKabidStatus(sup.chekingKepalaBidangInklusif?.status || 'Pending');
    setEditKabidCatatan(sup.chekingKepalaBidangInklusif?.catatan || '');
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupervision) return;

    try {
      await api.updateSupervision(selectedSupervision.id, {
        hasilSupervisi: editHasil,
        catatanTindakLanjut: editTindakLanjut,
        status: editKepsekStatus === 'Complete' && editKabidStatus === 'Complete' ? 'Selesai' : 'Terjadwal',
        chekingKepalaSekolah: {
          status: editKepsekStatus,
          revisiReport: editKepsekRevisi,
          completedDate: editKepsekStatus === 'Complete' ? new Date().toISOString().split('T')[0] : undefined,
        },
        chekingKepalaBidangInklusif: {
          status: editKabidStatus,
          catatan: editKabidCatatan,
          completedDate: editKabidStatus === 'Complete' ? new Date().toISOString().split('T')[0] : undefined,
        },
      });

      setIsEditModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui supervisi');
    }
  };

  const filteredSupervisions = supervisions.filter(sup => {
    if (roleFilter !== 'all' && sup.supervisorRole !== roleFilter) return false;
    if (statusFilter !== 'all' && sup.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        sup.studentName.toLowerCase().includes(q) ||
        sup.className.toLowerCase().includes(q) ||
        sup.topic.toLowerCase().includes(q) ||
        sup.supervisorName.toLowerCase().includes(q)
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
            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">
                Jadwal Supervisi Kepala Sekolah & Kepala Bidang Inklusif
              </h1>
              <p className="text-xs text-slate-500">
                Supervisi langsung proses belajar, evaluasi BIP, checking laporan, dan tindak lanjut kemajuan peserta didik
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsScheduleModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-2xs cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Jadwalkan Supervisi</span>
        </button>
      </div>

      {/* Leadership Profile Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Kepala Sekolah */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-700 font-bold flex items-center justify-center text-base">
              DS
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Kepala Sekolah</div>
              <h3 className="font-bold text-slate-900 text-sm">Dr. Sari, M.Pd.</h3>
              <p className="text-[11px] text-slate-500">Supervisi Kelembagaan & Checking Laporan Akhir</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
              {supervisions.filter(s => s.supervisorRole === 'Kepala Sekolah' || s.supervisorRole === 'Keduanya').length} Jadwal
            </span>
          </div>
        </div>

        {/* Kepala Bidang Inklusif */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/10 text-emerald-700 font-bold flex items-center justify-center text-base">
              MG
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                Kepala Bidang Pendidikan Inklusif
              </div>
              <h3 className="font-bold text-slate-900 text-sm">M. Ghofar, M.Psi.</h3>
              <p className="text-[11px] text-slate-500">Supervisi Klinis, Pembelajaran Inklusif & BIP</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
              {supervisions.filter(s => s.supervisorRole === 'Kepala Bidang Inklusif' || s.supervisorRole === 'Keduanya').length} Jadwal
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500 font-medium">Supervisor:</span>
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="font-bold text-slate-800 bg-transparent border-none focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Supervisor</option>
              <option value="Kepala Sekolah">Dr. Sari (Kepala Sekolah)</option>
              <option value="Kepala Bidang Inklusif">M. Ghofar (Kabid Inklusif)</option>
              <option value="Keduanya">Keduanya Bersama</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="font-bold text-slate-800 bg-transparent border-none focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="Terjadwal">Terjadwal</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari siswa, guru, atau topik..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Supervisions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3 w-12 text-center">No</th>
                <th className="py-2.5 px-3 min-w-[150px]">Jadwal & Waktu</th>
                <th className="py-2.5 px-3 min-w-[170px]">Siswa & Kelas</th>
                <th className="py-2.5 px-3 min-w-[160px]">Supervisor</th>
                <th className="py-2.5 px-3 min-w-[220px]">Fokus / Topik Supervisi</th>
                <th className="py-2.5 px-3 min-w-[130px] text-center">Checking Kepsek</th>
                <th className="py-2.5 px-3 min-w-[130px] text-center">Checking Kabid</th>
                <th className="py-2.5 px-3 min-w-[100px] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSupervisions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tidak ada jadwal supervisi yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredSupervisions.map((sup, idx) => (
                  <tr key={sup.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        <span>{sup.scheduledDate}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{sup.time || '08:30 WIB'}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => onSelectStudent && onSelectStudent(sup.studentId)}
                        className="font-bold text-slate-900 hover:text-blue-600 text-left transition-colors cursor-pointer"
                      >
                        {sup.studentName}
                      </button>
                      <div className="text-[10px] text-slate-400">
                        {sup.className} • Guru: {sup.teacherName}
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-slate-800">{sup.supervisorName}</span>
                      <div className="text-[10px] text-blue-700 font-medium">({sup.supervisorRole})</div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-800">{sup.topic}</div>
                      {sup.hasilSupervisi && (
                        <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                          <strong>Hasil:</strong> {sup.hasilSupervisi}
                        </p>
                      )}
                    </td>

                    {/* Checking Kepsek */}
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          sup.chekingKepalaSekolah?.status === 'Complete'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : sup.chekingKepalaSekolah?.status === 'In Progress'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {sup.chekingKepalaSekolah?.status || 'Pending'}
                      </span>
                      {sup.chekingKepalaSekolah?.revisiReport && (
                        <div className="text-[9px] text-slate-500 mt-0.5 truncate max-w-[120px]">
                          {sup.chekingKepalaSekolah.revisiReport}
                        </div>
                      )}
                    </td>

                    {/* Checking Kabid Inklusif */}
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          sup.chekingKepalaBidangInklusif?.status === 'Complete'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : sup.chekingKepalaBidangInklusif?.status === 'In Progress'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {sup.chekingKepalaBidangInklusif?.status || 'Pending'}
                      </span>
                    </td>

                    {/* Aksi */}
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => openEditModal(sup)}
                        className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                      >
                        Hasil / Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Jadwalkan Supervisi Baru */}
      {isScheduleModalOpen && (
        <Modal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          title="Jadwalkan Supervisi Pembelajaran & Inklusi"
          size="lg"
        >
          <form onSubmit={handleCreateSchedule} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Pilih Siswa Target:</label>
              <select
                value={formStudentId}
                onChange={e => setFormStudentId(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-1 focus:ring-blue-500"
                required
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.className} - {s.currentTier})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Peran Supervisor:</label>
                <select
                  value={formSupervisorRole}
                  onChange={e => {
                    const role = e.target.value as SupervisorRole;
                    setFormSupervisorRole(role);
                    if (role === 'Kepala Sekolah') setFormSupervisorName('Dr. Sari, M.Pd.');
                    else if (role === 'Kepala Bidang Inklusif') setFormSupervisorName('M. Ghofar, M.Psi.');
                    else setFormSupervisorName('Dr. Sari, M.Pd. & M. Ghofar, M.Psi.');
                  }}
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-bold text-slate-800"
                >
                  <option value="Kepala Bidang Inklusif">Kepala Bidang Pendidikan Inklusif</option>
                  <option value="Kepala Sekolah">Kepala Sekolah</option>
                  <option value="Keduanya">Keduanya Bersama</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Supervisor:</label>
                <input
                  type="text"
                  value={formSupervisorName}
                  onChange={e => setFormSupervisorName(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tanggal Supervisi:</label>
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
                <label className="font-semibold text-slate-700 block mb-1">Waktu / Jam Sesi:</label>
                <input
                  type="text"
                  value={formTime}
                  onChange={e => setFormTime(e.target.value)}
                  placeholder="08:30 WIB"
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Topik / Fokus Observasi Supervisi:</label>
              <textarea
                rows={2}
                value={formTopic}
                onChange={e => setFormTopic(e.target.value)}
                placeholder="Contoh: Observasi kemampuan fonetik, stimulasi kontak mata, atau penanganan de-eskalasi emosi..."
                className="w-full p-2.5 border border-slate-200 rounded-xl"
                required
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
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Jadwalkan Sekarang
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Input Hasil Supervisi & Checking Approval */}
      {isEditModalOpen && selectedSupervision && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Hasil & Validasi Supervisi: ${selectedSupervision.studentName}`}
          size="lg"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200">
              <div className="font-bold text-blue-950">
                {selectedSupervision.topic}
              </div>
              <p className="text-[11px] text-blue-800 mt-0.5">
                Tanggal: {selectedSupervision.scheduledDate} • Supervisor: {selectedSupervision.supervisorName}
              </p>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Hasil Observasi Supervisi:</label>
              <textarea
                rows={3}
                value={editHasil}
                onChange={e => setEditHasil(e.target.value)}
                placeholder="Uraikan temuan yang diamati secara objektif selama supervisi..."
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Catatan Tindak Lanjut:</label>
              <textarea
                rows={2}
                value={editTindakLanjut}
                onChange={e => setEditTindakLanjut(e.target.value)}
                placeholder="Rekomendasi modifikasi strategi atau kesepakatan bersama..."
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Approval Panels for Leadership */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Checking Kepala Sekolah */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Checking Kepala Sekolah:</span>
                  <select
                    value={editKepsekStatus}
                    onChange={e => setEditKepsekStatus(e.target.value as any)}
                    className="p-1 border border-slate-300 rounded font-bold text-[11px]"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Complete">Complete (Disetujui)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 block mb-0.5">
                    Revisi Report (mohon diisi setelah melakukan revisi):
                  </label>
                  <input
                    type="text"
                    value={editKepsekRevisi}
                    onChange={e => setEditKepsekRevisi(e.target.value)}
                    placeholder="Contoh: Done / Perlu penyesuaian target BIP..."
                    className="w-full p-1.5 border border-slate-200 rounded-lg bg-white"
                  />
                </div>
              </div>

              {/* Checking Kepala Bidang Inklusif */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Checking Kabid Inklusif:</span>
                  <select
                    value={editKabidStatus}
                    onChange={e => setEditKabidStatus(e.target.value as any)}
                    className="p-1 border border-slate-300 rounded font-bold text-[11px]"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Complete">Complete (Disetujui)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 block mb-0.5">
                    Catatan Kabid Inklusif (Pak Ghofar):
                  </label>
                  <input
                    type="text"
                    value={editKabidCatatan}
                    onChange={e => setEditKabidCatatan(e.target.value)}
                    placeholder="Contoh: Strategi sesuai asesmen klinis..."
                    className="w-full p-1.5 border border-slate-200 rounded-lg bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Simpan Hasil & Status Checking
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
