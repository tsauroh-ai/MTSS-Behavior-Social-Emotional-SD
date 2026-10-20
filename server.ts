import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/server/db.js';
import { User, UserRole } from './src/types/index.js';

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper middleware to get current user from headers or default to guru
function getAuthUser(req: Request): User {
  const userId = (req.headers['x-user-id'] as string) || 'usr-guru-1';
  const user = db.getUserById(userId);
  if (user) return user;
  return db.getUsers()[0];
}

// --- Health Check ---
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Auth Endpoints ---
app.get('/api/auth/users', (req: Request, res: Response) => {
  res.json(db.getUsers());
});

app.post('/api/auth/users', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Hanya Admin yang dapat membuat akun pengguna' });
  }
  const created = db.createUser(req.body, user);
  res.status(201).json(created);
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  res.json(user);
});

// Update profile / Simpan Nama Pengguna
app.put('/api/auth/profile', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const { name, roleTitle } = req.body;
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Nama pengguna wajib diisi' });
  }
  const updated = db.updateUserProfile(user.id, name.trim(), roleTitle?.trim());
  if (!updated) {
    return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
  }
  res.json(updated);
});

// --- Students Endpoints ---

app.get('/api/students', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const classId = req.query.classId as string | undefined;
  const tier = req.query.tier as string | undefined;
  const search = req.query.search as string | undefined;

  let students = db.getStudents(user);

  if (classId) {
    students = students.filter(s => s.classId === classId);
  }
  if (tier) {
    students = students.filter(s => s.currentTier === tier);
  }
  if (search) {
    const q = search.toLowerCase();
    students = students.filter(s => s.fullName.toLowerCase().includes(q) || s.nisn.includes(q) || s.nickname.toLowerCase().includes(q));
  }

  res.json(students);
});

app.get('/api/students/:id', (req: Request, res: Response) => {
  const student = db.getStudentById(req.params.id);
  if (!student) {
    return res.status(404).json({ error: 'Siswa tidak ditemukan' });
  }
  res.json(student);
});

app.post('/api/students', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (user.role !== 'admin' && user.role !== 'koordinator_mtss') {
    return res.status(403).json({ error: 'Hanya Admin atau Koordinator MTSS yang dapat menambah data siswa' });
  }
  const created = db.createStudent(req.body, user);
  res.status(201).json(created);
});

app.put('/api/students/:id', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const { reason, ...updates } = req.body;
  const updated = db.updateStudent(req.params.id, updates, user, reason);
  if (!updated) {
    return res.status(404).json({ error: 'Siswa tidak ditemukan' });
  }
  res.json(updated);
});

// --- Behavior Observations ---
app.get('/api/behavior-observations', (req: Request, res: Response) => {
  const studentId = req.query.studentId as string | undefined;
  const classId = req.query.classId as string | undefined;
  const obs = db.getBehaviorObservations(studentId, classId);
  res.json(obs);
});

app.post('/api/behavior-observations', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const created = db.createBehaviorObservation(req.body, user);
  res.status(201).json(created);
});

// --- Social Emotional Observations ---
app.get('/api/social-emotional-observations', (req: Request, res: Response) => {
  const studentId = req.query.studentId as string | undefined;
  const classId = req.query.classId as string | undefined;
  const obs = db.getSocialEmotionalObservations(studentId, classId);
  res.json(obs);
});

app.post('/api/social-emotional-observations', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const created = db.createSocialEmotionalObservation(req.body, user);
  res.status(201).json(created);
});

// --- Support Plans ---
app.get('/api/support-plans', (req: Request, res: Response) => {
  const studentId = req.query.studentId as string | undefined;
  const plans = db.getSupportPlans(studentId);
  res.json(plans);
});

app.post('/api/support-plans', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const created = db.createSupportPlan(req.body, user);
  res.status(201).json(created);
});

app.put('/api/support-plans/:id', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const { reason, ...updates } = req.body;
  const updated = db.updateSupportPlan(req.params.id, updates, user, reason);
  if (!updated) {
    return res.status(404).json({ error: 'Rencana dukungan tidak ditemukan' });
  }
  res.json(updated);
});

// --- Intervention Logs ---
app.get('/api/intervention-logs', (req: Request, res: Response) => {
  const studentId = req.query.studentId as string | undefined;
  const planId = req.query.planId as string | undefined;
  const logs = db.getInterventionLogs(studentId, planId);
  res.json(logs);
});

app.post('/api/intervention-logs', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const created = db.createInterventionLog(req.body, user);
  res.status(201).json(created);
});

// --- Progress Records ---
app.get('/api/progress-records', (req: Request, res: Response) => {
  const studentId = req.query.studentId as string | undefined;
  const records = db.getProgressRecords(studentId);
  res.json(records);
});

