const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

router.post('/send', async (req, res) => {
  try {
    const { to, subject, message, pdfBase64, filename } = req.body;

    if (!to || !subject || !message || !pdfBase64) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const pdfBuffer = Buffer.from(pdfBase64.split(',')[1] || pdfBase64, 'base64');

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
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

    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);

    res.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email. Please check your SMTP configuration.' });
  }
});

module.exports = router;
