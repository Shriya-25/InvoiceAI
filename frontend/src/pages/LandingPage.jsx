import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Sparkles, ArrowRight, ShieldCheck, Download, Users, Lock, Mail, User, Eye, EyeOff, X, Star, ArrowLeft } from 'lucide-react';
import { signInWithEmail, signUpWithEmail, resetPassword } from '../firebase/auth';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'signup' | 'forgot'
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [navScrolled, setNavScrolled] = useState(false);

  const goDashboard = () => navigate('/dashboard');

  // Scroll-triggered animations via IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );

    const elements = document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Nav shadow on scroll
  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleEmail = async (e) => {
    e.preventDefault();
    setLoading('email');
    try {
      if (authMode === 'signin') {
        await signInWithEmail(form.email, form.password, rememberMe);
      } else {
        await signUpWithEmail(form.email, form.password, form.name, rememberMe);
      }
      setShowAuthModal(false);
      goDashboard();
      toast.success(authMode === 'signin' ? 'Welcome back!' : 'Account created successfully!');
    } catch (err) {
      const msg =
        err.code === 'auth/configuration-not-found' || err.code === 'auth/operation-not-allowed'
          ? 'Email sign-in is not enabled. Please enable it in Firebase Console → Authentication → Sign-in method.'
          : err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password'
          ? 'Incorrect email or password. Please try again.'
          : err.code === 'auth/user-not-found'
          ? 'No account found with this email. Please sign up first.'
          : err.code === 'auth/email-already-in-use'
          ? 'An account with this email already exists. Try signing in.'
          : err.code === 'auth/too-many-requests'
          ? 'Too many failed attempts. Please try again later or reset your password.'
          : err.code === 'auth/network-request-failed'
          ? 'Network error. Please check your connection and try again.'
          : err.message || 'Authentication failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading('');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#102E3C] flex flex-col selection:bg-[#E6F4F3] selection:text-[#1A998F] overflow-x-hidden">
      {/* Background radial gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-[#E6F4F3] via-[#E6F4F3]/40 to-transparent blur-3xl opacity-70" />
        <div className="absolute top-96 -right-40 w-96 h-96 rounded-full bg-[#1A998F]/8 blur-3xl animate-pulse-soft" />
        <div className="absolute top-[800px] -left-40 w-96 h-96 rounded-full bg-[#155665]/5 blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[400px] right-1/4 w-64 h-64 rounded-full bg-gradient-to-br from-[#1A998F]/10 to-[#155665]/5 blur-3xl animate-float-slow" />
        <div className="absolute top-[1200px] left-1/4 w-80 h-80 rounded-full bg-gradient-to-br from-[#E6F4F3]/50 to-[#1A998F]/5 blur-3xl animate-float" />
      </div>

      {/* ═══ Navigation Bar ═══ */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${navScrolled ? 'bg-white/80 backdrop-blur-xl shadow-sm border-b border-[#E5E7EB]/50' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto w-full px-6 py-4 flex items-center justify-between animate-slide-down">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#1A998F] flex items-center justify-center shadow-md shadow-teal-700/20 group-hover:shadow-teal-700/40 transition-shadow">
              <Zap size={18} className="text-white" fill="white" />
            </div>
            <span className="text-xl font-extrabold text-[#102E3C] tracking-tight">InvoiceAI</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#6B7280]">
            <a href="#how-it-works" className="hover:text-[#1A998F] transition-colors">How it works</a>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <button onClick={goDashboard} className="btn-primary text-sm font-semibold">
                Go to Dashboard <ArrowRight size={15} />
              </button>
            ) : (
              <>
                <button
                  onClick={() => { setAuthMode('signin'); setShowAuthModal(true); }}
                  className="btn-secondary !border-transparent hover:!bg-[#E6F4F3] !text-[#102E3C] font-semibold text-sm"
                >
                  Login
                </button>
                <button
                  onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
                  className="btn-primary text-sm font-semibold"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ═══ Hero Section ═══ */}
      <section className="relative z-20 pt-16 pb-24 px-6 max-w-5xl mx-auto text-center flex flex-col items-center">
        {/* Brand Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E6F4F3] border border-[#C4CFCE]/60 mb-6 shadow-sm animate-slide-up animate-glow">
          <Zap size={14} className="text-[#1A998F]" fill="currentColor" />
          <span className="text-xs font-bold text-[#1A998F] tracking-wide uppercase">InvoiceAI ⚡</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#102E3C] tracking-tight leading-[1.15] mb-6 max-w-4xl animate-slide-up delay-100">
          Create Professional Invoices <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-[#1A998F] via-[#187F87] to-[#155665] bg-clip-text text-transparent animate-gradient bg-[length:200%_200%]">
            in Seconds with AI
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-[#6B7280] max-w-2xl leading-relaxed mb-10 animate-slide-up delay-200">
          Generate invoices, manage clients, track payments, and export PDFs—all from one place.
        </p>

        {/* CTA Button — single Get Started */}
        <div className="flex items-center justify-center mb-16 animate-slide-up delay-300">
          <button
            onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
            className="btn-primary px-8 py-3.5 !text-base !rounded-xl shadow-lg shadow-teal-600/25 justify-center group"
          >
            Get Started <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* ─── Hero Invoice Illustration & Floating Cards ─── */}
        <div className="relative w-full max-w-4xl mx-auto mt-2 animate-scale-in delay-500">
          {/* Main Mockup Card */}
          <div className="relative bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_25px_60px_-15px_rgba(16,46,60,0.12)] p-6 sm:p-8 text-left overflow-hidden animate-glow">
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
            <div className="flex items-center justify-between pt-4 border-t border-[#E5E7EB] bg-[#F4F7F6] -mx-6 -mb-6 p-6 sm:-mx-8 sm:-mb-8 sm:p-8">
              <span className="text-xs text-[#6B7280] font-semibold">Payment Terms: Net 15 Days</span>
              <div className="text-right">
                <span className="text-xs text-[#6B7280] block">Total Amount</span>
                <span className="text-xl font-black text-[#1A998F]">₹50,000.00</span>
              </div>
            </div>
          </div>

          {/* Floating Card 1: AI Prompt Tag */}
          <div className="absolute -top-6 -left-4 sm:-left-8 bg-white border border-[#C4CFCE] rounded-xl p-3.5 shadow-xl flex items-center gap-3 animate-float hidden sm:flex">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <Sparkles size={16} className="text-purple-600" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-[#102E3C]">AI Prompt Generator</p>
              <p className="text-[11px] text-[#6B7280]">"₹50,000 React & Gemini dev..."</p>
            </div>
          </div>

          {/* Floating Card 2: Generated Time */}
          <div className="absolute -bottom-6 -right-4 sm:-right-8 bg-[#102E3C] text-white rounded-xl p-3.5 shadow-xl flex items-center gap-3 hidden sm:flex animate-float-slow">
            <div className="w-8 h-8 rounded-lg bg-[#1A998F] flex items-center justify-center">
              <Zap size={16} className="text-white" fill="white" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-white">Generated in 3.2s</p>
              <p className="text-[11px] text-[#C4CFCE]">Ready for PDF export</p>
            </div>
          </div>

          {/* Floating Card 3: Security badge */}
          <div className="absolute top-1/2 -right-4 sm:-right-12 -translate-y-1/2 bg-white border border-green-200 rounded-xl p-3 shadow-lg hidden lg:flex items-center gap-2 animate-float" style={{ animationDelay: '1s' }}>
            <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center">
              <ShieldCheck size={14} className="text-green-600" />
            </div>
            <div className="text-left">
              <p className="text-[11px] font-bold text-[#102E3C]">Secure</p>
              <p className="text-[10px] text-[#6B7280]">End-to-end</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ How It Works Section ═══ */}
      <section id="how-it-works" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 scroll-reveal">
            <h2 className="text-3xl font-extrabold text-[#102E3C] mb-3">How It Works</h2>
            <p className="text-sm text-[#6B7280] max-w-lg mx-auto">
              From idea to paid invoice in three simple steps. No accounting knowledge needed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-16 left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-[#1A998F] via-[#C4CFCE] to-[#1A998F] opacity-30" />

            {/* Step 1 */}
            <div className="text-center scroll-reveal" style={{ transitionDelay: '0ms' }}>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1A998F] to-[#155665] flex items-center justify-center mx-auto mb-5 shadow-lg shadow-teal-700/20 animate-float" style={{ animationDelay: '0s' }}>
                <span className="text-white font-black text-lg">1</span>
              </div>
              <h3 className="text-base font-bold text-[#102E3C] mb-2">Describe Your Work</h3>
              <p className="text-sm text-[#6B7280] leading-relaxed max-w-xs mx-auto">
                Type a natural language description of the services you provided — just like you'd tell a friend.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center scroll-reveal" style={{ transitionDelay: '150ms' }}>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1A998F] to-[#155665] flex items-center justify-center mx-auto mb-5 shadow-lg shadow-teal-700/20 animate-float" style={{ animationDelay: '0.5s' }}>
                <span className="text-white font-black text-lg">2</span>
              </div>
              <h3 className="text-base font-bold text-[#102E3C] mb-2">AI Generates Invoice</h3>
              <p className="text-sm text-[#6B7280] leading-relaxed max-w-xs mx-auto">
                Gemini AI structures line items, calculates taxes, sets due dates, and formats everything professionally.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center scroll-reveal" style={{ transitionDelay: '300ms' }}>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1A998F] to-[#155665] flex items-center justify-center mx-auto mb-5 shadow-lg shadow-teal-700/20 animate-float" style={{ animationDelay: '1s' }}>
                <span className="text-white font-black text-lg">3</span>
              </div>
              <h3 className="text-base font-bold text-[#102E3C] mb-2">Export & Send</h3>
              <p className="text-sm text-[#6B7280] leading-relaxed max-w-xs mx-auto">
                Download a branded PDF, manage payment status, and auto-generate a professional email to your client.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Testimonial / Trust Section ═══ */}
      <section className="py-16 bg-gradient-to-br from-[#102E3C] to-[#155665] px-6">
        <div className="max-w-4xl mx-auto text-center scroll-reveal">
          <div className="inline-flex items-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={18} className="text-amber-400 fill-amber-400" />
            ))}
          </div>
          <blockquote className="text-xl sm:text-2xl font-semibold text-white leading-relaxed mb-6 max-w-3xl mx-auto">
            "InvoiceAI turned my 30-minute invoicing routine into a 30-second task. The AI understands exactly what I need every time."
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1A998F] flex items-center justify-center text-white font-bold text-sm">
              SP
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-white">Shriya P.</p>
              <p className="text-xs text-[#C4CFCE]">Freelance Developer</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
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

      {/* ═══ Login Modal ═══ */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowAuthModal(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 animate-scale-in overflow-hidden"
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
                {authMode === 'signin' ? 'Welcome Back' : authMode === 'signup' ? 'Create Account' : 'Reset Password'}
              </h2>
              <p className="text-xs text-[#6B7280] mt-1">
                {authMode === 'forgot' ? "We'll send a reset link to your email" : 'Sign in to save and sync your invoices'}
              </p>
            </div>

            {/* Forgot Password Form */}
            {authMode === 'forgot' ? (
              <>
                <p className="text-sm text-[#6B7280] text-center mb-4">
                  Enter your email and we'll send you a reset link.
                </p>
                <form onSubmit={handleForgotPassword} className="flex flex-col gap-3">
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
                  <button type="submit" disabled={!!loading} className="btn-primary w-full justify-center py-2.5 !rounded-xl text-sm mt-1">
                    {loading === 'reset' ? (
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin-slow" />
                    ) : (
                      <ArrowRight size={16} />
                    )}
                    Send Reset Link
                  </button>
                </form>
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setAuthMode('signin')}
                    className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#1A998F] hover:underline mx-auto"
                  >
                    <ArrowLeft size={13} />
                    Back to Sign In
                  </button>
                </div>
              </>
            ) : (
              <>
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

                  {/* Remember me & Forgot password row */}
                  <div className="flex items-center justify-between mt-1 px-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-[#D1D5DB] text-[#1A998F] focus:ring-[#1A998F] focus:ring-offset-0 cursor-pointer"
                      />
                      <span className="text-xs text-[#6B7280] font-medium">Remember me</span>
                    </label>

                    {authMode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => setAuthMode('forgot')}
                        className="text-xs text-[#1A998F] hover:text-[#187F87] font-semibold transition-colors"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>

                  <button type="submit" disabled={!!loading} className="btn-primary w-full justify-center py-2.5 !rounded-xl text-sm mt-2">
                    {loading === 'email' ? (
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin-slow" />
                    ) : (
                      <ArrowRight size={16} />
                    )}
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
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
