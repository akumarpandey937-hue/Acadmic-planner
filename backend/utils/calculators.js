exports.calculateRequiredSGPA = (currentCGPA, targetCGPA, completedSemesters, remainingSemesters) => {
  const totalSemesters = completedSemesters + remainingSemesters;
  const requiredTotal = targetCGPA * totalSemesters;
  const currentTotal = currentCGPA * completedSemesters;
  const requiredSGPA = (requiredTotal - currentTotal) / remainingSemesters;
  return Math.round(requiredSGPA * 100) / 100;
};

exports.calculateDifficultyScore = (requiredSGPA) => {
  if (requiredSGPA <= 7) return 20;
  if (requiredSGPA <= 8) return 40;
  if (requiredSGPA <= 8.5) return 60;
  if (requiredSGPA <= 9) return 80;
  return 95;
};

exports.generateSemesterPlan = (currentCGPA, targetCGPA, remainingSemesters, completedSemesters = 4) => {
  const plan = [];
  let runningCGPA = currentCGPA;

  for (let i = 1; i <= remainingSemesters; i++) {
    const remaining = remainingSemesters - i + 1;
    const reqSGPA = exports.calculateRequiredSGPA(runningCGPA, targetCGPA, completedSemesters + i - 1, remaining);
    plan.push({
      semester: completedSemesters + i,
      targetSGPA: Math.min(reqSGPA, 10),
      subjects: [
        { name: 'Core Subject 1', targetGrade: reqSGPA >= 9 ? 'A+' : 'A', credits: 4 },
        { name: 'Core Subject 2', targetGrade: reqSGPA >= 9 ? 'A+' : 'A', credits: 4 },
        { name: 'Elective', targetGrade: reqSGPA >= 8.5 ? 'A' : 'B+', credits: 3 }
      ]
    });
    const totalSem = completedSemesters + i;
    runningCGPA = ((runningCGPA * (totalSem - 1)) + reqSGPA) / totalSem;
  }

  return plan;
};

exports.calculateAttendance = (present, total) => {
  if (!total) return { percentage: 0, classesNeeded: 0 };
  const percentage = Math.round((present / total) * 100 * 100) / 100;
  const needed = percentage < 75 ? Math.ceil((0.75 * total - present) / 0.25) : 0;
  return { percentage, classesNeeded: needed };
};

exports.predictExamScore = (internalMarks, attendance, assignments) => {
  const internalWeight = 0.4;
  const attendanceWeight = 0.1;
  const assignmentWeight = 0.2;
  const externalWeight = 0.3;

  const internalScore = (internalMarks / 100) * 100;
  const attendanceScore = Math.min(attendance, 100);
  const assignmentScore = (assignments / 100) * 100;
  const estimatedExternal = (internalScore * 0.8 + assignmentScore * 0.2);

  const predicted = (
    internalScore * internalWeight +
    attendanceScore * attendanceWeight +
    assignmentScore * assignmentWeight +
    estimatedExternal * externalWeight
  );

  return Math.round(predicted * 100) / 100;
};

exports.calculatePlacementReadiness = (dsa, dsaTarget, projects, projectTarget, aptitude, communication) => {
  const dsaScore = Math.min((dsa / dsaTarget) * 100, 100) * 0.35;
  const projectScore = Math.min((projects / projectTarget) * 100, 100) * 0.25;
  const aptitudeScore = aptitude * 0.2;
  const commScore = communication * 0.2;
  const total = Math.round(dsaScore + projectScore + aptitudeScore + commScore);

  const suggestions = [];
  if (dsa < dsaTarget * 0.5) suggestions.push('Solve at least 50 more DSA problems on LeetCode/HackerRank');
  if (projects < 2) suggestions.push('Build 2-3 full-stack projects with deployment');
  if (aptitude < 70) suggestions.push('Practice aptitude daily using IndiaBix or PrepInsta');
  if (communication < 70) suggestions.push('Join mock interview sessions and improve communication skills');
  if (total >= 80) suggestions.push('You are placement ready! Start applying to companies');

  return { readinessScore: total, suggestions };
};

exports.topperGapAnalysis = (student, topper) => {
  const gaps = {
    cgpaGap: topper.cgpa - student.cgpa,
    studyHoursGap: topper.studyHours - student.studyHours,
    dsaGap: topper.dsaSolved - student.dsaSolved,
    mockTestGap: topper.mockTests - student.mockTests
  };

  return {
    gaps,
    additionalStudyHours: Math.max(0, gaps.studyHoursGap),
    dsaTargets: Math.max(0, gaps.dsaGap),
    mockTestTargets: Math.max(0, gaps.mockTestGap),
    recommendations: [
      gaps.cgpaGap > 0 ? `Improve CGPA by ${gaps.cgpaGap.toFixed(2)} points` : 'CGPA on track',
      gaps.dsaGap > 0 ? `Solve ${gaps.dsaGap} more DSA problems` : 'DSA target met',
      gaps.studyHoursGap > 0 ? `Add ${gaps.studyHoursGap} hours/week study time` : 'Study hours adequate'
    ]
  };
};
