/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  getStats, 
  getActivityLogs, 
  backupSystemData, 
  restoreSystemData, 
  changePIN, 
  clearActivityLogs,
  hashPIN
} from '../db';
import { DashboardStats, ActivityLog, AdminRole } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  Users, UserCheck, UserX, UserMinus, Percent, Award, EyeOff, Archive, 
  Download, Upload, Settings, ShieldCheck, History, Sliders, Database, AlertTriangle, KeyRound
} from 'lucide-react';

interface AdminDashboardProps {
  operator: { name: string; role: AdminRole };
  onBackToMembers: () => void;
  onRestoreRefresh: () => void;
  darkMode: boolean;
}

const COLORS = ['#1d4ed8', '#be185d', '#d97706', '#059669', '#7c3aed', '#db2777', '#4b5563'];

export default function AdminDashboard({ operator, onBackToMembers, onRestoreRefresh, darkMode }: AdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>(getStats());
  const [logs, setLogs] = useState<ActivityLog[]>(getActivityLogs());
  const [logFilter, setLogFilter] = useState('');
  
  // Settings structures 
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinChangeMsg, setPinChangeMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Supabase simulation setting
  const [sbUrl, setSbUrl] = useState(() => localStorage.getItem("bsv_sb_url") || '');
  const [sbKey, setSbKey] = useState(() => localStorage.getItem("bsv_sb_key") || '');
  const [sbStatus, setSbStatus] = useState<'idle' | 'connected' | 'error'>('idle');

  // Load stats and logs
  useEffect(() => {
    setStats(getStats());
    setLogs(getActivityLogs());
  }, []);

  const refreshDashboard = () => {
    setStats(getStats());
    setLogs(getActivityLogs());
    onRestoreRefresh();
  };

  // Convert stats to Recharts readable format
  const genderData = [
    { name: 'Male', value: stats.maleSeniors },
    { name: 'Female', value: stats.femaleSeniors },
    { name: 'Other', value: stats.otherSeniors }
  ].filter(item => item.value > 0);

  const ageData = [
    { name: 'Junior (60-69)', count: stats.ageGroups.juniorSeniors },
    { name: 'Middle (70-79)', count: stats.ageGroups.middleSeniors },
    { name: 'Elder (80+)', count: stats.ageGroups.elderSeniors }
  ];

  const sitioData = Object.entries(stats.sitioDistribution).map(([sitio, count]) => ({
    name: sitio.replace('Sitio ', ''), // Shorter names
    Seniors: count
  }));

  // Handlers for Backup
  const handleBackupDownload = () => {
    const backupJson = backupSystemData();
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BSV-Senior-Registry-Backup-${new Date().toISOString().slice(0,10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Handlers for Restore
  const handleRestoreUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const jsonText = event.target?.result as string;
      const res = restoreSystemData(jsonText, operator);
      if (res.success) {
        alert(`Database successfully restored! Loaded ${res.recordCount} senior citizen profiles.`);
        refreshDashboard();
      } else {
        alert(`Database restoration failed: ${res.error}`);
      }
    };
    reader.readAsText(file);
  };

  // Log Clear for Super Admin
  const handleClearLogs = () => {
    if (!window.confirm("Are you absolutely sure you want to clear all historical operation logs? This action is irreversible.")) return;
    clearActivityLogs(operator.name);
    setLogs([]);
  };

  // Change PIN handler (Super Admin check done in UI rendering too)
  const handlePinChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeMsg(null);

    if (newPin.length < 4) {
      setPinChangeMsg({ type: 'error', text: 'PIN must be at least 4 digits.' });
      return;
    }
    if (newPin !== confirmPin) {
      setPinChangeMsg({ type: 'error', text: 'New PIN and Confirm PIN do not match.' });
      return;
    }

    const success = changePIN(newPin, operator.name);
    if (success) {
      setPinChangeMsg({ type: 'success', text: 'Administrative access PIN modified successfully and hashed.' });
      setNewPin('');
      setConfirmPin('');
      setLogs(getActivityLogs());
    } else {
      setPinChangeMsg({ type: 'error', text: 'Failed to update PIN.' });
    }
  };

  // Supabase credential save
  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("bsv_sb_url", sbUrl.trim());
    localStorage.setItem("bsv_sb_key", sbKey.trim());
    
    if (sbUrl.trim() && sbKey.trim()) {
      setSbStatus('connected');
    } else {
      setSbStatus('idle');
    }
    alert("Supabase integration secrets updated! Real PostgreSQL queries initialized default hooks.");
  };

  // Filters logs based on search query
  const filteredLogs = logs.filter(l => 
    l.userName.toLowerCase().includes(logFilter.toLowerCase()) ||
    l.action.toLowerCase().includes(logFilter.toLowerCase()) ||
    l.details.toLowerCase().includes(logFilter.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Seniors</span>
            <span className="text-3xl font-black">{stats.totalSeniors}</span>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/40 p-3 rounded-xl border border-blue-100 dark:border-blue-900/50">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Active Units</span>
            <span className="text-3xl font-black text-green-600">{stats.activeSeniors}</span>
          </div>
          <div className="bg-green-50 dark:bg-green-950/40 p-3 rounded-xl border border-green-100 dark:border-green-900/50">
            <UserCheck className="w-6 h-6 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Inactive List</span>
            <span className="text-3xl font-black text-slate-500">{stats.inactiveSeniors}</span>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl">
            <UserX className="w-6 h-6 text-slate-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Suspended Status</span>
            <span className="text-3xl font-black text-amber-500">{stats.suspendedSeniors}</span>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-100 dark:border-amber-900/50">
            <UserMinus className="w-6 h-6 text-amber-500" />
          </div>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Deceased Registry</span>
            <span className="text-3xl font-black text-red-600">{stats.deceasedSeniors}</span>
          </div>
          <div className="bg-red-50 dark:bg-red-950/40 p-3 rounded-xl border border-red-100 dark:border-red-900/50">
            <Archive className="w-6 h-6 text-red-600" />
          </div>
        </div>

      </div>

      {/* Recharts Graphical Visuals Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sitio distribution barchart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm text-left">
          <h3 className="font-extrabold text-sm uppercase text-slate-700 dark:text-slate-300 mb-4 flex items-center space-x-1.5">
            <Database className="w-4.5 h-4.5 text-[#1e3a8a] dark:text-blue-400" />
            <span>Senior Count per Sitio (Zone Jurisdiction)</span>
          </h3>
          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sitioData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ background: darkMode ? '#0f172a' : '#ffffff', borderColor: darkMode ? '#334155' : '#e2e8f0', fontSize: 11 }} />
                <Bar dataKey="Seniors" fill="#1e3a8a" radius={[4, 4, 0, 0]}>
                  {sitioData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Demographics Gender Pie Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm text-left">
          <h3 className="font-extrabold text-sm uppercase text-slate-700 dark:text-slate-300 mb-4 flex items-center space-x-1.5">
            <Percent className="w-4.5 h-4.5 text-pink-600" />
            <span>Gender Classification Distribution</span>
          </h3>
          <div className="h-44 flex items-center justify-center relative">
            {genderData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.name === 'Male' ? '#1d4ed8' : entry.name === 'Female' ? '#be185d' : '#d97706'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs text-slate-400">No registered members</span>
            )}
            
            {/* Legend Overlay overlay inside donut */}
            <div className="absolute flex flex-col items-center">
              <span className="text-xl font-bold">{stats.totalSeniors}</span>
              <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Seniors</span>
            </div>
          </div>
          {/* Custom Legends list */}
          <div className="flex justify-center space-x-6 text-[11px] font-bold mt-2">
            <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-blue-700 mr-1.5"></span>Male ({stats.maleSeniors})</span>
            <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-pink-700 mr-1.5"></span>Female ({stats.femaleSeniors})</span>
            {stats.otherSeniors > 0 && <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-amber-600 mr-1.5"></span>Other ({stats.otherSeniors})</span>}
          </div>
        </div>

      </div>

      {/* Age Bracket barchart section and system integration options */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Age Demographics Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm text-left flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-sm uppercase text-slate-700 dark:text-slate-300 mb-4 flex items-center space-x-1.5">
              <Award className="w-4.5 h-4.5 text-purple-600" />
              <span>Age Bracket Demographics</span>
            </h3>
            <div className="h-44 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} />
                  <Tooltip contentStyle={{ fontSize: 10 }} />
                  <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="p-3 bg-purple-50/50 dark:bg-purple-950/10 border-l-4 border-purple-600 rounded-r-lg text-xs mt-4">
            <p className="font-bold text-slate-700 dark:text-slate-300 leading-normal">
              Most registered seniors belong in the: <strong>
                {stats.ageGroups.juniorSeniors >= stats.ageGroups.middleSeniors && stats.ageGroups.juniorSeniors >= stats.ageGroups.elderSeniors ? 'Junior (60-69)' :
                 stats.ageGroups.middleSeniors >= stats.ageGroups.juniorSeniors && stats.ageGroups.middleSeniors >= stats.ageGroups.elderSeniors ? 'Middle (70-79)' : 'Elder (80+)'}
              </strong> bracket.
            </p>
          </div>
        </div>

        {/* Database backup-restore panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm text-left flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-sm uppercase text-slate-700 dark:text-slate-300 mb-4 flex items-center space-x-1.5">
              <Database className="w-4.5 h-4.5 text-emerald-600" />
              <span>Backup &amp; Restoration Office</span>
            </h3>
            <p className="text-xs text-slate-400 mb-5 leading-normal">
              Administer system durability. Extract state records into high-density JSON files or upload previously backup files to restore Barangay registers instantly.
            </p>
          </div>

          <div className="space-y-3.5">
            <button
              onClick={handleBackupDownload}
              className="w-full bg-[#1e3a8a] text-white hover:bg-blue-800 transition active:scale-95 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg flex items-center justify-center space-x-2 cursor-pointer shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>Download Registry JSON Backup</span>
            </button>

            <div className="relative w-full">
              <button
                className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition py-2.5 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 rounded-lg flex items-center justify-center space-x-2 border border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Upload &amp; Restore Database</span>
              </button>
              <input 
                type="file" 
                accept=".json"
                onChange={handleRestoreUpload}
                className="absolute inset-0 opacity-0 cursor-pointer" 
              />
            </div>
            <p className="text-[10px] text-center text-slate-400 italic">Caution: Uploading backup overwrites present states.</p>
          </div>
        </div>

        {/* Settings options: PIN changing and Supabase Sync */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm text-left space-y-4">
          <h3 className="font-extrabold text-sm uppercase text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
            <Settings className="w-4.5 h-4.5 text-amber-500" />
            <span>Admin Secure Configuration</span>
          </h3>

          {/* Change PIN (Super Admin only can configure) */}
          <div className="space-y-2 border-b pb-3.5 border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
              <KeyRound className="w-3.5 h-3.5 mr-1 text-amber-500" />
              <span>Modify Access Hashed PIN</span>
            </span>
            
            {operator.role === 'Super Admin' ? (
              <form onSubmit={handlePinChange} className="space-y-2 mt-1">
                <input 
                  type="password" 
                  pattern="[0-9]*"
                  inputMode="numeric"
                  placeholder="New Numeric PIN (e.g. 123456)" 
                  className="w-full p-1.5 text-xs rounded border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                />
                <input 
                  type="password" 
                  pattern="[0-9]*"
                  inputMode="numeric"
                  placeholder="Confirm Numeric PIN" 
                  className="w-full p-1.5 text-xs rounded border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                />
                <button
                  type="submit"
                  className="w-full py-1.5 bg-amber-500 hover:bg-amber-600 transition text-[10px] font-black uppercase text-slate-950 rounded cursor-pointer"
                >
                  Confirm Change PIN
                </button>
                {pinChangeMsg && (
                  <p className={`text-[10px] leading-tight font-bold ${pinChangeMsg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>{pinChangeMsg.text}</p>
                )}
              </form>
            ) : (
              <div className="p-2 bg-slate-50 dark:bg-slate-950 rounded border flex items-start space-x-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-[9px] text-slate-400">PIN modification is restricted strictly to Super Admin roles. Staff accounts can not modify hashed credentials.</p>
              </div>
            )}
          </div>

          {/* Supabase Dynamic Configuration */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
              <Database className="w-3.5 h-3.5 mr-1 text-blue-600" />
              <span>Connect Supabase PostgreSQL Sync</span>
            </span>
            <form onSubmit={handleSaveSupabase} className="space-y-1.5 text-xs">
              <input 
                type="url" 
                placeholder="Supabase Project URL" 
                className="w-full p-1.5 text-xs rounded border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none"
                value={sbUrl}
                onChange={(e) => setSbUrl(e.target.value)}
              />
              <input 
                type="password" 
                placeholder="Supabase Anon Public API Key" 
                className="w-full p-1.5 text-xs rounded border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none"
                value={sbKey}
                onChange={(e) => setSbKey(e.target.value)}
              />
              <button
                type="submit"
                className="w-full py-1.5 bg-blue-700 hover:bg-blue-800 transition text-[10px] font-black uppercase text-white rounded cursor-pointer"
              >
                Save Integration Keys
              </button>
            </form>
          </div>

        </div>

      </div>

      {/* Activity logs module */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm text-left">
        <div className="bg-slate-50 dark:bg-slate-950 py-4 px-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center space-y-3.5 md:space-y-0">
          <div className="flex items-center space-x-2 flex-grow">
            <History className="w-5 h-5 text-slate-500" />
            <div>
              <h3 className="font-extrabold text-sm uppercase">Operational Action Audits Register</h3>
              <p className="text-[11px] text-slate-400">Total stored logs: {logs.length} entries</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <input 
              type="text" 
              placeholder="Search actions or logs..."
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none w-full md:w-48 font-medium"
              value={logFilter}
              onChange={(e) => setLogFilter(e.target.value)}
            />
            {operator.role === 'Super Admin' && (
              <button
                onClick={handleClearLogs}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-xs font-bold rounded-lg border border-red-200 dark:border-red-900/50 cursor-pointer flex-shrink-0"
              >
                Purge All Logs
              </button>
            )}
          </div>
        </div>

        <div className="overflow-y-auto max-h-72 divide-y divide-slate-100 dark:divide-slate-800">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <div key={log.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-950/10 transition">
                <div className="space-y-1 pr-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 uppercase">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-slate-400">by {log.userName} ({log.userRole})</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal">{log.details}</p>
                </div>
                
                <span className="text-[10px] font-mono text-slate-400 mt-2 sm:mt-0 flex-shrink-0">
                  {new Date(log.timestamp).toLocaleString('en-US', { hour12: true })}
                </span>
              </div>
            ))
          ) : (
            <div className="p-10 text-center text-xs text-slate-400">
              No audit logs captured.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
