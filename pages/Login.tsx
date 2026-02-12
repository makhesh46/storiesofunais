import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { BookOpen, ArrowLeft, Mail } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // New state for Forgot Password flow
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const { login, signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isSignup = searchParams.get('mode') === 'signup';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isSignup) {
        if (!name.trim()) throw new Error('Name is required');
        await signup(email, password, name);
      } else {
        await login(email, password);
      }
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setIsLoading(true);
    // Simulate API request
    setTimeout(() => {
      setIsLoading(false);
      setResetSent(true);
      setError('');
    }, 1500);
  };

  // Forgot Password View
  if (isForgotPassword) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 p-8 md:p-10">
          <button
            onClick={() => { setIsForgotPassword(false); setResetSent(false); setError(''); }}
            className="flex items-center text-sm text-stone-500 hover:text-stone-900 dark:hover:text-stone-300 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Login
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex bg-stone-100 dark:bg-stone-800 p-3 rounded-xl mb-4">
              <Mail className="h-8 w-8 text-stone-600 dark:text-stone-300" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-white">
              Reset Password
            </h2>
            <p className="text-stone-500 mt-2 text-sm">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {resetSent ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg text-center">
              <p className="text-green-700 dark:text-green-300 font-medium mb-2">Check your inbox</p>
              <p className="text-sm text-green-600 dark:text-green-400">
                We've sent a password reset link to <strong>{email}</strong>.
              </p>
              <button
                onClick={() => { setIsForgotPassword(false); setResetSent(false); }}
                className="mt-4 text-sm text-green-700 dark:text-green-300 font-bold hover:underline"
              >
                Return to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                  placeholder="name@example.com"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isLoading ? 'Sending Link...' : 'Send Reset Link'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 p-8 md:p-10">
        <div className="text-center mb-8">
          <div className="inline-flex bg-primary-600 p-3 rounded-xl mb-4">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-stone-900 dark:text-white">
            {isSignup ? 'Start your journey' : 'Welcome back'}
          </h2>
          <p className="text-stone-500 mt-2">
            {isSignup ? 'Create an account to join the community.' : 'Sign in to access your account.'}
          </p>
        </div>

        <div className="flex justify-center mb-6">
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              if (credentialResponse.credential) {
                try {
                  setIsLoading(true);
                  await loginWithGoogle(credentialResponse.credential);
                  navigate('/');
                } catch (err: any) {
                  setError(err.message || 'Google Sign-In failed');
                  setIsLoading(false);
                }
              }
            }}
            onError={() => {
              setError('Google Sign-In failed');
            }}
            theme={window.matchMedia('(prefers-color-scheme: dark)').matches ? 'filled_black' : 'outline'}
          />
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-200 dark:border-stone-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-stone-900 text-stone-500">Or continue with email</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {isSignup && (
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                placeholder="John Doe"
                required={isSignup}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
              placeholder="name@example.com"
              required
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">Password</label>
              {!isSignup && (
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-700 focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : (isSignup ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-stone-500">
          {isSignup ? (
            <p>
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          ) : (
            <p>
              Don't have an account?{' '}
              <Link to="/login?mode=signup" className="text-primary-600 font-medium hover:underline">
                Sign up
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};