const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Returns a Gemini model instance using the server's API key.
 */
function getModel() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('AI service is currently unavailable. (Server missing GEMINI_API_KEY)');
  const genAI = new GoogleGenerativeAI(key);
  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  return genAI.getGenerativeModel({ model: modelName });
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

async function generateInvoice(prompt) {
  const model = getModel();
  const result = await model.generateContent(`${INVOICE_SYSTEM_PROMPT}\n\nUser description: ${prompt}`);
  const text = result.response.text().trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI did not return valid JSON');
  return JSON.parse(jsonMatch[0]);
}

async function generateDescription(description) {
  const model = getModel();
  const prompt = `You are a professional invoice assistant. Convert this rough service description into a polished, client-ready line-item description (1-2 sentences max).
Rule 1: Preserve meaning.
Rule 2: Do not invent unsupported facts.
Rule 3: Do not add prices, rates, or quantities.
Rule 4: Return ONLY a valid JSON object matching this structure exactly:
{"description": "..."}

Rough description: "${description}"`;
  
  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try { return JSON.parse(jsonMatch[0]); } catch(e) {}
  }
  return { description: text.replace(/^```json|```$/g, '').trim() };
}

async function suggestPaymentTerms(context) {
  const model = getModel();
  const prompt = `You are an invoice assistant. Based on this invoice/client context, suggest the best professional payment terms.
Rule 1: Be professional and clear.
Rule 2: Use supplied context only, do not invent payment history or unsupported claims.
Rule 3: Return ONLY a valid JSON object matching this structure exactly:
{"paymentTerms": "..."}

Context: ${JSON.stringify(context)}`;
  
  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try { return JSON.parse(jsonMatch[0]); } catch(e) {}
  }
  return { paymentTerms: 'Payment is due within 30 days from the invoice date.' };
}

async function generateNotes(context) {
  const model = getModel();
  const prompt = `You are an invoice assistant. Generate professional invoice notes/footer text.
Rule 1: Keep it concise (1-2 sentences) and suitable for an invoice footer.
Rule 2: Polite and professional. No unnecessary marketing language.
Rule 3: Return ONLY a valid JSON object matching this structure exactly:
{"note": "..."}

Invoice context: ${JSON.stringify(context)}`;
  
  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try { return JSON.parse(jsonMatch[0]); } catch(e) {}
  }
  return { note: text.replace(/^```json|```$/g, '').trim() };
}

async function validateInvoice(invoice) {
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

async function generateEmail(invoice) {
  const model = getModel();
  const total = invoice.items?.reduce((sum, item) => sum + (item.quantity * item.rate), 0) || invoice.amount || 0;
  const prompt = `You are a professional invoice assistant. Write a professional, friendly covering email to send with this invoice.
Rule 1: Be polite, professional, and concise.
Rule 2: Use ONLY the exact invoice details supplied below. Never invent invoice values, services, or due dates.
Rule 3: Return ONLY a valid JSON object matching this structure exactly:
{
  "subject": "...",
  "body": "..."
}

Invoice details:
- Invoice Number: ${invoice.invoiceNumber || 'New Invoice'}
- Client: ${invoice.clientName || invoice.client?.name || 'Valued Client'}
- Total amount: ${invoice.currency || 'INR'} ${total}
- Due date: ${invoice.dueDate || 'as discussed'}
- Status: ${invoice.status || 'Pending'}
- Business Name: ${invoice.businessName || 'Our Company'}
- Services: ${invoice.items?.map(i => i.description).join(', ') || 'Professional services'}`;
  
  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try { return JSON.parse(jsonMatch[0]); } catch(e) {}
  }
  return {
    subject: `Invoice ${invoice.invoiceNumber || ''}`,
    body: text.replace(/^```json|```$/g, '').trim()
  };
}

module.exports = { generateInvoice, generateDescription, suggestPaymentTerms, generateNotes, validateInvoice, generateEmail };
