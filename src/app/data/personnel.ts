/**
 * Mock Personnel records for the Bedlam Physical Therapy tenant.
 * Shape is indicative only (PRD §7): discipline/location assignment already exists
 * on the personnel profile; the grid only surfaces it.
 */
export type PersonnelStatus = 'Active' | 'Inactive';
export type SystemAccess = 'System Access' | 'Yet to Login' | 'Invite Sent' | 'No Access';
export type PersonnelRole =
  | 'Site Admin'
  | 'Location Coordinator'
  | 'Discipline Coordinator'
  | 'Location-Discipline Coordinator'
  | 'Preceptor'
  | 'Clinical Instructor';

export interface PersonnelRecord {
  id: string;
  name: string;
  role: PersonnelRole;
  access: SystemAccess;
  email: string;
  disciplines: string[];
  locations: string[];
  designation: string | null;
  lastLogin: string | null;
  status: PersonnelStatus;
}

export const DISCIPLINES = [
  'Physical Therapy',
  'Occupational Therapy',
  'Speech-Language Pathology',
  'Athletic Training',
  'Nursing',
  'Radiologic Technology',
  'Respiratory Therapy',
  'Cardiology Department',
];

export const LOCATIONS = [
  'Bedlam PT – Downtown',
  'Bedlam PT – Riverside',
  'Bedlam PT – Uptown',
  'Bedlam PT – Westside',
  'Bedlam PT – Eastgate',
  'Bedlam PT – Lakeside',
];

export const ROLES: PersonnelRole[] = [
  'Site Admin',
  'Location Coordinator',
  'Discipline Coordinator',
  'Location-Discipline Coordinator',
  'Preceptor',
  'Clinical Instructor',
];
export const STATUSES: PersonnelStatus[] = ['Active', 'Inactive'];
export const ACCESS: SystemAccess[] = ['System Access', 'Yet to Login', 'Invite Sent', 'No Access'];
export const DESIGNATIONS = [
  'Group Head',
  'Senior Physical Therapist',
  'Clinical Manager',
  'Rehab Director',
  'Staff Therapist',
  'Education Coordinator',
];

const D = DISCIPLINES;
const L = LOCATIONS;

type Seed = [string, PersonnelRole, SystemAccess, string[], string[], string | null, string | null, PersonnelStatus];

