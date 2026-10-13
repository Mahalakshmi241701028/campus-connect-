/**
 * CampusConnect Team Management & Join Request Service
 */

const STORAGE_KEYS = {
  TEAMS: 'campusconnect_teams_v2',
  REQUESTS: 'campusconnect_join_requests_v2',
};

const DEFAULT_TEAMS = [
  {
    id: 'team-rec-01',
    name: 'AI Innovators REC',
    eventId: 'rec-hack-2026',
    eventTitle: 'REC HackOverFlow 2026: 36-Hour National Hackathon',
    projectTitle: 'AI Healthcare Diagnostic Assistant',
    projectDescription: 'Building a multimodal diagnostic assistant running on edge hardware to triage emergency retinal and respiratory symptoms in rural clinics.',
    teamSize: 4,
    currentMembersCount: 2,
    requiredSkills: ['Python', 'Machine Learning', 'React', 'UI/UX'],
    preferredSkills: ['FastAPI', 'PyTorch', 'Docker'],
    rolesRequired: ['ML Engineer', 'Full-stack Web Lead'],
    leaderId: 'rec-std-002',
    leaderName: 'Siddharth Varma',
    leaderEmail: 'siddharth.v@rajalakshmi.edu.in',
    status: 'Recruiting',
    createdAt: '2026-10-01T10:00:00Z',
    members: [
      {
        id: 'rec-std-002',
        name: 'Siddharth Varma',
        department: 'CSE',
        year: '3rd Year',
        role: 'Team Lead & Backend',
        joinedAt: '2026-10-01T10:00:00Z',
      },
      {
        id: 'rec-std-003',
        name: 'Kavitha Sundar',
        department: 'IT',
        year: '2nd Year',
        role: 'UI/UX Designer',
        joinedAt: '2026-10-03T11:00:00Z',
      },
    ],
  },
  {
    id: 'team-rec-02',
    name: 'ByteForce Chennai',
    eventId: 'anna-kurukshetra-2026',
    eventTitle: 'Kurukshetra 2026: Battle of the Brains',
    projectTitle: 'Autonomous Campus EV Dispatcher',
    projectDescription: 'Dynamic route optimization and battery swap prediction for smart electric campus shuttles.',
    teamSize: 3,
    currentMembersCount: 1,
    requiredSkills: ['Robotics', 'IoT', 'C++', 'Python'],
    preferredSkills: ['Arduino', 'ROS', 'MQTT'],
    rolesRequired: ['Firmware Engineer', 'Algorithmic Optimizer'],
    leaderId: 'rec-std-004',
    leaderName: 'Dinesh Karthik M',
    leaderEmail: 'dinesh.k@rajalakshmi.edu.in',
    status: 'Recruiting',
    createdAt: '2026-10-04T12:00:00Z',
    members: [
      {
        id: 'rec-std-004',
        name: 'Dinesh Karthik M',
        department: 'ECE',
        year: '4th Year',
        role: 'Hardware Lead',
        joinedAt: '2026-10-04T12:00:00Z',
      },
    ],
  },
];

const initializeTeams = () => {
  if (!localStorage.getItem(STORAGE_KEYS.TEAMS)) {
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(DEFAULT_TEAMS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.REQUESTS)) {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify([]));
  }
};

initializeTeams();

export const getAllTeams = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEAMS);
    return raw ? JSON.parse(raw) : DEFAULT_TEAMS;
  } catch {
    return DEFAULT_TEAMS;
  }
};

export const saveTeams = (teams) => {
  localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
};

export const getTeamById = (teamId) => {
  const teams = getAllTeams();
  return teams.find((t) => t.id === teamId) || null;
};

export const getUserTeams = (userId, userEmail = '') => {
  const teams = getAllTeams();
  return teams.filter(
    (t) =>
      t.leaderId === userId ||
      t.leaderEmail === userEmail ||
      t.members?.some((m) => m.id === userId || m.email === userEmail)
  );
};

export const createTeam = (teamData, currentUser) => {
  const allTeams = getAllTeams();
  const leaderId = currentUser?.uid || 'rec-user-current';
  const leaderName = currentUser?.displayName || currentUser?.name || 'Student Lead';
  const leaderEmail = currentUser?.email || 'student@rajalakshmi.edu.in';

  const newTeam = {
    ...teamData,
    id: `team-${Date.now()}`,
    leaderId,
    leaderName,
    leaderEmail,
    currentMembersCount: 1,
    status: 'Recruiting',
    createdAt: new Date().toISOString(),
    members: [
      {
        id: leaderId,
        name: leaderName,
        email: leaderEmail,
        department: currentUser?.department || 'REC Student',
        year: currentUser?.year || '3rd Year',
        role: 'Team Lead',
        joinedAt: new Date().toISOString(),
      },
    ],
  };

  const updated = [newTeam, ...allTeams];
  saveTeams(updated);
  return newTeam;
};

