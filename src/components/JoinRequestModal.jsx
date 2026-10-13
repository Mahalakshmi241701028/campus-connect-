import React, { useState } from 'react';
import { FiX, FiSend, FiUserCheck } from 'react-icons/fi';
import { sendJoinRequest } from '../services/teamService';
import { addNotification } from '../services/notificationService';
import toast from 'react-hot-toast';

const JoinRequestModal = ({
  isOpen,
  onClose,
  targetStudent,
  teams = [],
  currentUser,
  onSuccess,
}) => {
  const [selectedTeamId, setSelectedTeamId] = useState(teams[0]?.id || '');
  const [role, setRole] = useState('Frontend Engineer');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  if (!isOpen || !targetStudent) return null;

  const currentTeam = teams.find((t) => t.id === selectedTeamId) || teams[0];

  const handleSend = (e) => {
    e.preventDefault();
    if (!currentTeam) {
      toast.error('Please create or select a team first');
      return;
    }

    setSending(true);
    try {
      const req = sendJoinRequest({
        teamId: currentTeam.id,
        senderUser: currentUser,
        targetStudent,
        role: role.trim() || 'Teammate',
        message: message.trim(),
        type: 'invitation',
      });

      // Dispatch notification
      addNotification({
        type: 'team_invite',
        title: 'Team Invitation',
        message: `${currentUser?.displayName || 'A team lead'} invited you to join "${currentTeam.name}" for ${currentTeam.eventTitle}.`,
        actionUrl: '/my-teams',
        teamId: currentTeam.id,
        requestId: req.id,
        canRespond: true,
        userId: targetStudent.id,
      });

      toast.success(`Join request sent to ${targetStudent.name}! 🚀`);
      onSuccess?.(req);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to send request');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-5 bg-purple-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <FiUserCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Send Team Join Request</h2>
              <p className="text-xs text-purple-200">Invite {targetStudent.name} to join your team</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-white transition-colors">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSend} className="p-6 space-y-4">
          {/* Candidate Profile summary */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <img
              src={targetStudent.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
              alt={targetStudent.name}
              className="w-11 h-11 rounded-xl object-cover border border-purple-200"
            />
            <div>
              <p className="text-sm font-bold text-slate-900">{targetStudent.name}</p>
              <p className="text-xs text-slate-500">
                {targetStudent.department} • {targetStudent.year}
              </p>
              {targetStudent.resumeVerified && (
                <span className="text-[10px] text-purple-800 font-bold flex items-center gap-1 mt-0.5">
                  ✓ Resume Verified Candidate
                </span>
              )}
            </div>
          </div>

          {/* Select Team */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Your Team *
            </label>
            {teams.length > 0 ? (
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400/30 bg-white"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.eventTitle})
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                No active teams found. Please create a team first from the "My Teams" page.
              </p>
            )}
          </div>

          {/* Role Offered */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Role in Project *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. ML Engineer, Frontend Dev, UI Designer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400/30"
            />
          </div>

          {/* Personalized Message */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Personalized Invitation Message
            </label>
            <textarea
              rows={3}
              placeholder={`Hi ${targetStudent.name.split(' ')[0]}, your skills in ${(targetStudent.matchingSkills || []).slice(0, 2).map((s) => s.name).join(', ') || 'tech'} are a great match for our project!`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400/30"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending || teams.length === 0}
              className="px-6 py-2.5 rounded-xl bg-purple-900 text-white font-bold text-xs sm:text-sm hover:bg-purple-800 transition-all shadow-md inline-flex items-center gap-2 disabled:opacity-50"
            >
              <FiSend className="w-3.5 h-3.5" /> {sending ? 'Sending...' : 'Send Join Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinRequestModal;
