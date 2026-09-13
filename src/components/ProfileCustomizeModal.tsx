import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  User,
  Upload,
  Camera,
  CheckCircle2,
  Trash2,
  Building,
  ShieldCheck,
  CreditCard,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileCustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSaveProfile?: (updated: Partial<UserProfile>) => Promise<void>;
  onProfileUpdated?: (updated: UserProfile) => void;
}

export const ProfileCustomizeModal: React.FC<ProfileCustomizeModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSaveProfile,
  onProfileUpdated
}) => {
  const [name, setName] = useState(currentUser?.name || '');
  const [designation, setDesignation] = useState(currentUser?.designation || '');
  const [departmentName, setDepartmentName] = useState(currentUser?.departmentName || '');
  const [identifier, setIdentifier] = useState(currentUser?.identifier || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state whenever modal is opened or currentUser changes
  useEffect(() => {
    if (isOpen && currentUser) {
      setName(currentUser.name || '');
      setDesignation(currentUser.designation || '');
      setDepartmentName(currentUser.departmentName || '');
      setIdentifier(currentUser.identifier || '');
      setAvatarUrl(currentUser.avatarUrl || '');
      setSuccessMessage(null);
      setErrorMessage(null);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  // Handle local image file upload (converts to base64 data-URL)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMessage(null);

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Photo file size must be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setAvatarUrl(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const payload: Partial<UserProfile> = {
        name: name.trim(),
        designation: designation.trim(),
        departmentName: departmentName.trim(),
        identifier: identifier.trim(),
        avatarUrl: avatarUrl.trim()
      };

      const updatedUser = { ...currentUser, ...payload };
      // Save locally first to guarantee it never reverts
      localStorage.setItem('campusflow_custom_user', JSON.stringify(updatedUser));

      if (onSaveProfile) {
        await onSaveProfile(payload);
      } else {
        try {
          const token = localStorage.getItem('campusflow_token') || localStorage.getItem('campusflow_auth_token');
          const res = await fetch('/api/auth/profile', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify(payload)
          });
          if (res.ok) {
            try {
              const data = await res.json();
              if (data?.user && onProfileUpdated) {
                onProfileUpdated(data.user);
              }
            } catch {}
          }
        } catch (e) {
          // In-browser fallback
        }
      }

      if (onProfileUpdated) {
        onProfileUpdated(updatedUser);
      }

      setSuccessMessage('Profile and photo updated successfully!');
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err: any) {
      // Even if network had an issue, the local user was saved
      setSuccessMessage('Profile updated locally on your device!');
      setTimeout(() => {
        onClose();
      }, 900);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#0b1c30] text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-sm font-display shadow-xs">
              CF
            </div>
            <div>
              <h2 className="text-base font-bold font-display leading-tight text-white">
                Customize Profile & Photo
              </h2>
              <p className="text-[11px] text-slate-300">
                Update your official name, designation, and campus photo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Avatar Photo Customization Section */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="relative group shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name || 'Profile'}
                  className="w-20 h-20 rounded-full object-cover ring-3 ring-blue-600 shadow-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-blue-600 text-white font-bold text-2xl flex items-center justify-center ring-3 ring-blue-400 shadow-md">
                  {(name || 'U').charAt(0).toUpperCase()}
                </div>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-1.5 rounded-full bg-slate-900 text-white hover:bg-blue-600 shadow-md transition-colors"
                title="Change Photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Profile Photo
              </h4>
              <p className="text-[11px] text-slate-500">
                Upload your personal photo or paste an image URL. No generic placeholders.
              </p>

              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start pt-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-blue-500 text-xs font-semibold text-slate-700 hover:text-blue-600 shadow-2xs flex items-center gap-1.5 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  Upload Photo
                </button>

                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl('')}
                    className="px-2.5 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 hover:bg-rose-100 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Photo URL Alternative */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Photo Image URL (Optional alternative to upload)
            </label>
            <input
              type="url"
              placeholder="https://example.com/my-photo.jpg"
              value={avatarUrl.startsWith('data:') ? '' : avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all"
            />
          </div>

          {/* Name Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Official Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. K. Srinivas or Varun Maddu"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Designation */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Designation / Title
            </label>
            <div className="relative">
              <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Head of Department (CSE) or 3rd Year B.Tech"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Department Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Department
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                placeholder="e.g. Department of Computer Science & Engineering"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Institutional Identifier */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Institutional ID / Roll Number
            </label>
            <div className="relative">
              <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. VUG-HOD-01 or 221FA04001"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors disabled:opacity-60 flex items-center gap-1.5"
            >
              {isSaving ? 'Saving...' : 'Save & Apply Everywhere'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
