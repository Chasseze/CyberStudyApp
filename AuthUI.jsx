import React, { useState } from 'react';
import { Mail, Lock, User, Loader, AlertCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { registerUser, loginUser, resetPassword } from './authService';

const AuthUI = ({ darkMode }) => {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const inputCls = `w-full pl-10 pr-4 py-2 rounded-lg border focus-visible:ring-2 focus-visible:ring-indigo-500 ${
    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
  }`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (mode === 'reset') {
        await resetPassword(email);
        setSuccess('Password reset email sent. Check your inbox.');
        return;
      }
      if (mode === 'signup') {
        if (!displayName.trim()) { setError('Please enter your name'); return; }
        await registerUser(email, password, displayName);
        setSuccess('Account created! Check your email to verify.');
      } else {
        await loginUser(email, password);
      }
      setEmail('');
      setPassword('');
      setDisplayName('');
    } catch (err) {
      const map = {
        'auth/email-already-in-use': 'Email already registered',
        'auth/invalid-credential': 'Invalid email or password',
        'auth/wrong-password': 'Incorrect password',
      };
      setError(map[err.code] || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'}`}>
      <div className={`w-full max-w-md rounded-2xl shadow-2xl p-8 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex flex-col items-center mb-8">
          <img src="/chassze-logo.svg" alt="" className="h-14 w-14 mb-3" width={56} height={56} />
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>CyberStudy</h1>
          <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create your account' : 'Reset password'}
          </p>
        </div>
        {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm flex gap-2" role="alert"><AlertCircle size={18} />{error}</div>}
        {success && <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-800 text-sm" role="status">{success}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label htmlFor="auth-name" className="text-sm font-medium">Full name</label>
              <div className="relative mt-1"><User className="absolute left-3 top-3 text-gray-400" size={18} /><input id="auth-name" className={inputCls} value={displayName} onChange={(e) => setDisplayName(e.target.value)} /></div>
            </div>
          )}
          <div>
            <label htmlFor="auth-email" className="text-sm font-medium">Email</label>
            <div className="relative mt-1"><Mail className="absolute left-3 top-3 text-gray-400" size={18} /><input id="auth-email" type="email" required className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          </div>
          {mode !== 'reset' && (
            <div>
              <label htmlFor="auth-password" className="text-sm font-medium">Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input id="auth-password" type={showPassword ? 'text' : 'password'} required className={`${inputCls} pr-10`} value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" className="absolute right-3 top-3" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
            </div>
          )}
          {mode === 'login' && (
            <button type="button" className="text-sm text-indigo-600" onClick={() => { setMode('reset'); setError(''); }}>Forgot password?</button>
          )}
          <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg font-semibold bg-indigo-600 text-white disabled:opacity-50">
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send reset email'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          {mode === 'reset' ? (
            <button type="button" className="text-indigo-600 inline-flex items-center gap-1" onClick={() => setMode('login')}><ArrowLeft size={14} />Back to sign in</button>
          ) : (
            <> {mode === 'login' ? 'No account?' : 'Have an account?'}{' '}
              <button type="button" className="text-indigo-600 font-semibold" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}>
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default AuthUI;
