/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { checkPIN, initDB, logActivity } from './db';
import { AdminRole, SeniorCitizen } from './types';
import MemberList from './components/MemberList';
import MemberForm from './components/MemberForm';
import PrintCard from './components/PrintCard';
import AdminDashboard from './components/AdminDashboard';
import VerificationPortal from './components/VerificationPortal';
import BrgyLogo from './components/BrgyLogo';
import { 
  Users, LayoutDashboard, Search, KeyRound, ShieldAlert, LogOut, 
  Sun, Moon, Accessibility, User, ShieldCheck, Landmark 
} from 'lucide-react';

export default function App() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [operatorName, setOperatorName] = useState('Nida Garcia'); // Default secretary staff
  const [operatorRole, setOperatorRole] = useState<AdminRole>('Staff');
  const [enteredPin, setEnteredPin] = useState('');
  const [loginError, setLoginError] = useState('');

  // Nav views state
  const [activeTab, setActiveTab] = useState<'members' | 'dashboard' | 'verify'>('members');
  const [isPublicPortal, setIsPublicPortal] = useState(false);
  const [publicQrPrefill, setPublicQrPrefill] = useState('');

  // Modals / Detail actions
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSeniorId, setEditingSeniorId] = useState<string | null>(null);
  const [printableSenior, setPrintableSenior] = useState<SeniorCitizen | null>(null);

  // Theme states
  const [darkMode, setDarkMode] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  // Trigger refresh in lists when CRUD happens
  const [refreshToggle, setRefreshToggle] = useState(false);

  // Initialize DB and Hash listener for QR Codes scan
  useEffect(() => {
    initDB();

    const checkHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#verify/')) {
        const oscaId = decodeURIComponent(hash.split('/')[1] || '');
        if (oscaId) {
          setPublicQrPrefill(oscaId);
          setIsPublicPortal(true);
        }
      }
    };

    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  // Sync operator-role selection defaults
  const handleRoleChange = (role: AdminRole) => {
    setOperatorRole(role);
    setOperatorName(role === 'Super Admin' ? 'Kap. Teodoro del Castillo' : 'Nida Garcia');
  };

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!enteredPin) {
      setLoginError("Please type entry PIN.");
      return;
    }

    if (checkPIN(enteredPin)) {
      setIsAuthenticated(true);
      setEnteredPin('');
      // Log historical authentication
      logActivity(
        operatorRole,
        operatorName,
        "System Login",
        `Operator authenticated access to administrative mainframe console.`
      );
    } else {
      setLoginError("Access Denied: Hashed PIN signature mismatch. Please retry.");
      setEnteredPin('');
    }
  };

  // Sign out handler
  const handleSignOut = () => {
    logActivity(
      operatorRole,
      operatorName,
      "System Logout",
      `Operator exited administrative mainframe terminal.`
    );
    setIsAuthenticated(false);
    setEnteredPin('');
  };

  // Save changes callback
  const handleSaveSuccess = () => {
    setIsFormOpen(false);
    setEditingSeniorId(null);
    setRefreshToggle(prev => !prev);
  };

  // Numeric keypad utility for quick login
  const handleKeypadPress = (num: string) => {
    if (enteredPin.length < 12) {
      setEnteredPin(prev => prev + num);
    }
  };

  const handleKeypadClear = () => {
    setEnteredPin('');
  };

  return (
    <div className={`min-h-screen transition-all font-sans ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} ${highContrast ? 'contrast-125' : ''}`}>
      
      {/* ============================================================== */}
      {/* VIEW A: UNAUTHENTICATED PUBLIC QR VERIFICATION PORTAL         */}
      {/* ============================================================== */}
      {isPublicPortal ? (
        <VerificationPortal 
          initialQuery={publicQrPrefill} 
          onBackToLogin={() => {
            setIsPublicPortal(false);
            window.location.hash = '';
          }} 
          darkMode={darkMode}
        />
      ) : !isAuthenticated ? (
        
        // ==============================================================
        // VIEW B: SECURE ADMIN PIN LOGIN GATEWAY
        // ==============================================================
        <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
          
          <div className={`max-w-md w-full space-y-6 p-8 border rounded-3xl shadow-2xl overflow-hidden relative ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            
            {/* National Philippine Accent bars line decoration */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-700 via-yellow-400 to-red-600"></div>

            <div className="text-center">
              {/* Gold Heraldic Barangay Logo */}
              <div className="flex flex-col justify-center items-center space-y-2 mb-3">
                <BrgyLogo className="w-24 h-24 shadow-lg rounded-full" />
                <h2 className="text-[#1e3a8a] dark:text-[#60a5fa] font-black text-sm uppercase tracking-widest leading-none mt-2">BARANGAY SAN VICENTE</h2>
              </div>
              <h1 className="text-xl font-extrabold tracking-tight uppercase leading-snug">Senior Citizen Information Mainframe</h1>
              <p className="text-xs text-slate-400 mt-1 uppercase font-semibold">Decentralized Municipal Registry Office</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="p-3.5 bg-red-100 border-l-4 border-red-600 text-red-900 text-xs rounded-r-lg font-bold flex items-start space-x-2 animate-shake">
                  <ShieldAlert className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Operator details configuration */}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Select Access Role</label>
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <button
                      type="button"
                      onClick={() => handleRoleChange('Staff')}
                      className={`py-2 rounded-lg font-bold transition-all cursor-pointer ${operatorRole === 'Staff' ? 'bg-[#1e3a8a] text-white shadow-inner' : 'bg-white dark:bg-slate-900 hover:bg-slate-100 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'}`}
                    >
                      Staff Account
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRoleChange('Super Admin')}
                      className={`py-2 rounded-lg font-bold transition-all cursor-pointer ${operatorRole === 'Super Admin' ? 'bg-[#1e3a8a] text-white shadow-inner' : 'bg-white dark:bg-slate-900 hover:bg-slate-100 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'}`}
                    >
                      Super Admin
                    </button>
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Operator Representative Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 rounded-lg text-xs font-bold uppercase border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none"
                    value={operatorName}
                    onChange={(e) => setOperatorName(e.target.value)}
                  />
                </div>
              </div>

              {/* PIN input and keypad layout */}
              <div className="space-y-3">
                <label className="block text-center text-xs font-extrabold uppercase tracking-wide text-slate-500">
                  Enter Numeric Access PIN
                </label>
                
                <input
                  type="password"
                  id="pin-login"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  placeholder="••••••"
                  className="w-full py-3.5 tracking-[1em] text-center text-2xl font-black rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-blue-600 focus:outline-none"
                  value={enteredPin}
                  onChange={(e) => setEnteredPin(e.target.value.replace(/\D/g, ''))}
                />

                {/* Simulated Tactile Keypad */}
                <div className="grid grid-cols-3 gap-2 px-6">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleKeypadPress(num)}
                      className="py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-base font-extrabold rounded-xl cursor-pointer select-none transition active:scale-95 text-slate-705 dark:text-slate-200"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleKeypadClear}
                    className="py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/30 text-xs font-black rounded-xl text-red-600 transition active:scale-95 cursor-pointer"
                  >
                    CLR
                  </button>
                  <button
                    type="button"
                    onClick={() => handleKeypadPress('0')}
                    className="py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-base font-extrabold rounded-xl cursor-pointer transition active:scale-95 text-slate-705 dark:text-slate-200"
                  >
                    0
                  </button>
                  <button
                    type="submit"
                    className="py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black tracking-wider rounded-xl uppercase transition shadow active:scale-95 cursor-pointer"
                  >
                    ENTER
                  </button>
                </div>
              </div>
            </form>

            <div className="p-[1px] bg-slate-200 dark:bg-slate-800 my-4"></div>

            {/* Link to public QR portal */}
            <div className="text-center text-xs">
              <button
                onClick={() => setIsPublicPortal(true)}
                className="text-blue-700 hover:text-blue-800 dark:text-blue-400 font-extrabold transition uppercase tracking-wider flex items-center justify-center mx-auto space-x-1 border border-blue-500/20 px-4 py-2 rounded-xl bg-blue-50/50 dark:bg-blue-950/10 cursor-pointer"
              >
                <Search className="w-4 h-4 mr-0.5" />
                <span>Open Public Verification Portal</span>
              </button>
              <p className="text-[10px] text-slate-400 mt-2">Unauthenticated residents &amp; medical clinics verify lists here</p>
            </div>

            {/* Default credentials guide */}
            <div className="text-center text-[10px] text-slate-400">
              Default system PIN: <span className="font-mono font-bold bg-slate-100 dark:bg-slate-950 px-1.5 py-0.5 rounded text-red-500">553752</span>
            </div>

          </div>
        </div>

      ) : (

        // ==============================================================
        // VIEW C: SECURE AUTHENTICATED ADMINISTRATOR APPLICATION CONSOLE
        // ==============================================================
        <div className="min-h-screen flex flex-col">
          
          {/* Main Top Header Banner */}
          <header className="bg-[#1e3a8a] text-white py-4 px-6 shadow-md border-b-2 border-amber-500 relative print:hidden">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
              
              <div className="flex items-center space-x-3.5">
                {/* Official Gold Seal Icon */}
                <BrgyLogo size={64} className="w-16 h-16 shadow-md rounded-full bg-[#081e3f]" />
                <div className="text-left leading-tight">
                  <h1 className="text-lg font-black tracking-tight uppercase flex items-center">
                    <span>San Vicente Senior Registry Mainframe</span>
                    <ShieldCheck className="w-5 h-5 text-green-400 ml-1.5 flex-shrink-0" />
                  </h1>
                  <p className="text-xs text-blue-200">Decentralized Administration Portal • Barangay San Vicente, Lapu-Lapu City</p>
                </div>
              </div>

              {/* Utility Panel: Active operator indicator, accessibility toggles */}
              <div className="flex flex-wrap items-center justify-end gap-3.5 text-xs">
                
                {/* Active Operator Badge */}
                <div className="flex items-center space-x-2 bg-blue-950/65 px-3 py-1.5 rounded-xl border border-blue-900">
                  <User className="w-4 h-4 text-amber-400" />
                  <div className="text-left font-sans text-[10px]">
                    <span className="block font-bold text-slate-100">{operatorName}</span>
                    <span className="text-amber-400 font-extrabold uppercase leading-none">{operatorRole}</span>
                  </div>
                </div>

                {/* Interactive Toggles */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    title="Toggle Dark Mode color spectrum"
                    className="p-2 bg-blue-950/80 border border-blue-900 rounded-lg hover:bg-blue-900 transition text-slate-200 cursor-pointer"
                  >
                    {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => setHighContrast(!highContrast)}
                    title="Toggle High Contrast Accessible Font Layout"
                    className={`p-2 rounded-lg border transition cursor-pointer flex items-center space-x-1 ${highContrast ? 'bg-amber-500 text-slate-900 border-amber-600' : 'bg-blue-950/80 border-[#1e3a8a] text-slate-200 hover:bg-blue-900'}`}
                  >
                    <Accessibility className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-wider">A11y</span>
                  </button>
                </div>

                {/* Signout button */}
                <button
                  onClick={handleSignOut}
                  className="bg-red-600 hover:bg-red-700 active:scale-95 text-white font-extrabold px-3 py-2 rounded-lg flex items-center space-x-1 shadow transition cursor-pointer text-xs"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Exit</span>
                </button>

              </div>

            </div>
          </header>

          {/* Navigation Control Tabs */}
          <nav className="bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 print:hidden text-sm font-sans font-bold select-none text-left">
            <div className="max-w-7xl mx-auto px-6 flex space-x-6">
              <button
                onClick={() => setActiveTab('members')}
                className={`py-3.5 border-b-2 text-xs uppercase tracking-wider font-extrabold flex items-center space-x-2 transition-all cursor-pointer ${activeTab === 'members' ? 'border-[#1e3a8a] text-blue-900 dark:text-blue-400 font-black' : 'border-transparent text-slate-400 hover:text-slate-655'}`}
              >
                <Users className="w-4.5 h-4.5" />
                <span>Member Directory Ledger</span>
              </button>

              <button
                id="dashboard-tab"
                onClick={() => setActiveTab('dashboard')}
                className={`py-3.5 border-b-2 text-xs uppercase tracking-wider font-extrabold flex items-center space-x-2 transition-all cursor-pointer ${activeTab === 'dashboard' ? 'border-[#1e3a8a] text-blue-900 dark:text-blue-400 font-black' : 'border-transparent text-slate-400 hover:text-slate-655'}`}
              >
                <LayoutDashboard className="w-4.5 h-4.5" />
                <span>Central Statistics Dashboard</span>
              </button>

              <button
                onClick={() => {
                  window.location.hash = '#verify/';
                  setIsPublicPortal(true);
                }}
                className="py-3.5 border-b-2 border-transparent text-xs uppercase tracking-wider font-extrabold text-slate-400 hover:text-slate-655 flex items-center space-x-2 cursor-pointer"
              >
                <Search className="w-4.5 h-4.5" />
                <span>Citizen Verification Tool</span>
              </button>
            </div>
          </nav>

          {/* Active panel layout views */}
          <main className="flex-grow p-6 max-w-7xl mx-auto w-full print:p-0">
            {activeTab === 'members' ? (
              <MemberList 
                operator={{ name: operatorName, role: operatorRole }}
                onAddClick={() => {
                  setEditingSeniorId(null);
                  setIsFormOpen(true);
                }}
                onEditClick={(id) => {
                  setEditingSeniorId(id);
                  setIsFormOpen(true);
                }}
                onPrintClick={(s) => setPrintableSenior(s)}
                triggerRefreshToggle={refreshToggle}
                darkMode={darkMode}
              />
            ) : (
              <AdminDashboard 
                operator={{ name: operatorName, role: operatorRole }}
                onBackToMembers={() => setActiveTab('members')}
                onRestoreRefresh={() => setRefreshToggle(prev => !prev)}
                darkMode={darkMode}
              />
            )}
          </main>

          {/* Footer branding */}
          <footer className="py-6 border-t border-slate-200 dark:border-slate-800 text-slate-400 bg-slate-50 dark:bg-slate-950 text-xs print:hidden">
            <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-3 font-semibold text-[11px]">
              <p>Barangay Registry System • Barangay San Vicente, Lapu-Lapu City Office of Senior Citeizen © 2026. All Rights Reserved.</p>
              <div className="flex space-x-4">
                <span>Secure Hashing: SHA-256 System-Local</span>
                <span>Contact support: desk@sanvicente.gov</span>
              </div>
            </div>
          </footer>

          {/* MODAL 1: Add/Edit Senior citizen form */}
          {isFormOpen && (
            <MemberForm 
              seniorIdToEdit={editingSeniorId}
              operator={{ name: operatorName, role: operatorRole }}
              onClose={() => {
                setIsFormOpen(false);
                setEditingSeniorId(null);
              }}
              onSaveSuccess={handleSaveSuccess}
              darkMode={darkMode}
            />
          )}

          {/* MODAL 2: Printable ID card and dossier details */}
          {printableSenior && (
            <PrintCard 
              senior={printableSenior} 
              onClose={() => setPrintableSenior(null)}
            />
          )}

        </div>
      )}

    </div>
  );
}
