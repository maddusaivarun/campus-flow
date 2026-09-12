import React, { useState, useMemo } from 'react';
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
  events,
  onSelectEvent,
  registeredEventIds
}) => {
  // Determine starting month from first event or today
  const [currentDate, setCurrentDate] = useState(() => {
    if (events.length > 0 && events[0].date) {
      const d = new Date(events[0].date);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  });

  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    if (events.length > 0 && events[0].date) {
      return events[0].date;
    }
    return new Date().toISOString().split('T')[0];
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('All');

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

  return (
    <div className="space-y-6">
      {/* Calendar Header and Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Navigation & Month Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-white text-slate-700 hover:text-slate-900 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={jumpToToday}
              className="px-3 py-1 rounded-lg text-xs font-semibold text-slate-700 hover:bg-white hover:text-blue-600 transition-colors"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-white text-slate-700 hover:text-slate-900 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-xl font-bold font-display text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            <span>{monthYearLabel}</span>
          </h2>
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
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 overflow-hidden">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
            {daysOfWeek.map((day, idx) => (
              <div
                key={day}
                className={`text-center py-2 text-xs font-bold uppercase tracking-wider ${
                  idx === 0 || idx === 6 ? 'text-rose-500' : 'text-slate-500'
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
                      ? 'ring-2 ring-blue-600 border-blue-400 bg-blue-50/40'
                      : cell.isCurrentMonth
                      ? 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50/70'
                      : 'bg-slate-50/50 border-slate-100 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-bold inline-flex items-center justify-center w-6 h-6 rounded-full ${
                        cell.isToday
                          ? 'bg-blue-600 text-white shadow-xs'
                          : isSelected
                          ? 'bg-blue-100 text-blue-800'
                          : cell.isCurrentMonth
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {hasEvents && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 sm:inline hidden">
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
                          className={`px-1.5 py-0.5 rounded text-[10px] truncate font-medium border flex items-center gap-1 ${theme.bg} ${theme.text} ${theme.border}`}
                          title={`${evt.title} (${evt.startTime})`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${theme.dot} shrink-0`} />
                          <span className="truncate">{evt.title}</span>
                        </div>
                      );
                    })}
                    {cell.events.length > 2 && (
                      <div className="text-[9px] font-bold text-slate-500 pl-1">
                        +{cell.events.length - 2} more
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-700">Categories:</span>
              {Object.entries(CATEGORY_COLORS).map(([cat, theme]) => (
                <span key={cat} className="inline-flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${theme.dot}`} />
                  <span>{cat}</span>
                </span>
              ))}
            </div>
            <span className="text-slate-400 italic">Click any date to view day agenda</span>
          </div>
        </div>

        {/* Selected Day Agenda (4 columns on large screens) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                  Day Schedule
                </span>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </h3>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold">
                {selectedDayEvents.length} {selectedDayEvents.length === 1 ? 'Event' : 'Events'}
              </span>
            </div>

            {selectedDayEvents.length === 0 ? (
              <div className="py-12 text-center">
                <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-500">
                  No approved events scheduled for this day.
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Select another highlighted date on the calendar.
                </p>
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
                      className="border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-all bg-slate-50/50 hover:bg-white shadow-2xs space-y-3"
                    >
                      {/* Category & Status */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${theme.bg} ${theme.text} ${theme.border}`}
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
                        className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer leading-snug font-display"
                      >
                        {evt.title}
                      </h4>

                      {/* Time & Venue */}
                      <div className="space-y-1 text-xs text-slate-600">
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
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                        {evt.status === 'PUBLISHED' ? (
                          <span className="flex items-center gap-1 text-emerald-700 font-medium">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            HOD Verified & Published
                          </span>
                        ) : evt.status === 'PENDING_REVIEW' ? (
                          <span className="flex items-center gap-1 text-amber-700 font-medium">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            Pending HOD Clearance
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-slate-500 font-medium">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {evt.status}
                          </span>
                        )}
                        <span className="text-slate-600 font-medium">
                          {evt.registeredCount}/{evt.capacity} Seats
                        </span>
                      </div>

                      {/* Details & Register Button */}
                      <button
                        onClick={() => onSelectEvent(evt)}
                        className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                          isRegistered
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                            : isFull
                            ? 'bg-slate-100 text-slate-500'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                        }`}
                      >
                        {isRegistered ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
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
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-4 text-xs text-blue-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-blue-800">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Institutional Calendar Guarantee
            </div>
            <p className="text-[11px] text-blue-700 leading-relaxed">
              Every date and time displayed in this calendar is synchronized in real-time with statutory HOD department approvals and university venue booking registers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
