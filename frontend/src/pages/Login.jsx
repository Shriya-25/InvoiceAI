import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { signInWithGoogle, signInWithEmail, signUpWithEmail, signInAsGuest } from '../firebase/auth';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const go = () => navigate('/dashboard');

  const handleGoogle = async () => {
    setLoading('google');
    try { await signInWithGoogle(); go(); toast.success('Welcome!'); }
    catch (e) { toast.error(e.message || 'Google sign-in failed'); }
    finally { setLoading(''); }
  };

  const handleEmail = async (e) => {
    e.preventDefault();
    setLoading('email');
    try {
      if (mode === 'signin') await signInWithEmail(form.email, form.password);
      else await signUpWithEmail(form.email, form.password, form.name);
      go(); toast.success(mode === 'signin' ? 'Welcome back!' : 'Account created!');
    } catch (e) { toast.error(e.message || 'Authentication failed'); }
    finally { setLoading(''); }
  };

  const handleGuest = async () => {
    setLoading('guest');
    try { await signInAsGuest(); go(); toast.success('Signed in as Guest'); }
    catch (e) { toast.error('Failed to sign in as guest'); }
    finally { setLoading(''); }
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EFF4FF] via-white to-[#F7F9FC] flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#2563EB]/8 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#2563EB]/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Hero card */}
        <div className="card p-8">
          {/* Brand */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#2563EB] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
              <Zap size={24} className="text-white" fill="white" />
            </div>
            <h1 className="text-2xl font-bold text-[#0F1115] mb-1">InvoiceAI</h1>
            <p className="text-sm text-[#6B7280]">
              {mode === 'signin' ? 'Sign in to your account' : 'Create your free account'}
            </p>
          </div>

          {/* Trust pill */}
          <div className="flex items-center justify-center mb-6">
            <span className="badge badge-blue text-xs">
              ✨ AI-powered invoicing — zero accounting jargon
            </span>
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={!!loading}
            id="btn-google-signin"
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-[#E5E7EB] rounded-xl font-semibold text-sm text-[#0F1115] bg-white hover:bg-[#F7F9FC] hover:border-[#D1D5DB] transition-all mb-4 disabled:opacity-50"
          >
            {loading === 'google' ? (
              <span className="w-5 h-5 border-2 border-[#E5E7EB] border-t-[#2563EB] rounded-full animate-spin-slow" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-[#E5E7EB]" />
            <span className="text-xs text-[#6B7280] font-medium">or</span>
            <div className="flex-1 h-px bg-[#E5E7EB]" />
          </div>

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
                type="email"
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
            <button
              id="btn-email-submit"
              type="submit"
              disabled={!!loading}
              className="btn-primary w-full justify-center py-3 !text-sm !rounded-xl"
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
              className="text-sm font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </div>

          {/* Guest */}
          <div className="mt-5 pt-5 border-t border-[#E5E7EB]">
            <button
              id="btn-guest"
              onClick={handleGuest}
              disabled={!!loading}
              className="w-full text-center text-sm text-[#6B7280] hover:text-[#0F1115] transition-colors py-2 rounded-lg hover:bg-[#F7F9FC] disabled:opacity-50"
            >
              {loading === 'guest' ? (
                <span className="inline-block w-3 h-3 border-2 border-[#D1D5DB] border-t-[#6B7280] rounded-full animate-spin-slow mr-1" />
              ) : null}
              Continue as Guest →
            </button>
            <p className="text-center text-xs text-[#9CA3AF] mt-1">No sign-up required — try before you commit</p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[#9CA3AF] mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
