import { Settings, User, Palette, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function SettingsPage() {
  const { dark, toggleDark } = useTheme();

  return (
    <div className="h-full overflow-y-auto scrollbar-thin bg-gray-50 dark:bg-gray-950">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Settings className="text-gray-400" size={24} />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        </div>

        <div className="space-y-4">
          {/* Account */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 flex items-center gap-4 hover:shadow-sm transition-shadow cursor-pointer">
            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
              <User size={18} className="text-gray-500 dark:text-gray-400" />
            </div>
            <div className="flex-1">
              <h2 className="font-medium text-gray-900 dark:text-white">Account</h2>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-0.5">Manage your account preferences and profile.</p>
            </div>
            <svg className="w-4 h-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>

          {/* Appearance */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                <Palette size={18} className="text-gray-500 dark:text-gray-400" />
              </div>
              <div>
                <h2 className="font-medium text-gray-900 dark:text-white">Appearance</h2>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-0.5">Customize the look and feel of MailDock.</p>
              </div>
            </div>

            {/* Theme toggle row */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                {dark ? <Moon size={16} className="text-indigo-400" /> : <Sun size={16} className="text-amber-500" />}
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {dark ? 'Dark Mode' : 'Light Mode'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {dark ? 'Switch to light theme' : 'Switch to dark theme'}
                  </p>
                </div>
              </div>
              {/* Toggle switch */}
              <button
                onClick={toggleDark}
                role="switch"
                aria-checked={dark}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  dark ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    dark ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-300 dark:text-gray-700 mt-12">
          MailDock v1.0.0
        </p>
      </div>
    </div>
  );
}
