require('dotenv').config();
const express = require('express');
const cors = require('cors');
const aiRoutes = require('./routes/ai');
const emailRoutes = require('./routes/email');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({ origin: '*' })); // Allow Vercel production frontend URL
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api/ai', aiRoutes);
app.use('/api/email', emailRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`InvoiceAI backend running on http://localhost:${PORT}`);
  });
}

module.exports = app;
