export type UserRole = 'guru' | 'koordinator_mtss' | 'konselor' | 'admin' | 'pimpinan';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  assignedClassIds?: string[]; // IDs of classes assigned if role is guru
  avatar?: string;
  phone?: string;
}

export type TierLevel = 'Tier 1' | 'Tier 2' | 'Tier 3';

export type Gender = 'L' | 'P';

export interface Student {
  id: string;
  nisn: string;
  fullName: string;
  nickname: string;
  classId: string;
  className: string;
  grade: number;
  gender: Gender;
  birthDate: string;
  currentTier: TierLevel;
  guardianName: string;
  guardianContact?: string;
  needsReviewFlag: boolean;
  flagReason?: string;
  notes?: string;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface BehaviorObservation {
  id: string;
  studentId: string;
  studentName?: string;
  classId: string;
  className?: string;
  date: string;
  time: string;
  locationContext: string; // e.g. Ruang Kelas, Lapangan, Kantin, Koridor, Perpustakaan
  situationBefore: string; // Antecedent / Situasi sebelum kejadian
  behaviorObserved: string; // Perilaku objektif yang diamati
  staffResponse: string; // Respons / tindakan staf seketika
  impactOnActivity: string; // Dampak terhadap pembelajaran / aktivitas
  supportStrategyGiven: string; // Strategi dukungan yang langsung diberikan
  resultAfterSupport: string; // Hasil setelah intervensi langsung
  additionalNotes?: string;
  observerId: string;
  observerName: string;
  observerRole: string;
  createdAt: string;
  updatedAt: string;
}

export type SocialEmotionalScale = 'belum_terlihat' | 'mulai_berkembang' | 'berkembang' | 'konsisten';

export interface SocialEmotionalObservation {
  id: string;
  studentId: string;
  studentName?: string;
  classId: string;
  className?: string;
  date: string;
  indicatorGroupId: string; // e.g. self_awareness, self_management, social_awareness, relationship_skills, decision_making
  indicatorGroupName: string;
  indicatorId: string;
  indicatorName: string;
  ratingScale: SocialEmotionalScale;
  ratingScore: number; // 1 to 4
  evidenceNotes: string; // Bukti catatan perilaku konkret
  context: string; // Konteks situasi (misal: saat kerja kelompok, saat istirahat)
  supportStrategy?: string; // Strategi dukungan penguatan
  followUpResult?: string; // Hasil tindak lanjut
  observerId: string;
  observerName: string;
  observerRole: string;
  createdAt: string;
  updatedAt: string;
}

export type SupportPlanStatus = 'Draft' | 'Active' | 'Under Review' | 'Completed' | 'Discontinued';

export interface SupportPlan {
  id: string;
  studentId: string;
  studentName?: string;
  className?: string;
  tier: TierLevel;
  areaOfNeed: string; // Area kebutuhan (misal: Regulasi Emosi, Fokus Tugas, Keterampilan Berbagi, Adaptasi Transisi)
  targetGoals: string; // Tujuan dukungan yang spesifik dan terukur
  strategies: string[]; // Strategi / intervensi yang direncanakan
  frequency: string; // misal: 2x seminggu, Setiap sesi pagi, Saat transisi pelajaran
  duration: string; // misal: 4 minggu, 8 minggu
  personInCharge: string; // Penanggung jawab (misal: Guru Kelas, Guru Pendamping, Konselor)
  startDate: string;
  targetReviewDate: string;
  status: SupportPlanStatus;
  resultNotes?: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface InterventionLog {
  id: string;
  planId?: string;
  studentId: string;
  studentName?: string;
  date: string;
  time?: string;
  strategyUsed: string;
  durationMinutes: number;
  studentResponse: string; // Respons siswa selama intervensi
  observedResult: string; // Hasil yang teramati
  notes?: string;
  followUpNeeded: boolean;
  followUpNotes?: string;
  loggedBy: string;
  loggedByName: string;
  loggedByRole: string;
  createdAt: string;
}

export interface ProgressMonitoringRecord {
  id: string;
  studentId: string;
  studentName?: string;
  date: string;
  periodLabel: string; // e.g. "Minggu 1 - Ags 2026", "Bulan 1"
  domain: string; // e.g. "Regulasi Diri", "Fokus Belajar", "Interaksi Teman Sebaya"
  targetMetricName: string;
  scoreNumeric: number; // 1 to 5 scale or percentage
  ratingLabel: string; // e.g. "Memerlukan Dukungan Tambahan", "Menunjukkan Kemajuan Positif", "Mencapai Target"
  operationalStatus: 'memerlukan_pemantauan' | 'menunjukkan_kemajuan' | 'perlu_ditinjau_tim' | 'target_tercapai';
  notes: string;
  recordedBy: string;
  recordedByName: string;
  createdAt: string;
}

export type FollowUpStatus = 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
export type PriorityLevel = 'Rendah' | 'Sedang' | 'Tinggi';

export interface FollowUp {
  id: string;
  studentId: string;
  studentName?: string;
  title: string;
  description: string;
  dueDate: string;
  priority: PriorityLevel;
  status: FollowUpStatus;
  assignedToId: string;
  assignedToName: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  completedAt?: string;
  resolutionNotes?: string;
}

export type MtssReviewType = 'Rutin' | 'Flagged Eskalasi' | 'Permintaan Guru' | 'Evaluasi Selesai';
export type MtssReviewStatus = 'Approved' | 'Deferred' | 'Strategy Adjusted';

export interface MtssReview {
  id: string;
  studentId: string;
  studentName?: string;
  reviewDate: string;
  reviewType: MtssReviewType;
  currentTier: TierLevel;
  recommendedTier: TierLevel;
  observationsSummary: string;
  interventionSummary: string;
  decisionNotes: string; // Catatan keputusan tim profesional
  nextReviewDate: string;
  committeeMembers: string[]; // Anggota tim yang hadir dalam review
  status: MtssReviewStatus;
  createdById: string;
  createdByName: string;
  createdAt: string;
}

export interface MasterClass {
  id: string;
  name: string;
  grade: number;
  homeroomTeacherId: string;
  homeroomTeacherName: string;
  academicYear: string;
  totalStudents?: number;
}

export interface MasterIndicatorGroup {
  id: string;
  name: string;
  description: string;
  indicators: MasterIndicatorItem[];
}

export interface MasterIndicatorItem {
  id: string;
  groupId: string;
  name: string;
  description: string;
  examples: string;
  active: boolean;
}

export interface MasterStrategy {
  id: string;
  category: string; // e.g. "Regulasi Emosi", "Transisi Kelas", "Keterampilan Sosial", "Fokus Akademik"
  name: string;
  description: string;
  suggestedTier?: TierLevel;
  tierSuitability?: string[];
  steps?: string[];
}

export interface ReviewThresholdRule {
  id: string;
  name: string;
  description: string;
  suggestedFlagReason: string;
  isActive: boolean;
  thresholdValue?: number;
}

export interface SystemConfig {
  schoolName: string;
  academicYear: string;
  activeSemester: 'Ganjil' | 'Genap';
  tierDescriptions: {
    tier1: string;
    tier2: string;
    tier3: string;
  };
  reviewThresholdRules: {
    behaviorObsThresholdPerMonth: number;
    socialEmotionalEmergingCount: number;
    unresolvedFollowUpDays: number;
  };
}

export interface AuditLog {
  id: string;
  entityType: 'STUDENT' | 'BEHAVIOR_OBS' | 'SE_OBS' | 'SUPPORT_PLAN' | 'INTERVENTION_LOG' | 'PROGRESS' | 'FOLLOW_UP' | 'MTSS_REVIEW' | 'USER' | 'CONFIG' | 'EMOTION' | 'LDSS' | 'SUPERVISION' | 'CASE_CONFERENCE';
  entityId: string;
  actionType: 'CREATE' | 'UPDATE' | 'DELETE' | 'TIER_CHANGE' | 'STATUS_CHANGE' | 'REVIEW_COMPLETED';
  description: string;
  beforeData?: any;
  afterData?: any;
  userId: string;
  userName: string;
  userRole: UserRole;
  timestamp: string;
  reason?: string;
}

// --- Emotion Check-in & Check-out ---
export type EmotionType = 'senang' | 'tenang' | 'bersemangat' | 'sedih' | 'marah' | 'cemas' | 'lelah' | 'kecewa';
export type WeatherFeeling = 'cerah' | 'berawan' | 'hujan' | 'badai' | 'pelangi';

export interface SingleEmotionCheck {
  time: string;
  emotion: EmotionType;
  moodScore: number; // 1 to 10
  weatherFeeling?: WeatherFeeling;
  primaryFeeling?: string;
  energyLevel?: 'Rendah' | 'Sedang' | 'Tinggi';
  contextOrTrigger?: string;
  highlightsOfDay?: string;
  gratitudeNote?: string;
  challengesFelt?: string;
  goalsForTomorrow?: string;
  notes?: string;
  recordedById: string;
  recordedByName: string;
  recordedByRole: string;
  recordedAt: string;
}

export interface EmotionRecord {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  date: string; // YYYY-MM-DD
  checkIn?: SingleEmotionCheck;
  checkOut?: SingleEmotionCheck;
  cycle21Count?: number; // Melacak program "Check in & Check Out 21x"
}

// --- LDSS (Lazuardi Disability Screening System) ---
export type LdssStatus = 'Belum Diisi' | 'Dalam Proses' | 'Selesai';

export interface LdssScores {
  motorikSensori: number; // 1 to 5
  komunikasiBahasa: number; // 1 to 5
  kognitifAkademik: number; // 1 to 5
  perilakuRegulasiEmosi: number; // 1 to 5
  interaksiSosial: number; // 1 to 5
  kemandirian: number; // 1 to 5
}

export interface LdssRecord {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  dateFilled: string;
  filledById: string;
  filledByName: string;
  filledByRole: string;
  status: LdssStatus;
  findingsSummary: string; // Temuan observasi guru
  targetGoals: string; // Target pencapaian perkembangan
  scores: LdssScores;
  observationsNotes?: Record<string, string>;
  recommendedTier: TierLevel;
  followUpRecommendations: string[]; // e.g. "Supervisi", "Case Conference", "Check in & Check out 21x", "Rujukan Klinis"
  documentDriveUrl?: string; // Link drive hasil asesmen / dokumen
  principalCheckStatus?: 'Pending' | 'In Progress' | 'Complete';
  inclusiveHeadCheckStatus?: 'Pending' | 'In Progress' | 'Complete';
  notes?: string;
}

// --- Supervisi Kepala Sekolah & Kepala Bidang Pendidikan Inklusif ---
export type SupervisorRole = 'Kepala Sekolah' | 'Kepala Bidang Inklusif' | 'Keduanya';
export type SupervisionStatus = 'Terjadwal' | 'Selesai' | 'Menunggu Revisi Report' | 'Dibatalkan';

export interface SupervisionSchedule {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  teacherName: string;
  supervisorRole: SupervisorRole;
  supervisorName: string; // "Dr. Sari, M.Pd." (Kepsek) atau "M. Ghofar, M.Psi." (Kabid Inklusif)
  scheduledDate: string; // e.g. "Senin, 28 September 2026" or "YYYY-MM-DD"
  time?: string;
  topic: string; // Fokus supervisi (e.g. "Supervisi fokus pembelajaran klasikal", "Regulasi emosi & pola asuh")
  status: SupervisionStatus;
  hasilSupervisi?: string;
  catatanTindakLanjut?: string;
  chekingKepalaSekolah: {
    status: 'Pending' | 'In Progress' | 'Complete';
    revisiReport?: string; // Catatan revisi report
    completedDate?: string;
  };
  chekingKepalaBidangInklusif: {
    status: 'Pending' | 'In Progress' | 'Complete';
    catatan?: string;
    completedDate?: string;
  };
}

// --- Case Conference ---
export type CaseConferenceStatus = 'Direkomendasikan' | 'Dijadwalkan' | 'Selesai' | 'Ditinjau Ulang';

export interface CaseConferenceRecord {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  teacherName: string;
  reasonForConference: string; // Latar belakang & temuan (e.g. keterlambatan, gap akademik jauh, konflik perilaku)
  status: CaseConferenceStatus;
  scheduledDate?: string; // e.g. "Rabu, 14 Oktober 2026"
  scheduledTime?: string;
  location?: string;
  participants: string[]; // ['M. Ghofar, M.Psi. (Kabid Inklusif)', 'Dr. Sari, M.Pd. (Kepala Sekolah)', 'Ovnica Nitasari (Koordinator)', 'Wali Kelas', 'Orang Tua Siswa']
  previousAssessments?: {
    clinicalDiagnosis?: string; // Hasil diagnosis klinis
    psychotest?: string; // Psikotest
    speechTherapy?: string; // Terapi wicara
    occupationalTherapy?: string; // Okupasi terapi
    psbObservation?: string; // Hasil observasi PSB
  };
  draftBipTitle?: string; // Draft BIP (Behavior Intervention Plan)
  agreedCommitments?: string; // Komitmen bersama orang tua & sekolah
  minutesDecisions?: string; // Notulensi kesepakatan
  followUpActions?: string[];
  recommendationDate: string;
}

// Rekap Siswa Terpadu Lazuardi GCS (Form Keluhan & Student Support Form)
export interface LazuardiStudentSupportRow {
  studentId: string;
  no: number;
  gradeParallel: number; // 1, 2, 3, 4, 5, 6
  studentName: string;
  className: string;
  teacherName: string;
  currentTier: TierLevel;
  findings: string; // Temuan
  target: string; // Target
  ldssStatus: LdssStatus;
  tindakLanjut: string; // Supervisi / Check in & Check Out 21x / Case Conference / dll
  jadwalTindakLanjut?: string;
  jadwalPakGhofar?: string; // Jadwal Kepala Bidang Inklusif
  hasilDiagnosaKlinis?: string;
  psikotest?: string;
  terapiWicara?: string;
  okupasiTerapi?: string;
  hasilObservasiPsb?: string;
  draftBip?: string;
  catatan?: string;
  chekingKepalaSekolah?: 'Pending' | 'In Progress' | 'Complete';
  revisiReportKepsek?: string;
  chekingKabidInklusif?: 'Pending' | 'In Progress' | 'Complete';
  statusJadwal?: string;
}

// --- Hasil Kerja & Dokumen MTSS (Work Results Stored to Firebase) ---
export type WorkResultType =
  | 'intervensi_siswa'
  | 'evaluasi_emosi'
  | 'skrining_ldss'
  | 'case_conference'
  | 'supervisi_inklusif'
  | 'observasi_perilaku'
  | 'portofolio_siswa'
  | 'rapat_koordinasi'
  | 'laporan_ortu';

export type WorkStatus = 'Draft' | 'Dalam Proses' | 'Selesai' | 'Ditinjau Pimpinan' | 'Disetujui';

export interface WorkResult {
  id: string;
  title: string; // Judul Hasil Kerja
  workType: WorkResultType;
  workTypeLabel: string;
  authorName: string; // Nama guru / pengisi hasil kerja (Fitur Simpan Nama)
  authorRole: string; // Peran penulis (e.g. Wali Kelas Kinabalu, Koordinator Inklusif)
  authorId?: string;
  studentId?: string; // Siswa yang dikerjakan / diobservasi (opsional)
  studentName?: string;
  classId?: string;
  className?: string;
  date: string; // Tanggal pengerjaan (YYYY-MM-DD)
  time?: string; // Waktu pengerjaan (HH:mm)
  description: string; // Uraian pelaksanaan & aktivitas kerja
  outcomes: string; // Hasil evaluasi / capaian yang diperoleh
  followUpPlan: string; // Rencana tindak lanjut
  status: WorkStatus;
  scoreOrRating?: string; // Capaian skor atau deskripsi progres
  tags?: string[];
  firebaseSynced: boolean;
  firebaseDocId?: string;
  createdAt: string;
  updatedAt: string;
}
