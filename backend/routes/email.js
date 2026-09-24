const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

let transporter;
let isSmtpConfigured = false;

async function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST?.trim();
  
  if (host) {
    isSmtpConfigured = true;
    transporter = nodemailer.createTransport({
      host: host,
      port: process.env.SMTP_PORT || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    isSmtpConfigured = false;
    console.log('[Email] No SMTP_HOST found in .env. Creating Ethereal test account...');
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } catch (e) {
      console.error('[Email] Failed to create Ethereal test account:', e);
      throw new Error('Failed to create test email account. Are you connected to the internet?');
    }
  }
  return transporter;
}

router.post('/send', async (req, res) => {
  console.log('[Email] Request received');
  try {
    const { to, subject, message, pdfBase64, filename } = req.body;
    
    console.log(`[Email] Recipient: ${to}`);
    console.log(`[Email] PDF received: ${!!pdfBase64}`);

    if (!to || !subject || !message || !pdfBase64) {
      console.log('[Email] Error: Missing required fields');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const t = await getTransporter();
    console.log(`[Email] SMTP configured: ${isSmtpConfigured}`);

    const pdfBuffer = Buffer.from(pdfBase64.split(',')[1] || pdfBase64, 'base64');

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'test@example.com',
      to,
      subject,
      text: message,
      attachments: [
        {
          filename: filename || 'invoice.pdf',
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    console.log('[Email] Sending...');
    const info = await t.sendMail(mailOptions);
    console.log('[Email] Success / Message sent: %s', info.messageId);
    
    let previewUrl = null;
    if (!isSmtpConfigured) {
      previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('[Email] Preview URL: %s', previewUrl);
    }

    res.json({ success: true, messageId: info.messageId, previewUrl });
  } catch (error) {
    console.error('[Email] Error:', error.message || error);
    
    if (error.code === 'ECONNREFUSED') {
      res.status(500).json({ error: 'Connection refused. Ensure SMTP is configured correctly or internet is available.' });
    } else {
      res.status(500).json({ error: `Failed to send email: ${error.message}` });
    }
  }
});

module.exports = router;
