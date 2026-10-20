import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import {
  Student,
  BehaviorObservation,
  SocialEmotionalObservation,
  SupportPlan,
  InterventionLog,
  ProgressMonitoringRecord,
  FollowUp,
  MtssReview,
  MasterIndicatorGroup,
  MasterStrategy,
  TierLevel,
  SocialEmotionalScale,
  EmotionRecord,
  LdssRecord,
  SupervisionSchedule,
  CaseConferenceRecord,
  SingleEmotionCheck,
} from '../types';
import {
  ArrowLeft,
  User,
  Eye,
  HeartHandshake,
  Target,
  FileSpreadsheet,
  TrendingUp,
  CheckSquare,
  History,
  Plus,
  AlertCircle,
  Clock,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  BookOpen,
  Smile,
  ClipboardCheck,
  Flame,
  Sun,
  Heart,
  ExternalLink,
} from 'lucide-react';
import { SaveWorkResultModal } from '../components/modals/SaveWorkResultModal';

import {
  TierBadge,
  SocialEmotionalBadge,
  SupportStatusBadge,
  PriorityBadge,
  FollowUpStatusBadge,
} from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { HumanDecisionBanner } from '../components/common/HumanDecisionBanner';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

interface StudentDetailViewProps {
  studentId: string;
  onBack: () => void;
  onSelectStudent?: (studentId: string) => void;
}

export type StudentProfileTab =
  | 'summary'
  | 'emotion_tracker'
  | 'ldss_screening'
  | 'supervision_history'
  | 'case_conference'
  | 'behavior'
  | 'social_emotional'
  | 'support_plan'
  | 'intervention_log'
  | 'progress'
  | 'follow_up'
  | 'history_review';

