const express = require('express');
const router = express.Router();
const gemini = require('../services/geminiService');

const handle = (fn) => async (req, res) => {
  try {
    // Extract optional client-provided Gemini API key from header
    const apiKey = req.headers['x-gemini-api-key'] || null;
    const result = await fn(req.body, apiKey);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message || 'AI service error' });
  }
};

router.post('/generate-invoice', handle(({ prompt }, apiKey) => gemini.generateInvoice(prompt, apiKey)));
router.post('/generate-description', handle(({ context }, apiKey) => gemini.generateDescription(context, apiKey)));
router.post('/suggest-terms', handle(({ context }, apiKey) => gemini.suggestPaymentTerms(context, apiKey)));
router.post('/generate-notes', handle(({ context }, apiKey) => gemini.generateNotes(context, apiKey)));
router.post('/validate-invoice', handle(({ invoice }, apiKey) => gemini.validateInvoice(invoice, apiKey)));
router.post('/generate-email', handle(({ invoice }, apiKey) => gemini.generateEmail(invoice, apiKey)));

module.exports = router;
