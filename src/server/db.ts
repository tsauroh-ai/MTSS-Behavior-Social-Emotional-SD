import fs from 'fs';
import path from 'path';
import {
  User,
  Student,
  BehaviorObservation,
  SocialEmotionalObservation,
  SupportPlan,
  InterventionLog,
  ProgressMonitoringRecord,
  FollowUp,
  MtssReview,
  MasterClass,
  MasterIndicatorGroup,
  MasterStrategy,
  SystemConfig,
  AuditLog,
  UserRole,
  EmotionRecord,
  LdssRecord,
  SupervisionSchedule,
  CaseConferenceRecord,
  LazuardiStudentSupportRow,
  WorkResult,
} from '../types';

interface DatabaseSchema {
  users: User[];
  students: Student[];
  classes: MasterClass[];
  indicatorGroups: MasterIndicatorGroup[];
  strategies: MasterStrategy[];
  config: SystemConfig;
  behaviorObservations: BehaviorObservation[];
  socialEmotionalObservations: SocialEmotionalObservation[];
  supportPlans: SupportPlan[];
  interventionLogs: InterventionLog[];
  progressRecords: ProgressMonitoringRecord[];
  followUps: FollowUp[];
  mtssReviews: MtssReview[];
  auditLogs: AuditLog[];
  emotions: EmotionRecord[];
  ldssRecords: LdssRecord[];
  supervisions: SupervisionSchedule[];
  caseConferences: CaseConferenceRecord[];
  lazuardiSupportRows?: LazuardiStudentSupportRow[];
  workResults?: WorkResult[];
}


const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

const INITIAL_USERS: User[] = [
  {
    id: 'usr-guru-1',
    name: 'Ibu Dewi Sartika, S.Pd.',
    email: 'dewi.sartika@sekolah.sch.id',
    role: 'guru',
    roleTitle: 'Wali Kelas 2A',
    assignedClassIds: ['cls-2a'],
    phone: '0812-3456-7891',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-guru-2',
    name: 'Pak Ahmad Fauzi, S.Pd.',
    email: 'ahmad.fauzi@sekolah.sch.id',
    role: 'guru',
    roleTitle: 'Wali Kelas 3A',
    assignedClassIds: ['cls-3a'],
    phone: '0813-9876-5432',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-mtss-1',
    name: 'Ibu Nurul Hidayati, M.Psi.',
    email: 'nurul.mtss@sekolah.sch.id',
    role: 'koordinator_mtss',
    roleTitle: 'Koordinator Tim MTSS & Inklusi',
    phone: '0811-2233-4455',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-konselor-1',
    name: 'Pak Bambang Wicaksono, S.Psi.',
    email: 'bambang.konselor@sekolah.sch.id',
    role: 'konselor',
    roleTitle: 'Guru BK & Konselor Sekolah',
    phone: '0815-6677-8899',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-admin-1',
    name: 'Admin Sistem Sekolah',
    email: 'admin.mtss@sekolah.sch.id',
    role: 'admin',
    roleTitle: 'Administrator Sistem & Data',
    phone: '0818-0011-2233',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-pimpinan-1',
    name: 'Dr. Hendra Wijaya, M.Pd.',
    email: 'kepsek@sekolah.sch.id',
    role: 'pimpinan',
    roleTitle: 'Kepala Sekolah SD Harapan Bangsa',
    phone: '0819-4455-6677',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  },
];

const INITIAL_CLASSES: MasterClass[] = [
  { id: 'cls-1a', name: 'Kelas 1A', grade: 1, homeroomTeacherId: 'usr-guru-1', homeroomTeacherName: 'Ibu Ratna Dewi, S.Pd.', academicYear: '2026/2027', totalStudents: 24 },
  { id: 'cls-2a', name: 'Kelas 2A', grade: 2, homeroomTeacherId: 'usr-guru-1', homeroomTeacherName: 'Ibu Dewi Sartika, S.Pd.', academicYear: '2026/2027', totalStudents: 26 },
  { id: 'cls-3a', name: 'Kelas 3A', grade: 3, homeroomTeacherId: 'usr-guru-2', homeroomTeacherName: 'Pak Ahmad Fauzi, S.Pd.', academicYear: '2026/2027', totalStudents: 25 },
  { id: 'cls-4a', name: 'Kelas 4A', grade: 4, homeroomTeacherId: 'usr-guru-2', homeroomTeacherName: 'Ibu Maya Larasati, S.Pd.', academicYear: '2026/2027', totalStudents: 28 },
  { id: 'cls-5a', name: 'Kelas 5A', grade: 5, homeroomTeacherId: 'usr-guru-1', homeroomTeacherName: 'Pak Dedi Supriyadi, S.Pd.', academicYear: '2026/2027', totalStudents: 27 },
  { id: 'cls-6a', name: 'Kelas 6A', grade: 6, homeroomTeacherId: 'usr-guru-2', homeroomTeacherName: 'Ibu Sri Wahyuni, M.Pd.', academicYear: '2026/2027', totalStudents: 26 },
];

const INITIAL_INDICATOR_GROUPS: MasterIndicatorGroup[] = [
  {
    id: 'grp-self-awareness',
    name: 'Self-Awareness (Kesadaran Diri)',
    description: 'Kemampuan mengenali emosi, nilai pribadi, kekuatan, dan keterbatasan diri.',
    indicators: [
      { id: 'ind-sa-1', groupId: 'grp-self-awareness', name: 'Mengenali & menamai emosi sendiri', description: 'Mampu menyatakan apa yang dirasakan dengan tepat (senang, sedih, cemas, marah)', examples: 'Mengatakan "Aku sedang merasa kewalahan" daripada bereaksi impulsif', active: true },
      { id: 'ind-sa-2', groupId: 'grp-self-awareness', name: 'Mengenali pemicu emosi (triggers)', description: 'Sadar terhadap situasi atau kondisi yang memicu rasa tidak nyaman/frustrasi', examples: 'Menyadari rasa tegang saat suasana kelas terlalu bising', active: true },
      { id: 'ind-sa-3', groupId: 'grp-self-awareness', name: 'Memiliki konsep diri yang positif', description: 'Menunjukkan keyakinan pada kemampuan diri dan mengenali kelebihan diri', examples: 'Mau mencoba tugas baru dengan bimbingan', active: true },
    ],
  },
  {
    id: 'grp-self-management',
    name: 'Self-Management (Manajemen Diri)',
    description: 'Kemampuan mengelola emosi, pikiran, dan perilaku dalam berbagai situasi pembelajaran.',
    indicators: [
      { id: 'ind-sm-1', groupId: 'grp-self-management', name: 'Menerapkan teknik regulasi emosi', description: 'Mampu menggunakan jeda napas, sudut tenang, atau strategi relaksasi saat emosi meningkat', examples: 'Meminta izin minum air atau ke sudut tenang saat merasa gelisah', active: true },
      { id: 'ind-sm-2', groupId: 'grp-self-management', name: 'Mempertahankan fokus pada tugas', description: 'Mampu menyelesaikan tugas mandiri atau kelompok dalam durasi yang sesuai usia', examples: 'Fokus mengerjakan lembar kerja selama 15 menit tanpa terdistraksi terus menerus', active: true },
      { id: 'ind-sm-3', groupId: 'grp-self-management', name: 'Adaptasi transisi kegiatan', description: 'Mampu berpindah dari aktivitas bermain/santai ke aktivitas belajar terstruktur', examples: 'Merapikan alat belajar saat waktu istirahat usai', active: true },
    ],
  },
  {
    id: 'grp-social-awareness',
    name: 'Social Awareness (Kesadaran Sosial)',
    description: 'Kemampuan memahami sudut pandang orang lain dan berempati dengan rekan sebaya.',
    indicators: [
      { id: 'ind-so-1', groupId: 'grp-social-awareness', name: 'Menunjukkan empati terhadap teman', description: 'Peka saat teman sedih, kesulitan, atau membutuhkan bantuan', examples: 'Menghibur teman yang terjatuh atau meminjamkan alat tulis', active: true },
      { id: 'ind-so-2', groupId: 'grp-social-awareness', name: 'Memahami norma & batasan ruang bersama', description: 'Menghargai giliran bicara, ruang pribadi, dan aturan kelas', examples: 'Mengangkat tangan sebelum berbicara dalam sesi diskusi kelas', active: true },
      { id: 'ind-so-3', groupId: 'grp-social-awareness', name: 'Menghargai keragaman latar belakang', description: 'Dapat bekerja sama secara positif dengan semua teman tanpa memilih-milih', examples: 'Menerima anggota kelompok yang ditentukan guru', active: true },
    ],
  },
  {
    id: 'grp-relationship-skills',
    name: 'Relationship Skills (Keterampilan Berelasi)',
    description: 'Kemampuan membangun dan memelihara hubungan yang sehat dan suportif.',
    indicators: [
      { id: 'ind-rs-1', groupId: 'grp-relationship-skills', name: 'Komunikasi asertif & santun', description: 'Menyampaikan kebutuhan dan ketidaksetujuan secara santun tanpa kekerasan verbal/fisik', examples: 'Mengatakan "Tolong jangan ambil pensilku" dengan tenang', active: true },
      { id: 'ind-rs-2', groupId: 'grp-relationship-skills', name: 'Kolaborasi & berbagi peran kelompok', description: 'Dapat bekerja sama dalam proyek kelompok dan mendengarkan masukan teman', examples: 'Berbagi tugas membuat poster dan mengumpulkan hasil bersama', active: true },
      { id: 'ind-rs-3', groupId: 'grp-relationship-skills', name: 'Resolusi konflik sederhana', description: 'Mampu mencari solusi damai atau meminta bantuan guru saat terjadi perselisihan', examples: 'Menyepakati giliran bermain dengan musyawarah', active: true },
    ],
  },
  {
    id: 'grp-responsible-decision',
    name: 'Responsible Decision-Making (Pengambilan Keputusan Bertanggung Jawab)',
    description: 'Kemampuan membuat pilihan yang konstruktif dan penuh kepedulian terhadap keselamatan dan etika.',
    indicators: [
      { id: 'ind-rd-1', groupId: 'grp-responsible-decision', name: 'Mempertimbangkan konsekuensi tindakan', description: 'Berpikir sebelum bertindak dan mempertimbangkan dampaknya pada diri dan orang lain', examples: 'Menaruh kembali barang ke tempatnya agar tidak membahayakan teman', active: true },
      { id: 'ind-rd-2', groupId: 'grp-responsible-decision', name: 'Menerima tanggung jawab atas tindakan', description: 'Mau mengakui kesalahan dan berupaya memperbaiki situasi', examples: 'Meminta maaf secara tulus ketika tidak sengaja menyenggol meja teman', active: true },
      { id: 'ind-rd-3', groupId: 'grp-responsible-decision', name: 'Menjaga keselamatan diri dan lingkungan', description: 'Mengikuti panduan keselamatan saat bermain di lapangan dan belajar di laboratorium', examples: 'Berjalan tertib di tangga sekolah tanpa berlari-lari', active: true },
    ],
  },
];

