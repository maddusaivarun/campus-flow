import React, { useState, useMemo, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  CheckCircle2,
  Award,
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react';
import { DepartmentEvent, EventCategory } from '../types';
import { AddToCalendarMenu } from './AddToCalendarMenu';
import { EventCountdownTimer } from './EventCountdownTimer';

interface EventsCalendarViewProps {
  events: DepartmentEvent[];
  onSelectEvent: (event: DepartmentEvent) => void;
  registeredEventIds: string[];
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  Workshop: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200', dot: 'bg-blue-600' },
  Technical: { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200', dot: 'bg-indigo-600' },
  Hackathon: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', dot: 'bg-emerald-600' },
  Seminar: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', dot: 'bg-amber-600' },
  'Guest Lecture': { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200', dot: 'bg-purple-600' },
  Competition: { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200', dot: 'bg-rose-600' },
  Other: { bg: 'bg-slate-50', text: 'text-slate-800', border: 'border-slate-200', dot: 'bg-slate-600' }
};

export const EventsCalendarView: React.FC<EventsCalendarViewProps> = ({
  events = [],
  onSelectEvent,
  registeredEventIds = []
}) => {
  // Determine starting month from first event or today
  const [currentDate, setCurrentDate] = useState(() => {
    if (events.length > 0) {
      const firstValid = events.find((e) => e.date && !isNaN(new Date(e.date).getTime()));
      if (firstValid) return new Date(firstValid.date);
    }
    return new Date();
  });

  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    if (events.length > 0) {
      const firstValid = events.find((e) => e.date && !isNaN(new Date(e.date).getTime()));
      if (firstValid) return firstValid.date.trim().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Auto-sync calendar view to months with active events when events load or update
  useEffect(() => {
    if (events && events.length > 0) {
      const curYear = currentDate.getFullYear();
      const curMonth = currentDate.getMonth();
      const hasEventsInCurMonth = events.some((e) => {
        if (!e.date) return false;
        const ed = new Date(e.date);
        return !isNaN(ed.getTime()) && ed.getFullYear() === curYear && ed.getMonth() === curMonth;
      });

      if (!hasEventsInCurMonth) {
        const firstValid = events.find((e) => e.date && !isNaN(new Date(e.date).getTime()));
        if (firstValid) {
          const d = new Date(firstValid.date);
          setCurrentDate(d);
          setSelectedDateStr(firstValid.date.trim().split('T')[0]);
        }
      }
    }
  }, [events]);

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const jumpToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  const jumpToEventsMonth = () => {
    const firstValid = events.find((e) => e.date && !isNaN(new Date(e.date).getTime()));
    if (firstValid) {
      const d = new Date(firstValid.date);
      setCurrentDate(d);
      setSelectedDateStr(firstValid.date.trim().split('T')[0]);
    }
  };

  // Group events by YYYY-MM-DD
  const eventsByDate = useMemo(() => {
    const map = new Map<string, DepartmentEvent[]>();
    events.forEach((evt) => {
      if (!evt.date) return;
      if (selectedCategory !== 'All' && evt.category !== selectedCategory) return;

      const key = evt.date.trim().split('T')[0];
      const existing = map.get(key) || [];
      existing.push(evt);
      map.set(key, existing);
    });
    return map;
  }, [events, selectedCategory]);

  // List of unique months that have events scheduled
  const activeEventMonths = useMemo(() => {
    const monthsMap = new Map<string, Date>();
    events.forEach((evt) => {
      if (!evt.date) return;
      const d = new Date(evt.date);
      if (isNaN(d.getTime())) return;
      const key = `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
      if (!monthsMap.has(key)) {
        monthsMap.set(key, new Date(d.getFullYear(), d.getMonth(), 1));
      }
    });
    return Array.from(monthsMap.entries()).map(([label, date]) => ({ label, date }));
  }, [events]);

  // Generate calendar days for current month view
  const { calendarGrid, monthYearLabel } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    const monthYearLabel = `${monthName} ${year}`;

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const grid: Array<{
      dayNumber: number;
      dateStr: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      events: DepartmentEvent[];
    }> = [];

    const todayStr = new Date().toISOString().split('T')[0];

    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevDate = new Date(year, month - 1, dayNum);
      const dStr = prevDate.toISOString().split('T')[0];
      grid.push({
        dayNumber: dayNum,
        dateStr: dStr,
        isCurrentMonth: false,
        isToday: dStr === todayStr,
        events: eventsByDate.get(dStr) || []
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      grid.push({
        dayNumber: day,
        dateStr: dStr,
        isCurrentMonth: true,
        isToday: dStr === todayStr,
        events: eventsByDate.get(dStr) || []
      });
    }

    // Trailing days padding to complete 35 or 42 grid cells
    const remaining = 7 - (grid.length % 7);
    if (remaining < 7) {
      for (let day = 1; day <= remaining; day++) {
        const nextDate = new Date(year, month + 1, day);
        const dStr = nextDate.toISOString().split('T')[0];
        grid.push({
          dayNumber: day,
          dateStr: dStr,
          isCurrentMonth: false,
          isToday: dStr === todayStr,
          events: eventsByDate.get(dStr) || []
        });
      }
    }

    return { calendarGrid: grid, monthYearLabel };
  }, [currentDate, eventsByDate]);

  // Events on the currently selected date
  const selectedDayEvents = useMemo(() => {
    return events.filter((evt) => {
      const evtDate = (evt.date || '').trim().split('T')[0];
      const matchesDate = evtDate === selectedDateStr;
      const matchesCat = selectedCategory === 'All' || evt.category === selectedCategory;
      return matchesDate && matchesCat;
    });
  }, [events, selectedDateStr, selectedCategory]);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Safe formatted title for selected date
  const formattedDayTitle = useMemo(() => {
    try {
      if (!selectedDateStr) return 'Selected Day';
      const parts = selectedDateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });
        }
      }
      return selectedDateStr;
    } catch {
      return selectedDateStr;
    }
  }, [selectedDateStr]);

  return (
    <div className="space-y-6">
      {/* Calendar Header and Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Navigation & Month Title */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={jumpToToday}
              className="px-3 py-1 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 hover:text-blue-600 transition-colors"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>{monthYearLabel}</span>
          </h2>

          {/* Quick jump to active events month if user navigated away */}
          {activeEventMonths.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-400 hidden sm:inline">Events in:</span>
              {activeEventMonths.map(({ label, date }) => (
                <button
                  key={label}
                  onClick={() => {
                    setCurrentDate(new Date(date));
                    const found = events.find((e) => {
                      if (!e.date) return false;
                      const ed = new Date(e.date);
                      return ed.getFullYear() === date.getFullYear() && ed.getMonth() === date.getMonth();
                    });
                    if (found) setSelectedDateStr(found.date.trim().split('T')[0]);
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-all ${
                    currentDate.getMonth() === date.getMonth() && currentDate.getFullYear() === date.getFullYear()
                      ? 'bg-blue-50 dark:bg-blue-950 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 shadow-2xs'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                  title={`View ${label} schedule`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {['All', 'Workshop', 'Technical', 'Hackathon', 'Seminar', 'Guest Lecture'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split Layout: Month Grid on Left, Selected Day Schedule on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Month Grid (8 columns on large screens) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 overflow-hidden">
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[540px]">
              {/* Days of Week Header */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
                {daysOfWeek.map((day, idx) => (
                  <div
                    key={day}
                    className={`text-center py-2 text-xs font-bold uppercase tracking-wider ${
                      idx === 0 || idx === 6 ? 'text-rose-500' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Day Cells */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {calendarGrid.map((cell, idx) => {
                  const hasEvents = cell.events.length > 0;
                  const isSelected = cell.dateStr === selectedDateStr;

                  return (
                    <button
                      key={`${cell.dateStr}-${idx}`}
                      onClick={() => setSelectedDateStr(cell.dateStr)}
                      className={`min-h-[75px] sm:min-h-[95px] p-1.5 sm:p-2 rounded-xl text-left border transition-all flex flex-col justify-between group ${
                        isSelected
                          ? 'ring-2 ring-blue-600 border-blue-400 dark:border-blue-500 bg-blue-50/60 dark:bg-blue-950/40'
                          : cell.isCurrentMonth
                          ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-slate-50/80 dark:hover:bg-slate-800/60'
                          : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-100 dark:border-slate-850 text-slate-400 dark:text-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span
                          className={`text-xs font-bold inline-flex items-center justify-center w-6 h-6 rounded-full ${
                            cell.isToday
                              ? 'bg-blue-600 text-white shadow-xs'
                              : isSelected
                              ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                              : cell.isCurrentMonth
                              ? 'text-slate-800 dark:text-slate-200'
                              : 'text-slate-400 dark:text-slate-600'
                          }`}
                        >
                          {cell.dayNumber}
                        </span>

                        {hasEvents && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-900/80 text-blue-700 dark:text-blue-300 sm:inline hidden">
                            {cell.events.length}
                          </span>
                        )}
                      </div>

                      {/* Event Badges inside day cell */}
                      <div className="space-y-1 w-full mt-1">
                        {cell.events.slice(0, 2).map((evt) => {
                          const theme = CATEGORY_COLORS[evt.category] || CATEGORY_COLORS.Other;
                          return (
                            <div
                              key={evt.id}
                              className={`px-1.5 py-0.5 rounded text-[10px] truncate font-medium border flex items-center gap-1 ${theme.bg} ${theme.text} ${theme.border} dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700`}
                              title={`${evt.title} (${evt.startTime})`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${theme.dot} shrink-0`} />
                              <span className="truncate">{evt.title}</span>
                            </div>
                          );
                        })}
                        {cell.events.length > 2 && (
                          <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400 pl-1">
                            +{cell.events.length - 2} more
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Categories:</span>
              {Object.entries(CATEGORY_COLORS).map(([cat, theme]) => (
                <span key={cat} className="inline-flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${theme.dot}`} />
                  <span>{cat}</span>
                </span>
              ))}
            </div>
            <span className="text-slate-400 dark:text-slate-500 italic">Click any date to view day agenda</span>
          </div>
        </div>

        {/* Selected Day Agenda (4 columns on large screens) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Day Schedule
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                  {formattedDayTitle}
                </h3>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-semibold">
                {selectedDayEvents.length} {selectedDayEvents.length === 1 ? 'Event' : 'Events'}
              </span>
            </div>

            {selectedDayEvents.length === 0 ? (
              <div className="py-12 text-center">
                <CalendarIcon className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  No approved events scheduled for this day.
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  Select another highlighted date on the calendar.
                </p>
                {events.length > 0 && (
                  <button
                    onClick={jumpToEventsMonth}
                    className="mt-3 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-semibold hover:bg-blue-100 transition-colors"
                  >
                    Jump to Month with Events →
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDayEvents.map((evt) => {
                  const isRegistered = registeredEventIds.includes(evt.id);
                  const theme = CATEGORY_COLORS[evt.category] || CATEGORY_COLORS.Other;
                  const isFull = evt.registeredCount >= evt.capacity;

                  return (
                    <div
                      key={evt.id}
                      className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:border-blue-300 dark:hover:border-blue-700 transition-all bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 shadow-2xs space-y-3"
                    >
                      {/* Category & Status */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${theme.bg} ${theme.text} ${theme.border} dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700`}
                        >
                          {evt.category}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <AddToCalendarMenu event={evt} variant="compact" label="Sync" />
                          {isRegistered && (
                            <span className="px-2 py-0.5 rounded bg-emerald-500 text-white font-bold text-[10px] uppercase">
                              Registered ✓
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Event Title */}
                      <h4
                        onClick={() => onSelectEvent(evt)}
                        className="text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer leading-snug font-display"
                      >
                        {evt.title}
                      </h4>

                      {/* Time & Venue */}
                      <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            {evt.startTime} - {evt.endTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{evt.venue}</span>
                        </div>
                      </div>

                      {/* Event Countdown */}
                      <div>
                        <EventCountdownTimer
                          date={evt.date}
                          startTime={evt.startTime}
                          endTime={evt.endTime}
                          variant="compact"
                          className="w-full justify-between"
                        />
                      </div>

                      {/* Status Stamp */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                        {evt.status === 'PUBLISHED' ? (
                          <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            HOD Verified & Published
                          </span>
                        ) : evt.status === 'PENDING_REVIEW' ? (
                          <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium">
                            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            Pending HOD Clearance
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {evt.status}
                          </span>
                        )}
                        <span className="text-slate-600 dark:text-slate-400 font-medium">
                          {evt.registeredCount}/{evt.capacity} Seats
                        </span>
                      </div>

                      {/* Details & Register Button */}
                      <button
                        onClick={() => onSelectEvent(evt)}
                        className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                          isRegistered
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                            : isFull
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                        }`}
                      >
                        {isRegistered ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            View Digital Pass
                          </>
                        ) : (
                          <>
                            <span>View Details & Register</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick University Notice */}
          <div className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 rounded-xl p-4 text-xs text-blue-900 dark:text-blue-200 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-blue-800 dark:text-blue-300">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Institutional Calendar Guarantee
            </div>
            <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
              Every date and time displayed in this calendar is synchronized in real-time with statutory HOD department approvals and university venue booking registers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
