/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { getSeniors, calculateAge } from '../db';
import { SeniorCitizen } from '../types';
import BrgyLogo from './BrgyLogo';
import { 
  ShieldCheck, UserX, Search, Sparkles, AlertCircle, FileText, 
  Calendar, MapPin, CheckCircle2, Globe, ExternalLink, RefreshCw, 
  Info, CornerRightDown, HelpCircle, Landmark
} from 'lucide-react';

interface VerificationPortalProps {
  initialQuery?: string;
  onBackToLogin: () => void;
  darkMode: boolean;
}

export default function VerificationPortal({ initialQuery = '', onBackToLogin, darkMode }: VerificationPortalProps) {
  const [query, setQuery] = useState(initialQuery);
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState<SeniorCitizen | null>(null);
  const [auditTime, setAuditTime] = useState<string>('');
  
  // Navigation tabs: local barangay registry or national NCSC web portal
  const [verifyMethod, setVerifyMethod] = useState<'local' | 'ncsc'>('local');
  const [iframeKey, setIframeKey] = useState(0); // To trigger iframe refresh
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      setVerifyMethod('local');
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = (searchVal: string = query) => {
    const term = searchVal.trim().toLowerCase();
    if (!term) return;

    const seniors = getSeniors();
    const found = seniors.find(s => 
      s.fullName.toLowerCase().includes(term) ||
      s.oscaId.toLowerCase() === term ||
      (s.rrn && s.rrn.toLowerCase() === term) ||
      (s.pkn && s.pkn.toLowerCase() === term)
    );

    setResult(found || null);
    setSearched(true);
    setAuditTime(new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Manila',
      dateStyle: 'medium',
      timeStyle: 'medium'
    }) + " (Philippine Standard Time)");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleRefreshIframe = () => {
    setIframeLoaded(false);
    setIframeKey(prev => prev + 1);
  };

  // Mask sensitive numbers in public view
  const maskString = (str: string, visibleStart = 5, visibleEnd = 3) => {
    if (!str) return '';
    if (str.length <= visibleStart + visibleEnd) return str;
    const middle = str.length - visibleStart - visibleEnd;
    return str.slice(0, visibleStart) + '*'.repeat(middle) + str.slice(-visibleEnd);
  };

  return (
    <div className={`min-h-screen py-10 px-4 transition-all duration-300 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      <div className={`mx-auto transition-all duration-500 ease-in-out ${verifyMethod === 'ncsc' ? 'max-w-5xl' : 'max-w-2xl'}`}>
        
        {/* Government Style Header */}
        <div className="text-center mb-8">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3.5 mb-4">
            {/* Custom SVG Barangay Logo Seal */}
            <BrgyLogo className="w-20 h-20 sm:w-24 sm:h-24 shadow-md rounded-full bg-[#081e3f]" />
            <div className="text-center sm:text-left">
              <p className="text-[10px] sm:text-xs font-bold tracking-widest text-[#1e3a8a] dark:text-[#60a5fa] uppercase">Republic of the Philippines</p>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight uppercase">Barangay San Vicente</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Lapu-Lapu City Office of Senior Citizen Affairs</p>
            </div>
          </div>
          
          <div className="p-[2px] bg-gradient-to-r from-blue-700 via-amber-500 to-red-600 rounded-full my-3"></div>
          
          <p className="text-xs sm:text-sm max-w-md mx-auto text-slate-500 dark:text-slate-400 mt-2">
            Providing real-time credentials validation. Search our local databases or seamlessly access the national registration systems below.
          </p>
        </div>

        {/* Tab Selection Control */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-200/60 dark:bg-slate-900 rounded-2xl mb-6 border border-slate-300/30 dark:border-slate-800 max-w-md mx-auto">
          <button
            onClick={() => setVerifyMethod('local')}
            className={`py-3 px-4 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer ${
              verifyMethod === 'local' 
                ? 'bg-white dark:bg-slate-850 shadow-md text-blue-900 dark:text-blue-400 scale-[1.02]' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Landmark className="w-4 h-4" />
            <span>Local Registry</span>
          </button>
          
          <button
            onClick={() => {
              setVerifyMethod('ncsc');
              setIframeLoaded(false);
            }}
            className={`py-3 px-4 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer ${
              verifyMethod === 'ncsc' 
                ? 'bg-white dark:bg-slate-850 shadow-md text-blue-900 dark:text-blue-400 scale-[1.02]' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>NCSC National Portal</span>
          </button>
        </div>

        {/* ========================================== */}
        {/* VIEW 1: LOCAL BARANGAY REGISTRY DATABASE  */}
        {/* ========================================== */}
        {verifyMethod === 'local' && (
          <div className="space-y-6">
            {/* Query Input Box */}
            <div id="search-container" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg rounded-2xl p-6">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
                </span>
                <input
                  type="text"
                  id="verification-query"
                  className="w-full pl-11 pr-24 py-4 rounded-xl text-base sm:text-lg border-2 border-slate-200 dark:border-slate-700 focus:border-blue-600 focus:outline-none bg-slate-50 dark:bg-slate-950 font-medium placeholder-slate-400"
                  placeholder="Full Name, RRN, PKN, or OSCA ID..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyPress}
                />
                <button
                  id="search-btn"
                  onClick={() => handleSearch()}
                  className="absolute right-2 top-2 bottom-2 bg-[#1e3a8a] hover:bg-blue-800 text-white font-bold px-4 sm:px-5 rounded-lg text-xs sm:text-sm transition-all shadow-md flex items-center space-x-2"
                >
                  <span>Verify</span>
                </button>
              </div>
              <div className="flex justify-between items-center mt-3 text-xs text-slate-400 dark:text-slate-500">
                <span>Format e.g., OSCA-30214-SV</span>
                <span className="flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                  <span>DPA Compliant Secure Server</span>
                </span>
              </div>
            </div>

            {/* Results Area */}
            {searched && (
              <div id="results-area" className="transition-all duration-300 transform scale-100">
                {result ? (
                  <div className="bg-white dark:bg-slate-900 border-2 border-green-500/30 rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-600 to-green-600 py-4 px-6 text-white flex justify-between items-center">
                      <div className="flex items-center space-x-2.5">
                        <ShieldCheck className="w-6 h-6 animate-bounce" />
                        <div>
                          <h4 className="font-extrabold tracking-wide uppercase text-sm">SECURELY VERIFIED REGISTERED MEMBER</h4>
                          <p className="text-[10px] text-emerald-100 opacity-90">Barangay Database Office Registry matches located</p>
                        </div>
                      </div>
                      <span className="bg-white text-emerald-800 text-[10px] uppercase font-black px-2.5 py-1 rounded-full shadow-inner animate-pulse">
                        {result.status}
                      </span>
                    </div>

                    <div className="p-6">
                      {/* Photo & Main profile snippet */}
                      <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                        <img 
                          id="verification-photo-badge"
                          src={result.photo} 
                          alt="Verified Senior" 
                          className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 dark:border-slate-800 shadow-md bg-slate-100"
                        />
                        <div className="text-center sm:text-left flex-1">
                          <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase leading-tight mb-1">
                            {result.fullName}
                          </h3>
                          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-950/40 rounded-full border border-blue-100 dark:border-blue-900/50 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-blue-600" />
                            <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase">{result.sitio}</span>
                          </div>
                        </div>
                      </div>

                      {/* Public Parameters Grid */}
                      <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
                        <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800/80">
                          <p className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-1">OSCA ID Number</p>
                          <p className="font-mono font-bold text-slate-800 dark:text-slate-200">
                            {maskString(result.oscaId, 5, 3)}
                          </p>
                        </div>
                        
                        <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800/80">
                          <p className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-1">Gender / Bio-details</p>
                          <p className="font-bold text-slate-800 dark:text-slate-200 uppercase">
                            {result.gender} (Age: {calculateAge(result.birthDate)})
                          </p>
                        </div>

                        <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800/80">
                          <p className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-1">Registry Ref Number (RRN)</p>
                          <p className="font-mono font-bold text-slate-800 dark:text-slate-200">
                            {result.rrn ? maskString(result.rrn, 4, 3) : "N/A"}
                          </p>
                        </div>

                        <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800/80">
                          <p className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-1">Kasapi Reg Number (PKN)</p>
                          <p className="font-mono font-bold text-slate-800 dark:text-slate-200">
                            {result.pkn ? maskString(result.pkn, 4, 3) : "N/A"}
                          </p>
                        </div>
                      </div>

                      {/* Public compliance note */}
                      <div className="mt-6 p-4 bg-blue-50/50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border border-blue-500/10 rounded-xl text-xs space-y-1">
                        <div className="flex items-center space-x-1.5 font-bold">
                          <AlertCircle className="w-4 h-4 flex-shrink-0 text-blue-600" />
                          <span>Data Protection Compliance Statement</span>
                        </div>
                        <p className="leading-relaxed opacity-90 text-[11px]">
                          To comply with Republic Act No. 10173 (Data Privacy Act of 2012), select parts of unique identifier hashes are masked. Full administrative lookup is restricted strictly to authorized staff on the central system.
                        </p>
                      </div>

                      {/* Verification Receipt info */}
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex flex-col sm:flex-row justify-between items-center space-y-1 sm:space-y-0">
                        <span className="flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                          <span>Signature Integrity Verified IP: Secured Cloud Portal</span>
                        </span>
                        <span className="font-mono">{auditTime}</span>
                      </div>

                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50/70 dark:bg-yellow-950/10 border-2 border-amber-300/50 rounded-2xl p-6 text-center shadow-lg">
                    <UserX className="w-12 h-12 text-amber-600 mx-auto mb-3 animate-bounce" />
                    <h4 className="text-lg font-black text-amber-800 dark:text-amber-400 uppercase">NO RECORDFILE DETECTED</h4>
                    <p className="text-sm text-amber-700 dark:text-amber-500 mt-1 max-w-md mx-auto">
                      No registered Senior Citizen matches the search term "<strong>{query}</strong>". Please check spelling, double-check OSCA ID numerals, and confirm registered residency.
                    </p>
                    <div className="mt-4 text-[11px] text-slate-400 leading-relaxed font-semibold">
                      If newly registered, synchronization across decentralized databases may take 24–48 hours. Please inspect your printed OSCA validation stamp.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ======================================================= */}
        {/* VIEW 2: EMBEDDED NCSC NATIONAL REGISTRATION WEB PORTAL */}
        {/* ======================================================= */}
        {verifyMethod === 'ncsc' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Quick reference guide & helper alerts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="md:col-span-2 bg-gradient-to-br from-blue-900 to-indigo-950 p-5 rounded-2xl shadow-lg border border-blue-800 text-white flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-amber-400 mb-2">
                    <Globe className="w-5 h-5" />
                    <h4 className="font-black text-xs uppercase tracking-widest">NCSC Integration Hub</h4>
                  </div>
                  <h3 className="text-lg font-extrabold tracking-tight mb-2">Official National Database System</h3>
                  <p className="text-xs text-blue-200 leading-relaxed font-medium">
                    The National Commission of Senior Citizens (NCSC) portal empowers residents of Lapu-Lapu City to register and authenticate their senior status on the unified nationwide registry. Live navigation is supported below.
                  </p>
                </div>
                
                <div className="mt-4 pt-4 border-t border-blue-900 flex flex-wrap gap-3">
                  <a 
                    href="https://www.ncsc.gov.ph/registration-verification" 
                    target="_blank" 
                    referrerPolicy="no-referrer"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-xl text-xs font-black uppercase transition shadow-md"
                  >
                    <span>Launch National Website</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  
                  <button 
                    onClick={handleRefreshIframe}
                    className="inline-flex items-center space-x-1 bg-blue-900/50 hover:bg-blue-900 transition-colors border border-blue-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset Frame</span>
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
                <div className="flex items-center space-x-1.5 text-slate-800 dark:text-slate-200 mb-2 font-black text-xs uppercase tracking-wider">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  <span>National Registrations</span>
                </div>
                
                <ul className="text-[11px] space-y-2 text-slate-500 dark:text-slate-400 font-semibold">
                  <li className="flex items-start space-x-1.5">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Make sure to prepare a digital copy of your OSCA ID & Philippine ID.</span>
                  </li>
                  <li className="flex items-start space-x-1.5">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Ensure active internet stability to prevent form drops.</span>
                  </li>
                  <li className="flex items-start space-x-1.5">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Upon successful verification, save your NCSC Reference Number.</span>
                  </li>
                </ul>

                <div className="mt-3.5 p-2 bg-amber-500/10 border border-amber-500/10 rounded-lg text-[10px] text-amber-700 dark:text-amber-400 flex items-start space-x-1.5">
                  <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>If the embedded portal below displays empty, it is due to national security frame-protection. Please click 'Launch National Website' above instead.</span>
                </div>
              </div>

            </div>

            {/* Embedded Interactive Iframe Browser Sandbox */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
              
              {/* Virtual Browser Chrome header */}
              <div className="bg-slate-100 dark:bg-slate-950 px-4 py-3 border-b border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  {/* Browser DOTS */}
                  <div className="flex space-x-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-bold tracking-wider ml-1 uppercase">SECURE SHELL BRIDGED</span>
                </div>

                {/* Simulated URL Bar */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-1.5 px-4 flex-1 max-w-lg mx-2 flex items-center justify-between shadow-inner w-full sm:w-auto">
                  <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-350 select-all font-mono text-[11px] overflow-x-auto whitespace-nowrap scrollbar-none">
                    <span className="text-green-600 font-extrabold flex items-center space-x-0.5">
                      <span>https://</span>
                    </span>
                    <span className="font-bold">www.ncsc.gov.ph/registration-verification</span>
                  </div>
                  <ShieldCheck className="w-3.5 h-3.5 text-green-500 flex-shrink-0 ml-1" />
                </div>

                <div className="flex items-center space-x-2.5">
                  <button 
                    onClick={handleRefreshIframe}
                    className="p-1 px-2.5 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-850 hover:text-blue-600 transition duration-150 flex items-center space-x-1 font-bold"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Reload</span>
                  </button>
                  <a 
                    href="https://www.ncsc.gov.ph/registration-verification" 
                    target="_blank" 
                    referrerPolicy="no-referrer"
                    rel="noopener noreferrer"
                    className="p-1 px-2.5 bg-[#1e3a8a] text-white hover:bg-blue-800 rounded-lg transition duration-150 flex items-center space-x-1 font-bold"
                  >
                    <span>Inspect</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

              </div>

              {/* Sandbox Framework */}
              <div className="relative bg-slate-100 dark:bg-slate-950 flex flex-col justify-center items-center h-[650px]">
                
                {/* Loader status */}
                {!iframeLoaded && (
                  <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center z-10 p-6 text-center">
                    <div className="relative flex items-center justify-center mb-4">
                      {/* Radiating visual ring */}
                      <span className="absolute inline-flex h-12 w-12 rounded-full bg-blue-400 opacity-20 animate-ping"></span>
                      <RefreshCw className="w-8 h-8 text-[#1e3a8a] dark:text-[#60a5fa] animate-spin" />
                    </div>
                    <p className="text-sm font-black text-slate-700 dark:text-slate-300">Syncing with Philippine Government Servers...</p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-xs">Connecting to www.ncsc.gov.ph security system. This will embed the live form immediately.</p>
                  </div>
                )}

                {/* Actual Remote Framework Iframe */}
                <iframe
                  key={iframeKey}
                  src="https://www.ncsc.gov.ph/registration-verification"
                  className="w-full h-full border-0 select-none bg-white relative z-0"
                  title="NCSC Official Verification Form Frame"
                  onLoad={() => setIframeLoaded(true)}
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="bg-slate-100 dark:bg-slate-950 px-5 py-4 border-t border-slate-200/80 dark:border-slate-800 text-center text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                <span>Unified Senior Citizens Welfare Alliance • Lapu-Lapu City</span>
              </div>

            </div>

          </div>
        )}

        {/* Support panel */}
        <div className="mt-8 text-center bg-slate-100 dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left text-xs">
            <p className="font-extrabold text-slate-700 dark:text-slate-300 text-sm">Need help or missing records?</p>
            <p className="text-slate-400 mt-0.5 font-medium">Visit Barangay Senior Desk or send an official query directly to desk@sanvicente.gov</p>
          </div>
          <button
            onClick={onBackToLogin}
            className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 transition rounded-xl text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 shadow-sm cursor-pointer"
          >
            Terminal Login
          </button>
        </div>
      </div>
    </div>
  );
}

