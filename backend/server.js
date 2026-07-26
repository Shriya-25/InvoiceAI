require('dotenv').config();
const express = require('express');
const cors = require('cors');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }));
app.use(express.json({ limit: '10mb' }));

app.use('/api/ai', aiRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.listen(PORT, () => {
  console.log(`InvoiceAI backend running on http://localhost:${PORT}`);
});
