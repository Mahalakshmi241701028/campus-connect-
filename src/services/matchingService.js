/**
 * Intelligent Teammate Matching Engine
 *
 * Mathematical Compatibility Breakdown (Total = 100%):
 * 1. Skill Match: 40%
 *    - Proportion of team's required & preferred skills possessed by candidate.
 * 2. Interest Match: 20%
 *    - Domain/thematic overlap between candidate interests and team/event category.
 * 3. Availability: 15%
 *    - Candidate availability bandwidth (High = 15%, Medium = 10%, Low = 5%).
 * 4. Project/Experience Relevance: 10%
 *    - Relevant portfolio projects matching the project tech stack or domain.
 * 5. Resume-Verified Skills: 10%
 *    - Evidence in verified resume vs unverified self-declared skills.
 * 6. Department/Year Compatibility: 5%
 *    - Departmental synergy and year compatibility for competition rules.
 */

import { MOCK_STUDENTS } from '../data/mockStudents';

/**
 * Calculates candidate compatibility score for a given team requirement
 *
 * @param {Object} team - The team with requirements, event, and project details
 * @param {Object} candidate - The student profile
 * @returns {Object} Compatibility score and breakdown
 */
export const calculateTeammateMatch = (team, candidate) => {
  const reasons = [];

  const requiredSkills = (team.requiredSkills || []).map((s) => s.toLowerCase().trim());
  const preferredSkills = (team.preferredSkills || []).map((s) => s.toLowerCase().trim());
  const allNeededSkills = [...new Set([...requiredSkills, ...preferredSkills])];

  // Candidate skill list
  const candidateSkills = (candidate.skills || []).map((s) => ({
    name: typeof s === 'string' ? s : s.name,
    verified: typeof s === 'string' ? Boolean(candidate.resumeVerified) : Boolean(s.verified),
  }));

  const candidateSkillNames = candidateSkills.map((s) => s.name.toLowerCase().trim());
  const verifiedSkillNames = candidateSkills.filter((s) => s.verified).map((s) => s.name.toLowerCase().trim());

  // 1. SKILL MATCH: 40%
  let skillScore = 0;
  const matchedRequired = [];
  const matchedPreferred = [];

  requiredSkills.forEach((req) => {
    if (candidateSkillNames.some((cs) => cs.includes(req) || req.includes(cs))) {
      matchedRequired.push(req);
    }
  });

  preferredSkills.forEach((pref) => {
    if (candidateSkillNames.some((cs) => cs.includes(pref) || pref.includes(cs))) {
      matchedPreferred.push(pref);
    }
  });

  if (requiredSkills.length > 0) {
    const reqRatio = matchedRequired.length / requiredSkills.length;
    const prefRatio = preferredSkills.length > 0 ? matchedPreferred.length / preferredSkills.length : 1;
    // 30% for required, 10% for preferred
    skillScore = Math.round(reqRatio * 30 + prefRatio * 10);
    reasons.push(`✓ ${matchedRequired.length}/${requiredSkills.length} required skills matched`);
  } else if (allNeededSkills.length > 0) {
    const totalMatched = matchedRequired.length + matchedPreferred.length;
    const ratio = totalMatched / allNeededSkills.length;
    skillScore = Math.round(ratio * 40);
    reasons.push(`✓ ${totalMatched}/${allNeededSkills.length} requested skills matched`);
  } else {
    skillScore = 32; // Default baseline if team has no specific skills listed
  }

  // 2. INTEREST MATCH: 20%
  let interestScore = 0;
  const teamTheme = `${team.eventTitle || ''} ${team.projectTitle || ''} ${team.projectDescription || ''} ${team.category || ''}`.toLowerCase();
  const candidateInterests = (candidate.interests || []).map((i) => i.toLowerCase());

  let matchedInterestsCount = 0;
  candidateInterests.forEach((interest) => {
    if (teamTheme.includes(interest) || interest.split(' ').some((w) => w.length > 2 && teamTheme.includes(w))) {
      matchedInterestsCount++;
    }
  });

  if (matchedInterestsCount > 0) {
    interestScore = Math.min(20, 10 + matchedInterestsCount * 5);
    reasons.push(`✓ Domain interest match (${candidate.interests.slice(0, 2).join(', ')})`);
  } else {
    interestScore = 8;
  }

  // 3. AVAILABILITY: 15%
  let availabilityScore = 15;
  if (candidate.availability === 'High') {
    availabilityScore = 15;
    reasons.push('✓ High availability for hackathons');
  } else if (candidate.availability === 'Medium') {
    availabilityScore = 10;
  } else {
    availabilityScore = 5;
  }

  // 4. PROJECT / EXPERIENCE RELEVANCE: 10%
  let experienceScore = 0;
  const candidateProjects = candidate.projects || [];
  let relevantProjectsCount = 0;

  candidateProjects.forEach((proj) => {
    const projTech = (proj.technologies || []).map((t) => t.toLowerCase());
    const hasOverlap = allNeededSkills.some((ns) => projTech.some((pt) => pt.includes(ns) || ns.includes(pt)));
    if (hasOverlap) {
      relevantProjectsCount++;
    }
  });

  if (relevantProjectsCount > 0) {
    experienceScore = Math.min(10, 5 + relevantProjectsCount * 3);
    reasons.push(`✓ ${relevantProjectsCount} relevant portfolio project${relevantProjectsCount > 1 ? 's' : ''}`);
  } else if (candidateProjects.length > 0) {
    experienceScore = 6;
  } else {
    experienceScore = 2;
  }

  // 5. RESUME-VERIFIED SKILLS: 10%
  let resumeScore = 0;
  const verifiedMatches = matchedRequired.filter((skill) =>
    verifiedSkillNames.some((vs) => vs.includes(skill) || skill.includes(vs))
  );

  if (candidate.resumeVerified && verifiedMatches.length > 0) {
    const verifiedRatio = verifiedMatches.length / (matchedRequired.length || 1);
    resumeScore = Math.round(verifiedRatio * 10);
    reasons.push('✓ Resume-verified skills');
  } else if (candidate.resumeVerified) {
    resumeScore = 7;
    reasons.push('✓ Resume verified');
  } else {
    resumeScore = 2;
  }

  // 6. DEPARTMENT / YEAR COMPATIBILITY: 5%
  let deptScore = 3;
  if (candidate.department && team.targetDepartment) {
    if (team.targetDepartment.toLowerCase().includes('all') || candidate.department.toLowerCase().includes(team.targetDepartment.toLowerCase())) {
      deptScore = 5;
    }
  } else {
    deptScore = 4;
  }

  // TOTAL COMPATIBILITY SCORE (0 - 100%)
  const totalScore = Math.min(99, Math.max(50, skillScore + interestScore + availabilityScore + experienceScore + resumeScore + deptScore));

  // Determine skill verification states for candidate display
  const matchingSkills = candidateSkills.map((s) => ({
    name: s.name,
    isMatch: allNeededSkills.some((ns) => ns.includes(s.name.toLowerCase()) || s.name.toLowerCase().includes(ns)),
    verified: s.verified,
  }));

  return {
    candidateId: candidate.id,
    name: candidate.name,
    email: candidate.email,
    department: candidate.department,
    year: candidate.year,
    rollNo: candidate.rollNo,
    avatar: candidate.avatar,
    bio: candidate.bio,
    matchScore: totalScore,
    skillMatch: skillScore,
    interestMatch: interestScore,
    availabilityMatch: availabilityScore,
    experienceMatch: experienceScore,
    resumeVerified: Boolean(candidate.resumeVerified),
    availability: candidate.availability || 'High',
    matchingSkills,
    reasons: reasons.slice(0, 4),
    projectsCount: (candidate.projects || []).length,
  };
};

/**
 * Recommendations API: GET /api/teams/:teamId/recommendations
 * Returns candidate recommendations ranked from highest to lowest match.
 */
export const getTeamRecommendations = (team, currentUserId = null) => {
  if (!team) return [];

  // Filter out students who are already members of this team
  const existingMemberIds = (team.members || []).map((m) => m.id || m.userId);
  const eligibleCandidates = MOCK_STUDENTS.filter((candidate) => {
    if (currentUserId && candidate.id === currentUserId) return false;
    if (existingMemberIds.includes(candidate.id)) return false;
    return true;
  });

  const scoredCandidates = eligibleCandidates.map((candidate) => calculateTeammateMatch(team, candidate));

  // Sort highest match first
  scoredCandidates.sort((a, b) => b.matchScore - a.matchScore);

  return scoredCandidates;
};
