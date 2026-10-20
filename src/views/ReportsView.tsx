import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Student, MasterClass, SupportPlan, BehaviorObservation, SocialEmotionalObservation, MtssReview } from '../types';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Filter,
  Users,
  Eye,
  HeartHandshake,
  Target,
  BarChart2,
  Calendar,
  Layers,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { TierBadge, SocialEmotionalBadge } from '../components/common/Badge';

export const ReportsView: React.FC = () => {
  const { currentUser, isPimpinan, isGuru } = useAuth();

  const [reportType, setReportType] = useState<'class_summary' | 'student_profile' | 'school_aggregate' | 'tier_distribution'>('class_summary');
  const [classes, setClasses] = useState<MasterClass[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [plans, setPlans] = useState<SupportPlan[]>([]);
  const [behaviorObs, setBehaviorObs] = useState<BehaviorObservation[]>([]);
  const [seObs, setSeObs] = useState<SocialEmotionalObservation[]>([]);
  const [reviews, setReviews] = useState<MtssReview[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter criteria
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [clsData, stdData, plnData, behData, seData, revData] = await Promise.all([
        api.getClasses(),
        api.getStudents(),
        api.getSupportPlans(),
        api.getBehaviorObservations(),
        api.getSocialEmotionalObservations(),
        api.getMtssReviews(),
      ]);
      setClasses(clsData);
      setStudents(stdData);
      setPlans(plnData);
      setBehaviorObs(behData);
      setSeObs(seData);
      setReviews(revData);
      if (stdData.length > 0) setSelectedStudentId(stdData[0].id);
    } catch (err) {
      console.error('Failed to load report data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (reportType === 'class_summary') {
      csvContent += 'NISN,Nama Siswa,Kelas,Current Tier,Status Review,Rencana Aktif\n';
      students
        .filter(s => selectedClass === 'all' || s.classId === selectedClass)
        .forEach(s => {
          const actPln = plans.filter(p => p.studentId === s.id && p.status === 'Active').length;
          csvContent += `"${s.nisn}","${s.fullName}","${s.className}","${s.currentTier}","${s.needsReviewFlag ? 'Perlu Review' : 'Rutin'}",${actPln}\n`;
        });
    } else {
      csvContent += 'ID,Siswa,Tipe Data,Tanggal,Keterangan\n';
      behaviorObs.forEach(b => {
        csvContent += `"${b.id}","${b.studentName}","Observasi Behavior","${b.date}","${b.behaviorObserved.replace(/"/g, '""')}"\n`;
      });
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_MTSS_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredStudents = students.filter(s => selectedClass === 'all' || s.classId === selectedClass);
  const selectedStudentObj = students.find(s => s.id === selectedStudentId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Laporan & Rekapitulasi MTSS</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ekspor data pemantauan berkala, rekapitulasi rombel kelas, dan analisis tingkat dukungan sekolah.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector & Filters (Hidden during Print) */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3 print:hidden">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setReportType('class_summary')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              reportType === 'class_summary'
                ? 'bg-sky-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            1. Rekapitulasi Per Rombel Kelas
          </button>
          <button
            onClick={() => setReportType('student_profile')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              reportType === 'student_profile'
                ? 'bg-sky-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            2. Dokumen Portofolio MTSS Siswa
          </button>
          <button
            onClick={() => setReportType('school_aggregate')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              reportType === 'school_aggregate'
                ? 'bg-sky-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            3. Ringkasan Agregat Tingkat Sekolah
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          {reportType === 'class_summary' && (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Pilih Kelas:</span>
              <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="all">Semua Rombel Kelas</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {reportType === 'student_profile' && (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Pilih Siswa:</span>
              <select
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg max-w-xs font-medium"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.className}) - {s.currentTier}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Printable Report Canvas */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs print:p-0 print:border-none print:shadow-none space-y-6">
        {/* Official Header */}
        <div className="border-b-2 border-slate-800 pb-4 text-center space-y-1">
          <h1 className="text-lg font-bold text-slate-900 uppercase tracking-wide">
            SEKOLAH DASAR INKLUSIF NUSANTARA
          </h1>
          <h2 className="text-sm font-semibold text-slate-700">
            {reportType === 'class_summary' && 'REKAPITULASI DUKUNGAN MTSS PER ROMBEL KELAS'}
            {reportType === 'student_profile' && 'LEMBAR DOKUMENTASI & PORTOFOLIO DUKUNGAN MTSS SISWA'}
            {reportType === 'school_aggregate' && 'LAPORAN AGREGAT IMPLEMENTASI MULTI-TIERED SYSTEM OF SUPPORTS'}
          </h2>
          <p className="text-[11px] text-slate-500">
            Tahun Ajaran 2026/2027 • Dokumen Resmi Internal Sekolah • Dicetak: {new Date().toLocaleDateString('id-ID')}
          </p>
        </div>

        {/* 1. Class Summary Report */}
        {reportType === 'class_summary' && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>Filter Rombel: <strong>{selectedClass === 'all' ? 'Semua Kelas' : classes.find(c => c.id === selectedClass)?.name}</strong></span>
              <span>Total Siswa: <strong>{filteredStudents.length} Siswa</strong></span>
            </div>

            <table className="w-full text-left border-collapse border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-bold text-[11px]">
                <tr>
                  <th className="border border-slate-200 px-3 py-2">No</th>
                  <th className="border border-slate-200 px-3 py-2">NISN</th>
                  <th className="border border-slate-200 px-3 py-2">Nama Lengkap Siswa</th>
                  <th className="border border-slate-200 px-3 py-2">Kelas</th>
                  <th className="border border-slate-200 px-3 py-2">Status Tier MTSS</th>
                  <th className="border border-slate-200 px-3 py-2">Status Peninjauan</th>
                  <th className="border border-slate-200 px-3 py-2">Rencana Aktif</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredStudents.map((std, idx) => {
                  const actPlans = plans.filter(p => p.studentId === std.id && p.status === 'Active');
                  return (
                    <tr key={std.id} className="hover:bg-slate-50">
                      <td className="border border-slate-200 px-3 py-2 text-center">{idx + 1}</td>
                      <td className="border border-slate-200 px-3 py-2">{std.nisn}</td>
                      <td className="border border-slate-200 px-3 py-2 font-bold">{std.fullName}</td>
                      <td className="border border-slate-200 px-3 py-2">{std.className}</td>
                      <td className="border border-slate-200 px-3 py-2">
                        <TierBadge tier={std.currentTier} size="sm" />
                      </td>
                      <td className="border border-slate-200 px-3 py-2">
                        {std.needsReviewFlag ? (
                          <span className="font-semibold text-amber-800">⚠️ Perlu Ditinjau Tim</span>
                        ) : (
                          <span className="text-emerald-700">Rutin</span>
                        )}
                      </td>
                      <td className="border border-slate-200 px-3 py-2">
                        {actPlans.length > 0 ? (
                          <span className="font-medium text-slate-800">{actPlans[0].areaOfNeed}</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. Individual Student MTSS Portfolio Report */}
        {reportType === 'student_profile' && selectedStudentObj && (
          <div className="space-y-6 text-xs text-slate-800">
            {/* Student Bio Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Nama Siswa</span>
                <div className="font-bold text-slate-900 text-sm">{selectedStudentObj.fullName}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">NISN / Kelas</span>
                <div className="font-semibold">{selectedStudentObj.nisn} • {selectedStudentObj.className}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Tingkat Tier MTSS</span>
                <div className="mt-0.5"><TierBadge tier={selectedStudentObj.currentTier} size="sm" /></div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Wali Murid</span>
                <div className="font-semibold">{selectedStudentObj.guardianName || '-'}</div>
              </div>
            </div>

            {/* Support Plans */}
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 uppercase text-xs tracking-wider border-b pb-1">
                A. Rencana Dukungan Aktif (Active Support Plans)
              </h3>
              {plans.filter(p => p.studentId === selectedStudentObj.id).length === 0 ? (
                <p className="text-slate-400 italic">Belum ada rencana dukungan khusus.</p>
              ) : (
                plans
                  .filter(p => p.studentId === selectedStudentObj.id)
                  .map(p => (
                    <div key={p.id} className="p-3 border border-slate-200 rounded-xl space-y-1.5">
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>{p.areaOfNeed} ({p.tier})</span>
                        <span className="text-slate-500 font-normal">Status: {p.status}</span>
                      </div>
                      <p className="text-slate-700"><strong>Target:</strong> {p.targetGoals}</p>
                      <p className="text-slate-700"><strong>Strategi:</strong> {p.strategies.join('; ')}</p>
                    </div>
                  ))
              )}
            </div>

            {/* Recent Observations */}
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 uppercase text-xs tracking-wider border-b pb-1">
                B. Catatan Observasi Perilaku Terpilih
              </h3>
              {behaviorObs.filter(b => b.studentId === selectedStudentObj.id).length === 0 ? (
                <p className="text-slate-400 italic">Belum ada catatan observasi behavior.</p>
              ) : (
                <div className="space-y-2">
                  {behaviorObs.filter(b => b.studentId === selectedStudentObj.id).map(b => (
                    <div key={b.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex justify-between text-slate-500 font-semibold">
                        <span>{b.locationContext} ({b.date} {b.time})</span>
                        <span>Observer: {b.observerName}</span>
                      </div>
                      <p><strong>Perilaku:</strong> {b.behaviorObserved}</p>
                      <p><strong>Strategi & Hasil:</strong> {b.supportStrategyGiven} → {b.resultAfterSupport}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. School Aggregate Report */}
        {reportType === 'school_aggregate' && (
          <div className="space-y-6 text-xs text-slate-800">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="text-2xl font-bold text-emerald-800">
                  {students.filter(s => s.currentTier === 'Tier 1').length} Siswa
                </div>
                <div className="text-xs text-emerald-900 font-semibold mt-1">Tier 1 — Universal Support</div>
                <div className="text-[11px] text-emerald-700 mt-0.5">85% dari total populasi</div>
              </div>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="text-2xl font-bold text-amber-800">
                  {students.filter(s => s.currentTier === 'Tier 2').length} Siswa
                </div>
                <div className="text-xs text-amber-900 font-semibold mt-1">Tier 2 — Targeted Support</div>
                <div className="text-[11px] text-amber-700 mt-0.5">11% dari total populasi</div>
              </div>
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
                <div className="text-2xl font-bold text-rose-800">
                  {students.filter(s => s.currentTier === 'Tier 3').length} Siswa
                </div>
                <div className="text-xs text-rose-900 font-semibold mt-1">Tier 3 — Intensive Support</div>
                <div className="text-[11px] text-rose-700 mt-0.5">4% dari total populasi</div>
              </div>
            </div>

            <div className="p-4 border border-slate-200 rounded-xl space-y-2">
              <h3 className="font-bold text-slate-900 text-xs uppercase">Ikhtisar Pelaksanaan Intervensi Sekolah</h3>
              <p className="text-slate-700 leading-relaxed">
                Implementasi MTSS pada semester berjalan menunjukkan efektivitas strategi pencegahan dini pada Tier 1.
                Sebanyak {plans.filter(p => p.status === 'Active').length} rencana dukungan aktif dijalankan secara
                berkesinambungan dengan pendampingan wali kelas dan konselor sekolah.
              </p>
            </div>
          </div>
        )}

        {/* Signature Area */}
        <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs text-slate-800">
          <div>
            <p className="text-slate-500">Mengetahui,</p>
            <p className="font-bold mt-0.5">Kepala Sekolah SD Inklusif Nusantara</p>
            <div className="h-16" />
            <p className="font-bold underline">Drs. H. Mulyadi, M.Pd.</p>
            <p className="text-[11px] text-slate-500">NIP. 19740512 199803 1 004</p>
          </div>
          <div>
            <p className="text-slate-500">Kota Pendidikan, {new Date().toLocaleDateString('id-ID')}</p>
            <p className="font-bold mt-0.5">Koordinator Tim MTSS</p>
            <div className="h-16" />
            <p className="font-bold underline">Budi Santoso, S.Pd., M.Si.</p>
            <p className="text-[11px] text-slate-500">NIP. 19850320 201001 1 012</p>
          </div>
        </div>
      </div>
    </div>
  );
};
