/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SeniorStatus = 'Active' | 'Inactive' | 'Deceased' | 'Suspended';
export type SeniorGender = 'Male' | 'Female' | 'Other';
export type AdminRole = 'Super Admin' | 'Staff';

export interface EmergencyContact {
  name: string;
  relationship: string;
  contactNumber: string;
}

export interface SeniorCitizen {
  id: string;
  photo: string; // Base64 data-URL or path
  fullName: string;
  birthDate: string; // YYYY-MM-DD
  gender: SeniorGender;
  sitio: string; // Barangay San Vicente sitios: Sitio Centro, Sitio Pag-asa, Sitio Maligaya, Sitio Dam, Sitio Tabing-Ilog, Sitio Kawayan, Sitio Riverside, etc.
  address: string; // Complete address details
  contactNumber: string;
  rrn: string; // Registry Reference Number
  pkn: string; // Pangkat Kasapi Number
  oscaId: string; // OSCA ID Number
  status: SeniorStatus;
  emergencyContact: EmergencyContact;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  userRole: AdminRole;
  userName: string;
  action: string; // e.g. "Create Senior Citizen ID: OSCA-123", "Modify PIN", "Backup Database"
  details: string;
}

export interface SystemSettings {
  pinHash: string; // Hashed PIN (saved in localStorage)
  supabaseUrl: string;
  supabaseAnonKey: string;
  isSupabaseConnected: boolean;
}

export interface DashboardStats {
  totalSeniors: number;
  activeSeniors: number;
  inactiveSeniors: number;
  deceasedSeniors: number;
  suspendedSeniors: number;
  maleSeniors: number;
  femaleSeniors: number;
  otherSeniors: number;
  ageGroups: {
    juniorSeniors: number; // 60-69
    middleSeniors: number; // 70-79
    elderSeniors: number; // 80+
  };
  sitioDistribution: Record<string, number>;
}
