import React from 'react';
import {
  FiX,
  FiCalendar,
  FiMapPin,
  FiUsers,
  FiAward,
  FiCheckCircle,
  FiExternalLink,
  FiBookmark,
  FiShare2,
  FiUserPlus,
  FiMail,
  FiPhone,
  FiInfo,
  FiClock,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const EventDetailModal = ({
  event,
  isOpen,
  onClose,
  onApply,
  onCreateTeam,
  onFindTeammates,
  isBookmarked,
  onToggleBookmark,
}) => {
  if (!isOpen || !event) return null;

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success('Event link copied to clipboard!');
  };

  const isInternal = Boolean(event.isInternalApplication);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Sticky Header with Close Button */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            onClick={() => onToggleBookmark?.(event.id)}
            className={`p-2.5 rounded-full backdrop-blur-md transition-all ${
              isBookmarked
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-white/80 text-slate-700 hover:bg-white shadow'
            }`}
            title="Save event"
          >
            <FiBookmark className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={handleShare}
            className="p-2.5 rounded-full bg-white/80 text-slate-700 hover:bg-white shadow backdrop-blur-md transition-all"
            title="Share event"
          >
            <FiShare2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/80 text-slate-700 hover:bg-white shadow backdrop-blur-md transition-all"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1">
          {/* Banner Poster */}
          <div className="relative h-60 sm:h-72 w-full bg-slate-900">
            {event.poster ? (
              <img
                src={event.poster}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-purple-900 text-white font-bold text-lg">
                {event.category}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

            <div className="absolute bottom-5 left-5 right-5 text-white">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-purple-600/90 text-white border border-purple-400/30">
                  {event.category}
                </span>
                {event.subcategory && (
                  <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white/20 text-white backdrop-blur-sm">
                    {event.subcategory}
                  </span>
                )}
                {isInternal ? (
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/90 text-purple-950">
                    CampusConnect Direct Apply
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-800/80 text-slate-200">
                    External Registration
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {event.title}
              </h1>

              <p className="text-slate-300 text-xs sm:text-sm mt-1 font-medium">
                {event.organizer} • {event.college || 'Rajalakshmi Engineering College'}
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 border-b border-slate-200 text-xs">
            <div className="flex items-center gap-2.5">
              <FiCalendar className="w-4 h-4 text-purple-700 flex-shrink-0" />
              <div>
                <p className="text-slate-400 font-medium">Date</p>
                <p className="font-bold text-slate-800">{event.startDate || event.date}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <FiMapPin className="w-4 h-4 text-purple-700 flex-shrink-0" />
              <div>
                <p className="text-slate-400 font-medium">Mode & Venue</p>
                <p className="font-bold text-slate-800 truncate">{event.mode} • {event.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <FiUsers className="w-4 h-4 text-purple-700 flex-shrink-0" />
              <div>
                <p className="text-slate-400 font-medium">Team Size</p>
                <p className="font-bold text-slate-800">{event.teamSize || 'Individual / Team'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <FiClock className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <div>
                <p className="text-slate-400 font-medium">Registration Deadline</p>
                <p className="font-bold text-amber-700">{event.registrationDeadline || 'Closing Soon'}</p>
              </div>
            </div>
          </div>

          {/* Body Sections */}
          <div className="p-6 space-y-6">
            {/* Description */}
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                About The Event
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>

            {/* Prize & Certification */}
            {(event.prize || event.certificate) && (
              <div className="grid sm:grid-cols-2 gap-3">
                {event.prize && (
                  <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-start gap-3">
                    <FiAward className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-amber-900">Prizes & Rewards</p>
                      <p className="text-xs text-amber-800 mt-0.5">{event.prize}</p>
                    </div>
                  </div>
                )}
                {event.certificate && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-start gap-3">
                    <FiCheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-emerald-900">Official Certificate</p>
                      <p className="text-xs text-emerald-800 mt-0.5">Participation & Merit certificate provided</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Required Skills */}
            {event.skills && event.skills.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Key Skills & Technologies
                </h2>
                <div className="flex flex-wrap gap-2">
                  {event.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-purple-50 text-purple-900 border border-purple-100 rounded-lg text-xs font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Eligibility & Department */}
            <div className="grid sm:grid-cols-2 gap-4 text-xs text-slate-600">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="font-bold text-slate-900 mb-1">Eligibility Criteria</p>
                <p>{event.eligibility || 'Open to all Engineering & Tech Students'}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="font-bold text-slate-900 mb-1">Eligible Departments</p>
                <p>{event.department || 'All Engineering Departments'}</p>
              </div>
            </div>

            {/* Source Attribution (KnowAFest or Official) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-slate-700">SOURCE: </span>
                <span className="font-semibold text-purple-900">
                  {event.sourceName || 'KnowAFest'}
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Verified publicly listed college event
                </p>
              </div>

              {event.sourceUrl && (
                <a
                  href={event.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors"
                >
                  View Source <FiExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Contact Person */}
            {event.contact && (
              <div className="border-t border-slate-100 pt-4 text-xs text-slate-600">
                <p className="font-bold text-slate-900 mb-2">Event Organizer Contact</p>
                <div className="flex flex-wrap gap-4">
                  {event.contact.name && <span className="font-medium text-slate-800">{event.contact.name}</span>}
                  {event.contact.email && (
                    <span className="flex items-center gap-1 text-purple-800 font-medium">
                      <FiMail className="w-3.5 h-3.5" /> {event.contact.email}
                    </span>
                  )}
                  {event.contact.phone && (
                    <span className="flex items-center gap-1 text-slate-700">
                      <FiPhone className="w-3.5 h-3.5" /> {event.contact.phone}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Action Bar */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 z-10">
          {/* Team Collaboration secondary actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onCreateTeam?.(event);
              }}
              className="px-3.5 py-2.5 rounded-xl border border-purple-200 text-purple-900 text-xs font-bold hover:bg-purple-50 transition-colors inline-flex items-center gap-1.5"
            >
              <FiUserPlus className="w-3.5 h-3.5" /> Create Team
            </button>
            <button
              onClick={() => {
                onClose();
                onFindTeammates?.(event);
              }}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              Find Teammates
            </button>
          </div>

          {/* Primary CTA: Apply Now or External */}
          <div>
            {isInternal ? (
              <button
                onClick={() => {
                  onClose();
                  onApply?.(event);
                }}
                className="px-6 py-2.5 rounded-xl bg-purple-900 text-white hover:bg-purple-800 transition-all text-xs sm:text-sm font-bold shadow-md shadow-purple-950/10 hover:shadow-lg"
              >
                Apply on CampusConnect →
              </button>
            ) : (
              <a
                href={event.registrationUrl || event.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-black transition-all text-xs sm:text-sm font-bold inline-flex items-center gap-2 shadow-md"
              >
                Apply on Official Website <FiExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailModal;
