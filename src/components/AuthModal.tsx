import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  ShieldCheck,
  Building,
  CreditCard,
  Phone,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserProfile, token: string) => void;
  initialMode?: 'signin' | 'signup';
  forcedRole?: UserRole;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'signin',
  forcedRole
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Signup fields
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>(forcedRole || 'STUDENT');
  const [departmentName, setDepartmentName] = useState('Department of CSBS & IoT');
  const [identifier, setIdentifier] = useState('');
  const [phone, setPhone] = useState('');

  // UI state
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleQuickFill = (targetRole: 'HOD' | 'FACULTY' | 'STUDENT') => {
    setMode('signin');
    setErrorMessage(null);
    if (targetRole === 'HOD') {
      setEmail('hod.csbsiot@vignan.ac.in');
      setPassword('vignan123');
    } else if (targetRole === 'FACULTY') {
      setEmail('faculty.csbsiot@vignan.ac.in');
      setPassword('vignan123');
    } else {
      setEmail('student.varun@vignan.ac.in');
      setPassword('vignan123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const endpoint = mode === 'signin' ? '/api/auth/login' : '/api/auth/register';
      const body =
        mode === 'signin'
          ? { email: email.trim(), password }
          : {
              name: name.trim(),
              email: email.trim(),
              password,
              role,
              departmentName: departmentName.trim(),
              identifier: identifier.trim(),
              phone: phone.trim()
            };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch (jsonErr) {
        // In case of non-JSON response
      }

      if (!res.ok || !data) {
        throw new Error(data?.error || 'Authentication failed. Please check your credentials.');
      }

      // Store in localStorage for production persistent session
      const token = data.token || `client-token-${Date.now()}`;
      localStorage.setItem('campusflow_token', token);

      if (data.user) {
        localStorage.setItem('campusflow_custom_user', JSON.stringify(data.user));
        onAuthSuccess(data.user, token);
      }

      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-[#0b1c30] text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-sm font-display shadow-xs text-white">
              CF
            </div>
            <div>
              <h2 className="text-base font-bold font-display leading-tight text-white">
                Vignan University
              </h2>
              <p className="text-[11px] text-blue-200">
                Department of CSBS & IoT • Statutory Event Portal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle: Sign In vs Sign Up */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMessage(null);
            }}
            className={`flex-1 py-3 text-center transition-colors ${
              mode === 'signin'
                ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Sign In with Email
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMessage(null);
            }}
            className={`flex-1 py-3 text-center transition-colors ${
              mode === 'signup'
                ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Create New Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Legal Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Varun Maddu"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Institutional Role *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['STUDENT', 'FACULTY', 'HOD'] as UserRole[]).map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setRole(r)}
                      className={`py-2 px-1 text-center rounded-lg border text-xs font-bold transition-all ${
                        role === r
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 ring-1 ring-blue-600'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {r === 'HOD' ? 'HOD' : r === 'FACULTY' ? 'Faculty' : 'Student'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {role === 'STUDENT' ? 'Student Roll No' : 'Faculty / Employee ID'}
                  </label>
                  <input
                    type="text"
                    placeholder={role === 'STUDENT' ? 'e.g. 221FA04001' : 'e.g. VUG-FAC-041'}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98480..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Institutional Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder={
                  mode === 'signup'
                    ? 'yourname@vignan.ac.in'
                    : 'e.g. faculty.csbsiot@vignan.ac.in'
                }
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password *
              </label>
              {mode === 'signin' && (
                <span className="text-[10px] text-slate-400">
                  (Default test password: vignan123)
                </span>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="Enter password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-9 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'signin' && (
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Remember session</span>
              </label>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-lg text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2 animate-in fade-in-50">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-2 disabled:bg-slate-300 dark:disabled:bg-slate-800 cursor-pointer"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Authenticating...
              </span>
            ) : (
              <>
                <span>
                  {mode === 'signin' ? 'Sign In to CampusFlow' : 'Complete Registration & Sign In'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Collapsible Test Account Quick-Fill for Evaluators */}
        <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 px-6 py-3">
          <button
            type="button"
            onClick={() => setShowDemoAccounts(!showDemoAccounts)}
            className="w-full flex items-center justify-between text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Pre-Configured Department Accounts (One-Click Test)
            </span>
            {showDemoAccounts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showDemoAccounts && (
            <div className="pt-2.5 space-y-1.5 animate-in fade-in-50">
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Click any credential to fill login instantly:
              </p>
              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleQuickFill('HOD')}
                  className="py-1.5 px-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-400 text-[11px] font-bold text-amber-800 dark:text-amber-300 shadow-2xs transition-colors text-center"
                >
                  HOD (CSBS & IoT)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('FACULTY')}
                  className="py-1.5 px-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 text-[11px] font-bold text-blue-800 dark:text-blue-300 shadow-2xs transition-colors text-center"
                >
                  Faculty Coord
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('STUDENT')}
                  className="py-1.5 px-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 shadow-2xs transition-colors text-center"
                >
                  Student (Varun)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-2.5 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-center text-[10px] text-slate-500 dark:text-slate-400 font-medium">
          Department of CSBS & IoT • Vignan's Foundation for Science, Technology & Research
        </div>
      </div>
    </div>
  );
};
