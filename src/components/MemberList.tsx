/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SeniorCitizen, SeniorGender, SeniorStatus, AdminRole } from '../types';
import { getSeniors, deleteSenior, calculateAge } from '../db';
import { jsPDF } from 'jspdf';
import ExcelJS from 'exceljs';
import { 
  Plus, Search, Edit, Eye, Trash2, Printer, Filter, ChevronDown, 
  Download, Upload, FileSpreadsheet, FileJson, AlertCircle, CheckCircle, Trash
} from 'lucide-react';

interface MemberListProps {
  onAddClick: () => void;
  onEditClick: (id: string) => void;
  onPrintClick: (senior: SeniorCitizen) => void;
  operator: { name: string; role: AdminRole };
  triggerRefreshToggle: boolean;
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

export default function MemberList({ onAddClick, onEditClick, onPrintClick, operator, triggerRefreshToggle, darkMode }: MemberListProps) {
  const [seniors, setSeniors] = useState<SeniorCitizen[]>([]);
  const [filtered, setFiltered] = useState<SeniorCitizen[]>([]);
  
  // Filtering and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sitioFilter, setSitioFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name' | 'age' | 'createdAt'>('name');

  // CSV Import States
  const [importPreview, setImportPreview] = useState<any[] | null>(null);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importFile, setImportFile] = useState<File | null>(null);

  // Load seniors list
  useEffect(() => {
    setSeniors(getSeniors());
  }, [triggerRefreshToggle]);

