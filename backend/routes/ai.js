const express = require('express');
const router = express.Router();
const gemini = require('../services/geminiService');

const handle = (fn) => async (req, res) => {
  try {
    const result = await fn(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message || 'AI service error' });
  }
};

router.post('/generate-invoice', handle(({ prompt }) => gemini.generateInvoice(prompt)));
router.post('/generate-description', handle(({ context }) => gemini.generateDescription(context)));
router.post('/suggest-terms', handle(({ context }) => gemini.suggestPaymentTerms(context)));
router.post('/generate-notes', handle(({ context }) => gemini.generateNotes(context)));
router.post('/validate-invoice', handle(({ invoice }) => gemini.validateInvoice(invoice)));
router.post('/generate-email', handle(({ invoice }) => gemini.generateEmail(invoice)));

module.exports = router;
