import React, { useState } from 'react';
import { Mail, Lock, User, Loader, AlertCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { registerUser, loginUser, resetPassword } from './authService';

const AuthUI = ({ darkMode, onAuthSuccess }) => {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'reset') {
        await resetPassword(email);
        setSuccess('Password reset email sent. Check your inbox.');
        setLoading(false);
        return;
      }

      if (mode === 'signup') {
        if (!displayName.trim()) {
          setError('Please enter your name');
          setLoading(false);
          return;
        }
        await registerUser(email, password, displayName);
        setSuccess('Account created! Check your email to verify your address.');
      } else {
        await loginUser(email, password);
      }

      setEmail('');
      setPassword('');
      setDisplayName('');
      onAuthSuccess?.();
    } catch (err) {
      const messages = {
        'auth/email-already-in-use': 'This email is already registered',
        'auth/invalid-email': 'Invalid email address',
        'auth/weak-password': 'Password should be at least 6 characters',
        'auth/user-not-found': 'No account found with this email',
        'auth/wrong-password': 'Incorrect password',
        'auth/invalid-credential': 'Invalid email or password',
      };
      setError(messages[err.code] || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = `w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
    darkMode
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
  }`;

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 pb-8 ${
        darkMode
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
          : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
      }`}
    >
      <div
        className={`w-full max-w-md rounded-2xl shadow-2xl p-8 border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
      >
        <div className="flex flex-col items-center mb-8">
          <img src="/chassze-logo.svg" alt="" className="h-14 w-14 mb-3" width={56} height={56} />
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            CyberStudy
          </h1>
          <p className={`text-center text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {mode === 'login' && 'Welcome back'}
            {mode === 'signup' && 'Join our learning community'}
            {mode === 'reset' && 'Reset your password'}
          </p>
        </div>

        {error && (
          <div
            className={`mb-4 p-4 rounded-lg border flex gap-3 ${
              darkMode ? 'bg-red-900/20 border-red-700 text-red-300' : 'bg-red-50 border-red-200 text-red-700'
            }`}
            role="alert"
          >
            <AlertCircle size={20} className="flex-shrink-0" aria-hidden />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div
            className={`mb-4 p-4 rounded-lg border text-sm ${
              darkMode ? 'bg-green-900/20 border-green-700 text-green-300' : 'bg-green-50 border-green-200 text-green-800'
            }`}
            role="status"
          >
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'signup' && (
            <div>
              <label htmlFor="auth-name" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Full name
              </label>
              <div className="relative">
                <User className={`absolute left-3 top-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={18} aria-hidden />
                <input
                  id="auth-name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  className={inputCls}
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="auth-email" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Email
            </label>
            <div className="relative">
              <Mail className={`absolute left-3 top-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={18} aria-hidden />
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                autoComplete="email"
                className={inputCls}
              />
            </div>
          </div>

          {mode !== 'reset' && (
            <div>
              <label htmlFor="auth-password" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={18} aria-hidden />
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  className={`${inputCls} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-3 focus-visible:ring-2 focus-visible:ring-indigo-500 rounded ${
                    darkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          {mode === 'login' && (
            <button
              type="button"
              onClick={() => {
                setMode('reset');
                setError('');
                setSuccess('');
              }}
              className={`text-sm ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}
            >
              Forgot password?
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50`}
          >
            {loading && <Loader size={18} className="animate-spin" aria-hidden />}
            {mode === 'login' && (loading ? 'Signing in…' : 'Sign in')}
            {mode === 'signup' && (loading ? 'Creating account…' : 'Create account')}
            {mode === 'reset' && (loading ? 'Sending…' : 'Send reset email')}
          </button>
        </form>

        <div className={`mt-6 text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {mode === 'reset' ? (
            <button
              type="button"
              onClick={() => setMode('login')}
              className="inline-flex items-center gap-1 font-semibold text-indigo-500"
            >
              <ArrowLeft size={14} aria-hidden />
              Back to sign in
            </button>
          ) : (
            <>
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
              {' '}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login');
                  setError('');
                  setSuccess('');
                }}
                className="font-semibold text-indigo-500"
              >
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthUI;
