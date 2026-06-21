import {
  collection, doc, getDocs, setDoc, deleteDoc, writeBatch, query, orderBy,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Student, Receipt } from '../types';

const STUDENTS_KEY = 'students';
const RECEIPTS_KEY = 'receipts';
const MIGRATED_KEY = 'firebase_migrated';

/* ---------- helpers ---------- */

function getLocal<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function setLocal<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

/* ---------- migration ---------- */

async function migrateIfNeeded(): Promise<void> {
  if (localStorage.getItem(MIGRATED_KEY)) return;

  const localStudents = getLocal<Student>(STUDENTS_KEY);
  const localReceipts = getLocal<Receipt>(RECEIPTS_KEY);

  if (localStudents.length > 0) {
    const batch = writeBatch(db);
    for (const s of localStudents) {
      const ref = doc(db, STUDENTS_KEY, s.id);
      batch.set(ref, s);
    }
    await batch.commit();
  }

  if (localReceipts.length > 0) {
    const batch = writeBatch(db);
    for (const r of localReceipts) {
      const ref = doc(db, RECEIPTS_KEY, r.id);
      batch.set(ref, r);
    }
    await batch.commit();
  }

  localStorage.setItem(MIGRATED_KEY, 'true');
}

/* ---------- Students ---------- */

export async function loadStudents(): Promise<Student[]> {
  await migrateIfNeeded();
  try {
    const q = query(collection(db, STUDENTS_KEY), orderBy('code', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Student);
  } catch {
    return getLocal<Student>(STUDENTS_KEY);
  }
}

export async function loadStudentById(id: string): Promise<Student | null> {
  const all = await loadStudents();
  return all.find((s) => s.id === id) || null;
}

export async function saveStudents(students: Student[]): Promise<void> {
  setLocal(STUDENTS_KEY, students);
  try {
    const batch = writeBatch(db);
    for (const s of students) {
      const ref = doc(db, STUDENTS_KEY, s.id);
      batch.set(ref, s);
    }
    await batch.commit();
  } catch (e) {
    console.warn('Firestore save failed, data kept in localStorage', e);
  }
}

export async function deleteStudent(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, STUDENTS_KEY, id));
  } catch (e) {
    console.warn('Firestore delete failed', e);
  }
}

/* ---------- Receipts ---------- */

export async function loadReceipts(): Promise<Receipt[]> {
  await migrateIfNeeded();
  try {
    const q = query(collection(db, RECEIPTS_KEY), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Receipt);
  } catch {
    return getLocal<Receipt>(RECEIPTS_KEY);
  }
}

export async function saveReceipts(receipts: Receipt[]): Promise<void> {
  setLocal(RECEIPTS_KEY, receipts);
  try {
    const batch = writeBatch(db);
    for (const r of receipts) {
      const ref = doc(db, RECEIPTS_KEY, r.id);
      batch.set(ref, r);
    }
    await batch.commit();
  } catch (e) {
    console.warn('Firestore save failed, data kept in localStorage', e);
  }
}

export async function deleteReceipt(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, RECEIPTS_KEY, id));
  } catch (e) {
    console.warn('Firestore delete failed', e);
  }
}
