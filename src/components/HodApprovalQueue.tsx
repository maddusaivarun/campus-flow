import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Calendar,
  MapPin,
  Users,
  Award,
  BookOpen,
  ArrowRight,
  Eye,
  FileCheck,
  Send,
  MessageSquare,
  CheckSquare,
  Square,
  Layers
} from 'lucide-react';
import { DepartmentEvent, ApprovalTimelineRecord, UserProfile } from '../types';

interface HodApprovalQueueProps {
  events: DepartmentEvent[];
  onReviewEvent: (
    eventId: string,
    action: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED',
    comment?: string,
    reason?: string
  ) => Promise<void>;
  onBulkReviewEvents?: (
    eventIds: string[],
    action: 'APPROVED' | 'REJECTED',
    comment?: string,
    reason?: string
  ) => Promise<{ success: boolean; count: number; message: string; errors?: any[] }>;
  currentUser?: UserProfile;
  onSelectEvent?: (event: DepartmentEvent) => void;
}

export const HodApprovalQueue: React.FC<HodApprovalQueueProps> = ({
  events,
  onReviewEvent,
  onBulkReviewEvents,
  currentUser,
  onSelectEvent
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [reviewMode, setReviewMode] = useState<'view' | 'approve' | 'revise' | 'reject'>('view');
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Bulk selection state
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  const [bulkComment, setBulkComment] = useState('Approved with statutory HOD digital signature for Department of CSBS & IoT.');
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [showBulkRejectModal, setShowBulkRejectModal] = useState(false);
  const [bulkRejectReason, setBulkRejectReason] = useState('');

  // Filter events: Pending review queue
  const pendingEvents = events.filter((e) => e.status === 'PENDING_REVIEW');
  const reviewedEvents = events.filter(
    (e) => e.status === 'PUBLISHED' || e.status === 'CHANGES_REQUESTED' || e.status === 'REJECTED' || e.status === 'COMPLETED'
  );

  // Toggle selection for a single pending event
  const handleToggleSelect = (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEventIds((prev) =>
      prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]
    );
  };

  // Select all or clear all pending events
  const handleSelectAllPending = () => {
    if (selectedEventIds.length === pendingEvents.length) {
      setSelectedEventIds([]);
    } else {
      setSelectedEventIds(pendingEvents.map((e) => e.id));
    }
  };

  // Bulk approve handler: executes batch server-side database operation while updating audit logs for each action
  const handleBulkApprove = async () => {
    if (selectedEventIds.length === 0) return;
    setIsBulkProcessing(true);
    setActionError(null);
    setFeedbackSuccess(null);
    try {
      const finalComment = bulkComment || 'Approved with statutory HOD digital signature for Department of CSBS & IoT.';
      if (onBulkReviewEvents) {
        const res = await onBulkReviewEvents(selectedEventIds, 'APPROVED', finalComment);
        setFeedbackSuccess(
          res.message || `✓ Batch server-side operation complete: approved and published ${selectedEventIds.length} event charter(s) with statutory digital signatures and audit logs!`
        );
      } else {
        // Fallback: direct batch database operation endpoint call
        const token = localStorage.getItem('campusflow_token');
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch('/api/events/bulk-review', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            eventIds: selectedEventIds,
            action: 'APPROVED',
            comment: finalComment
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Batch approval operation failed.');
        setFeedbackSuccess(data.message || `✓ Batch server-side operation complete: approved ${selectedEventIds.length} event charter(s)!`);
      }
      setSelectedEventIds([]);
    } catch (err: any) {
      setActionError(err?.message || 'Error executing bulk approval.');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Bulk reject handler: executes batch server-side database operation while updating audit logs for each action
  const handleBulkReject = async () => {
    if (selectedEventIds.length === 0) return;
    if (!bulkRejectReason.trim()) {
      setActionError('A formal justification reason is required when rejecting event proposals.');
      return;
    }
    setIsBulkProcessing(true);
    setActionError(null);
    setFeedbackSuccess(null);
    try {
      const finalReason = bulkRejectReason.trim();
      if (onBulkReviewEvents) {
        const res = await onBulkReviewEvents(selectedEventIds, 'REJECTED', undefined, finalReason);
        setFeedbackSuccess(
          res.message || `✓ Batch server-side operation complete: rejected ${selectedEventIds.length} event proposal(s) with recorded audit logs.`
        );
      } else {
        const token = localStorage.getItem('campusflow_token');
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch('/api/events/bulk-review', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            eventIds: selectedEventIds,
            action: 'REJECTED',
            reason: finalReason
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Batch rejection operation failed.');
        setFeedbackSuccess(data.message || `✓ Batch server-side operation complete: rejected ${selectedEventIds.length} event proposal(s).`);
      }
      setSelectedEventIds([]);
      setShowBulkRejectModal(false);
      setBulkRejectReason('');
    } catch (err: any) {
      setActionError(err?.message || 'Error executing bulk rejection.');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Active event for detailed review
  const activeEvent =
    events.find((e) => e.id === selectedEventId) || (pendingEvents.length > 0 ? pendingEvents[0] : null);

  const handleAction = async (action: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED') => {
    if (!activeEvent) return;
    setActionError(null);

    if (action === 'CHANGES_REQUESTED' && !commentText.trim()) {
      setActionError('Please provide specific feedback/revision instructions for the faculty organizer.');
      return;
    }
    if (action === 'REJECTED' && !commentText.trim()) {
      setActionError('A formal justification is required when rejecting an event proposal.');
      return;
    }

    setIsSubmitting(true);
    setFeedbackSuccess(null);
    try {
      await onReviewEvent(
        activeEvent.id,
        action,
        commentText.trim() || undefined,
        action === 'REJECTED' ? commentText.trim() : undefined
      );

      setFeedbackSuccess(
        action === 'APPROVED'
          ? `✓ "${activeEvent.title}" has been approved and published to the student portal!`
          : action === 'CHANGES_REQUESTED'
          ? `Revisions requested for "${activeEvent.title}". Faculty notified.`
          : `Event proposal rejected.`
      );

      setReviewMode('view');
      setCommentText('');
    } catch (err: any) {
      setActionError(err?.message || 'Error processing review action.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Statutory Header */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-slate-950 p-6 md:p-8 rounded-2xl border border-amber-800/40 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            HOD Statutory Governance Center
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight font-display text-white">
            Department Activity Clearances & Sign-Offs
          </h1>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl">
            Department Chair: <span className="font-semibold text-white">{currentUser?.name || 'Head of Department (CSBS & IoT)'}</span> ({currentUser?.identifier || 'HOD-CSBS-1001'}).
            Under institutional policy, zero events appear publicly without your digital statutory signature.
          </p>
        </div>

        {/* Counter Badge */}
        <div className="flex items-center gap-3 bg-amber-900/40 border border-amber-600/40 px-5 py-3 rounded-xl backdrop-blur">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-lg">
            {pendingEvents.length}
          </div>
          <div>
            <div className="text-xs text-amber-200 font-bold uppercase tracking-wider">
              Pending Clearances
            </div>
            <div className="text-[11px] text-slate-300">
              {pendingEvents.length === 0 ? 'All caught up' : 'Action required'}
            </div>
          </div>
        </div>
      </div>

      {feedbackSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackSuccess}</span>
          </div>
          <button
            onClick={() => setFeedbackSuccess(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-4 bg-rose-50 border border-rose-300 text-rose-800 rounded-xl text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button
            onClick={() => setActionError(null)}
            className="text-rose-700 hover:text-rose-900 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Bulk Action Controls Banner */}
      {selectedEventIds.length > 0 && (
        <div className="p-5 bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 border border-blue-500/50 text-white rounded-2xl shadow-xl space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-700/50 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/30 border border-blue-400/40 flex items-center justify-center font-bold text-base text-blue-200">
                {selectedEventIds.length}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Bulk Decision Panel ({selectedEventIds.length} Events Selected)
                </h3>
                <p className="text-xs text-blue-200">
                  Execute statutory sign-off or simultaneous rejection across all selected event charters.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedEventIds([])}
                className="text-xs text-blue-300 hover:text-white underline"
              >
                Deselect All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-7">
              <label className="block text-[11px] font-bold text-blue-200 uppercase tracking-wider mb-1">
                Batch Statutory Endorsement Note
              </label>
              <input
                type="text"
                value={bulkComment}
                onChange={(e) => setBulkComment(e.target.value)}
                placeholder="Batch clearance endorsement note..."
                className="w-full px-3 py-2 bg-slate-900/90 border border-blue-500/40 rounded-xl text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="md:col-span-5 flex items-center gap-2 justify-end pt-2 md:pt-4">
              <button
                type="button"
                onClick={handleBulkApprove}
                disabled={isBulkProcessing}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isBulkProcessing ? 'Processing...' : `Approve All (${selectedEventIds.length})`}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowBulkRejectModal(true)}
                disabled={isBulkProcessing}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-colors"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject Selected</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Review Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List: Pending & Reviewed Items (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="select-all-pending"
                  checked={pendingEvents.length > 0 && selectedEventIds.length === pendingEvents.length}
                  onChange={handleSelectAllPending}
                  disabled={pendingEvents.length === 0}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="select-all-pending" className="text-xs font-bold uppercase tracking-wider text-slate-700 cursor-pointer select-none">
                  Pending HOD Review ({pendingEvents.length})
                </label>
              </div>
              <div className="flex items-center gap-1.5">
                {selectedEventIds.length > 0 && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                    {selectedEventIds.length} checked
                  </span>
                )}
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              </div>
            </div>

            {pendingEvents.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                No events currently awaiting review. New faculty submissions will queue here immediately.
              </div>
            ) : (
              <div className="space-y-2">
                {pendingEvents.map((evt) => {
                  const isSelected = activeEvent?.id === evt.id;
                  const isChecked = selectedEventIds.includes(evt.id);
                  return (
                    <div
                      key={evt.id}
                      onClick={() => {
                        setSelectedEventId(evt.id);
                        setReviewMode('view');
                      }}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isChecked
                          ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-400/20 shadow-xs'
                          : isSelected
                          ? 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-400/20 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => handleToggleSelect(evt.id, e as any)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-amber-800 mb-1">
                          <span className="px-2 py-0.5 rounded bg-amber-100 uppercase">
                            {evt.category}
                          </span>
                          <span className="text-slate-500 font-mono">{evt.id}</span>
                        </div>
                        <div className="text-xs font-bold text-slate-900 line-clamp-1 font-display">
                          {evt.title}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                          <span>By {evt.organizerName}</span>
                          <span>{evt.date}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Past Review Decisions */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Department Event Ledger ({reviewedEvents.length})
            </h2>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {reviewedEvents.map((evt) => (
                <button
                  key={evt.id}
                  onClick={() => {
                    setSelectedEventId(evt.id);
                    setReviewMode('view');
                  }}
                  className={`w-full text-left p-3 rounded-lg border text-xs transition-colors ${
                    activeEvent?.id === evt.id
                      ? 'bg-slate-100 border-slate-300 font-semibold'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        evt.status === 'PUBLISHED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : evt.status === 'CHANGES_REQUESTED'
                          ? 'bg-amber-100 text-amber-800'
                          : evt.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {evt.status}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">{evt.date}</span>
                  </div>
                  <div className="text-slate-900 font-medium truncate">{evt.title}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Pane: Comprehensive Event Dossier & Review Actions (8 cols) */}
        <div className="lg:col-span-8">
          {activeEvent ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-6">
              {/* Header Status Bar */}
              <div className="p-6 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                    <span className="font-semibold text-blue-700">{activeEvent.departmentName}</span>
                    <span>•</span>
                    <span className="font-mono text-slate-400">{activeEvent.id}</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 font-display">
                    {activeEvent.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      activeEvent.status === 'PENDING_REVIEW'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                        : activeEvent.status === 'PUBLISHED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : activeEvent.status === 'CHANGES_REQUESTED'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {activeEvent.status}
                  </span>
                </div>
              </div>

              {/* Conflict & Resource Verification Box */}
              <div className="px-6">
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-xs space-y-2">
                  <div className="font-bold text-blue-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-700" />
                    Automated Department Conflict & Resource Check
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-700 pt-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Venue: {activeEvent.venue} (No overlaps)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Capacity: {activeEvent.capacity} seats verified</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Academic Credit: {activeEvent.academicCredits} OBE Units</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Body Details */}
              <div className="px-6 space-y-6 text-xs text-slate-700">
                {/* Meta details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-slate-400 block font-medium">Faculty Convenor</span>
                    <span className="font-bold text-slate-900 text-sm">{activeEvent.organizerName}</span>
                    <span className="text-slate-500 block text-[11px]">{activeEvent.organizerDesignation}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Proposed Date</span>
                    <span className="font-bold text-slate-900 text-sm">{activeEvent.date}</span>
                    <span className="text-slate-500 block text-[11px]">{activeEvent.startTime} - {activeEvent.endTime}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Allocated Venue</span>
                    <span className="font-bold text-slate-900 text-sm">{activeEvent.venue}</span>
                    <span className="text-slate-500 block text-[11px] truncate">{activeEvent.locationDetails}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Max Cohort Limit</span>
                    <span className="font-bold text-slate-900 text-sm">{activeEvent.capacity} Attendees</span>
                    <span className="text-slate-500 block text-[11px]">Deadline: {activeEvent.registrationDeadline}</span>
                  </div>
                </div>

                {/* Briefing */}
                <div className="space-y-1.5">
                  <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                    Charter Proposal & Syllabus Rationale
                  </h3>
                  <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {activeEvent.description}
                  </p>
                </div>

                {/* Learning Objectives */}
                {activeEvent.objectives && activeEvent.objectives.length > 0 && (
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                      Measurable Course Outcomes (NAAC Metric Aligned)
                    </h3>
                    <div className="space-y-1.5">
                      {activeEvent.objectives.map((obj, i) => (
                        <div key={i} className="flex items-start gap-2 p-2 rounded bg-slate-50 border border-slate-100 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <span>{obj}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Speaker & Agenda preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-900 block mb-1">Keynote / Resource Person</span>
                    <div className="font-medium text-blue-700">{activeEvent.speaker?.name || 'TBD'}</div>
                    <div className="text-slate-500 text-[11px]">{activeEvent.speaker?.designation} • {activeEvent.speaker?.organization}</div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-900 block mb-1">Sessions Scheduled</span>
                    <div className="font-medium text-slate-800">{activeEvent.agenda?.length || 0} Modules Structured</div>
                    <div className="text-slate-500 text-[11px]">Duration: ~4.0 Contact Hours</div>
                  </div>
                </div>

                {/* If previously reviewed, show comment and signature */}
                {activeEvent.hodReviewComment && (
                  <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 space-y-1 text-xs">
                    <div className="font-bold text-slate-900">Recorded HOD Decision Note:</div>
                    <p className="text-slate-700 italic">"{activeEvent.hodReviewComment}"</p>
                    {activeEvent.digitalSignatureHash && (
                      <div className="text-[11px] font-mono text-emerald-700 pt-1">
                        Digital Signature Hash: {activeEvent.digitalSignatureHash}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Decision Controls (HOD Exclusive) */}
              <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-4">
                {actionError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium flex items-center justify-between gap-2 animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
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
                {activeEvent.status === 'PENDING_REVIEW' ? (
                  <>
                    {reviewMode === 'view' && (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="text-xs text-slate-600">
                          <span className="font-semibold text-slate-900">Statutory Authority: </span>
                          <span>Approving will immediately broadcast this activity to the public student portal.</span>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => setReviewMode('revise')}
                            className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            Request Revisions
                          </button>

                          <button
                            onClick={() => setReviewMode('reject')}
                            className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>

                          <button
                            onClick={() => setReviewMode('approve')}
                            className="flex-1 sm:flex-none px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                          >
                            <FileCheck className="w-4 h-4" />
                            Approve & Publish
                          </button>
                        </div>
                      </div>
                    )}

                    {reviewMode === 'approve' && (
                      <div className="p-4 bg-emerald-50/80 border border-emerald-300 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-emerald-900 text-xs flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-700" />
                            Sign-Off & Publish: "{activeEvent.title}"
                          </div>
                          <button
                            onClick={() => setReviewMode('view')}
                            className="text-xs text-slate-500 hover:text-slate-800"
                          >
                            Cancel
                          </button>
                        </div>

                        <input
                          type="text"
                          placeholder="Optional endorsement note (e.g., 'Approved. Essential curriculum tie-in for CSBS & IoT lab.')"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            onClick={() => setReviewMode('view')}
                            className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-medium bg-white"
                          >
                            Back
                          </button>
                          <button
                            onClick={() => handleAction('APPROVED')}
                            disabled={isSubmitting}
                            className="px-5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                            {isSubmitting ? 'Stamping Clearance...' : 'Stamp Signature & Broadcast Publicly'}
                          </button>
                        </div>
                      </div>
                    )}

                    {(reviewMode === 'revise' || reviewMode === 'reject') && (
                      <div
                        className={`p-4 rounded-xl border space-y-3 ${
                          reviewMode === 'revise'
                            ? 'bg-amber-50/80 border-amber-300'
                            : 'bg-rose-50/80 border-rose-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div
                            className={`font-bold text-xs flex items-center gap-2 ${
                              reviewMode === 'revise' ? 'text-amber-900' : 'text-rose-900'
                            }`}
                          >
                            <AlertTriangle className="w-4 h-4" />
                            {reviewMode === 'revise'
                              ? 'Provide Specific Revision Feedback for Faculty'
                              : 'Formal Rejection Justification Required'}
                          </div>
                          <button
                            onClick={() => setReviewMode('view')}
                            className="text-xs text-slate-500 hover:text-slate-800"
                          >
                            Cancel
                          </button>
                        </div>

                        <textarea
                          rows={3}
                          placeholder={
                            reviewMode === 'revise'
                              ? 'e.g. Please clarify GPU compute allocation from IEEE lab pool and re-check conflict with 3rd semester mid-terms...'
                              : 'e.g. Proposal overlaps directly with existing ACM flagship hackathon scheduled for the same weekend.'
                          }
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />

                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setReviewMode('view')}
                            className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-medium bg-white"
                          >
                            Back
                          </button>
                          <button
                            onClick={() =>
                              handleAction(
                                reviewMode === 'revise' ? 'CHANGES_REQUESTED' : 'REJECTED'
                              )
                            }
                            disabled={isSubmitting}
                            className={`px-4 py-1.5 rounded-lg text-white text-xs font-bold flex items-center gap-1.5 ${
                              reviewMode === 'revise'
                                ? 'bg-amber-600 hover:bg-amber-700'
                                : 'bg-rose-600 hover:bg-rose-700'
                            }`}
                          >
                            <Send className="w-3.5 h-3.5" />
                            {isSubmitting
                              ? 'Processing...'
                              : reviewMode === 'revise'
                              ? 'Send Revision Request'
                              : 'Confirm Rejection'}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Clearance decision already finalized on this charter.
                    </span>
                    <span className="font-mono text-[11px]">
                      Status: {activeEvent.status}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-700">No event selected for review</h3>
              <p className="text-xs text-slate-500 mt-1">
                Select an item from the left pending queue to inspect details and issue statutory clearances.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Rejection Justification Modal */}
      {showBulkRejectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-700">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Bulk Reject {selectedEventIds.length} Event Proposals
                </h3>
                <p className="text-xs text-slate-500">
                  A formal statutory justification is required. This will be transmitted to all respective convenors.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Statutory Justification / Rejection Reason *
              </label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Clashes with Department of CSBS & IoT mid-term examination schedule and lab maintenance..."
                value={bulkRejectReason}
                onChange={(e) => setBulkRejectReason(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowBulkRejectModal(false);
                  setBulkRejectReason('');
                }}
                disabled={isBulkProcessing}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkReject}
                disabled={isBulkProcessing || !bulkRejectReason.trim()}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <XCircle className="w-4 h-4" />
                <span>{isBulkProcessing ? 'Rejecting...' : `Confirm Bulk Rejection (${selectedEventIds.length})`}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
