import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  Trash2,
  AlertTriangle,
  Check,
  Loader2,
  Award,
  FileText,
  User,
  Building2,
  Hash
} from 'lucide-react';
import { RegistrationRecord } from '../types';
import { EventCountdownTimer } from './EventCountdownTimer';

interface StudentPassModalProps {
  registration: RegistrationRecord | null;
  onClose: () => void;
  onCancelRegistration?: (eventId: string) => Promise<void>;
}

export const StudentPassModal: React.FC<StudentPassModalProps> = ({
  registration,
  onClose,
  onCancelRegistration
}) => {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!registration) return null;

  const handlePrint = () => {
    // Create an invisible iframe for standalone, ultra-clean printing without backdrop or modal UI
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    document.body.appendChild(printFrame);

    const doc = printFrame.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Admit Slip - ${registration.registrationId} - ${registration.studentName}</title>
          <style>
            @page { size: A4 portrait; margin: 15mm 20mm; }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0b1c30; background: #fff; line-height: 1.4; padding: 10px; }
            .slip-card { border: 2.5px solid #0b1c30; border-radius: 8px; overflow: hidden; background: #ffffff; }
            .header-bar { background: #0b1c30; color: #ffffff; padding: 12px 20px; display: flex; align-items: center; justify-content: space-between; }
            .header-bar .title { font-size: 14px; font-weight: 800; letter-spacing: 0.5px; }
            .header-bar .academic-year { font-size: 11px; color: #38bdf8; font-weight: 700; }
            .institution-row { padding: 16px 24px; border-bottom: 2px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; }
            .logo-section { display: flex; align-items: center; gap: 14px; }
            .logo-img { height: 50px; width: auto; }
            .institution-info h1 { font-size: 15px; font-weight: 800; color: #0b1c30; }
            .institution-info p { font-size: 10px; color: #64748b; }
            .status-badge { text-align: right; }
            .status-pill { display: inline-block; background: #ecfdf5; color: #047857; border: 1.5px solid #a7f3d0; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
            .reg-id { font-family: monospace; font-size: 11px; font-weight: 700; color: #475569; margin-top: 4px; }
            .content-area { padding: 20px 24px; }
            .section-label { font-size: 10px; font-weight: 800; color: #0369a1; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px; }
            .event-box { background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 6px; padding: 14px 18px; margin-bottom: 16px; }
            .event-title { font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 8px; line-height: 1.3; }
            .event-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px; color: #334155; border-top: 1px solid #e2e8f0; padding-top: 8px; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
            .info-box { background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 6px; padding: 10px 14px; }
            .info-label { font-size: 10px; color: #64748b; font-weight: 600; }
            .info-val { font-size: 13px; font-weight: 700; color: #0f172a; }
            .info-val.mono { font-family: monospace; }
            .statutory-box { background: #ecfdf5; border: 1.5px solid #a7f3d0; border-radius: 6px; padding: 12px 16px; margin-bottom: 20px; }
            .statutory-box h4 { font-size: 11px; font-weight: 800; color: #065f46; margin-bottom: 2px; }
            .statutory-box p { font-size: 10px; color: #047857; line-height: 1.4; }
            .signatures { display: flex; justify-content: space-between; padding: 24px 20px 10px; border-top: 1.5px dashed #cbd5e1; margin-top: 10px; }
            .sig-block { text-align: center; width: 180px; }
            .sig-line { border-top: 1px solid #475569; margin-bottom: 4px; }
            .sig-title { font-size: 10px; font-weight: 700; color: #1e293b; }
            .sig-dept { font-size: 9px; color: #64748b; }
            .footer-note { background: #f1f5f9; padding: 8px 16px; text-align: center; font-size: 9px; color: #64748b; border-top: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <div class="slip-card">
            <div class="header-bar">
              <div class="title">VIGNAN UNIVERSITY • OFFICIAL EVENT ADMIT SLIP</div>
              <div class="academic-year">ACADEMIC YEAR 2025-2026</div>
            </div>
            <div class="institution-row">
              <div class="logo-section">
                <img src="/vignan-logo.svg" class="logo-img" alt="Vignan Logo" />
                <div class="institution-info">
                  <h1>VIGNAN'S FOUNDATION FOR SCIENCE, TECHNOLOGY & RESEARCH</h1>
                  <p>Deemed to be University • Accredited NAAC 'A+' • Department of Computer Science & Engineering</p>
                </div>
              </div>
              <div class="status-badge">
                <div class="status-pill">✓ CONFIRMED ENROLLMENT</div>
                <div class="reg-id">${registration.registrationId}</div>
              </div>
            </div>
            <div class="content-area">
              <div class="section-label">Registered Activity / Event Details</div>
              <div class="event-box">
                <div class="event-title">${registration.eventTitle}</div>
                <div class="event-grid">
                  <div><strong>Date:</strong> ${registration.eventDate}</div>
                  <div><strong>Venue:</strong> ${registration.eventVenue}</div>
                </div>
              </div>

              <div class="section-label">Participant Credentials</div>
              <div class="grid-2">
                <div class="info-box">
                  <div class="info-label">Candidate Full Name</div>
                  <div class="info-val">${registration.studentName}</div>
                </div>
                <div class="info-box">
                  <div class="info-label">University Roll Number</div>
                  <div class="info-val mono">${registration.studentRoll}</div>
                </div>
                <div class="info-box">
                  <div class="info-label">Academic Department</div>
                  <div class="info-val">${registration.studentDepartment || 'Computer Science & Engineering'}</div>
                </div>
                <div class="info-box">
                  <div class="info-label">Designated Seat Zone</div>
                  <div class="info-val">${registration.seatZone || 'General Admission Zone A'}</div>
                </div>
              </div>

              <div class="statutory-box">
                <h4>✓ Statutory HOD Clearance & Compliance Recorded</h4>
                <p>This admission pass certifies that the student is officially registered. Present your University Identity Card along with this physical admit slip at the entrance.</p>
              </div>

              <div class="signatures">
                <div class="sig-block">
                  <div class="sig-line"></div>
                  <div class="sig-title">Faculty Event Coordinator</div>
                  <div class="sig-dept">Department of CSE</div>
                </div>
                <div class="sig-block">
                  <div class="sig-line"></div>
                  <div class="sig-title">Head of Department (HOD)</div>
                  <div class="sig-dept">Statutory Digital Clearance</div>
                </div>
              </div>
            </div>
            <div class="footer-note">
              CampusFlow Digital Event Governance System • Verified Academic Record • Vadlamudi, Guntur, AP - 522213
            </div>
          </div>
        </body>
      </html>
    `;

    doc.open();
    doc.write(htmlContent);
    doc.close();

    setTimeout(() => {
      try {
        printFrame.contentWindow?.focus();
        printFrame.contentWindow?.print();
      } catch (err) {
        window.print();
      } finally {
        setTimeout(() => {
          if (document.body.contains(printFrame)) {
            document.body.removeChild(printFrame);
          }
        }, 2000);
      }
    }, 250);
  };

  // Generate high-resolution official university admit slip PNG (800x1100px) without any QR code
  const handleDownloadPNG = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    setDownloadSuccess(false);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 1100;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not initialize canvas context');

      // 1. Clean Background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 800, 1100);

      // Card outer boundary & elegant border
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 3;
      ctx.strokeRect(20, 20, 760, 1060);

      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = 1;
      ctx.strokeRect(26, 26, 748, 1048);

      // 2. Top Navy Institutional Header Bar
      ctx.fillStyle = '#0B1C30';
      ctx.fillRect(26, 26, 748, 70);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 18px Arial, sans-serif';
      ctx.fillText('VIGNAN UNIVERSITY • EVENT REGISTRATION & ADMIT SLIP', 45, 66);

      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 12px Arial, sans-serif';
      ctx.fillText('ACADEMIC YEAR 2025-2026', 600, 66);

      // 3. Official Vignan University Emblem & Typography
      // Draw Left Shield Crest (x=50, y=120)
      ctx.save();
      ctx.translate(50, 115);

      // Shield Boundary
      ctx.beginPath();
      ctx.moveTo(14, 10);
      ctx.lineTo(86, 10);
      ctx.quadraticCurveTo(90, 10, 90, 14);
      ctx.lineTo(90, 48);
      ctx.bezierCurveTo(90, 78, 56, 96, 50, 100);
      ctx.bezierCurveTo(44, 96, 10, 78, 10, 48);
      ctx.lineTo(10, 14);
      ctx.quadraticCurveTo(10, 10, 14, 10);
      ctx.closePath();
      ctx.fillStyle = '#A8B4FC';
      ctx.fill();
      ctx.strokeStyle = '#5B67EC';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Inner Shield Rim
      ctx.beginPath();
      ctx.moveTo(18, 14);
      ctx.lineTo(82, 14);
      ctx.bezierCurveTo(82, 46, 76, 74, 50, 94);
      ctx.bezierCurveTo(24, 74, 18, 46, 18, 14);
      ctx.closePath();
      ctx.fillStyle = '#B5C0FE';
      ctx.fill();

      // Wheel Emblem (center 50, 48)
      ctx.translate(50, 48);
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.strokeStyle = '#0263C7';
      ctx.lineWidth = 4.5;
      ctx.stroke();

      // 5 spokes
      const angles = [-126, -54, 18, 90, 162];
      angles.forEach((deg) => {
        const rad = (deg * Math.PI) / 180;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(rad) * 24, Math.sin(rad) * 24);
        ctx.strokeStyle = '#0263C7';
        ctx.lineWidth = 4.5;
        ctx.stroke();
      });

      // Center Hub
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#0263C7';
      ctx.fill();

      // White Star in Hub
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = (i * 72 - 90) * (Math.PI / 180);
        const b = (i * 72 + 36 - 90) * (Math.PI / 180);
        const rOuter = 6.5;
        const rInner = 2.8;
        if (i === 0) {
          ctx.moveTo(Math.cos(a) * rOuter, Math.sin(a) * rOuter);
        } else {
          ctx.lineTo(Math.cos(a) * rOuter, Math.sin(a) * rOuter);
        }
        ctx.lineTo(Math.cos(b) * rInner, Math.sin(b) * rInner);
      }
      ctx.closePath();
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.restore();

      // Right Typography (Exact match to Vignan brand)
      ctx.fillStyle = '#EB1C24';
      ctx.font = '900 44px Arial, sans-serif';
      ctx.fillText("VIGNAN'S", 160, 155);

      ctx.fillStyle = '#111827';
      ctx.font = 'bold 12.5px Arial, sans-serif';
      ctx.fillText('FOUNDATION FOR SCIENCE, TECHNOLOGY & RESEARCH', 160, 178);

      // Blue banner bar
      ctx.fillStyle = '#007FE8';
      ctx.fillRect(160, 188, 450, 25);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px Arial, sans-serif';
      ctx.fillText('(Deemed to be University) - Estd. u/s 3 of UGC Act 1956', 170, 205);

      // 4. Status Bar & Slip Identifier
      ctx.fillStyle = '#ECFDF5';
      ctx.beginPath();
      ctx.roundRect(50, 235, 700, 48, 8);
      ctx.fill();
      ctx.strokeStyle = '#A7F3D0';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#065F46';
      ctx.font = 'bold 15px Arial, sans-serif';
      ctx.fillText('✓ OFFICIAL CONFIRMED REGISTRATION & ADMISSION SLIP', 70, 265);

      ctx.fillStyle = '#065F46';
      ctx.font = 'bold 13px Courier, monospace';
      ctx.fillText(`ID: ${registration.registrationId}`, 550, 265);

      // 5. Activity Details Section
      ctx.fillStyle = '#F8FAFC';
      ctx.beginPath();
      ctx.roundRect(50, 305, 700, 130, 8);
      ctx.fill();
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#1D4ED8';
      ctx.font = 'bold 12px Arial, sans-serif';
      ctx.fillText('DEPARTMENTAL EVENT / WORKSHOP', 70, 332);

      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 20px Arial, sans-serif';
      ctx.fillText(registration.eventTitle, 70, 362);

      ctx.fillStyle = '#475569';
      ctx.font = '14px Arial, sans-serif';
      ctx.fillText(`Scheduled Date: ${registration.eventDate}`, 70, 395);
      ctx.fillText(`Authorized Venue: ${registration.eventVenue}`, 70, 420);

      // 6. Student Credential Section
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(50, 455, 700, 230, 8);
      ctx.fill();
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Table Header
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(50, 455, 700, 36);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 13px Arial, sans-serif';
      ctx.fillText('PARTICIPANT CREDENTIALS & ALLOCATION DETAILS', 70, 478);

      const fields = [
        ['Student Name', registration.studentName],
        ['Roll Number / Reg. ID', registration.studentRoll],
        ['Department', registration.studentDepartment || 'Computer Science & Engineering'],
        ['Registration ID', registration.registrationId],
        ['Designated Seat Zone', registration.seatZone || 'General Admission Zone A'],
        ['Academic Credit Mapping', 'Outcome-Based Education (OBE) Certified']
      ];

      fields.forEach(([label, val], idx) => {
        const y = 520 + idx * 28;
        ctx.fillStyle = '#64748B';
        ctx.font = 'bold 13px Arial, sans-serif';
        ctx.fillText(label + ':', 70, y);

        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold 14px Arial, sans-serif';
        ctx.fillText(val, 280, y);

        ctx.strokeStyle = '#F1F5F9';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(70, y + 6);
        ctx.lineTo(730, y + 6);
        ctx.stroke();
      });

      // 7. Statutory Governance & Clearance Seal Box
      ctx.fillStyle = '#F0FDF4';
      ctx.beginPath();
      ctx.roundRect(50, 710, 700, 160, 8);
      ctx.fill();
      ctx.strokeStyle = '#86EFAC';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#166534';
      ctx.font = 'bold 15px Arial, sans-serif';
      ctx.fillText('INSTITUTIONAL GOVERNANCE & HOD CLEARANCE', 70, 740);

      ctx.fillStyle = '#14532D';
      ctx.font = '13px Arial, sans-serif';
      ctx.fillText('• This registration is verified against the university departmental database.', 70, 770);
      ctx.fillText('• HOD statutory approval recorded under Department of Computer Science & Engineering.', 70, 795);
      ctx.fillText('• Please produce this admit slip along with your University Identity Card at the venue.', 70, 820);
      ctx.fillText('• Attendance will be marked at the entrance by authorized faculty coordinators.', 70, 845);

      // 8. Signatures & Verification Footer
      ctx.fillStyle = '#475569';
      ctx.font = 'italic 12px Arial, sans-serif';
      ctx.fillText('Generated via Vignan University CampusFlow Governance Portal • Document valid without physical stamp', 70, 920);

      // Signature lines
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(100, 990);
      ctx.lineTo(260, 990);
      ctx.moveTo(520, 990);
      ctx.lineTo(680, 990);
      ctx.stroke();

      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 12px Arial, sans-serif';
      ctx.fillText('STUDENT SIGNATURE', 120, 1010);
      ctx.fillText('CONVENER / HOD SEAL', 535, 1010);

      // Trigger automatic browser download
      const imgURL = canvas.toDataURL('image/png');
      const dlLink = document.createElement('a');
      dlLink.href = imgURL;
      dlLink.download = `Vignan_AdmitSlip_${registration.studentRoll}_${registration.registrationId}.png`;
      document.body.appendChild(dlLink);
      dlLink.click();
      document.body.removeChild(dlLink);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (err) {
      console.error('Download admit slip error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCancel = async () => {
    if (!onCancelRegistration) return;
    setIsCancelling(true);
    try {
      await onCancelRegistration(registration.eventId);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="printable-admit-card relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Top Institutional Header */}
        <div className="bg-[#0b1c30] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center font-bold text-xs text-white">
              VF
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-wider font-display block text-white">
                VIGNAN UNIVERSITY • EVENT ADMIT SLIP
              </span>
              <span className="text-[10px] text-sky-400 font-medium block">
                Official Departmental Registration Slip & Admit Card
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="no-print text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admit Slip Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Institutional Brand Banner */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <img
                src="/vignan-logo.svg"
                alt="Vignan University"
                className="h-12 w-auto object-contain"
              />
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                CONFIRMED ENROLLMENT
              </span>
              <div className="text-[11px] font-mono font-bold text-slate-500 mt-1">
                {registration.registrationId}
              </div>
            </div>
          </div>

          {/* Event Title */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider block mb-1">
              Department Activity / Workshop
            </span>
            <h3 className="text-lg font-bold text-slate-900 font-display leading-snug">
              {registration.eventTitle}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 mt-3 pt-3 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-800">{registration.eventDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-800 truncate">{registration.eventVenue}</span>
              </div>
            </div>

            <div className="mt-3 pt-2">
              <EventCountdownTimer
                date={registration.eventDate}
                startTime="09:30"
                variant="card"
              />
            </div>
          </div>

          {/* Participant Credentials */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              Participant Credentials
            </h4>
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block font-medium">Attendee Name</span>
                <span className="font-bold text-slate-900 text-sm">{registration.studentName}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Roll Number</span>
                <span className="font-bold text-slate-900 font-mono text-sm">{registration.studentRoll}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Department</span>
                <span className="font-semibold text-slate-800">{registration.studentDepartment || 'Computer Science & Engineering'}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Designated Seat Zone</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-0.5">
                  {registration.seatZone || 'General Admission'}
                </span>
              </div>
            </div>
          </div>

          {/* Institutional Statutory Stamp */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start gap-3 text-xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="font-bold text-emerald-950">
                Statutory HOD Clearance & Compliance Recorded
              </div>
              <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                This registration slip entitles the student to attend the session. Please present your student ID card along with this admit slip at the entrance for verification by faculty coordinators.
              </p>
            </div>
          </div>

          {/* Download Notification */}
          {downloadSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Official Admit Slip downloaded as PNG! Ready for offline verification.</span>
            </div>
          )}

          {/* Cancellation section */}
          {showCancelConfirm ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Release this registration spot?
              </div>
              <p className="text-[11px] text-rose-700">
                Your registration will be cancelled and your seat will immediately be offered back to other students.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleCancel}
                  disabled={isCancelling}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
                >
                  {isCancelling ? 'Cancelling...' : 'Yes, Cancel Registration'}
                </button>
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-medium hover:bg-white"
                >
                  Keep Registration
                </button>
              </div>
            </div>
          ) : (
            <div className="no-print flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400 text-[11px]">Can no longer attend?</span>
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="text-rose-600 hover:text-rose-800 font-medium text-xs flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Cancel Registration
              </button>
            </div>
          )}
        </div>

        {/* Modal Bottom Action Controls */}
        <div className="no-print p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            id="print-admit-slip-btn"
            onClick={handlePrint}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 hover:text-blue-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Printer className="w-4 h-4 text-blue-600" />
            Print Admit Slip
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPNG}
              disabled={isDownloading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Slip...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download Slip (PNG)
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