const INITIAL_STRATEGIES: MasterStrategy[] = [
  { id: 'str-1', category: 'Regulasi Emosi', name: 'Sudut Tenang (Calm Down Corner)', description: 'Menyediakan area khusus dengan bantal, pengatur napas visual, dan sensory bottle untuk jeda regulasi.', suggestedTier: 'Tier 1' },
  { id: 'str-2', category: 'Transisi & Rutinitas', name: 'Visual Schedule & Timer 5 Menit', description: 'Memberikan penanda visual dan peringatan waktu 5 & 2 menit sebelum perpindahan aktivitas.', suggestedTier: 'Tier 2' },
  { id: 'str-3', category: 'Fokus & Instruksi', name: 'Pemecahan Tugas (Chunking) & Token Reward', description: 'Membagi tugas menjadi bagian 10 menit dengan kartu ceklis visual dan apresiasi bertahap.', suggestedTier: 'Tier 2' },
  { id: 'str-4', category: 'Keterampilan Sosial', name: 'Peer Buddy & Social Story', description: 'Menugaskan rekan sebaya suportif dan membaca cerita sosial singkat tentang giliran bermain.', suggestedTier: 'Tier 2' },
  { id: 'str-5', category: 'Regulasi Intensif', name: 'Check-In / Check-Out (CICO) Harian', description: 'Sesi mentoring 5 menit setiap pagi dan sore bersama konselor untuk menetapkan dan merefleksikan target perilaku harian.', suggestedTier: 'Tier 3' },
  { id: 'str-6', category: 'Intervensi Terpadu', name: 'Rencana De-eskalasi Individual (Individual Support Protocol)', description: 'Protokol bertahap respon staf saat siswa mengalami sensory overload atau frustrasi tinggi.', suggestedTier: 'Tier 3' },
];

const INITIAL_CONFIG: SystemConfig = {
  schoolName: 'SD Harapan Bangsa Mandiri',
  academicYear: '2026/2027',
  activeSemester: 'Ganjil',
  tierDescriptions: {
    tier1: 'Tier 1: Dukungan universal, penguatan iklim kelas positif, dan pembelajaran sosial-emosional untuk seluruh siswa.',
    tier2: 'Tier 2: Dukungan terarah dalam kelompok kecil atau pendampingan spesifik untuk siswa yang memerlukan penguatan keterampilan.',
    tier3: 'Tier 3: Dukungan intensif dan individual yang disesuaikan secara komprehensif bersama tim multidisiplin sekolah.',
  },
  reviewThresholdRules: {
    behaviorObsThresholdPerMonth: 3,
    socialEmotionalEmergingCount: 3,
    unresolvedFollowUpDays: 7,
  },
};

const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std-1',
    nisn: '0123456701',
    fullName: 'Dimas Pratama Putra',
    nickname: 'Dimas',
    classId: 'cls-2a',
    className: 'Kelas 2A',
    grade: 2,
    gender: 'L',
    birthDate: '2018-04-12',
    currentTier: 'Tier 2',
    guardianName: 'Bambang Pratama',
    guardianContact: '0812-1122-3344',
    needsReviewFlag: true,
    flagReason: 'Terdata 3 observasi terkait transisi kelas dalam kurun 14 hari terakhir. Perlu ditinjau kesesuaian strategi visual schedule.',
    notes: 'Respon sangat baik terhadap panduan visual bergambar dan apresiasi verbal personal.',
    status: 'active',
    createdAt: '2026-07-15T08:00:00Z',
    updatedAt: '2026-08-10T10:00:00Z',
  },
  {
    id: 'std-2',
    nisn: '0123456702',
    fullName: 'Siti Rahmawati Putri',
    nickname: 'Rahma',
    classId: 'cls-2a',
    className: 'Kelas 2A',
    grade: 2,
    gender: 'P',
    birthDate: '2018-09-21',
    currentTier: 'Tier 1',
    guardianName: 'Hj. Fatimah',
    guardianContact: '0813-2233-4455',
    needsReviewFlag: false,
    notes: 'Sangat aktif dalam diskusi kelas dan cepat membangun empati dengan teman sebaya.',
    status: 'active',
    createdAt: '2026-07-15T08:00:00Z',
    updatedAt: '2026-08-01T08:00:00Z',
  },
  {
    id: 'std-3',
    nisn: '0123456703',
    fullName: 'Rizky Ramadhan Kusuma',
    nickname: 'Rizky',
    classId: 'cls-2a',
    className: 'Kelas 2A',
    grade: 2,
    gender: 'L',
    birthDate: '2018-01-15',
    currentTier: 'Tier 3',
    guardianName: 'Ir. Agus Kusuma',
    guardianContact: '0811-3344-5566',
    needsReviewFlag: true,
    flagReason: 'Jadwal Review Rutin Siklus 4 Pekan untuk pemantauan efektivitas protokol CICO harian bersama konselor.',
    notes: 'Memerlukan lingkungan dengan stimulasi suara yang terkelola saat tugas fokus mandiri.',
    status: 'active',
    createdAt: '2026-07-15T08:00:00Z',
    updatedAt: '2026-08-14T09:30:00Z',
  },
  {
    id: 'std-4',
    nisn: '0123456704',
    fullName: 'Aisyah Putri Azzahra',
    nickname: 'Aisyah',
    classId: 'cls-2a',
    className: 'Kelas 2A',
    grade: 2,
    gender: 'P',
    birthDate: '2018-07-08',
    currentTier: 'Tier 1',
    guardianName: 'dr. Hendro Azzahra',
    guardianContact: '0812-5566-7788',
    needsReviewFlag: false,
    notes: 'Perkembangan sosial-emosional berkembang konsisten sesuai tahapan usia.',
    status: 'active',
    createdAt: '2026-07-15T08:00:00Z',
    updatedAt: '2026-08-01T08:00:00Z',
  },
  {
    id: 'std-5',
    nisn: '0123456705',
    fullName: 'Fauzan Hakim Sanjaya',
    nickname: 'Fauzan',
    classId: 'cls-3a',
    className: 'Kelas 3A',
    grade: 3,
    gender: 'L',
    birthDate: '2017-05-19',
    currentTier: 'Tier 2',
    guardianName: 'Sanjaya Utama',
    guardianContact: '0813-7788-9900',
    needsReviewFlag: false,
    notes: 'Menunjukkan kemajuan yang menggembirakan dalam menyelesaikan tugas kelompok secara kooperatif.',
    status: 'active',
    createdAt: '2026-07-15T08:00:00Z',
    updatedAt: '2026-08-12T11:00:00Z',
  },
  {
    id: 'std-6',
    nisn: '0123456706',
    fullName: 'Nabila Khansa Amelia',
    nickname: 'Nabila',
    classId: 'cls-3a',
    className: 'Kelas 3A',
    grade: 3,
    gender: 'P',
    birthDate: '2017-11-03',
    currentTier: 'Tier 1',
    guardianName: 'Amelia Kartika',
    guardianContact: '0811-9900-1122',
    needsReviewFlag: false,
    notes: 'Selalu siap membantu rekan yang membutuhkan penjelasan tambahan.',
    status: 'active',
    createdAt: '2026-07-15T08:00:00Z',
    updatedAt: '2026-08-01T08:00:00Z',
  },
  {
    id: 'std-7',
    nisn: '0123456707',
    fullName: 'Kevin Tanuwijaya',
    nickname: 'Kevin',
    classId: 'cls-3a',
    className: 'Kelas 3A',
    grade: 3,
    gender: 'L',
    birthDate: '2017-08-25',
    currentTier: 'Tier 1',
    guardianName: 'David Tanuwijaya',
    guardianContact: '0812-4433-2211',
    needsReviewFlag: false,
    notes: 'Keterampilan self-management berkembang dengan baik.',
    status: 'active',
    createdAt: '2026-07-15T08:00:00Z',
    updatedAt: '2026-08-01T08:00:00Z',
  },
  {
    id: 'std-8',
    nisn: '0123456708',
    fullName: 'Alif Firdaus Rahman',
    nickname: 'Alif',
    classId: 'cls-4a',
    className: 'Kelas 4A',
    grade: 4,
    gender: 'L',
    birthDate: '2016-02-14',
    currentTier: 'Tier 2',
    guardianName: 'Rahman Basuki',
    guardianContact: '0813-1122-8877',
    needsReviewFlag: true,
    flagReason: 'Perlu evaluasi review tengah semester terkait target keterlibatan dalam tugas kolaboratif.',
    notes: 'Tertarik pada kegiatan berbasis proyek sains dan visual grafis.',
    status: 'active',
    createdAt: '2026-07-15T08:00:00Z',
    updatedAt: '2026-08-15T14:00:00Z',
  },
  {
    id: 'std-9',
    nisn: '0123456709',
    fullName: 'Zahra Kirana Maharani',
    nickname: 'Zahra',
    classId: 'cls-1a',
    className: 'Kelas 1A',
    grade: 1,
    gender: 'P',
    birthDate: '2019-10-10',
    currentTier: 'Tier 1',
    guardianName: 'Maharani Safitri',
    guardianContact: '0812-9988-7766',
    needsReviewFlag: false,
    notes: 'Menyesuaikan diri dengan gembira pada rutinitas sekolah dasar.',
    status: 'active',
    createdAt: '2026-07-15T08:00:00Z',
    updatedAt: '2026-08-01T08:00:00Z',
  },
  {
    id: 'std-10',
    nisn: '0123456710',
    fullName: 'Raditya Mahendra Wibowo',
    nickname: 'Radit',
    classId: 'cls-5a',
    className: 'Kelas 5A',
    grade: 5,
    gender: 'L',
    birthDate: '2015-06-30',
    currentTier: 'Tier 1',
    guardianName: 'Wibowo Santoso',
    guardianContact: '0815-5544-3322',
    needsReviewFlag: false,
    notes: 'Keterampilan kepemimpinan dan empati sosial sangat baik.',
    status: 'active',
    createdAt: '2026-07-15T08:00:00Z',
    updatedAt: '2026-08-01T08:00:00Z',
  },
];

