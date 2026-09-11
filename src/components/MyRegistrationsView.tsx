import React from 'react';
import {
  Ticket,
  Calendar,
  MapPin,
  FileText,
  CheckCircle2,
  Trash2,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Star,
  Award
} from 'lucide-react';
import { RegistrationRecord, UserProfile } from '../types';
import { EventCountdownTimer } from './EventCountdownTimer';

interface MyRegistrationsViewProps {
  registrations: RegistrationRecord[];
  onViewPass?: (registration: RegistrationRecord) => void;
  onSelectRegistration?: (registration: RegistrationRecord) => void;
  onCancelRegistration?: (eventId: string) => Promise<void>;
  onExploreEvents?: () => void;
  onExploreMore?: () => void;
  onRateEvent?: (eventId: string) => void;
  ratedEventIds?: string[];
  currentUser?: UserProfile;
}

export const MyRegistrationsView: React.FC<MyRegistrationsViewProps> = ({
  registrations = [],
  onViewPass,
  onSelectRegistration,
  onCancelRegistration,
  onExploreEvents,
  onExploreMore,
  onRateEvent,
  ratedEventIds = [],
  currentUser
}) => {
  const handleViewPass = onViewPass || onSelectRegistration || (() => {});
  const handleExplore = onExploreEvents || onExploreMore || (() => {});
  const activeRegistrations = (registrations || []).filter((r) => r.status === 'CONFIRMED');
  const checkedInCount = activeRegistrations.filter((r) => r.checkedIn).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white p-6 md:p-8 rounded-2xl border border-emerald-800/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Ticket className="w-4 h-4" />
            Official University Event Enrollments
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight font-display text-white">
            My Event Registrations & Admit Slips
          </h1>
          <p className="text-xs md:text-sm text-slate-300 mt-1">
            Student: <span className="font-semibold text-white">{currentUser?.name || 'Varun Maddu'}</span> ({currentUser?.identifier || '221FA04001'}) • {currentUser?.departmentName || 'Computer Science & Engineering'}
          </p>
        </div>

        <div className="px-4 py-2.5 rounded-xl bg-emerald-900/40 border border-emerald-600/40 text-emerald-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{activeRegistrations.length} Confirmed Registrations</span>
        </div>
      </div>

      {/* Post-Event Feedback Notification Banner */}
      {checkedInCount > 0 && (
        <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <div className="font-bold text-amber-900">
                Attendance Recorded for Enrolled Event!
              </div>
              <div className="text-amber-800 text-[11px] mt-0.5">
                Please take 30 seconds to submit your post-event evaluation for faculty OBE metrics.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Passes Grid */}
      {activeRegistrations.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 space-y-3">
          <Ticket className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-semibold text-slate-800">You haven't registered for any events yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Discover verified departmental workshops, hackathons, and guest lectures cleared by the HOD.
          </p>
          <button
            onClick={handleExplore}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
          >
            Explore Public Events
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeRegistrations.map((reg) => (
            <div
              key={reg.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              {/* Ticket Top Strip */}
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-0.5 rounded-md font-mono text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {reg.registrationId}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      reg.checkedIn
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {reg.checkedIn ? 'Attended ✓' : 'Confirmed'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 font-display line-clamp-2">
                  {reg.eventTitle}
                </h3>

                <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{reg.eventDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{reg.eventVenue}</span>
                  </div>
                  <div className="text-[11px] font-semibold text-blue-700">
                    Seat: {reg.seatZone || 'General Admission Zone A'}
                  </div>

                  <div className="pt-2">
                    <EventCountdownTimer
                      date={reg.eventDate}
                      startTime="09:30"
                      variant="compact"
                      className="w-full justify-between"
                    />
                  </div>
                </div>
              </div>

              {/* Perforated Divider */}
              <div className="relative flex items-center px-4">
                <div className="flex-1 border-t-2 border-dashed border-slate-200" />
              </div>

              {/* Ticket Bottom Actions */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={() => onCancelRegistration && onCancelRegistration(reg.eventId)}
                  className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Cancel
                </button>

                <div className="flex items-center gap-2">
                  {onRateEvent && (
                    ratedEventIds.includes(reg.eventId) ? (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Rated ✓
                      </span>
                    ) : (
                      <button
                        onClick={() => onRateEvent(reg.eventId)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <Star className="w-3.5 h-3.5 fill-white" />
                        Rate Workshop
                      </button>
                    )
                  )}

                  <button
                    onClick={() => handleViewPass(reg)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    View Admit Slip
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
