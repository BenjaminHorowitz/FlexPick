import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { validateUsername } from '../lib/usernameValidation';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');

  const { signIn, signUp } = useAuth();

  if (!isOpen) return null;

  const handleClose = () => {
    setIsSignUp(false);
    setError('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setDisplayName('');
    setUsernameError('');
    onClose();
  };

  const handleUsernameChange = (value: string) => {
    setDisplayName(value);

    if (!value.trim()) {
      setUsernameError('');
      return;
    }

    const validation = validateUsername(value);
    if (validation.isValid) {
      setUsernameError('');
    } else {
      setUsernameError(validation.error || '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const name = displayName.trim();

        const usernameValidation = validateUsername(name);
        if (!usernameValidation.isValid) {
          setError(usernameValidation.error || 'Invalid username');
          setLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, name);
        if (error) {
          setError(error.message);
        } else {
          setEmail('');
          setPassword('');
          setConfirmPassword('');
          setDisplayName('');
          handleClose();
        }
      } else {
        const emailValue = email.trim();
        if (!emailValue) {
          setError('Email is required');
          setLoading(false);
          return;
        }
        const { error } = await signIn(emailValue, password);
        if (error) {
          setError(error.message);
        } else {
          setEmail('');
          setPassword('');
          handleClose();
        }
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setDisplayName('');
    setUsernameError('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#000814] focus:border-transparent transition-all"
              placeholder=""
            />
          </div>

          {isSignUp && (
            <div className="mb-4">
              <label
                htmlFor="displayName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="displayName"
                  value={displayName}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  required
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#000814] focus:border-transparent transition-all pr-10 ${
                    displayName && usernameError
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                />
                {displayName && usernameError && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  </div>
                )}
              </div>
              {usernameError && (
                <p className="mt-1 text-xs text-red-600">{usernameError}</p>
              )}
            </div>
          )}

          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#000814] focus:border-transparent transition-all"
              placeholder=""
            />
          </div>

          {isSignUp && (
            <div className="mb-6">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#000814] focus:border-transparent transition-all"
                placeholder=""
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#000814] text-white py-3 rounded-lg font-semibold hover:bg-[#001d3d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-[#000814] hover:underline text-sm font-medium"
            >
              {isSignUp
                ? 'Already have an account? Sign In'
                : "Don't have an account? Sign Up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