const INITIAL_BEHAVIOR_OBS: BehaviorObservation[] = [
  {
    id: 'beh-1',
    studentId: 'std-1',
    studentName: 'Dimas Pratama Putra',
    classId: 'cls-2a',
    className: 'Kelas 2A',
    date: '2026-08-16',
    time: '09:45',
    locationContext: 'Ruang Kelas 2A',
    situationBefore: 'Bel pergantian jam pelajaran Matematika berbunyi, siswa diminta merapikan buku tulis dan bersiap membuka buku Tematik.',
    behaviorObserved: 'Siswa tampak menolak merapikan alat tulis Matematika, meletakkan kepala di atas meja, dan tidak merespons instruksi verbal umum kelas.',
    staffResponse: 'Guru mendekati meja siswa dengan tenang, duduk sejajar mata siswa, dan berbicara dengan nada pelan dan ramah.',
    impactOnActivity: 'Transisi awal pelajaran Tematik tertunda sekitar 4 menit untuk siswa, namun situasi kelas tetap kondusif.',
    supportStrategyGiven: 'Memberikan pilihan 2 tahap: "Dimas mau merapikan pensil dulu atau memasukkan buku matematika ke tas bersama Ibu?" Menggunakan timer pasir 2 menit.',
    resultAfterSupport: 'Siswa memilih merapikan pensil sendiri setelah jeda 1 menit, lalu siap mengikuti kegiatan berikutnya.',
    additionalNotes: 'Pola tampak terjadi saat transisi yang mendadak tanpa aba-aba peringatan waktu sebelumnya.',
    observerId: 'usr-guru-1',
    observerName: 'Ibu Dewi Sartika, S.Pd.',
    observerRole: 'Wali Kelas 2A',
    createdAt: '2026-08-16T10:30:00Z',
    updatedAt: '2026-08-16T10:30:00Z',
  },
  {
    id: 'beh-2',
    studentId: 'std-1',
    studentName: 'Dimas Pratama Putra',
    classId: 'cls-2a',
    className: 'Kelas 2A',
    date: '2026-08-11',
    time: '11:15',
    locationContext: 'Perpustakaan Sekolah',
    situationBefore: 'Kegiatan membaca hening mandiri berakhir dan pustakawan meminta siswa mengembalikan buku ke rak masing-masing.',
    behaviorObserved: 'Siswa tampak ragu-ragu menentukan lokasi rak buku yang sesuai dan mulai menunjukkan ekspresi gelisah sambil meremas ujung baju.',
    staffResponse: 'Guru pendamping memperhatikan bahasa tubuh siswa dan menghampiri sebelum kecemasan meningkat.',
    impactOnActivity: 'Aktivitas pengembalian buku berjalan lancar tanpa kendala.',
    supportStrategyGiven: 'Menunjukkan kartu kategori warna pada rak buku dan mendampingi siswa mencocokkan kode warna buku.',
    resultAfterSupport: 'Siswa berhasil mengembalikan buku ke rak yang tepat dan tersenyum lega.',
    additionalNotes: 'Dukungan visual warna terbukti efektif menurunkan keraguan siswa.',
    observerId: 'usr-guru-1',
    observerName: 'Ibu Dewi Sartika, S.Pd.',
    observerRole: 'Wali Kelas 2A',
    createdAt: '2026-08-11T12:00:00Z',
    updatedAt: '2026-08-11T12:00:00Z',
  },
  {
    id: 'beh-3',
    studentId: 'std-3',
    studentName: 'Rizky Ramadhan Kusuma',
    classId: 'cls-2a',
    className: 'Kelas 2A',
    date: '2026-08-17',
    time: '08:30',
    locationContext: 'Ruang Kelas 2A',
    situationBefore: 'Siswa sedang mengerjakan latihan menggambar peta lingkungan sekitar dalam suasana kelas yang riuh saat diskusi.',
    behaviorObserved: 'Siswa menutup kedua telinganya dengan tangan, berdiri dari kursi, dan berjalan cepat menuju sudut belakang kelas.',
    staffResponse: 'Guru memberi isyarat bahwa siswa diizinkan ke Sudut Tenang dan tidak memaksakan instruksi akademik saat itu.',
    impactOnActivity: 'Siswa lain tetap melanjutkan diskusi; tidak terjadi gangguan terhadap teman sebaya.',
    supportStrategyGiven: 'Memfasilitasi noise-cancelling headphone dan sensory timer air di Sudut Tenang selama 8 menit.',
    resultAfterSupport: 'Setelah 8 menit, pernapasan siswa melambat teratur, siswa kembali ke meja dan melanjutkan mewarnai dengan tenang.',
    additionalNotes: 'Intervensi regulasi mandiri di sudut tenang berjalan efektif sesuai rencana Tier 3.',
    observerId: 'usr-guru-1',
    observerName: 'Ibu Dewi Sartika, S.Pd.',
    observerRole: 'Wali Kelas 2A',
    createdAt: '2026-08-17T09:00:00Z',
    updatedAt: '2026-08-17T09:00:00Z',
  },
  {
    id: 'beh-4',
    studentId: 'std-5',
    studentName: 'Fauzan Hakim Sanjaya',
    classId: 'cls-3a',
    className: 'Kelas 3A',
    date: '2026-08-14',
    time: '10:00',
    locationContext: 'Lapangan Olahraga',
    situationBefore: 'Permainan kasti dalam kelompok, tim siswa sedang menunggu giliran memukul bola.',
    behaviorObserved: 'Siswa tampak tidak sabar menunggu giliran dan mencoba mendahului antrean teman di depannya.',
    staffResponse: 'Guru PJOK mengingatkan urutan giliran nomor punggung yang sudah disepakati.',
    impactOnActivity: 'Permainan sempat jeda 30 detik untuk konfirmasi urutan giliran.',
    supportStrategyGiven: 'Diberikan peran sebagai pencatat skor sementara sembari menunggu giliran memukul.',
    resultAfterSupport: 'Siswa antusias mencatat skor dan tertib menunggu gilirannya dengan bangga.',
    additionalNotes: 'Pemberian tanggung jawab aktif membantu siswa mengelola ketidaksabaran.',
    observerId: 'usr-guru-2',
    observerName: 'Pak Ahmad Fauzi, S.Pd.',
    observerRole: 'Wali Kelas 3A',
    createdAt: '2026-08-14T11:00:00Z',
    updatedAt: '2026-08-14T11:00:00Z',
  },
];

const INITIAL_SE_OBS: SocialEmotionalObservation[] = [
  {
    id: 'se-1',
    studentId: 'std-1',
    studentName: 'Dimas Pratama Putra',
    classId: 'cls-2a',
    className: 'Kelas 2A',
    date: '2026-08-15',
    indicatorGroupId: 'grp-self-management',
    indicatorGroupName: 'Self-Management (Manajemen Diri)',
    indicatorId: 'ind-sm-3',
    indicatorName: 'Adaptasi transisi kegiatan',
    ratingScale: 'mulai_berkembang',
    ratingScore: 2,
    evidenceNotes: 'Mampu merapikan peralatan setelah diberikan aba-aba visual 5 menit sebelum bel berbunyi. Membutuhkan 1 pengingat personal.',
    context: 'Transisi istirahat pertama menuju pembelajaran Bahasa Indonesia.',
    supportStrategy: 'Melanjutkan penggunaan kartu visual jadwal di meja belajar.',
    followUpResult: 'Menunjukkan kemajuan dibandingkan bulan lalu yang memerlukan 3x pengingat verbal.',
    observerId: 'usr-guru-1',
    observerName: 'Ibu Dewi Sartika, S.Pd.',
    observerRole: 'Wali Kelas 2A',
    createdAt: '2026-08-15T13:00:00Z',
    updatedAt: '2026-08-15T13:00:00Z',
  },
  {
    id: 'se-2',
    studentId: 'std-1',
    studentName: 'Dimas Pratama Putra',
    classId: 'cls-2a',
    className: 'Kelas 2A',
    date: '2026-08-15',
    indicatorGroupId: 'grp-self-awareness',
    indicatorGroupName: 'Self-Awareness (Kesadaran Diri)',
    indicatorId: 'ind-sa-1',
    indicatorName: 'Mengenali & menamai emosi sendiri',
    ratingScale: 'berkembang',
    ratingScore: 3,
    evidenceNotes: 'Menunjuk kartu emosi bergambar "Lelah" saat sesi check-in pagi dan dapat menjelaskan secara singkat penyebabnya (tidur larut malam).',
    context: 'Lingkaran refleksi pagi (Morning Meeting).',
    supportStrategy: 'Apresiasi keterbukaan siswa dan pemberian minum hangat.',
    followUpResult: 'Siswa merasa didengar dan siap memulai pembelajaran.',
    observerId: 'usr-guru-1',
    observerName: 'Ibu Dewi Sartika, S.Pd.',
    observerRole: 'Wali Kelas 2A',
    createdAt: '2026-08-15T13:30:00Z',
    updatedAt: '2026-08-15T13:30:00Z',
  },
  {
    id: 'se-3',
    studentId: 'std-3',
    studentName: 'Rizky Ramadhan Kusuma',
    classId: 'cls-2a',
    className: 'Kelas 2A',
    date: '2026-08-16',
    indicatorGroupId: 'grp-self-management',
    indicatorGroupName: 'Self-Management (Manajemen Diri)',
    indicatorId: 'ind-sm-1',
    indicatorName: 'Menerapkan teknik regulasi emosi',
    ratingScale: 'mulai_berkembang',
    ratingScore: 2,
    evidenceNotes: 'Menggunakan kartu jeda napas secara mandiri saat merasa suasana kelas terlalu bising, tanpa perlu diarahkan penuh oleh guru.',
    context: 'Sesi latihan seni suara kelompok.',
    supportStrategy: 'Pemberian apresiasi token bintang atas inisiatif mandiri ke sudut regulasi.',
    followUpResult: 'Mulai mengenali waktu yang tepat untuk jeda mandiri.',
    observerId: 'usr-konselor-1',
    observerName: 'Pak Bambang Wicaksono, S.Psi.',
    observerRole: 'Guru BK / Konselor',
    createdAt: '2026-08-16T14:00:00Z',
    updatedAt: '2026-08-16T14:00:00Z',
  },
  {
    id: 'se-4',
    studentId: 'std-2',
    studentName: 'Siti Rahmawati Putri',
    classId: 'cls-2a',
    className: 'Kelas 2A',
    date: '2026-08-12',
    indicatorGroupId: 'grp-social-awareness',
    indicatorGroupName: 'Social Awareness (Kesadaran Sosial)',
    indicatorId: 'ind-so-1',
    indicatorName: 'Menunjukkan empati terhadap teman',
    ratingScale: 'konsisten',
    ratingScore: 4,
    evidenceNotes: 'Secara spontan meminjamkan pensil warna cadangan kepada teman sebangku yang pensilnya patah.',
    context: 'Proyek mewarnai gambar alam bebas.',
    supportStrategy: 'Penguatan verbal di depan kelas mengenai perilaku peduli teman.',
    followUpResult: 'Menjadi teladan positif bagi rekan di kelas.',
    observerId: 'usr-guru-1',
    observerName: 'Ibu Dewi Sartika, S.Pd.',
    observerRole: 'Wali Kelas 2A',
    createdAt: '2026-08-12T11:00:00Z',
    updatedAt: '2026-08-12T11:00:00Z',
  },
];

