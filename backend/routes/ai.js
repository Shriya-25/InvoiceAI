const express = require('express');
const router = express.Router();
const gemini = require('../services/geminiService');
const authMiddleware = require('../middleware/auth');
const { apiRateLimiter, usageLimiter } = require('../middleware/aiLimiter');

const handle = (fn) => async (req, res) => {
  try {
    const result = await fn(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('AI Error:', err.message || err);
    res.status(500).json({ success: false, error: err.message || 'AI service error' });
  }
};

// Apply middlewares to all AI routes
router.use(authMiddleware);
router.use(apiRateLimiter);
router.use(usageLimiter);

router.post('/generate-invoice', handle(({ prompt }) => gemini.generateInvoice(prompt)));
router.post('/description', handle(({ description }) => gemini.generateDescription(description)));
router.post('/payment-terms', handle(({ context }) => gemini.suggestPaymentTerms(context)));
router.post('/notes', handle(({ context }) => gemini.generateNotes(context)));
router.post('/validate-invoice', handle(({ invoice }) => gemini.validateInvoice(invoice)));
router.post('/email', handle(({ invoice }) => gemini.generateEmail(invoice)));

module.exports = router;
