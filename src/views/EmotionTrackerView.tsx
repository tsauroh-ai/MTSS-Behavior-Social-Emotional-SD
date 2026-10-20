import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import {
  EmotionRecord,
  EmotionType,
  WeatherFeeling,
  MasterClass,
  Student,
} from '../types';
import {
  Smile,
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  Heart,
  TrendingUp,
  Filter,
  Check,
  ChevronRight,
  Flame,
  Award,
} from 'lucide-react';
import { Modal } from '../components/common/Modal';

export const EMOTIONS_META: Record<EmotionType, { label: string; emoji: string; color: string; bg: string }> = {
  senang: { label: 'Senang & Gembira', emoji: '😊', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  tenang: { label: 'Tenang & Siap Belajar', emoji: '😌', color: 'text-sky-700', bg: 'bg-sky-50 border-sky-200' },
  bersemangat: { label: 'Sangat Bersemangat', emoji: '🤩', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  sedih: { label: 'Sedih / Butuh Hiburan', emoji: '😢', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  marah: { label: 'Marah / Kesal', emoji: '😠', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
  cemas: { label: 'Cemas / Gelisah', emoji: '😰', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  lelah: { label: 'Lelah / Mengantuk', emoji: '🥱', color: 'text-slate-700', bg: 'bg-slate-100 border-slate-200' },
  kecewa: { label: 'Kecewa / Frustrasi', emoji: '😞', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
};

export const WEATHER_META: Record<WeatherFeeling, { label: string; icon: any; color: string }> = {
  cerah: { label: 'Cerah', icon: Sun, color: 'text-amber-500' },
  berawan: { label: 'Berawan', icon: Cloud, color: 'text-slate-400' },
  hujan: { label: 'Hujan', icon: CloudRain, color: 'text-blue-500' },
  badai: { label: 'Badai', icon: CloudLightning, color: 'text-rose-600' },
  pelangi: { label: 'Pelangi', icon: Sparkles, color: 'text-purple-500' },
};

interface EmotionTrackerViewProps {
  onSelectStudent?: (studentId: string) => void;
}

export const EmotionTrackerView: React.FC<EmotionTrackerViewProps> = ({ onSelectStudent }) => {
  const { currentUser, canWriteObservations } = useAuth();

  const [classes, setClasses] = useState<MasterClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('cls-2-tongariro');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<Student[]>([]);
  const [emotions, setEmotions] = useState<EmotionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'checkIn' | 'checkOut'>('checkIn');
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<Student | null>(null);

  // Form Fields
  const [formEmotion, setFormEmotion] = useState<EmotionType>('senang');
  const [formMoodScore, setFormMoodScore] = useState<number>(8);
  const [formWeather, setFormWeather] = useState<WeatherFeeling>('cerah');
  const [formPrimaryFeeling, setFormPrimaryFeeling] = useState<string>('Siap Belajar');
  const [formEnergyLevel, setFormEnergyLevel] = useState<'Rendah' | 'Sedang' | 'Tinggi'>('Sedang');
  const [formTrigger, setFormTrigger] = useState<string>('');
  const [formHighlights, setFormHighlights] = useState<string>('');
  const [formGratitude, setFormGratitude] = useState<string>('');
  const [formChallenges, setFormChallenges] = useState<string>('');
  const [formGoals, setFormGoals] = useState<string>('');
  const [formNotes, setFormNotes] = useState<string>('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [allClasses, classStudents, classEmotions] = await Promise.all([
        api.getClasses(),
        api.getStudents({ classId: selectedClassId }),
        api.getEmotions({ classId: selectedClassId, date: selectedDate }),
      ]);
      setClasses(allClasses);
      if (allClasses.length > 0 && !selectedClassId) {
        setSelectedClassId(allClasses[0].id);
      }
      setStudents(classStudents);
      setEmotions(classEmotions);
    } catch (err) {
      console.error('Failed to load emotion records', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedClassId, selectedDate]);

  const activeClass = classes.find(c => c.id === selectedClassId);

  // Quick statistics
  const checkInCount = emotions.filter(e => e.checkIn).length;
  const checkOutCount = emotions.filter(e => e.checkOut).length;
  const totalInClass = students.length;
  const checkInPct = totalInClass > 0 ? Math.round((checkInCount / totalInClass) * 100) : 0;
  const checkOutPct = totalInClass > 0 ? Math.round((checkOutCount / totalInClass) * 100) : 0;

  const allScores = [
    ...emotions.filter(e => e.checkIn).map(e => e.checkIn!.moodScore),
    ...emotions.filter(e => e.checkOut).map(e => e.checkOut!.moodScore),
  ];
  const avgMood = allScores.length > 0 ? (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(1) : '-';

  const openStudentModal = (student: Student, type: 'checkIn' | 'checkOut') => {
    setSelectedStudentForModal(student);
    setActiveModalTab(type);

    const existing = emotions.find(e => e.studentId === student.id);
    if (type === 'checkIn' && existing?.checkIn) {
      setFormEmotion(existing.checkIn.emotion);
      setFormMoodScore(existing.checkIn.moodScore);
      setFormWeather(existing.checkIn.weatherFeeling || 'cerah');
      setFormPrimaryFeeling(existing.checkIn.primaryFeeling || 'Siap Belajar');
      setFormEnergyLevel(existing.checkIn.energyLevel || 'Sedang');
      setFormTrigger(existing.checkIn.contextOrTrigger || '');
      setFormNotes(existing.checkIn.notes || '');
    } else if (type === 'checkOut' && existing?.checkOut) {
      setFormEmotion(existing.checkOut.emotion);
      setFormMoodScore(existing.checkOut.moodScore);
      setFormWeather(existing.checkOut.weatherFeeling || 'cerah');
      setFormPrimaryFeeling(existing.checkOut.primaryFeeling || 'Puas & Senang');
      setFormEnergyLevel(existing.checkOut.energyLevel || 'Sedang');
      setFormHighlights(existing.checkOut.highlightsOfDay || '');
      setFormGratitude(existing.checkOut.gratitudeNote || '');
      setFormChallenges(existing.checkOut.challengesFelt || '');
      setFormGoals(existing.checkOut.goalsForTomorrow || '');
      setFormNotes(existing.checkOut.notes || '');
    } else {
      // Defaults
      setFormEmotion('senang');
      setFormMoodScore(8);
      setFormWeather('cerah');
      setFormPrimaryFeeling(type === 'checkIn' ? 'Siap Belajar' : 'Puas & Berhasil');
      setFormEnergyLevel('Sedang');
      setFormTrigger('');
      setFormHighlights('');
      setFormGratitude('');
      setFormChallenges('');
      setFormGoals('');
      setFormNotes('');
    }

    setIsRecordModalOpen(true);
  };

  const handleSaveEmotion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedStudentForModal) return;

    try {
      const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      const existing = emotions.find(r => r.studentId === selectedStudentForModal.id);

      const checkInData = activeModalTab === 'checkIn' ? {
        time: existing?.checkIn?.time || nowTime,
        emotion: formEmotion,
        moodScore: formMoodScore,
        weatherFeeling: formWeather,
        primaryFeeling: formPrimaryFeeling,
        energyLevel: formEnergyLevel,
        contextOrTrigger: formTrigger,
        notes: formNotes,
        recordedById: currentUser.id,
        recordedByName: currentUser.name,
        recordedByRole: currentUser.roleTitle,
        recordedAt: new Date().toISOString(),
      } : existing?.checkIn;

      const checkOutData = activeModalTab === 'checkOut' ? {
        time: existing?.checkOut?.time || nowTime,
        emotion: formEmotion,
        moodScore: formMoodScore,
        weatherFeeling: formWeather,
        primaryFeeling: formPrimaryFeeling,
        energyLevel: formEnergyLevel,
        highlightsOfDay: formHighlights,
        gratitudeNote: formGratitude,
        challengesFelt: formChallenges,
        goalsForTomorrow: formGoals,
        notes: formNotes,
        recordedById: currentUser.id,
        recordedByName: currentUser.name,
        recordedByRole: currentUser.roleTitle,
        recordedAt: new Date().toISOString(),
      } : existing?.checkOut;

      await api.saveEmotion({
        studentId: selectedStudentForModal.id,
        studentName: selectedStudentForModal.fullName,
        classId: selectedStudentForModal.classId,
        className: selectedStudentForModal.className,
        date: selectedDate,
        ...(checkInData ? { checkIn: checkInData } : {}),
        ...(checkOutData ? { checkOut: checkOutData } : {}),
      });

      setIsRecordModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan catatan emosi');
    }
  };

  const handleBatchSaveAllClass = async (type: 'checkIn' | 'checkOut') => {
    if (!currentUser || !activeClass) return;
    try {
      const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      const recordsToSave = students.map(st => {
        const existing = emotions.find(e => e.studentId === st.id);
        const checkInData = type === 'checkIn' ? {
          time: existing?.checkIn?.time || nowTime,
          emotion: 'senang' as EmotionType,
          moodScore: 8,
          weatherFeeling: 'cerah' as WeatherFeeling,
          primaryFeeling: 'Siap Belajar',
          energyLevel: 'Sedang' as const,
          notes: 'Check-in cepat sesi pagi kelas',
          recordedById: currentUser.id,
          recordedByName: currentUser.name,
          recordedByRole: currentUser.roleTitle,
          recordedAt: new Date().toISOString(),
        } : existing?.checkIn;

        const checkOutData = type === 'checkOut' ? {
          time: existing?.checkOut?.time || nowTime,
          emotion: 'senang' as EmotionType,
          moodScore: 8,
          weatherFeeling: 'cerah' as WeatherFeeling,
          primaryFeeling: 'Puas & Berhasil',
          energyLevel: 'Sedang' as const,
          highlightsOfDay: 'Mengikuti seluruh sesi pembelajaran kelas dengan tertib',
          notes: 'Check-out serentak sesi pulang kelas',
          recordedById: currentUser.id,
          recordedByName: currentUser.name,
          recordedByRole: currentUser.roleTitle,
          recordedAt: new Date().toISOString(),
        } : existing?.checkOut;

        return {
          studentId: st.id,
          studentName: st.fullName,
          classId: st.classId,
          className: st.className,
          date: selectedDate,
          ...(checkInData ? { checkIn: checkInData } : {}),
          ...(checkOutData ? { checkOut: checkOutData } : {}),
        };
      });

      await api.batchSaveEmotions(recordsToSave);
      setIsBatchModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal melakukan check-in massal');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Smile className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Check-In & Check-Out Emosi Kelas</h1>
              <p className="text-xs text-slate-500">
                Pencatatan kondisi emosi awal hari (pagi) dan refleksi akhir hari (siang) untuk setiap kelas & siswa
              </p>
            </div>
          </div>
        </div>

        {/* Class and Date Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-medium text-slate-600">Kelas:</span>
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="font-bold text-slate-900 bg-transparent border-none focus:outline-none cursor-pointer"
            >
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} (Wali: {cls.homeroomTeacherName})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="font-bold text-slate-900 bg-transparent border-none focus:outline-none cursor-pointer"
            />
          </div>

          {canWriteObservations && (
            <button
              onClick={() => setIsBatchModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-2xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Aksi Kelas Serentak</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">🌅 Check-In Pagi (Masuk)</span>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              {checkInPct}%
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1.5">
            {checkInCount} / {totalInClass}
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${checkInPct}%` }} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">🌆 Check-Out Siang (Pulang)</span>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {checkOutPct}%
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1.5">
            {checkOutCount} / {totalInClass}
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${checkOutPct}%` }} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">⭐ Rata-Rata Mood Kelas</span>
          <div className="text-2xl font-bold text-emerald-700 mt-1.5 flex items-center gap-1.5">
            <span>{avgMood}</span>
            <span className="text-xs font-normal text-slate-500">/ 10</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Kondisi kelas kondusif</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">🔥 Program CICO 21x Berjalan</span>
          <div className="text-2xl font-bold text-purple-700 mt-1.5 flex items-center gap-1.5">
            <Award className="w-5 h-5 text-purple-600" />
            <span>
              {emotions.filter(e => (e.cycle21Count || 0) > 0).length} Siswa
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Target 21 hari adaptasi perilaku</p>
        </div>
      </div>

      {/* Program "Check in & Check out 21x" Banner for specific students */}
      <div className="bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-emerald-500/10 border border-amber-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Program Khusus Lazuardi: "Check In & Check Out 21x"</h4>
            <p className="text-[11px] text-slate-600">
              Intervensi intensif CICO 21 siklus berturut-turut untuk siswa dengan target regulasi emosi & pemulihan relasi (seperti tercatat pada data: Pratama Raditya Dirga, Arbijandra, Kafka, Kala).
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-semibold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-amber-200">
            Wali Kelas: {activeClass?.homeroomTeacherName}
          </span>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Daftar Siswa {activeClass?.name}</span>
              <span className="text-xs font-normal text-slate-500">({students.length} Siswa Terdaftar)</span>
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Tanggal: <strong className="text-slate-800">{selectedDate}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3 w-12 text-center">No</th>
                <th className="py-2.5 px-3 min-w-[180px]">Siswa</th>
                <th className="py-2.5 px-3 min-w-[70px]">Tier</th>
                <th className="py-2.5 px-3 min-w-[200px]">🌅 Check-In Pagi (Masuk)</th>
                <th className="py-2.5 px-3 min-w-[200px]">🌆 Check-Out Siang (Pulang)</th>
                <th className="py-2.5 px-3 min-w-[90px] text-center">CICO 21x</th>
                <th className="py-2.5 px-3 min-w-[110px] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Tidak ada siswa terdaftar pada kelas ini.
                  </td>
                </tr>
              ) : (
                students.map((student, idx) => {
                  const record = emotions.find(e => e.studentId === student.id);
                  const checkIn = record?.checkIn;
                  const checkOut = record?.checkOut;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-3">
                        <button
                          onClick={() => onSelectStudent && onSelectStudent(student.id)}
                          className="font-bold text-slate-900 hover:text-sky-600 text-left transition-colors cursor-pointer"
                        >
                          {student.fullName}
                        </button>
                        <div className="text-[10px] text-slate-400">NISN: {student.nisn}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            student.currentTier === 'Tier 3'
                              ? 'bg-rose-100 text-rose-800'
                              : student.currentTier === 'Tier 2'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {student.currentTier}
                        </span>
                      </td>

                      {/* Check-In Column */}
                      <td className="py-2.5 px-3">
                        {checkIn ? (
                          <div className="p-2 bg-amber-50/70 border border-amber-200/70 rounded-xl space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800 flex items-center gap-1">
                                <span>{EMOTIONS_META[checkIn.emotion].emoji}</span>
                                <span>{EMOTIONS_META[checkIn.emotion].label}</span>
                              </span>
                              <span className="font-mono text-[10px] text-amber-800 bg-white px-1 rounded border border-amber-200">
                                {checkIn.moodScore}/10
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                              <Clock className="w-3 h-3" />
                              <span>{checkIn.time}</span>
                              {checkIn.weatherFeeling && (
                                <span className="capitalize">· Cuaca: {checkIn.weatherFeeling}</span>
                              )}
                            </div>
                            {checkIn.primaryFeeling && (
                              <p className="text-[11px] text-slate-700 font-medium">"{checkIn.primaryFeeling}"</p>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => openStudentModal(student, 'checkIn')}
                            className="w-full py-2 px-3 border border-dashed border-amber-300 rounded-xl text-amber-700 bg-amber-50/40 hover:bg-amber-50 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          >
                            <span>+ Catat Check-In</span>
                          </button>
                        )}
                      </td>

                      {/* Check-Out Column */}
                      <td className="py-2.5 px-3">
                        {checkOut ? (
                          <div className="p-2 bg-blue-50/70 border border-blue-200/70 rounded-xl space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800 flex items-center gap-1">
                                <span>{EMOTIONS_META[checkOut.emotion].emoji}</span>
                                <span>{EMOTIONS_META[checkOut.emotion].label}</span>
                              </span>
                              <span className="font-mono text-[10px] text-blue-800 bg-white px-1 rounded border border-blue-200">
                                {checkOut.moodScore}/10
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                              <Clock className="w-3 h-3" />
                              <span>{checkOut.time}</span>
                            </div>
                            {checkOut.highlightsOfDay && (
                              <p className="text-[11px] text-slate-700 line-clamp-1">🌟 {checkOut.highlightsOfDay}</p>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => openStudentModal(student, 'checkOut')}
                            className="w-full py-2 px-3 border border-dashed border-blue-300 rounded-xl text-blue-700 bg-blue-50/40 hover:bg-blue-50 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          >
                            <span>+ Catat Check-Out</span>
                          </button>
                        )}
                      </td>

                      {/* CICO 21x Count */}
                      <td className="py-2.5 px-3 text-center">
                        {record?.cycle21Count ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                            <Flame className="w-3 h-3 text-purple-600" />
                            <span>{record.cycle21Count}/21</span>
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openStudentModal(student, 'checkIn')}
                            className="p-1 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors cursor-pointer"
                            title="Edit Check-In Pagi"
                          >
                            <Sun className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openStudentModal(student, 'checkOut')}
                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                            title="Edit Check-Out Siang"
                          >
                            <Heart className="w-3.5 h-3.5" />
                          </button>
                          {onSelectStudent && (
                            <button
                              onClick={() => onSelectStudent(student.id)}
                              className="p-1 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-md transition-colors cursor-pointer"
                              title="Buka Profil Lengkap"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
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

      {/* Modal: Record Emotion (Check-In or Check-Out) */}
      {isRecordModalOpen && selectedStudentForModal && (
        <Modal
          isOpen={isRecordModalOpen}
          onClose={() => setIsRecordModalOpen(false)}
          title={`Catat Emosi: ${selectedStudentForModal.fullName}`}
          size="lg"
        >
          <form onSubmit={handleSaveEmotion} className="space-y-4 text-xs">
            {/* Tab Selector: Pagi vs Siang */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveModalTab('checkIn')}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeModalTab === 'checkIn'
                    ? 'bg-white text-amber-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>🌅 Check-In Pagi (Masuk)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('checkOut')}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeModalTab === 'checkOut'
                    ? 'bg-white text-blue-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Heart className="w-3.5 h-3.5 text-blue-600" />
                <span>🌆 Check-Out Siang (Pulang)</span>
              </button>
            </div>

            {/* Emotion Grid Selector */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Pilih Kondisi Emosi Utama:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(Object.keys(EMOTIONS_META) as EmotionType[]).map(key => {
                  const item = EMOTIONS_META[key];
                  const isSelected = formEmotion === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFormEmotion(key)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                        isSelected
                          ? `${item.bg} border-2 border-emerald-500 shadow-2xs`
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xl">{item.emoji}</span>
                      <div className="leading-tight">
                        <div className="font-bold text-slate-900 capitalize">{key}</div>
                        <div className="text-[10px] text-slate-500">{item.label}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mood Score Slider & Weather Feeling */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700">Skor Mood / Kenyamanan (1-10):</label>
                  <span className="font-mono text-sm font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    {formMoodScore} / 10
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={formMoodScore}
                  onChange={e => setFormMoodScore(parseInt(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>1 (Sangat Rendah)</span>
                  <span>5 (Cukup)</span>
                  <span>10 (Optimal)</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Metafora Cuaca Perasaan:</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {(Object.keys(WEATHER_META) as WeatherFeeling[]).map(wKey => {
                    const wItem = WEATHER_META[wKey];
                    const WIcon = wItem.icon;
                    const isWSelected = formWeather === wKey;
                    return (
                      <button
                        key={wKey}
                        type="button"
                        onClick={() => setFormWeather(wKey)}
                        className={`p-2 rounded-lg border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                          isWSelected
                            ? 'bg-emerald-50 border-emerald-500 shadow-2xs font-bold'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <WIcon className={`w-4 h-4 ${wItem.color}`} />
                        <span className="text-[10px] capitalize">{wKey}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Context Inputs depending on Check-In vs Check-Out */}
            {activeModalTab === 'checkIn' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Kata Kunci Perasaan Siswa:</label>
                    <input
                      type="text"
                      value={formPrimaryFeeling}
                      onChange={e => setFormPrimaryFeeling(e.target.value)}
                      placeholder="Contoh: Siap Belajar, Senang Bertemu Teman, Ngantuk..."
                      className="w-full p-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Tingkat Energi:</label>
                    <select
                      value={formEnergyLevel}
                      onChange={e => setFormEnergyLevel(e.target.value as any)}
                      className="w-full p-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="Rendah">Rendah (Butuh Stimulasi Tenang)</option>
                      <option value="Sedang">Sedang (Optimal Belajar)</option>
                      <option value="Tinggi">Tinggi (Aktif & Penuh Semangat)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Pemicu / Konteks Pagi (Opsional):</label>
                  <input
                    type="text"
                    value={formTrigger}
                    onChange={e => setFormTrigger(e.target.value)}
                    placeholder="Contoh: Sarapan di mobil, tidur cukup, membawa mainan favorit..."
                    className="w-full p-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">🌟 Highlight Terbaik Hari Ini:</label>
                  <input
                    type="text"
                    value={formHighlights}
                    onChange={e => setFormHighlights(e.target.value)}
                    placeholder="Contoh: Berhasil menyelesaikan soal matematika, berbagi bekal..."
                    className="w-full p-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">🙏 Catatan Rasa Syukur / Terima Kasih:</label>
                    <input
                      type="text"
                      value={formGratitude}
                      onChange={e => setFormGratitude(e.target.value)}
                      placeholder="Contoh: Bersyukur dibantu teman saat menggambar..."
                      className="w-full p-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">🎯 Target untuk Esok Hari:</label>
                    <input
                      type="text"
                      value={formGoals}
                      onChange={e => setFormGoals(e.target.value)}
                      placeholder="Contoh: Datang lebih pagi, mau meminjamkan alat tulis..."
                      className="w-full p-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Catatan Observasi Guru:</label>
              <textarea
                value={formNotes}
                onChange={e => setFormNotes(e.target.value)}
                placeholder="Catatan tambahan mengenai interaksi dan respon siswa..."
                rows={2}
                className="w-full p-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsRecordModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Simpan Catatan Emosi
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Batch Check-in / Check-out */}
      {isBatchModalOpen && (
        <Modal
          isOpen={isBatchModalOpen}
          onClose={() => setIsBatchModalOpen(false)}
          title={`Aksi Emosi Serentak Kelas: ${activeClass?.name}`}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Pilih aksi serentak untuk seluruh siswa yang belum tercatat pada tanggal{' '}
              <strong>{selectedDate}</strong> di <strong>{activeClass?.name}</strong>. Anda tetap dapat menyesuaikan catatan masing-masing siswa setelahnya.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleBatchSaveAllClass('checkIn')}
                className="p-4 border border-amber-300 bg-amber-50/50 hover:bg-amber-50 rounded-xl text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2 font-bold text-amber-900 mb-1">
                  <Sun className="w-4 h-4 text-amber-600" />
                  <span>Check-In Pagi Serentak</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Tandai seluruh siswa kelas hadir dengan mood tenang & siap belajar.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleBatchSaveAllClass('checkOut')}
                className="p-4 border border-blue-300 bg-blue-50/50 hover:bg-blue-50 rounded-xl text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2 font-bold text-blue-900 mb-1">
                  <Heart className="w-4 h-4 text-blue-600" />
                  <span>Check-Out Siang Serentak</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Tandai seluruh siswa pulang dengan mood senang dan pembelajaran tuntas.
                </p>
              </button>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsBatchModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-semibold cursor-pointer"
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