app.post('/api/progress-records', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const created = db.createProgressRecord(req.body, user);
  res.status(201).json(created);
});

// --- Follow Ups ---
app.get('/api/follow-ups', (req: Request, res: Response) => {
  const studentId = req.query.studentId as string | undefined;
  const list = db.getFollowUps(studentId);
  res.json(list);
});

app.post('/api/follow-ups', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const created = db.createFollowUp(req.body, user);
  res.status(201).json(created);
});

app.put('/api/follow-ups/:id', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const updated = db.updateFollowUp(req.params.id, req.body, user);
  if (!updated) {
    return res.status(404).json({ error: 'Tindak lanjut tidak ditemukan' });
  }
  res.json(updated);
});

// --- MTSS Reviews ---
app.get('/api/mtss-reviews', (req: Request, res: Response) => {
  const studentId = req.query.studentId as string | undefined;
  const reviews = db.getMtssReviews(studentId);
  res.json(reviews);
});

app.post('/api/mtss-reviews', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const created = db.createMtssReview(req.body, user);
  res.status(201).json(created);
});

// --- Emotion Check-in & Check-out Endpoints ---
app.get('/api/emotions', (req: Request, res: Response) => {
  const studentId = req.query.studentId as string | undefined;
  const classId = req.query.classId as string | undefined;
  const date = req.query.date as string | undefined;
  const list = db.getEmotions(studentId, classId, date);
  res.json(list);
});

app.post('/api/emotions', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const saved = db.saveEmotion(req.body, user);
  res.status(201).json(saved);
});

app.post('/api/emotions/batch', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const records = req.body.records || [];
  const saved = db.batchSaveEmotions(records, user);
  res.status(201).json(saved);
});

// --- LDSS Endpoints ---
app.get('/api/ldss', (req: Request, res: Response) => {
  const studentId = req.query.studentId as string | undefined;
  const classId = req.query.classId as string | undefined;
  const list = db.getLdssRecords(studentId, classId);
  res.json(list);
});

app.get('/api/ldss/:studentId', (req: Request, res: Response) => {
  const record = db.getLdssRecord(req.params.studentId);
  res.json(record || null);
});

app.post('/api/ldss', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const saved = db.saveLdssRecord(req.body, user);
  res.status(201).json(saved);
});

// --- Supervisi Endpoints ---
app.get('/api/supervisions', (req: Request, res: Response) => {
  const studentId = req.query.studentId as string | undefined;
  const role = req.query.role as string | undefined;
  const status = req.query.status as string | undefined;
  const list = db.getSupervisions(studentId, role, status);
  res.json(list);
});

app.post('/api/supervisions', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const saved = db.saveSupervision(req.body, user);
  res.status(201).json(saved);
});

app.put('/api/supervisions/:id', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const updated = db.updateSupervision(req.params.id, req.body, user);
  if (!updated) return res.status(404).json({ error: 'Jadwal supervisi tidak ditemukan' });
  res.json(updated);
});

// --- Case Conference Endpoints ---
app.get('/api/case-conferences', (req: Request, res: Response) => {
  const studentId = req.query.studentId as string | undefined;
  const status = req.query.status as string | undefined;
  const list = db.getCaseConferences(studentId, status);
  res.json(list);
});

app.post('/api/case-conferences', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const saved = db.saveCaseConference(req.body, user);
  res.status(201).json(saved);
});

app.put('/api/case-conferences/:id', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const updated = db.updateCaseConference(req.params.id, req.body, user);
  if (!updated) return res.status(404).json({ error: 'Data case conference tidak ditemukan' });
  res.json(updated);
});

// --- Lazuardi Support Form Matrix Endpoints ---
app.get('/api/lazuardi/support-rows', (req: Request, res: Response) => {
  res.json(db.getLazuardiSupportRows());
});

app.put('/api/lazuardi/support-rows/:studentId', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const updated = db.updateLazuardiSupportRow(req.params.studentId, req.body, user);
  if (!updated) return res.status(404).json({ error: 'Data siswa support tidak ditemukan' });
  res.json(updated);
});

// --- Hasil Kerja & Dokumen MTSS (Work Results Stored to Firebase) ---
app.get('/api/work-results', (req: Request, res: Response) => {
  const studentId = req.query.studentId as string | undefined;
  const classId = req.query.classId as string | undefined;
  const workType = req.query.workType as string | undefined;
  const status = req.query.status as string | undefined;
  const search = req.query.search as string | undefined;

  const results = db.getWorkResults({
    studentId,
    classId,
    workType,
    status,
    search,
  });
  res.json(results);
});

