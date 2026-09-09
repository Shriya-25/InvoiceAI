import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, User, ArrowRight, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { signInWithEmail, signUpWithEmail, resetPassword } from '../firebase/auth';
import { saveProfile } from '../firebase/firestore';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup' | 'forgot'
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  const go = () => navigate('/dashboard');

  const handleEmail = async (e) => {
    e.preventDefault();
    if (mode === 'signup') {
      if (!form.name || !form.name.trim()) {
        toast.error('Full Name is required');
        return;
      }
      if (!form.email || (!form.email.includes('@') && form.email !== 'demouser')) {
        toast.error('Please enter a valid email address');
        return;
      }
      if (!form.password || form.password.length < 6) {
        toast.error('Password must be at least 6 characters long');
        return;
      }
      if (form.password !== form.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
    }
    setLoading('email');
    try {
      if (mode === 'signin') {
        await signInWithEmail(form.email, form.password, rememberMe);
      } else {
        const cred = await signUpWithEmail(form.email, form.password, form.name, rememberMe);
        const uid = cred?.user?.uid;
        if (uid) {
          // Initialize business profile with appropriate empty/default values
          await saveProfile(uid, {
            businessName: form.name,
            address: '',
            gstNumber: '',
            email: form.email,
            defaultCurrency: 'INR',
            logoUrl: '',
            signatureUrl: ''
          });
        }
      }
      go();
      toast.success(mode === 'signin' ? 'Welcome back!' : 'Account created successfully!');
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
          : err.code === 'auth/invalid-email'
          ? 'Invalid email address. Please enter a valid email.'
          : err.message || 'Authentication failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading('');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!form.email) {
      toast.error('Please enter your email address.');
      return;
    }
    setLoading('reset');
    try {
      await resetPassword(form.email);
      toast.success('Password reset email sent! Check your inbox.');
      setMode('signin');
    } catch (err) {
      const msg =
        err.code === 'auth/user-not-found'
          ? 'No account found with this email address.'
          : err.code === 'auth/invalid-email'
          ? 'Invalid email address.'
          : err.code === 'auth/too-many-requests'
          ? 'Too many requests. Please wait a moment before trying again.'
          : err.message || 'Failed to send reset email. Please try again.';
      toast.error(msg);
    } finally {
      setLoading('');
    }
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E6F4F3] via-white to-[#F4F7F6] flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#1A998F]/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#1A998F]/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Hero card */}
        <div className="card p-8">
          {/* Brand */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#1A998F] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-500/30">
              <Zap size={24} className="text-white" fill="white" />
            </div>
            <h1 className="text-2xl font-bold text-[#102E3C] mb-1">InvoiceAI</h1>
            <p className="text-sm text-[#6B7280]">
              {mode === 'signin' && 'Sign in to your account'}
              {mode === 'signup' && 'Create your free account'}
              {mode === 'forgot' && 'Reset your password'}
            </p>
          </div>

          {/* Trust pill — only show on signin/signup */}
          {mode !== 'forgot' && (
            <div className="flex items-center justify-center mb-6">
              <span className="badge badge-blue text-xs">
                ✨ AI-powered invoicing — zero accounting jargon
              </span>
            </div>
          )}

          {/* Forgot Password Form */}
          {mode === 'forgot' ? (
            <>
              <p className="text-sm text-[#6B7280] text-center mb-5">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              <form onSubmit={handleForgotPassword} className="flex flex-col gap-3">
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    id="input-reset-email"
                    type="text"
                    placeholder="Email address"
                    required
                    value={form.email}
                    onChange={set('email')}
                    className="input-field !pl-9"
                  />
                </div>
                <button
                  id="btn-reset-submit"
                  type="submit"
                  disabled={!!loading}
                  className="btn-primary w-full justify-center py-3 !text-sm !rounded-xl"
                >
                  {loading === 'reset' ? (
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin-slow" />
                  ) : (
                    <ArrowRight size={16} />
                  )}
                  Send Reset Link
                </button>
              </form>
              <div className="flex items-center justify-center mt-4">
                <button
                  onClick={() => setMode('signin')}
                  className="flex items-center gap-1.5 text-sm font-semibold text-[#1A998F] hover:text-[#187F87] transition-colors"
                >
                  <ArrowLeft size={14} />
                  Back to Sign In
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Email form */}
              <form onSubmit={handleEmail} className="flex flex-col gap-3">
                {mode === 'signup' && (
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                    <input
                      id="input-name"
                      type="text"
                      placeholder="Full name"
                      required
                      value={form.name}
                      onChange={set('name')}
                      className="input-field !pl-9"
                    />
                  </div>
                )}
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    id="input-email"
                    type="text"
                    placeholder="Email address"
                    required
                    value={form.email}
                    onChange={set('email')}
                    className="input-field !pl-9"
                  />
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    id="input-password"
                    type={showPass ? 'text' : 'password'}
                    placeholder="Password"
                    required
                    minLength={6}
                    value={form.password}
                    onChange={set('password')}
                    className="input-field !pl-9 !pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Confirm Password input in signup mode */}
                {mode === 'signup' && (
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                    <input
                      id="input-confirm-password"
                      type={showPass ? 'text' : 'password'}
                      placeholder="Confirm Password"
                      required
                      minLength={6}
                      value={form.confirmPassword}
                      onChange={set('confirmPassword')}
                      className="input-field !pl-9 !pr-9"
                    />
                  </div>
                )}

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

                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-xs text-[#1A998F] hover:text-[#187F87] font-semibold transition-colors"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>

                <button
                  id="btn-email-submit"
                  type="submit"
                  disabled={!!loading}
                  className="btn-primary w-full justify-center py-3 !text-sm !rounded-xl mt-2"
                >
                  {loading === 'email' ? (
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin-slow" />
                  ) : (
                    <ArrowRight size={16} />
                  )}
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                </button>
              </form>

              {/* Toggle mode */}
              <div className="flex items-center justify-center gap-1.5 mt-4">
                <span className="text-sm text-[#6B7280]">
                  {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
                </span>
                <button
                  onClick={() => setMode(m => m === 'signin' ? 'signup' : 'signin')}
                  className="text-sm font-semibold text-[#1A998F] hover:text-[#187F87] transition-colors"
                >
                  {mode === 'signin' ? 'Sign up' : 'Sign in'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-[#9CA3AF] mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}

