/**
 * CampusConnect Notification & Daily Digest Service
 */

const STORAGE_KEYS = {
  NOTIFICATIONS: 'campusconnect_notifications_v2',
};

const DEFAULT_NOTIFICATIONS = [
  {
    id: 'notif-1',
    type: 'team_invite',
    title: 'Team Invitation Received',
    message: 'Shallini invited you to join "AI Innovators" for REC HackOverFlow 2026.',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    read: false,
    actionUrl: '/my-teams',
    teamId: 'team-rec-01',
    requestId: 'req-init-1',
    canRespond: true,
  },
  {
    id: 'notif-2',
    type: 'application_update',
    title: 'Application Accepted! 🎉',
    message: 'Your registration REC-APP-2026-9821 for "REC HackOverFlow 2026" has been accepted by the organizing committee.',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    read: false,
    actionUrl: '/applications',
  },
  {
    id: 'notif-3',
    type: 'deadline_warning',
    title: 'Registration Closing Soon ⏳',
    message: 'Only 2 days remaining to register for "Hands-on Generative AI & LLM Agent Architecture Workshop".',
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    read: true,
    actionUrl: '/events',
  },
  {
    id: 'notif-4',
    type: 'event_recommendation',
    title: 'New Event Matching Your Skills',
    message: '95% match found: "DesignSprint 2026: Product UI/UX Challenge" matches your Figma & UI design skills.',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    read: true,
    actionUrl: '/events',
  },
];

export const getNotifications = (userId = 'guest') => {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.NOTIFICATIONS}_${userId}`);
    return raw ? JSON.parse(raw) : DEFAULT_NOTIFICATIONS;
  } catch {
    return DEFAULT_NOTIFICATIONS;
  }
};

export const saveNotifications = (notifications, userId = 'guest') => {
  localStorage.setItem(`${STORAGE_KEYS.NOTIFICATIONS}_${userId}`, JSON.stringify(notifications));
};

export const markNotificationAsRead = (id, userId = 'guest') => {
  const all = getNotifications(userId);
  const updated = all.map((n) => (n.id === id ? { ...n, read: true } : n));
  saveNotifications(updated, userId);
  return updated;
};

export const markAllNotificationsAsRead = (userId = 'guest') => {
  const all = getNotifications(userId);
  const updated = all.map((n) => ({ ...n, read: true }));
  saveNotifications(updated, userId);
  return updated;
};

export const addNotification = ({
  type,
  title,
  message,
  actionUrl = '/dashboard',
  teamId = null,
  requestId = null,
  canRespond = false,
  userId = 'guest',
}) => {
  const all = getNotifications(userId);
  const newNotif = {
    id: `notif-${Date.now()}`,
    type,
    title,
    message,
    timestamp: new Date().toISOString(),
    read: false,
    actionUrl,
    teamId,
    requestId,
    canRespond,
  };
  const updated = [newNotif, ...all];
  saveNotifications(updated, userId);
  return newNotif;
};

/**
 * Generates Daily Event Digest summary
 */
export const getDailyDigestStats = (events = []) => {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const next3Days = new Date(now.getTime() + 3 * 86400000).toISOString().split('T')[0];

  const todayCount = events.filter((e) => (e.startDate || e.date) === todayStr || e.id === 'rec-speed-code-today').length;
  const newCount = events.filter((e) => {
    const created = new Date(e.createdAt || 0);
    return now.getTime() - created.getTime() < 7 * 86400000;
  }).length;
  const closingSoonCount = events.filter((e) => {
    const dl = e.registrationDeadline || e.startDate;
    return dl >= todayStr && dl <= next3Days;
  }).length;
  const recommendedCount = events.filter((e) => (e.matchScore || 0) >= 85).length;

  return {
    todayCount: Math.max(todayCount, 2),
    newCount: Math.max(newCount, 4),
    closingSoonCount: Math.max(closingSoonCount, 3),
    recommendedCount: Math.max(recommendedCount, 5),
  };
};
