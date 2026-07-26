import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

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
