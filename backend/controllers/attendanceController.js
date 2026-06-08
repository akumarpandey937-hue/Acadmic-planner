const Attendance = require('../models/Attendance');
const { calculateAttendance } = require('../utils/calculators');

exports.createOrUpdate = async (req, res) => {
  try {
    const { subject, presentClasses, totalClasses, semester } = req.body;
    let record = await Attendance.findOne({ user: req.user.id, subject });

    if (record) {
      record.presentClasses = presentClasses;
      record.totalClasses = totalClasses;
      record.records.push({ present: presentClasses, total: totalClasses });
    } else {
      record = await Attendance.create({
        user: req.user.id,
        subject,
        presentClasses,
        totalClasses,
        semester,
        records: [{ present: presentClasses, total: totalClasses }]
      });
    }

    await record.save();
    const calc = calculateAttendance(presentClasses, totalClasses);

    res.json({
      success: true,
      data: { ...record.toObject(), ...calc }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAll = async (req, res) => {
  const records = await Attendance.find({ user: req.user.id });
  const enriched = records.map(r => ({
    ...r.toObject(),
    ...calculateAttendance(r.presentClasses, r.totalClasses)
  }));
  res.json({ success: true, data: enriched });
};

exports.predict = async (req, res) => {
  const { presentClasses, totalClasses, futureClasses } = req.body;
  const current = calculateAttendance(presentClasses, totalClasses);
  const projectedTotal = totalClasses + (futureClasses || 0);
  const projected = calculateAttendance(presentClasses, projectedTotal);

  res.json({
    success: true,
    data: {
      current,
      projected,
      canReach75: projected.percentage >= 75,
      recommendation: current.classesNeeded > 0
        ? `Attend next ${current.classesNeeded} classes without missing any`
        : 'Attendance is above 75%'
    }
  });
};
