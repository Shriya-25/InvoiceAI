import axios from 'axios';
import { auth } from '../firebase/config';

const api = axios.create({ baseURL: '/api' });

// Attach Firebase Auth token or Mock token on every API request
api.interceptors.request.use(async (config) => {
  const user = auth?.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers['Authorization'] = `Bearer ${token}`;
  } else {
    const mockUser = localStorage.getItem('invoice_ai_mock_user');
    if (mockUser) {
      try {
        const parsed = JSON.parse(mockUser);
        config.headers['Authorization'] = `Bearer mock_${parsed.uid}`;
      } catch (e) {}
    }
  }
  return config;
});

export const generateInvoiceAI = (prompt) =>
  api.post('/ai/generate-invoice', { prompt }).then(r => r.data.data);

export const generateDescriptionAI = (context) =>
  api.post('/ai/generate-description', { context }).then(r => r.data.data);

export const suggestTermsAI = (context) =>
  api.post('/ai/suggest-terms', { context }).then(r => r.data.data);

export const generateNotesAI = (context) =>
  api.post('/ai/generate-notes', { context }).then(r => r.data.data);

export const validateInvoiceAI = (invoice) =>
  api.post('/ai/validate-invoice', { invoice }).then(r => r.data.data);

export const generateEmailAI = (invoice) =>
  api.post('/ai/generate-email', { invoice }).then(r => r.data.data);

export const sendEmail = (data) =>
  api.post('/email/send', data).then(r => r.data);
