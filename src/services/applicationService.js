/**
 * CampusConnect Event Application Service
 * Manages direct internal event applications, status lifecycle, and registrations.
 */

const STORAGE_KEYS = {
  APPLICATIONS: 'campusconnect_applications_v2',
};

const DEFAULT_APPLICATIONS = [
  {
    id: 'app-rec-9821',
    registrationId: 'REC-APP-2026-9821',
    eventId: 'rec-hack-2026',
    eventTitle: 'REC HackOverFlow 2026: 36-Hour National Hackathon',
    eventDate: '2026-10-24',
    college: 'Rajalakshmi Engineering College',
    studentId: 'rec-std-current',
    studentName: 'Maha Lakshmi D',
    studentEmail: 'mahalakshmi.d@rajalakshmi.edu.in',
    registerNumber: '220701140',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    phone: '+91 98405 67890',
    teamType: 'team',
    teamName: 'AI Innovators REC',
    skills: ['Python', 'FastAPI', 'Machine Learning', 'React'],
    statement: 'Building an automated triage solution for primary healthcare health centers.',
    status: 'Accepted', // 'Applied', 'Under Review', 'Accepted', 'Rejected', 'Waitlisted', 'Cancelled'
    submittedAt: '2026-10-02T10:15:00Z',
    updatedAt: '2026-10-04T12:00:00Z',
  },
  {
    id: 'app-rec-9822',
    registrationId: 'REC-APP-2026-9822',
    eventId: 'rec-ai-summit-2026',
    eventTitle: 'Hands-on Generative AI & LLM Agent Architecture Workshop',
    eventDate: '2026-10-15',
    college: 'Rajalakshmi Engineering College',
    studentId: 'rec-std-current',
    studentName: 'Maha Lakshmi D',
    studentEmail: 'mahalakshmi.d@rajalakshmi.edu.in',
    registerNumber: '220701140',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    phone: '+91 98405 67890',
    teamType: 'individual',
    skills: ['Python', 'Generative AI', 'PyTorch'],
    statement: 'Eager to learn edge LLM deployment for academic research.',
    status: 'Applied',
    submittedAt: '2026-10-05T14:20:00Z',
    updatedAt: '2026-10-05T14:20:00Z',
  },
];

const initializeApplications = () => {
  if (!localStorage.getItem(STORAGE_KEYS.APPLICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(DEFAULT_APPLICATIONS));
  }
};

initializeApplications();

export const getAllApplications = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
    return raw ? JSON.parse(raw) : DEFAULT_APPLICATIONS;
  } catch {
    return DEFAULT_APPLICATIONS;
  }
};

export const saveApplications = (apps) => {
  localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));
};

export const getUserApplications = (userId, userEmail = '') => {
  const all = getAllApplications();
  return all.filter((a) => a.studentId === userId || a.studentEmail === userEmail);
};

export const getApplicationById = (appId) => {
  const all = getAllApplications();
  return all.find((a) => a.id === appId || a.registrationId === appId) || null;
};

/**
 * Submit Direct Internal CampusConnect Application
 */
export const submitApplication = ({
  event,
  studentProfile,
  teamType = 'individual',
  teamName = '',
  statement = '',
  additionalSkills = [],
}) => {
  if (!event) throw new Error('Event is required');

  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const registrationId = `REC-APP-2026-${randomNum}`;

  const studentSkills = (studentProfile?.skills || []).map((s) => (typeof s === 'string' ? s : s.name));
  const combinedSkills = [...new Set([...studentSkills, ...additionalSkills])];

  const newApp = {
    id: `app-${Date.now()}`,
    registrationId,
    eventId: event.id,
    eventTitle: event.title,
    eventDate: event.startDate || event.date,
    college: event.college || 'Rajalakshmi Engineering College',
    studentId: studentProfile?.uid || studentProfile?.id || 'rec-std-current',
    studentName: studentProfile?.name || studentProfile?.displayName || 'Student',
    studentEmail: studentProfile?.email || 'student@rajalakshmi.edu.in',
    registerNumber: studentProfile?.registerNumber || studentProfile?.rollNo || studentProfile?.collegeId || '220701140',
    department: studentProfile?.department || 'Computer Science & Engineering',
    year: studentProfile?.year || '3rd Year',
    phone: studentProfile?.phone || '+91 98400 00000',
    teamType,
    teamName: teamType === 'team' ? teamName : null,
    skills: combinedSkills,
    statement: statement || 'Excited to participate and represent our institution.',
    status: 'Applied',
    submittedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const all = getAllApplications();
  const updated = [newApp, ...all];
  saveApplications(updated);

  return newApp;
};

/**
 * Update Application Status (Admin/Organizer API: PATCH /api/applications/:id/status)
 */
export const updateApplicationStatus = (appId, newStatus) => {
  const all = getAllApplications();
  const updated = all.map((a) =>
    a.id === appId || a.registrationId === appId
      ? { ...a, status: newStatus, updatedAt: new Date().toISOString() }
      : a
  );
  saveApplications(updated);
  return updated.find((a) => a.id === appId || a.registrationId === appId);
};

/**
 * Student cancels/withdraws their own application
 */
export const cancelApplication = (appId, studentId) => {
  const all = getAllApplications();
  const target = all.find((a) => a.id === appId);
  if (!target) throw new Error('Application not found');
  if (target.studentId !== studentId && studentId !== 'admin') {
    throw new Error('Unauthorized to cancel this application');
  }

  const updated = all.map((a) =>
    a.id === appId
      ? { ...a, status: 'Cancelled', updatedAt: new Date().toISOString() }
      : a
  );
  saveApplications(updated);
  return true;
};