// ==========================================
// JOIN REQUESTS & INVITATIONS
// ==========================================

export const getAllJoinRequests = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveJoinRequests = (reqs) => {
  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(reqs));
};

/**
 * Send Join Request or Team Invitation
 */
export const sendJoinRequest = ({
  teamId,
  senderUser,
  targetStudent,
  role = 'Teammate',
  message = '',
  type = 'invitation', // 'invitation' (team invited student) or 'join_request' (student asked to join team)
}) => {
  const team = getTeamById(teamId);
  if (!team) throw new Error('Team not found');

  // Prevent requesting after team is full
  if ((team.members || []).length >= Number(team.teamSize || 4)) {
    throw new Error('This team is already full');
  }

  // Prevent requesting existing members
  const memberIds = (team.members || []).map((m) => m.id || m.userId);
  if (memberIds.includes(targetStudent.id)) {
    throw new Error('Student is already a member of this team');
  }

  // Prevent duplicate pending requests
  const existingRequests = getAllJoinRequests();
  const isDuplicate = existingRequests.some(
    (r) =>
      r.teamId === teamId &&
      r.targetStudentId === targetStudent.id &&
      r.status === 'Pending'
  );

  if (isDuplicate) {
    throw new Error('A pending request for this student already exists');
  }

  const newRequest = {
    id: `req-${Date.now()}`,
    teamId,
    teamName: team.name,
    eventId: team.eventId,
    eventTitle: team.eventTitle,
    projectTitle: team.projectTitle,
    senderId: senderUser?.uid || 'rec-user-current',
    senderName: senderUser?.displayName || senderUser?.name || 'Team Lead',
    targetStudentId: targetStudent.id,
    targetStudentName: targetStudent.name,
    targetStudentEmail: targetStudent.email,
    role,
    message: message || `We would love for you to join ${team.name} as ${role}!`,
    type,
    status: 'Pending',
    createdAt: new Date().toISOString(),
  };

  const updated = [newRequest, ...existingRequests];
  saveJoinRequests(updated);
  return newRequest;
};

/**
 * Respond to Request: ACCEPT or REJECT
 */
export const respondToJoinRequest = (requestId, action, responderUser = null) => {
  const requests = getAllJoinRequests();
  const req = requests.find((r) => r.id === requestId);
  if (!req) throw new Error('Request not found');

  if (action === 'ACCEPT') {
    const team = getTeamById(req.teamId);
    if (!team) throw new Error('Team not found');

    if ((team.members || []).length >= Number(team.teamSize || 4)) {
      throw new Error('Team is already full');
    }

    // Add student to team
    const newMember = {
      id: req.targetStudentId,
      name: req.targetStudentName,
      email: req.targetStudentEmail,
      department: 'REC Student',
      year: 'Student',
      role: req.role || 'Teammate',
      joinedAt: new Date().toISOString(),
    };

    const updatedMembers = [...(team.members || []), newMember];
    const isFull = updatedMembers.length >= Number(team.teamSize || 4);

    const allTeams = getAllTeams();
    const updatedTeams = allTeams.map((t) =>
      t.id === team.id
        ? {
            ...t,
            members: updatedMembers,
            currentMembersCount: updatedMembers.length,
            status: isFull ? 'Full' : 'Recruiting',
          }
        : t
    );
    saveTeams(updatedTeams);

    // Update request status
    const updatedReqs = requests.map((r) =>
      r.id === requestId
        ? { ...r, status: 'Accepted', respondedAt: new Date().toISOString() }
        : r
    );
    saveJoinRequests(updatedReqs);

    return { success: true, status: 'Accepted', team: updatedTeams.find((t) => t.id === team.id) };
  } else {
    // REJECT
    const updatedReqs = requests.map((r) =>
      r.id === requestId
        ? { ...r, status: 'Rejected', respondedAt: new Date().toISOString() }
        : r
    );
    saveJoinRequests(updatedReqs);
    return { success: true, status: 'Rejected' };
  }
};
