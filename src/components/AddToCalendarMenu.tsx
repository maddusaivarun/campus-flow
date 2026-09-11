import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Download, ExternalLink, ChevronDown } from 'lucide-react';
import { DepartmentEvent } from '../types';
import { getGoogleCalendarUrl, getOutlookCalendarUrl, downloadIcsFile } from '../utils/calendarUtils';

interface AddToCalendarMenuProps {
  event: DepartmentEvent;
  variant?: 'primary' | 'secondary' | 'compact';
  label?: string;
}

export const AddToCalendarMenu: React.FC<AddToCalendarMenuProps> = ({
  event,
  variant = 'secondary',
  label = 'Add to Calendar'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGoogleCalendar = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = getGoogleCalendarUrl(event);
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  const handleOutlookCalendar = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = getOutlookCalendarUrl(event);
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  const handleDownloadIcs = (e: React.MouseEvent) => {
    e.stopPropagation();
    downloadIcsFile(event);
    setIsOpen(false);
  };

  const buttonStyle =
    variant === 'primary'
      ? 'bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs'
      : variant === 'compact'
      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-1 px-2 text-[11px]'
      : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium shadow-2xs';

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${buttonStyle}`}
        aria-expanded={isOpen}
      >
        <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
        <span>{label}</span>
        <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 bottom-full mb-1 sm:bottom-auto sm:top-full sm:mt-1 w-48 rounded-xl bg-white shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in-50 zoom-in-95"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
            Choose Calendar
          </div>

          <button
            type="button"
            onClick={handleGoogleCalendar}
            className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#4285F4]" />
              Google Calendar
            </span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </button>

          <button
            type="button"
            onClick={handleOutlookCalendar}
            className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0078D4]" />
              Outlook 365 / Web
            </span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </button>

          <div className="my-1 border-t border-slate-100" />

          <button
            type="button"
            onClick={handleDownloadIcs}
            className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 flex items-center justify-between transition-colors"
          >
            <span className="flex items-center gap-2">
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Apple / iCal (.ics file)
            </span>
            <span className="text-[10px] text-slate-400 font-mono">.ics</span>
          </button>
        </div>
      )}
    </div>
  );
};
