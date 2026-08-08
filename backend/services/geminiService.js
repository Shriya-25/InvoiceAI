const { GoogleGenerativeAI } = require('@google/generative-ai');

// Default client from environment variable
const defaultKey = process.env.GEMINI_API_KEY;

/**
 * Returns a Gemini model instance.
 * Uses the client-provided API key if available, otherwise falls back to the server env key.
 */
function getModel(apiKey) {
  const key = apiKey || defaultKey;
  if (!key) throw new Error('No Gemini API key configured. Please add your API key in the AI Assistant settings.');
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
}

const INVOICE_SYSTEM_PROMPT = `You are an invoice generation assistant. When given a natural language description of work done, return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:
{
  "client": { "name": "", "email": "", "address": "" },
  "items": [{ "description": "", "quantity": 1, "rate": 0 }],
  "taxPercent": 0,
  "discount": 0,
  "currency": "INR",
  "dueDate": "YYYY-MM-DD",
  "paymentTerms": "",
  "notes": ""
}
Rules:
- Set dueDate to 15 days from today if not specified
- Default currency is INR
- Never fabricate GST/tax numbers
- Return ONLY the JSON object, no other text
- Today's date is: ${new Date().toISOString().split('T')[0]}`;

async function generateInvoice(prompt, apiKey) {
  const model = getModel(apiKey);
  const result = await model.generateContent(`${INVOICE_SYSTEM_PROMPT}\n\nUser description: ${prompt}`);
  const text = result.response.text().trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI did not return valid JSON');
  return JSON.parse(jsonMatch[0]);
}

async function generateDescription(context, apiKey) {
  const model = getModel(apiKey);
  const prompt = `You are a professional invoice assistant. Convert this rough service description into a polished, client-ready paragraph (2-3 sentences max). Return ONLY the description text, no JSON:

Rough description: "${context}"`;
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

async function suggestPaymentTerms(context, apiKey) {
  const model = getModel(apiKey);
  const prompt = `You are an invoice assistant. Based on this invoice context, suggest the best payment terms. Return ONLY a JSON object:
{"terms": "Net 30", "reason": "Brief explanation"}

Context: ${JSON.stringify(context)}`;
  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return { terms: 'Net 30', reason: 'Standard payment terms' };
  return JSON.parse(jsonMatch[0]);
}

async function generateNotes(context, apiKey) {
  const model = getModel(apiKey);
  const prompt = `Generate professional invoice notes/footer text (1-2 sentences, polite and professional). Return ONLY the notes text, no JSON.

Invoice context: ${JSON.stringify(context)}`;
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

async function validateInvoice(invoice, apiKey) {
  const issues = [];
  if (!invoice.client?.name) issues.push({ field: 'client.name', message: 'Client name is required' });
  if (!invoice.client?.email) issues.push({ field: 'client.email', message: 'Client email is missing' });
  if (!invoice.items || invoice.items.length === 0) issues.push({ field: 'items', message: 'At least one line item is required' });
  if (!invoice.dueDate) issues.push({ field: 'dueDate', message: 'Due date is required' });
  if (invoice.items) {
    invoice.items.forEach((item, i) => {
      if (!item.description) issues.push({ field: `items[${i}].description`, message: `Line item ${i + 1} has no description` });
      if (!item.rate || item.rate <= 0) issues.push({ field: `items[${i}].rate`, message: `Line item ${i + 1} has no rate` });
    });
  }
  return { valid: issues.length === 0, issues };
}

async function generateEmail(invoice, apiKey) {
  const model = getModel(apiKey);
  const total = invoice.items?.reduce((sum, item) => sum + (item.quantity * item.rate), 0) || 0;
  const prompt = `Write a professional, friendly email to send with an invoice. Return ONLY the email body text (no subject line, no JSON):

Invoice details:
- Client: ${invoice.client?.name || 'Valued Client'}
- Total amount: ${invoice.currency || 'INR'} ${total}
- Due date: ${invoice.dueDate || 'as discussed'}
- Services: ${invoice.items?.map(i => i.description).join(', ') || 'Professional services'}`;
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

module.exports = { generateInvoice, generateDescription, suggestPaymentTerms, generateNotes, validateInvoice, generateEmail };
