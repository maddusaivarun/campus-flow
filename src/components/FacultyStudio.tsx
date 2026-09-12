import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Calendar,
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Send,
  Trash2,
  Eye,
  FileEdit,
  Award,
  BookOpen,
  Star,
  BarChart3
} from 'lucide-react';
import { DepartmentEvent, EventStatus, UserProfile } from '../types';
import { EventFeedbackAnalyticsView } from './EventFeedbackAnalyticsView';

interface FacultyStudioProps {
  events: DepartmentEvent[];
  currentUser: UserProfile;
  onCreateNew: () => void;
  onSubmitToHod: (eventId: string) => Promise<void>;
  onDeleteEvent: (eventId: string) => Promise<void>;
  onSelectEvent: (event: DepartmentEvent) => void;
  onViewRoster: (event: DepartmentEvent) => void;
  onCompleteEvent: (eventId: string) => Promise<void>;
}

export const FacultyStudio: React.FC<FacultyStudioProps> = ({
  events,
  currentUser,
  onCreateNew,
  onSubmitToHod,
  onDeleteEvent,
  onSelectEvent,
  onViewRoster,
  onCompleteEvent
}) => {
  const [studioTab, setStudioTab] = useState<'charters' | 'feedback'>('charters');
  const [activeFilter, setActiveFilter] = useState<EventStatus | 'ALL'>('ALL');
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Faculty manages their organized events and departmental charters in Faculty Studio
  const myEvents = events.filter(
    (e) =>
      e.organizerId === currentUser.id ||
      currentUser.role === 'HOD' ||
      currentUser.role === 'FACULTY' ||
      !e.organizerId
  );

  const filteredEvents = myEvents.filter((e) => {
    if (activeFilter === 'ALL') return true;
    return e.status === activeFilter;
  });

  const draftCount = myEvents.filter((e) => e.status === 'DRAFT').length;
  const pendingCount = myEvents.filter((e) => e.status === 'PENDING_REVIEW').length;
  const changesCount = myEvents.filter((e) => e.status === 'CHANGES_REQUESTED').length;
  const publishedCount = myEvents.filter((e) => e.status === 'PUBLISHED').length;

  const handleSubmitDraft = async (id: string) => {
    setSubmittingId(id);
    setActionError(null);
    try {
      await onSubmitToHod(id);
    } catch (e: any) {
      setActionError(e?.message || 'Failed to submit draft to HOD for approval.');
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-950 text-white p-6 md:p-8 rounded-2xl border border-blue-800/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            Faculty Activity Management Studio
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight font-display text-white">
            Department Activity Charters
          </h1>
          <p className="text-xs md:text-sm text-slate-300 mt-1">
            Convenor: <span className="font-semibold text-white">{currentUser?.name || 'Faculty Coordinator (CSE)'}</span> ({currentUser?.identifier || 'VUG-FAC-041'}) • {currentUser?.departmentName || 'Department of Computer Science & Engineering'}
          </p>
        </div>

        {/* Create Charter CTA */}
        <div className="flex items-center gap-2">
          <button
            onClick={onCreateNew}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-blue-950/40 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            Draft New Charter
          </button>
        </div>
      </div>

      {/* Main Studio Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setStudioTab('charters')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
            studioTab === 'charters'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileEdit className="w-4 h-4" />
          Event Charters & HOD Approval ({myEvents.length})
        </button>

        <button
          onClick={() => setStudioTab('feedback')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
            studioTab === 'feedback'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          Student Feedback & Performance Analytics
        </button>
      </div>

      {actionError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium flex items-center justify-between gap-2 animate-fadeIn">
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

      {studioTab === 'feedback' ? (
        <EventFeedbackAnalyticsView events={myEvents} currentUser={currentUser} />
      ) : (
        <>
          {/* Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Active Public</div>
              <div className="text-2xl font-bold text-emerald-600 mt-1 font-display">{publishedCount}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Approved by HOD</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Under Review</div>
              <div className="text-2xl font-bold text-amber-600 mt-1 font-display">{pendingCount}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">In HOD Queue</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Revisions Requested</div>
              <div className="text-2xl font-bold text-rose-600 mt-1 font-display">{changesCount}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Feedback from HOD</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Draft Proposals</div>
              <div className="text-2xl font-bold text-slate-700 mt-1 font-display">{draftCount}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Ready to submit</div>
            </div>
          </div>

      {/* Filter Tabs */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex items-center gap-1.5 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveFilter('ALL')}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors ${
            activeFilter === 'ALL'
              ? 'bg-blue-600 text-white font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          All Charters ({myEvents.length})
        </button>
        <button
          onClick={() => setActiveFilter('DRAFT')}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors ${
            activeFilter === 'DRAFT'
              ? 'bg-blue-600 text-white font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Drafts ({draftCount})
        </button>
        <button
          onClick={() => setActiveFilter('PENDING_REVIEW')}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors ${
            activeFilter === 'PENDING_REVIEW'
              ? 'bg-blue-600 text-white font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Pending Review ({pendingCount})
        </button>
        <button
          onClick={() => setActiveFilter('CHANGES_REQUESTED')}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors ${
            activeFilter === 'CHANGES_REQUESTED'
              ? 'bg-blue-600 text-white font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Revisions Requested ({changesCount})
        </button>
        <button
          onClick={() => setActiveFilter('PUBLISHED')}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors ${
            activeFilter === 'PUBLISHED'
              ? 'bg-blue-600 text-white font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Published & Live ({publishedCount})
        </button>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-700">No events in this category</h3>
            <p className="text-xs text-slate-500 mt-1">
              Click "Draft New Charter" above to draft a curriculum-aligned event with the AI Copilot.
            </p>
          </div>
        ) : (
          filteredEvents.map((evt) => {
            const isDraft = evt.status === 'DRAFT';
            const isPending = evt.status === 'PENDING_REVIEW';
            const isChanges = evt.status === 'CHANGES_REQUESTED';
            const isPublished = evt.status === 'PUBLISHED';
            const isCompleted = evt.status === 'COMPLETED';

            return (
              <div
                key={evt.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow space-y-4"
              >
                {/* Top Row: Meta and Status Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono font-semibold text-slate-500">{evt.id}</span>
                    <span className="text-slate-300">•</span>
                    <span className="px-2.5 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                      {evt.category}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500">{evt.eventType}</span>
                  </div>

                  {/* Status Badge */}
                  <div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        isPublished
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : isPending
                          ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                          : isChanges
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : isDraft
                          ? 'bg-slate-100 text-slate-700 border border-slate-300'
                          : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                      }`}
                    >
                      {evt.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Event Title & Summary */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    {evt.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                    {evt.shortDescription || evt.description}
                  </p>
                </div>

                {/* Key Metrics Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{evt.date} • {evt.startTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{evt.venue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{evt.registeredCount} / {evt.capacity} Registered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{evt.academicCredits} OBE Credits</span>
                  </div>
                </div>

                {/* HOD Feedback Box if Changes Requested */}
                {isChanges && evt.hodReviewComment && (
                  <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      Feedback from HOD ({evt.hodReviewerName || 'Head of Department (CSE)'}):
                    </div>
                    <p className="italic">"{evt.hodReviewComment}"</p>
                  </div>
                )}

                {/* HOD Clearance Stamp if Published */}
                {isPublished && evt.digitalSignatureHash && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      HOD Clearance Verified ({evt.hodReviewerName})
                    </span>
                    <span className="font-mono text-slate-500">
                      Hash: {evt.digitalSignatureHash.slice(0, 14)}...
                    </span>
                  </div>
                )}

                {/* Bottom Action Strip */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-400">
                    Created: {new Date(evt.createdAt).toLocaleDateString()}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectEvent(evt)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Dossier
                    </button>

                    {isPublished && (
                      <>
                        <button
                          onClick={() => onViewRoster(evt)}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold flex items-center gap-1"
                        >
                          <Users className="w-3.5 h-3.5" />
                          View Roster ({evt.registeredCount})
                        </button>

                        <button
                          onClick={() => onCompleteEvent(evt.id)}
                          className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium"
                        >
                          Mark Completed
                        </button>
                      </>
                    )}

                    {(isDraft || isChanges) && (
                      <>
                        <button
                          onClick={() => onDeleteEvent(evt.id)}
                          className="p-2 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                          title="Delete Draft"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleSubmitDraft(evt.id)}
                          disabled={submittingId === evt.id}
                          className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                        >
                          <Send className="w-3.5 h-3.5" />
                          {submittingId === evt.id
                            ? 'Submitting...'
                            : isChanges
                            ? 'Resubmit to HOD'
                            : 'Submit for HOD Sign-Off'}
                        </button>
                      </>
                    )}

                    {isPending && (
                      <span className="text-xs text-amber-700 font-medium px-3 py-1 bg-amber-50 rounded-lg border border-amber-200 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                        Locked for HOD Review
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
        </>
      )}
    </div>
  );
};
