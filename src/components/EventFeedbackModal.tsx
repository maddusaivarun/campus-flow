import React, { useState } from 'react';
import {
  X,
  Star,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Award
} from 'lucide-react';
import { DepartmentEvent, FeedbackRecord, UserProfile } from '../types';

interface EventFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: DepartmentEvent;
  currentUser?: UserProfile;
  existingFeedback?: FeedbackRecord;
  onFeedbackSubmitted: (feedback: FeedbackRecord) => void;
}

export const EventFeedbackModal: React.FC<EventFeedbackModalProps> = ({
  isOpen,
  onClose,
  event,
  currentUser,
  existingFeedback,
  onFeedbackSubmitted
}) => {
  const [rating, setRating] = useState<number>(existingFeedback?.rating || 5);
  const [contentQuality, setContentQuality] = useState<number>(existingFeedback?.contentQuality || 5);
  const [organization, setOrganization] = useState<number>(existingFeedback?.organization || 5);
  const [speakerRating, setSpeakerRating] = useState<number>(existingFeedback?.speakerRating || 5);
  const [comment, setComment] = useState<string>(existingFeedback?.comment || '');
  const [takeaways, setTakeaways] = useState<string>(existingFeedback?.takeaways || '');
  const [wouldRecommend, setWouldRecommend] = useState<boolean>(
    existingFeedback?.wouldRecommend !== undefined ? existingFeedback.wouldRecommend : true
  );

  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const getRatingLabel = (val: number) => {
    switch (val) {
      case 1:
        return 'Needs Significant Improvement';
      case 2:
        return 'Below Expectations';
      case 3:
        return 'Satisfactory & Helpful';
      case 4:
        return 'Very Good & Well Delivered';
      case 5:
        return 'Outstanding & Highly Recommended!';
      default:
        return '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const token = localStorage.getItem('campusflow_auth_token');
      const res = await fetch(`/api/events/${event.id}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          rating,
          contentQuality,
          organization,
          speakerRating,
          comment: comment.trim() || 'Great session!',
          takeaways: takeaways.trim(),
          wouldRecommend
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit feedback');
      }

      setIsSuccess(true);
      onFeedbackSubmitted(data.feedback);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1400);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error recording your feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStarSelector = (
    value: number,
    onChange: (val: number) => void,
    hoverVal?: number | null,
    onHover?: (val: number | null) => void
  ) => {
    return (
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= (hoverVal !== null && hoverVal !== undefined ? hoverVal : value);
          return (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              onMouseEnter={() => onHover && onHover(star)}
              onMouseLeave={() => onHover && onHover(null)}
              className="p-1 rounded-md transition-all duration-150 transform hover:scale-110 focus:outline-none"
              title={`${star} stars`}
            >
              <Star
                className={`w-6 h-6 transition-colors ${
                  isFilled
                    ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                    : 'text-slate-300 stroke-[1.5]'
                }`}
              />
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div
      id="feedback-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
    >
      <div
        id="feedback-modal-container"
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden my-6 animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 relative">
          <button
            id="feedback-modal-close-btn"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1.5">
            <Award className="w-4 h-4" />
            Post-Event Feedback & Academic Metric
          </div>
          <h2 className="text-xl font-extrabold text-white font-display line-clamp-1">
            {event.title}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Organized by {event.organizerName} • {event.departmentName}
          </p>
        </div>

        {/* Content */}
        {isSuccess ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 font-display">
              Thank You for Your Feedback!
            </h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Your evaluation has been recorded in the faculty performance ledger and helps shape future departmental workshops.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Overall Star Rating */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                Overall Event Experience
              </span>
              <div className="flex justify-center">
                {renderStarSelector(rating, setRating, hoverRating, setHoverRating)}
              </div>
              <div className="text-xs font-semibold text-blue-700 h-4">
                {getRatingLabel(hoverRating !== null ? hoverRating : rating)}
              </div>
            </div>

            {/* Dimensional Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5">
                <span className="text-[11px] font-bold text-slate-700 block">
                  Content Quality
                </span>
                {renderStarSelector(contentQuality, setContentQuality)}
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5">
                <span className="text-[11px] font-bold text-slate-700 block">
                  Organization & Venue
                </span>
                {renderStarSelector(organization, setOrganization)}
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5">
                <span className="text-[11px] font-bold text-slate-700 block">
                  Speaker Effectiveness
                </span>
                {renderStarSelector(speakerRating, setSpeakerRating)}
              </div>
            </div>

            {/* Would Recommend Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Would you recommend this workshop to junior students?
                </span>
                <span className="text-[11px] text-slate-500">
                  Used for department curriculum & accreditation metrics
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setWouldRecommend(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    wouldRecommend
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setWouldRecommend(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    !wouldRecommend
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  No
                </button>
              </div>
            </div>

            {/* Key Takeaways */}
            <div className="space-y-1.5">
              <label
                htmlFor="feedback-takeaways-input"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                Key Takeaways / Skills Learned
              </label>
              <input
                id="feedback-takeaways-input"
                type="text"
                value={takeaways}
                onChange={(e) => setTakeaways(e.target.value)}
                placeholder="e.g., Docker containerization, REST architecture, RAG pipelines..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>

            {/* Written Comments */}
            <div className="space-y-1.5">
              <label
                htmlFor="feedback-comments-textarea"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                Comments & Suggestions for Faculty
              </label>
              <textarea
                id="feedback-comments-textarea"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share constructive feedback regarding pacing, lab sandboxes, or future topic requests..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button
                id="submit-feedback-btn"
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-colors flex items-center gap-2 disabled:bg-slate-300"
              >
                {isSubmitting ? (
                  <>Submitting...</>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Submit Feedback
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
