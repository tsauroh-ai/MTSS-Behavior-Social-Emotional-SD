import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Student, MasterClass, TierLevel } from '../types';
import {
  Search,
  Filter,
  Plus,
  Users,
  AlertCircle,
  Eye,
  Edit,
  ShieldAlert,
  GraduationCap,
  Calendar,
  FileSpreadsheet,
} from 'lucide-react';
import { TierBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

interface StudentsViewProps {
  onSelectStudent: (studentId: string) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({ onSelectStudent }) => {
  const { currentUser, isGuru, isKoordinator, isAdmin, canChangeTier } = useAuth();

  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<MasterClass[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [onlyFlagged, setOnlyFlagged] = useState(false);

  // Add Student Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    nisn: '',
    fullName: '',
    nickname: '',
    classId: 'cls-1a',
    className: 'Kelas 1A',
    grade: 1,
    gender: 'L' as 'L' | 'P',
    birthDate: '2019-01-01',
    currentTier: 'Tier 1' as TierLevel,
    guardianName: '',
    guardianContact: '',
    notes: '',
  });

  // Change Tier Modal
  const [tierChangeTarget, setTierChangeTarget] = useState<Student | null>(null);
  const [newTierSelection, setNewTierSelection] = useState<TierLevel>('Tier 2');
  const [tierChangeReason, setTierChangeReason] = useState('');
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsData, classesData] = await Promise.all([
        api.getStudents(),
        api.getClasses(),
      ]);
      setStudents(studentsData);
      setClasses(classesData);
    } catch (err) {
      console.error('Failed to load students list', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cls = classes.find(c => c.id === newStudent.classId);
      await api.createStudent({
        ...newStudent,
        className: cls?.name || 'Kelas',
        grade: cls?.grade || 1,
        needsReviewFlag: false,
        status: 'active',
      });
      setIsAddModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan siswa');
    }
  };

  const handleConfirmTierChange = async () => {
    if (!tierChangeTarget) return;
    try {
      await api.updateStudent(tierChangeTarget.id, {
        currentTier: newTierSelection,
        reason: tierChangeReason,
        needsReviewFlag: false,
        flagReason: undefined,
      });
      setIsTierModalOpen(false);
      setTierChangeTarget(null);
      setTierChangeReason('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui status tier');
    }
  };

  const filteredStudents = students.filter(student => {
    if (selectedClass !== 'all' && student.classId !== selectedClass) return false;
    if (selectedTier !== 'all' && student.currentTier !== selectedTier) return false;
    if (onlyFlagged && !student.needsReviewFlag) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = student.fullName.toLowerCase().includes(q) || student.nickname.toLowerCase().includes(q);
      const matchNisn = student.nisn.includes(q);
      if (!matchName && !matchNisn) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {isGuru ? 'Daftar Siswa Kelas Saya' : 'Data Siswa & Status MTSS'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isGuru
              ? 'Kelola pemantauan dan pencatatan siswa yang menjadi tanggung jawab wali kelas.'
              : 'Pemetaan seluruh siswa di sekolah beserta tingkat dukungan (Tier 1, Tier 2, Tier 3).'}
          </p>
        </div>

        {(isAdmin || isKoordinator) && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Data Siswa</span>
          </button>
        )}
      </div>

      {/* Tier 1, Tier 2, Tier 3 Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          onClick={() => { setSelectedTier('all'); setOnlyFlagged(false); }}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            selectedTier === 'all' && !onlyFlagged
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <div className="text-[11px] font-medium opacity-75">Total Siswa</div>
          <div className="text-xl font-bold mt-0.5">{students.length}</div>
          <div className="text-[10px] opacity-70 mt-1">Semua Rombel</div>
        </button>

        <button
          onClick={() => { setSelectedTier('Tier 1'); setOnlyFlagged(false); }}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            selectedTier === 'Tier 1'
              ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
              : 'bg-emerald-50/70 hover:bg-emerald-100/70 border-emerald-200 text-emerald-900'
          }`}
        >
          <div className="text-[11px] font-semibold flex items-center justify-between">
            <span>Tier 1</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-200/60 font-bold">Universal</span>
          </div>
          <div className="text-xl font-bold mt-0.5">
            {students.filter(s => s.currentTier === 'Tier 1').length}
          </div>
          <div className="text-[10px] opacity-80 mt-1">
            {students.length > 0
              ? `${Math.round((students.filter(s => s.currentTier === 'Tier 1').length / students.length) * 100)}% dari total`
              : '0%'}
          </div>
        </button>

        <button
          onClick={() => { setSelectedTier('Tier 2'); setOnlyFlagged(false); }}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            selectedTier === 'Tier 2'
              ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
              : 'bg-amber-50/70 hover:bg-amber-100/70 border-amber-200 text-amber-900'
          }`}
        >
          <div className="text-[11px] font-semibold flex items-center justify-between">
            <span>Tier 2</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-200/60 font-bold">Targeted</span>
          </div>
          <div className="text-xl font-bold mt-0.5">
            {students.filter(s => s.currentTier === 'Tier 2').length}
          </div>
          <div className="text-[10px] opacity-80 mt-1">
            {students.length > 0
              ? `${Math.round((students.filter(s => s.currentTier === 'Tier 2').length / students.length) * 100)}% dari total`
              : '0%'}
          </div>
        </button>

        <button
          onClick={() => { setSelectedTier('Tier 3'); setOnlyFlagged(false); }}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            selectedTier === 'Tier 3'
              ? 'bg-rose-700 text-white border-rose-700 shadow-sm'
              : 'bg-rose-50/70 hover:bg-rose-100/70 border-rose-200 text-rose-900'
          }`}
        >
          <div className="text-[11px] font-semibold flex items-center justify-between">
            <span>Tier 3</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-200/60 font-bold">Intensif</span>
          </div>
          <div className="text-xl font-bold mt-0.5">
            {students.filter(s => s.currentTier === 'Tier 3').length}
          </div>
          <div className="text-[10px] opacity-80 mt-1">
            {students.length > 0
              ? `${Math.round((students.filter(s => s.currentTier === 'Tier 3').length / students.length) * 100)}% dari total`
              : '0%'}
          </div>
        </button>

        <button
          onClick={() => { setOnlyFlagged(!onlyFlagged); setSelectedTier('all'); }}
          className={`p-3.5 rounded-2xl border text-left transition-all col-span-2 sm:col-span-1 ${
            onlyFlagged
              ? 'bg-purple-700 text-white border-purple-700 shadow-sm'
              : 'bg-purple-50/70 hover:bg-purple-100/70 border-purple-200 text-purple-900'
          }`}
        >
          <div className="text-[11px] font-semibold flex items-center justify-between">
            <span>Perlu Review</span>
            <AlertCircle className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <div className="text-xl font-bold mt-0.5">
            {students.filter(s => s.needsReviewFlag).length}
          </div>
          <div className="text-[10px] opacity-80 mt-1">Flag Observasi</div>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari nama siswa atau NISN..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Class Filter */}
          <div>
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

          {/* Tier Filter */}
          <div>
            <select
              value={selectedTier}
              onChange={e => setSelectedTier(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">Semua Tier MTSS</option>
              <option value="Tier 1">Tier 1 (Universal)</option>
              <option value="Tier 2">Tier 2 (Targeted)</option>
              <option value="Tier 3">Tier 3 (Intensif)</option>
            </select>
          </div>

          {/* Flag Toggle */}
          <div className="flex items-center">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyFlagged}
                onChange={e => setOnlyFlagged(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
              />
              <span className="flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Hanya yang perlu ditinjau ({students.filter(s => s.needsReviewFlag).length})</span>
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Students List Table */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Memuat data siswa...</div>
      ) : filteredStudents.length === 0 ? (
        <EmptyState
          title="Tidak ada siswa yang sesuai kriteria"
          description="Coba ubah kata kunci pencarian atau reset filter kelas dan tier."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3">Nama Siswa & NISN</th>
                  <th className="px-4 py-3">Kelas</th>
                  <th className="px-4 py-3">Status Tier MTSS</th>
                  <th className="px-4 py-3">Status Pemantauan</th>
                  <th className="px-4 py-3">Wali Murid</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-100 to-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs border border-slate-200">
                          {student.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{student.fullName}</span>
                            <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded font-normal">
                              {student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400">NISN: {student.nisn}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-slate-800">{student.className}</span>
                    </td>

                    <td className="px-4 py-3.5">
                      <TierBadge tier={student.currentTier} size="sm" />
                    </td>

                    <td className="px-4 py-3.5">
                      {student.needsReviewFlag ? (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Perlu Ditinjau Tim</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-medium">Dalam Pemantauan Rutin</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="text-slate-900 font-medium">{student.guardianName || '-'}</div>
                      <div className="text-[10px] text-slate-400">{student.guardianContact || ''}</div>
                    </td>

                    <td className="px-5 py-3.5 text-right space-x-2">
                      {canChangeTier && (
                        <button
                          onClick={() => {
                            setTierChangeTarget(student);
                            setNewTierSelection(student.currentTier);
                            setIsTierModalOpen(true);
                          }}
                          className="px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-medium border border-slate-200 transition-colors"
                          title="Musyawarah Penyesuaian Tier"
                        >
                          Ubah Tier
                        </button>
                      )}
                      <button
                        onClick={() => onSelectStudent(student.id)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Buka Profil</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Pendaftaran Data Siswa Baru"
        subtitle="Masukkan identitas dasar siswa untuk registrasi sistem pemantauan MTSS."
      >
        <form onSubmit={handleCreateStudent} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">NISN *</label>
              <input
                type="text"
                required
                value={newStudent.nisn}
                onChange={e => setNewStudent({ ...newStudent, nisn: e.target.value })}
                placeholder="misal: 0123456789"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Siswa *</label>
              <input
                type="text"
                required
                value={newStudent.fullName}
                onChange={e => setNewStudent({ ...newStudent, fullName: e.target.value })}
                placeholder="Nama lengkap sesuai akta"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Panggilan</label>
              <input
                type="text"
                value={newStudent.nickname}
                onChange={e => setNewStudent({ ...newStudent, nickname: e.target.value })}
                placeholder="Panggilan sehari-hari"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Rombongan Belajar (Kelas) *</label>
              <select
                value={newStudent.classId}
                onChange={e => setNewStudent({ ...newStudent, classId: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Jenis Kelamin *</label>
              <select
                value={newStudent.gender}
                onChange={e => setNewStudent({ ...newStudent, gender: e.target.value as 'L' | 'P' })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Orang Tua / Wali</label>
              <input
                type="text"
                value={newStudent.guardianName}
                onChange={e => setNewStudent({ ...newStudent, guardianName: e.target.value })}
                placeholder="Nama ayah/ibu/wali"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kontak Telepon Orang Tua</label>
              <input
                type="text"
                value={newStudent.guardianContact}
                onChange={e => setNewStudent({ ...newStudent, guardianContact: e.target.value })}
                placeholder="0812-xxxx-xxxx"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Catatan Awal Siswa</label>
            <textarea
              rows={2}
              value={newStudent.notes}
              onChange={e => setNewStudent({ ...newStudent, notes: e.target.value })}
              placeholder="Catatan minat, preferensi gaya belajar, atau informasi adaptasi awal..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold shadow-xs"
            >
              Simpan Data Siswa
            </button>
          </div>
        </form>
      </Modal>

      {/* Tier Change Dialog with Mandatory Audit Reason */}
      <Modal
        isOpen={isTierModalOpen}
        onClose={() => setIsTierModalOpen(false)}
        title={`Penyesuaian Status Tier: ${tierChangeTarget?.fullName}`}
        subtitle="Keputusan perubahan tier harus berdasarkan hasil musyawarah dan evaluasi tim MTSS sekolah."
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 leading-relaxed">
            <strong>Perhatian:</strong> Perubahan status tier akan dicatat dalam Audit Trail resmi sekolah bersama identitas pengguna Anda.
          </div>

          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-800">Pilih Tingkat Dukungan Baru (Tier) *</label>
            <select
              value={newTierSelection}
              onChange={e => setNewTierSelection(e.target.value as TierLevel)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="Tier 1">Tier 1 — Universal Support (Seluruh Siswa)</option>
              <option value="Tier 2">Tier 2 — Targeted Support (Dukungan Tambahan Terarah)</option>
              <option value="Tier 3">Tier 3 — Intensive Individual Support (Dukungan Intensif)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-800">
              Justifikasi / Catatan Musyawarah Tim MTSS <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={tierChangeReason}
              onChange={e => setTierChangeReason(e.target.value)}
              placeholder="Contoh: Berdasarkan hasil rapat review siklus 4 pekan dan kesepakatan wali kelas serta guru pendamping..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsTierModalOpen(false)}
              className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={!tierChangeReason.trim()}
              onClick={handleConfirmTierChange}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg font-semibold shadow-xs"
            >
              Simpan Keputusan Tier
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
