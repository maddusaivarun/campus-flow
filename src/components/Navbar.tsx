import React from 'react';
import {
  ShieldCheck,
  Calendar,
  Sparkles,
  Ticket,
  FileText,
  Bell,
  LogIn,
  LogOut,
  UserCog,
  Globe,
  Plus,
  Lock,
  User,
  Sun,
  Moon,
  Users,
  History,
  BarChart3,
  Layers
} from 'lucide-react';
import { UserProfile, UserRole, SystemNotification } from '../types';
import { VignanLogo } from './VignanLogo';

interface NavbarProps {
  currentUser?: UserProfile | null;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  pendingCount: number;
  notifications: SystemNotification[];
  onOpenNotifications: () => void;
  onOpenAuthModal: (mode?: 'signin' | 'signup', role?: UserRole) => void;
  onSignOut: () => void;
  onOpenCustomizeProfile?: () => void;
  onProposeEvent?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  onSelectTab,
  pendingCount,
  notifications,
  onOpenNotifications,
  onOpenAuthModal,
  onSignOut,
  onOpenCustomizeProfile,
  onProposeEvent,
  isDarkMode = false,
  onToggleDarkMode
}) => {
  const unreadNotifs = notifications.filter((n) => !n.read).length;
  const isAuthenticated = Boolean(currentUser && currentUser.role && currentUser.role !== 'PUBLIC');
  const isHOD = currentUser?.role === 'HOD';
  const isFaculty = currentUser?.role === 'FACULTY';

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Top Banner: Official Vignan University Institutional Header */}
      <div className="bg-[#0b1c30] dark:bg-slate-950 text-slate-200 text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-1 rounded-md">
            <VignanLogo size="sm" showText={false} />
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-900/80 text-blue-200 font-mono text-[11px] font-semibold border border-blue-700/50">
            VIGNAN UNIVERSITY
          </span>
          <span className="hidden sm:inline text-slate-300 font-medium">
            Department of CSBS & IoT • NAAC 'A+'
          </span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-emerald-400 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Statutory Clearance Portal
          </span>
        </div>

        {/* Right Status / Quick Portal Access Indicator */}
        <div className="flex items-center gap-3">
          {/* Dark Mode Toggle Button in Institutional Bar */}
          {onToggleDarkMode && (
            <button
              type="button"
              onClick={onToggleDarkMode}
              className="p-1 rounded-md text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5 text-xs"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-300" />
                  <span className="text-[11px] font-medium hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-300" />
                  <span className="text-[11px] font-medium hidden sm:inline">Dark</span>
                </>
              )}
            </button>
          )}

          {!isAuthenticated ? (
            <div className="flex items-center gap-2 text-xs">
              <span className="hidden sm:inline text-slate-400">
                Browsing as Public Guest
              </span>
              <button
                onClick={() => onOpenAuthModal('signin')}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-xs transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Portal Sign In</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 hidden sm:inline">
                Authenticated:
              </span>
              <span
                className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] tracking-wider uppercase ${
                  isHOD
                    ? 'bg-amber-400 text-slate-950'
                    : isFaculty
                    ? 'bg-blue-500 text-white'
                    : 'bg-emerald-500 text-white'
                }`}
              >
                {currentUser?.role} MODE
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Product Title */}
          <div className="flex items-center gap-3 shrink-0">
            <VignanLogo
              size="md"
              className="h-10 sm:h-12 w-auto object-contain bg-white dark:bg-slate-800 rounded p-0.5 shadow-2xs"
            />
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />
            <button
              onClick={() => onSelectTab('discover')}
              className="flex items-center gap-2 text-left group"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white font-display">
                    CAMPUS<span className="text-blue-600 dark:text-blue-400">FLOW</span>
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-none">
                  Department of CSBS & IoT
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 ml-2">
            {/* Public Catalog */}
            <button
              onClick={() => onSelectTab('discover')}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                activeTab === 'discover'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Public Catalog</span>
            </button>

            {/* Events Calendar */}
            <button
              onClick={() => onSelectTab('calendar')}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                activeTab === 'calendar'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Calendar</span>
            </button>

            {/* My Registrations & Passes */}
            <button
              onClick={() => onSelectTab('my-passes')}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                activeTab === 'my-passes'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>My Registrations</span>
            </button>

            {/* Faculty Studio */}
            {(isFaculty || isHOD) && (
              <button
                onClick={() => onSelectTab('faculty-studio')}
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                  activeTab === 'faculty-studio'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Faculty Studio</span>
              </button>
            )}

            {/* Gate Attendance & Attendee Rosters */}
            {(isFaculty || isHOD || currentUser?.role === 'GATE_SECURITY') && (
              <button
                onClick={() => onSelectTab('participants')}
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                  activeTab === 'participants'
                    ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold border border-teal-200 dark:border-teal-800'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Attendance & Rosters</span>
              </button>
            )}

            {/* HOD Approval Queue */}
            {isHOD && (
              <button
                onClick={() => onSelectTab('hod-review')}
                className={`relative px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                  activeTab === 'hod-review'
                    ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 font-semibold border border-amber-300 dark:border-amber-700'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>HOD Review</span>
                {pendingCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white animate-pulse">
                    {pendingCount}
                  </span>
                )}
              </button>
            )}

            {/* Audit Trail */}
            {(isHOD || isFaculty) && (
              <button
                onClick={() => onSelectTab('audit-trail')}
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                  activeTab === 'audit-trail'
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Statutory Governance & Sign-off Audit Logs"
              >
                <History className="w-4 h-4" />
                <span className="hidden xl:inline">Audit Trail</span>
              </button>
            )}

            {/* Feedback & IQAC Analytics */}
            {(isHOD || isFaculty) && (
              <button
                onClick={() => onSelectTab('feedback-analytics')}
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                  activeTab === 'feedback-analytics'
                    ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold border border-purple-200 dark:border-purple-800'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Student Feedback & NAAC Analytics"
              >
                <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="hidden xl:inline">Analytics</span>
              </button>
            )}

            {/* Propose Event Quick Button */}
            {onProposeEvent && (
              <button
                id="btn-propose-event"
                onClick={onProposeEvent}
                className="px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                title="Draft a new departmental event charter for HOD clearance"
              >
                <Plus className="w-4 h-4" />
                <span>Propose Event</span>
              </button>
            )}
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notifications Button */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Department Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifs > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
              )}
            </button>

            {/* Dark Mode Icon Button on Navbar */}
            {onToggleDarkMode && (
              <button
                type="button"
                onClick={onToggleDarkMode}
                className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label="Toggle color theme"
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-amber-400" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                )}
              </button>
            )}

            {/* User Profile Pill / Real Authentication Actions */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onOpenCustomizeProfile}
                  title="Click to customize name, designation, and photo"
                  className="flex items-center gap-2 text-left group hover:opacity-90 transition-opacity"
                >
                  {currentUser?.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser?.name || 'User'}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500 shadow-xs"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 flex items-center justify-center font-bold text-xs shadow-xs">
                      {(currentUser?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex items-center gap-1 transition-colors">
                      {currentUser?.name || 'Staff Member'}
                      {isHOD && (
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-500 inline" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      {currentUser?.identifier || ''} • {currentUser?.role}
                    </div>
                  </div>
                </button>

                {onOpenCustomizeProfile && (
                  <button
                    onClick={onOpenCustomizeProfile}
                    title="Edit Name & Photo"
                    className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <UserCog className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={onSignOut}
                  title="Sign Out to Public View"
                  className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-xs"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden lg:inline text-[11px] font-medium">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => onOpenAuthModal('signin')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Portal Sign In</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Horizontal Navigation Bar */}
        <div className="md:hidden flex items-center gap-1 px-2 py-2 border-t border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar text-xs">
          <button
            onClick={() => onSelectTab('discover')}
            className={`px-3 py-1.5 rounded-lg shrink-0 font-bold flex items-center gap-1.5 ${
              activeTab === 'discover'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Catalog
          </button>

          <button
            onClick={() => onSelectTab('calendar')}
            className={`px-3 py-1.5 rounded-lg shrink-0 font-bold flex items-center gap-1.5 ${
              activeTab === 'calendar'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Calendar
          </button>

          <button
            onClick={() => onSelectTab('my-passes')}
            className={`px-3 py-1.5 rounded-lg shrink-0 font-bold flex items-center gap-1.5 ${
              activeTab === 'my-passes'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Registrations
          </button>

          {/* Faculty Studio (Mobile) */}
          {(isFaculty || isHOD) && (
            <button
              onClick={() => onSelectTab('faculty-studio')}
              className={`px-3 py-1.5 rounded-lg shrink-0 font-bold flex items-center gap-1.5 ${
                activeTab === 'faculty-studio'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Faculty Studio
            </button>
          )}

          {/* Gate Attendance / Rosters (Mobile) */}
          {(isFaculty || isHOD || currentUser?.role === 'GATE_SECURITY') && (
            <button
              onClick={() => onSelectTab('participants')}
              className={`px-3 py-1.5 rounded-lg shrink-0 font-bold flex items-center gap-1.5 ${
                activeTab === 'participants'
                  ? 'bg-teal-600 text-white'
                  : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Rosters
            </button>
          )}

          {isHOD && (
            <button
              onClick={() => onSelectTab('hod-review')}
              className={`px-3 py-1.5 rounded-lg shrink-0 font-bold flex items-center gap-1.5 ${
                activeTab === 'hod-review'
                  ? 'bg-amber-600 text-white'
                  : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              HOD ({pendingCount})
            </button>
          )}

          {/* Audit Trail (Mobile) */}
          {(isHOD || isFaculty) && (
            <button
              onClick={() => onSelectTab('audit-trail')}
              className={`px-3 py-1.5 rounded-lg shrink-0 font-bold flex items-center gap-1.5 ${
                activeTab === 'audit-trail'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Audit
            </button>
          )}

          {onProposeEvent && (
            <button
              id="btn-mobile-propose-event"
              onClick={onProposeEvent}
              className="px-3 py-1.5 rounded-lg shrink-0 font-bold flex items-center gap-1.5 bg-emerald-600 text-white"
            >
              <Plus className="w-3.5 h-3.5" />
              Propose
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
