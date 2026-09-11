import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, CheckCircle2, Play } from 'lucide-react';

interface EventCountdownTimerProps {
  date: string; // 'YYYY-MM-DD'
  startTime: string; // '09:30' or '09:30 AM'
  endTime?: string; // '13:00' or '01:00 PM'
  variant?: 'compact' | 'badge' | 'card' | 'hero' | 'minimal';
  className?: string;
  showLabels?: boolean;
}

interface TimeRemaining {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isLive: boolean;
  isPast: boolean;
  liveRemainingMs?: number;
  liveHours?: number;
  liveMinutes?: number;
  liveSeconds?: number;
}

// Helper to convert date and time string into a Date object
function parseEventDateTime(dateStr: string, timeStr?: string): Date | null {
  if (!dateStr) return null;

  try {
    let hours = 9;
    let minutes = 0;

    if (timeStr) {
      const clean = timeStr.trim().toUpperCase();
      const isPM = clean.includes('PM');
      const isAM = clean.includes('AM');
      const timeParts = clean.replace(/[APM\s]/g, '').split(':');

      if (timeParts.length >= 2) {
        hours = parseInt(timeParts[0], 10) || 0;
        minutes = parseInt(timeParts[1], 10) || 0;

        if (isPM && hours < 12) hours += 12;
        if (isAM && hours === 12) hours = 0;
      }
    }

    const [year, month, day] = dateStr.split('-').map((v) => parseInt(v, 10));
    if (!year || !month || !day) {
      const fallback = new Date(dateStr);
      return isNaN(fallback.getTime()) ? null : fallback;
    }

    const d = new Date(year, month - 1, day, hours, minutes, 0, 0);
    return isNaN(d.getTime()) ? null : d;
  } catch (e) {
    return null;
  }
}

function calculateTimeRemaining(dateStr: string, startTimeStr?: string, endTimeStr?: string): TimeRemaining {
  const start = parseEventDateTime(dateStr, startTimeStr);
  const end = endTimeStr ? parseEventDateTime(dateStr, endTimeStr) : null;
  const now = new Date().getTime();

  if (!start) {
    return {
      totalMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isLive: false,
      isPast: true
    };
  }

  const startMs = start.getTime();
  const endMs = end ? end.getTime() : startMs + 3 * 60 * 60 * 1000; // default 3 hr duration

  // Check if live
  if (now >= startMs && now < endMs) {
    const liveDiff = endMs - now;
    const lSeconds = Math.floor((liveDiff / 1000) % 60);
    const lMinutes = Math.floor((liveDiff / 1000 / 60) % 60);
    const lHours = Math.floor(liveDiff / (1000 * 60 * 60));

    return {
      totalMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isLive: true,
      isPast: false,
      liveRemainingMs: liveDiff,
      liveHours: lHours,
      liveMinutes: lMinutes,
      liveSeconds: lSeconds
    };
  }

  // Check if past
  if (now >= endMs) {
    return {
      totalMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isLive: false,
      isPast: true
    };
  }

  // Upcoming
  const diff = startMs - now;
  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  return {
    totalMs: diff,
    days,
    hours,
    minutes,
    seconds,
    isLive: false,
    isPast: false
  };
}

const pad = (n: number) => String(Math.max(0, n)).padStart(2, '0');

