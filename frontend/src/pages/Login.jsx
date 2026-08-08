import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { signInWithEmail, signUpWithEmail } from '../firebase/auth';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const go = () => navigate('/dashboard');

  const handleEmail = async (e) => {
    e.preventDefault();
    setLoading('email');
    try {
      if (mode === 'signin') await signInWithEmail(form.email, form.password);
      else await signUpWithEmail(form.email, form.password, form.name);
      go();
      toast.success(mode === 'signin' ? 'Welcome back!' : 'Account created!');
    } catch (err) {
      const msg =
        err.code === 'auth/configuration-not-found' || err.code === 'auth/operation-not-allowed'
          ? 'Email sign-in is not enabled yet. Enable it in Firebase Console → Authentication → Sign-in method.'
          : err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password'
          ? 'Incorrect email or password.'
          : err.code === 'auth/user-not-found'
          ? 'No account found with this email.'
          : err.code === 'auth/email-already-in-use'
          ? 'An account with this email already exists.'
          : err.message || 'Authentication failed';
      toast.error(msg);
    } finally {
      setLoading('');
    }
  };

  // Bypass Firebase — use localStorage mock to enter app without signing in
  const handleSkip = () => {
    const mockUser = { uid: 'skip-user', displayName: 'You', email: '', isAnonymous: true };
    localStorage.setItem('invoice_ai_mock_user', JSON.stringify(mockUser));
    window.IS_MOCKED_FIREBASE = true;
    window.dispatchEvent(new Event('mock_auth_changed'));
    go();
    toast.success('Entered without signing in');
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
              {mode === 'signin' ? 'Sign in to your account' : 'Create your free account'}
            </p>
          </div>

          {/* Trust pill */}
          <div className="flex items-center justify-center mb-6">
            <span className="badge badge-blue text-xs">
              ✨ AI-powered invoicing — zero accounting jargon
            </span>
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
              className="text-sm font-semibold text-[#1A998F] hover:text-[#187F87] transition-colors"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </div>

          {/* Skip for now */}
          <div className="mt-5 pt-4 border-t border-[#E5E7EB] text-center">
            <button
              id="btn-skip"
              onClick={handleSkip}
              className="text-xs text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
            >
              Skip for now — explore without signing in →
            </button>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-[#9CA3AF] mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
