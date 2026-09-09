import {
  collection, doc, addDoc, setDoc, getDoc, getDocs,
  updateDoc, deleteDoc, query, where, orderBy, serverTimestamp, limit
} from 'firebase/firestore';
import { db } from './config';

// ── LocalStorage Mock Database ─────────────────────────────────────────────
const mockStore = {
  get: (uid, key) => JSON.parse(localStorage.getItem(`invoice_ai_db_${uid}_${key}`)) || [],
  set: (uid, key, data) => localStorage.setItem(`invoice_ai_db_${uid}_${key}`, JSON.stringify(data)),
  
  getProfile: (uid) => JSON.parse(localStorage.getItem(`invoice_ai_profile_${uid}`)) || null,
  saveProfile: (uid, data) => localStorage.setItem(`invoice_ai_profile_${uid}`, JSON.stringify(data))
};

// ── Profile ────────────────────────────────────────────────────────────────
export const getProfile = async (uid) => {
  if (window.IS_MOCKED_FIREBASE) {
    let profile = mockStore.getProfile(uid);
    if (!profile && uid === 'demo-user-id') {
      profile = {
        businessName: 'Demo User',
        address: '',
        gstNumber: '',
        email: 'demouser',
        defaultCurrency: 'INR',
        logoUrl: '',
        signatureUrl: ''
      };
      mockStore.saveProfile(uid, profile);
    }
    return profile;
  }
  const snap = await getDoc(doc(db, 'users', uid, 'profile', 'default'));
  return snap.exists() ? snap.data() : null;
};

export const saveProfile = async (uid, data) => {
  if (window.IS_MOCKED_FIREBASE) {
    return mockStore.saveProfile(uid, data);
  }
  return setDoc(doc(db, 'users', uid, 'profile', 'default'), { ...data, updatedAt: serverTimestamp() }, { merge: true });
};

// ── Invoices ───────────────────────────────────────────────────────────────
export const createInvoice = async (uid, data) => {
  if (window.IS_MOCKED_FIREBASE) {
    const list = mockStore.get(uid, 'invoices');
    const newDoc = { id: `inv-${Date.now()}`, ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    list.unshift(newDoc);
    mockStore.set(uid, 'invoices', list);
    return { id: newDoc.id };
  }
  return addDoc(collection(db, 'users', uid, 'invoices'), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
};

export const updateInvoice = async (uid, invoiceId, data) => {
  if (window.IS_MOCKED_FIREBASE) {
    const list = mockStore.get(uid, 'invoices');
    const updated = list.map(item => item.id === invoiceId ? { ...item, ...data, updatedAt: new Date().toISOString() } : item);
    mockStore.set(uid, 'invoices', updated);
    return;
  }
  return updateDoc(doc(db, 'users', uid, 'invoices', invoiceId), { ...data, updatedAt: serverTimestamp() });
};

export const deleteInvoice = async (uid, invoiceId) => {
  if (window.IS_MOCKED_FIREBASE) {
    const list = mockStore.get(uid, 'invoices');
    const filtered = list.filter(item => item.id !== invoiceId);
    mockStore.set(uid, 'invoices', filtered);
    return;
  }
  return deleteDoc(doc(db, 'users', uid, 'invoices', invoiceId));
};

export const getInvoice = async (uid, invoiceId) => {
  if (window.IS_MOCKED_FIREBASE) {
    const list = mockStore.get(uid, 'invoices');
    return list.find(item => item.id === invoiceId) || null;
  }
  const snap = await getDoc(doc(db, 'users', uid, 'invoices', invoiceId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const getInvoices = async (uid) => {
  if (window.IS_MOCKED_FIREBASE) {
    return mockStore.get(uid, 'invoices');
  }
  const q = query(collection(db, 'users', uid, 'invoices'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ── Clients ────────────────────────────────────────────────────────────────
export const createClient = async (uid, data) => {
  if (window.IS_MOCKED_FIREBASE) {
    const list = mockStore.get(uid, 'clients');
    const newDoc = { id: `client-${Date.now()}`, ...data, createdAt: new Date().toISOString() };
    list.unshift(newDoc);
    mockStore.set(uid, 'clients', list);
    return { id: newDoc.id };
  }
  return addDoc(collection(db, 'users', uid, 'clients'), { ...data, createdAt: serverTimestamp() });
};

export const updateClient = async (uid, clientId, data) => {
  if (window.IS_MOCKED_FIREBASE) {
    const list = mockStore.get(uid, 'clients');
    const updated = list.map(item => item.id === clientId ? { ...item, ...data, updatedAt: new Date().toISOString() } : item);
    mockStore.set(uid, 'clients', updated);
    return;
  }
  return updateDoc(doc(db, 'users', uid, 'clients', clientId), { ...data, updatedAt: serverTimestamp() });
};

export const deleteClient = async (uid, clientId) => {
  if (window.IS_MOCKED_FIREBASE) {
    const list = mockStore.get(uid, 'clients');
    const filtered = list.filter(item => item.id !== clientId);
    mockStore.set(uid, 'clients', filtered);
    return;
  }
  return deleteDoc(doc(db, 'users', uid, 'clients', clientId));
};

export const getClients = async (uid) => {
  if (window.IS_MOCKED_FIREBASE) {
    return mockStore.get(uid, 'clients');
  }
  const q = query(collection(db, 'users', uid, 'clients'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getClient = async (uid, clientId) => {
  if (window.IS_MOCKED_FIREBASE) {
    const list = mockStore.get(uid, 'clients');
    return list.find(item => item.id === clientId) || null;
  }
  const snap = await getDoc(doc(db, 'users', uid, 'clients', clientId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

// ── Activity ───────────────────────────────────────────────────────────────
export const logActivity = async (uid, data) => {
  if (window.IS_MOCKED_FIREBASE) {
    const list = mockStore.get(uid, 'activity');
    const newDoc = { id: `act-${Date.now()}`, ...data, timestamp: new Date().toISOString() };
    list.unshift(newDoc);
    mockStore.set(uid, 'activity', list.slice(0, 50));
    return { id: newDoc.id };
  }
  return addDoc(collection(db, 'users', uid, 'activity'), { ...data, timestamp: serverTimestamp() });
};

export const getActivity = async (uid, n = 10) => {
  if (window.IS_MOCKED_FIREBASE) {
    const list = mockStore.get(uid, 'activity');
    return list.slice(0, n);
  }
  const q = query(collection(db, 'users', uid, 'activity'), orderBy('timestamp', 'desc'), limit(n));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