export const StudentDetailView: React.FC<StudentDetailViewProps> = ({ studentId, onBack }) => {
  const { currentUser, isGuru, isKoordinator, isKonselor, isAdmin, canWriteObservations, canManageSupportPlans, canConductReview } =
    useAuth();

  const [activeTab, setActiveTab] = useState<StudentProfileTab>('summary');
  const [student, setStudent] = useState<Student | null>(null);
  const [behaviorObs, setBehaviorObs] = useState<BehaviorObservation[]>([]);
  const [seObs, setSeObs] = useState<SocialEmotionalObservation[]>([]);
  const [emotionRecords, setEmotionRecords] = useState<EmotionRecord[]>([]);
  const [ldssRecord, setLdssRecord] = useState<LdssRecord | null>(null);
  const [supervisions, setSupervisions] = useState<SupervisionSchedule[]>([]);
  const [caseConferences, setCaseConferences] = useState<CaseConferenceRecord[]>([]);
  const [plans, setPlans] = useState<SupportPlan[]>([]);
  const [logs, setLogs] = useState<InterventionLog[]>([]);
  const [progressRecords, setProgressRecords] = useState<ProgressMonitoringRecord[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [reviews, setReviews] = useState<MtssReview[]>([]);
  const [indicatorGroups, setIndicatorGroups] = useState<MasterIndicatorGroup[]>([]);
  const [strategies, setStrategies] = useState<MasterStrategy[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isBehaviorModalOpen, setIsBehaviorModalOpen] = useState(false);
  const [isSeModalOpen, setIsSeModalOpen] = useState(false);
  const [isEmotionModalOpen, setIsEmotionModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSaveWorkModalOpen, setIsSaveWorkModalOpen] = useState(false);


  // Emotion Modal Fields
  const [emotionModalTab, setEmotionModalTab] = useState<'checkIn' | 'checkOut'>('checkIn');
  const [emoFormDate, setEmoFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [emoFormEmotion, setEmoFormEmotion] = useState<'senang' | 'tenang' | 'bersemangat' | 'sedih' | 'marah' | 'cemas' | 'lelah' | 'kecewa'>('senang');
  const [emoFormScore, setEmoFormScore] = useState(8);
  const [emoFormWeather, setEmoFormWeather] = useState<'cerah' | 'berawan' | 'hujan' | 'badai' | 'pelangi'>('cerah');
  const [emoFormPrimary, setEmoFormPrimary] = useState('Siap Belajar');
  const [emoFormNotes, setEmoFormNotes] = useState('');

  // Forms State
  const [behForm, setBehForm] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    locationContext: 'Ruang Kelas',
    situationBefore: '',
    behaviorObserved: '',
    staffResponse: '',
    impactOnActivity: '',
    supportStrategyGiven: '',
    resultAfterSupport: '',
    additionalNotes: '',
  });

  const [seForm, setSeForm] = useState({
    date: new Date().toISOString().split('T')[0],
    indicatorGroupId: 'grp-self-management',
    indicatorId: 'ind-sm-1',
    ratingScale: 'mulai_berkembang' as SocialEmotionalScale,
    evidenceNotes: '',
    context: '',
    supportStrategy: '',
    followUpResult: '',
  });

  const [planForm, setPlanForm] = useState({
    tier: 'Tier 2' as TierLevel,
    areaOfNeed: '',
    targetGoals: '',
    strategies: [''],
    frequency: 'Setiap hari saat transisi',
    duration: '4 minggu',
    personInCharge: currentUser?.name || 'Wali Kelas',
    startDate: new Date().toISOString().split('T')[0],
    targetReviewDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Active' as const,
  });

  const [logForm, setLogForm] = useState({
    planId: '',
    date: new Date().toISOString().split('T')[0],
    time: '08:00',
    strategyUsed: '',
    durationMinutes: 15,
    studentResponse: '',
    observedResult: '',
    notes: '',
    followUpNeeded: false,
    followUpNotes: '',
  });

  const [progForm, setProgForm] = useState({
    date: new Date().toISOString().split('T')[0],
    periodLabel: 'Pekan Ini',
    domain: 'Regulasi Diri & Adaptasi',
    targetMetricName: 'Kemandirian Transisi',
    scoreNumeric: 3,
    ratingLabel: 'Menunjukkan Kemajuan Positif',
    operationalStatus: 'menunjukkan_kemajuan' as const,
    notes: '',
  });

  const [flwForm, setFlwForm] = useState({
    title: '',
    description: '',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'Sedang' as const,
    status: 'Pending' as const,
    assignedToId: currentUser?.id || 'usr-guru-1',
    assignedToName: currentUser?.name || 'Wali Kelas',
  });

  const [revForm, setRevForm] = useState({
    reviewDate: new Date().toISOString().split('T')[0],
    reviewType: 'Rutin' as const,
    recommendedTier: 'Tier 2' as TierLevel,
    observationsSummary: '',
    interventionSummary: '',
    decisionNotes: '',
    nextReviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    committeeMembers: [currentUser?.name || 'Staff Pengkaji'],
    status: 'Approved' as const,
  });

  const loadStudentData = async () => {
    try {
      setLoading(true);
      const [
        studentData,
        behData,
        seData,
        emoData,
        ldssData,
        supData,
        ccData,
        planData,
        logData,
        progData,
        flwData,
        revData,
        indGroups,
        strats,
      ] = await Promise.all([
        api.getStudent(studentId),
        api.getBehaviorObservations({ studentId }),
        api.getSocialEmotionalObservations({ studentId }),
        api.getEmotions({ studentId }),
        api.getLdssRecord(studentId),
        api.getSupervisions({ studentId }),
        api.getCaseConferences({ studentId }),
        api.getSupportPlans(studentId),
        api.getInterventionLogs({ studentId }),
        api.getProgressRecords(studentId),
        api.getFollowUps(studentId),
        api.getMtssReviews(studentId),
        api.getIndicatorGroups(),
        api.getStrategies(),
      ]);

      setStudent(studentData);
      setBehaviorObs(behData);
      setSeObs(seData);
      setEmotionRecords(emoData);
      setLdssRecord(ldssData);
      setSupervisions(supData);
      setCaseConferences(ccData);
      setPlans(planData);
      setLogs(logData);
      setProgressRecords(progData);
      setFollowUps(flwData);
      setReviews(revData);
      setIndicatorGroups(indGroups);
      setStrategies(strats);
    } catch (err) {
      console.error('Failed to load student details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentData();
  }, [studentId]);

  if (loading || !student) {
    return (
      <div className="p-12 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Memuat profil siswa & riwayat MTSS...</p>
        </div>
      </div>
    );
  }

  // Action Submissions
  const handleSaveEmotion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !student) return;
    try {
      const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      const existing = emotionRecords.find(r => r.date === emoFormDate);

      const checkInData = emotionModalTab === 'checkIn' ? {
        time: existing?.checkIn?.time || nowTime,
        emotion: emoFormEmotion,
        moodScore: emoFormScore,
        weatherFeeling: emoFormWeather,
        primaryFeeling: emoFormPrimary,
        energyLevel: 'Sedang' as const,
        notes: emoFormNotes,
        recordedById: currentUser.id,
        recordedByName: currentUser.name,
        recordedByRole: currentUser.roleTitle,
        recordedAt: new Date().toISOString(),
      } : existing?.checkIn;

      const checkOutData = emotionModalTab === 'checkOut' ? {
        time: existing?.checkOut?.time || nowTime,
        emotion: emoFormEmotion,
        moodScore: emoFormScore,
        weatherFeeling: emoFormWeather,
        primaryFeeling: emoFormPrimary,
        energyLevel: 'Sedang' as const,
        highlightsOfDay: emoFormNotes,
        notes: emoFormNotes,
        recordedById: currentUser.id,
        recordedByName: currentUser.name,
        recordedByRole: currentUser.roleTitle,
        recordedAt: new Date().toISOString(),
      } : existing?.checkOut;

      await api.saveEmotion({
        studentId: student.id,
        studentName: student.fullName,
        classId: student.classId,
        className: student.className,
        date: emoFormDate,
        ...(checkInData ? { checkIn: checkInData } : {}),
        ...(checkOutData ? { checkOut: checkOutData } : {}),
      });

      setIsEmotionModalOpen(false);
      loadStudentData();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan catatan emosi');
    }
  };

  const handleSaveBehaviorObs = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createBehaviorObservation({
        ...behForm,
        studentId: student.id,
        classId: student.classId,
      });
      setIsBehaviorModalOpen(false);
      loadStudentData();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan observasi behavior');
    }
  };

  const handleSaveSeObs = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const group = indicatorGroups.find(g => g.id === seForm.indicatorGroupId);
      const ind = group?.indicators.find(i => i.id === seForm.indicatorId);
      await api.createSocialEmotionalObservation({
        ...seForm,
        studentId: student.id,
        classId: student.classId,
        indicatorGroupName: group?.name || 'Kelompok Indikator',
        indicatorName: ind?.name || 'Nama Indikator',
      });
      setIsSeModalOpen(false);
      loadStudentData();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan observasi social-emotional');
    }
  };

  const handleSaveSupportPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createSupportPlan({
        ...planForm,
        studentId: student.id,
        className: student.className,
        strategies: planForm.strategies.filter(s => s.trim().length > 0),
      });
      setIsPlanModalOpen(false);
      loadStudentData();
    } catch (err: any) {
      alert(err.message || 'Gagal membuat rencana dukungan');
    }
  };

  const handleSaveInterventionLog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createInterventionLog({
        ...logForm,
        studentId: student.id,
      });
      setIsLogModalOpen(false);
      loadStudentData();
    } catch (err: any) {
      alert(err.message || 'Gagal mencatat log intervensi');
    }
  };

  const handleSaveProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createProgressRecord({
        ...progForm,
        studentId: student.id,
      });
      setIsProgressModalOpen(false);
      loadStudentData();
    } catch (err: any) {
      alert(err.message || 'Gagal mencatat progress monitoring');
    }
  };

  const handleSaveFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createFollowUp({
        ...flwForm,
        studentId: student.id,
      });
      setIsFollowUpModalOpen(false);
      loadStudentData();
    } catch (err: any) {
      alert(err.message || 'Gagal membuat tindak lanjut');
    }
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createMtssReview({
        ...revForm,
        studentId: student.id,
        currentTier: student.currentTier,
      });
      setIsReviewModalOpen(false);
      loadStudentData();
    } catch (err: any) {
      alert(err.message || 'Gagal menyelesaikan review MTSS');
    }
  };

  const handleToggleFollowUp = async (flw: FollowUp) => {
    try {
      const nextStatus = flw.status === 'Completed' ? 'Pending' : 'Completed';
      await api.updateFollowUp(flw.id, {
        status: nextStatus,
        resolutionNotes: nextStatus === 'Completed' ? 'Diselesaikan oleh staf' : undefined,
      });
      loadStudentData();
    } catch (err) {
      console.error(err);
    }
  };

  const tabs = [
    { id: 'summary' as StudentProfileTab, label: '1. Ringkasan Profil', icon: <User className="w-3.5 h-3.5" /> },
    {
      id: 'emotion_tracker' as StudentProfileTab,
      label: `2. Check-In & Out Emosi (${emotionRecords.length})`,
      icon: <Smile className="w-3.5 h-3.5" />,
    },
    {
      id: 'ldss_screening' as StudentProfileTab,
      label: `3. Skrining LDSS ${ldssRecord ? '✓' : ''}`,
      icon: <ClipboardCheck className="w-3.5 h-3.5" />,
    },
    {
      id: 'supervision_history' as StudentProfileTab,
      label: `4. Supervisi (${supervisions.length})`,
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
    },
    {
      id: 'case_conference' as StudentProfileTab,
      label: `5. Case Conference (${caseConferences.length})`,
      icon: <HeartHandshake className="w-3.5 h-3.5" />,
    },
    {
      id: 'behavior' as StudentProfileTab,
      label: `6. Observasi Behavior (${behaviorObs.length})`,
      icon: <Eye className="w-3.5 h-3.5" />,
    },
    {
      id: 'social_emotional' as StudentProfileTab,
      label: `7. Social Emotional (${seObs.length})`,
      icon: <HeartHandshake className="w-3.5 h-3.5" />,
    },
    {
      id: 'support_plan' as StudentProfileTab,
      label: `8. Rencana Dukungan (${plans.length})`,
      icon: <Target className="w-3.5 h-3.5" />,
    },
    {
      id: 'intervention_log' as StudentProfileTab,
      label: `9. Log Intervensi (${logs.length})`,
      icon: <FileSpreadsheet className="w-3.5 h-3.5" />,
    },
    {
      id: 'progress' as StudentProfileTab,
      label: `10. Progress Monitoring (${progressRecords.length})`,
      icon: <TrendingUp className="w-3.5 h-3.5" />,
    },
    {
      id: 'follow_up' as StudentProfileTab,
      label: `11. Tindak Lanjut (${followUps.length})`,
      icon: <CheckSquare className="w-3.5 h-3.5" />,
    },
    {
      id: 'history_review' as StudentProfileTab,
      label: `12. Riwayat & Alur Review (${reviews.length})`,
      icon: <History className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Siswa</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsSaveWorkModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            title="Simpan nama & data hasil kerja siswa ini ke Firebase Firestore"
          >
            <Flame className="w-3.5 h-3.5 text-amber-300" />
            <span>+ Simpan Hasil Kerja (Firebase)</span>
          </button>

          {canWriteObservations && (
            <>
              <button
                onClick={() => setIsBehaviorModalOpen(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Catat Behavior</span>
              </button>
              <button
                onClick={() => setIsSeModalOpen(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Catat SE</span>
              </button>
            </>
          )}
        </div>
      </div>


      {/* Student Profile Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-xs shrink-0">
              {student.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">{student.fullName}</h2>
                {student.nickname && (
                  <span className="text-xs text-slate-500 font-medium">({student.nickname})</span>
                )}
                <TierBadge tier={student.currentTier} />
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                <span>NISN: <strong>{student.nisn}</strong></span>
                <span>•</span>
                <span>Rombel: <strong>{student.className}</strong></span>
                <span>•</span>
                <span>Gender: <strong>{student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</strong></span>
                <span>•</span>
                <span>Orang Tua/Wali: <strong>{student.guardianName || '-'}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-1.5">
            {student.needsReviewFlag ? (
              <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Status: Perlu Ditinjau Tim MTSS</span>
              </div>
            ) : (
              <div className="px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Pemantauan Rutin Berjalan</span>
              </div>
            )}
          </div>
        </div>

        {student.needsReviewFlag && student.flagReason && (
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Catatan Flag Peninjauan: </strong>
              {student.flagReason}
            </div>
          </div>
        )}
      </div>

      {/* Profile Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-xl text-xs font-semibold whitespace-nowrap transition-all border-b-2 ${
                isActive
                  ? 'border-sky-600 text-sky-700 bg-sky-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Ringkasan Profil */}
      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-sky-600" />
                <span>Informasi Umum & Karakteristik Belajar</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Tingkat Tier Dukungan</div>
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <TierBadge tier={student.currentTier} size="sm" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {student.currentTier === 'Tier 1' && 'Menerima penguatan iklim kelas dan instruksi universal.'}
                    {student.currentTier === 'Tier 2' && 'Mendapatkan pendampingan terarah kelompok kecil dan strategi visual.'}
                    {student.currentTier === 'Tier 3' && 'Didampingi protokol individual dan monitoring harian.'}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Catatan Kebutuhan & Minat</div>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    {student.notes || 'Belum ada catatan khusus.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-xl border border-slate-200 text-center">
                <div className="text-2xl font-bold text-slate-900">{behaviorObs.length}</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">Observasi Behavior</div>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-200 text-center">
                <div className="text-2xl font-bold text-slate-900">{seObs.length}</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">Penilaian SE</div>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-200 text-center">
                <div className="text-2xl font-bold text-purple-700">{plans.filter(p => p.status === 'Active').length}</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">Rencana Aktif</div>
              </div>
            </div>
          </div>

          {/* Side Summary */}
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Kontak Orang Tua & Pendamping</h3>
              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-400">Nama Wali:</span>
                  <span className="font-semibold">{student.guardianName || '-'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-400">No. Telepon/WA:</span>
                  <span className="font-semibold">{student.guardianContact || '-'}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">Wali Kelas:</span>
                  <span className="font-semibold">{student.className}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Check-In & Out Emosi */}
      {activeTab === 'emotion_tracker' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Riwayat Check-In & Check-Out Emosi</h3>
              <p className="text-xs text-slate-500">
                Pencatatan harian kondisi emosi pagi (masuk) dan refleksi siang (pulang) serta monitoring program "Check-in & Check-out 21x".
              </p>
            </div>
            {canWriteObservations && (
              <button
                onClick={() => {
                  setEmotionModalTab('checkIn');
                  setIsEmotionModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
              >
                <Smile className="w-3.5 h-3.5" />
                <span>+ Catat Emosi Siswa</span>
              </button>
            )}
          </div>

          {/* CICO 21x status */}
          <div className="bg-gradient-to-r from-amber-50 to-purple-50 p-4 rounded-2xl border border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center">
                <Flame className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Program Khusus Lazuardi: "Check In & Check Out 21x"</h4>
                <p className="text-[11px] text-slate-600">
                  Target konsistensi adaptasi & regulasi perilaku selama 21 siklus berturut-turut.
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-base font-bold text-purple-700">
                {emotionRecords.length > 0 && emotionRecords[0].cycle21Count ? emotionRecords[0].cycle21Count : emotionRecords.length} / 21 Hari
              </span>
              <div className="w-28 bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                <div
                  className="bg-purple-600 h-1.5 rounded-full"
                  style={{
                    width: `${Math.min(100, ((emotionRecords.length > 0 && emotionRecords[0].cycle21Count ? emotionRecords[0].cycle21Count : emotionRecords.length) / 21) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {emotionRecords.length === 0 ? (
            <EmptyState
              title="Belum ada riwayat check-in emosi"
              description="Catat perasaan siswa saat datang di pagi hari dan saat pulang sekolah."
              actionLabel={canWriteObservations ? 'Catat Emosi Pertama' : undefined}
              onAction={() => {
                setEmotionModalTab('checkIn');
                setIsEmotionModalOpen(true);
              }}
            />
          ) : (
            <div className="space-y-3">
              {emotionRecords.map(rec => (
                <div key={rec.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      <strong className="text-xs text-slate-900">{rec.date}</strong>
                    </div>
                    {rec.cycle21Count && (
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                        CICO Day {rec.cycle21Count}/21
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {/* Check-In */}
                    <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/70 space-y-1.5">
                      <div className="flex items-center justify-between text-amber-900 font-bold">
                        <span>🌅 Check-In Pagi (Masuk)</span>
                        {rec.checkIn && <span className="font-mono text-slate-700">{rec.checkIn.time}</span>}
                      </div>
                      {rec.checkIn ? (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 capitalize">
                              Perasaan: {rec.checkIn.emotion}
                            </span>
                            <span className="font-mono font-bold text-amber-800 bg-white px-1.5 py-0.2 rounded border border-amber-200">
                              Skor Mood: {rec.checkIn.moodScore}/10
                            </span>
                          </div>
                          {rec.checkIn.primaryFeeling && (
                            <p className="text-[11px] text-slate-700">"{rec.checkIn.primaryFeeling}"</p>
                          )}
                          {rec.checkIn.notes && (
                            <p className="text-[10px] text-slate-500 italic">Catatan: {rec.checkIn.notes}</p>
                          )}
                        </>
                      ) : (
                        <p className="text-slate-400 italic">Belum check-in pagi</p>
                      )}
                    </div>

                    {/* Check-Out */}
                    <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/70 space-y-1.5">
                      <div className="flex items-center justify-between text-blue-900 font-bold">
                        <span>🌆 Check-Out Siang (Pulang)</span>
                        {rec.checkOut && <span className="font-mono text-slate-700">{rec.checkOut.time}</span>}
                      </div>
                      {rec.checkOut ? (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 capitalize">
                              Perasaan: {rec.checkOut.emotion}
                            </span>
                            <span className="font-mono font-bold text-blue-800 bg-white px-1.5 py-0.2 rounded border border-blue-200">
                              Skor Mood: {rec.checkOut.moodScore}/10
                            </span>
                          </div>
                          {rec.checkOut.highlightsOfDay && (
                            <p className="text-[11px] text-slate-700">🌟 Highlight: {rec.checkOut.highlightsOfDay}</p>
                          )}
                          {rec.checkOut.gratitudeNote && (
                            <p className="text-[11px] text-slate-600">🙏 Syukur: {rec.checkOut.gratitudeNote}</p>
                          )}
                        </>
                      ) : (
                        <p className="text-slate-400 italic">Belum check-out siang</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Skrining LDSS */}
      {activeTab === 'ldss_screening' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Instrumen Skrining LDSS</h3>
              <p className="text-xs text-slate-500">
                Lazuardi Disability Screening System: Profil 6 dimensi sensori, komunikasi, kognitif, emosi, interaksi, dan kemandirian.
              </p>
            </div>
          </div>

          {ldssRecord ? (
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] text-slate-400 block">Status Pengisian:</span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{ldssRecord.status} (Tanggal: {ldssRecord.dateFilled})</span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Rekomendasi MTSS:</span>
                  <span className="font-bold text-purple-700 text-sm">{ldssRecord.recommendedTier}</span>
                </div>
              </div>

              {/* 6 Dimensi Grid */}
              <div>
                <h4 className="font-bold text-slate-800 mb-2">Skor 6 Dimensi Skrining (Skala 1 - 5):</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-center">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">1. Motorik & Sensori</span>
                    <strong className="text-base text-slate-900">{ldssRecord.scores.motorikSensori} / 5</strong>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">2. Komunikasi & Bahasa</span>
                    <strong className="text-base text-slate-900">{ldssRecord.scores.komunikasiBahasa} / 5</strong>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">3. Kesiapan Akademik</span>
                    <strong className="text-base text-slate-900">{ldssRecord.scores.kognitifAkademik} / 5</strong>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">4. Regulasi Emosi</span>
                    <strong className={`text-base ${ldssRecord.scores.perilakuRegulasiEmosi <= 2 ? 'text-rose-700 font-black' : 'text-slate-900'}`}>
                      {ldssRecord.scores.perilakuRegulasiEmosi} / 5
                    </strong>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">5. Interaksi Sosial</span>
                    <strong className="text-base text-slate-900">{ldssRecord.scores.interaksiSosial} / 5</strong>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">6. Kemandirian Diri</span>
                    <strong className="text-base text-slate-900">{ldssRecord.scores.kemandirian} / 5</strong>
                  </div>
                </div>
              </div>

              {/* Temuan & Target */}
              <div className="space-y-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-700 block mb-0.5">Temuan Observasi Guru:</span>
                  <p className="text-slate-800">{ldssRecord.findingsSummary || '-'}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-700 block mb-0.5">Target Capaian:</span>
                  <p className="text-slate-800">{ldssRecord.targetGoals || '-'}</p>
                </div>
              </div>

              {/* Tindak Lanjut Checklist */}
              <div>
                <span className="font-bold text-slate-700 block mb-1">Rekomendasi Tindak Lanjut:</span>
                <div className="flex flex-wrap gap-1.5">
                  {ldssRecord.followUpRecommendations?.map((rec, i) => (
                    <span key={i} className="px-2.5 py-1 bg-purple-50 text-purple-800 rounded-lg font-bold border border-purple-200">
                      ✓ {rec}
                    </span>
                  ))}
                </div>
              </div>

              {ldssRecord.documentDriveUrl && (
                <div className="p-2.5 bg-sky-50 rounded-xl border border-sky-200 flex items-center justify-between">
                  <span className="text-sky-900 font-semibold">Berkas Google Drive Asesmen:</span>
                  <a
                    href={ldssRecord.documentDriveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-sky-700 hover:underline flex items-center gap-1 text-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Buka Tautan Drive</span>
                  </a>
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              title="Belum ada instrumen LDSS terisi"
              description="Isi skrining 6 dimensi LDSS melalui menu Skrining LDSS."
            />
          )}
        </div>
      )}

      {/* Tab: Supervisi Kepsek & Kabid */}
      {activeTab === 'supervision_history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Riwayat & Jadwal Supervisi</h3>
              <p className="text-xs text-slate-500">
                Supervisi langsung oleh Dr. Sari (Kepala Sekolah) dan M. Ghofar (Kepala Bidang Inklusif).
              </p>
            </div>
          </div>

          {supervisions.length === 0 ? (
            <EmptyState
              title="Belum ada jadwal supervisi untuk siswa ini"
              description="Supervisi dijadwalkan secara berkala untuk monitoring efektivitas intervensi."
            />
          ) : (
            <div className="space-y-3">
              {supervisions.map(sup => (
                <div key={sup.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2.5 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{sup.topic}</span>
                      <p className="text-[11px] text-slate-500">
                        Jadwal: <strong>{sup.scheduledDate}</strong> pukul {sup.time || '08:30'} • Supervisor: {sup.supervisorName} ({sup.supervisorRole})
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                      {sup.status}
                    </span>
                  </div>

                  {sup.hasilSupervisi && (
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-700 block mb-0.5">Hasil Observasi Supervisi:</span>
                      <p className="text-slate-800">{sup.hasilSupervisi}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-700 block">Checking Kepala Sekolah:</span>
                      <span className="font-semibold text-emerald-700">{sup.chekingKepalaSekolah?.status || 'Pending'}</span>
                      {sup.chekingKepalaSekolah?.revisiReport && (
                        <p className="text-slate-500 text-[10px] mt-0.5">Revisi: {sup.chekingKepalaSekolah.revisiReport}</p>
                      )}
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-700 block">Checking Kabid Inklusif:</span>
                      <span className="font-semibold text-emerald-700">{sup.chekingKepalaBidangInklusif?.status || 'Pending'}</span>
                      {sup.chekingKepalaBidangInklusif?.catatan && (
                        <p className="text-slate-500 text-[10px] mt-0.5">Catatan: {sup.chekingKepalaBidangInklusif.catatan}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Case Conference */}
      {activeTab === 'case_conference' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Rekomendasi & Jadwal Case Conference</h3>
              <p className="text-xs text-slate-500">
                Musyawarah komprehensif bersama Kepala Sekolah, Kabid Inklusif, Wali Kelas, Orang Tua, dan Tim Ahli.
              </p>
            </div>
          </div>

          {caseConferences.length === 0 ? (
            <EmptyState
              title="Belum ada rekaman Case Conference"
              description="Case Conference direkomendasikan jika siswa memerlukan kesepakatan komitmen bersama atau eskalasi Tier 3."
            />
          ) : (
            <div className="space-y-3">
              {caseConferences.map(cc => (
                <div key={cc.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">Sidang Case Conference</span>
                      <p className="text-[11px] text-slate-500">
                        Jadwal: <strong>{cc.scheduledDate || 'Dalam penjadwalan'}</strong> {cc.scheduledTime && `• ${cc.scheduledTime}`}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                      {cc.status}
                    </span>
                  </div>

                  <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                    <span className="font-bold text-purple-950 block mb-0.5">Latar Belakang / Alasan:</span>
                    <p className="text-purple-900">{cc.reasonForConference}</p>
                  </div>

                  {cc.draftBipTitle && (
                    <div className="text-[11px] font-semibold text-slate-800">
                      📄 Dokumen BIP Terkait: <strong className="text-purple-700">{cc.draftBipTitle}</strong>
                    </div>
                  )}

                  {cc.agreedCommitments && (
                    <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
                      <span className="font-bold text-emerald-950 block mb-0.5">🤝 Komitmen Bersama Orang Tua & Sekolah:</span>
                      <p className="text-emerald-900">{cc.agreedCommitments}</p>
                    </div>
                  )}

                  <div>
                    <span className="font-bold text-slate-700 block mb-0.5 text-[11px]">Peserta Hadir:</span>
                    <p className="text-slate-600 text-[11px]">
                      {cc.participants ? cc.participants.join(' • ') : '-'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Observasi Behavior */}
      {activeTab === 'behavior' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Catatan Observasi Perilaku (Behavior)</h3>
              <p className="text-xs text-slate-500">
                Pencatatan faktual dan objektif meliputi anteseden, perilaku teramati, respons pendamping, dan strategi dukungan.
              </p>
            </div>
            {canWriteObservations && (
              <button
                onClick={() => setIsBehaviorModalOpen(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Observasi</span>
              </button>
            )}
          </div>

          {behaviorObs.length === 0 ? (
            <EmptyState
              title="Belum ada catatan observasi behavior"
              description="Catatan observasi membantu tim memahami pola dan merancang dukungan yang tepat."
              actionLabel={canWriteObservations ? 'Tambah Catatan Baru' : undefined}
              onAction={() => setIsBehaviorModalOpen(true)}
            />
          ) : (
            <div className="space-y-3">
              {behaviorObs.map(obs => (
                <div key={obs.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{obs.locationContext}</span>
                      <span className="text-[11px] text-slate-400">•</span>
                      <span className="text-[11px] text-slate-500">{obs.date} pukul {obs.time}</span>
                    </div>
                    <span className="text-[11px] text-slate-600 font-medium">Dicatat oleh: {obs.observerName} ({obs.observerRole})</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                      <div className="text-[10px] uppercase font-bold text-slate-500">Situasi Sebelum Kejadian (Antecedent)</div>
                      <p className="text-slate-800">{obs.situationBefore}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                      <div className="text-[10px] uppercase font-bold text-slate-500">Perilaku yang Diamati (Objektif)</div>
                      <p className="text-slate-900 font-medium">{obs.behaviorObserved}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-sky-50/70 border border-sky-100 rounded-xl space-y-1">
                      <div className="text-[10px] uppercase font-bold text-sky-800">Strategi Dukungan Diberikan</div>
                      <p className="text-sky-950 font-medium">{obs.supportStrategyGiven}</p>
                    </div>
                    <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl space-y-1">
                      <div className="text-[10px] uppercase font-bold text-emerald-800">Hasil Setelah Dukungan</div>
                      <p className="text-emerald-950">{obs.resultAfterSupport}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                      <div className="text-[10px] uppercase font-bold text-slate-500">Dampak pada Aktivitas</div>
                      <p className="text-slate-700">{obs.impactOnActivity || '-'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Observasi Social Emotional */}
      {activeTab === 'social_emotional' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Perkembangan Social-Emotional Siswa</h3>
              <p className="text-xs text-slate-500">
                Pemetaan 5 domain kompetensi sosial-emosional (Kesadaran Diri, Manajemen Diri, Kesadaran Sosial, Relasi, Keputusan).
              </p>
            </div>
            {canWriteObservations && (
              <button
                onClick={() => setIsSeModalOpen(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Penilaian SE</span>
              </button>
            )}
          </div>

          {seObs.length === 0 ? (
            <EmptyState
              title="Belum ada catatan observasi social-emotional"
              description="Catat perkembangan indikator kompetensi sosial-emosional berkala."
              actionLabel={canWriteObservations ? 'Catat Indikator SE' : undefined}
              onAction={() => setIsSeModalOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {seObs.map(obs => (
                <div key={obs.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-purple-700 tracking-wider">
                        {obs.indicatorGroupName}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 mt-0.5">{obs.indicatorName}</h4>
                    </div>
                    <SocialEmotionalBadge scale={obs.ratingScale} />
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                    <div className="text-[10px] font-bold uppercase text-slate-400">Bukti Catatan Observasi</div>
                    <p className="text-slate-800 leading-relaxed">{obs.evidenceNotes}</p>
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
                    <span>Konteks: {obs.context}</span>
                    <span>{obs.date} • {obs.observerName}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Support Plan MTSS */}
      {activeTab === 'support_plan' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Rencana Dukungan Terstruktur (Support Plan)</h3>
              <p className="text-xs text-slate-500">
                Rencana intervensi bertarget dengan tujuan yang dapat diobservasi, durasi, dan penanggung jawab.
              </p>
            </div>
            {canManageSupportPlans && (
              <button
                onClick={() => setIsPlanModalOpen(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Buat Rencana Dukungan</span>
              </button>
            )}
          </div>

          {plans.length === 0 ? (
            <EmptyState
              title="Belum ada Rencana Dukungan (Support Plan)"
              description="Buat rencana dukungan terarah bila siswa memerlukan penguatan keterampilan spesifik."
              actionLabel={canManageSupportPlans ? 'Buat Support Plan' : undefined}
              onAction={() => setIsPlanModalOpen(true)}
            />
          ) : (
            <div className="space-y-4">
              {plans.map(plan => (
                <div key={plan.id} className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <TierBadge tier={plan.tier} size="sm" />
                      <h4 className="text-sm font-bold text-slate-900">{plan.areaOfNeed}</h4>
                    </div>
                    <SupportStatusBadge status={plan.status} />
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Tujuan Dukungan (Target Goals)</div>
                      <p className="text-slate-800 font-medium leading-relaxed bg-slate-50 p-3 rounded-xl">
                        {plan.targetGoals}
                      </p>
                    </div>

                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Strategi & Intervensi Terpilih</div>
                      <ul className="space-y-1.5">
                        {plan.strategies.map((strat, i) => (
                          <li key={i} className="flex items-start gap-2 text-slate-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-600 mt-1.5 shrink-0" />
                            <span>{strat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-[11px]">
                      <div>
                        <span className="text-slate-400">Frekuensi:</span>
                        <div className="font-semibold text-slate-800">{plan.frequency}</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Durasi & Mulai:</span>
                        <div className="font-semibold text-slate-800">{plan.duration} ({plan.startDate})</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Target Review:</span>
                        <div className="font-semibold text-amber-700">{plan.targetReviewDate}</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Penanggung Jawab:</span>
                        <div className="font-semibold text-slate-800">{plan.personInCharge}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Log Intervensi */}
      {activeTab === 'intervention_log' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Log Pelaksanaan Dukungan / Intervensi</h3>
              <p className="text-xs text-slate-500">Catatan harian saat strategi dukungan diterapkan pada siswa.</p>
            </div>
            {canWriteObservations && (
              <button
                onClick={() => setIsLogModalOpen(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Catat Log Dukungan</span>
              </button>
            )}
          </div>

          {logs.length === 0 ? (
            <EmptyState
              title="Belum ada log pelaksanaan intervensi"
              description="Dokumentasikan setiap sesi penerapan strategi untuk melihat respon siswa."
              actionLabel={canWriteObservations ? 'Tambah Log Sesi' : undefined}
              onAction={() => setIsLogModalOpen(true)}
            />
          ) : (
            <div className="space-y-3">
              {logs.map(log => (
                <div key={log.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="font-bold text-slate-900">{log.strategyUsed}</div>
                    <span className="text-[11px] text-slate-400">{log.date} • Durasi: {log.durationMinutes} menit</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-2.5 bg-slate-50 rounded-xl">
                      <div className="text-[10px] font-bold uppercase text-slate-400">Respons Siswa</div>
                      <p className="text-slate-800 mt-0.5">{log.studentResponse}</p>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl">
                      <div className="text-[10px] font-bold uppercase text-slate-400">Hasil Diamati</div>
                      <p className="text-slate-800 mt-0.5">{log.observedResult}</p>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                    <span>Dicatat oleh: {log.loggedByName} ({log.loggedByRole})</span>
                    {log.followUpNeeded && <span className="text-amber-600 font-semibold">Memerlukan Follow-up</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Progress Monitoring */}
      {activeTab === 'progress' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Grafik Perkembangan & Progress Monitoring</h3>
              <p className="text-xs text-slate-500">
                Pemantauan longitudinal indikator keberhasilan dukungan dari waktu ke waktu.
              </p>
            </div>
            {canWriteObservations && (
              <button
                onClick={() => setIsProgressModalOpen(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Catat Titik Pantau</span>
              </button>
            )}
          </div>

          {progressRecords.length === 0 ? (
            <EmptyState
              title="Belum ada data progress monitoring"
              description="Catat skor evaluasi mingguan/bulanan untuk menghasilkan grafik perkembangan."
              actionLabel={canWriteObservations ? 'Catat Progress' : undefined}
              onAction={() => setIsProgressModalOpen(true)}
            />
          ) : (
            <>
              {/* Progress Line Chart */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">Tren Skor Kemandirian & Regulasi</h4>
                  <span className="text-[11px] text-slate-400">Skala 1.0 (Dukungan Penuh) - 4.0 (Mandiri Konsisten)</span>
                </div>
                <div className="h-60 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={progressRecords}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="periodLabel" tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis domain={[1, 4]} tick={{ fontSize: 11, fill: '#64748b' }} />
                      <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                      <Line
                        type="monotone"
                        dataKey="scoreNumeric"
                        name="Skor Indikator"
                        stroke="#0284c7"
                        strokeWidth={3}
                        dot={{ r: 5, fill: '#0284c7' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Progress Records List */}
              <div className="space-y-3">
                {progressRecords.map(prog => (
                  <div key={prog.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{prog.periodLabel}</span>
                        <span className="text-[11px] text-slate-400">• {prog.domain}</span>
                        <span className="px-2 py-0.5 bg-sky-50 text-sky-700 font-semibold rounded text-[11px]">
                          Skor: {prog.scoreNumeric} / 4
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1">{prog.notes}</p>
                    </div>
                    <span className="text-[11px] text-slate-400">{prog.recordedByName}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab 7: Tindak Lanjut (Follow-Up) */}
      {activeTab === 'follow_up' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Daftar Tindak Lanjut (Action Items)</h3>
              <p className="text-xs text-slate-500">Tugas tindak lanjut dan koordinasi tim pendamping sekolah.</p>
            </div>
            <button
              onClick={() => setIsFollowUpModalOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Buat Tindak Lanjut</span>
            </button>
          </div>

          {followUps.length === 0 ? (
            <EmptyState
              title="Belum ada daftar tindak lanjut"
              description="Buat action item untuk koordinasi orang tua, persiapan media visual, atau rapat evaluasi."
              actionLabel="Tambah Action Item"
              onAction={() => setIsFollowUpModalOpen(true)}
            />
          ) : (
            <div className="space-y-3">
              {followUps.map(flw => (
                <div
                  key={flw.id}
                  className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 text-xs ${
                    flw.status === 'Completed'
                      ? 'bg-slate-50/70 border-slate-200 opacity-75'
                      : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={flw.status === 'Completed'}
                      onChange={() => handleToggleFollowUp(flw)}
                      className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 mt-0.5 cursor-pointer"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${flw.status === 'Completed' ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                          {flw.title}
                        </span>
                        <PriorityBadge priority={flw.priority} />
                        <FollowUpStatusBadge status={flw.status} />
                      </div>
                      <p className="text-slate-600">{flw.description}</p>
                      <div className="text-[11px] text-slate-400 flex items-center gap-3 pt-1">
                        <span>Penanggung Jawab: <strong>{flw.assignedToName}</strong></span>
                        <span>•</span>
                        <span>Jatuh Tempo: <strong>{flw.dueDate}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 8: Riwayat & Alur Review MTSS */}
      {activeTab === 'history_review' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Riwayat Keputusan Forum MTSS</h3>
              <p className="text-xs text-slate-500">
                Dokumentasi musyawarah profesional tim multidisiplin sekolah dalam evaluasi status dukungan.
              </p>
            </div>
            {canConductReview && (
              <button
                onClick={() => setIsReviewModalOpen(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Laksanakan Review MTSS</span>
              </button>
            )}
          </div>

          {reviews.length === 0 ? (
            <EmptyState
              title="Belum ada riwayat review forum MTSS"
              description="Forum review mencatat kesepakatan penyesuaian strategi atau penetapan tier secara musyawarah."
              actionLabel={canConductReview ? 'Laksanakan Review Sekarang' : undefined}
              onAction={() => setIsReviewModalOpen(true)}
            />
          ) : (
            <div className="space-y-4">
              {reviews.map(rev => (
                <div key={rev.id} className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">Review MTSS: {rev.reviewType}</span>
                      <span className="text-[11px] text-slate-400">({rev.reviewDate})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-[11px]">Rekomendasi:</span>
                      <TierBadge tier={rev.recommendedTier} size="sm" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                      <div className="text-[10px] font-bold uppercase text-slate-400">Ringkasan Observasi Terkumpul</div>
                      <p className="text-slate-800">{rev.observationsSummary}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                      <div className="text-[10px] font-bold uppercase text-slate-400">Evaluasi Intervensi</div>
                      <p className="text-slate-800">{rev.interventionSummary}</p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-purple-50/70 border border-purple-100 rounded-xl space-y-1">
                    <div className="text-[10px] font-bold uppercase text-purple-900">Keputusan & Arahan Tim</div>
                    <p className="text-purple-950 font-medium leading-relaxed">{rev.decisionNotes}</p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                    <div>
                      Anggota Tim: <strong>{rev.committeeMembers.join(', ')}</strong>
                    </div>
                    <div>
                      Target Review Berikutnya: <strong className="text-slate-700">{rev.nextReviewDate}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- MODALS --- */}

      {/* Modal Catat Emosi Siswa */}
      <Modal
        isOpen={isEmotionModalOpen}
        onClose={() => setIsEmotionModalOpen(false)}
        title={`Catat Emosi Siswa: ${student.fullName}`}
        size="md"
      >
        <form onSubmit={handleSaveEmotion} className="space-y-4 text-xs">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setEmotionModalTab('checkIn')}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                emotionModalTab === 'checkIn'
                  ? 'bg-white text-amber-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>🌅 Check-In Pagi (Masuk)</span>
            </button>
            <button
              type="button"
              onClick={() => setEmotionModalTab('checkOut')}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                emotionModalTab === 'checkOut'
                  ? 'bg-white text-blue-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-blue-600" />
              <span>🌆 Check-Out Siang (Pulang)</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Tanggal *</label>
              <input
                type="date"
                required
                value={emoFormDate}
                onChange={e => setEmoFormDate(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Pilihan Emosi Utama *</label>
              <select
                value={emoFormEmotion}
                onChange={e => setEmoFormEmotion(e.target.value as any)}
                className="w-full p-2 border border-slate-200 rounded-xl font-bold capitalize"
              >
                <option value="senang">😊 Senang & Gembira</option>
                <option value="tenang">😌 Tenang & Siap Belajar</option>
                <option value="bersemangat">🤩 Bersemangat</option>
                <option value="sedih">😢 Sedih</option>
                <option value="marah">😠 Marah / Kesal</option>
                <option value="cemas">😰 Cemas / Gelisah</option>
                <option value="lelah">🥱 Lelah / Mengantuk</option>
                <option value="kecewa">😞 Kecewa</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-700">Skor Mood (1-10):</span>
                <span className="font-bold text-emerald-700 bg-white px-1.5 rounded border border-slate-200">
                  {emoFormScore}/10
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={emoFormScore}
                onChange={e => setEmoFormScore(parseInt(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Cuaca Perasaan:</label>
              <select
                value={emoFormWeather}
                onChange={e => setEmoFormWeather(e.target.value as any)}
                className="w-full p-1.5 border border-slate-200 rounded-lg bg-white"
              >
                <option value="cerah">☀️ Cerah</option>
                <option value="berawan">⛅ Berawan</option>
                <option value="hujan">🌧️ Hujan</option>
                <option value="badai">⛈️ Badai</option>
                <option value="pelangi">🌈 Pelangi</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              {emotionModalTab === 'checkIn' ? 'Kata Kunci Perasaan Siswa:' : 'Highlight / Hal Menyenangkan Hari Ini:'}
            </label>
            <input
              type="text"
              value={emoFormPrimary}
              onChange={e => setEmoFormPrimary(e.target.value)}
              placeholder="Contoh: Senang belajar sains, tenang saat istirahat..."
              className="w-full p-2 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Catatan Observasi Tambahan:</label>
            <textarea
              rows={2}
              value={emoFormNotes}
              onChange={e => setEmoFormNotes(e.target.value)}
              placeholder="Catatan guru mengenai interaksi siswa..."
              className="w-full p-2 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEmotionModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Simpan Emosi
            </button>
          </div>
        </form>
      </Modal>

      {/* 1. Modal Observasi Behavior */}
      <Modal
        isOpen={isBehaviorModalOpen}
        onClose={() => setIsBehaviorModalOpen(false)}
        title={`Catat Observasi Behavior — ${student.fullName}`}
        subtitle="Gunakan bahasa faktual dan objektif. Hindari pelabelan subjektif."
      >
        <form onSubmit={handleSaveBehaviorObs} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal *</label>
              <input
                type="date"
                required
                value={behForm.date}
                onChange={e => setBehForm({ ...behForm, date: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Waktu Kejadian *</label>
              <input
                type="time"
                required
                value={behForm.time}
                onChange={e => setBehForm({ ...behForm, time: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Lokasi / Konteks *</label>
              <input
                type="text"
                required
                value={behForm.locationContext}
                onChange={e => setBehForm({ ...behForm, locationContext: e.target.value })}
                placeholder="misal: Ruang Kelas, Perpustakaan, Lapangan"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Situasi Sebelum Kejadian (Antecedent / Pemicu Konteks) *
            </label>
            <textarea
              rows={2}
              required
              value={behForm.situationBefore}
              onChange={e => setBehForm({ ...behForm, situationBefore: e.target.value })}
              placeholder="Jelaskan apa yang sedang berlangsung persis sebelum perilaku muncul (misal: instruksi pergantian pelajaran matematika ke seni)..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Perilaku yang Diamati Secara Objektif *
            </label>
            <textarea
              rows={2}
              required
              value={behForm.behaviorObserved}
              onChange={e => setBehForm({ ...behForm, behaviorObserved: e.target.value })}
              placeholder="Deskripsikan tindakan yang kasat mata (misal: menundukkan kepala di atas meja dan tidak membuka buku, alih-alih melabeli 'malas')..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Respons / Tindakan Langsung Staf *</label>
              <textarea
                rows={2}
                required
                value={behForm.staffResponse}
                onChange={e => setBehForm({ ...behForm, staffResponse: e.target.value })}
                placeholder="misal: Guru mendekati meja siswa dan berbicara sejajar mata..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Strategi Dukungan yang Diberikan *</label>
              <textarea
                rows={2}
                required
                value={behForm.supportStrategyGiven}
                onChange={e => setBehForm({ ...behForm, supportStrategyGiven: e.target.value })}
                placeholder="misal: Menggunakan visual timer 2 menit dan menawarkan 2 pilihan urutan..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hasil Setelah Dukungan Diberikan *</label>
              <textarea
                rows={2}
                required
                value={behForm.resultAfterSupport}
                onChange={e => setBehForm({ ...behForm, resultAfterSupport: e.target.value })}
                placeholder="misal: Siswa mulai merapikan buku setelah 1 menit jeda..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dampak Terhadap Kegiatan Kelas</label>
              <textarea
                rows={2}
                value={behForm.impactOnActivity}
                onChange={e => setBehForm({ ...behForm, impactOnActivity: e.target.value })}
                placeholder="misal: Transisi siswa tertunda 3 menit; pembelajaran kelas tetap kondusif..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsBehaviorModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold shadow-xs"
            >
              Simpan Observasi Behavior
            </button>
          </div>
        </form>
      </Modal>

      {/* 2. Modal Observasi SE */}
      <Modal
        isOpen={isSeModalOpen}
        onClose={() => setIsSeModalOpen(false)}
        title={`Catat Observasi Social-Emotional — ${student.fullName}`}
        subtitle="Penilaian berbasis indikator tanpa membuat diagnosis psikologis klinis."
      >
        <form onSubmit={handleSaveSeObs} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Domain Kompetensi SE *</label>
              <select
                value={seForm.indicatorGroupId}
                onChange={e => {
                  const grp = indicatorGroups.find(g => g.id === e.target.value);
                  setSeForm({
                    ...seForm,
                    indicatorGroupId: e.target.value,
                    indicatorId: grp?.indicators[0]?.id || '',
                  });
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              >
                {indicatorGroups.map(grp => (
                  <option key={grp.id} value={grp.id}>
                    {grp.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Indikator Spesifik *</label>
              <select
                value={seForm.indicatorId}
                onChange={e => setSeForm({ ...seForm, indicatorId: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              >
                {indicatorGroups
                  .find(g => g.id === seForm.indicatorGroupId)
                  ?.indicators.map(ind => (
                    <option key={ind.id} value={ind.id}>
                      {ind.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Skala Penilaian *</label>
              <select
                value={seForm.ratingScale}
                onChange={e => setSeForm({ ...seForm, ratingScale: e.target.value as SocialEmotionalScale })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 font-semibold"
              >
                <option value="belum_terlihat">1 - Belum Terlihat</option>
                <option value="mulai_berkembang">2 - Mulai Berkembang</option>
                <option value="berkembang">3 - Berkembang</option>
                <option value="konsisten">4 - Konsisten</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Konteks / Aktivitas *</label>
              <input
                type="text"
                required
                value={seForm.context}
                onChange={e => setSeForm({ ...seForm, context: e.target.value })}
                placeholder="misal: Saat kerja kelompok membuat poster"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Bukti Catatan Perilaku Konkret *</label>
            <textarea
              rows={3}
              required
              value={seForm.evidenceNotes}
              onChange={e => setSeForm({ ...seForm, evidenceNotes: e.target.value })}
              placeholder="Tuliskan contoh perilaku spesifik yang diamati..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsSeModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold shadow-xs"
            >
              Simpan Observasi SE
            </button>
          </div>
        </form>
      </Modal>

      {/* 3. Modal Support Plan */}
      <Modal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        title={`Rencana Dukungan MTSS — ${student.fullName}`}
        subtitle="Rancang strategi intervensi terstruktur dan tujuan yang jelas."
      >
        <form onSubmit={handleSaveSupportPlan} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tingkat Tier Dukungan *</label>
              <select
                value={planForm.tier}
                onChange={e => setPlanForm({ ...planForm, tier: e.target.value as TierLevel })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              >
                <option value="Tier 1">Tier 1 — Universal Support</option>
                <option value="Tier 2">Tier 2 — Targeted Support</option>
                <option value="Tier 3">Tier 3 — Intensive Support</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Area Kebutuhan *</label>
              <input
                type="text"
                required
                value={planForm.areaOfNeed}
                onChange={e => setPlanForm({ ...planForm, areaOfNeed: e.target.value })}
                placeholder="misal: Adaptasi Transisi & Regulasi Emosi"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tujuan Dukungan (Target Goals) *</label>
            <textarea
              rows={2}
              required
              value={planForm.targetGoals}
              onChange={e => setPlanForm({ ...planForm, targetGoals: e.target.value })}
              placeholder="Siswa mampu... dalam kurun waktu... dengan indikator..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Pilihan Strategi / Intervensi *</label>
            <div className="space-y-2">
              {planForm.strategies.map((strat, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={strat}
                    onChange={e => {
                      const updated = [...planForm.strategies];
                      updated[idx] = e.target.value;
                      setPlanForm({ ...planForm, strategies: updated });
                    }}
                    placeholder={`Strategi #${idx + 1}`}
                    className="flex-1 p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                  {planForm.strategies.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        setPlanForm({
                          ...planForm,
                          strategies: planForm.strategies.filter((_, i) => i !== idx),
                        });
                      }}
                      className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setPlanForm({ ...planForm, strategies: [...planForm.strategies, ''] })}
                className="text-xs text-sky-600 font-semibold hover:underline"
              >
                + Tambah Poin Strategi
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Frekuensi</label>
              <input
                type="text"
                value={planForm.frequency}
                onChange={e => setPlanForm({ ...planForm, frequency: e.target.value })}
                placeholder="misal: 3x seminggu"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Durasi</label>
              <input
                type="text"
                value={planForm.duration}
                onChange={e => setPlanForm({ ...planForm, duration: e.target.value })}
                placeholder="misal: 6 minggu"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Review Date *</label>
              <input
                type="date"
                required
                value={planForm.targetReviewDate}
                onChange={e => setPlanForm({ ...planForm, targetReviewDate: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsPlanModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold shadow-xs"
            >
              Simpan Rencana Dukungan
            </button>
          </div>
        </form>
      </Modal>

      {/* 4. Modal Intervention Log */}
      <Modal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        title={`Catat Pelaksanaan Sesi Dukungan — ${student.fullName}`}
        subtitle="Dokumentasikan respon siswa dan efektivitas teknik yang digunakan."
      >
        <form onSubmit={handleSaveInterventionLog} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal *</label>
              <input
                type="date"
                required
                value={logForm.date}
                onChange={e => setLogForm({ ...logForm, date: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Durasi (Menit) *</label>
              <input
                type="number"
                required
                min={1}
                value={logForm.durationMinutes}
                onChange={e => setLogForm({ ...logForm, durationMinutes: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Strategi yang Diterapkan *</label>
              <input
                type="text"
                required
                value={logForm.strategyUsed}
                onChange={e => setLogForm({ ...logForm, strategyUsed: e.target.value })}
                placeholder="misal: Visual Schedule & Pengingat 2 Menit"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Respons Siswa Saat Intervensi *</label>
            <textarea
              rows={2}
              required
              value={logForm.studentResponse}
              onChange={e => setLogForm({ ...logForm, studentResponse: e.target.value })}
              placeholder="Bagaimana reaksi siswa saat strategi dijalankan..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Hasil yang Teramati *</label>
            <textarea
              rows={2}
              required
              value={logForm.observedResult}
              onChange={e => setLogForm({ ...logForm, observedResult: e.target.value })}
              placeholder="Hasil konkret yang terlihat..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsLogModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-sky-600 text-white rounded-lg font-semibold"
            >
              Simpan Log Dukungan
            </button>
          </div>
        </form>
      </Modal>

      {/* 5. Modal Progress Monitoring */}
      <Modal
        isOpen={isProgressModalOpen}
        onClose={() => setIsProgressModalOpen(false)}
        title={`Catat Titik Progress Monitoring — ${student.fullName}`}
        subtitle="Evaluasi berkala tren perkembangan indikator."
      >
        <form onSubmit={handleSaveProgress} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Label Periode *</label>
              <input
                type="text"
                required
                value={progForm.periodLabel}
                onChange={e => setProgForm({ ...progForm, periodLabel: e.target.value })}
                placeholder="misal: Pekan 3 (Agustus)"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Skor Kemandirian (1 - 4) *</label>
              <input
                type="number"
                step="0.1"
                min={1}
                max={4}
                required
                value={progForm.scoreNumeric}
                onChange={e => setProgForm({ ...progForm, scoreNumeric: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Catatan Evaluasi / Kemajuan *</label>
            <textarea
              rows={3}
              required
              value={progForm.notes}
              onChange={e => setProgForm({ ...progForm, notes: e.target.value })}
              placeholder="Deskripsikan perkembangan yang dicapai..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsProgressModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-sky-600 text-white rounded-lg font-semibold"
            >
              Simpan Titik Pantau
            </button>
          </div>
        </form>
      </Modal>

      {/* 6. Modal Follow-Up */}
      <Modal
        isOpen={isFollowUpModalOpen}
        onClose={() => setIsFollowUpModalOpen(false)}
        title={`Tambah Tindak Lanjut — ${student.fullName}`}
      >
        <form onSubmit={handleSaveFollowUp} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Judul Tindak Lanjut *</label>
            <input
              type="text"
              required
              value={flwForm.title}
              onChange={e => setFlwForm({ ...flwForm, title: e.target.value })}
              placeholder="misal: Koordinasi media visual dengan orang tua"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Deskripsi Rincian *</label>
            <textarea
              rows={2}
              required
              value={flwForm.description}
              onChange={e => setFlwForm({ ...flwForm, description: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tingkat Prioritas</label>
              <select
                value={flwForm.priority}
                onChange={e => setFlwForm({ ...flwForm, priority: e.target.value as any })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              >
                <option value="Rendah">Rendah</option>
                <option value="Sedang">Sedang</option>
                <option value="Tinggi">Tinggi</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Batas Waktu (Due Date) *</label>
              <input
                type="date"
                required
                value={flwForm.dueDate}
                onChange={e => setFlwForm({ ...flwForm, dueDate: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsFollowUpModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-sky-600 text-white rounded-lg font-semibold"
            >
              Simpan Tindak Lanjut
            </button>
          </div>
        </form>
      </Modal>

      {/* 7. Modal Review MTSS */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title={`Pelaksanaan Forum Review MTSS — ${student.fullName}`}
        subtitle="Keputusan musyawarah tim sekolah."
      >
        <form onSubmit={handleSaveReview} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Jenis Review *</label>
              <select
                value={revForm.reviewType}
                onChange={e => setRevForm({ ...revForm, reviewType: e.target.value as any })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              >
                <option value="Rutin">Rutin Siklus</option>
                <option value="Flagged Eskalasi">Flagged Eskalasi</option>
                <option value="Permintaan Guru">Permintaan Guru</option>
                <option value="Evaluasi Selesai">Evaluasi Target Tercapai</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Rekomendasi Tier Baru *</label>
              <select
                value={revForm.recommendedTier}
                onChange={e => setRevForm({ ...revForm, recommendedTier: e.target.value as any })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
              >
                <option value="Tier 1">Tier 1 — Universal</option>
                <option value="Tier 2">Tier 2 — Targeted</option>
                <option value="Tier 3">Tier 3 — Intensive</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status Keputusan *</label>
              <select
                value={revForm.status}
                onChange={e => setRevForm({ ...revForm, status: e.target.value as any })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              >
                <option value="Approved">Disetujui (Approved)</option>
                <option value="Strategy Adjusted">Ubah Strategi (Adjusted)</option>
                <option value="Deferred">Ditunda (Deferred)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Ringkasan Bukti Observasi *</label>
            <textarea
              rows={2}
              required
              value={revForm.observationsSummary}
              onChange={e => setRevForm({ ...revForm, observationsSummary: e.target.value })}
              placeholder="Sintesis pola perilaku dan sosial-emosional yang terdata..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Evaluasi Keberhasilan Strategi *</label>
            <textarea
              rows={2}
              required
              value={revForm.interventionSummary}
              onChange={e => setRevForm({ ...revForm, interventionSummary: e.target.value })}
              placeholder="Bagaimana pengaruh strategi yang telah diberikan selama siklus..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Catatan Musyawarah & Kesepakatan Tim *</label>
            <textarea
              rows={3}
              required
              value={revForm.decisionNotes}
              onChange={e => setRevForm({ ...revForm, decisionNotes: e.target.value })}
              placeholder="Tuliskan justifikasi profesional dan tindak lanjut ke depan..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold shadow-xs"
            >
              Simpan Keputusan Review MTSS
            </button>
          </div>
        </form>
      </Modal>

      {/* Save Work Result Modal for this student */}
      <SaveWorkResultModal
        isOpen={isSaveWorkModalOpen}
        onClose={() => setIsSaveWorkModalOpen(false)}
        initialStudentId={student.id}
        initialClassId={student.classId}
        onSuccess={() => {
          loadStudentData();
        }}
      />
    </div>
  );
};