  // Execute sorting and filtering
  useEffect(() => {
    let result = [...seniors];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(s => 
        s.fullName.toLowerCase().includes(q) ||
        s.oscaId.toLowerCase().includes(q) ||
        (s.rrn && s.rrn.toLowerCase().includes(q)) ||
        (s.pkn && s.pkn.toLowerCase().includes(q))
      );
    }

    // Gender filter
    if (genderFilter !== 'All') {
      result = result.filter(s => s.gender === genderFilter);
    }

    // Status filter
    if (statusFilter !== 'All') {
      result = result.filter(s => s.status === statusFilter);
    }

    // Sitio filter
    if (sitioFilter !== 'All') {
      result = result.filter(s => s.sitio === sitioFilter);
    }

    // Sorting
    if (sortBy === 'name') {
      result.sort((a, b) => a.fullName.localeCompare(b.fullName));
    } else if (sortBy === 'age') {
      result.sort((a, b) => calculateAge(b.birthDate) - calculateAge(a.birthDate));
    } else if (sortBy === 'createdAt') {
      result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }

    setFiltered(result);
  }, [seniors, searchQuery, genderFilter, statusFilter, sitioFilter, sortBy]);

  // Delete Handler
  const handleDelete = (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete the profile of Senior Citizen: ${name}?`)) return;
    const res = deleteSenior(id, operator);
    if (res.success) {
      setSeniors(getSeniors());
    } else {
      alert(res.error || "Failed to delete record.");
    }
  };

  // CSV Template Downloader
  const handleDownloadTemplate = () => {
    const csvContent = 
      "Full Name,Birth Date (YYYY-MM-DD),Gender (Male/Female),Sitio,Address,Contact Number,RRN Number,PKN Number,OSCA ID Number,Emergency Contact Name,Emergency Contact Relationship,Emergency Contact Number\r\n" +
      "Nicanor Dela Cruz Reyes,1960-12-15,Male,Sitio Centro,014 Gen. Luna St. Sitio Centro Barangay San Vicente,09151112222,RRN-2026-9051,PKN-10452,OSCA-95104-SV,Maria Reyes,Daughter,09151112220\r\n" +
      "Remedios Santos-Gomez,1955-06-20,Female,Sitio Maligaya,Block 2 Lot 8 Sitio Maligaya Barangay San Vicente,09172223333,RRN-2026-1188,PKN-20155,OSCA-11024-SV,Nicanor Gomez,Husband,09172223331\r\n";
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'BSV_Senior_Citizens_Import_Template.csv');
    link.click();
    URL.revokeObjectURL(url);
  };

  // CSV Parser
  const handleCSVUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/);
    if (lines.length < 2) {
      alert("Invalid CSV: The uploaded file has zero headers or rows.");
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const parsedRows: any[] = [];
    const errors: string[] = [];
    const existingList = getSeniors();

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Simple CSV split with quotes support
      const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
      const cells = matches.map(c => c.replace(/^"|"$/g, '').trim());

      if (cells.length < 9) {
        errors.push(`Row ${i + 1}: Missing critical columns. Must contain Name, DOB, Gender, Sitio, Address, and IDs.`);
        continue;
      }

      const rowName = cells[0];
      const rowDob = cells[1];
      const rowGender = cells[2];
      const rowSitio = cells[3];
      const rowAddress = cells[4];
      const rowContact = cells[5] || '';
      const rowRrn = cells[6] || '';
      const rowPkn = cells[7] || '';
      const rowOsca = cells[8] || '';
      const rowEmergName = cells[9] || '';
      const rowEmergRel = cells[10] || '';
      const rowEmergContact = cells[11] || '';

      // Record Validation
      const rowErrors: string[] = [];
      if (!rowName) rowErrors.push("Missing Full Name.");
      if (!rowDob || isNaN(Date.parse(rowDob))) rowErrors.push("Invalid Birth Date format (Expected: YYYY-MM-DD).");
      if (!rowOsca) rowErrors.push("Missing OSCA ID.");
      if (rowGender !== 'Male' && rowGender !== 'Female') rowErrors.push("Gender must be 'Male' or 'Female'.");
      if (!SITIOS.includes(rowSitio)) rowErrors.push(`Invalid Sitio. Must reside in: [${SITIOS.join(', ')}].`);

      // Duplicate Key Checks (Database alignment)
      const dupOsca = existingList.some(s => s.oscaId.toLowerCase() === rowOsca.toLowerCase());
      if (dupOsca) rowErrors.push(`OSCA ID '${rowOsca}' already exists in registry database.`);

      if (rowRrn) {
        const dupRrn = existingList.some(s => s.rrn.toLowerCase() === rowRrn.toLowerCase());
        if (dupRrn) rowErrors.push(`RRN Number '${rowRrn}' already exists in registry database.`);
      }

      parsedRows.push({
        fullName: rowName,
        birthDate: rowDob,
        gender: rowGender,
        sitio: rowSitio,
        address: rowAddress || `Sitio ${rowSitio}, Barangay San Vicente`,
        contactNumber: rowContact,
        rrn: rowRrn,
        pkn: rowPkn,
        oscaId: rowOsca,
        emergencyContact: {
          name: rowEmergName,
          relationship: rowEmergRel || 'Other',
          contactNumber: rowEmergContact
        },
        hasErrors: rowErrors.length > 0,
        errors: rowErrors
      });
    }

    setImportPreview(parsedRows);
    setImportErrors(errors);
  };

  // Save imported members to database
  const handleConfirmImport = () => {
    if (!importPreview) return;
    
    const validRows = importPreview.filter(r => !r.hasErrors);
    if (validRows.length === 0) {
      alert("No valid records found in the import spreadsheet. Correct errors and re-upload.");
      return;
    }

    const currentSeniors = getSeniors();
    const now = new Date().toISOString();
    
    const mapped: SeniorCitizen[] = validRows.map((r, index) => ({
      id: "sc-imported-" + Date.now() + "-" + index,
      photo: `data:image/svg+xml;utf8,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
          <rect width="100" height="100" fill="${r.gender === 'Female' ? '#be185d' : '#1d4ed8'}"/>
          <text x="50" y="55" font-family="sans-serif" font-weight="bold" font-size="28" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${r.fullName.split(' ').map((n:any)=>n[0]).join('').slice(0,2).toUpperCase()}</text>
        </svg>`
      )}`,
      fullName: r.fullName,
      birthDate: r.birthDate,
      gender: r.gender,
      sitio: r.sitio,
      address: r.address,
      contactNumber: r.contactNumber,
      rrn: r.rrn,
      pkn: r.pkn,
      oscaId: r.oscaId,
      status: 'Active',
      emergencyContact: r.emergencyContact,
      createdAt: now,
      updatedAt: now
    }));

    const combined = [...currentSeniors, ...mapped];
    localStorage.setItem("bsv_senior_citizens", JSON.stringify(combined));
    
    // Log Activity
    const logList = JSON.parse(localStorage.getItem("bsv_activity_logs") || '[]');
    logList.unshift({
      id: "log-" + Date.now(),
      timestamp: now,
      userId: operator.name.toLowerCase().replace(/\s+/g, '-'),
      userRole: operator.role,
      userName: operator.name,
      action: "Bulk Excel/CSV Import",
      details: `Injected ${mapped.length} verified records into Barangay San Vicente registry ledger.`
    });
    localStorage.setItem("bsv_activity_logs", JSON.stringify(logList));

    alert(`Successfully registered ${mapped.length} citizens! ${importPreview.length - validRows.length} rows were omitted due to duplicate credentials or validation gaps.`);
    setImportPreview(null);
    setImportFile(null);
    setSeniors(getSeniors());
  };

  // EXPORTS
  // 1. Export CSV
  const handleExportCSV = () => {
    let csv = "Full Name,Birth Date,Gender,Age,Sitio,Address,Contact,RRN,PKN,OSCA ID,Emergency Persona,Emergency Contact\r\n";
    filtered.forEach(s => {
      csv += `"${s.fullName}","${s.birthDate}","${s.gender}",${calculateAge(s.birthDate)},"${s.sitio}","${s.address}","${s.contactNumber}","${s.rrn}","${s.pkn}","${s.oscaId}","${s.emergencyContact.name}","${s.emergencyContact.contactNumber}"\r\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Barangay_San_Vicente_Seniors_${new Date().toISOString().slice(0,10)}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  };

  // 2. Export Excel (via ExcelJS package)
  const handleExportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Seniors Registry');

    // Title Row
    sheet.mergeCells('A1:J1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = 'BARANGAY SAN VICENTE SENIOR CITIZENS OFFICIAL REGISTRY';
    titleCell.font = { name: 'Arial', family: 4, size: 14, bold: true, color: { argb: 'FFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E3A8A' } };
    titleCell.alignment = { horizontal: 'center' };

    sheet.getRow(2).values = ['Generated on: ' + new Date().toLocaleDateString() + ' • Status Check: Active Active Registered'];
    sheet.getRow(2).font = { italic: true, size: 10 };

    sheet.addRow([]); // Blank spacer

    // Table Headers
    const headers = ['Full Name', 'Birth Date', 'Age', 'Gender', 'Zone Sitio', 'Phone', 'RRN Number', 'PKN Number', 'OSCA ID', 'Status'];
    sheet.addRow(headers);

    // Header styling
    sheet.getRow(4).font = { bold: true, color: { argb: 'FFFFFF' } };
    sheet.getRow(4).eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } };
    });

    // Add rows
    filtered.forEach(s => {
      sheet.addRow([
        s.fullName,
        s.birthDate,
        calculateAge(s.birthDate),
        s.gender,
        s.sitio,
        s.contactNumber || 'N/A',
        s.rrn || 'N/A',
        s.pkn || 'N/A',
        s.oscaId,
        s.status
      ]);
    });

    // Formatting column widths
    sheet.columns.forEach(col => { col.width = 16; });
    sheet.getColumn(1).width = 25; // Name wider
    sheet.getColumn(5).width = 18; // Sitio

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Brgy_San_Vicente_Seniors_${new Date().toISOString().slice(0,10)}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 3. Export PDF (via jsPDF package)
  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', format: 'a4' });
    
    // Custom borders
    doc.setDrawColor(30, 58, 138); // blue
    doc.setLineWidth(1.5);
    doc.line(10, 10, 287, 10);
    doc.line(10, 200, 287, 200);

    // Decorative Header Seal details
    doc.setFontSize(18);
    doc.setTextColor(30, 58, 138); // blue
    doc.setFont("Helvetica", "bold");
    doc.text("BARANGAY SAN VICENTE SENIOR CITIZENS GENERAL DIRECTORY", 15, 22);
    
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.setFont("Helvetica", "normal");
    doc.text(`Cabuyao, Laguna • Municipal Social Security Register • Registry count: ${filtered.length} profiles`, 15, 27);
    doc.text(`Official Export Timestamp: ${new Date().toLocaleString()}`, 210, 27);

    // Table drawer lines
    doc.setDrawColor(200);
    doc.setLineWidth(0.3);
    doc.line(15, 30, 282, 30); // top border line

    // Header values
    doc.setFontSize(9);
    doc.setTextColor(0);
    doc.setFont("Helvetica", "bold");
    doc.text("Full Name", 15, 35);
    doc.text("DOB", 78, 35);
    doc.text("Age", 98, 35);
    doc.text("Gender", 110, 35);
    doc.text("Sitio Zone", 128, 35);
    doc.text("RRN Registry No.", 160, 35);
    doc.text("OSCA ID", 210, 35);
    doc.text("Status", 260, 35);

    doc.line(15, 38, 282, 38); // Header divider line

    // Row loop
    let y = 44;
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8.5);

    filtered.forEach((s) => {
      if (y > 185) {
        doc.addPage();
        
        doc.setDrawColor(30, 58, 138);
        doc.setLineWidth(1.5);
        doc.line(10, 10, 287, 10);
        doc.line(10, 200, 287, 200);

        // Subheaders on new page
        doc.setFontSize(10);
        doc.setTextColor(30, 58, 138);
        doc.setFont("Helvetica", "bold");
        doc.text("BARANGAY SAN VICENTE SENior DIRECTORY - CONTINUED", 15, 22);
        
        doc.setDrawColor(200);
        doc.setLineWidth(0.3);
        doc.line(15, 30, 282, 30);
        y = 36;
      }

      doc.setFont("Helvetica", "bold");
      doc.text(s.fullName.slice(0, 32).toUpperCase(), 15, y);
      
      doc.setFont("Helvetica", "normal");
      doc.text(s.birthDate, 78, y);
      doc.text(calculateAge(s.birthDate).toString(), 98, y);
      doc.text(s.gender, 110, y);
      doc.text(s.sitio, 128, y);
      doc.text(s.rrn || 'N/A', 160, y);
      doc.text(s.oscaId, 210, y);
      doc.text(s.status, 260, y);

      doc.line(15, y+2, 282, y+2); // row divider
      y += 8;
    });

    doc.save(`BSV_Seniors_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  return (
    <div className="space-y-6">
      
      {/* CSV Import Modal View (Shown if active preview has rows) */}
      {importPreview && (
        <div className="p-6 bg-[#fffbeb] dark:bg-amber-950/20 border-2 border-amber-300 rounded-2xl space-y-4 text-left shadow-lg animate-fade-in text-slate-800 dark:text-slate-200">
          <div className="flex justify-between items-center pb-2 border-b border-amber-200 dark:border-amber-900/40">
            <h3 className="font-extrabold text-amber-900 dark:text-amber-400 text-sm uppercase flex items-center space-x-2">
              <Upload className="w-5 h-5" />
              <span>Validate CSV Import Dossier</span>
            </h3>
            <button 
              onClick={() => { setImportPreview(null); setImportFile(null); }}
              className="p-1 px-3 bg-red-600 hover:bg-red-700 text-white rounded font-bold cursor-pointer text-xs uppercase"
            >
              Discard File
            </button>
          </div>

          <p className="text-xs">
            Review parsed list profiles. Valid rows (marked with <span className="font-bold text-green-600">Green check</span>) will inject into Barangay ledgers. Rows with <span className="font-bold text-red-600">Red alerts</span> should be resolved.
          </p>

          <div className="overflow-x-auto max-h-56 border rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
            <table className="w-full text-xs">
              <thead className="bg-slate-100 dark:bg-slate-950 text-slate-500 font-bold uppercase">
                <tr>
                  <th className="p-2.5 text-left">Status</th>
                  <th className="p-2.5 text-left">Full Name</th>
                  <th className="p-2.5 text-left">OSCA ID</th>
                  <th className="p-2.5 text-left">Sitio</th>
                  <th className="p-2.5 text-left">RRN</th>
                  <th className="p-2.5 text-left">Validation Advisory Logs</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {importPreview.map((row, idx) => (
                  <tr key={idx} className={row.hasErrors ? 'bg-red-50/50 dark:bg-red-950/10' : 'hover:bg-slate-50'}>
                    <td className="p-2.5">
                      {row.hasErrors ? (
                        <span className="text-red-600 font-bold flex items-center space-x-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Advisory</span>
                        </span>
                      ) : (
                        <span className="text-green-600 font-bold flex items-center space-x-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Valid</span>
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 font-bold uppercase">{row.fullName}</td>
                    <td className="p-2.5 font-mono font-bold">{row.oscaId}</td>
                    <td className="p-2.5">{row.sitio}</td>
                    <td className="p-2.5 font-mono">{row.rrn || 'N/A'}</td>
                    <td className="p-2.5 text-red-600 text-[10px] max-w-xs truncate font-bold">
                      {row.hasErrors ? row.errors.join(' | ') : 'Passed Check.'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="font-bold">
              Total found: {importPreview.length} | Valid: {importPreview.filter(r=>!r.hasErrors).length} rows.
            </span>
            <button
              onClick={handleConfirmImport}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-5 py-2 rounded-lg cursor-pointer transition uppercase text-xs"
            >
              Authorize Import to Registry Ledger
            </button>
          </div>
        </div>
      )}

      {/* Main Records controls area */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        
        {/* Actions line (Add member, Export, and template downloads) */}
        <div className="flex flex-col xl:flex-row justify-between items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          
          <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto">
            <button
              id="enroll-btn"
              onClick={onAddClick}
              className="bg-[#1e3a8a] text-white hover:bg-blue-800 active:bg-blue-900 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition transform active:scale-95 flex items-center space-x-2 cursor-pointer w-full sm:w-auto justify-center"
            >
              <Plus className="w-4.5 h-4.5" />
              <span>Enroll Senior Citizen</span>
            </button>

            {/* CSV Template trigger download */}
            <button
              onClick={handleDownloadTemplate}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-755 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase transition flex items-center space-x-2 justify-center w-full sm:w-auto cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Import CSV Template</span>
            </button>
            
            {/* Import upload file trigger */}
            <div className="relative w-full sm:w-auto">
              <button
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-755 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase transition flex items-center space-x-1.5 justify-center w-full cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Member CSV</span>
              </button>
              <input 
                type="file" 
                accept=".csv"
                onChange={handleCSVUploadChange}
                className="absolute inset-0 opacity-0 cursor-pointer" 
              />
            </div>
          </div>

          {/* Exporters and table layout selectors */}
          <div className="flex flex-wrap items-center justify-end gap-2.5 w-full xl:w-auto font-sans">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Export Registry:</span>
            
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 bg-slate-50 border hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-extrabold rounded-lg flex items-center space-x-1 cursor-pointer transition text-slate-700 dark:text-slate-300"
            >
              <span>CSV</span>
            </button>

            <button
              id="export-excel-btn"
              onClick={handleExportExcel}
              className="px-3 py-2 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded-lg flex items-center space-x-1.5 cursor-pointer transition shadow-sm"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Excel</span>
            </button>

            <button
              id="export-pdf-btn"
              onClick={handleExportPDF}
              className="px-3 py-2 bg-red-50 border border-red-200 hover:bg-red-100 text-red-800 text-xs font-extrabold rounded-lg flex items-center space-x-1.5 cursor-pointer transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF Ledger</span>
            </button>
          </div>

        </div>

        {/* Searching and Filter grids */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-4 text-left">
          
          {/* Searching string bar */}
          <div className="md:col-span-2 relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </span>
            <input
              type="text"
              id="search-input"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:border-blue-600 focus:outline-none placeholder-slate-400 font-semibold"
              placeholder="Search by Name, OSCA, PKN, RRN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Gender Filter option */}
          <div>
            <select
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-600 dark:text-slate-300 focus:outline-none"
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
            >
              <option value="All">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Sitio Filter option */}
          <div>
            <select
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-600 dark:text-slate-300 focus:outline-none"
              value={sitioFilter}
              onChange={(e) => setSitioFilter(e.target.value)}
            >
              <option value="All">All Sitios (Zones)</option>
              {SITIOS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Status Filter option */}
          <div>
            <select
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-600 dark:text-slate-300 focus:outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status Classes</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
              <option value="Deceased">Deceased</option>
            </select>
          </div>

          {/* Sorters and metrics display summary */}
          <div className="md:col-span-4 flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 text-[11px] font-bold">
            <span className="text-slate-400">Showing {filtered.length} of {seniors.length} Registered Citizen Ledgers</span>
            
            <div className="flex items-center space-x-2 text-slate-500">
              <span>Sort by:</span>
              <button 
                onClick={() => setSortBy('name')}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${sortBy === 'name' ? 'bg-[#1e3a8a] text-white' : 'hover:bg-slate-100'}`}
              >
                Name
              </button>
              <button 
                onClick={() => setSortBy('age')}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${sortBy === 'age' ? 'bg-[#1e3a8a] text-white' : 'hover:bg-slate-100'}`}
              >
                Age
              </button>
              <button 
                onClick={() => setSortBy('createdAt')}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${sortBy === 'createdAt' ? 'bg-[#1e3a8a] text-white' : 'hover:bg-slate-100'}`}
              >
                Recently Added
              </button>
            </div>
          </div>

        </div>

        {/* Members registry table list */}
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
          <table className="w-full text-sm">
            <thead className="bg-[#1e3a8a] text-white text-[11px] uppercase tracking-wider font-extrabold text-left">
              <tr>
                <th className="p-3.5">Identification</th>
                <th className="p-3.5">Citizen Directory Details</th>
                <th className="p-3.5 text-center">Age (DOB)</th>
                <th className="p-3.5">Sitio Territory</th>
                <th className="p-3.5">Registry Referrals IDs</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Management Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-left">
              {filtered.length > 0 ? (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-950/20 transition-all font-medium">
                    
                    {/* ID / Photo */}
                    <td className="p-3.5">
                      <div className="flex items-center space-x-3.5">
                        <img 
                          src={s.photo} 
                          alt={s.fullName} 
                          className="w-12 h-12 rounded-full object-cover border bg-slate-150"
                        />
                        <div className="leading-tight">
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">OSCA ID CARD</p>
                          <p className="font-mono text-sm font-black text-[#1e3a8a] dark:text-blue-400">{s.oscaId}</p>
                        </div>
                      </div>
                    </td>

                    {/* Personal Name / Details */}
                    <td className="p-3.5">
                      <div className="leading-normal">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-1">{s.fullName}</h4>
                        <p className="text-xs text-slate-400 font-bold uppercase">{s.gender}</p>
                        {s.contactNumber && <p className="text-[11px] font-mono text-slate-500 mt-1">Ph: {s.contactNumber}</p>}
                      </div>
                    </td>

                    {/* Calculated age list */}
                    <td className="p-3.5 text-center">
                      <div className="leading-snug">
                        <span className="text-sm font-black tracking-tight">{calculateAge(s.birthDate)} yrs old</span>
                        <p className="text-[10px] text-slate-400 font-semibold">{s.birthDate}</p>
                      </div>
                    </td>

                    {/* Sitio Zone address */}
                    <td className="p-3.5">
                      <div className="leading-tight text-xs uppercase">
                        <p className="font-extrabold text-[#1a5f7a] dark:text-blue-400">{s.sitio}</p>
                        <p className="text-[10px] text-slate-400 leading-tight mt-1 line-clamp-1 max-w-[140px] truncate">{s.address}</p>
                      </div>
                    </td>

                    {/* Unique Registry referrals number column */}
                    <td className="p-3.5">
                      <div className="leading-normal font-mono text-[10px]">
                        <p><span className="text-slate-400 text-[8px] uppercase font-bold tracking-wider mr-1">RRN:</span> <span className="font-bold text-slate-800 dark:text-slate-200">{s.rrn || 'N/A'}</span></p>
                        <p><span className="text-slate-400 text-[8px] uppercase font-bold tracking-wider mr-1">PKN:</span> <span className="font-bold text-slate-800 dark:text-slate-200">{s.pkn || 'N/A'}</span></p>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="p-3.5 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider ${
                        s.status === 'Active' ? 'bg-emerald-100 text-emerald-800 dark:bg-green-950/40 dark:text-green-300' :
                        s.status === 'Inactive' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' :
                        s.status === 'Suspended' ? 'bg-amber-100 text-amber-800 dark:bg-yellow-950/40 dark:text-yellow-300' :
                        'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300'
                      }`}>
                        {s.status}
                      </span>
                    </td>

                    {/* Edit delete Print controls */}
                    <td className="p-3.5 text-center">
                      <div className="flex justify-center items-center gap-1.5 font-bold uppercase text-[10px]">
                        
                        {/* Print Card card */}
                        <button
                          title="Print ID Card and dossier details"
                          onClick={() => onPrintClick(s)}
                          className="p-2 bg-blue-50 hover:bg-blue-100 text-[#1e3a8a] dark:bg-blue-950/30 dark:hover:bg-blue-950/60 dark:text-blue-400 rounded-lg cursor-pointer transition border border-blue-100 dark:border-blue-900/30"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {/* Edit profile */}
                        <button
                          title="Modify Citizen credentials"
                          onClick={() => onEditClick(s.id)}
                          className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-900 dark:bg-yellow-950/30 dark:hover:bg-yellow-950/60 dark:text-yellow-400 rounded-lg cursor-pointer transition border border-amber-100 dark:border-yellow-900/30"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Delete entry */}
                        <button
                          title="Permanently Expunge record file"
                          onClick={() => handleDelete(s.id, s.fullName)}
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/30 dark:hover:bg-red-950/60 dark:text-red-400 rounded-lg cursor-pointer transition border border-red-200 dark:border-red-900/30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-xs text-slate-400">
                    No matching Senior Citizen records located in active indices. Try adjusting search queries or filter values.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
