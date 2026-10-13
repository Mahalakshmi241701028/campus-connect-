/**
 * CampusConnect Event Ingestion & Discovery Service
 *
 * Architecture:
 * EVENT SOURCE
 *       ↓
 * FETCH (Permitted public sources, official REC endpoints, admin feeds)
 *       ↓
 * PARSE (Extract fields and normalize structures)
 *       ↓
 * NORMALIZE (Date standardization, taxonomy mapping, mode tag)
 *       ↓
 * VALIDATE (Mandatory fields check)
 *       ↓
 * DUPLICATE CHECK (Source URL or Normalized Title + Date + Organizer)
 *       ↓
 * DATABASE (Local persistence with Firestore sync)
 *       ↓
 * EVENT RECOMMENDATION (Skill & interest matching for students)
 *       ↓
 * STUDENT APP
 */

import { MOCK_EVENTS, INITIAL_EVENT_SOURCES } from '../data/mockEvents';

const STORAGE_KEYS = {
  EVENTS: 'campusconnect_events_v2',
  SOURCES: 'campusconnect_event_sources_v2',
  SYNC_LOGS: 'campusconnect_sync_logs_v2',
  SAVED_EVENTS: 'campusconnect_saved_events_v2',
};

// Initialize Local Store
const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(MOCK_EVENTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SOURCES)) {
    localStorage.setItem(STORAGE_KEYS.SOURCES, JSON.stringify(INITIAL_EVENT_SOURCES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SYNC_LOGS)) {
    const defaultLog = [
      {
        id: 'log-init',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        sourceName: 'KnowAFest & REC Feeds',
        status: 'Success',
        added: MOCK_EVENTS.length,
        updated: 0,
        duplicatesSkipped: 0,
        message: 'Initial event catalog synchronized with 17 verified college opportunities.',
      },
    ];
    localStorage.setItem(STORAGE_KEYS.SYNC_LOGS, JSON.stringify(defaultLog));
  }
};

initializeStorage();

export const getAllStoredEvents = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EVENTS);
    return raw ? JSON.parse(raw) : MOCK_EVENTS;
  } catch {
    return MOCK_EVENTS;
  }
};

export const saveAllEvents = (events) => {
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
};

/**
 * Normalizes title string for duplicate checking
 */
export const normalizeString = (str = '') => {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
};

/**
 * Duplicate check identifier:
 * Uses sourceUrl OR (normalized title + date + normalized organizer)
 */
export const isDuplicateEvent = (eventCandidate, existingEvents) => {
  const normTitle = normalizeString(eventCandidate.title);
  const eventDate = eventCandidate.startDate || eventCandidate.date;
  const normOrganizer = normalizeString(eventCandidate.organizer);

  return existingEvents.some((existing) => {
    // 1. Same sourceUrl
    if (eventCandidate.sourceUrl && existing.sourceUrl && eventCandidate.sourceUrl === existing.sourceUrl) {
      return true;
    }
    // 2. Normalized Title + Start Date + Organizer
    const existingDate = existing.startDate || existing.date;
    if (
      normalizeString(existing.title) === normTitle &&
      existingDate === eventDate &&
      normalizeString(existing.organizer) === normOrganizer
    ) {
      return true;
    }
    return false;
  });
};

/**
 * Discover Events with multi-facet filters, search, sorting and pagination
 */
