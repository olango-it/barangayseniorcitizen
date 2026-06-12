/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SeniorCitizen } from '../types';
import { calculateAge } from '../db';
import BrgyLogo from './BrgyLogo';
import { Printer, X, CreditCard, FileText, PhoneCall, ShieldAlert, Check } from 'lucide-react';

interface PrintCardProps {
  senior: SeniorCitizen;
  onClose: () => void;
}

export default function PrintCard({ senior, onClose }: PrintCardProps) {
  // Generate the verification URL that corresponds to this senior citizen
  const verificationLink = `${window.location.origin}/#verify/${encodeURIComponent(senior.oscaId)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(verificationLink)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 overflow-y-auto p-4 flex items-center justify-center print:p-0 print:bg-white print:backdrop-blur-none">
      <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl print:shadow-none print:bg-white print:rounded-none">
        
        {/* Interactive Controls Header (hidden during print) */}
        <div className="bg-[#1e3a8a] text-white p-4 flex justify-between items-center print:hidden">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-sm uppercase">Print Center - Barangay San Vicente</h3>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-900 px-4 py-2 rounded-lg font-extrabold flex items-center space-x-2 transition-all cursor-pointer shadow-md text-xs uppercase"
            >
              <Printer className="w-4 h-4" />
              <span>Print Member Documents</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors cursor-pointer text-xs font-bold uppercase"
            >
              Close
            </button>
          </div>
        </div>

        {/* Outer Frame Wrapper */}
        <div id="print-area" className="p-8 space-y-12 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 print:p-0 print:text-black">
          
          {/* Printable Warning (Hidden normally, shown in print) */}
          <div className="hidden print:block text-center text-[9px] text-slate-400 font-mono mb-4 border-b pb-1 border-dashed">
            Barangay San Vicente Municipal Database System • Registry Stamp ID: {senior.id} • Printed on: {new Date().toLocaleString()}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 print:grid-cols-1 print:gap-12">
            
            {/* ===================================== */}
            {/* SECTION 1: PRINTABLE OSCA ID COPIES  */}
            {/* ===================================== */}
            <div className="space-y-6">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#1e3a8a] py-1 border-b print:hidden">
                Pocket ID Card (Print Output Preview)
              </h4>

              {/* ID Canvas - Front of the card */}
              <div id="id-card-front" className="relative w-[340px] h-[216px] bg-gradient-to-br from-blue-900 via-[#1e3a8a] to-blue-950 text-white rounded-xl shadow-xl p-3 overflow-hidden border border-amber-500 mx-auto print:shadow-none print:border print:border-black">
                {/* Visual Ribbon Details */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-yellow-400 to-blue-500"></div>
                {/* Background Barangay Watermark (Symbolic) */}
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none flex items-center justify-center scale-150">
                  <svg className="w-48 h-48" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="currentColor"/>
                  </svg>
                </div>

                {/* ID Header */}
                <div className="flex items-center space-x-2 border-b border-white/20 pb-1.5 pt-1 relative z-10">
                  {/* Seal */}
                  <BrgyLogo size={42} className="w-10 h-10 shadow-md rounded-full bg-[#081e3f] flex-shrink-0" />
                  <div className="text-left leading-tight flex-1">
                    <p className="text-[6.5px] font-bold tracking-widest text-amber-400 uppercase">BARANGAY SAN VICENTE</p>
                    <p className="text-[10px] font-black tracking-tight leading-none">SENIOR CITIZEN ASSOCIATION</p>
                    <p className="text-[6px] tracking-wider text-slate-300">Barangay San Vicente, Lapu-Lapu City, Philippines</p>
                  </div>
                  <span className="text-[8px] bg-emerald-600 text-white font-extrabold px-1.5 py-0.5 rounded uppercase self-start shadow-inner">
                    Active
                  </span>
                </div>

                {/* Patient Grid Details */}
                <div className="flex mt-3 space-x-3 relative z-10">
                  {/* Photo area */}
                  <div className="flex flex-col items-center space-y-1 flex-shrink-0">
                    <img 
                      src={senior.photo} 
                      alt="ID avatar" 
                      className="w-[74px] h-[74px] object-cover rounded border-2 border-amber-400/80 bg-slate-100 shadow"
                    />
                    <p className="text-[7px] text-amber-300 font-mono font-bold">{senior.oscaId}</p>
                  </div>

                  {/* Bio lists */}
                  <div className="flex-1 text-left min-w-0 flex flex-col justify-between h-[125px]">
                    <div>
                      <p className="text-[6px] uppercase text-amber-400 leading-none">Senior Citizen Name</p>
                      <h3 className="text-[12px] font-black tracking-tight text-white uppercase truncate line-clamp-1 leading-snug">{senior.fullName}</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-x-1 gap-y-1">
                      <div>
                        <p className="text-[5px] uppercase text-slate-300 leading-none">Birth Date</p>
                        <p className="text-[8px] font-bold">{new Date(senior.birthDate).toLocaleDateString('en-US', {dateStyle:'medium'})}</p>
                      </div>
                      <div>
                        <p className="text-[5px] uppercase text-slate-300 leading-none">Gender (Age)</p>
                        <p className="text-[8px] font-bold">{senior.gender} ({calculateAge(senior.birthDate)} yrs)</p>
                      </div>
                      <div>
                        <p className="text-[5px] uppercase text-slate-300 leading-none">RRN Number</p>
                        <p className="text-[7.5px] font-bold font-mono">{senior.rrn || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-[5px] uppercase text-slate-300 leading-none">PKN Number</p>
                        <p className="text-[7.5px] font-bold font-mono">{senior.pkn || "N/A"}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[5.5px] uppercase text-slate-300 leading-none">Residential Address (Barangay Jurisdiction)</p>
                      <p className="text-[7px] leading-tight truncate text-slate-100 uppercase">{senior.sitio}, Brgy. San Vicente</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ID Canvas - Back of the card */}
              <div id="id-card-back" className="relative w-[340px] h-[216px] bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-xl shadow-xl p-3 overflow-hidden mx-auto print:shadow-none print:border print:border-black print:text-black">
                {/* Ribbon details */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-amber-400 to-red-600"></div>

                {/* Back Layout Header */}
                <div className="flex justify-between items-start border-b pb-1.5 relative z-10 border-slate-200 dark:border-slate-800">
                  <div className="text-left">
                    <p className="text-[8px] font-black text-blue-900 dark:text-blue-400 uppercase flex items-center">
                      <ShieldAlert className="w-3 h-3 text-red-500 mr-1 flex-shrink-0" />
                      <span>EMERGENCY PROTOCOL INFO</span>
                    </p>
                    <p className="text-[5px] text-slate-400">If found injured or in distress, please notify immediately:</p>
                  </div>
                  <div className="text-[6px] font-bold text-slate-400 font-mono">REVERSE CODE REGISTER</div>
                </div>

                {/* Emergency Contact Detail Grid */}
                <div className="flex mt-2.5 space-x-2.5">
                  <div className="flex-1 text-left space-y-1.5">
                    <div>
                      <p className="text-[5.5px] uppercase font-bold text-slate-400">Primary Contact Person</p>
                      <p className="text-[9px] font-black uppercase tracking-tight text-slate-900 dark:text-white print:text-black">{senior.emergencyContact.name || "N/A"}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-x-1">
                      <div>
                        <p className="text-[5px] uppercase font-bold text-slate-400">Relationship</p>
                        <p className="text-[8.5px] font-extrabold text-slate-700 dark:text-slate-300 print:text-black uppercase">{senior.emergencyContact.relationship || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-[5px] uppercase font-bold text-slate-400">Mobileno / Contact</p>
                        <p className="text-[8.5px] font-extrabold font-mono text-slate-700 dark:text-slate-300 print:text-black">{senior.emergencyContact.contactNumber || "N/A"}</p>
                      </div>
                    </div>

                    {/* Certifying Signature lanes */}
                    <div className="mt-4 pt-1 flex justify-between space-x-2">
                      <div className="flex-1 text-center">
                        <div className="h-6 border-b border-black/30 dark:border-white/30 print:border-black flex items-end justify-center">
                          <span className="text-[6.5px] uppercase text-slate-400 tracking-tighter">Member Signature</span>
                        </div>
                      </div>
                      <div className="flex-1 text-center">
                        <div className="h-6 border-b border-black/30 dark:border-white/30 print:border-black flex flex-col justify-end items-center relative">
                          {/* Simulated stamp signature for pristine professional government look */}
                          <div className="absolute top-[-3px] text-blue-700 dark:text-blue-500 font-serif text-[7.5px] italic font-bold">Kap. Del Castillo</div>
                          <span className="text-[6.5px] uppercase font-extrabold text-[#1e3a8a] dark:text-blue-400 leading-none">Brgy. Captain</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* QR SCAN CODE Verification Anchor */}
                  <div className="w-[84px] h-[125px] flex flex-col items-center justify-between border-l pl-2 border-slate-200 dark:border-slate-800">
                    <img 
                      src={qrCodeUrl} 
                      alt="Verification QR" 
                      className="w-[74px] h-[74px] object-contain border bg-white p-1 rounded"
                    />
                    <div className="text-center leading-[1.1] mt-1 space-y-0.5">
                      <p className="text-[4.5px] font-black uppercase text-blue-900 dark:text-blue-400">Scan to Verify</p>
                      <p className="text-[4px] text-slate-400 leading-none">Authorized security scanned verify link</p>
                    </div>
                  </div>
                </div>

                {/* Terms disclaimer */}
                <div className="absolute bottom-1.5 left-3 right-3 text-[5px] leading-tight text-slate-400 text-center border-t pt-1 border-slate-100 dark:border-slate-800">
                  This card is the property of Barangay San Vicente, Government Code (R.A. 9994). Forged use is punishable.
                </div>
              </div>

            </div>

            {/* ============================================================== */}
            {/* SECTION 2: PRINTABLE CENTRAL REGISTRY DOSSIER SHEETS (A4 SIZE) */}
            {/* ============================================================== */}
            <div className="border-l pl-8 border-slate-200 dark:border-slate-800 lg:block print:block print:border-none print:pl-0">
              
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#1e3a8a] py-1 border-b mb-6 print:hidden">
                Dossier Sheet Archive Document (A4 Page Size)
              </h4>

              {/* Dossier Card Container */}
              <div className="bg-white text-black p-6 rounded-xl border border-slate-200 dark:border-slate-800 print:border-none print:p-0">
                {/* Government Header Stamp */}
                <div className="text-center pb-4 border-b-2 border-double border-slate-900 mb-6 font-serif">
                  <p className="text-[9px] uppercase tracking-widest text-slate-500 font-sans font-bold">Republic of the Philippines</p>
                  <p className="text-[10px] uppercase font-sans font-extrabold">CITY OF LAPU-LAPU</p>
                  <h3 className="text-lg font-black tracking-tight uppercase leading-none mt-1">OFFICE OF THE SENIOR CITIZENS AFFAIRS</h3>
                  <h2 className="text-sm font-extrabold tracking-wide uppercase leading-tight text-blue-900">Barangay San Vicente Senior Citizen Registry</h2>
                  <p className="text-[8px] italic text-slate-500 font-sans mt-0.5">National Social Pension Registry Copy Record # {senior.id}</p>
                </div>

                {/* Profile Grid */}
                <div className="grid grid-cols-4 gap-4 items-start">
                  
                  {/* Photo Profile stamp Left side */}
                  <div className="col-span-1 flex flex-col items-center">
                    <img 
                      src={senior.photo} 
                      alt="Senior citizen registry copy" 
                      className="w-24 h-24 object-cover rounded border-2 border-slate-800 p-1 bg-white"
                    />
                    <div className="mt-2 bg-slate-100 text-slate-900 text-[8px] font-mono p-1 border text-center font-bold uppercase rounded w-full">
                      Status: {senior.status}
                    </div>
                  </div>

                  {/* Core variables details Right side */}
                  <div className="col-span-3 text-sm space-y-3">
                    <div className="grid grid-cols-3 gap-x-2 gap-y-2 font-sans border-b pb-4">
                      <div className="col-span-3">
                        <label className="text-[8px] font-extrabold uppercase text-slate-500 tracking-wider">Full Name Representation</label>
                        <p className="text-base font-black text-slate-900 uppercase">{senior.fullName}</p>
                      </div>
                      
                      <div>
                        <label className="text-[8px] font-extrabold uppercase text-slate-500 tracking-wider">OSCA ID No.</label>
                        <p className="font-bold font-mono text-slate-950">{senior.oscaId}</p>
                      </div>
                      <div>
                        <label className="text-[8px] font-extrabold uppercase text-slate-500 tracking-wider">RRN Registry</label>
                        <p className="font-bold font-mono text-slate-950">{senior.rrn || "UNREGISTERED"}</p>
                      </div>
                      <div>
                        <label className="text-[8px] font-extrabold uppercase text-slate-500 tracking-wider">PKN Member No.</label>
                        <p className="font-bold font-mono text-slate-950">{senior.pkn || "N/A"}</p>
                      </div>

                      <div>
                        <label className="text-[8px] font-extrabold uppercase text-slate-500 tracking-wider">Date of Birth</label>
                        <p className="font-bold text-slate-950">{new Date(senior.birthDate).toLocaleDateString('en-US', {dateStyle:'long'})}</p>
                      </div>
                      <div>
                        <label className="text-[8px] font-extrabold uppercase text-slate-500 tracking-wider">Gender</label>
                        <p className="font-bold uppercase text-slate-950">{senior.gender}</p>
                      </div>
                      <div>
                        <label className="text-[8px] font-extrabold uppercase text-slate-500 tracking-wider">Computed Age</label>
                        <p className="font-bold text-slate-950">{calculateAge(senior.birthDate)} years old</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 border-b pb-4">
                      <div className="col-span-2">
                        <label className="text-[8px] font-extrabold uppercase text-slate-500 tracking-wider">COMPLETE REGISTERED ADDRESS</label>
                        <p className="text-xs uppercase text-slate-950 leading-normal">{senior.address}</p>
                        <p className="text-[9px] text-[#1e3a8a] font-bold uppercase mt-1">Sitio Zone Jurisdiction: {senior.sitio}</p>
                      </div>
                    </div>

                    {/* Emergency Response Person profile */}
                    <div className="bg-slate-50 p-3 rounded border font-sans">
                      <p className="text-[9px] font-black text-red-700 uppercase tracking-widest flex items-center mb-1.5">
                        <PhoneCall className="w-3.5 h-3.5 mr-1" />
                        <span>PRIMARY EMERGENCY AUDIT CONTACT</span>
                      </p>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-[7.5px] uppercase block text-slate-400">Emergency Persona</span>
                          <span className="font-extrabold">{senior.emergencyContact.name || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-[7.5px] uppercase block text-slate-400">Relationship</span>
                          <span className="font-extrabold uppercase">{senior.emergencyContact.relationship || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-[7.5px] uppercase block text-slate-400">Mobile Address</span>
                          <span className="font-extrabold font-mono text-slate-950">{senior.emergencyContact.contactNumber || "N/A"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Audit logs stamp */}
                    <div className="pt-4 text-[9px] text-slate-400 flex justify-between">
                      <p>Created: {new Date(senior.createdAt).toLocaleDateString()}</p>
                      <p>Updated: {new Date(senior.updatedAt).toLocaleDateString()}</p>
                      <p className="font-bold text-green-700">✓ Digital Database Stamp Secure</p>
                    </div>

                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
