import {
  db,
  collection,
  doc,
  setDoc,
  getDocs,
  getDocFromServer,
  deleteDoc,
  onSnapshot,
  firebaseConfig,
} from './firebase';
import { api } from './api';
import { Student, EmotionRecord, LdssRecord, SupervisionSchedule, CaseConferenceRecord, User, WorkResult } from '../types';

export interface SyncStatus {
  isSyncing: boolean;
  lastSyncedAt: string | null;
  syncedCounts: {
    students: number;
    emotions: number;
    ldss: number;
    supervisions: number;
    caseConferences: number;
    workResults: number;
    users: number;
  };
  error: string | null;
}

let syncStatus: SyncStatus = {
  isSyncing: false,
  lastSyncedAt: null,
  syncedCounts: {
    students: 0,
    emotions: 0,
    ldss: 0,
    supervisions: 0,
    caseConferences: 0,
    workResults: 0,
    users: 0,
  },
  error: null,
};


const listeners: ((status: SyncStatus) => void)[] = [];

export function subscribeSyncStatus(listener: (status: SyncStatus) => void) {
  listeners.push(listener);
  listener(syncStatus);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

function notifyListeners() {
  listeners.forEach(fn => fn({ ...syncStatus }));
}

/**
 * Upload all current local database records into Cloud Firestore (mtss-a23e4)
 */
export async function pushLocalToFirestore(): Promise<SyncStatus> {
  syncStatus.isSyncing = true;
  syncStatus.error = null;
  notifyListeners();

  try {
    const [students, emotions, ldssList, supervisions, caseConferences, workResults, users] = await Promise.all([
      api.getStudents(),
      api.getEmotions(),
      api.getLdssRecords(),
      api.getSupervisions(),
      api.getCaseConferences(),
      api.getWorkResults(),
      api.getUsers(),
    ]);

    // Push Students to Firestore
    const studentPromises = students.map(student =>
      setDoc(doc(db, 'students', student.id), {
        ...student,
        updatedAt: new Date().toISOString(),
      }, { merge: true })
    );

    // Push Emotions to Firestore
    const emotionPromises = emotions.map(emotion =>
      setDoc(doc(db, 'emotions', emotion.id), {
        ...emotion,
        updatedAt: new Date().toISOString(),
      }, { merge: true })
    );

    // Push LDSS to Firestore
    const ldssPromises = ldssList.map(ldss =>
      setDoc(doc(db, 'ldss_records', ldss.id), {
        ...ldss,
        updatedAt: new Date().toISOString(),
      }, { merge: true })
    );

    // Push Supervisions to Firestore
    const supPromises = supervisions.map(sup =>
      setDoc(doc(db, 'supervisions', sup.id), {
        ...sup,
        updatedAt: new Date().toISOString(),
      }, { merge: true })
    );

    // Push Case Conferences to Firestore
    const ccPromises = caseConferences.map(cc =>
      setDoc(doc(db, 'case_conferences', cc.id), {
        ...cc,
        updatedAt: new Date().toISOString(),
      }, { merge: true })
    );

    // Push Work Results to Firestore
    const workPromises = workResults.map(work =>
      setDoc(doc(db, 'work_results', work.id), {
        ...work,
        firebaseSynced: true,
        updatedAt: new Date().toISOString(),
      }, { merge: true })
    );

    // Push Users to Firestore
    const userPromises = users.map(user =>
      setDoc(doc(db, 'users', user.id), {
        ...user,
        updatedAt: new Date().toISOString(),
      }, { merge: true })
    );

    await Promise.all([
      ...studentPromises,
      ...emotionPromises,
      ...ldssPromises,
      ...supPromises,
      ...ccPromises,
      ...workPromises,
      ...userPromises,
    ]);

    syncStatus = {
      isSyncing: false,
      lastSyncedAt: new Date().toLocaleTimeString('id-ID'),
      syncedCounts: {
        students: students.length,
        emotions: emotions.length,
        ldss: ldssList.length,
        supervisions: supervisions.length,
        caseConferences: caseConferences.length,
        workResults: workResults.length,
        users: users.length,
      },
      error: null,
    };
  } catch (err: any) {
    console.error('Failed to sync to Firestore:', err);
    syncStatus = {
      ...syncStatus,
      isSyncing: false,
      error: err.message || 'Gagal menyinkronkan dengan Firestore',
    };
  }

  notifyListeners();
  return syncStatus;
}

/**
 * Direct write of a Work Result document to Cloud Firestore
 */
export async function saveWorkResultToFirestore(work: WorkResult): Promise<{ docId: string; success: boolean }> {
  try {
    const docRef = doc(db, 'work_results', work.id);
    const payload = {
      ...work,
      firebaseSynced: true,
      firebaseDocId: work.id,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(docRef, payload, { merge: true });
    return { docId: work.id, success: true };
  } catch (err) {
    console.warn('Direct Firestore save failed, fallback to local sync:', err);
    return { docId: work.id, success: false };
  }
}

/**
 * Delete a Work Result document from Cloud Firestore
 */
export async function deleteWorkResultFromFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'work_results', id));
  } catch (err) {
    console.warn('Failed to delete work result from Firestore:', err);
  }
}

/**
 * Save user name to Cloud Firestore in the users collection
 */
export async function saveUserNameToFirestore(userId: string, name: string, roleTitle?: string): Promise<boolean> {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      id: userId,
      name,
      ...(roleTitle ? { roleTitle } : {}),
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn('Failed to save user name to Firestore:', err);
    return false;
  }
}

/**
 * Fetch records from Cloud Firestore (mtss-a23e4)
 */
export async function fetchFromFirestore(): Promise<{
  students: any[];
  emotions: any[];
  ldss: any[];
  supervisions: any[];
  caseConferences: any[];
  workResults: any[];
}> {
  const [studentsSnap, emotionsSnap, ldssSnap, supSnap, ccSnap, workSnap] = await Promise.all([
    getDocs(collection(db, 'students')),
    getDocs(collection(db, 'emotions')),
    getDocs(collection(db, 'ldss_records')),
    getDocs(collection(db, 'supervisions')),
    getDocs(collection(db, 'case_conferences')),
    getDocs(collection(db, 'work_results')),
  ]);

  return {
    students: studentsSnap.docs.map(d => d.data()),
    emotions: emotionsSnap.docs.map(d => d.data()),
    ldss: ldssSnap.docs.map(d => d.data()),
    supervisions: supSnap.docs.map(d => d.data()),
    caseConferences: ccSnap.docs.map(d => d.data()),
    workResults: workSnap.docs.map(d => d.data()),
  };
}