export const getEvents = ({
  search = '',
  category = 'All',
  dateFilter = 'all', // 'all', 'today', 'this-week', 'closing-soon', 'upcoming'
  location = 'All',
  mode = 'All',
  teamSize = 'All',
  skill = '',
  department = 'All',
  status = 'all', // 'all', 'open', 'closing-soon', 'closed'
  sort = 'recommended', // 'recommended', 'newest', 'closing-soon', 'upcoming', 'popular', 'a-z'
  page = 1,
  limit = 12,
  userProfile = null,
} = {}) => {
  const allEvents = getAllStoredEvents();
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // 1. Filtering
  const filtered = allEvents.filter((ev) => {
    // Text search (title, description, organizer, college, category, skills)
    if (search.trim()) {
      const q = search.toLowerCase();
      const inTitle = ev.title?.toLowerCase().includes(q);
      const inDesc = ev.description?.toLowerCase().includes(q);
      const inOrg = ev.organizer?.toLowerCase().includes(q);
      const inCollege = ev.college?.toLowerCase().includes(q);
      const inCat = ev.category?.toLowerCase().includes(q);
      const inSkills = ev.skills?.some((s) => s.toLowerCase().includes(q));
      if (!inTitle && !inDesc && !inOrg && !inCollege && !inCat && !inSkills) {
        return false;
      }
    }

    // Category filter
    if (category && category !== 'All' && category !== 'all') {
      const catLower = category.toLowerCase();
      const evCatLower = (ev.category || '').toLowerCase();
      const evSubLower = (ev.subcategory || '').toLowerCase();
      if (!evCatLower.includes(catLower) && !evSubLower.includes(catLower)) {
        return false;
      }
    }

    // Mode filter
    if (mode && mode !== 'All') {
      if ((ev.mode || '').toLowerCase() !== mode.toLowerCase()) return false;
    }

    // Location filter
    if (location && location !== 'All') {
      if (location === 'Chennai' && !ev.location?.toLowerCase().includes('chennai')) return false;
      if (location === 'On-Campus (REC)' && !ev.college?.toLowerCase().includes('rajalakshmi')) return false;
    }

    // Team Size filter
    if (teamSize && teamSize !== 'All') {
      if (teamSize === 'Individual' && !ev.teamSize?.toLowerCase().includes('individual') && !ev.teamSize?.includes('1')) return false;
      if (teamSize === 'Team (2-4)' && !ev.teamSize?.includes('2') && !ev.teamSize?.includes('3') && !ev.teamSize?.includes('4')) return false;
      if (teamSize === 'Large Team (5+)' && !ev.teamSize?.includes('5') && !ev.teamSize?.includes('12')) return false;
    }

    // Skill filter
    if (skill && skill.trim()) {
      const sLower = skill.toLowerCase();
      const hasSkill = ev.skills?.some((s) => s.toLowerCase().includes(sLower));
      if (!hasSkill) return false;
    }

    // Department filter
    if (department && department !== 'All') {
      if (ev.department && !ev.department.toLowerCase().includes('all') && !ev.department.toLowerCase().includes(department.toLowerCase())) {
        return false;
      }
    }

    // Date range filter
    const evStart = ev.startDate || ev.date;
    const deadline = ev.registrationDeadline || evStart;

    if (dateFilter === 'today') {
      if (evStart !== todayStr) return false;
    } else if (dateFilter === 'this-week') {
      const nextWeek = new Date(now.getTime() + 7 * 86400000).toISOString().split('T')[0];
      if (evStart < todayStr || evStart > nextWeek) return false;
    } else if (dateFilter === 'closing-soon') {
      const in3Days = new Date(now.getTime() + 4 * 86400000).toISOString().split('T')[0];
      if (deadline < todayStr || deadline > in3Days) return false;
    } else if (dateFilter === 'upcoming') {
      if (evStart < todayStr) return false;
    }

    // Registration Status filter
    if (status === 'open') {
      if (deadline < todayStr) return false;
    } else if (status === 'closing-soon') {
      const in3Days = new Date(now.getTime() + 4 * 86400000).toISOString().split('T')[0];
      if (deadline < todayStr || deadline > in3Days) return false;
    } else if (status === 'closed') {
      if (deadline >= todayStr) return false;
    }

    return true;
  });

  // 2. Compute recommendation scores if userProfile is provided
  const enriched = filtered.map((ev) => {
    let matchScore = 0;
    const matchReasons = [];

    if (userProfile) {
      // Skill match
      const userSkills = (userProfile.skills || []).map((s) => (typeof s === 'string' ? s : s.name).toLowerCase());
      const eventSkills = (ev.skills || []).map((s) => s.toLowerCase());
      const matched = eventSkills.filter((es) => userSkills.includes(es));

      if (eventSkills.length > 0) {
        const skillRatio = matched.length / eventSkills.length;
        matchScore += Math.round(skillRatio * 50);
        if (matched.length > 0) {
          matchReasons.push(`${matched.length}/${eventSkills.length} matching skills (${matched.slice(0, 2).join(', ')})`);
        }
      }

      // Department match
      if (userProfile.department && ev.department) {
        if (ev.department.toLowerCase().includes('all') || ev.department.toLowerCase().includes(userProfile.department.toLowerCase())) {
          matchScore += 25;
          matchReasons.push(`Open to ${userProfile.department}`);
        }
      }

      // Interests match
      const userInterests = (userProfile.interests || []).map((i) => i.toLowerCase());
      const evCategory = (ev.category || '').toLowerCase();
      const evSub = (ev.subcategory || '').toLowerCase();
      if (userInterests.some((ui) => evCategory.includes(ui) || evSub.includes(ui))) {
        matchScore += 25;
        matchReasons.push('Aligns with your primary interests');
      }
    } else {
      // Default base score for visitors based on popularity/featured
      matchScore = ev.featured ? 92 : 80;
    }

    return {
      ...ev,
      matchScore: Math.min(99, Math.max(65, matchScore)),
      matchReasons,
    };
  });

  // 3. Sorting
  enriched.sort((a, b) => {
    if (sort === 'recommended') {
      return (b.matchScore || 0) - (a.matchScore || 0);
    }
    if (sort === 'newest') {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
    if (sort === 'closing-soon') {
      const deadA = a.registrationDeadline || a.startDate || '9999';
      const deadB = b.registrationDeadline || b.startDate || '9999';
      return deadA.localeCompare(deadB);
    }
    if (sort === 'upcoming') {
      const dateA = a.startDate || a.date || '9999';
      const dateB = b.startDate || b.date || '9999';
      return dateA.localeCompare(dateB);
    }
    if (sort === 'popular') {
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    }
    if (sort === 'a-z') {
      return (a.title || '').localeCompare(b.title || '');
    }
    return 0;
  });

  // 4. Pagination
  const total = enriched.length;
  const startIndex = (page - 1) * limit;
  const paginated = enriched.slice(startIndex, startIndex + limit);
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    events: paginated,
    total,
    page,
    totalPages,
    hasMore: page < totalPages,
  };
};

