import React, { useState } from 'react';
import {
  History,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Lock,
  User
} from 'lucide-react';
import { AuditLogEntry, UserProfile } from '../types';

interface AuditTrailViewProps {
  auditLogs: AuditLogEntry[];
  currentUser: UserProfile;
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({
  auditLogs,
  currentUser
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.eventId && log.eventId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = roleFilter === 'ALL' || log.actorRole === roleFilter;

    return matchesSearch && matchesRole;
  });

  const getActionBadge = (action: string) => {
    if (action.includes('APPROVED')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
    if (action.includes('SUBMITTED') || action.includes('REVIEW')) {
      return 'bg-amber-100 text-amber-800 border-amber-300';
    }
    if (action.includes('REJECTED') || action.includes('CANCELLED')) {
      return 'bg-rose-100 text-rose-800 border-rose-300';
    }
    if (action.includes('CHECK_IN')) {
      return 'bg-blue-100 text-blue-800 border-blue-300';
    }
    return 'bg-slate-100 text-slate-700 border-slate-300';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-[#0b1c30] text-white p-6 md:p-8 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
            <History className="w-4 h-4" />
            Statutory Accountability Ledger
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight font-display text-white">
            Institutional Audit Trail
          </h1>
          <p className="text-xs md:text-sm text-slate-300 mt-1">
            Tamper-evident record of all event lifecycle transitions, HOD statutory approvals, and gate check-ins.
          </p>
        </div>

        <div className="px-4 py-2.5 rounded-xl bg-blue-900/40 border border-blue-600/40 text-blue-200 text-xs font-semibold flex items-center gap-2">
          <Lock className="w-4 h-4 text-blue-400" />
          <span>Cryptographic Ledger Active</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search audit trail by actor, action, or event code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-medium mr-1">Actor Role:</span>
          {['ALL', 'HOD', 'FACULTY', 'STUDENT'].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                roleFilter === role
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Entries List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="divide-y divide-slate-100 text-xs">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No audit records matching your search.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-50/70 transition-colors space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-slate-500">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase border ${getActionBadge(
                        log.action
                      )}`}
                    >
                      {log.action.replace(/_/g, ' ')}
                    </span>
                    {log.eventId && (
                      <span className="font-mono text-slate-400 text-[11px]">
                        {log.eventId}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="text-slate-900 font-medium">
                    {log.details}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 text-[11px] shrink-0">
                    <User className="w-3 h-3 text-slate-400" />
                    <span className="font-semibold">{log.actorName}</span>
                    <span className="text-slate-400">({log.actorRole})</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
