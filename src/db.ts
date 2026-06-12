/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SeniorCitizen, ActivityLog, SeniorStatus, SeniorGender, AdminRole, DashboardStats } from './types';

// Simple robust synchronous PIN hasher
export function hashPIN(pin: string): string {
  let hash = 5381;
  const salted = "san-vicente-senior-system-" + pin;
  for (let i = 0; i < salted.length; i++) {
    hash = (hash * 33) ^ salted.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}

const DEFAULT_HASH = hashPIN("553752"); // default pin: 553752

// Help generate beautiful inline SVG avatars for seamless display
export function generateAvatarSvg(name: string, gender: string): string {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const isFemale = gender === 'Female';
  const bgColor = isFemale ? '#be185d' : '#1d4ed8'; // Pink-700 vs Blue-700
  const textColor = '#ffffff';
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <rect width="100" height="100" fill="${bgColor}"/>
    <circle cx="50" cy="40" r="22" fill="#f3f4f6" opacity="0.15"/>
    <path d="M22 85 C22 70, 35 60, 50 60 C65 60, 78 70, 78 85" fill="#f3f4f6" opacity="0.15"/>
    <text x="50" y="55" font-family="'Inter', sans-serif" font-weight="bold" font-size="28" fill="${textColor}" text-anchor="middle" dominant-baseline="middle">${initials}</text>
  </svg>`;
  
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// 10 realistic Philippine Senior Citizen profiles
const SEED_SENIORS: SeniorCitizen[] = [
  {
    id: "sc-01",
    fullName: "Juanito Dela Cruz Sr.",
    photo: "",
    birthDate: "1954-05-12",
    gender: "Male",
    sitio: "Sitio Centro",
    address: "042 M.H. Del Pilar Street, Sitio Centro, Barangay San Vicente",
    contactNumber: "09171234567",
    rrn: "RRN-2021-0042",
    pkn: "PKN-45129",
    oscaId: "OSCA-30214-SV",
    status: "Active",
    emergencyContact: {
      name: "Juanito Dela Cruz Jr.",
      relationship: "Son",
      contactNumber: "09187654321"
    },
    createdAt: "2021-03-15T09:00:00.000Z",
    updatedAt: "2025-10-12T14:30:00.000Z"
  },
  {
    id: "sc-02",
    fullName: "Maria Clara Santos",
    photo: "",
    birthDate: "1950-10-24",
    gender: "Female",
    sitio: "Sitio Pag-asa",
    address: "Block 5 Lot 12, Sitio Pag-asa, Barangay San Vicente",
    contactNumber: "09192345678",
    rrn: "RRN-2020-0115",
    pkn: "PKN-38291",
    oscaId: "OSCA-28941-SV",
    status: "Active",
    emergencyContact: {
      name: "Clarita Santos",
      relationship: "Daughter",
      contactNumber: "09204561234"
    },
    createdAt: "2020-11-02T10:15:00.000Z",
    updatedAt: "2026-01-20T08:45:00.000Z"
  },
  {
    id: "sc-03",
    fullName: "Catalino Macaraeg",
    photo: "",
    birthDate: "1938-02-05",
    gender: "Male",
    sitio: "Sitio Maligaya",
    address: "18 Rizal Lane, Sitio Maligaya, Barangay San Vicente",
    contactNumber: "09083456789",
    rrn: "RRN-2015-0008",
    pkn: "PKN-12004",
    oscaId: "OSCA-11048-SV",
    status: "Deceased",
    emergencyContact: {
      name: "Rosalinda Macaraeg",
      relationship: "Wife",
      contactNumber: "09081112233"
    },
    createdAt: "2015-04-10T11:00:00.000Z",
    updatedAt: "2026-03-01T15:20:00.000Z"
  },
  {
    id: "sc-04",
    fullName: "Evelyn Rey-Guiterrez",
    photo: "",
    birthDate: "1961-08-15",
    gender: "Female",
    sitio: "Sitio Dam",
    address: "A-12 Upper Area, Sitio Dam, Barangay San Vicente",
    contactNumber: "09219876543",
    rrn: "RRN-2023-0192",
    pkn: "PKN-52194",
    oscaId: "OSCA-41029-SV",
    status: "Active",
    emergencyContact: {
      name: "Arthur Gutierrez",
      relationship: "Husband",
      contactNumber: "09219876540"
    },
    createdAt: "2023-09-01T08:00:00.000Z",
    updatedAt: "2023-11-10T10:05:00.000Z"
  },
  {
    id: "sc-05",
    fullName: "Restituto Guinto",
    photo: "",
    birthDate: "1945-12-30",
    gender: "Male",
    sitio: "Sitio Tabing-Ilog",
    address: "08 Riverside Lane, Sitio Tabing-Ilog, Barangay San Vicente",
    contactNumber: "09325678901",
    rrn: "RRN-2018-4501",
    pkn: "PKN-23114",
    oscaId: "OSCA-20110-SV",
    status: "Active",
    emergencyContact: {
      name: "Leandro Guinto",
      relationship: "Son",
      contactNumber: "09324445556"
    },
    createdAt: "2018-01-20T14:30:00.000Z",
    updatedAt: "2025-05-15T11:12:00.000Z"
  },
  {
    id: "sc-06",
    fullName: "Paz Dimaguiba-Flores",
    photo: "",
    birthDate: "1956-04-03",
    gender: "Female",
    sitio: "Sitio Kawayan",
    address: "Purok 4, Sitio Kawayan, Barangay San Vicente",
    contactNumber: "09458901234",
    rrn: "RRN-2022-0051",
    pkn: "PKN-41920",
    oscaId: "OSCA-35612-SV",
    status: "Active",
    emergencyContact: {
      name: "Melvin Flores",
      relationship: "Son",
      contactNumber: "09457778888"
    },
    createdAt: "2022-05-18T16:20:00.000Z",
    updatedAt: "2024-08-12T09:30:00.000Z"
  },
  {
    id: "sc-07",
    fullName: "Francisco Balagtas",
    photo: "",
    birthDate: "1942-03-31",
    gender: "Male",
    sitio: "Sitio Riverside",
    address: "Sitio Riverside Area B, Barangay San Vicente",
    contactNumber: "09151239999",
    rrn: "RRN-2016-1182",
    pkn: "PKN-18902",
    oscaId: "OSCA-15601-SV",
    status: "Suspended",
    emergencyContact: {
      name: "Baltazar Balagtas",
      relationship: "Brother",
      contactNumber: "09159988776"
    },
    createdAt: "2016-08-11T11:30:00.000Z",
    updatedAt: "2026-04-10T14:15:00.000Z"
  },
  {
    id: "sc-08",
    fullName: "Leonora Rivera-Ramos",
    photo: "",
    birthDate: "1948-09-17",
    gender: "Female",
    sitio: "Sitio Centro",
    address: "24-B Jacinto Street, Sitio Centro, Barangay San Vicente",
    contactNumber: "09273456111",
    rrn: "RRN-2019-0902",
    pkn: "PKN-30124",
    oscaId: "OSCA-24510-SV",
    status: "Inactive",
    emergencyContact: {
      name: "Teresita Ramos",
      relationship: "Granddaughter",
      contactNumber: "09271112223"
    },
    createdAt: "2019-09-30T10:00:00.000Z",
    updatedAt: "2026-02-14T10:30:00.000Z"
  },
  {
    id: "sc-09",
    fullName: "Felipe Agoncillo",
    photo: "",
    birthDate: "1953-06-25",
    gender: "Male",
    sitio: "Sitio Pag-asa",
    address: "77 Pag-asa Avenue, Sitio Pag-asa, Barangay San Vicente",
    contactNumber: "09395123456",
    rrn: "RRN-2021-0422",
    pkn: "PKN-46721",
    oscaId: "OSCA-31845-SV",
    status: "Active",
    emergencyContact: {
      name: "Marcelo Agoncillo",
      relationship: "Son",
      contactNumber: "09394443322"
    },
    createdAt: "2021-07-28T09:40:00.000Z",
    updatedAt: "2024-11-05T13:20:00.000Z"
  },
  {
    id: "sc-10",
    fullName: "Gabriela Silang-Jose",
    photo: "",
    birthDate: "1940-01-19",
    gender: "Female",
    sitio: "Sitio Maligaya",
    address: "01 Katipunan Highway, Sitio Maligaya, Barangay San Vicente",
    contactNumber: "09264567890",
    rrn: "RRN-2015-0919",
    pkn: "PKN-15629",
    oscaId: "OSCA-12890-SV",
    status: "Active",
    emergencyContact: {
      name: "Diego Jose",
      relationship: "Grandson",
      contactNumber: "09267123456"
    },
    createdAt: "2015-10-10T14:00:00.000Z",
    updatedAt: "2025-12-18T10:15:00.000Z"
  }
];

const SEED_LOGS: ActivityLog[] = [
  {
    id: "log-01",
    timestamp: "2026-06-11T10:30:00.000Z",
    userId: "system",
    userRole: "Super Admin",
    userName: "System Administrator",
    action: "System Initialized",
    details: "Barangay San Vicente Senior Citizen Information System loaded with realistic Filipino demographics databases."
  },
  {
    id: "log-02",
    timestamp: "2026-06-11T14:15:32.000Z",
    userId: "staff-01",
    userRole: "Staff",
    userName: "Nida Garcia (Barangay Secretary)",
    action: "Verify Identity Search",
    details: "Performed verification query check on OSCA ID: OSCA-30214-SV for medical assistance claims."
  }
];

// LocalStorage helpers
const SENIORS_KEY = "bsv_senior_citizens";
const LOGS_KEY = "bsv_activity_logs";
const PIN_HASH_KEY = "bsv_pin_hash";

// Initialize Data Store
export function initDB(): void {
  if (!localStorage.getItem(SENIORS_KEY)) {
    // Fill empty photos with generated SVGs
    const customized = SEED_SENIORS.map(s => {
      if (!s.photo) {
        s.photo = generateAvatarSvg(s.fullName, s.gender);
      }
      return s;
    });
    localStorage.setItem(SENIORS_KEY, JSON.stringify(customized));
  }
  if (!localStorage.getItem(LOGS_KEY)) {
    localStorage.setItem(LOGS_KEY, JSON.stringify(SEED_LOGS));
  }
  if (!localStorage.getItem(PIN_HASH_KEY)) {
    localStorage.setItem(PIN_HASH_KEY, DEFAULT_HASH);
  }
}

// Age calculator
export function calculateAge(birthDateStr: string): number {
  if (!birthDateStr) return 0;
  const birthDate = new Date(birthDateStr);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// Get all seniors
export function getSeniors(): SeniorCitizen[] {
  initDB();
  const raw = localStorage.getItem(SENIORS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

// Create senior
export function createSenior(senior: Omit<SeniorCitizen, 'id' | 'createdAt' | 'updatedAt'>, operator: { name: string; role: AdminRole }): { success: boolean; error?: string; data?: SeniorCitizen } {
  initDB();
  const list = getSeniors();
  
  // Validation
  if (!senior.fullName.trim()) return { success: false, error: "Full Name is required" };
  if (!senior.birthDate) return { success: false, error: "Birth Date is required" };
  if (!senior.oscaId.trim()) return { success: false, error: "OSCA ID Number is required" };
  
  // Duplicate check
  const hasDupOsca = list.some(s => s.oscaId.toLowerCase() === senior.oscaId.trim().toLowerCase());
  if (hasDupOsca) return { success: false, error: `Duplicate detected: Senior with OSCA ID '${senior.oscaId}' is already registered.` };

  if (senior.rrn.trim()) {
    const hasDupRrn = list.some(s => s.rrn.toLowerCase() === senior.rrn.trim().toLowerCase());
    if (hasDupRrn) return { success: false, error: `Duplicate detected: Senior with RRN '${senior.rrn}' is already registered.` };
  }

  if (senior.pkn.trim()) {
    const hasDupPkn = list.some(s => s.pkn.toLowerCase() === senior.pkn.trim().toLowerCase());
    if (hasDupPkn) return { success: false, error: `Duplicate detected: Senior with PKN '${senior.pkn}' is already registered.` };
  }

  const finalPhoto = senior.photo || generateAvatarSvg(senior.fullName, senior.gender);
  
  const now = new Date().toISOString();
  const newMember: SeniorCitizen = {
    ...senior,
    id: "sc-" + Date.now(),
    photo: finalPhoto,
    fullName: senior.fullName.trim(),
    oscaId: senior.oscaId.trim(),
    rrn: senior.rrn.trim(),
    pkn: senior.pkn.trim(),
    createdAt: now,
    updatedAt: now
  };

  list.push(newMember);
  localStorage.setItem(SENIORS_KEY, JSON.stringify(list));

  // Log action
  logActivity(
    operator.role,
    operator.name,
    "Add Member",
    `Successfully added Senior Citizen: ${newMember.fullName} (OSCA-ID: ${newMember.oscaId}, Sitio: ${newMember.sitio})`
  );

  return { success: true, data: newMember };
}

// Update senior
export function updateSenior(id: string, updatedFields: Partial<SeniorCitizen>, operator: { name: string; role: AdminRole }): { success: boolean; error?: string; data?: SeniorCitizen } {
  initDB();
  const list = getSeniors();
  const index = list.findIndex(s => s.id === id);
  if (index === -1) return { success: false, error: "Senior record not found" };

  const current = list[index];
  
  // Duplicate OSCA / RRN / PKN checking
  if (updatedFields.oscaId && updatedFields.oscaId.toLowerCase() !== current.oscaId.toLowerCase()) {
    const hasDup = list.some(s => s.id !== id && s.oscaId.toLowerCase() === updatedFields.oscaId!.trim().toLowerCase());
    if (hasDup) return { success: false, error: `Duplicate detected: Another senior with OSCA ID '${updatedFields.oscaId}' already exists.` };
  }
  
  if (updatedFields.rrn && updatedFields.rrn.toLowerCase() !== current.rrn.toLowerCase()) {
    const hasDup = list.some(s => s.id !== id && s.rrn.toLowerCase() === updatedFields.rrn!.trim().toLowerCase());
    if (hasDup) return { success: false, error: `Duplicate detected: Another senior with RRN '${updatedFields.rrn}' already exists.` };
  }

  if (updatedFields.pkn && updatedFields.pkn.toLowerCase() !== current.pkn.toLowerCase()) {
    const hasDup = list.some(s => s.id !== id && s.pkn.toLowerCase() === updatedFields.pkn!.trim().toLowerCase());
    if (hasDup) return { success: false, error: `Duplicate detected: Another senior with PKN '${updatedFields.pkn}' already exists.` };
  }

  // Update photo default if name or gender changed and photo is standard SVG SVG
  let finalPhoto = updatedFields.photo !== undefined ? updatedFields.photo : current.photo;
  if (!finalPhoto && updatedFields.fullName) {
    finalPhoto = generateAvatarSvg(updatedFields.fullName, updatedFields.gender || current.gender);
  }

  const updated: SeniorCitizen = {
    ...current,
    ...updatedFields,
    photo: finalPhoto || current.photo,
    updatedAt: new Date().toISOString()
  };

  list[index] = updated;
  localStorage.setItem(SENIORS_KEY, JSON.stringify(list));

  // Log action
  logActivity(
    operator.role,
    operator.name,
    "Edit Member",
    `Modified credentials/details for Senior: ${updated.fullName} (${updated.oscaId})`
  );

  return { success: true, data: updated };
}

// Delete senior
export function deleteSenior(id: string, operator: { name: string; role: AdminRole }): { success: boolean; error?: string } {
  initDB();
  const list = getSeniors();
  const target = list.find(s => s.id === id);
  if (!target) return { success: false, error: "Senior record not found" };

  const filtered = list.filter(s => s.id !== id);
  localStorage.setItem(SENIORS_KEY, JSON.stringify(filtered));

  // Log action
  logActivity(
    operator.role,
    operator.name,
    "Delete Member",
    `Permanently deleted record of Senior Citizen: ${target.fullName} (OSCA-ID: ${target.oscaId})`
  );

  return { success: true };
}

// Validate PIN
export function checkPIN(pin: string): boolean {
  initDB();
  const storedHash = localStorage.getItem(PIN_HASH_KEY);
  return hashPIN(pin) === storedHash;
}

// Change PIN (Super Admin only check handled in UI)
export function changePIN(newPin: string, operatorName: string): boolean {
  if (newPin.length < 4) return false;
  const newHash = hashPIN(newPin);
  localStorage.setItem(PIN_HASH_KEY, newHash);
  
  logActivity(
    "Super Admin",
    operatorName,
    "Change Authorization PIN",
    "Security access PIN was modified and hashed in the central administrative register."
  );
  return true;
}

// Get activity logs
export function getActivityLogs(): ActivityLog[] {
  initDB();
  const raw = localStorage.getItem(LOGS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

// Add activity log
export function logActivity(userRole: AdminRole, userName: string, action: string, details: string): void {
  const logs = getActivityLogs();
  const newLog: ActivityLog = {
    id: "log-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
    timestamp: new Date().toISOString(),
    userId: userName.toLowerCase().replace(/\s+/g, '-'),
    userRole,
    userName,
    action,
    details
  };
  logs.unshift(newLog);
  // Cap at 200 logs for high responsiveness
  const trimmed = logs.slice(0, 200);
  localStorage.setItem(LOGS_KEY, JSON.stringify(trimmed));
}

// Clear activity logs (Super Admin option)
export function clearActivityLogs(operatorName: string): void {
  localStorage.setItem(LOGS_KEY, JSON.stringify([]));
  logActivity("Super Admin", operatorName, "Cleared Activity Logs", "All historical operational metrics and activity archives were purged.");
}

// Calculate Statistics
export function getStats(): DashboardStats {
  const seniors = getSeniors();
  const stats: DashboardStats = {
    totalSeniors: seniors.length,
    activeSeniors: 0,
    inactiveSeniors: 0,
    deceasedSeniors: 0,
    suspendedSeniors: 0,
    maleSeniors: 0,
    femaleSeniors: 0,
    otherSeniors: 0,
    ageGroups: {
      juniorSeniors: 0,
      middleSeniors: 0,
      elderSeniors: 0
    },
    sitioDistribution: {
      "Sitio Centro": 0,
      "Sitio Pag-asa": 0,
      "Sitio Maligaya": 0,
      "Sitio Dam": 0,
      "Sitio Tabing-Ilog": 0,
      "Sitio Kawayan": 0,
      "Sitio Riverside": 0
    }
  };

  seniors.forEach(s => {
    // Status counts
    if (s.status === 'Active') stats.activeSeniors++;
    else if (s.status === 'Inactive') stats.inactiveSeniors++;
    else if (s.status === 'Deceased') stats.deceasedSeniors++;
    else if (s.status === 'Suspended') stats.suspendedSeniors++;

    // Gender counts
    if (s.gender === 'Male') stats.maleSeniors++;
    else if (s.gender === 'Female') stats.femaleSeniors++;
    else stats.otherSeniors++;

    // Age calculation and buckets
    const age = calculateAge(s.birthDate);
    if (age >= 60 && age <= 69) stats.ageGroups.juniorSeniors++;
    else if (age >= 70 && age <= 79) stats.ageGroups.middleSeniors++;
    else if (age >= 80) stats.ageGroups.elderSeniors++;

    // Sitio counts
    const normalizedSitio = s.sitio || "Sitio Centro";
    if (stats.sitioDistribution[normalizedSitio] !== undefined) {
      stats.sitioDistribution[normalizedSitio]++;
    } else {
      stats.sitioDistribution[normalizedSitio] = 1;
    }
  });

  return stats;
}

// Backup system
export function backupSystemData(): string {
  const seniors = getSeniors();
  const logs = getActivityLogs();
  const pinHash = localStorage.getItem(PIN_HASH_KEY) || DEFAULT_HASH;
  const backupObject = {
    version: "1.0",
    extractedAt: new Date().toISOString(),
    seniors,
    logs,
    pinHash
  };
  return JSON.stringify(backupObject, null, 2);
}

// Restore system
export function restoreSystemData(jsonStr: string, operator: { name: string; role: AdminRole }): { success: boolean; error?: string; recordCount?: number } {
  try {
    const data = JSON.parse(jsonStr);
    if (!data.seniors || !Array.isArray(data.seniors)) {
      return { success: false, error: "Invalid backup file: 'seniors' table is missing." };
    }
    
    // Validate schema basic checks
    const records: SeniorCitizen[] = data.seniors;
    for (const s of records) {
      if (!s.fullName || !s.birthDate || !s.oscaId) {
        return { success: false, error: "Invalid backup format: individual record validation failed." };
      }
    }

    localStorage.setItem(SENIORS_KEY, JSON.stringify(data.seniors));
    if (data.logs && Array.isArray(data.logs)) {
      localStorage.setItem(LOGS_KEY, JSON.stringify(data.logs));
    }
    if (data.pinHash) {
      localStorage.setItem(PIN_HASH_KEY, data.pinHash);
    }
    
    logActivity(
      operator.role,
      operator.name,
      "Restore Database",
      `System restoration database executed. Loaded ${records.length} Senior records and system parameters successfully.`
    );
    
    return { success: true, recordCount: records.length };
  } catch (e: any) {
    return { success: false, error: "Failed to parse JSON file: " + e.message };
  }
}