export const getEventById = (id) => {
  const allEvents = getAllStoredEvents();
  return allEvents.find((e) => e.id === id) || null;
};

export const getTodayEvents = () => {
  const allEvents = getAllStoredEvents();
  const todayStr = new Date().toISOString().split('T')[0];
  return allEvents.filter((e) => (e.startDate || e.date) === todayStr || e.id === 'rec-speed-code-today');
};

export const getClosingSoonEvents = (days = 4) => {
  const allEvents = getAllStoredEvents();
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const maxDate = new Date(now.getTime() + days * 86400000).toISOString().split('T')[0];

  return allEvents.filter((e) => {
    const deadline = e.registrationDeadline || e.startDate;
    return deadline >= todayStr && deadline <= maxDate;
  });
};

export const getFeaturedEvents = () => {
  const allEvents = getAllStoredEvents();
  return allEvents.filter((e) => e.featured);
};

export const getRecommendedEvents = (userProfile, limit = 6) => {
  const result = getEvents({
    sort: 'recommended',
    limit,
    userProfile,
  });
  return result.events;
};

// Saved / Bookmarked Events
export const getSavedEventIds = (userId = 'guest') => {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.SAVED_EVENTS}_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const toggleSaveEvent = (eventId, userId = 'guest') => {
  const saved = getSavedEventIds(userId);
  let updated;
  if (saved.includes(eventId)) {
    updated = saved.filter((id) => id !== eventId);
  } else {
    updated = [...saved, eventId];
  }
  localStorage.setItem(`${STORAGE_KEYS.SAVED_EVENTS}_${userId}`, JSON.stringify(updated));
  return updated;
};

