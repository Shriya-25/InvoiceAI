import {
  collection, doc, addDoc, setDoc, getDoc, getDocs,
  updateDoc, deleteDoc, query, where, orderBy, serverTimestamp, limit
} from 'firebase/firestore';
import { db } from './config';

// ── Helpers ────────────────────────────────────────────────────────────────
const userCol = (uid, col) => collection(db, 'users', uid, col);
const userDoc = (uid, col, id) => doc(db, 'users', uid, col, id);

// ── Profile ────────────────────────────────────────────────────────────────
export const getProfile = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid, 'profile', 'default'));
  return snap.exists() ? snap.data() : null;
};
export const saveProfile = (uid, data) =>
  setDoc(doc(db, 'users', uid, 'profile', 'default'), { ...data, updatedAt: serverTimestamp() }, { merge: true });

// ── Invoices ───────────────────────────────────────────────────────────────
export const createInvoice = (uid, data) =>
  addDoc(userCol(uid, 'invoices'), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });

export const updateInvoice = (uid, invoiceId, data) =>
  updateDoc(userDoc(uid, 'invoices', invoiceId), { ...data, updatedAt: serverTimestamp() });

export const deleteInvoice = (uid, invoiceId) =>
  deleteDoc(userDoc(uid, 'invoices', invoiceId));

export const getInvoice = async (uid, invoiceId) => {
  const snap = await getDoc(userDoc(uid, 'invoices', invoiceId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const getInvoices = async (uid) => {
  const q = query(userCol(uid, 'invoices'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ── Clients ────────────────────────────────────────────────────────────────
export const createClient = (uid, data) =>
  addDoc(userCol(uid, 'clients'), { ...data, createdAt: serverTimestamp() });

export const updateClient = (uid, clientId, data) =>
  updateDoc(userDoc(uid, 'clients', clientId), { ...data, updatedAt: serverTimestamp() });

export const deleteClient = (uid, clientId) =>
  deleteDoc(userDoc(uid, 'clients', clientId));

export const getClients = async (uid) => {
  const q = query(userCol(uid, 'clients'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getClient = async (uid, clientId) => {
  const snap = await getDoc(userDoc(uid, 'clients', clientId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

// ── Activity ───────────────────────────────────────────────────────────────
export const logActivity = (uid, data) =>
  addDoc(userCol(uid, 'activity'), { ...data, timestamp: serverTimestamp() });

export const getActivity = async (uid, n = 10) => {
  const q = query(userCol(uid, 'activity'), orderBy('timestamp', 'desc'), limit(n));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