app.get('/api/work-results/:id', (req: Request, res: Response) => {
  const result = db.getWorkResultById(req.params.id);
  if (!result) return res.status(404).json({ error: 'Hasil kerja tidak ditemukan' });
  res.json(result);
});

app.post('/api/work-results', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const created = db.createWorkResult(req.body, user);
  res.status(201).json(created);
});

app.put('/api/work-results/:id', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const updated = db.updateWorkResult(req.params.id, req.body, user);
  if (!updated) return res.status(404).json({ error: 'Hasil kerja tidak ditemukan' });
  res.json(updated);
});

app.delete('/api/work-results/:id', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const success = db.deleteWorkResult(req.params.id, user);
  if (!success) return res.status(404).json({ error: 'Hasil kerja tidak ditemukan' });
  res.json({ success: true });
});

// --- Master Data & Config ---

app.get('/api/classes', (req: Request, res: Response) => {
  res.json(db.getClasses());
});

app.get('/api/indicator-groups', (req: Request, res: Response) => {
  res.json(db.getIndicatorGroups());
});

app.get('/api/strategies', (req: Request, res: Response) => {
  res.json(db.getStrategies());
});

app.post('/api/strategies', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const created = db.addStrategy(req.body, user);
  res.status(201).json(created);
});

app.get('/api/config', (req: Request, res: Response) => {
  res.json(db.getConfig());
});

app.get('/api/config/rules', (req: Request, res: Response) => {
  const rules = [
    {
      id: 'rule-beh-freq',
      name: 'Frekuensi Observasi Behavior Tinggi',
      description: 'Menandai siswa jika terdapat ≥ 3 catatan observasi perilaku dengan dampak pembelajaran dalam rentang 30 hari.',
      suggestedFlagReason: 'Teramati ≥ 3 insiden perilaku dalam 30 hari terakhir yang memerlukan review tim.',
      isActive: true,
      thresholdValue: 3,
    },
    {
      id: 'rule-se-scale',
      name: 'Indikator Social-Emotional Belum Terlihat',
      description: 'Menandai siswa jika terdapat ≥ 2 indikator kompetensi CASEL bernilai "Belum Terlihat" pada siklus asesmen.',
      suggestedFlagReason: 'Terdapat ≥ 2 indikator sosial-emosional dalam skala "Belum Terlihat" yang membutuhkan penguatan bertarget.',
      isActive: true,
      thresholdValue: 2,
    },
    {
      id: 'rule-plan-review',
      name: 'Jatuh Tempo Review Rencana Dukungan',
      description: 'Menandai siswa yang memiliki Support Plan aktif yang telah mencapai atau melewati target review date.',
      suggestedFlagReason: 'Rencana dukungan MTSS telah mencapai tanggal jatuh tempo evaluasi kemajuan.',
      isActive: true,
      thresholdValue: 0,
    },
  ];
  res.json(rules);
});

app.put('/api/config', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Hanya Admin yang dapat mengubah konfigurasi sistem' });
  }
  const updated = db.updateConfig(req.body, user);
  res.json(updated);
});

app.get('/api/audit-logs', (req: Request, res: Response) => {
  res.json(db.getAuditLogs());
});

// --- Dashboard Aggregates ---
app.get('/api/dashboard/stats', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const students = db.getStudents(user);
  const allStudents = db.getStudents();
  const allPlans = db.getSupportPlans();
  const allBeh = db.getBehaviorObservations();
  const allSe = db.getSocialEmotionalObservations();
  const allFollowUps = db.getFollowUps();

  const tier1Count = allStudents.filter(s => s.currentTier === 'Tier 1').length;
  const tier2Count = allStudents.filter(s => s.currentTier === 'Tier 2').length;
  const tier3Count = allStudents.filter(s => s.currentTier === 'Tier 3').length;

  const activePlans = allPlans.filter(p => p.status === 'Active');
  const reviewNeededStudents = allStudents.filter(s => s.needsReviewFlag);
  const pendingFollowUps = allFollowUps.filter(f => f.status === 'Pending' || f.status === 'In Progress');

  // Role-specific stats
  const userStudents = user.role === 'guru' ? students : allStudents;
  const userRecentBeh = allBeh.slice(0, 5);
  const userRecentSe = allSe.slice(0, 5);

  res.json({
    totalMonitored: userStudents.length,
    tierDistribution: {
      tier1: tier1Count,
      tier2: tier2Count,
      tier3: tier3Count,
    },
    activePlansCount: activePlans.length,
    reviewNeededCount: reviewNeededStudents.length,
    pendingFollowUpsCount: pendingFollowUps.length,
    recentBehaviorObs: userRecentBeh,
    recentSeObs: userRecentSe,
    reviewNeededList: reviewNeededStudents.slice(0, 6),
  });
});

// --- Vite Middleware Integration ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MTSS Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