const INITIAL_SUPPORT_PLANS: SupportPlan[] = [
  {
    id: 'plan-1',
    studentId: 'std-1',
    studentName: 'Dimas Pratama Putra',
    className: 'Kelas 2A',
    tier: 'Tier 2',
    areaOfNeed: 'Adaptasi Transisi & Regulasi Fokus Mandiri',
    targetGoals: 'Siswa mampu beralih antar aktivitas pembelajaran dengan pengingat visual dalam waktu ≤ 3 menit tanpa menunjukkan penolakan emosional.',
    strategies: [
      'Penerapan kartu jadwal visual berurutan (Visual Schedule Strip) di meja siswa',
      'Peringatan waktu transisi 5 menit dan 2 menit menggunakan jam pasir visual',
      'Pilihan 2 opsi sederhana saat instruksi merapikan peralatan',
      'Apresiasi verbal spesifik segera setelah berhasil bertransisi tertib',
    ],
    frequency: 'Setiap hari pada 4 titik transisi utama (pagi, istirahat 1, istirahat 2, pulang)',
    duration: '6 pekan',
    personInCharge: 'Ibu Dewi Sartika, S.Pd. (Wali Kelas) & Guru Pendamping',
    startDate: '2026-07-28',
    targetReviewDate: '2026-09-08',
    status: 'Active',
    resultNotes: 'Menunjukkan tren penurunan durasi adaptasi dari 7 menit menjadi rata-rata 3-4 menit pada pekan ke-3.',
    createdBy: 'usr-guru-1',
    createdByName: 'Ibu Dewi Sartika, S.Pd.',
    createdAt: '2026-07-28T09:00:00Z',
    updatedAt: '2026-08-10T10:00:00Z',
  },
  {
    id: 'plan-2',
    studentId: 'std-3',
    studentName: 'Rizky Ramadhan Kusuma',
    className: 'Kelas 2A',
    tier: 'Tier 3',
    areaOfNeed: 'Regulasi Stimulasi Sensorik & Manajemen Emosi Terpadu',
    targetGoals: 'Siswa mampu mengenali rasa lelah/overstimulasi dan secara mandiri meminta izin menggunakan perlengkapan regulasi di Sudut Tenang.',
    strategies: [
      'Protokol Check-In / Check-Out (CICO) setiap pukul 07.15 dan 13.30 bersama Konselor',
      'Penyediaan noise-cancelling headphones saat sesi pembelajaran bising/kelompok besar',
      'Kartu jeda darurat (Break Pass Card) yang dapat diletakkan di meja tanpa harus berbicara panjang',
      'Koordinasi mingguan catatan kemajuan dengan orang tua di rumah',
    ],
    frequency: 'Harian (2x sesi monitoring CICO dan pendampingan di kelas)',
    duration: '8 pekan',
    personInCharge: 'Pak Bambang Wicaksono, S.Psi. (Konselor) & Tim Inklusi',
    startDate: '2026-07-22',
    targetReviewDate: '2026-08-25',
    status: 'Under Review',
    resultNotes: 'Frekuensi eskalasi emosi berkurang dari 4x per minggu menjadi 1x per minggu. Rencana akan dievaluasi dalam forum MTSS.',
    createdBy: 'usr-mtss-1',
    createdByName: 'Ibu Nurul Hidayati, M.Psi.',
    createdAt: '2026-07-22T08:30:00Z',
    updatedAt: '2026-08-14T09:30:00Z',
  },
  {
    id: 'plan-3',
    studentId: 'std-5',
    studentName: 'Fauzan Hakim Sanjaya',
    className: 'Kelas 3A',
    tier: 'Tier 2',
    areaOfNeed: 'Pengelolaan Giliran & Keterampilan Kolaborasi Kelompok',
    targetGoals: 'Siswa mampu menunggu giliran bicara/bermain dan menyelesaikan tugas peran kelompok hingga tuntas dengan bimbingan terarah.',
    strategies: [
      'Pemberian kartu giliran berbicara ("Talking Stick / Card")',
      'Penetapan peran terstruktur yang jelas dalam kerja kelompok kecil (3-4 siswa)',
      'Penguatan positif berkala atas keberhasilan mendengarkan pendapat teman',
    ],
    frequency: '3x seminggu pada sesi pembelajaran kelompok',
    duration: '4 pekan',
    personInCharge: 'Pak Ahmad Fauzi, S.Pd. (Wali Kelas 3A)',
    startDate: '2026-08-01',
    targetReviewDate: '2026-08-29',
    status: 'Active',
    resultNotes: 'Sangat kooperatif saat diberikan peran aktif sebagai koordinator alat atau pencatat.',
    createdBy: 'usr-guru-2',
    createdByName: 'Pak Ahmad Fauzi, S.Pd.',
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-12T11:00:00Z',
  },
];

const INITIAL_INTERVENTION_LOGS: InterventionLog[] = [
  {
    id: 'log-1',
    planId: 'plan-1',
    studentId: 'std-1',
    studentName: 'Dimas Pratama Putra',
    date: '2026-08-16',
    time: '09:40',
    strategyUsed: 'Penerapan kartu jadwal visual & pengingat pasir 2 menit',
    durationMinutes: 10,
    studentResponse: 'Awalnya ragu, lalu memperhatikan jam pasir dan mulai merapikan buku secara bertahap.',
    observedResult: 'Transisi selesai dalam 3 menit. Siswa menunjukkan senyum saat menerima stiker bintang.',
    notes: 'Respon terhadap timer visual jauh lebih tenang dibanding instruksi lisan berulang.',
    followUpNeeded: false,
    loggedBy: 'usr-guru-1',
    loggedByName: 'Ibu Dewi Sartika, S.Pd.',
    loggedByRole: 'Wali Kelas 2A',
    createdAt: '2026-08-16T10:45:00Z',
  },
  {
    id: 'log-2',
    planId: 'plan-2',
    studentId: 'std-3',
    studentName: 'Rizky Ramadhan Kusuma',
    date: '2026-08-17',
    time: '07:20',
    strategyUsed: 'Sesi Check-In Pagi (CICO)',
    durationMinutes: 10,
    studentResponse: 'Siswa bercerita dengan antusias tentang sarapannya dan menetapkan target hari ini: fokus 15 menit tugas matematika.',
    observedResult: 'Kondisi emosi awal hari terpantau tenang dan bersemangat.',
    notes: 'Orang tua menitipkan catatan bahwa malam sebelumnya tidur cukup pukul 20.30.',
    followUpNeeded: false,
    loggedBy: 'usr-konselor-1',
    loggedByName: 'Pak Bambang Wicaksono, S.Psi.',
    loggedByRole: 'Guru BK / Konselor',
    createdAt: '2026-08-17T07:40:00Z',
  },
  {
    id: 'log-3',
    planId: 'plan-3',
    studentId: 'std-5',
    studentName: 'Fauzan Hakim Sanjaya',
    date: '2026-08-14',
    time: '10:05',
    strategyUsed: 'Pemberian peran pencatat skor & penguatan giliran',
    durationMinutes: 15,
    studentResponse: 'Sangat fokus mencatat perolehan angka rekan satu tim dengan teliti.',
    observedResult: 'Tidak ada upaya mendahului antrean; siswa merasa diikutsertakan secara bermakna.',
    notes: 'Strategi ini efektif untuk disosialisasikan ke guru mata pelajaran lain.',
    followUpNeeded: false,
    loggedBy: 'usr-guru-2',
    loggedByName: 'Pak Ahmad Fauzi, S.Pd.',
    loggedByRole: 'Wali Kelas 3A',
    createdAt: '2026-08-14T11:30:00Z',
  },
];

const INITIAL_PROGRESS_RECORDS: ProgressMonitoringRecord[] = [
  {
    id: 'prog-1',
    studentId: 'std-1',
    studentName: 'Dimas Pratama Putra',
    date: '2026-07-31',
    periodLabel: 'Pekan 1 (Juli)',
    domain: 'Adaptasi Transisi',
    targetMetricName: 'Kemandirian Transisi Aktivitas',
    scoreNumeric: 2.0,
    ratingLabel: 'Memerlukan Dukungan Intensif',
    operationalStatus: 'memerlukan_pemantauan',
    notes: 'Rata-rata memerlukan waktu transisi 7 menit dengan 3 kali pendampingan langsung.',
    recordedBy: 'usr-guru-1',
    recordedByName: 'Ibu Dewi Sartika, S.Pd.',
    createdAt: '2026-07-31T14:00:00Z',
  },
  {
    id: 'prog-2',
    studentId: 'std-1',
    studentName: 'Dimas Pratama Putra',
    date: '2026-08-07',
    periodLabel: 'Pekan 2 (Agustus)',
    domain: 'Adaptasi Transisi',
    targetMetricName: 'Kemandirian Transisi Aktivitas',
    scoreNumeric: 2.8,
    ratingLabel: 'Menunjukkan Kemajuan Berarti',
    operationalStatus: 'menunjukkan_kemajuan',
    notes: 'Waktu transisi membaik menjadi rata-rata 4.5 menit dengan kartu visual schedule.',
    recordedBy: 'usr-guru-1',
    recordedByName: 'Ibu Dewi Sartika, S.Pd.',
    createdAt: '2026-08-07T14:00:00Z',
  },
  {
    id: 'prog-3',
    studentId: 'std-1',
    studentName: 'Dimas Pratama Putra',
    date: '2026-08-14',
    periodLabel: 'Pekan 3 (Agustus)',
    domain: 'Adaptasi Transisi',
    targetMetricName: 'Kemandirian Transisi Aktivitas',
    scoreNumeric: 3.4,
    ratingLabel: 'Mendekati Target yang Diharapkan',
    operationalStatus: 'menunjukkan_kemajuan',
    notes: 'Waktu transisi konsisten di angka 3 menit. Siswa mulai menginisiasi merapikan barang sebelum bel berbunyi.',
    recordedBy: 'usr-guru-1',
    recordedByName: 'Ibu Dewi Sartika, S.Pd.',
    createdAt: '2026-08-14T14:00:00Z',
  },
  {
    id: 'prog-4',
    studentId: 'std-3',
    studentName: 'Rizky Ramadhan Kusuma',
    date: '2026-07-30',
    periodLabel: 'Pekan 1 (Juli)',
    domain: 'Regulasi Sensorik',
    targetMetricName: 'Penggunaan Mandiri Break Pass',
    scoreNumeric: 1.8,
    ratingLabel: 'Memerlukan Pendampingan Penuh',
    operationalStatus: 'perlu_ditinjau_tim',
    notes: 'Siswa masih sering menunggu guru mendekat sebelum berani menuju sudut tenang.',
    recordedBy: 'usr-konselor-1',
    recordedByName: 'Pak Bambang Wicaksono, S.Psi.',
    createdAt: '2026-07-30T15:00:00Z',
  },
  {
    id: 'prog-5',
    studentId: 'std-3',
    studentName: 'Rizky Ramadhan Kusuma',
    date: '2026-08-15',
    periodLabel: 'Pekan 3 (Agustus)',
    domain: 'Regulasi Sensorik',
    targetMetricName: 'Penggunaan Mandiri Break Pass',
    scoreNumeric: 3.2,
    ratingLabel: 'Kemajuan Signifikan',
    operationalStatus: 'menunjukkan_kemajuan',
    notes: 'Siswa 3 kali secara mandiri menunjukkan kartu jeda saat suasana riuh dan kembali setelah 8 menit.',
    recordedBy: 'usr-konselor-1',
    recordedByName: 'Pak Bambang Wicaksono, S.Psi.',
    createdAt: '2026-08-15T15:00:00Z',
  },
];