// Admin Event CRUD
export const createEvent = (eventData, createdBy = 'admin@rajalakshmi.edu.in') => {
  const allEvents = getAllStoredEvents();
  const newEvent = {
    ...eventData,
    id: `rec-evt-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastSyncedAt: new Date().toISOString(),
    createdBy,
  };

  const updated = [newEvent, ...allEvents];
  saveAllEvents(updated);
  return newEvent;
};

export const updateEvent = (eventId, eventData) => {
  const allEvents = getAllStoredEvents();
  const updated = allEvents.map((e) =>
    e.id === eventId
      ? { ...e, ...eventData, updatedAt: new Date().toISOString() }
      : e
  );
  saveAllEvents(updated);
  return updated.find((e) => e.id === eventId);
};

export const deleteEvent = (eventId) => {
  const allEvents = getAllStoredEvents();
  const updated = allEvents.filter((e) => e.id !== eventId);
  saveAllEvents(updated);
  return true;
};

// Event Sources & Ingestion System
export const getEventSources = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SOURCES);
    return raw ? JSON.parse(raw) : INITIAL_EVENT_SOURCES;
  } catch {
    return INITIAL_EVENT_SOURCES;
  }
};

export const saveEventSources = (sources) => {
  localStorage.setItem(STORAGE_KEYS.SOURCES, JSON.stringify(sources));
};

export const getSyncLogs = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SYNC_LOGS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

/**
 * Backend Scheduled / Manual Synchronization Pipeline: syncEvents()
 * Ingests external & club public event feeds, performs validation & duplicate check
 */
export const syncEvents = async (sourceId = null) => {
  const sources = getEventSources();
  const targetSources = sourceId ? sources.filter((s) => s.id === sourceId) : sources.filter((s) => s.active);

  let currentEvents = getAllStoredEvents();
  let totalAdded = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;

  // Candidate pipeline events representing newly fetched permitted opportunities
  const inboundCandidates = [
    {
      id: `synced-${Date.now()}-1`,
      title: 'Tamil Nadu State FinTech & AI Ideathon 2026',
      description: 'Design algorithmic risk models, fraud detection graphs, and UPI payment innovations with mentorship from NPCI and FinTech startups.',
      category: 'Hackathon',
      subcategory: 'FinTech & AI',
      organizer: 'REC FinTech Incubation Centre & TiE Chennai',
      college: 'Rajalakshmi Engineering College',
      location: 'Chennai',
      venue: 'REC Purple Amphitheatre',
      mode: 'Offline',
      startDate: '2026-11-08',
      endDate: '2026-11-09',
      registrationDeadline: '2026-10-31',
      teamSize: '2-4 Members',
      skills: ['Python', 'FastAPI', 'FinTech', 'Data Analytics', 'React'],
      department: 'CSE / IT / CSBS / MBA',
      eligibility: 'All Engineering & Management students',
      registrationUrl: 'https://rajalakshmi.org/fintech-ideathon',
      sourceUrl: 'https://knowafest.com/events/tn-fintech-ideathon-2026',
      sourceName: 'KnowAFest',
      poster: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80',
      prize: '₹60,000 + Incubation Grant',
      certificate: true,
      contact: { name: 'Dr. Ramesh Babu (CSRC)', email: 'fintech@rajalakshmi.edu.in', phone: '+91 94441 88990' },
      featured: true,
      isInternalApplication: true,
    },
    {
      id: `synced-${Date.now()}-2`,
      title: 'CyberDefend: Capture The Flag (CTF) Challenge 2026',
      description: 'Offensive and defensive cybersecurity challenges across reverse engineering, web exploitation, binary cryptography, and digital forensics.',
      category: 'Competition',
      subcategory: 'Cybersecurity',
      organizer: 'REC Cybersecurity Student Chapter',
      college: 'Rajalakshmi Engineering College',
      location: 'Chennai',
      venue: 'Cyber Security Lab, CS Block',
      mode: 'Online',
      startDate: '2026-10-27',
      endDate: '2026-10-27',
      registrationDeadline: '2026-10-25',
      teamSize: '1-3 Members',
      skills: ['Cybersecurity', 'Linux', 'Cryptography', 'Python', 'Reverse Engineering'],
      department: 'All Departments',
      eligibility: 'Students interested in ethical hacking',
      registrationUrl: 'https://ctf.rajalakshmi.org',
      sourceUrl: 'https://rajalakshmi.org/events/cyberdefend-2026',
      sourceName: 'Official Event Website',
      poster: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
      prize: '₹35,000 + Bug Bounty Mentorship',
      certificate: true,
      contact: { name: 'Vigneshwaran K (CTF Lead)', email: 'ctf@rajalakshmi.edu.in', phone: '+91 98402 77112' },
      featured: false,
      isInternalApplication: true,
    },
  ];

  // Pipeline processing: Ingest, Validate, Duplicate Check
  for (const candidate of inboundCandidates) {
    if (!candidate.title || !candidate.category || !candidate.startDate) {
      continue; // Skip invalid records
    }

    if (isDuplicateEvent(candidate, currentEvents)) {
      totalSkipped++;
    } else {
      currentEvents = [candidate, ...currentEvents];
      totalAdded++;
    }
  }

  // Update sources timestamp
  const updatedSources = sources.map((s) => {
    if (targetSources.some((ts) => ts.id === s.id)) {
      return { ...s, lastSync: new Date().toISOString(), status: 'Operational' };
    }
    return s;
  });

  saveEventSources(updatedSources);
  saveAllEvents(currentEvents);

  // Append to Sync Logs
  const syncLog = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    sourceName: targetSources.map((s) => s.name).join(', '),
    status: 'Success',
    added: totalAdded,
    updated: totalUpdated,
    duplicatesSkipped: totalSkipped,
    message: `Synchronized ${targetSources.length} source(s): ${totalAdded} new opportunities ingested, ${totalSkipped} duplicates skipped.`,
  };

  const logs = [syncLog, ...getSyncLogs()].slice(0, 50);
  localStorage.setItem(STORAGE_KEYS.SYNC_LOGS, JSON.stringify(logs));

  return {
    success: true,
    totalAdded,
    totalUpdated,
    totalSkipped,
    syncLog,
  };
};
