import { useState, useEffect } from 'react';
import { Send, Loader2, Sparkles, X } from 'lucide-react';
import Modal from './Modal';
import { generateEmailAI, sendEmail } from '../../utils/api';
import { getInvoicePDFBase64 } from '../../utils/pdfExport';
import toast from 'react-hot-toast';

export default function SendEmailModal({ open, onClose, invoice, profile }) {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  const [loadingAI, setLoadingAI] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open && invoice) {
      setTo(invoice.client?.email || '');
      // Try to generate AI draft if we have enough info
      generateDraft();
    }
  }, [open, invoice]);

  const generateDraft = async () => {
    setLoadingAI(true);
    try {
      const res = await generateEmailAI(invoice);
      setSubject(res.subject || `Invoice ${invoice.invoiceNumber}`);
      setMessage(res.body || '');
    } catch (error) {
      // Fallback template
      const fallbackSubject = `Invoice ${invoice.invoiceNumber || ''} from ${profile.businessName || 'Us'}`;
      const fallbackMessage = `Dear ${invoice.client?.name || 'Client'},\n\nPlease find attached invoice ${invoice.invoiceNumber || ''} from ${profile.businessName || 'Us'} for the services provided.\n\nKindly review the attached invoice and process the payment by the due date.\n\nThank you for your business.\n\nBest regards,\n${profile.businessName || ''}`;
      
      setSubject(fallbackSubject);
      setMessage(fallbackMessage);
    }
    setLoadingAI(false);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!to || !to.includes('@')) {
      toast.error('Please provide a valid recipient email address.');
      return;
    }

    setSending(true);
    let pdfBase64;
    try {
      // Generate PDF Base64
      pdfBase64 = await getInvoicePDFBase64(invoice, profile);
    } catch (error) {
      toast.error(`Failed to generate PDF: ${error.message}`);
      setSending(false);
      return;
    }

    try {
      const payload = {
        to,
        subject,
        message,
        pdfBase64,
        filename: `${invoice.invoiceNumber || 'invoice'}.pdf`
      };

      await sendEmail(payload);
      toast.success('Email sent successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to send email. Ensure SMTP is configured on the backend.');
    }
    setSending(false);
  };

  return (
    <Modal open={open} onClose={onClose} title="Send Invoice via Email">
      <form onSubmit={handleSend} className="flex flex-col gap-4">
        
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">To *</label>
          <input
            type="email"
            className="input-field"
            value={to}
            onChange={e => setTo(e.target.value)}
            placeholder="client@example.com"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide flex justify-between items-center">
            <span>Subject *</span>
            <button
              type="button"
              onClick={generateDraft}
              disabled={loadingAI || sending}
              className="text-[#1A998F] hover:text-[#187F87] flex items-center gap-1 transition-colors"
            >
              {loadingAI ? <Loader2 size={12} className="animate-spin-slow" /> : <Sparkles size={12} />}
              Regenerate Draft
            </button>
          </label>
          <input
            className="input-field"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            required
            placeholder="Invoice from Us"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Message *</label>
          <textarea
            rows={6}
            className="input-field resize-none"
            value={message}
            onChange={e => setMessage(e.target.value)}
            required
            placeholder="Type your message here..."
          />
        </div>

        <div className="flex items-center gap-2 p-3 bg-[#F4F7F6] border border-[#E5E7EB] rounded-lg text-sm text-[#6B7280]">
          <span className="font-semibold text-[#0F1115]">Attachment:</span>
          <span>{invoice.invoiceNumber || 'invoice'}.pdf</span>
        </div>

        <div className="flex gap-3 justify-end mt-2">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={sending}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={sending || loadingAI}>
            {sending ? <Loader2 size={15} className="animate-spin-slow" /> : <Send size={15} />}
            {sending ? 'Sending...' : 'Send Email'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
