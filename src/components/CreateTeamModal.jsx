import React, { useState, useEffect } from 'react';
import { FiX, FiUsers, FiPlus, FiTrash2 } from 'react-icons/fi';
import { getAllStoredEvents } from '../services/eventService';
import { createTeam } from '../services/teamService';
import toast from 'react-hot-toast';

const CreateTeamModal = ({ isOpen, onClose, preselectedEvent, currentUser, onSuccess }) => {
  const [events, setEvents] = useState([]);
  const [teamName, setTeamName] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [teamSize, setTeamSize] = useState(4);
  const [skillInput, setSkillInput] = useState('');
  const [requiredSkills, setRequiredSkills] = useState(['Python', 'React']);
  const [preferredSkills, setPreferredSkills] = useState(['FastAPI']);
  const [rolesInput, setRolesInput] = useState('');
  const [rolesRequired, setRolesRequired] = useState(['ML Engineer', 'Frontend Lead']);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const allEvents = getAllStoredEvents();
      setEvents(allEvents);
      if (preselectedEvent) {
        setSelectedEventId(preselectedEvent.id);
      } else if (allEvents.length > 0) {
        setSelectedEventId(allEvents[0].id);
      }
    }
  }, [isOpen, preselectedEvent]);

  if (!isOpen) return null;

  const handleAddSkill = (type = 'required') => {
    if (!skillInput.trim()) return;
    if (type === 'required') {
      if (!requiredSkills.includes(skillInput.trim())) {
        setRequiredSkills([...requiredSkills, skillInput.trim()]);
      }
    } else {
      if (!preferredSkills.includes(skillInput.trim())) {
        setPreferredSkills([...preferredSkills, skillInput.trim()]);
      }
    }
    setSkillInput('');
  };

  const handleAddRole = () => {
    if (!rolesInput.trim()) return;
    if (!rolesRequired.includes(rolesInput.trim())) {
      setRolesRequired([...rolesRequired, rolesInput.trim()]);
    }
    setRolesInput('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!teamName.trim() || !projectTitle.trim()) {
      toast.error('Team name and project title are required.');
      return;
    }

    setCreating(true);
    try {
      const ev = events.find((e) => e.id === selectedEventId) || preselectedEvent;
      const team = createTeam(
        {
          name: teamName.trim(),
          eventId: ev?.id || 'custom-event',
          eventTitle: ev?.title || 'General Hackathon',
          projectTitle: projectTitle.trim(),
          projectDescription: projectDescription.trim(),
          teamSize: Number(teamSize),
          requiredSkills,
          preferredSkills,
          rolesRequired,
        },
        currentUser
      );

      toast.success(`Team "${team.name}" created successfully!`);
      onSuccess?.(team);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to create team');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-5 bg-purple-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <FiUsers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Create Collaboration Team</h2>
              <p className="text-xs text-purple-200">Form a project group and recruit compatible teammates</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-white transition-colors">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Team Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Team Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. AI Innovators REC, ByteForce Chennai"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400/30"
            />
          </div>

          {/* Event Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target College Event *
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400/30 bg-white"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} ({ev.college})
                </option>
              ))}
            </select>
          </div>

          {/* Project Title & Target Size */}
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. AI Healthcare Diagnostic Assistant"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Team Size
              </label>
              <select
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400/30 bg-white"
              >
                <option value={2}>2 Members</option>
                <option value={3}>3 Members</option>
                <option value={4}>4 Members</option>
                <option value={5}>5 Members</option>
                <option value={6}>6 Members</option>
              </select>
            </div>
          </div>

          {/* Project Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Project Idea & Scope
            </label>
            <textarea
              rows={2}
              placeholder="What are you building? Briefly describe the architecture, problem statement, or target users..."
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400/30"
            />
          </div>

          {/* Required Skills */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Required Skills (used for 40% matching weight)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="e.g. Python, Machine Learning, React"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill('required');
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200"
              />
              <button
                type="button"
                onClick={() => handleAddSkill('required')}
                className="px-3 py-1.5 bg-purple-900 text-white rounded-xl text-xs font-bold hover:bg-purple-800"
              >
                + Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {requiredSkills.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-purple-50 text-purple-900 border border-purple-200 rounded-lg text-[11px] font-semibold flex items-center gap-1.5"
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => setRequiredSkills(requiredSkills.filter((_, i) => i !== idx))}
                    className="text-purple-400 hover:text-purple-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Roles Needed */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Specific Roles Needed
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="e.g. UI/UX Designer, Hardware Builder, Cloud Lead"
                value={rolesInput}
                onChange={(e) => setRolesInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddRole();
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200"
              />
              <button
                type="button"
                onClick={handleAddRole}
                className="px-3 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-black"
              >
                + Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {rolesRequired.map((r, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg text-[11px] font-semibold flex items-center gap-1.5"
                >
                  {r}
                  <button
                    type="button"
                    onClick={() => setRolesRequired(rolesRequired.filter((_, i) => i !== idx))}
                    className="text-amber-400 hover:text-amber-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Action buttons */}
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
              disabled={creating}
              className="px-6 py-2.5 rounded-xl bg-purple-900 text-white font-bold text-xs sm:text-sm hover:bg-purple-800 transition-all shadow-md disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create Team & Find Teammates →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTeamModal;
