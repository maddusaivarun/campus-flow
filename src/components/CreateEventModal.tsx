import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Users,
  Award,
  BookOpen,
  Send,
  Save,
  Plus,
  Trash2,
  HelpCircle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { DepartmentEvent, EventCategory, UserProfile, AgendaItem } from '../types';
import { safeFetchJson, generateClientCharterSuggestion } from '../lib/clientFallback';

interface CreateEventModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onSubmitEvent?: (eventData: Partial<DepartmentEvent>, submitImmediately: boolean) => Promise<void>;
  onCreateEvent?: (eventData: Partial<DepartmentEvent>, submitImmediately: boolean) => Promise<void>;
  onSubmit?: (eventData: Partial<DepartmentEvent>, submitImmediately: boolean) => Promise<void>;
  currentUser?: UserProfile;
  initialData?: Partial<DepartmentEvent>;
}

const VENUE_PRESETS = [
  { name: 'IoT & Embedded Systems Lab', cap: 60, loc: 'CSBS-IoT Block, 2nd Floor, Room 204' },
  { name: 'CSBS Innovation & Business Studio', cap: 80, loc: 'Management & CSBS Complex, 1st Floor' },
  { name: 'Turing Auditorium', cap: 250, loc: 'Main Administrative Block, Ground Floor' },
  { name: 'Ramanujan Seminar Hall', cap: 120, loc: 'Science & Technology Block, 3rd Floor' },
  { name: 'Cloud & Edge Computing Facility', cap: 90, loc: 'CSBS-IoT Specialized Research Wing' },
  { name: 'Open Atrium & Quadrangle', cap: 350, loc: 'Central University Quadrangle' },
];

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen = true,
  onClose,
  onSubmitEvent,
  onCreateEvent,
  onSubmit,
  currentUser,
  initialData
}) => {
  if (!isOpen) return null;
  const submitHandler = onSubmitEvent || onCreateEvent || onSubmit;
  // Form state
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<EventCategory>('Workshop');
  const [eventType, setEventType] = useState('Hands-on Technical Workshop');
  const [date, setDate] = useState('2026-09-24');
  const [startTime, setStartTime] = useState('09:30');
  const [endTime, setEndTime] = useState('13:00');
  const [venue, setVenue] = useState('IoT & Embedded Systems Lab');
  const [locationDetails, setLocationDetails] = useState('CSBS-IoT Block, 2nd Floor, Room 204');
  const [capacity, setCapacity] = useState(60);
  const [registrationDeadline, setRegistrationDeadline] = useState('2026-09-23');
  const [registrationFormUrl, setRegistrationFormUrl] = useState(
    initialData?.registrationFormUrl || ''
  );
  const [academicCredits, setAcademicCredits] = useState(2.0);
  const [syllabusMapping, setSyllabusMapping] = useState('CSBS-IOT-8402: Module 4 Outcome-Based Education Aligned');

  // Speaker
  const [speakerName, setSpeakerName] = useState('Dr. Sarah Jenkins');
  const [speakerDesignation, setSpeakerDesignation] = useState('Assoc. Professor • AI & IoT Lab');
  const [speakerOrg, setSpeakerOrg] = useState('Dept. of CSBS & IoT');
  const [speakerBio, setSpeakerBio] = useState('Leading autonomous systems and applied deep learning research.');

  // Objectives
  const [objectives, setObjectives] = useState<string[]>([
    'Equip students with hands-on foundational architectures and system design.',
    'Build and evaluate modular code artifacts using campus computational sandboxes.'
  ]);
  const [newObjective, setNewObjective] = useState('');

  // Agenda
  const [agenda, setAgenda] = useState<AgendaItem[]>([
    {
      id: 'ag-1',
      time: '09:30 AM - 10:30 AM',
      sessionTitle: 'Theoretical Architecture Foundations',
      description: 'Foundational concepts and system requirement walkthrough.',
      durationMinutes: 60
    },
    {
      id: 'ag-2',
      time: '10:45 AM - 12:30 PM',
      sessionTitle: 'Hands-on Implementation Lab',
      description: 'Practical exercise in computing lab with mentor guidance.',
      durationMinutes: 105
    }
  ]);

  // Requirements
  const [prerequisites, setPrerequisites] = useState('Basic Python fluency, data structures basics.');
  const [thingsToBring, setThingsToBring] = useState('Personal laptop with charger, university ID.');
  const [softwareTools, setSoftwareTools] = useState('Python 3.10+, VS Code or Cursor IDE.');

  // AI Copilot state
  const [copilotPrompt, setCopilotPrompt] = useState('');
  const [isCopilotGenerating, setIsCopilotGenerating] = useState(false);
  const [copilotSuccess, setCopilotSuccess] = useState<string | null>(null);
  const [copilotError, setCopilotError] = useState<string | null>(null);

  // Submission state
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Call server-side Gemini AI Copilot with client-side resilient fallback
  const handleGenerateWithAI = async () => {
    setCopilotError(null);
    if (!copilotPrompt.trim()) {
      setCopilotError('Please enter a prompt for the AI Copilot (e.g. "Conduct a 4-hour hands-on workshop about generative AI for 2nd year students")');
      return;
    }

    setIsCopilotGenerating(true);
    setCopilotSuccess(null);
    try {
      let suggestion: any = null;
      let isAiPowered = false;

      try {
        const data = await safeFetchJson<{ suggestion?: any; aiPowered?: boolean }>('/api/copilot/suggest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: copilotPrompt,
            department: currentUser?.departmentName || 'Department of Computer Science & Engineering'
          })
        });
        if (data && data.suggestion) {
          suggestion = data.suggestion;
          isAiPowered = !!data.aiPowered;
        }
      } catch (netErr) {
        // Fall through to client charter generator
      }

      if (!suggestion) {
        suggestion = generateClientCharterSuggestion(
          copilotPrompt,
          currentUser?.departmentName || 'Department of Computer Science & Engineering'
        );
      }

      if (suggestion) {
        if (suggestion.title) setTitle(suggestion.title);
        if (suggestion.shortDescription) setShortDescription(suggestion.shortDescription);
        if (suggestion.description) setDescription(suggestion.description);
        if (suggestion.category) setCategory(suggestion.category as EventCategory);
        if (suggestion.eventType) setEventType(suggestion.eventType);
        if (suggestion.syllabusMapping) setSyllabusMapping(suggestion.syllabusMapping);
        if (suggestion.academicCredits) setAcademicCredits(Number(suggestion.academicCredits));
        if (suggestion.objectives && Array.isArray(suggestion.objectives)) setObjectives(suggestion.objectives);
        if (suggestion.agenda && Array.isArray(suggestion.agenda)) setAgenda(suggestion.agenda);
        if (suggestion.requirements) {
          if (suggestion.requirements.prerequisites) setPrerequisites(suggestion.requirements.prerequisites);
          if (suggestion.requirements.thingsToBring) setThingsToBring(suggestion.requirements.thingsToBring);
          if (suggestion.requirements.softwareTools) setSoftwareTools(suggestion.requirements.softwareTools);
        }

        setCopilotSuccess(
          isAiPowered
            ? '✓ Generated high-yield syllabus charter via Gemini AI!'
            : '✓ Populated structured curriculum activity charter via CampusFlow AI Copilot!'
        );
      }
    } catch (err: any) {
      const fallback = generateClientCharterSuggestion(
        copilotPrompt,
        currentUser?.departmentName || 'Department of Computer Science & Engineering'
      );
      setTitle(fallback.title);
      setShortDescription(fallback.shortDescription);
      setDescription(fallback.description);
      setCategory(fallback.category);
      setEventType(fallback.eventType);
      setSyllabusMapping(fallback.syllabusMapping);
      setAcademicCredits(fallback.academicCredits);
      setObjectives(fallback.objectives);
      setAgenda(fallback.agenda);
      setCopilotSuccess('✓ Populated structured university activity charter!');
    } finally {
      setIsCopilotGenerating(false);
    }
  };

  const handleAddObjective = () => {
    if (newObjective.trim()) {
      setObjectives([...objectives, newObjective.trim()]);
      setNewObjective('');
    }
  };

  const handleRemoveObjective = (index: number) => {
    setObjectives(objectives.filter((_, i) => i !== index));
  };

  const handleSubmit = async (submitImmediately: boolean) => {
    if (!title.trim()) {
      setErrorMessage('Event title is required.');
      return;
    }
    if (!date) {
      setErrorMessage('Event date is required.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const eventPayload: Partial<DepartmentEvent> = {
        title,
        shortDescription: shortDescription || title,
        description: description || shortDescription || title,
        objectives,
        category,
        eventType,
        date,
        startTime,
        endTime,
        venue,
        locationDetails,
        capacity: Number(capacity) || 100,
        registrationDeadline,
        registrationFormUrl: registrationFormUrl.trim() || undefined,
        academicCredits: Number(academicCredits),
        syllabusMapping,
        speaker: {
          name: speakerName,
          designation: speakerDesignation,
          organization: speakerOrg,
          bio: speakerBio
        },
        agenda,
        requirements: {
          prerequisites,
          thingsToBring,
          softwareTools
        }
      };

      if (typeof submitHandler === 'function') {
        await submitHandler(eventPayload, submitImmediately);
      } else {
        const res = await fetch('/api/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(currentUser ? { 'x-user-role': currentUser.role, 'x-user-id': currentUser.id } : {})
          },
          body: JSON.stringify({ ...eventPayload, submitImmediately })
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to submit event charter.');
        }
      }
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save event.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Top Header */}
        <div className="bg-[#0b1c30] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-sm">
              CF
            </div>
            <div>
              <h2 className="text-base font-bold font-display leading-none">
                Draft Department Activity Charter
              </h2>
              <span className="text-[11px] text-slate-300">
                Statutory approval by HOD required before public broadcast
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto space-y-6">
          {/* AI EVENT COPILOT PANEL */}
          <div className="p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl border border-blue-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                <Sparkles className="w-4 h-4 text-blue-600 animate-spin" />
                AI Event Copilot (Academic Charter Assistant)
              </div>
              <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                Server-Side AI
              </span>
            </div>

            <p className="text-xs text-slate-600">
              Describe what kind of activity you want to organize. The Copilot will automatically structure your title, syllabus mapping, NAAC outcomes, and session agenda!
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                placeholder="e.g., 'Conduct a 4-hour hands-on workshop about generative AI and LangGraph for 2nd year students'"
                value={copilotPrompt}
                onChange={(e) => setCopilotPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerateWithAI()}
                className="w-full flex-1 px-3 py-2 bg-white border border-blue-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="button"
                onClick={handleGenerateWithAI}
                disabled={isCopilotGenerating}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isCopilotGenerating ? 'Generating Charter...' : 'Auto-Fill with Copilot'}
              </button>
            </div>

            {copilotSuccess && (
              <div className="text-xs font-medium text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {copilotSuccess}
              </div>
            )}

            {copilotError && (
              <div className="text-xs font-medium text-rose-600 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                {copilotError}
              </div>
            )}
          </div>

          {/* Form Fields: General Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-display">
              1. Basic Charter Information
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Event Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Generative AI Workshop: From Prompting to Prototyping"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as EventCategory)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 bg-white"
                >
                  <option value="Workshop">Workshop</option>
                  <option value="Technical">Technical</option>
                  <option value="Hackathon">Hackathon</option>
                  <option value="Seminar">Seminar</option>
                  <option value="Guest Lecture">Guest Lecture</option>
                  <option value="Competition">Competition</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Event Sub-Type
                </label>
                <input
                  type="text"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Academic Credits (OBE)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={academicCredits}
                  onChange={(e) => setAcademicCredits(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Short Description (1-2 lines)
              </label>
              <input
                type="text"
                placeholder="Brief summary for event cards..."
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Detailed Activity Description & Syllabus Context
              </label>
              <textarea
                rows={3}
                placeholder="Comprehensive overview of session objectives, academic rigor, and practical pedagogy..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Syllabus & NAAC Outcome Mapping
              </label>
              <input
                type="text"
                placeholder="e.g. CSBS-IOT-8402: Module 4 & 5 (Advanced AI & IoT Networks)"
                value={syllabusMapping}
                onChange={(e) => setSyllabusMapping(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900"
              />
            </div>
          </div>

          {/* Form Fields: Date, Venue, Capacity */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-display">
              2. Date, Venue & Cohort Allocation
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Proposed Date *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Venue Name / Facility *
                  </label>
                  <span className="text-[10px] text-blue-600 font-semibold">Customizable (Type any name)</span>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Enter custom venue name or select a preset..."
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 font-medium focus:ring-2 focus:ring-blue-500"
                />
                {/* Preset quick buttons */}
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-slate-500">Presets:</span>
                  {VENUE_PRESETS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => {
                        setVenue(p.name);
                        setCapacity(p.cap);
                        setLocationDetails(p.loc);
                      }}
                      className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                        venue === p.name
                          ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {p.name} ({p.cap})
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Seat Capacity Limit
                </label>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Specific Room, Floor & Gate Instructions
                </label>
                <input
                  type="text"
                  placeholder="e.g. CSBS-IoT Block, 2nd Floor, Room 204"
                  value={locationDetails}
                  onChange={(e) => setLocationDetails(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Registration Deadline
                </label>
                <input
                  type="date"
                  value={registrationDeadline}
                  onChange={(e) => setRegistrationDeadline(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  External Registration / Survey Form Link (Google Form, MS Forms, or Joining Link)
                </label>
                <input
                  type="url"
                  placeholder="https://forms.google.com/d/e/... or https://forms.office.com/..."
                  value={registrationFormUrl}
                  onChange={(e) => setRegistrationFormUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900"
                />
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Optional: Students can open this link to fill their application before confirming attendance in real time.
                </p>
              </div>
            </div>
          </div>

          {/* Form Fields: Speaker */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-display">
              3. Resource Person / Keynote Speaker
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Speaker Name
                </label>
                <input
                  type="text"
                  value={speakerName}
                  onChange={(e) => setSpeakerName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Designation / Role
                </label>
                <input
                  type="text"
                  value={speakerDesignation}
                  onChange={(e) => setSpeakerDesignation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Organization / Affiliation
                </label>
                <input
                  type="text"
                  value={speakerOrg}
                  onChange={(e) => setSpeakerOrg(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Form Fields: Objectives */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-display">
              4. Measurable Course Learning Outcomes (Bloom's Taxonomy)
            </h3>

            <div className="space-y-2">
              {objectives.map((obj, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800">
                    {obj}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveObjective(i)}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add an outcome (e.g. 'Deploy multi-agent pipelines adhering to academic integrity standards')..."
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddObjective())}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900"
                />
                <button
                  type="button"
                  onClick={handleAddObjective}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Convenor: <span className="font-semibold text-slate-800">{currentUser?.name || 'Department Event Coordinator'}</span> ({currentUser?.departmentName || 'Department of CSBS & IoT'})
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={isSaving}
              className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              Save as Draft
            </button>

            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={isSaving}
              className="flex-1 sm:flex-none px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              {isSaving ? 'Submitting...' : 'Submit for HOD Sign-Off'}
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="px-6 py-2 bg-rose-50 text-rose-700 text-xs font-medium border-t border-rose-200">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
};
