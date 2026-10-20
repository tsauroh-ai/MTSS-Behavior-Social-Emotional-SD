import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { MasterClass, Student, TierLevel } from '../types';
import {
  School,
  Users,
  Smile,
  ShieldCheck,
  ChevronRight,
  Filter,
  Layers,
  GraduationCap,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';

interface ClassesViewProps {
  onSelectClassForEmotion?: (classId: string) => void;
  onSelectStudent?: (studentId: string) => void;
  onNavigateToTab?: (tab: any) => void;
}

export const ClassesView: React.FC<ClassesViewProps> = ({
  onSelectClassForEmotion,
  onSelectStudent,
  onNavigateToTab,
}) => {
  const [classes, setClasses] = useState<MasterClass[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<number | 'all'>('all');
  const [activeClassId, setActiveClassId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allClasses, allStudents] = await Promise.all([
        api.getClasses(),
        api.getStudents(),
      ]);
      setClasses(allClasses);
      setStudents(allStudents);
      if (allClasses.length > 0) {
        setActiveClassId(allClasses[0].id);
      }
    } catch (err) {
      console.error('Failed to load classes', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredClasses = classes.filter(cls => {
    if (selectedGrade !== 'all' && cls.grade !== selectedGrade) return false;
    return true;
  });

  const activeClass = classes.find(c => c.id === activeClassId);
  const activeClassStudents = students.filter(s => s.classId === activeClassId);

  // Stats
  const totalStudentsCount = students.length;
  const tier1Count = students.filter(s => s.currentTier === 'Tier 1').length;
  const tier2Count = students.filter(s => s.currentTier === 'Tier 2').length;
  const tier3Count = students.filter(s => s.currentTier === 'Tier 3').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-100 flex items-center justify-center text-sky-700">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Data Kelas & Paralel SD Lazuardi GCS</h1>
              <p className="text-xs text-slate-500">
                Struktur kelas paralel tingkat 1 s/d 6, wali kelas, serta sebaran siswa & tingkat dukungan MTSS
              </p>
            </div>
          </div>
        </div>

        {/* Grade Filters */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-xl text-xs">
          <button
            onClick={() => setSelectedGrade('all')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              selectedGrade === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Semua Tingkat
          </button>
          {[1, 2, 4, 5, 6].map(g => (
            <button
              key={g}
              onClick={() => setSelectedGrade(g)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                selectedGrade === g
                  ? 'bg-white text-sky-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Tingkat {g}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">🏫 Total Kelas Paralel</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{classes.length} Rombel</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Tahun Ajaran 2026/2027</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-2xs bg-emerald-50/20">
          <span className="text-xs font-medium text-emerald-800">🟢 Tier 1 (Universal)</span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">
            {tier1Count} <span className="text-xs font-normal text-slate-500">Siswa ({totalStudentsCount > 0 ? Math.round((tier1Count / totalStudentsCount) * 100) : 0}%)</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Dukungan umum di kelas</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-2xs bg-amber-50/20">
          <span className="text-xs font-medium text-amber-800">🟡 Tier 2 (Targeted)</span>
          <div className="text-2xl font-bold text-amber-700 mt-1">
            {tier2Count} <span className="text-xs font-normal text-slate-500">Siswa ({totalStudentsCount > 0 ? Math.round((tier2Count / totalStudentsCount) * 100) : 0}%)</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Kelompok kecil / bimbingan</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-2xs bg-rose-50/20">
          <span className="text-xs font-medium text-rose-800">🔴 Tier 3 (Intensif)</span>
          <div className="text-2xl font-bold text-rose-700 mt-1">
            {tier3Count} <span className="text-xs font-normal text-slate-500">Siswa ({totalStudentsCount > 0 ? Math.round((tier3Count / totalStudentsCount) * 100) : 0}%)</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Pendampingan individual & BIP</p>
        </div>
      </div>

      {/* Main Grid: Class Cards & Active Class Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Class Cards List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Daftar Rombel ({filteredClasses.length})
            </h3>
            <span className="text-[11px] text-slate-400">Pilih untuk melihat roster</span>
          </div>

          <div className="space-y-2.5">
            {filteredClasses.map(cls => {
              const clsStudents = students.filter(s => s.classId === cls.id);
              const t1 = clsStudents.filter(s => s.currentTier === 'Tier 1').length;
              const t2 = clsStudents.filter(s => s.currentTier === 'Tier 2').length;
              const t3 = clsStudents.filter(s => s.currentTier === 'Tier 3').length;
              const isSelected = activeClassId === cls.id;

              return (
                <div
                  key={cls.id}
                  onClick={() => setActiveClassId(cls.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-sky-50/70 border-sky-400 shadow-xs ring-1 ring-sky-300'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{cls.name}</span>
                        <span className="text-[10px] font-semibold text-sky-700 bg-sky-100 px-1.5 py-0.2 rounded">
                          Tingkat {cls.grade}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        Wali Kelas: <strong>{cls.homeroomTeacherName}</strong>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full">
                        {clsStudents.length} Siswa
                      </span>
                    </div>
                  </div>

                  {/* Tier Distribution Mini Bar */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-700 font-medium">T1: {t1}</span>
                      <span className="text-amber-700 font-medium">T2: {t2}</span>
                      <span className="text-rose-700 font-medium">T3: {t3}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-sky-600 font-semibold text-[11px]">
                      <span>Roster</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Class Roster (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          {activeClass ? (
            <>
              <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">Roster Siswa: {activeClass.name}</h3>
                    <span className="text-xs font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      {activeClassStudents.length} Siswa Terdata
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Wali Kelas: {activeClass.homeroomTeacherName} • Tahun Ajaran {activeClass.academicYear}
                  </p>
                </div>

                {onNavigateToTab && (
                  <button
                    onClick={() => {
                      if (onSelectClassForEmotion) onSelectClassForEmotion(activeClass.id);
                      onNavigateToTab('emotion-tracker');
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-2xs cursor-pointer"
                  >
                    <Smile className="w-3.5 h-3.5" />
                    <span>Catat Emosi Kelas Ini</span>
                  </button>
                )}
              </div>

              <div className="p-4 overflow-y-auto max-h-[600px] divide-y divide-slate-100">
                {activeClassStudents.length === 0 ? (
                  <div className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs">Belum ada siswa terdaftar pada rombel ini.</p>
                  </div>
                ) : (
                  activeClassStudents.map((st, i) => (
                    <div
                      key={st.id}
                      className="py-3 flex items-start justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition-colors"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="text-xs font-mono text-slate-400 mt-0.5">{i + 1}.</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onSelectStudent && onSelectStudent(st.id)}
                              className="font-bold text-xs text-slate-900 hover:text-sky-600 transition-colors text-left cursor-pointer"
                            >
                              {st.fullName}
                            </button>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                st.currentTier === 'Tier 3'
                                  ? 'bg-rose-100 text-rose-800'
                                  : st.currentTier === 'Tier 2'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {st.currentTier}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-500 mt-0.5">
                            NISN: {st.nisn} • Panggilan: "{st.nickname}"
                          </div>

                          {st.notes && (
                            <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                              📝 {st.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1.5">
                        {onSelectStudent && (
                          <button
                            onClick={() => onSelectStudent(st.id)}
                            className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                          >
                            Profil MTSS
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400">
              Pilih salah satu kelas di sebelah kiri untuk melihat daftar siswa.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
