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
  ReviewThresholdRule,
  EmotionRecord,
  LdssRecord,
  SupervisionSchedule,
  CaseConferenceRecord,
  LazuardiStudentSupportRow,
  WorkResult,
} from '../types';


let currentUserId = 'usr-guru-1';

export function setCurrentApiUserId(id: string) {
  currentUserId = id;
}

export function getCurrentApiUserId(): string {
  return currentUserId;
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    'x-user-id': currentUserId,
    ...(options.headers || {}),
  };

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export const api = {
  // Auth
  getUsers: () => request<User[]>('/api/auth/users'),
  createUser: (data: Partial<User>) => request<User>('/api/auth/users', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request<User>('/api/auth/me'),

  // Students
  getStudents: (params?: { classId?: string; tier?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.classId) q.append('classId', params.classId);
    if (params?.tier) q.append('tier', params.tier);
    if (params?.search) q.append('search', params.search);
    const queryStr = q.toString() ? `?${q.toString()}` : '';
    return request<Student[]>(`/api/students${queryStr}`);
  },
  getStudent: (id: string) => request<Student>(`/api/students/${id}`),
  createStudent: (data: Partial<Student>) => request<Student>('/api/students', { method: 'POST', body: JSON.stringify(data) }),
  updateStudent: (id: string, updates: Partial<Student> & { reason?: string }) =>
    request<Student>(`/api/students/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),

  // Behavior Observations
  getBehaviorObservations: (params?: { studentId?: string; classId?: string }) => {
    const q = new URLSearchParams();
    if (params?.studentId) q.append('studentId', params.studentId);
    if (params?.classId) q.append('classId', params.classId);
    const queryStr = q.toString() ? `?${q.toString()}` : '';
    return request<BehaviorObservation[]>(`/api/behavior-observations${queryStr}`);
  },
  createBehaviorObservation: (data: Partial<BehaviorObservation>) =>
    request<BehaviorObservation>('/api/behavior-observations', { method: 'POST', body: JSON.stringify(data) }),

  // Social Emotional Observations
  getSocialEmotionalObservations: (params?: { studentId?: string; classId?: string }) => {
    const q = new URLSearchParams();
    if (params?.studentId) q.append('studentId', params.studentId);
    if (params?.classId) q.append('classId', params.classId);
    const queryStr = q.toString() ? `?${q.toString()}` : '';
    return request<SocialEmotionalObservation[]>(`/api/social-emotional-observations${queryStr}`);
  },
  createSocialEmotionalObservation: (data: Partial<SocialEmotionalObservation>) =>
    request<SocialEmotionalObservation>('/api/social-emotional-observations', { method: 'POST', body: JSON.stringify(data) }),

  // Support Plans
  getSupportPlans: (studentId?: string) => {
    const queryStr = studentId ? `?studentId=${studentId}` : '';
    return request<SupportPlan[]>(`/api/support-plans${queryStr}`);
  },
  createSupportPlan: (data: Partial<SupportPlan>) =>
    request<SupportPlan>('/api/support-plans', { method: 'POST', body: JSON.stringify(data) }),
  updateSupportPlan: (id: string, updates: Partial<SupportPlan> & { reason?: string }) =>
    request<SupportPlan>(`/api/support-plans/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),

  // Intervention Logs
  getInterventionLogs: (params?: { studentId?: string; planId?: string }) => {
    const q = new URLSearchParams();
    if (params?.studentId) q.append('studentId', params.studentId);
    if (params?.planId) q.append('planId', params.planId);
    const queryStr = q.toString() ? `?${q.toString()}` : '';
    return request<InterventionLog[]>(`/api/intervention-logs${queryStr}`);
  },
  createInterventionLog: (data: Partial<InterventionLog>) =>
    request<InterventionLog>('/api/intervention-logs', { method: 'POST', body: JSON.stringify(data) }),

  // Progress Records
  getProgressRecords: (studentId?: string) => {
    const queryStr = studentId ? `?studentId=${studentId}` : '';
    return request<ProgressMonitoringRecord[]>(`/api/progress-records${queryStr}`);
  },
  createProgressRecord: (data: Partial<ProgressMonitoringRecord>) =>
    request<ProgressMonitoringRecord>('/api/progress-records', { method: 'POST', body: JSON.stringify(data) }),

  // Follow Ups
  getFollowUps: (studentId?: string) => {
    const queryStr = studentId ? `?studentId=${studentId}` : '';
    return request<FollowUp[]>(`/api/follow-ups${queryStr}`);
  },
  createFollowUp: (data: Partial<FollowUp>) =>
    request<FollowUp>('/api/follow-ups', { method: 'POST', body: JSON.stringify(data) }),
  updateFollowUp: (id: string, updates: Partial<FollowUp>) =>
    request<FollowUp>(`/api/follow-ups/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),

  // MTSS Reviews
  getMtssReviews: (studentId?: string) => {
    const queryStr = studentId ? `?studentId=${studentId}` : '';
    return request<MtssReview[]>(`/api/mtss-reviews${queryStr}`);
  },
  createMtssReview: (data: Partial<MtssReview>) =>
    request<MtssReview>('/api/mtss-reviews', { method: 'POST', body: JSON.stringify(data) }),

  // Master Data & Config
  getClasses: () => request<MasterClass[]>('/api/classes'),
  getIndicatorGroups: () => request<MasterIndicatorGroup[]>('/api/indicator-groups'),
  getStrategies: () => request<MasterStrategy[]>('/api/strategies'),
  createStrategy: (data: Partial<MasterStrategy>) =>
    request<MasterStrategy>('/api/strategies', { method: 'POST', body: JSON.stringify(data) }),
  getThresholdRules: () => request<ReviewThresholdRule[]>('/api/config/rules'),
  getConfig: () => request<SystemConfig>('/api/config'),
  updateConfig: (data: Partial<SystemConfig>) =>
    request<SystemConfig>('/api/config', { method: 'PUT', body: JSON.stringify(data) }),
  getAuditLogs: () => request<AuditLog[]>('/api/audit-logs'),

  // Emotion Check-In & Check-Out
  getEmotions: (params?: { studentId?: string; classId?: string; date?: string }) => {
    const q = new URLSearchParams();
    if (params?.studentId) q.append('studentId', params.studentId);
    if (params?.classId) q.append('classId', params.classId);
    if (params?.date) q.append('date', params.date);
    const queryStr = q.toString() ? `?${q.toString()}` : '';
    return request<EmotionRecord[]>(`/api/emotions${queryStr}`);
  },
  saveEmotion: (data: Partial<EmotionRecord>) =>
    request<EmotionRecord>('/api/emotions', { method: 'POST', body: JSON.stringify(data) }),
  batchSaveEmotions: (records: Partial<EmotionRecord>[]) =>
    request<EmotionRecord[]>('/api/emotions/batch', { method: 'POST', body: JSON.stringify({ records }) }),

  // LDSS (Lazuardi Disability Screening System)
  getLdssRecords: (params?: { studentId?: string; classId?: string }) => {
    const q = new URLSearchParams();
    if (params?.studentId) q.append('studentId', params.studentId);
    if (params?.classId) q.append('classId', params.classId);
    const queryStr = q.toString() ? `?${q.toString()}` : '';
    return request<LdssRecord[]>(`/api/ldss${queryStr}`);
  },
  getLdssRecord: (studentId: string) => request<LdssRecord | null>(`/api/ldss/${studentId}`),
  saveLdssRecord: (data: Partial<LdssRecord>) =>
    request<LdssRecord>('/api/ldss', { method: 'POST', body: JSON.stringify(data) }),

  // Supervisi Kepala Sekolah & Kepala Bidang Inklusif
  getSupervisions: (params?: { studentId?: string; role?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.studentId) q.append('studentId', params.studentId);
    if (params?.role) q.append('role', params.role);
    if (params?.status) q.append('status', params.status);
    const queryStr = q.toString() ? `?${q.toString()}` : '';
    return request<SupervisionSchedule[]>(`/api/supervisions${queryStr}`);
  },
  saveSupervision: (data: Partial<SupervisionSchedule>) =>
    request<SupervisionSchedule>('/api/supervisions', { method: 'POST', body: JSON.stringify(data) }),
  updateSupervision: (id: string, updates: Partial<SupervisionSchedule>) =>
    request<SupervisionSchedule>(`/api/supervisions/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),

  // Case Conferences
  getCaseConferences: (params?: { studentId?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.studentId) q.append('studentId', params.studentId);
    if (params?.status) q.append('status', params.status);
    const queryStr = q.toString() ? `?${q.toString()}` : '';
    return request<CaseConferenceRecord[]>(`/api/case-conferences${queryStr}`);
  },
  saveCaseConference: (data: Partial<CaseConferenceRecord>) =>
    request<CaseConferenceRecord>('/api/case-conferences', { method: 'POST', body: JSON.stringify(data) }),
  updateCaseConference: (id: string, updates: Partial<CaseConferenceRecord>) =>
    request<CaseConferenceRecord>(`/api/case-conferences/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),

  // Lazuardi GCS Support Matrix
  getLazuardiSupportRows: () => request<LazuardiStudentSupportRow[]>('/api/lazuardi/support-rows'),
  updateLazuardiSupportRow: (studentId: string, updates: Partial<LazuardiStudentSupportRow>) =>
    request<LazuardiStudentSupportRow>(`/api/lazuardi/support-rows/${studentId}`, { method: 'PUT', body: JSON.stringify(updates) }),

  // Hasil Kerja & Dokumen MTSS (Work Results Stored to Firebase)
  getWorkResults: (params?: { studentId?: string; classId?: string; workType?: string; status?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.studentId) q.append('studentId', params.studentId);
    if (params?.classId) q.append('classId', params.classId);
    if (params?.workType) q.append('workType', params.workType);
    if (params?.status) q.append('status', params.status);
    if (params?.search) q.append('search', params.search);
    const queryStr = q.toString() ? `?${q.toString()}` : '';
    return request<WorkResult[]>(`/api/work-results${queryStr}`);
  },
  getWorkResult: (id: string) => request<WorkResult>(`/api/work-results/${id}`),
  saveWorkResult: (data: Partial<WorkResult>) =>
    request<WorkResult>('/api/work-results', { method: 'POST', body: JSON.stringify(data) }),
  updateWorkResult: (id: string, updates: Partial<WorkResult>) =>
    request<WorkResult>(`/api/work-results/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  deleteWorkResult: (id: string) =>
    request<{ success: boolean }>(`/api/work-results/${id}`, { method: 'DELETE' }),

  // Simpan Nama / Update Profil Pengguna
  updateProfileName: (name: string, roleTitle?: string) =>
    request<User>('/api/auth/profile', { method: 'PUT', body: JSON.stringify({ name, roleTitle }) }),

  // Dashboard stats
  getDashboardStats: () => request<any>('/api/dashboard/stats'),
};

