import { useState, useEffect } from 'react';
import { Save, Building, Image, Edit } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';
import { getProfile, saveProfile, logActivity } from '../firebase/firestore';
import { CURRENCIES } from '../utils/formatters';
import toast from 'react-hot-toast';

export default function BusinessProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    businessName: '',
    address: '',
    gstNumber: '',
    email: '',
    defaultCurrency: 'INR',
    logoUrl: '',
    signatureUrl: '',
    primaryContact: '',
    alternateContact: '',
    website: ''
  });

  const handleImageUpload = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      toast.error('Image is too large. Please upload an image under 1MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setProfile(prev => ({ ...prev, [field]: event.target.result }));
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!user) return;
    getProfile(user.uid).then(p => {
      if (p) setProfile(prev => ({ ...prev, ...p }));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile.businessName.trim()) return toast.error('Business name is required');
    setSaving(true);
    try {
      await saveProfile(user.uid, profile);
      await logActivity(user.uid, {
        type: 'profile_updated',
        description: 'Updated business profile configuration'
      });
      toast.success('Profile saved successfully');
    } catch (err) {
      toast.error('Failed to save profile');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-[#EFF4FF] border-t-[#2563EB] rounded-full animate-spin-slow" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="animate-fade-in max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#0F1115]">Business Profile</h1>
          <p className="text-sm text-[#6B7280]">Configure your company details, logo, currency and signatures for PDF branding</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="card p-6 flex flex-col gap-4">
            <h2 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Building size={14} /> Basic Settings
            </h2>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Business Name *</label>
              <input
                className="input-field"
                value={profile.businessName}
                onChange={e => setProfile({ ...profile, businessName: e.target.value })}
                placeholder="e.g. Pixelkraft Studios"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Contact Email</label>
                <input
                  type="email"
                  className="input-field"
                  value={profile.email}
                  onChange={e => setProfile({ ...profile, email: e.target.value })}
                  placeholder="billing@pixelkraft.com"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">GST / Tax ID</label>
                <input
                  className="input-field"
                  value={profile.gstNumber}
                  onChange={e => setProfile({ ...profile, gstNumber: e.target.value })}
                  placeholder="22AAAAA0000A1Z5"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Primary Contact Number</label>
                <input
                  className="input-field"
                  value={profile.primaryContact || ''}
                  onChange={e => setProfile({ ...profile, primaryContact: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Alternate Contact Number</label>
                <input
                  className="input-field"
                  value={profile.alternateContact || ''}
                  onChange={e => setProfile({ ...profile, alternateContact: e.target.value })}
                  placeholder="+91 98765 00000"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Business Website / URL</label>
              <input
                type="url"
                className="input-field"
                value={profile.website || ''}
                onChange={e => setProfile({ ...profile, website: e.target.value })}
                placeholder="https://www.pixelkraft.com"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Business Address</label>
              <textarea
                rows={3}
                className="input-field resize-none"
                value={profile.address}
                onChange={e => setProfile({ ...profile, address: e.target.value })}
                placeholder="101 Creative Plaza, Bangalore, KA, 560001"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Default Currency</label>
              <select
                className="input-field"
                value={profile.defaultCurrency}
                onChange={e => setProfile({ ...profile, defaultCurrency: e.target.value })}
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Logo & Signature links */}
          <div className="card p-6 flex flex-col gap-4">
            <h2 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Image size={14} /> Logo & Signature
            </h2>
            <p className="text-xs text-[#6B7280]">Upload your custom logo and signature for PDF templates. Images will be automatically resized.</p>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Logo Image</label>
              <input
                type="file"
                accept="image/*"
                className="input-field file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                onChange={e => handleImageUpload(e, 'logoUrl')}
              />
              {profile.logoUrl && (
                <div className="mt-2 p-4 bg-[#F7F9FC] rounded-lg border border-dashed border-[#E5E7EB] w-fit flex flex-col items-center gap-2">
                  <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">Preview (Max 400x400)</span>
                  <img src={profile.logoUrl} alt="Logo preview" className="max-h-24 max-w-[200px] object-contain" onError={(e) => {e.target.style.display='none';}} />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Authorized Signature Image</label>
              <input
                type="file"
                accept="image/*"
                className="input-field file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                onChange={e => handleImageUpload(e, 'signatureUrl')}
              />
              {profile.signatureUrl && (
                <div className="mt-2 p-4 bg-[#F7F9FC] rounded-lg border border-dashed border-[#E5E7EB] w-fit flex flex-col items-center gap-2">
                  <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">Preview (Max 400x400)</span>
                  <img src={profile.signatureUrl} alt="Signature preview" className="max-h-16 max-w-[200px] object-contain" onError={(e) => {e.target.style.display='none';}} />
                </div>
              )}
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full justify-center py-3">
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
