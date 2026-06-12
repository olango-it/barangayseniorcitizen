/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SeniorCitizen, SeniorGender, SeniorStatus, AdminRole } from '../types';
import { calculateAge, createSenior, updateSenior, getSeniors, generateAvatarSvg } from '../db';
import { Upload, X, AlertCircle, Sparkles, RefreshCw, UserCheck, PhoneCall, ShieldAlert, BadgeInfo } from 'lucide-react';

interface MemberFormProps {
  seniorIdToEdit?: string | null;
  onClose: () => void;
  onSaveSuccess: () => void;
  operator: { name: string; role: AdminRole };
  darkMode: boolean;
}

const SITIOS = [
  'Sitio Centro',
  'Sitio Pag-asa',
  'Sitio Maligaya',
  'Sitio Dam',
  'Sitio Tabing-Ilog',
  'Sitio Kawayan',
  'Sitio Riverside'
];

const RELATIONSHIPS = [
  'Spouse',
  'Son',
  'Daughter',
  'Son-in-law',
  'Daughter-in-law',
  'Grandson',
  'Granddaughter',
  'Sister',
  'Brother',
  'Cousin',
  'Nephew',
  'Niece',
  'Guardian',
  'Neighbor',
  'Other'
];

export default function MemberForm({ seniorIdToEdit, onClose, onSaveSuccess, operator, darkMode }: MemberFormProps) {
  const isEditMode = !!seniorIdToEdit;
  
  // Local state
  const [fullName, setFullName] = useState('');
  const [photo, setPhoto] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<SeniorGender>('Male');
  const [sitio, setSitio] = useState('Sitio Centro');
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [rrn, setRrn] = useState('');
  const [pkn, setPkn] = useState('');
  const [oscaId, setOscaId] = useState('');
  const [status, setStatus] = useState<SeniorStatus>('Active');
  
  // Emergency structure
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelationship, setEmergencyRelationship] = useState('Son');
  const [emergencyContact, setEmergencyContact] = useState('');

  // UI state
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [computedAge, setComputedAge] = useState<number>(0);

  // Load existing values for editing
  useEffect(() => {
    if (isEditMode && seniorIdToEdit) {
      const seniors = getSeniors();
      const current = seniors.find(s => s.id === seniorIdToEdit);
      if (current) {
        setFullName(current.fullName);
        setPhoto(current.photo || '');
        setBirthDate(current.birthDate);
        setGender(current.gender);
        setSitio(current.sitio || 'Sitio Centro');
        setAddress(current.address || '');
        setContactNumber(current.contactNumber || '');
        setRrn(current.rrn || '');
        setPkn(current.pkn || '');
        setOscaId(current.oscaId);
        setStatus(current.status);
        
        if (current.emergencyContact) {
          setEmergencyName(current.emergencyContact.name || '');
          setEmergencyRelationship(current.emergencyContact.relationship || 'Son');
          setEmergencyContact(current.emergencyContact.contactNumber || '');
        }
      }
    } else {
      // Pre-populate realistic prefixes for new members
      const randomId = Math.floor(10000 + Math.random() * 90000);
      setOscaId(`OSCA-${randomId}-SV`);
      const rrnId = Math.floor(1000 + Math.random() * 9000);
      setRrn(`RRN-2026-${rrnId}`);
      const pknId = Math.floor(10000 + Math.random() * 90000);
      setPkn(`PKN-${pknId}`);
    }
  }, [isEditMode, seniorIdToEdit]);

  // Handle Age calculation on changes
  useEffect(() => {
    if (birthDate) {
      setComputedAge(calculateAge(birthDate));
    } else {
      setComputedAge(0);
    }
  }, [birthDate]);

  // Photo helpers (Base 64)
  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorStatus("Only image files are permitted.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrorStatus("Image size can't exceed 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPhoto(e.target.result as string);
        setErrorStatus(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRegenerateAvatar = () => {
    if (!fullName) {
      setErrorStatus("Please enter the Full Name first to generate initials avatar.");
      return;
    }
    const derived = generateAvatarSvg(fullName, gender);
    setPhoto(derived);
  };

  // Form submission handler
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorStatus(null);

    // Validation
    if (!fullName.trim()) {
      setErrorStatus("Full Name is requested.");
      return;
    }
    if (!birthDate) {
      setErrorStatus("Birth Date is requested.");
      return;
    }
    if (!oscaId.trim()) {
      setErrorStatus("OSCA ID Number is requested.");
      return;
    }

    const payload = {
      fullName: fullName.trim(),
      photo,
      birthDate,
      gender,
      sitio,
      address: address.trim() || `Sitio ${sitio}, Barangay San Vicente, Cabuyao, Laguna`,
      contactNumber: contactNumber.trim(),
      rrn: rrn.trim(),
      pkn: pkn.trim(),
      oscaId: oscaId.trim(),
      status,
      emergencyContact: {
        name: emergencyName.trim(),
        relationship: emergencyRelationship,
        contactNumber: emergencyContact.trim()
      }
    };

    let result;
    if (isEditMode && seniorIdToEdit) {
      result = updateSenior(seniorIdToEdit, payload, operator);
    } else {
      result = createSenior(payload, operator);
    }

    if (result.success) {
      onSaveSuccess();
    } else {
      setErrorStatus(result.error || "Failed to persist member profile.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 overflow-y-auto p-4 flex items-center justify-center">
      <div className={`w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border ${darkMode ? 'bg-slate-900 text-white border-slate-800' : 'bg-white text-slate-800 border-slate-200'}`}>
        
        {/* Banner Header */}
        <div className="bg-[#1e3a8a] text-white py-5 px-6 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-500 text-slate-900 p-2.5 rounded-lg">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-wide uppercase">
                {isEditMode ? "Modify Senior Citizen Profile" : "Register New Senior Citizen"}
              </h3>
              <p className="text-xs text-blue-200 uppercase font-medium">Barangay San Vicente Registry Ledger • Operator: {operator.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Input fields */}
        <form onSubmit={handleSave} className="p-6 space-y-6">
          
          {errorStatus && (
            <div className="p-4 bg-red-100 border-l-4 border-red-600 text-red-900 text-xs rounded-r-lg font-bold flex items-start space-x-2 animate-pulse">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorStatus}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Left Col: Photo upload / Avatar selector */}
            <div className="md:col-span-1 space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Profile Photo Identification</label>
              
              <div 
                id="photo-drag-container"
                className={`relative border-2 border-dashed rounded-xl h-44 flex flex-col items-center justify-center transition-all bg-slate-50 dark:bg-slate-950/40 p-4 ${isDragging ? 'border-blue-500 bg-blue-50/50' : 'border-slate-300 dark:border-slate-800 hover:border-slate-400'}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {photo ? (
                  <div className="relative group w-full h-full flex items-center justify-center leading-none">
                    <img 
                      src={photo} 
                      alt="Citizen Avatar" 
                      className="max-h-full max-w-full rounded-lg object-contain shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => setPhoto('')}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow-md hover:bg-red-700 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center space-y-1">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-500">Pick raw image</p>
                    <p className="text-[10px] text-slate-400">or Drag &amp; Drop here</p>
                  </div>
                )}
                
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  disabled={!!photo}
                />
              </div>

              {/* Avatar Generator Button helper */}
              <button
                type="button"
                onClick={handleRegenerateAvatar}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition text-[11px] font-bold rounded-lg uppercase flex items-center justify-center space-x-1 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Use Digital Initials Avatar</span>
              </button>
            </div>

            {/* Right Col: Basic Info form */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Full Member Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Juanito Del Prado Dela Cruz Sr."
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-blue-600 focus:outline-none text-sm font-semibold uppercase"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Date of Birth *</label>
                <input 
                  type="date" 
                  required
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-blue-600 focus:outline-none text-sm font-semibold"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
                
                {/* Real-time Age helper widget */}
                {birthDate && (
                  <div className={`mt-1.5 flex items-center space-x-1 text-xs font-bold ${computedAge >= 60 ? 'text-green-600' : 'text-amber-600'}`}>
                    <BadgeInfo className="w-3.5 h-3.5" />
                    <span>Age: {computedAge} yrs old {computedAge < 60 && "(Municipal Waiver Requested)"}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Gender *</label>
                <select 
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-blue-600 focus:outline-none text-sm font-semibold"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as SeniorGender)}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Contact Phone</label>
                <input 
                  type="tel"
                  placeholder="e.g. 09171234567"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-blue-600 focus:outline-none text-sm font-mono font-semibold"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Jurisdiction Sitio Zone *</label>
                <select 
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-blue-600 focus:outline-none text-sm font-semibold"
                  value={sitio}
                  onChange={(e) => setSitio(e.target.value)}
                >
                  {SITIOS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Complete Residential Address</label>
                <textarea 
                  rows={2}
                  placeholder="Complete street address details..."
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-blue-600 focus:outline-none text-sm font-semibold uppercase resize-none"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

            </div>
          </div>

          <div className="p-[1px] bg-slate-200 dark:bg-slate-800"></div>

          {/* Unique Identifiers section */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#1e3a8a] dark:text-blue-400 flex items-center space-x-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span>Municipal Unique Registry Identifiers</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">OSCA ID Number *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. OSCA-30214-SV"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-blue-600 focus:outline-none text-sm font-mono font-bold"
                  value={oscaId}
                  onChange={(e) => setOscaId(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Registry Ref No. (RRN)</label>
                <input 
                  type="text" 
                  placeholder="e.g. RRN-2021-0042"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-blue-600 focus:outline-none text-sm font-mono font-bold"
                  value={rrn}
                  onChange={(e) => setRrn(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Pangkat Kasapi No. (PKN)</label>
                <input 
                  type="text" 
                  placeholder="e.g. PKN-45129"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-blue-600 focus:outline-none text-sm font-mono font-bold"
                  value={pkn}
                  onChange={(e) => setPkn(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="p-[1px] bg-slate-200 dark:bg-slate-800"></div>

          {/* Emergency Response Person section */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-red-600 dark:text-red-400 flex items-center space-x-1.5">
              <PhoneCall className="w-4 h-4" />
              <span>Primary Emergency Contact Details</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Emergency Name Person</label>
                <input 
                  type="text" 
                  placeholder="Person's Full Name"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-blue-600 focus:outline-none text-sm font-bold uppercase"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Relationship Type</label>
                <select 
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-blue-600 focus:outline-none text-sm font-bold uppercase"
                  value={emergencyRelationship}
                  onChange={(e) => setEmergencyRelationship(e.target.value)}
                >
                  {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Emergency Contact Number</label>
                <input 
                  type="tel" 
                  placeholder="e.g. 09187654321"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-blue-600 focus:outline-none text-sm font-mono font-bold"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="p-[1px] bg-slate-200 dark:bg-slate-800"></div>

          {/* Record Actions status and submit buttons */}
          <div className="flex flex-col sm:flex-row sm:justify-between items-center space-y-4 sm:space-y-0 pt-2 pb-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Status Classification:</span>
              <div className="flex space-x-1.5">
                {(['Active', 'Inactive', 'Suspended', 'Deceased'] as SeniorStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatus(st)}
                    className={`px-3 py-1 text-xs font-black uppercase rounded ${status === st ? 'bg-amber-500 text-slate-900 border border-amber-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'} transition-all cursor-pointer`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex space-x-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-5 py-2.5 text-xs uppercase font-extrabold tracking-wider bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 sm:flex-none px-6 py-2.5 text-xs uppercase font-black tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all transform shadow-md active:scale-95 cursor-pointer"
              >
                {isEditMode ? "Save Member Changes" : "Confirm Enrollment ID"}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