const INITIAL_FOLLOW_UPS: FollowUp[] = [
  {
    id: 'flw-1',
    studentId: 'std-1',
    studentName: 'Dimas Pratama Putra',
    title: 'Koordinasi Penerapan Jadwal Visual di Rumah',
    description: 'Menghubungi orang tua Dimas untuk menyamakan format kartu jadwal visual aktivitas pagi di rumah dan sekolah.',
    dueDate: '2026-08-22',
    priority: 'Sedang',
    status: 'Pending',
    assignedToId: 'usr-guru-1',
    assignedToName: 'Ibu Dewi Sartika, S.Pd.',
    createdBy: 'usr-guru-1',
    createdByName: 'Ibu Dewi Sartika, S.Pd.',
    createdAt: '2026-08-16T11:00:00Z',
  },
  {
    id: 'flw-2',
    studentId: 'std-3',
    studentName: 'Rizky Ramadhan Kusuma',
    title: 'Pemeriksaan Ketersediaan Headphone Cadangan',
    description: 'Memastikan headphone peredam bising cadangan selalu tersedia di loker kelas 2A.',
    dueDate: '2026-08-19',
    priority: 'Tinggi',
    status: 'In Progress',
    assignedToId: 'usr-konselor-1',
    assignedToName: 'Pak Bambang Wicaksono, S.Psi.',
    createdBy: 'usr-mtss-1',
    createdByName: 'Ibu Nurul Hidayati, M.Psi.',
    createdAt: '2026-08-17T09:15:00Z',
  },
  {
    id: 'flw-3',
    studentId: 'std-5',
    studentName: 'Fauzan Hakim Sanjaya',
    title: 'Pemberitahuan Strategi Peran Aktif ke Guru PJOK & Seni',
    description: 'Membagikan catatan tips peran aktif (seperti pencatat skor) ke guru mata pelajaran lain.',
    dueDate: '2026-08-20',
    priority: 'Rendah',
    status: 'Completed',
    assignedToId: 'usr-guru-2',
    assignedToName: 'Pak Ahmad Fauzi, S.Pd.',
    createdBy: 'usr-guru-2',
    createdByName: 'Pak Ahmad Fauzi, S.Pd.',
    createdAt: '2026-08-14T12:00:00Z',
    completedAt: '2026-08-15T10:00:00Z',
    resolutionNotes: 'Sudah disampaikan langsung saat rapat mingguan guru mata pelajaran.',
  },
];