const seeds: Seed[] = [
  ['Ajay Mishra', 'Location Coordinator', 'System Access', [D[0]], [L[0]], null, 'Jul 30, 2026, 03:13 PM', 'Active'],
  ['Alex Philips', 'Location Coordinator', 'System Access', [D[1], D[0]], [L[1]], null, 'Sep 15, 2026, 07:21 PM', 'Active'],
  ['Alex Brad', 'Discipline Coordinator', 'No Access', [D[3]], [L[2]], 'Group Head', null, 'Active'],
  ['admin test mailinator', 'Site Admin', 'Yet to Login', [D[2], D[7]], [L[3], L[0], L[1]], null, null, 'Active'],
  ['Amit Roman', 'Discipline Coordinator', 'No Access', [D[1]], [L[0]], 'Senior Physical Therapist', null, 'Active'],
  ['admin18 site', 'Site Admin', 'System Access', [D[0]], [L[1]], null, 'Aug 7, 2025, 03:53 PM', 'Inactive'],
  ['Priya Nair', 'Location-Discipline Coordinator', 'System Access', [D[0], D[1]], [L[0], L[4]], 'Clinical Manager', 'Oct 26, 2026, 10:02 AM', 'Active'],
  ['Marcus Hill', 'Location Coordinator', 'System Access', [], [L[2]], 'Rehab Director', 'Oct 22, 2026, 04:40 PM', 'Active'],
  ['Sofia Alvarez', 'Preceptor', 'Invite Sent', [D[4]], [L[5]], 'Staff Therapist', null, 'Active'],
  ['Daniel Kim', 'Clinical Instructor', 'System Access', [D[5], D[6]], [L[3]], 'Staff Therapist', 'Oct 20, 2026, 09:15 AM', 'Active'],
  ['Hannah Cole', 'Site Admin', 'System Access', [], [], null, 'Oct 27, 2026, 08:30 AM', 'Active'],
  ['Rohan Mehta', 'Discipline Coordinator', 'Yet to Login', [D[2]], [], 'Education Coordinator', null, 'Active'],
  ['Elena Petrova', 'Preceptor', 'System Access', [D[0]], [L[0], L[1], L[2], L[3]], 'Senior Physical Therapist', 'Oct 18, 2026, 02:11 PM', 'Active'],
  ['Tomás Rivera', 'Location Coordinator', 'No Access', [D[3], D[0]], [L[4]], null, null, 'Active'],
  ['Grace Lin', 'Clinical Instructor', 'System Access', [D[1]], [L[1]], 'Staff Therapist', 'Oct 25, 2026, 11:48 AM', 'Active'],
  ['Omar Haddad', 'Location-Discipline Coordinator', 'System Access', [D[7]], [L[3]], 'Clinical Manager', 'Oct 24, 2026, 01:05 PM', 'Active'],
  ['Naomi Brooks', 'Preceptor', 'Invite Sent', [D[6]], [L[5]], 'Staff Therapist', null, 'Active'],
  ['Victor Osei', 'Site Admin', 'System Access', [], [], 'Rehab Director', 'Oct 28, 2026, 07:55 AM', 'Active'],
  ['Layla Farouk', 'Discipline Coordinator', 'System Access', [D[4], D[5], D[6], D[0]], [L[0]], 'Education Coordinator', 'Oct 12, 2026, 03:33 PM', 'Active'],
  ['Ben Carter', 'Location Coordinator', 'Yet to Login', [D[0]], [L[2], L[3]], null, null, 'Active'],
  ['Mei Tanaka', 'Clinical Instructor', 'System Access', [D[2]], [L[4]], 'Staff Therapist', 'Oct 19, 2026, 05:20 PM', 'Active'],
  ['Joseph Adeyemi', 'Preceptor', 'No Access', [D[3]], [L[1]], 'Group Head', null, 'Active'],
  ['Clara Johansson', 'Location-Discipline Coordinator', 'System Access', [D[1]], [L[5], L[0]], 'Clinical Manager', 'Oct 23, 2026, 12:12 PM', 'Active'],
  ['Ravi Shankar', 'Site Admin', 'System Access', [D[0], D[1], D[2]], [L[0], L[1], L[2], L[3], L[4], L[5]], null, 'Oct 27, 2026, 06:41 PM', 'Active'],
  ['Isabel Moreau', 'Preceptor', 'Yet to Login', [], [L[3]], 'Staff Therapist', null, 'Active'],
  ['Kwame Boateng', 'Discipline Coordinator', 'System Access', [D[5]], [], 'Education Coordinator', 'Oct 21, 2026, 10:50 AM', 'Active'],
  ['Yuki Sato', 'Clinical Instructor', 'Invite Sent', [D[6]], [L[2]], 'Staff Therapist', null, 'Active'],
  ['Fatima Zahra', 'Location Coordinator', 'System Access', [D[7]], [L[4]], 'Rehab Director', 'Oct 15, 2026, 09:09 AM', 'Active'],
  ['Lucas Meyer', 'Preceptor', 'System Access', [D[0]], [L[1]], 'Senior Physical Therapist', 'Oct 17, 2026, 03:01 PM', 'Active'],
  ['Anita Desai', 'Site Admin', 'System Access', [], [L[0]], null, 'Oct 14, 2026, 11:11 AM', 'Active'],
  ['Peter Novak', 'Clinical Instructor', 'No Access', [D[2], D[4]], [L[5]], 'Staff Therapist', null, 'Active'],
  ['Zainab Ali', 'Discipline Coordinator', 'System Access', [D[1]], [L[0], L[3]], 'Education Coordinator', 'Oct 9, 2026, 02:27 PM', 'Active'],
  ['Henry Walsh', 'Location Coordinator', 'System Access', [D[3]], [L[2]], 'Group Head', 'Oct 8, 2026, 08:44 AM', 'Active'],
  ['Sneha Kapoor', 'Preceptor', 'Invite Sent', [D[0]], [L[4]], 'Staff Therapist', null, 'Active'],
  ['Diego Ramos', 'Location-Discipline Coordinator', 'System Access', [D[6]], [L[3]], 'Clinical Manager', 'Oct 6, 2026, 04:18 PM', 'Active'],
  ['Olivia Grant', 'Site Admin', 'System Access', [], [], null, 'Sep 30, 2026, 10:00 AM', 'Active'],
  ['Samuel Okoro', 'Clinical Instructor', 'System Access', [D[5]], [L[1], L[2]], 'Staff Therapist', 'Oct 2, 2026, 01:36 PM', 'Active'],
  ['Mina Park', 'Preceptor', 'System Access', [D[4]], [L[5]], 'Senior Physical Therapist', 'Sep 28, 2026, 09:59 AM', 'Active'],
  ['Arjun Rao', 'Discipline Coordinator', 'Yet to Login', [D[7], D[0]], [], 'Education Coordinator', null, 'Active'],
  ['Chloe Dubois', 'Location Coordinator', 'System Access', [D[2]], [L[0]], 'Rehab Director', 'Sep 25, 2026, 05:05 PM', 'Active'],
  ['Wei Zhang', 'Site Admin', 'System Access', [D[0]], [L[1]], null, 'Jul 2, 2025, 03:20 PM', 'Inactive'],
  ['Brianna Scott', 'Preceptor', 'System Access', [D[1]], [L[2]], 'Staff Therapist', 'Mar 4, 2026, 12:00 PM', 'Inactive'],
  ['Ethan Wright', 'Clinical Instructor', 'No Access', [], [L[3]], 'Staff Therapist', null, 'Active'],
];

export const mockPersonnel: PersonnelRecord[] = seeds.map((s, i) => ({
  id: `p-${i + 1}`,
  name: s[0],
  role: s[1],
  access: s[2],
  email:
    s[0].toLowerCase().replace(/[^a-z ]/g, '').trim().replace(/\s+/g, '.') + '@bedlam-pt.example.com',
  disciplines: s[3],
  locations: s[4],
  designation: s[5],
  lastLogin: s[6],
  status: s[7],
}));
