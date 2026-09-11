import { DepartmentEvent } from '../types';

/**
 * Parses event date and time into start and end Date objects
 */
export function parseEventDateRange(event: DepartmentEvent): { start: Date; end: Date } {
  const baseDateStr = event.date || new Date().toISOString().split('T')[0];
  
  // Parse start time (e.g. "09:30 AM" or "09:30")
  const start = parseDateTime(baseDateStr, event.startTime, 9, 30);
  const end = parseDateTime(baseDateStr, event.endTime, 17, 0);

  // If end is before or equal to start, adjust to at least 1 hour after start
  if (end <= start) {
    end.setTime(start.getTime() + 2 * 60 * 60 * 1000);
  }

  return { start, end };
}

function parseDateTime(dateStr: string, timeStr?: string, defaultHour = 9, defaultMin = 0): Date {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    return new Date();
  }

  if (!timeStr) {
    d.setHours(defaultHour, defaultMin, 0, 0);
    return d;
  }

  const match = timeStr.match(/(\d+):(\d+)(?:\s*(AM|PM))?/i);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const meridiem = match[3]?.toUpperCase();

    if (meridiem === 'PM' && hours < 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;

    d.setHours(hours, minutes, 0, 0);
  } else {
    d.setHours(defaultHour, defaultMin, 0, 0);
  }

  return d;
}

/**
 * Format date to UTC string format YYYYMMDDTHHmmSSZ required by Google Calendar & iCal
 */
function formatUtcIso(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Builds a direct Google Calendar creation link
 */
export function getGoogleCalendarUrl(event: DepartmentEvent): string {
  const { start, end } = parseEventDateRange(event);
  const dates = `${formatUtcIso(start)}/${formatUtcIso(end)}`;
  
  const title = event.title;
  const description = `${event.shortDescription || event.description}\n\nOrganizer: ${event.departmentName}\nVenue: ${event.venue}\nClearance: Verified by HOD\nVignan University CampusFlow Portal`;
  const location = `${event.venue}, Vignan University`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: dates,
    details: description,
    location: location
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Builds a direct Microsoft Outlook 365 creation link
 */
export function getOutlookCalendarUrl(event: DepartmentEvent): string {
  const { start, end } = parseEventDateRange(event);
  
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    startdt: start.toISOString(),
    enddt: end.toISOString(),
    body: `${event.shortDescription || event.description}\n\nClearance: Verified by HOD, Vignan University`,
    location: `${event.venue}, Vignan University`
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Generates and triggers browser download of an RFC 5545 .ics calendar file
 */
export function downloadIcsFile(event: DepartmentEvent) {
  const { start, end } = parseEventDateRange(event);
  const uid = `vignan-evt-${event.id}-${Date.now()}@vignan.ac.in`;
  const nowUtc = formatUtcIso(new Date());
  const startUtc = formatUtcIso(start);
  const endUtc = formatUtcIso(end);

  const cleanDescription = (event.shortDescription || event.description || '')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');

  const cleanLocation = `${event.venue}, Vignan University`
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');

  const cleanTitle = event.title
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Vignan University//CampusFlow Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${nowUtc}`,
    `DTSTART:${startUtc}`,
    `DTEND:${endUtc}`,
    `SUMMARY:${cleanTitle}`,
    `DESCRIPTION:${cleanDescription}`,
    `LOCATION:${cleanLocation}`,
    'STATUS:CONFIRMED',
    'CLASS:PUBLIC',
    'ORGANIZER;CN=Vignan University CSE:mailto:cse@vignan.ac.in',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.setAttribute('download', `${event.id || 'vignan-event'}.ics`);
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
}