const INITIAL_MTSS_REVIEWS: MtssReview[] = [
  {
    id: 'rev-1',
    studentId: 'std-3',
    studentName: 'Rizky Ramadhan Kusuma',
    reviewDate: '2026-08-18',
    reviewType: 'Rutin',
    currentTier: 'Tier 3',
    recommendedTier: 'Tier 3',
    observationsSummary: 'Dalam 4 pekan pelaksanaan, tercatat 1 kejadian de-eskalasi yang tertangani mandiri di sudut tenang. Sesi CICO berjalan teratur.',
    interventionSummary: 'Dukungan Tier 3 (CICO + Noise-cancelling + Sensory Corner) sangat membantu stabilitas emosi siswa.',
    decisionNotes: 'Tim memutuskan melanjutkan rencana dukungan Tier 3 selama 4 pekan ke depan dengan menambahkan stimulasi visual saat jam istirahat. Belum direkomendasikan penurunan tier saat ini demi mempertahankan kestabilan.',
    nextReviewDate: '2026-09-18',
    committeeMembers: ['Ibu Nurul Hidayati (Koordinator MTSS)', 'Ibu Dewi Sartika (Wali Kelas)', 'Pak Bambang Wicaksono (Konselor)'],
    status: 'Approved',
    createdById: 'usr-mtss-1',
    createdByName: 'Ibu Nurul Hidayati, M.Psi.',
    createdAt: '2026-08-18T08:00:00Z',
  },
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-1',
    entityType: 'SUPPORT_PLAN',
    entityId: 'plan-1',
    actionType: 'CREATE',
    description: 'Membuat Rencana Dukungan Tier 2 untuk Dimas Pratama Putra (Adaptasi Transisi & Regulasi Fokus Mandiri)',
    userId: 'usr-guru-1',
    userName: 'Ibu Dewi Sartika, S.Pd.',
    userRole: 'guru',
    timestamp: '2026-07-28T09:00:00Z',
  },
  {
    id: 'aud-2',
    entityType: 'STUDENT',
    entityId: 'std-1',
    actionType: 'TIER_CHANGE',
    description: 'Penetapan status dukungan ke Tier 2 setelah musyawarah Tim MTSS sekolah',
    beforeData: { currentTier: 'Tier 1' },
    afterData: { currentTier: 'Tier 2' },
    userId: 'usr-mtss-1',
    userName: 'Ibu Nurul Hidayati, M.Psi.',
    userRole: 'koordinator_mtss',
    timestamp: '2026-07-28T09:15:00Z',
    reason: 'Rekomendasi hasil observasi awal dan kesepakatan orang tua serta tim sekolah',
  },
  {
    id: 'aud-3',
    entityType: 'MTSS_REVIEW',
    entityId: 'rev-1',
    actionType: 'REVIEW_COMPLETED',
    description: 'Menyelesaikan Review MTSS Siklus 1 untuk Rizky Ramadhan Kusuma - Status: Lanjutkan Tier 3',
    userId: 'usr-mtss-1',
    userName: 'Ibu Nurul Hidayati, M.Psi.',
    userRole: 'koordinator_mtss',
    timestamp: '2026-08-18T08:00:00Z',
    reason: 'Evaluasi keberlanjutan dukungan intensif',
  },
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (!parsed.emotions) parsed.emotions = [];
        if (!parsed.ldssRecords) parsed.ldssRecords = [];
        if (!parsed.supervisions) parsed.supervisions = [];
        if (!parsed.caseConferences) parsed.caseConferences = [];
        if (!parsed.lazuardiSupportRows) parsed.lazuardiSupportRows = [];
        if (!parsed.workResults) parsed.workResults = [];
        return parsed;
      }
    } catch (err) {
      console.warn('Could not read db.json, initializing with default dataset', err);
    }

    const defaultData: DatabaseSchema = {
      users: INITIAL_USERS,
      students: INITIAL_STUDENTS,
      classes: INITIAL_CLASSES,
      indicatorGroups: INITIAL_INDICATOR_GROUPS,
      strategies: INITIAL_STRATEGIES,
      config: INITIAL_CONFIG,
      behaviorObservations: INITIAL_BEHAVIOR_OBS,
      socialEmotionalObservations: INITIAL_SE_OBS,
      supportPlans: INITIAL_SUPPORT_PLANS,
      interventionLogs: INITIAL_INTERVENTION_LOGS,
      progressRecords: INITIAL_PROGRESS_RECORDS,
      followUps: INITIAL_FOLLOW_UPS,
      mtssReviews: INITIAL_MTSS_REVIEWS,
      auditLogs: INITIAL_AUDIT_LOGS,
      emotions: [],
      ldssRecords: [],
      supervisions: [],
      caseConferences: [],
      lazuardiSupportRows: [],
      workResults: [],
    };

    this.saveDataDirect(defaultData);
    return defaultData;
  }

  private saveDataDirect(data: DatabaseSchema) {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write db.json', err);
    }
  }

  public save() {
    this.saveDataDirect(this.data);
  }

  public getRaw(): DatabaseSchema {
    return this.data;
  }

  public addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>) {
    const newLog: AuditLog = {
      ...log,
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
    };
    this.data.auditLogs.unshift(newLog);
    this.save();
    return newLog;
  }

  // --- Student Methods ---
  public getStudents(user?: User): Student[] {
    let list = this.data.students.filter(s => s.status !== 'archived');
    if (user && user.role === 'guru' && user.assignedClassIds && user.assignedClassIds.length > 0) {
      list = list.filter(s => user.assignedClassIds?.includes(s.classId));
    }
    return list;
  }

  public getStudentById(id: string): Student | undefined {
    return this.data.students.find(s => s.id === id);
  }

  public createStudent(student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>, user: User): Student {
    const now = new Date().toISOString();
    const newStudent: Student = {
      ...student,
      id: `std-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    this.data.students.push(newStudent);
    this.addAuditLog({
      entityType: 'STUDENT',
      entityId: newStudent.id,
      actionType: 'CREATE',
      description: `Menambahkan data siswa baru: ${newStudent.fullName} (${newStudent.className})`,
      afterData: newStudent,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
    });
    this.save();
    return newStudent;
  }

  public updateStudent(id: string, updates: Partial<Student>, user: User, reason?: string): Student | null {
    const idx = this.data.students.findIndex(s => s.id === id);
    if (idx === -1) return null;

    const before = { ...this.data.students[idx] };
    const tierChanged = updates.currentTier && updates.currentTier !== before.currentTier;

    this.data.students[idx] = {
      ...this.data.students[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const after = this.data.students[idx];

    this.addAuditLog({
      entityType: 'STUDENT',
      entityId: id,
      actionType: tierChanged ? 'TIER_CHANGE' : 'UPDATE',
      description: tierChanged
        ? `Perubahan Status Tier Siswa ${after.fullName}: dari ${before.currentTier} ke ${after.currentTier}`
        : `Memperbarui profil siswa ${after.fullName}`,
      beforeData: before,
      afterData: after,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      reason,
    });

    this.save();
    return after;
  }

  // --- Behavior Observation Methods ---
  public getBehaviorObservations(studentId?: string, classId?: string): BehaviorObservation[] {
    let list = this.data.behaviorObservations;
    if (studentId) list = list.filter(b => b.studentId === studentId);
    if (classId) list = list.filter(b => b.classId === classId);
    return list.sort((a, b) => new Date(b.date + 'T' + b.time).getTime() - new Date(a.date + 'T' + a.time).getTime());
  }

  public createBehaviorObservation(data: Omit<BehaviorObservation, 'id' | 'createdAt' | 'updatedAt'>, user: User): BehaviorObservation {
    const student = this.getStudentById(data.studentId);
    const cls = this.data.classes.find(c => c.id === (student?.classId || data.classId));
    const now = new Date().toISOString();
    const newObs: BehaviorObservation = {
      ...data,
      id: `beh-${Date.now()}`,
      studentName: student?.fullName || data.studentName || 'Siswa',
      className: cls?.name || data.className || 'Kelas',
      observerId: user.id,
      observerName: user.name,
      observerRole: user.roleTitle,
      createdAt: now,
      updatedAt: now,
    };
    this.data.behaviorObservations.unshift(newObs);

    // Check automatic human review flag rule (e.g. 3+ obs in a month)
    this.checkAndFlagStudentReview(data.studentId);

    this.addAuditLog({
      entityType: 'BEHAVIOR_OBS',
      entityId: newObs.id,
      actionType: 'CREATE',
      description: `Mencatat observasi behavior untuk ${newObs.studentName} pada ${newObs.date}`,
      afterData: newObs,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
    });

    this.save();
    return newObs;
  }

  // --- Social Emotional Observation Methods ---
  public getSocialEmotionalObservations(studentId?: string, classId?: string): SocialEmotionalObservation[] {
    let list = this.data.socialEmotionalObservations;
    if (studentId) list = list.filter(s => s.studentId === studentId);
    if (classId) list = list.filter(s => s.classId === classId);
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public createSocialEmotionalObservation(data: Omit<SocialEmotionalObservation, 'id' | 'createdAt' | 'updatedAt'>, user: User): SocialEmotionalObservation {
    const student = this.getStudentById(data.studentId);
    const cls = this.data.classes.find(c => c.id === (student?.classId || data.classId));
    const now = new Date().toISOString();

    const scaleToScore: Record<string, number> = {
      belum_terlihat: 1,
      mulai_berkembang: 2,
      berkembang: 3,
      konsisten: 4,
    };

    const newObs: SocialEmotionalObservation = {
      ...data,
      id: `se-${Date.now()}`,
      studentName: student?.fullName || data.studentName || 'Siswa',
      className: cls?.name || data.className || 'Kelas',
      ratingScore: scaleToScore[data.ratingScale] || 2,
      observerId: user.id,
      observerName: user.name,
      observerRole: user.roleTitle,
      createdAt: now,
      updatedAt: now,
    };
    this.data.socialEmotionalObservations.unshift(newObs);

    this.checkAndFlagStudentReview(data.studentId);

    this.addAuditLog({
      entityType: 'SE_OBS',
      entityId: newObs.id,
      actionType: 'CREATE',
      description: `Mencatat observasi Social-Emotional (${newObs.indicatorName}) untuk ${newObs.studentName}`,
      afterData: newObs,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
    });

    this.save();
    return newObs;
  }

  // Rule checking helper: Flag for human review if thresholds met
  private checkAndFlagStudentReview(studentId: string) {
    const student = this.getStudentById(studentId);
    if (!student) return;

    // Count recent behavior obs in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentBeh = this.data.behaviorObservations.filter(
      b => b.studentId === studentId && new Date(b.date) >= thirtyDaysAgo
    );

    const threshold = this.data.config.reviewThresholdRules.behaviorObsThresholdPerMonth || 3;
    if (recentBeh.length >= threshold && !student.needsReviewFlag) {
      student.needsReviewFlag = true;
      student.flagReason = `Pola teridentifikasi: Terdapat ${recentBeh.length} catatan observasi dalam 30 hari terakhir. Perlu ditinjau oleh Tim MTSS & Guru Kelas.`;
      student.updatedAt = new Date().toISOString();
    }
  }

  // --- Support Plan Methods ---
  public getSupportPlans(studentId?: string): SupportPlan[] {
    let list = this.data.supportPlans;
    if (studentId) list = list.filter(p => p.studentId === studentId);
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createSupportPlan(data: Omit<SupportPlan, 'id' | 'createdAt' | 'updatedAt'>, user: User): SupportPlan {
    const student = this.getStudentById(data.studentId);
    const now = new Date().toISOString();
    const newPlan: SupportPlan = {
      ...data,
      id: `plan-${Date.now()}`,
      studentName: student?.fullName || data.studentName || 'Siswa',
      className: student?.className || data.className || 'Kelas',
      createdBy: user.id,
      createdByName: user.name,
      createdAt: now,
      updatedAt: now,
    };
    this.data.supportPlans.unshift(newPlan);

    this.addAuditLog({
      entityType: 'SUPPORT_PLAN',
      entityId: newPlan.id,
      actionType: 'CREATE',
      description: `Membuat Rencana Dukungan ${newPlan.tier} (${newPlan.areaOfNeed}) untuk ${newPlan.studentName}`,
      afterData: newPlan,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
    });

    this.save();
    return newPlan;
  }

  public updateSupportPlan(id: string, updates: Partial<SupportPlan>, user: User, reason?: string): SupportPlan | null {
    const idx = this.data.supportPlans.findIndex(p => p.id === id);
    if (idx === -1) return null;

    const before = { ...this.data.supportPlans[idx] };
    this.data.supportPlans[idx] = {
      ...this.data.supportPlans[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: user.name,
    };
    const after = this.data.supportPlans[idx];

    const statusChanged = updates.status && updates.status !== before.status;

    this.addAuditLog({
      entityType: 'SUPPORT_PLAN',
      entityId: id,
      actionType: statusChanged ? 'STATUS_CHANGE' : 'UPDATE',
      description: statusChanged
        ? `Perubahan Status Rencana Dukungan ${after.studentName}: ${before.status} → ${after.status}`
        : `Memperbarui Rencana Dukungan untuk ${after.studentName}`,
      beforeData: before,
      afterData: after,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      reason,
    });

    this.save();
    return after;
  }

  // --- Intervention Log Methods ---
  public getInterventionLogs(studentId?: string, planId?: string): InterventionLog[] {
    let list = this.data.interventionLogs;
    if (studentId) list = list.filter(l => l.studentId === studentId);
    if (planId) list = list.filter(l => l.planId === planId);
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public createInterventionLog(data: Omit<InterventionLog, 'id' | 'createdAt'>, user: User): InterventionLog {
    const student = this.getStudentById(data.studentId);
    const newLog: InterventionLog = {
      ...data,
      id: `log-${Date.now()}`,
      studentName: student?.fullName || data.studentName || 'Siswa',
      loggedBy: user.id,
      loggedByName: user.name,
      loggedByRole: user.roleTitle,
      createdAt: new Date().toISOString(),
    };
    this.data.interventionLogs.unshift(newLog);

    this.addAuditLog({
      entityType: 'INTERVENTION_LOG',
      entityId: newLog.id,
      actionType: 'CREATE',
      description: `Mencatat log intervensi untuk ${newLog.studentName}: ${newLog.strategyUsed}`,
      afterData: newLog,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
    });

    this.save();
    return newLog;
  }

  // --- Progress Monitoring Records ---
  public getProgressRecords(studentId?: string): ProgressMonitoringRecord[] {
    let list = this.data.progressRecords;
    if (studentId) list = list.filter(p => p.studentId === studentId);
    return list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  public createProgressRecord(data: Omit<ProgressMonitoringRecord, 'id' | 'createdAt'>, user: User): ProgressMonitoringRecord {
    const student = this.getStudentById(data.studentId);
    const newRec: ProgressMonitoringRecord = {
      ...data,
      id: `prog-${Date.now()}`,
      studentName: student?.fullName || data.studentName || 'Siswa',
      recordedBy: user.id,
      recordedByName: user.name,
      createdAt: new Date().toISOString(),
    };
    this.data.progressRecords.push(newRec);

    this.addAuditLog({
      entityType: 'PROGRESS',
      entityId: newRec.id,
      actionType: 'CREATE',
      description: `Mencatat progress monitoring untuk ${newRec.studentName} (${newRec.domain} - Skor ${newRec.scoreNumeric})`,
      afterData: newRec,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
    });

    this.save();
    return newRec;
  }

  // --- Follow Ups ---
  public getFollowUps(studentId?: string): FollowUp[] {
    let list = this.data.followUps;
    if (studentId) list = list.filter(f => f.studentId === studentId);
    return list.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }

  public createFollowUp(data: Omit<FollowUp, 'id' | 'createdAt'>, user: User): FollowUp {
    const student = this.getStudentById(data.studentId);
    const newFlw: FollowUp = {
      ...data,
      id: `flw-${Date.now()}`,
      studentName: student?.fullName || data.studentName || 'Siswa',
      createdBy: user.id,
      createdByName: user.name,
      createdAt: new Date().toISOString(),
    };
    this.data.followUps.unshift(newFlw);

    this.addAuditLog({
      entityType: 'FOLLOW_UP',
      entityId: newFlw.id,
      actionType: 'CREATE',
      description: `Membuat item tindak lanjut: "${newFlw.title}" untuk ${newFlw.studentName}`,
      afterData: newFlw,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
    });

    this.save();
    return newFlw;
  }

  public updateFollowUp(id: string, updates: Partial<FollowUp>, user: User): FollowUp | null {
    const idx = this.data.followUps.findIndex(f => f.id === id);
    if (idx === -1) return null;

    const before = { ...this.data.followUps[idx] };
    if (updates.status === 'Completed' && before.status !== 'Completed') {
      updates.completedAt = new Date().toISOString();
    }

    this.data.followUps[idx] = {
      ...this.data.followUps[idx],
      ...updates,
    };
    const after = this.data.followUps[idx];

    this.addAuditLog({
      entityType: 'FOLLOW_UP',
      entityId: id,
      actionType: updates.status ? 'STATUS_CHANGE' : 'UPDATE',
      description: `Memperbarui tindak lanjut "${after.title}" (${after.status})`,
      beforeData: before,
      afterData: after,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
    });

    this.save();
    return after;
  }

  // --- MTSS Reviews ---
  public getMtssReviews(studentId?: string): MtssReview[] {
    let list = this.data.mtssReviews;
    if (studentId) list = list.filter(r => r.studentId === studentId);
    return list.sort((a, b) => new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime());
  }

  public createMtssReview(data: Omit<MtssReview, 'id' | 'createdAt'>, user: User): MtssReview {
    const student = this.getStudentById(data.studentId);
    const newRev: MtssReview = {
      ...data,
      id: `rev-${Date.now()}`,
      studentName: student?.fullName || data.studentName || 'Siswa',
      createdById: user.id,
      createdByName: user.name,
      createdAt: new Date().toISOString(),
    };
    this.data.mtssReviews.unshift(newRev);

    // If review recommends tier change and is Approved, update student tier and clear flag
    if (newRev.status === 'Approved' && student) {
      if (newRev.recommendedTier !== student.currentTier) {
        student.currentTier = newRev.recommendedTier;
      }
      student.needsReviewFlag = false;
      student.flagReason = undefined;
      student.updatedAt = new Date().toISOString();
    }

    this.addAuditLog({
      entityType: 'MTSS_REVIEW',
      entityId: newRev.id,
      actionType: 'REVIEW_COMPLETED',
      description: `Hasil Keputusan Review MTSS untuk ${newRev.studentName}: ${newRev.status} (Rekomendasi: ${newRev.recommendedTier})`,
      afterData: newRev,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      reason: newRev.decisionNotes,
    });

    this.save();
    return newRev;
  }

  // --- Master Data & Config Methods ---
  public getIndicatorGroups(): MasterIndicatorGroup[] {
    return this.data.indicatorGroups;
  }

  public updateIndicatorGroup(group: MasterIndicatorGroup, user: User): void {
    const idx = this.data.indicatorGroups.findIndex(g => g.id === group.id);
    if (idx !== -1) {
      this.data.indicatorGroups[idx] = group;
      this.addAuditLog({
        entityType: 'CONFIG',
        entityId: group.id,
        actionType: 'UPDATE',
        description: `Memperbarui kelompok indikator: ${group.name}`,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
      });
      this.save();
    }
  }

  public getStrategies(): MasterStrategy[] {
    return this.data.strategies;
  }

  public addStrategy(strategy: Omit<MasterStrategy, 'id'>, user: User): MasterStrategy {
    const newStrat: MasterStrategy = {
      ...strategy,
      id: `str-${Date.now()}`,
    };
    this.data.strategies.push(newStrat);
    this.addAuditLog({
      entityType: 'CONFIG',
      entityId: newStrat.id,
      actionType: 'CREATE',
      description: `Menambahkan strategi intervensi master: ${newStrat.name}`,
      afterData: newStrat,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
    });
    this.save();
    return newStrat;
  }

  public getConfig(): SystemConfig {
    return this.data.config;
  }

  public updateConfig(newConfig: Partial<SystemConfig>, user: User): SystemConfig {
    this.data.config = { ...this.data.config, ...newConfig };
    this.addAuditLog({
      entityType: 'CONFIG',
      entityId: 'system-config',
      actionType: 'UPDATE',
      description: 'Memperbarui konfigurasi sistem MTSS & aturan threshold',
      afterData: this.data.config,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
    });
    this.save();
    return this.data.config;
  }

  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public createUser(userData: Partial<User>, user: User): User {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: userData.name || 'Pengguna Baru',
      email: userData.email || '',
      role: userData.role || 'guru',
      roleTitle: userData.roleTitle || 'Staf Sekolah',
      assignedClassIds: userData.assignedClassIds || [],
      phone: userData.phone || '',
      avatar: userData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    };
    this.data.users.push(newUser);
    this.addAuditLog({
      entityType: 'USER',
      entityId: newUser.id,
      actionType: 'CREATE',
      description: `Menambahkan pengguna baru: ${newUser.name} (${newUser.roleTitle})`,
      afterData: newUser,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
    });
    this.save();
    return newUser;
  }

  // --- Emotion Methods ---
  public getEmotions(studentId?: string, classId?: string, date?: string): EmotionRecord[] {
    if (!this.data.emotions) this.data.emotions = [];
    let list = this.data.emotions;
    if (studentId) list = list.filter(e => e.studentId === studentId);
    if (classId) list = list.filter(e => e.classId === classId);
    if (date) list = list.filter(e => e.date === date);
    return list.sort((a, b) => b.date.localeCompare(a.date));
  }

  public saveEmotion(record: Partial<EmotionRecord>, user: User): EmotionRecord {
    if (!this.data.emotions) this.data.emotions = [];
    const student = this.getStudentById(record.studentId || '');
    const studentName = student?.fullName || record.studentName || 'Siswa';
    const classId = student?.classId || record.classId || '';
    const className = student?.className || record.className || '';
    const date = record.date || new Date().toISOString().split('T')[0];

    const existingIdx = this.data.emotions.findIndex(
      e => e.studentId === record.studentId && e.date === date
    );

    let resultRecord: EmotionRecord;

    if (existingIdx !== -1) {
      const existing = this.data.emotions[existingIdx];
      resultRecord = {
        ...existing,
        ...record,
        checkIn: record.checkIn !== undefined ? record.checkIn : existing.checkIn,
        checkOut: record.checkOut !== undefined ? record.checkOut : existing.checkOut,
        cycle21Count: (existing.cycle21Count || 0) + (record.checkIn || record.checkOut ? 1 : 0),
      };
      this.data.emotions[existingIdx] = resultRecord;
    } else {
      resultRecord = {
        id: `emo-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        studentId: record.studentId || '',
        studentName,
        classId,
        className,
        date,
        checkIn: record.checkIn,
        checkOut: record.checkOut,
        cycle21Count: record.checkIn || record.checkOut ? 1 : 0,
      };
      this.data.emotions.unshift(resultRecord);
    }

    this.addAuditLog({
      entityType: 'EMOTION',
      entityId: resultRecord.id,
      actionType: existingIdx !== -1 ? 'UPDATE' : 'CREATE',
      description: `Pencatatan check-in/out emosi untuk ${studentName} pada ${date}`,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
    });

    this.save();
    return resultRecord;
  }

  public batchSaveEmotions(records: Partial<EmotionRecord>[], user: User): EmotionRecord[] {
    const results: EmotionRecord[] = [];
    for (const rec of records) {
      if (rec.studentId) {
        results.push(this.saveEmotion(rec, user));
      }
    }
    return results;
  }

  // --- LDSS Methods ---
  public getLdssRecords(studentId?: string, classId?: string): LdssRecord[] {
    if (!this.data.ldssRecords) this.data.ldssRecords = [];
    let list = this.data.ldssRecords;
    if (studentId) list = list.filter(l => l.studentId === studentId);
    if (classId) list = list.filter(l => l.classId === classId);
    return list;
  }

  public getLdssRecord(studentId: string): LdssRecord | undefined {
    if (!this.data.ldssRecords) this.data.ldssRecords = [];
    return this.data.ldssRecords.find(l => l.studentId === studentId);
  }

  public saveLdssRecord(data: Partial<LdssRecord>, user: User): LdssRecord {
    if (!this.data.ldssRecords) this.data.ldssRecords = [];
    const student = this.getStudentById(data.studentId || '');
    const studentName = student?.fullName || data.studentName || 'Siswa';
    const classId = student?.classId || data.classId || '';
    const className = student?.className || data.className || '';

    const existingIdx = this.data.ldssRecords.findIndex(l => l.studentId === data.studentId);
    let record: LdssRecord;

    if (existingIdx !== -1) {
      record = {
        ...this.data.ldssRecords[existingIdx],
        ...data,
      };
      this.data.ldssRecords[existingIdx] = record;
    } else {
      record = {
        id: `ldss-${Date.now()}`,
        studentId: data.studentId || '',
        studentName,
        classId,
        className,
        dateFilled: data.dateFilled || new Date().toISOString().split('T')[0],
        filledById: user.id,
        filledByName: user.name,
        filledByRole: user.roleTitle,
        status: data.status || 'Selesai',
        findingsSummary: data.findingsSummary || '',
        targetGoals: data.targetGoals || '',
        scores: data.scores || {
          motorikSensori: 4,
          komunikasiBahasa: 4,
          kognitifAkademik: 4,
          perilakuRegulasiEmosi: 3,
          interaksiSosial: 4,
          kemandirian: 4,
        },
        observationsNotes: data.observationsNotes || {},
        recommendedTier: data.recommendedTier || 'Tier 2',
        followUpRecommendations: data.followUpRecommendations || ['Supervisi'],
        documentDriveUrl: data.documentDriveUrl,
        principalCheckStatus: data.principalCheckStatus || 'Pending',
        inclusiveHeadCheckStatus: data.inclusiveHeadCheckStatus || 'Pending',
        notes: data.notes,
      };
      this.data.ldssRecords.unshift(record);
    }

    // Automatically update student tier recommendation if specified
    if (student && data.recommendedTier && student.currentTier !== data.recommendedTier) {
      this.updateStudent(student.id, { currentTier: data.recommendedTier }, user, 'Penyesuaian Tier dari hasil asesmen instrumen skrining LDSS');
    }

    this.addAuditLog({
      entityType: 'LDSS',
      entityId: record.id,
      actionType: existingIdx !== -1 ? 'UPDATE' : 'CREATE',
      description: `Menyimpan instrumen Skrining LDSS untuk ${studentName} (Status: ${record.status})`,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
    });

    this.save();
    return record;
  }

  // --- Supervisi Methods ---
  public getSupervisions(studentId?: string, role?: string, status?: string): SupervisionSchedule[] {
    if (!this.data.supervisions) this.data.supervisions = [];
    let list = this.data.supervisions;
    if (studentId) list = list.filter(s => s.studentId === studentId);
    if (role) list = list.filter(s => s.supervisorRole === role);
    if (status) list = list.filter(s => s.status === status);
    return list;
  }

  public saveSupervision(data: Partial<SupervisionSchedule>, user: User): SupervisionSchedule {
    if (!this.data.supervisions) this.data.supervisions = [];
    const student = this.getStudentById(data.studentId || '');
    const newSup: SupervisionSchedule = {
      id: `sup-${Date.now()}`,
      studentId: data.studentId || '',
      studentName: student?.fullName || data.studentName || 'Siswa',
      classId: student?.classId || data.classId || '',
      className: student?.className || data.className || '',
      teacherName: data.teacherName || 'Wali Kelas',
      supervisorRole: data.supervisorRole || 'Kepala Bidang Inklusif',
      supervisorName: data.supervisorName || (data.supervisorRole === 'Kepala Sekolah' ? 'Dr. Sari, M.Pd.' : 'M. Ghofar, M.Psi.'),
      scheduledDate: data.scheduledDate || new Date().toISOString().split('T')[0],
      time: data.time || '08:30',
      topic: data.topic || 'Supervisi perkembangan belajar & perilaku',
      status: data.status || 'Terjadwal',
      hasilSupervisi: data.hasilSupervisi,
      catatanTindakLanjut: data.catatanTindakLanjut,
      chekingKepalaSekolah: data.chekingKepalaSekolah || { status: 'Pending' },
      chekingKepalaBidangInklusif: data.chekingKepalaBidangInklusif || { status: 'Pending' },
    };
    this.data.supervisions.unshift(newSup);

    this.addAuditLog({
      entityType: 'SUPERVISION',
      entityId: newSup.id,
      actionType: 'CREATE',
      description: `Menjadwalkan supervisi ${newSup.supervisorRole} (${newSup.supervisorName}) untuk siswa ${newSup.studentName}`,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
    });

    this.save();
    return newSup;
  }

  public updateSupervision(id: string, updates: Partial<SupervisionSchedule>, user: User): SupervisionSchedule | null {
    if (!this.data.supervisions) this.data.supervisions = [];
    const idx = this.data.supervisions.findIndex(s => s.id === id);
    if (idx === -1) return null;

    const before = this.data.supervisions[idx];
    const updated: SupervisionSchedule = {
      ...before,
      ...updates,
      chekingKepalaSekolah: {
        ...before.chekingKepalaSekolah,
        ...(updates.chekingKepalaSekolah || {}),
      },
      chekingKepalaBidangInklusif: {
        ...before.chekingKepalaBidangInklusif,
        ...(updates.chekingKepalaBidangInklusif || {}),
      },
    };
    this.data.supervisions[idx] = updated;

    this.addAuditLog({
      entityType: 'SUPERVISION',
      entityId: id,
      actionType: 'UPDATE',
      description: `Memperbarui hasil/checking supervisi untuk siswa ${updated.studentName}`,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
    });

    this.save();
    return updated;
  }

  // --- Case Conference Methods ---
  public getCaseConferences(studentId?: string, status?: string): CaseConferenceRecord[] {
    if (!this.data.caseConferences) this.data.caseConferences = [];
    let list = this.data.caseConferences;
    if (studentId) list = list.filter(c => c.studentId === studentId);
    if (status) list = list.filter(c => c.status === status);
    return list;
  }

  public saveCaseConference(data: Partial<CaseConferenceRecord>, user: User): CaseConferenceRecord {
    if (!this.data.caseConferences) this.data.caseConferences = [];
    const student = this.getStudentById(data.studentId || '');
    const newConf: CaseConferenceRecord = {
      id: `cc-${Date.now()}`,
      studentId: data.studentId || '',
      studentName: student?.fullName || data.studentName || 'Siswa',
      classId: student?.classId || data.classId || '',
      className: student?.className || data.className || '',
      teacherName: data.teacherName || 'Wali Kelas',
      reasonForConference: data.reasonForConference || 'Rekomendasi tindak lanjut komprehensif',
      status: data.status || 'Direkomendasikan',
      scheduledDate: data.scheduledDate,
      scheduledTime: data.scheduledTime,
      location: data.location || 'Ruang Konseling Inklusif / Zoom',
      participants: data.participants || [
        'M. Ghofar, M.Psi. (Kabid Pendidikan Inklusif)',
        'Dr. Sari, M.Pd. (Kepala Sekolah)',
        'Ovnica Nitasari (Koordinator MTSS)',
        'Wali Kelas',
        'Orang Tua Siswa',
      ],
      previousAssessments: data.previousAssessments,
      draftBipTitle: data.draftBipTitle,
      agreedCommitments: data.agreedCommitments,
      minutesDecisions: data.minutesDecisions,
      followUpActions: data.followUpActions,
      recommendationDate: data.recommendationDate || new Date().toISOString().split('T')[0],
    };
    this.data.caseConferences.unshift(newConf);

    this.addAuditLog({
      entityType: 'CASE_CONFERENCE',
      entityId: newConf.id,
      actionType: 'CREATE',
      description: `Rekomendasi / Penjadwalan Case Conference untuk ${newConf.studentName}`,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
    });

    this.save();
    return newConf;
  }

  public updateCaseConference(id: string, updates: Partial<CaseConferenceRecord>, user: User): CaseConferenceRecord | null {
    if (!this.data.caseConferences) this.data.caseConferences = [];
    const idx = this.data.caseConferences.findIndex(c => c.id === id);
    if (idx === -1) return null;

    const before = this.data.caseConferences[idx];
    const updated: CaseConferenceRecord = {
      ...before,
      ...updates,
      previousAssessments: {
        ...before.previousAssessments,
        ...(updates.previousAssessments || {}),
      },
    };
    this.data.caseConferences[idx] = updated;

    this.addAuditLog({
      entityType: 'CASE_CONFERENCE',
      entityId: id,
      actionType: 'UPDATE',
      description: `Memperbarui status / komitmen Case Conference untuk ${updated.studentName} (${updated.status})`,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
    });

    this.save();
    return updated;
  }

  // --- Lazuardi Support Form Matrix ---
  public getLazuardiSupportRows(): LazuardiStudentSupportRow[] {
    if (this.data.lazuardiSupportRows && this.data.lazuardiSupportRows.length > 0) {
      return this.data.lazuardiSupportRows;
    }
    return [];
  }

  public updateLazuardiSupportRow(studentId: string, updates: Partial<LazuardiStudentSupportRow>, user: User): LazuardiStudentSupportRow | null {
    if (!this.data.lazuardiSupportRows) this.data.lazuardiSupportRows = [];
    const idx = this.data.lazuardiSupportRows.findIndex(r => r.studentId === studentId);
    if (idx === -1) return null;

    this.data.lazuardiSupportRows[idx] = {
      ...this.data.lazuardiSupportRows[idx],
      ...updates,
    };
    this.save();
    return this.data.lazuardiSupportRows[idx];
  }

  public getClasses(): MasterClass[] {
    return this.data.classes;
  }

  public getAuditLogs(): AuditLog[] {
    return this.data.auditLogs;
  }

  // --- Profil Pengguna & Simpan Nama ---
  public updateUserProfile(userId: string, name: string, roleTitle?: string): User | null {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) return null;
    const oldName = user.name;
    user.name = name;
    if (roleTitle) user.roleTitle = roleTitle;
    this.save();

    this.addAuditLog({
      entityType: 'USER',
      entityId: userId,
      actionType: 'UPDATE',
      description: `Menyimpan perubahan nama profil dari "${oldName}" menjadi "${name}"`,
      userId: user.id,
      userName: name,
      userRole: user.role,
    });

    return user;
  }

  // --- Hasil Kerja & Dokumen MTSS (Work Results Stored to Firebase) ---
  public getWorkResults(filters?: {
    studentId?: string;
    classId?: string;
    workType?: string;
    status?: string;
    search?: string;
  }): WorkResult[] {
    if (!this.data.workResults) {
      this.data.workResults = [];
    }

    // Seed default sample work results if empty
    if (this.data.workResults.length === 0) {
      this.data.workResults = [
        {
          id: 'wr-1',
          title: 'Evaluasi Intervensi Regulasi Sensori & Fokus Siswa Kinabalu',
          workType: 'intervensi_siswa',
          workTypeLabel: 'Catatan Intervensi & Hasil Belajar/Perilaku',
          authorName: 'Ibu Dewi Sartika, S.Pd.',
          authorRole: 'Wali Kelas 1 Kinabalu',
          authorId: 'usr-guru-1',
          studentId: 'stu-1',
          studentName: 'Ahmad Rafka Alfarizqi',
          classId: 'cls-1-kinabalu',
          className: '1 Kinabalu',
          date: '2026-10-18',
          time: '10:30',
          description: 'Pelaksanaan strategi sudut tenang (calm corner) dan sensory bottle sebelum aktivitas lembar kerja calistung.',
          outcomes: 'Siswa berhasil menyelesaikan tugas menulis 10 baris dengan jeda 1 kali tanpa tantrum. Durasi fokus meningkat dari 5 menit menjadi 14 menit.',
          followUpPlan: 'Lanjutkan penggunaan visual timer 15 menit dan berikan reward stiker bintang di akhir sesi.',
          status: 'Selesai',
          scoreOrRating: 'Kemajuan Signifikan (+60%)',
          tags: ['Tier 2', 'Regulasi Sensori', 'Calistung'],
          firebaseSynced: true,
          firebaseDocId: 'wr-1',
          createdAt: '2026-10-18T10:45:00Z',
          updatedAt: '2026-10-18T10:45:00Z',
        },
        {
          id: 'wr-2',
          title: 'Hasil Skrining Awal LDSS Dimensi Komunikasi & Bahasa 2 Yala',
          workType: 'skrining_ldss',
          workTypeLabel: 'Hasil Skrining & Pengamatan LDSS',
          authorName: 'Ovnica Nitasari, S.Psi.',
          authorRole: 'Koordinator Inklusif & MTSS',
          authorId: 'usr-mtss-1',
          studentId: 'stu-4',
          studentName: 'Fathan Arya Daniswara',
          classId: 'cls-2-yala',
          className: '2 Yala',
          date: '2026-10-19',
          time: '09:00',
          description: 'Observasi komprehensif 6 dimensi LDSS saat aktivitas bercerita di kelas dan interaksi makan bersama.',
          outcomes: 'Terindikasi hambatan artikulasi fonem /r/ dan /s/ serta kesulitan memahami instruksi kompleks 3 tahap.',
          followUpPlan: 'Jadwalkan supervisi lanjutan bersama Pak M. Ghofar, M.Psi. dan susun draft rujukan terapi wicara.',
          status: 'Ditinjau Pimpinan',
          scoreOrRating: 'Skor LDSS: 38 (Perlu Intervensi Tier 2)',
          tags: ['LDSS', 'Tier 2', 'Bahasa & Wicara'],
          firebaseSynced: true,
          firebaseDocId: 'wr-2',
          createdAt: '2026-10-19T09:40:00Z',
          updatedAt: '2026-10-19T09:40:00Z',
        },
        {
          id: 'wr-3',
          title: 'Notulensi & Rekomendasi Case Conference Dukungan Terpadu',
          workType: 'case_conference',
          workTypeLabel: 'Rekomendasi / Notulensi Case Conference',
          authorName: 'M. Ghofar, M.Psi.',
          authorRole: 'Kepala Bidang Inklusif',
          authorId: 'usr-counselor-1',
          studentId: 'stu-5',
          studentName: 'Nadia Putri Shafira',
          classId: 'cls-3-tongariro',
          className: '3 Tongariro',
          date: '2026-10-19',
          time: '13:00',
          description: 'Pembahasan perkembangan siswa bersama orang tua, psikolog klinis, dokter spesialis anak, dan tim guru paralel.',
          outcomes: 'Disepakati pembuatan Individualized Education Program (IEP) gabungan untuk aspek regulasi emosi dan akomodasi waktu ujian.',
          followUpPlan: 'Pengisian log CICO 21 hari berturut-turut oleh wali kelas dan sesi evaluasi mingguan di ruang konseling.',
          status: 'Disetujui',
          scoreOrRating: 'Kesepakatan Tercapai (100%)',
          tags: ['Case Conference', 'Tier 3', 'IEP Disetujui'],
          firebaseSynced: true,
          firebaseDocId: 'wr-3',
          createdAt: '2026-10-19T14:15:00Z',
          updatedAt: '2026-10-19T14:15:00Z',
        },
      ];
      this.save();
    }

    let list = [...this.data.workResults];

    if (filters?.studentId) {
      list = list.filter(w => w.studentId === filters.studentId);
    }
    if (filters?.classId) {
      list = list.filter(w => w.classId === filters.classId);
    }
    if (filters?.workType) {
      list = list.filter(w => w.workType === filters.workType);
    }
    if (filters?.status) {
      list = list.filter(w => w.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        w =>
          w.title.toLowerCase().includes(q) ||
          w.authorName.toLowerCase().includes(q) ||
          (w.studentName && w.studentName.toLowerCase().includes(q)) ||
          w.description.toLowerCase().includes(q) ||
          w.outcomes.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getWorkResultById(id: string): WorkResult | undefined {
    if (!this.data.workResults) this.data.workResults = [];
    return this.data.workResults.find(w => w.id === id);
  }

  public createWorkResult(data: Partial<WorkResult>, user: User): WorkResult {
    if (!this.data.workResults) this.data.workResults = [];

    const newWork: WorkResult = {
      id: data.id || `wr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: data.title || 'Catatan Hasil Kerja Baru',
      workType: data.workType || 'intervensi_siswa',
      workTypeLabel: data.workTypeLabel || 'Hasil Kerja & Tindak Lanjut Siswa',
      authorName: data.authorName || user.name,
      authorRole: data.authorRole || user.roleTitle,
      authorId: data.authorId || user.id,
      studentId: data.studentId || undefined,
      studentName: data.studentName || undefined,
      classId: data.classId || undefined,
      className: data.className || undefined,
      date: data.date || new Date().toISOString().split('T')[0],
      time: data.time || new Date().toTimeString().slice(0, 5),
      description: data.description || '',
      outcomes: data.outcomes || '',
      followUpPlan: data.followUpPlan || '',
      status: data.status || 'Selesai',
      scoreOrRating: data.scoreOrRating || undefined,
      tags: data.tags || ['MTSS', 'Hasil Kerja'],
      firebaseSynced: data.firebaseSynced ?? true,
      firebaseDocId: data.firebaseDocId || data.id,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.workResults.unshift(newWork);

    this.addAuditLog({
      entityType: 'STUDENT',
      entityId: newWork.id,
      actionType: 'CREATE',
      description: `Menyimpan Hasil Kerja "${newWork.title}" oleh ${newWork.authorName} ke Firebase & Database`,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
    });

    this.save();
    return newWork;
  }

  public updateWorkResult(id: string, updates: Partial<WorkResult>, user: User): WorkResult | null {
    if (!this.data.workResults) this.data.workResults = [];
    const idx = this.data.workResults.findIndex(w => w.id === id);
    if (idx === -1) return null;

    const before = this.data.workResults[idx];
    const updated: WorkResult = {
      ...before,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.data.workResults[idx] = updated;

    this.addAuditLog({
      entityType: 'STUDENT',
      entityId: id,
      actionType: 'UPDATE',
      description: `Memperbarui Hasil Kerja "${updated.title}" oleh ${updated.authorName}`,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
    });

    this.save();
    return updated;
  }

  public deleteWorkResult(id: string, user: User): boolean {
    if (!this.data.workResults) return false;
    const idx = this.data.workResults.findIndex(w => w.id === id);
    if (idx === -1) return false;

    const deleted = this.data.workResults.splice(idx, 1)[0];

    this.addAuditLog({
      entityType: 'STUDENT',
      entityId: id,
      actionType: 'DELETE',
      description: `Menghapus Dokumen Hasil Kerja "${deleted.title}"`,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
    });

    this.save();
    return true;
  }
}

export const db = new Database();

