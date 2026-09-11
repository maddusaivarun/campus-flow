import React, { useState } from 'react';
import {
  Search,
  Calendar,
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
  Award,
  AlertCircle,
  LayoutGrid,
  CalendarDays,
  Globe,
  ExternalLink
} from 'lucide-react';
import { DepartmentEvent, EventCategory } from '../types';
import { EventsCalendarView } from './EventsCalendarView';
import { AddToCalendarMenu } from './AddToCalendarMenu';
import { VignanLogo } from './VignanLogo';
import { EventCountdownTimer } from './EventCountdownTimer';
import { Plus } from 'lucide-react';

interface PublicCatalogProps {
  events: DepartmentEvent[];
  onSelectEvent: (event: DepartmentEvent) => void;
  registeredEventIds: string[];
  onProposeEvent?: () => void;
}

const CATEGORIES: (EventCategory | 'All')[] = [
  'All',
  'Workshop',
  'Technical',
  'Hackathon',
  'Seminar',
  'Guest Lecture',
  'Competition'
];

export const PublicCatalog: React.FC<PublicCatalogProps> = ({
  events,
  onSelectEvent,
  registeredEventIds,
  onProposeEvent
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'All'>('All');
  const [availabilityFilter, setAvailabilityFilter] = useState<'All' | 'Open' | 'Almost Full'>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');

  // Strict client-side safety guard in addition to backend filter:
  // ONLY PUBLISHED OR REGISTRATION_OPEN events can be rendered in this public view!
  const publishedEvents = events.filter(
    (e) => e.status === 'PUBLISHED' || e.status === 'REGISTRATION_OPEN'
  );

  const filteredEvents = publishedEvents.filter((evt) => {
    const matchesSearch =
      evt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.speaker?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || evt.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesAvailability =
      availabilityFilter === 'All' ||
      (availabilityFilter === 'Open' && evt.registeredCount < evt.capacity) ||
      (availabilityFilter === 'Almost Full' &&
        evt.registeredCount >= evt.capacity * 0.8 &&
        evt.registeredCount < evt.capacity);

    return matchesSearch && matchesCategory && matchesAvailability;
  });

  return (
    <div className="space-y-8">
      {/* Institutional Top Edge Banner with Official Logo */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3.5 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <VignanLogo size="sm" />
          <div>
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Official University Public Gateway
            </div>
            <div className="text-[11px] text-slate-500">
              Vignan's Foundation for Science, Technology & Research • Accredited NAAC 'A+'
            </div>
          </div>
        </div>

        {/* Public View Indicator Badge & Action */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            <Globe className="w-3.5 h-3.5" />
            Public View Active (Zero Login Required to Browse)
          </span>
          {onProposeEvent && (
            <button
              onClick={onProposeEvent}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Propose Event</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Header: Official University Positioning */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0b1c30] via-[#0e2746] to-[#12365e] text-white p-8 md:p-10 shadow-xl border border-slate-800">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-4 border border-blue-400/30">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            Statutory Approval-First Network • Department of CSBS & IoT
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white font-display leading-tight">
            Discover Verified Campus Activities & Symposia
          </h1>
          <p className="mt-3 text-slate-300 text-base leading-relaxed">
            Every listed event is officially cleared by the Head of Department (HOD) with verified venue allocations, attendance credit mappings, and digital gate credentials.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Institutional OBE Credit Mapped</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Instant Digital QR Gate Passes</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur">
              <CalendarDays className="w-4 h-4 text-blue-400" />
              <span>1-Click Sync to Google & Outlook Calendars</span>
            </div>
          </div>
        </div>

        {/* Decorative graphic element */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-blue-600/10 to-transparent pointer-events-none" />
      </div>

      {/* View Switcher Toolbar & Search Header */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Primary View Mode Switcher: Cards vs Calendar View */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 w-full sm:w-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-700 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Event Cards Grid ({filteredEvents.length})</span>
            </button>

            <button
              onClick={() => setViewMode('calendar')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'calendar'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>Calendar View by Date</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by topic, venue, speaker, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
            />
          </div>

          {/* Availability Toggle */}
          <div className="flex items-center gap-1 w-full sm:w-auto bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <span className="px-2 text-slate-500 font-medium hidden sm:inline">Seats:</span>
            <button
              onClick={() => setAvailabilityFilter('All')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                availabilityFilter === 'All'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setAvailabilityFilter('Open')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                availabilityFilter === 'Open'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Available
            </button>
            <button
              onClick={() => setAvailabilityFilter('Almost Full')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                availabilityFilter === 'Almost Full'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Filling Fast
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* RENDER VIEW: Calendar View vs Cards Grid */}
      {viewMode === 'calendar' ? (
        <div className="space-y-4">
          <EventsCalendarView
            events={filteredEvents}
            onSelectEvent={onSelectEvent}
            registeredEventIds={registeredEventIds}
          />
        </div>
      ) : (
        /* Grid of Verified Public Events */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
              Approved Activities Available for Registration
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                {filteredEvents.length} Active
              </span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Strict HOD Clearance Enforced
            </span>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-800">No events matched your search</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Try adjusting your category or availability filter. Note that draft or unapproved events remain strictly hidden until formal HOD sign-off.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((evt) => {
                const isRegistered = registeredEventIds.includes(evt.id);
                const seatsLeft = evt.capacity - evt.registeredCount;
                const fillPercentage = Math.min(100, Math.round((evt.registeredCount / evt.capacity) * 100));
                const isFull = seatsLeft <= 0;

                return (
                  <div
                    key={evt.id}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col group"
                  >
                    {/* Poster Header */}
                    <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                      <img
                        src={evt.posterUrl}
                        alt={evt.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

                      {/* Category & Credits Badge */}
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-blue-600/90 text-white backdrop-blur border border-blue-400/40">
                          {evt.category}
                        </span>
                        {evt.academicCredits > 0 && (
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 backdrop-blur border border-emerald-500/40 flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            {evt.academicCredits} Credits
                          </span>
                        )}
                      </div>

                      {/* HOD Clearance Stamp */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                        <div className="flex items-center gap-1.5 bg-black/60 px-2 py-1 rounded backdrop-blur text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="font-medium text-slate-200">
                            HOD Signed: {evt.hodReviewerName || 'Head of Department (CSBS & IoT)'}
                          </span>
                        </div>

                        {isRegistered && (
                          <span className="px-2 py-0.5 rounded bg-emerald-500 text-white font-bold text-[10px] tracking-wide uppercase">
                            Registered ✓
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Body Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                          <span className="text-blue-700 font-semibold">{evt.departmentName}</span>
                          <span>•</span>
                          <span>{evt.eventType}</span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2 font-display">
                          {evt.title}
                        </h3>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {evt.shortDescription}
                        </p>

                        {/* Event Meta Details */}
                        <div className="pt-2 space-y-1.5 text-xs text-slate-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{evt.date} • {evt.startTime} - {evt.endTime}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{evt.venue}</span>
                          </div>
                          {evt.speaker?.name && (
                            <div className="flex items-center gap-2 text-slate-700 font-medium">
                              <span className="text-[11px] text-slate-400 uppercase font-semibold">Speaker:</span>
                              <span className="truncate">{evt.speaker.name}</span>
                            </div>
                          )}
                        </div>

                        {/* Live Event Countdown Timer */}
                        <div className="pt-1">
                          <EventCountdownTimer
                            date={evt.date}
                            startTime={evt.startTime}
                            endTime={evt.endTime}
                            variant="card"
                          />
                        </div>
                      </div>

                      {/* Capacity and Action Footer */}
                      <div className="pt-3 border-t border-slate-100 space-y-3">
                        {/* Seat progress */}
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-slate-500 flex items-center gap-1 font-medium">
                              <Users className="w-3.5 h-3.5 text-slate-400" />
                              Registered Seats
                            </span>
                            <span className={`font-semibold ${isFull ? 'text-rose-600' : 'text-slate-700'}`}>
                              {evt.registeredCount} / {evt.capacity} {isFull ? '(Full)' : `(${seatsLeft} left)`}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isFull
                                  ? 'bg-rose-500'
                                  : fillPercentage > 80
                                  ? 'bg-amber-500'
                                  : 'bg-blue-600'
                              }`}
                              style={{ width: `${fillPercentage}%` }}
                            />
                          </div>
                        </div>

                        {/* Action Buttons: Register & Add to Calendar */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onSelectEvent(evt)}
                            className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                              isRegistered
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                                : isFull
                                ? 'bg-slate-100 text-slate-500 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs'
                            }`}
                          >
                            {isRegistered ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                View Pass
                              </>
                            ) : isFull ? (
                              'Full'
                            ) : (
                              <>
                                <span>Details & Register</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </>
                            )}
                          </button>

                          <AddToCalendarMenu event={evt} variant="secondary" label="Sync" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
