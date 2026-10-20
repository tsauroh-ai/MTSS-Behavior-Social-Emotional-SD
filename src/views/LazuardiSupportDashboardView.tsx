import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import {
  LazuardiStudentSupportRow,
  TierLevel,
  LdssStatus,
} from '../types';
import {
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Download,
  ExternalLink,
  ChevronRight,
  Printer,
  Sparkles,
  School,
  Eye,
} from 'lucide-react';

interface LazuardiSupportDashboardViewProps {
  onSelectStudent?: (studentId: string) => void;
  onNavigateToTab?: (tab: any) => void;
}

export const LazuardiSupportDashboardView: React.FC<LazuardiSupportDashboardViewProps> = ({
  onSelectStudent,
  onNavigateToTab,
}) => {
  const { currentUser, isPimpinan, isKoordinator } = useAuth();

  const [rows, setRows] = useState<LazuardiStudentSupportRow[]>([]);
  const [selectedParallel, setSelectedParallel] = useState<number | 'all'>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getLazuardiSupportRows();
      setRows(data);
    } catch (err) {
      console.error('Failed to load Lazuardi support rows', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredRows = rows.filter(r => {
    if (selectedParallel !== 'all' && r.gradeParallel !== selectedParallel) return false;
    if (tierFilter !== 'all' && r.currentTier !== tierFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        r.studentName.toLowerCase().includes(q) ||
        r.className.toLowerCase().includes(q) ||
        r.teacherName.toLowerCase().includes(q) ||
        r.findings.toLowerCase().includes(q) ||
        r.target.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Export to CSV
  const handleExportCsv = () => {
    const headers = [
      'No',
      'Paralel Kelas',
      'Nama Siswa',
      'Kelas',
      'Nama Guru',
      'Tier',
      'Temuan',
      'Target',
      'Pengisian LDSS',
      'Tindak Lanjut',
      'Jadwal Pak Ghofar',
      'Draft BIP',
      'Checking Kepsek',
      'Revisi Report',
      'Checking Kabid Inklusif',
      'Status Jadwal',
    ];

    const csvContent = [
      headers.join(','),
      ...filteredRows.map(r =>
        [
          r.no,
          r.gradeParallel,
          `"${r.studentName}"`,
          `"${r.className}"`,
          `"${r.teacherName}"`,
          r.currentTier,
          `"${r.findings.replace(/"/g, '""')}"`,
          `"${r.target.replace(/"/g, '""')}"`,
          r.ldssStatus,
          `"${r.tindakLanjut}"`,
          `"${r.jadwalPakGhofar || '-'}"`,
          `"${r.draftBip || '-'}"`,
          r.chekingKepalaSekolah || 'Pending',
          `"${r.revisiReportKepsek || '-'}"`,
          r.chekingKabidInklusif || 'Pending',
          `"${r.statusJadwal || '-'}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Dashboard_Student_Support_Lazuardi_GCS_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">
                Dashboard Form Keluhan & Student Support SD Lazuardi GCS
              </h1>
              <p className="text-xs text-slate-500">
                Matriks komprehensif pendataan paralel kelas 1–6, temuan, target, pengisian LDSS, supervisi Pak Ghofar, dan approval Kepala Sekolah
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-2xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Cetak Rekap</span>
          </button>
        </div>
      </div>

      {/* Filter and Parallel Selector */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Parallel buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setSelectedParallel('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                selectedParallel === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Semua Paralel
            </button>
            {[1, 2, 4, 5, 6].map(p => (
              <button
                key={p}
                onClick={() => setSelectedParallel(p)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  selectedParallel === p
                    ? 'bg-white text-emerald-700 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Paralel {p}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
            <span className="text-slate-500 font-medium">Tier:</span>
            <select
              value={tierFilter}
              onChange={e => setTierFilter(e.target.value)}
              className="font-bold text-slate-800 bg-transparent border-none focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Tier</option>
              <option value="Tier 1">Tier 1 (Universal)</option>
              <option value="Tier 2">Tier 2 (Targeted)</option>
              <option value="Tier 3">Tier 3 (Intensif)</option>
            </select>
          </div>
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari nama siswa, guru, temuan..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Main High-Density Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2 px-2.5 w-10 text-center border-r border-slate-200">No</th>
                <th className="py-2 px-2.5 w-16 text-center border-r border-slate-200">Paralel</th>
                <th className="py-2 px-3 min-w-[160px] border-r border-slate-200">Nama Siswa</th>
                <th className="py-2 px-2.5 min-w-[100px] border-r border-slate-200">Kelas</th>
                <th className="py-2 px-2.5 min-w-[110px] border-r border-slate-200">Nama Guru</th>
                <th className="py-2 px-3 min-w-[220px] border-r border-slate-200">Temuan</th>
                <th className="py-2 px-3 min-w-[200px] border-r border-slate-200">Target</th>
                <th className="py-2 px-2 text-center min-w-[90px] border-r border-slate-200">Pengisian LDSS</th>
                <th className="py-2 px-3 min-w-[160px] border-r border-slate-200">Tindak Lanjut</th>
                <th className="py-2 px-3 min-w-[150px] border-r border-slate-200">Jadwal Pak Ghofar</th>
                <th className="py-2 px-2.5 text-center min-w-[110px] border-r border-slate-200">Cheking Kepsek</th>
                <th className="py-2 px-2.5 text-center min-w-[110px] border-r border-slate-200">Cheking Kabid</th>
                <th className="py-2 px-2.5 text-center min-w-[100px]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-8 text-center text-slate-400">
                    Tidak ada catatan yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, idx) => {
                  const isDoneLdss = row.ldssStatus === 'Selesai';
                  const tierBg =
                    row.currentTier === 'Tier 3'
                      ? 'bg-rose-50/40'
                      : row.currentTier === 'Tier 2'
                      ? 'bg-amber-50/30'
                      : 'bg-white';

                  return (
                    <tr key={row.studentId || idx} className={`${tierBg} hover:bg-slate-50 transition-colors`}>
                      <td className="py-2 px-2 text-center text-slate-400 font-mono border-r border-slate-100 text-[11px]">
                        {row.no || idx + 1}
                      </td>

                      <td className="py-2 px-2 text-center border-r border-slate-100 font-bold text-slate-700">
                        <span className="inline-block px-1.5 py-0.2 rounded bg-slate-100 text-[10px]">
                          {row.gradeParallel}
                        </span>
                      </td>

                      <td className="py-2 px-3 border-r border-slate-100">
                        <button
                          onClick={() => onSelectStudent && onSelectStudent(row.studentId)}
                          className="font-bold text-slate-900 hover:text-emerald-700 text-left transition-colors cursor-pointer"
                        >
                          {row.studentName}
                        </button>
                        <span
                          className={`ml-1.5 inline-block px-1 py-0.2 rounded text-[9px] font-bold ${
                            row.currentTier === 'Tier 3'
                              ? 'bg-rose-100 text-rose-800'
                              : row.currentTier === 'Tier 2'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {row.currentTier}
                        </span>
                      </td>

                      <td className="py-2 px-2.5 border-r border-slate-100 font-medium text-slate-700">
                        {row.className}
                      </td>

                      <td className="py-2 px-2.5 border-r border-slate-100 text-slate-600">
                        {row.teacherName}
                      </td>

                      <td className="py-2 px-3 border-r border-slate-100 text-slate-800 text-[11px]">
                        {row.findings}
                      </td>

                      <td className="py-2 px-3 border-r border-slate-100 text-slate-800 text-[11px]">
                        {row.target}
                      </td>

                      {/* LDSS Status (Checkmark) */}
                      <td className="py-2 px-2 text-center border-r border-slate-100">
                        {isDoneLdss ? (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[10px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Sudah</span>
                          </span>
                        ) : (
                          <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px]">
                            Belum
                          </span>
                        )}
                      </td>

                      <td className="py-2 px-3 border-r border-slate-100 font-semibold text-slate-800 text-[11px]">
                        {row.tindakLanjut}
                        {row.draftBip && (
                          <div className="text-[10px] text-purple-700 font-medium mt-0.5">
                            📄 {row.draftBip}
                          </div>
                        )}
                      </td>

                      <td className="py-2 px-3 border-r border-slate-100 text-[11px]">
                        {row.jadwalPakGhofar ? (
                          <span className="font-semibold text-sky-800 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                            {row.jadwalPakGhofar}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Cheking Kepala Sekolah */}
                      <td className="py-2 px-2.5 text-center border-r border-slate-100">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            row.chekingKepalaSekolah === 'Complete'
                              ? 'bg-emerald-100 text-emerald-800'
                              : row.chekingKepalaSekolah === 'In Progress'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {row.chekingKepalaSekolah || 'Pending'}
                        </span>
                        {row.revisiReportKepsek && (
                          <div className="text-[9px] text-slate-500 mt-0.5 truncate max-w-[100px]" title={row.revisiReportKepsek}>
                            {row.revisiReportKepsek}
                          </div>
                        )}
                      </td>

                      {/* Cheking Kabid Inklusif */}
                      <td className="py-2 px-2.5 text-center border-r border-slate-100">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            row.chekingKabidInklusif === 'Complete'
                              ? 'bg-emerald-100 text-emerald-800'
                              : row.chekingKabidInklusif === 'In Progress'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {row.chekingKabidInklusif || 'Pending'}
                        </span>
                      </td>

                      <td className="py-2 px-2.5 text-center">
                        <span className="text-[10px] font-semibold text-slate-700 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                          {row.statusJadwal || 'Aktif'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
