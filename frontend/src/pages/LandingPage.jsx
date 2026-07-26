import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Sparkles, ArrowRight, CheckCircle, FileText, ShieldCheck, Download, Users, Lock, Mail, User, Eye, EyeOff, X } from 'lucide-react';
import { signInWithGoogle, signInWithEmail, signUpWithEmail, signInAsGuest } from '../firebase/auth';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'signup'
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const goDashboard = () => navigate('/dashboard');

  const handleGoogle = async () => {
    setLoading('google');
    try {
      await signInWithGoogle();
      setShowAuthModal(false);
      goDashboard();
      toast.success('Welcome to InvoiceAI!');
    } catch (e) {
      toast.error(e.message || 'Google sign-in failed');
    } finally {
      setLoading('');
    }
  };

  const handleEmail = async (e) => {
    e.preventDefault();
    setLoading('email');
    try {
      if (authMode === 'signin') await signInWithEmail(form.email, form.password);
      else await signUpWithEmail(form.email, form.password, form.name);
      setShowAuthModal(false);
      goDashboard();
      toast.success(authMode === 'signin' ? 'Welcome back!' : 'Account created!');
    } catch (e) {
      toast.error(e.message || 'Authentication failed');
    } finally {
      setLoading('');
    }
  };

  const handleGuest = async () => {
    setLoading('guest');
    try {
      await signInAsGuest();
      goDashboard();
      toast.success('Signed in as Guest');
    } catch (e) {
      toast.error('Failed to start guest session');
    } finally {
      setLoading('');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#102E3C] flex flex-col selection:bg-[#E6F4F3] selection:text-[#1A998F] overflow-x-hidden">
      {/* Background radial gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-[#E6F4F3] via-[#E6F4F3]/40 to-transparent blur-3xl opacity-70" />
        <div className="absolute top-96 -right-40 w-96 h-96 rounded-full bg-[#1A998F]/8 blur-3xl" />
        <div className="absolute top-[800px] -left-40 w-96 h-96 rounded-full bg-[#155665]/5 blur-3xl" />
      </div>

      {/* Navigation Bar */}
      <header className="relative z-30 max-w-7xl mx-auto w-full px-6 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#1A998F] flex items-center justify-center shadow-md shadow-teal-700/20">
            <Zap size={18} className="text-white" fill="white" />
          </div>
          <span className="text-xl font-extrabold text-[#102E3C] tracking-tight">InvoiceAI</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#6B7280]">
          <a href="#features" className="hover:text-[#1A998F] transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-[#1A998F] transition-colors">How it works</a>
          <a href="#templates" className="hover:text-[#1A998F] transition-colors">Templates</a>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <button onClick={goDashboard} className="btn-primary text-sm font-semibold">
              Go to Dashboard <ArrowRight size={15} />
            </button>
          ) : (
            <>
              <button
                onClick={handleGuest}
                disabled={!!loading}
                className="btn-secondary !border-transparent hover:!bg-[#E6F4F3] !text-[#102E3C] font-semibold text-sm"
              >
                {loading === 'guest' ? (
                  <span className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin-slow" />
                ) : null}
                Try as Guest
              </button>
              <button
                onClick={() => { setAuthMode('signin'); setShowAuthModal(true); }}
                className="btn-primary text-sm font-semibold"
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-20 pt-12 pb-20 px-6 max-w-5xl mx-auto text-center flex flex-col items-center">
        {/* Brand Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E6F4F3] border border-[#C4CFCE]/60 mb-6 shadow-sm animate-fade-in">
          <Zap size={14} className="text-[#1A998F]" fill="currentColor" />
          <span className="text-xs font-bold text-[#1A998F] tracking-wide uppercase">InvoiceAI ⚡</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#102E3C] tracking-tight leading-[1.15] mb-6 max-w-4xl animate-fade-in">
          Create Professional Invoices <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-[#1A998F] via-[#187F87] to-[#155665] bg-clip-text text-transparent">
            in Seconds with AI
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-[#6B7280] max-w-2xl leading-relaxed mb-8 animate-fade-in">
          Generate invoices, manage clients, track payments, and export PDFs—all from one place.
        </p>

        {/* CTA Button Group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-4 animate-fade-in">
          <button
            onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
            className="btn-primary w-full sm:w-auto px-8 py-3.5 !text-base !rounded-xl shadow-lg shadow-teal-600/25 justify-center"
          >
            Get Started <ArrowRight size={18} />
          </button>
          <button
            onClick={handleGuest}
            disabled={!!loading}
            className="btn-secondary w-full sm:w-auto px-8 py-3.5 !text-base !rounded-xl !border-[#C4CFCE] justify-center"
          >
            {loading === 'guest' ? (
              <span className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin-slow" />
            ) : (
              <Sparkles size={18} className="text-[#1A998F]" />
            )}
            Try Demo
          </button>
        </div>

        {/* Guest Warning Caption */}
        <p className="text-xs font-medium text-[#6B7280] italic flex items-center justify-center gap-1.5 mb-16 animate-fade-in">
          <span>"Your invoices won't be saved permanently until you sign in."</span>
        </p>

        {/* Hero Invoice Illustration & Floating Cards */}
        <div className="relative w-full max-w-4xl mx-auto mt-2 animate-fade-in">
          {/* Main Mockup Card */}
          <div className="relative bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_25px_60px_-15px_rgba(16,46,60,0.12)] p-6 sm:p-8 text-left overflow-hidden">
            {/* Mock Header */}
            <div className="flex items-center justify-between pb-6 border-b border-[#E5E7EB] mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1A998F] text-white font-bold flex items-center justify-center">
                  IA
                </div>
                <div>
                  <h3 className="font-bold text-[#102E3C] text-base">Acme Agency Inc.</h3>
                  <p className="text-xs text-[#6B7280]">INV-2026-0042 • Issued July 26, 2026</p>
                </div>
              </div>
              <span className="badge badge-paid text-xs px-3 py-1">PAID</span>
            </div>

            {/* Mock Line Items */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-xs font-bold text-[#9CA3AF] uppercase pb-1 border-b border-gray-100">
                <span>Description</span>
                <span>Amount</span>
              </div>
              <div className="flex justify-between text-sm py-1.5 border-b border-gray-50">
                <span className="text-[#102E3C] font-medium">React Web Application UI/UX Design</span>
                <span className="font-bold text-[#102E3C]">₹35,000.00</span>
              </div>
              <div className="flex justify-between text-sm py-1.5">
                <span className="text-[#102E3C] font-medium">Gemini AI API Integration & Backend Proxy</span>
                <span className="font-bold text-[#102E3C]">₹15,000.00</span>
              </div>
            </div>

            {/* Mock Footer Totals */}
            <div className="flex items-center justify-between pt-4 border-t border-[#E5E7EB] bg-[#F4F7F6] -mx-6 -mb-6 p-6">
              <span className="text-xs text-[#6B7280] font-semibold">Payment Terms: Net 15 Days</span>
              <div className="text-right">
                <span className="text-xs text-[#6B7280] block">Total Amount</span>
                <span className="text-xl font-black text-[#1A998F]">₹50,000.00</span>
              </div>
            </div>
          </div>

          {/* Floating Card 1: AI Prompt Tag */}
          <div className="absolute -top-6 -left-4 sm:-left-8 bg-white border border-[#C4CFCE] rounded-xl p-3.5 shadow-xl flex items-center gap-3 animate-pulse-soft hidden sm:flex">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <Sparkles size={16} className="text-purple-600" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-[#102E3C]">AI Prompt Generator</p>
              <p className="text-[11px] text-[#6B7280]">"₹50,000 React & Gemini dev..."</p>
            </div>
          </div>

          {/* Floating Card 2: Generated Time */}
          <div className="absolute -bottom-6 -right-4 sm:-right-8 bg-[#102E3C] text-white rounded-xl p-3.5 shadow-xl flex items-center gap-3 hidden sm:flex">
            <div className="w-8 h-8 rounded-lg bg-[#1A998F] flex items-center justify-center">
              <Zap size={16} className="text-white" fill="white" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-white">Generated in 3.2s</p>
              <p className="text-[11px] text-[#C4CFCE]">Ready for PDF export</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section id="features" className="py-20 bg-[#F4F7F6] border-t border-[#E5E7EB] px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-[#102E3C] mb-3">Everything You Need to Get Paid</h2>
            <p className="text-sm text-[#6B7280] max-w-xl mx-auto">
              Built for freelancers, agency owners, and independent professionals who value speed and aesthetics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card p-7 hover:border-[#1A998F] transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#E6F4F3] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Sparkles size={22} className="text-[#1A998F]" />
              </div>
              <h3 className="text-lg font-bold text-[#102E3C] mb-2">Natural Language AI</h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                Describe your work in plain text and let Gemini construct structured line items, tax math, and due dates automatically.
              </p>
            </div>

            <div className="card p-7 hover:border-[#1A998F] transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#E6F4F3] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Download size={22} className="text-[#1A998F]" />
              </div>
              <h3 className="text-lg font-bold text-[#102E3C] mb-2">Branded PDF Export</h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                Download crisp, client-ready PDFs complete with your custom business logo, GST details, and authorized signature.
              </p>
            </div>

            <div className="card p-7 hover:border-[#1A998F] transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#E6F4F3] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Users size={22} className="text-[#1A998F]" />
              </div>
              <h3 className="text-lg font-bold text-[#102E3C] mb-2">Client & Revenue Tracking</h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                Organize client contact history, filter by paid/pending/overdue status, and view financial analytics at a glance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-[#102E3C] text-white px-6 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#1A998F] flex items-center justify-center">
              <Zap size={14} className="text-white" fill="white" />
            </div>
            <span className="font-bold text-sm tracking-tight text-white">InvoiceAI</span>
          </div>
          <p className="text-xs text-[#C4CFCE]">
            © {new Date().getFullYear()} InvoiceAI. AI-Powered Invoicing Web Application.
          </p>
        </div>
      </footer>

      {/* Login Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowAuthModal(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 animate-fade-in overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F4F7F6] transition-colors"
            >
              <X size={18} />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#1A998F] flex items-center justify-center mx-auto mb-3 shadow-md shadow-teal-500/30">
                <Zap size={22} className="text-white" fill="white" />
              </div>
              <h2 className="text-xl font-bold text-[#102E3C]">
                {authMode === 'signin' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-xs text-[#6B7280] mt-1">Sign in to save and sync your invoices</p>
            </div>

            {/* Google Sign-in */}
            <button
              onClick={handleGoogle}
              disabled={!!loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-[#E5E7EB] rounded-xl font-semibold text-sm text-[#102E3C] bg-white hover:bg-[#F4F7F6] transition-all mb-4 disabled:opacity-50"
            >
              {loading === 'google' ? (
                <span className="w-5 h-5 border-2 border-[#E5E7EB] border-t-[#1A998F] rounded-full animate-spin-slow" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              Continue with Google
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-[#E5E7EB]" />
              <span className="text-xs text-[#6B7280]">or</span>
              <div className="flex-1 h-px bg-[#E5E7EB]" />
            </div>

            {/* Email form */}
            <form onSubmit={handleEmail} className="flex flex-col gap-3">
              {authMode === 'signup' && (
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    type="text"
                    placeholder="Full name"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="input-field !pl-9 text-sm"
                  />
                </div>
              )}
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="email"
                  placeholder="Email address"
                  required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="input-field !pl-9 text-sm"
                />
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="input-field !pl-9 !pr-9 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <button type="submit" disabled={!!loading} className="btn-primary w-full justify-center py-2.5 !rounded-xl text-sm mt-1">
                {authMode === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => setAuthMode(m => m === 'signin' ? 'signup' : 'signin')}
                className="text-xs font-semibold text-[#1A998F] hover:underline"
              >
                {authMode === 'signin' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
