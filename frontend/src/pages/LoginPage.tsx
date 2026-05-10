import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import bgImage from '../assets/background.png';
import logoWhite from '../assets/logo-white.png';
import logoPurple from '../assets/logo-purple.png';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim()) { setError('Please enter your username or email.'); return; }
    if (!password) { setError('Please enter your password.'); return; }

    // Basic format validation
    if (!username.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const ok = login(username, password);
    setLoading(false);

    if (ok) {
      navigate('/', { replace: true });
    } else {
      // Distinguish wrong user vs wrong password for UX
      const knownUser = username.trim().toLowerCase() === 'qa@keka.com';
      setError(
        knownUser
          ? 'Incorrect password. Please try again.'
          : 'No account found with that email address.'
      );
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel ── */}
      <div
        className="hidden lg:flex lg:w-[62%] relative flex-col justify-between p-10 overflow-hidden"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Logo bottom-left */}
        <div className="relative z-10 mt-auto">
          <img
            src={logoWhite}
            alt="MailDock"
            className="w-52 mb-6 opacity-95"
          />
          <h2 className="text-white text-3xl font-extrabold leading-tight mb-2">
            Keep inboxes organized.
          </h2>
          <p className="text-white/60 text-sm leading-relaxed max-w-sm">
            Automatically categorize every email by environment — Dev, Stage, UAT.
          </p>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-14 lg:px-16 bg-white relative">
        {/* Purple logo */}
        <div className="mb-8">
          <img src={logoPurple} alt="MailDock" className="h-20 w-auto" />
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back to MailDock</h1>
        <p className="text-sm text-gray-500 mb-8">
          Please enter your credentials to access your inbox.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 max-w-sm w-full">
          <input
            type="text"
            placeholder="Username or Email"
            value={username}
            onChange={(e) => { setUsername(e.target.value); setError(''); }}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
            autoComplete="username"
            autoFocus
          />

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              className="w-full px-4 py-3 pr-11 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <Eye size={17} /> : <EyeOff size={17} />}
            </button>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-[#1e2463] hover:bg-[#272f7a] text-white font-semibold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Signing in…
              </>
            ) : 'Log In'}
          </button>
        </form>

        <button
          className="absolute bottom-6 right-6 w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 transition-colors"
          aria-label="Help"
        >
          <HelpCircle size={18} />
        </button>
      </div>
    </div>
  );
}

