import { NavLink, useNavigate } from 'react-router-dom';
import {
  Inbox,
  BookOpen,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Moon,
  Sun,
  LogOut,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import clsx from 'clsx';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { label: 'Inbox', icon: Inbox, to: '/' },
  { label: 'Settings', icon: Settings, to: '/settings' },
];

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { dark, toggleDark } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside
      className={clsx(
        'flex flex-col h-full border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transition-all duration-200',
        collapsed ? 'w-14' : 'w-52'
      )}
    >
      {/* Brand */}
      <div className="flex items-center justify-between px-3 py-4 border-b border-gray-100 dark:border-gray-700">
        {!collapsed && (
          <span className="text-base font-bold text-gray-800 dark:text-white tracking-tight">
            MailDock
          </span>
        )}
        <button
          onClick={onToggle}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-3 space-y-1">
        {navItems.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={label}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-2 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              )
            }
          >
            <Icon size={16} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}

        {/* API Guide — external link */}
        <a
          href="https://www.smtpbucket.com/api"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-2 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <BookOpen size={16} className="shrink-0" />
          {!collapsed && (
            <span className="flex items-center gap-1">
              API Guide
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </span>
          )}
        </a>
      </nav>

      {/* Bottom: theme toggle + logout */}
      <div className="px-2 py-3 border-t border-gray-100 dark:border-gray-700 space-y-1">
        <button
          onClick={toggleDark}
          className="flex items-center gap-3 w-full px-2 py-2 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
          aria-label="Toggle dark mode"
        >
          {dark ? <Sun size={16} className="shrink-0" /> : <Moon size={16} className="shrink-0" />}
          {!collapsed && <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-2 py-2 rounded-md text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 transition-colors cursor-pointer"
          aria-label="Logout"
        >
          <LogOut size={16} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
