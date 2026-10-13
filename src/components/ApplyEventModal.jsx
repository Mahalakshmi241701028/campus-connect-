import React, { useState, useEffect } from 'react';
import { FiX, FiCheckCircle, FiUser, FiMail, FiPhone, FiHash, FiBookOpen, FiFileText } from 'react-icons/fi';
import { submitApplication } from '../services/applicationService';
import { getUserTeams } from '../services/teamService';
import toast from 'react-hot-toast';

const ApplyEventModal = ({ event, isOpen, onClose, currentUser, userProfile, onSuccess }) => {
  const [teamType, setTeamType] = useState('individual');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [statement, setStatement] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState(null);

  // Pre-fill profile info
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    registerNumber: '',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    phone: '',
  });

  const [availableTeams, setAvailableTeams] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setSubmittedApp(null);
      const name = userProfile?.name || currentUser?.displayName || 'Maha Lakshmi D';
      const email = userProfile?.email || currentUser?.email || 'mahalakshmi.d@rajalakshmi.edu.in';
      const registerNumber = userProfile?.registerNumber || userProfile?.rollNo || userProfile?.collegeId || '220701140';
      const department = userProfile?.department || 'Computer Science & Engineering';
      const year = userProfile?.year || '3rd Year';
      const phone = userProfile?.phone || '+91 98405 67890';

      setFormData({ name, email, registerNumber, department, year, phone });

      // Fetch user's existing teams
      const myTeams = getUserTeams(currentUser?.uid || 'rec-user-current', email);
      setAvailableTeams(myTeams);
      if (myTeams.length > 0) {
        setSelectedTeamId(myTeams[0].id);
      }
    }
  }, [isOpen, currentUser, userProfile]);

  if (!isOpen || !event) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.registerNumber) {
      toast.error('Please fill all mandatory student details.');
      return;
    }

    setSubmitting(true);
    try {
      const selectedTeam = availableTeams.find((t) => t.id === selectedTeamId);
      const app = submitApplication({
        event,
        studentProfile: {
          uid: currentUser?.uid || 'rec-std-current',
          name: formData.name,
          email: formData.email,
          registerNumber: formData.registerNumber,
          department: formData.department,
          year: formData.year,
          phone: formData.phone,
          skills: userProfile?.skills || ['Python', 'React', 'Problem Solving'],
        },
        teamType,
        teamName: teamType === 'team' ? (selectedTeam?.name || 'My REC Team') : null,
        statement,
      });

      setSubmittedApp(app);
      toast.success('Application Submitted Successfully! 🎉');
      onSuccess?.(app);
    } catch (err) {
      toast.error(err.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-purple-950 text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-purple-900/80 px-2 py-0.5 rounded-md border border-amber-400/30">
              CampusConnect Direct Registration
            </span>
            <h2 className="text-lg font-bold mt-1 text-white truncate max-w-md">
              Apply: {event.title}
            </h2>
            <p className="text-xs text-purple-200">
              Rajalakshmi Engineering College • {event.startDate || event.date}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Success Screen */}
        {submittedApp ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <FiCheckCircle className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900">
                Application Submitted Successfully!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Your application has been received and registered in the college portal.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-2 max-w-sm mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-400">Registration ID:</span>
                <span className="font-bold text-purple-900">{submittedApp.registrationId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Applicant:</span>
                <span className="font-semibold text-slate-800">{submittedApp.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Register No:</span>
                <span className="font-semibold text-slate-800">{submittedApp.registerNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Participation:</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {submittedApp.teamType === 'team' ? `Team: ${submittedApp.teamName}` : 'Individual'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-purple-100 text-purple-800">
                  {submittedApp.status}
                </span>
              </div>
            </div>

            <div className="pt-3">
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-purple-900 text-white font-bold text-sm hover:bg-purple-800 transition-colors shadow-md"
              >
                Done & View My Applications
              </button>
            </div>
          </div>
        ) : (
          /* Application Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Auto Pre-filled Notice */}
            <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-100 flex items-start gap-2.5 text-xs text-purple-900">
              <FiCheckCircle className="w-4 h-4 text-purple-700 mt-0.5 flex-shrink-0" />
              <span>
                Your profile information has been automatically pre-filled. Please verify before submitting.
              </span>
            </div>

            {/* Name & Register Number */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  REC Register Number *
                </label>
                <div className="relative">
                  <FiHash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                  <input
                    type="text"
                    required
                    value={formData.registerNumber}
                    onChange={(e) => setFormData({ ...formData, registerNumber: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400/30"
                  />
                </div>
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  College Email *
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Phone *
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400/30"
                  />
                </div>
              </div>
            </div>

            {/* Department & Year */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Academic Year
                </label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400/30 bg-white"
                >
                  <option>1st Year</option>
                  <option>2nd Year</option>
                  <option>3rd Year</option>
                  <option>4th Year</option>
                </select>
              </div>
            </div>

            {/* Participation Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Participation Mode
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTeamType('individual')}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                    teamType === 'individual'
                      ? 'bg-purple-900 text-white border-purple-900 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Individual Entry
                </button>
                <button
                  type="button"
                  onClick={() => setTeamType('team')}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                    teamType === 'team'
                      ? 'bg-purple-900 text-white border-purple-900 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Register with Team
                </button>
              </div>
            </div>

            {/* Team Selection if Team Type */}
            {teamType === 'team' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Your Formed Team
                </label>
                {availableTeams.length > 0 ? (
                  <select
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400/30 bg-white"
                  >
                    {availableTeams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.members?.length || 1} members)
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                    You don't have a team created yet. You can apply individually or create a team on the "My Teams" page first.
                  </p>
                )}
              </div>
            )}

            {/* Statement / Pitch */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Statement of Purpose / Project Idea (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Briefly describe what you or your team plan to build or your motivation..."
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400/30"
              />
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
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-purple-900 text-white font-bold text-xs sm:text-sm hover:bg-purple-800 transition-all shadow-md disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Confirm & Submit Application'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ApplyEventModal;