export const EventCountdownTimer: React.FC<EventCountdownTimerProps> = ({
  date,
  startTime,
  endTime,
  variant = 'card',
  className = '',
  showLabels = true
}) => {
  const [time, setTime] = useState<TimeRemaining>(() =>
    calculateTimeRemaining(date, startTime, endTime)
  );

  useEffect(() => {
    // Initial calculation
    setTime(calculateTimeRemaining(date, startTime, endTime));

    // Update every second
    const timer = setInterval(() => {
      setTime(calculateTimeRemaining(date, startTime, endTime));
    }, 1000);

    return () => clearInterval(timer);
  }, [date, startTime, endTime]);

  // LIVE EVENT RENDER
  if (time.isLive) {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-mono text-xs font-bold animate-pulse ${className}`}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        <Play className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
        <span>HAPPENING NOW</span>
        <span className="text-emerald-800 font-semibold">
          (Ends in {pad(time.liveHours || 0)}:{pad(time.liveMinutes || 0)}:{pad(time.liveSeconds || 0)})
        </span>
      </div>
    );
  }

  // PAST EVENT RENDER
  if (time.isPast) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-500 border border-slate-200 text-xs font-medium ${className}`}
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
        <span>Concluded</span>
      </div>
    );
  }

  // COMPACT / BADGE VARIANT (Used on event cards & lists)
  if (variant === 'compact' || variant === 'badge') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200/80 text-blue-800 font-mono text-xs font-semibold ${className}`}
        title={`Starts on ${date} at ${startTime}`}
      >
        <Clock className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
        <span className="text-[10px] uppercase font-sans text-blue-600 font-bold tracking-wider">
          Starts in:
        </span>
        <span className="tabular-nums">
          {time.days > 0 && `${time.days}d `}
          {pad(time.hours)}h {pad(time.minutes)}m {pad(time.seconds)}s
        </span>
      </div>
    );
  }

  // MINIMAL VARIANT
  if (variant === 'minimal') {
    return (
      <span className={`font-mono text-xs font-semibold text-blue-700 tabular-nums ${className}`}>
        {time.days > 0 ? `${time.days}d ` : ''}
        {pad(time.hours)}:{pad(time.minutes)}:{pad(time.seconds)}
      </span>
    );
  }

  // HERO VARIANT (Used in EventDetailModal header)
  if (variant === 'hero') {
    return (
      <div className={`bg-slate-900/90 border border-blue-500/30 rounded-xl p-3.5 text-white shadow-lg backdrop-blur ${className}`}>
        <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-white/10">
          <div className="flex items-center gap-1.5 text-xs text-blue-400 font-bold uppercase tracking-wider font-mono">
            <Clock className="w-4 h-4 text-blue-400 animate-pulse" />
            <span>Event Countdown</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Starts: {date} • {startTime}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center font-mono">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-lg p-2">
            <div className="text-xl sm:text-2xl font-extrabold text-blue-300 tabular-nums leading-none">
              {pad(time.days)}
            </div>
            {showLabels && <div className="text-[9px] uppercase tracking-wider text-slate-400 mt-1">Days</div>}
          </div>
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-lg p-2">
            <div className="text-xl sm:text-2xl font-extrabold text-blue-300 tabular-nums leading-none">
              {pad(time.hours)}
            </div>
            {showLabels && <div className="text-[9px] uppercase tracking-wider text-slate-400 mt-1">Hours</div>}
          </div>
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-lg p-2">
            <div className="text-xl sm:text-2xl font-extrabold text-blue-300 tabular-nums leading-none">
              {pad(time.minutes)}
            </div>
            {showLabels && <div className="text-[9px] uppercase tracking-wider text-slate-400 mt-1">Mins</div>}
          </div>
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-lg p-2">
            <div className="text-xl sm:text-2xl font-extrabold text-amber-400 tabular-nums leading-none animate-pulse">
              {pad(time.seconds)}
            </div>
            {showLabels && <div className="text-[9px] uppercase tracking-wider text-slate-400 mt-1">Secs</div>}
          </div>
        </div>
      </div>
    );
  }

  // CARD VARIANT (Default: segmented pill on cards)
  return (
    <div
      className={`flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-900 text-white font-mono text-xs border border-slate-800 shadow-xs ${className}`}
    >
      <div className="flex items-center gap-1.5 text-blue-400 text-[11px] font-bold uppercase tracking-wider font-sans">
        <Clock className="w-3.5 h-3.5 text-blue-400 animate-pulse shrink-0" />
        <span>Countdown:</span>
      </div>

      <div className="flex items-center gap-1 font-mono font-bold text-xs tabular-nums text-white">
        {time.days > 0 && (
          <span className="bg-slate-800 px-1.5 py-0.5 rounded text-blue-300">
            {pad(time.days)}<span className="text-[9px] font-normal text-slate-400">d</span>
          </span>
        )}
        <span className="bg-slate-800 px-1.5 py-0.5 rounded text-blue-300">
          {pad(time.hours)}<span className="text-[9px] font-normal text-slate-400">h</span>
        </span>
        <span className="text-slate-600">:</span>
        <span className="bg-slate-800 px-1.5 py-0.5 rounded text-blue-300">
          {pad(time.minutes)}<span className="text-[9px] font-normal text-slate-400">m</span>
        </span>
        <span className="text-slate-600">:</span>
        <span className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-400 animate-pulse">
          {pad(time.seconds)}<span className="text-[9px] font-normal text-slate-400">s</span>
        </span>
      </div>
    </div>
  );
};
