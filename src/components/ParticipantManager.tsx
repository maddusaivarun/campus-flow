import React, { useState } from 'react';
import {
  Users,
  Search,
  Download,
  CheckCircle2,
  Clock,
  Filter,
  ShieldCheck,
  Calendar,
  MapPin,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { DepartmentEvent, RegistrationRecord, UserProfile } from '../types';

interface ParticipantManagerProps {
  events: DepartmentEvent[];
  participants?: RegistrationRecord[];
  currentUser?: UserProfile;
  onSelectEvent?: (event: DepartmentEvent) => void;
  selectedEventId?: string;
  onCheckInParticipant?: (registrationId: string) => Promise<any>;
}

export const ParticipantManager: React.FC<ParticipantManagerProps> = ({
  events = [],
  participants = [],
  currentUser,
  onSelectEvent,
  selectedEventId,
  onCheckInParticipant
}) => {
  const publishedEvents = (events || []).filter(
    (e) => e.status === 'PUBLISHED' || e.status === 'COMPLETED'
  );

  const [activeEventId, setActiveEventId] = useState<string>(
    selectedEventId || (publishedEvents.length > 0 ? publishedEvents[0].id : '')
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CHECKED_IN' | 'PENDING'>('ALL');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleManualCheckIn = async (regId: string) => {
    if (!onCheckInParticipant || processingId) return;
    setProcessingId(regId);
    setActionError(null);
    try {
      await onCheckInParticipant(regId);
    } catch (err: any) {
      setActionError(err?.message || 'Check-in failed');
    } finally {
      setProcessingId(null);
    }
  };

  const currentEvent = (events || []).find((e) => e.id === activeEventId) || publishedEvents[0];

  // Filter roster by selected event
  const eventParticipants = (participants || []).filter((p) => p.eventId === activeEventId);

  const filteredParticipants = eventParticipants.filter((p) => {
    const matchesSearch =
      p.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.studentRoll.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.registrationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.studentEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'CHECKED_IN' && p.checkedIn) ||
      (statusFilter === 'PENDING' && !p.checkedIn);

    return matchesSearch && matchesStatus;
  });

  const checkedInCount = eventParticipants.filter((p) => p.checkedIn).length;
  const attendanceRate =
    eventParticipants.length > 0
      ? Math.round((checkedInCount / eventParticipants.length) * 100)
      : 0;

  // Export roster to CSV
  const handleExportCSV = () => {
    if (!currentEvent) return;

    const headers = [
      'Registration ID',
      'Student Name',
      'Roll Number',
      'Department',
      'Email',
      'Seat Zone',
      'Checked In',
      'Checked In Timestamp',
      'Registration Date'
    ];

    const rows = eventParticipants.map((p) => [
      p.registrationId,
      `"${p.studentName}"`,
      p.studentRoll,
      `"${p.studentDepartment}"`,
      p.studentEmail,
      `"${p.seatZone || 'General'}"`,
      p.checkedIn ? 'YES' : 'NO',
      p.checkedInAt || 'N/A',
      p.registeredAt
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `CAMPUSFLOW_Roster_${currentEvent.id}_${currentEvent.date}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-950 text-white p-6 md:p-8 rounded-2xl border border-blue-800/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Users className="w-4 h-4 text-blue-400" />
            Organizer Participant Management
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight font-display text-white">
            Attendee Rosters & Verification
          </h1>
          <p className="text-xs md:text-sm text-slate-300 mt-1">
            Real-time enrollment tracking and gate attendance sync for certified academic credit issuance.
          </p>
        </div>

        {currentEvent && (
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl flex items-center gap-2 backdrop-blur border border-white/20 transition-all shrink-0"
          >
            <Download className="w-4 h-4" />
            Export Roster (CSV)
          </button>
        )}
      </div>

      {/* Select Event Strip */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className="font-semibold text-slate-900">Select Activity:</span>
          <select
            value={activeEventId}
            onChange={(e) => setActiveEventId(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 bg-white"
          >
            {publishedEvents.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title} ({e.date})
              </option>
            ))}
          </select>
        </div>

        {currentEvent && (
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> {currentEvent.date}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> {currentEvent.venue}
            </span>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Total Registered</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-display">
            {eventParticipants.length} <span className="text-xs text-slate-400 font-normal">/ {currentEvent?.capacity || 100} capacity</span>
          </div>
          <div className="text-[11px] text-blue-600 font-medium mt-0.5">Verified Student Passes</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Gate Admitted</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1 font-display">
            {checkedInCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Scanned at Gate Scanner</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Attendance Rate</div>
          <div className="text-2xl font-bold text-blue-600 mt-1 font-display">
            {attendanceRate}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Turnout vs Registrations</div>
        </div>
      </div>

      {/* Search and Filters */}
      {actionError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium flex items-center justify-between gap-2 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button
            onClick={() => setActionError(null)}
            className="text-rose-500 hover:text-rose-700 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, roll number, or pass code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-1 text-xs">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-blue-600 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({eventParticipants.length})
          </button>
          <button
            onClick={() => setStatusFilter('CHECKED_IN')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              statusFilter === 'CHECKED_IN'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Checked In ({checkedInCount})
          </button>
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              statusFilter === 'PENDING'
                ? 'bg-amber-600 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Pending ({eventParticipants.length - checkedInCount})
          </button>
        </div>
      </div>

      {/* Participants Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Roll Number</th>
                <th className="px-5 py-3">Admit ID</th>
                <th className="px-5 py-3">Seat Zone</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Attendance Time</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredParticipants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    No participants matched this filter.
                  </td>
                </tr>
              ) : (
                filteredParticipants.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900">{p.studentName}</div>
                      <div className="text-[11px] text-slate-400">{p.studentEmail}</div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-700 font-semibold">
                      {p.studentRoll}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-blue-700 font-semibold">
                      {p.registrationId}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {p.seatZone || 'Zone A'}
                    </td>
                    <td className="px-5 py-3.5">
                      {p.checkedIn ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ADMITTED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                          <Clock className="w-3 h-3 text-slate-400" />
                          NOT CHECKED IN
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 font-mono text-[11px]">
                      {p.checkedInAt
                        ? new Date(p.checkedInAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {!p.checkedIn && (
                        <button
                          onClick={() => handleManualCheckIn(p.registrationId)}
                          disabled={processingId === p.registrationId}
                          className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 font-semibold text-[11px] transition-colors disabled:opacity-50"
                        >
                          {processingId === p.registrationId ? 'Admitting...' : 'Mark Present'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
