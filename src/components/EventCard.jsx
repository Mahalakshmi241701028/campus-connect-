import React from 'react';
import { FiCalendar, FiMapPin, FiUsers, FiClock, FiBookmark, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import { formatDistanceToNow, isPast } from 'date-fns';

/**
 * Minimal & Modern Event Card for CampusConnect
 * Displays essential information clearly without clutter.
 */
const EventCard = ({
  event,
  onOpenDetails,
  onBookmark,
  bookmarked = false,
  showMatch = true,
}) => {
  const eventDate = new Date(event.startDate || event.date || Date.now());
  const deadline = new Date(event.registrationDeadline || event.startDate || Date.now());
  const isExpired = isPast(deadline);

  // Time remaining until deadline
  let deadlineText = '';
  if (!isExpired) {
    try {
      deadlineText = formatDistanceToNow(deadline, { addSuffix: false });
    } catch {
      deadlineText = 'Soon';
    }
  }

  // Determine top 1-2 badges
  const getBadges = () => {
    const badges = [];
    if (event.featured) {
      badges.push({ label: 'FEATURED', color: 'bg-amber-100 text-amber-800 border-amber-200' });
    }
    if (deadlineText && deadlineText.includes('day') && parseInt(deadlineText, 10) <= 3) {
      badges.push({ label: 'CLOSING SOON', color: 'bg-rose-100 text-rose-800 border-rose-200' });
    } else if (event.id === 'rec-speed-code-today') {
      badges.push({ label: 'TODAY', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' });
    } else if (event.isInternalApplication) {
      badges.push({ label: 'DIRECT APPLY', color: 'bg-purple-100 text-purple-800 border-purple-200' });
    }
    return badges.slice(0, 2);
  };

  const activeBadges = getBadges();

  return (
    <div
      onClick={() => onOpenDetails?.(event)}
      className="group relative flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-purple-200 transition-all duration-200 overflow-hidden cursor-pointer"
    >
      {/* Poster image container */}
      <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
        {event.poster ? (
          <img
            src={event.poster}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-purple-50 text-purple-700 font-bold text-sm">
            {event.category || 'College Event'}
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {activeBadges.map((badge, idx) => (
            <span
              key={idx}
              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border shadow-sm ${badge.color}`}
            >
              {badge.label}
            </span>
          ))}
        </div>

        {/* Bookmark button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBookmark?.(event.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all z-10 ${
            bookmarked
              ? 'bg-amber-500 text-white shadow-md'
              : 'bg-white/80 text-slate-700 hover:bg-white hover:text-purple-900'
          }`}
          title={bookmarked ? 'Saved' : 'Save Event'}
        >
          <FiBookmark className="w-3.5 h-3.5" fill={bookmarked ? 'currentColor' : 'none'} />
        </button>

        {/* Category & College Pill on Bottom of Poster */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
          <span className="font-semibold truncate max-w-[200px] text-slate-100 text-[11px] drop-shadow-sm">
            {event.college || 'Rajalakshmi Engineering College'}
          </span>
          {showMatch && event.matchScore && (
            <span className="px-2 py-0.5 rounded-md bg-purple-900/90 text-amber-300 font-bold text-[10px] border border-amber-400/30 backdrop-blur-sm">
              {event.matchScore}% Match
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category Tag */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
              {event.category}
            </span>
            {event.mode && (
              <span className="text-[11px] text-slate-500 font-medium">
                • {event.mode}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-purple-900 transition-colors">
            {event.title}
          </h3>

          {/* Key metadata */}
          <div className="mt-2.5 space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <FiCalendar className="w-3.5 h-3.5 text-purple-700 flex-shrink-0" />
              <span>{event.startDate || event.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiMapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">{event.venue || event.location || 'REC Campus, Chennai'}</span>
            </div>
            {event.teamSize && (
              <div className="flex items-center gap-2">
                <FiUsers className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>{event.teamSize}</span>
              </div>
            )}
          </div>

          {/* Skills preview */}
          {event.skills && event.skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {event.skills.slice(0, 3).map((sk, i) => (
                <span
                  key={i}
                  className="text-[10px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded"
                >
                  {sk}
                </span>
              ))}
              {event.skills.length > 3 && (
                <span className="text-[10px] text-slate-400 self-center">
                  +{event.skills.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer info: Registration deadline & CTA */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            {isExpired ? (
              <span className="text-slate-400 font-medium">Registration closed</span>
            ) : (
              <span className="flex items-center gap-1 text-slate-600">
                <FiClock className="w-3 h-3 text-amber-600" /> Closes: {deadlineText}
              </span>
            )}
          </div>

          <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-900 group-hover:translate-x-1 transition-transform">
            View <FiArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
