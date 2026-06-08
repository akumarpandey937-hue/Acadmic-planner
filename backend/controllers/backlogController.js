const Backlog = require('../models/Backlog');

exports.create = async (req, res) => {
  try {
    const { subjects } = req.body;

    const sorted = [...subjects].sort((a, b) => new Date(a.examDate) - new Date(b.examDate));
    const roadmap = [];
    let week = 1;

    sorted.forEach((sub) => {
      roadmap.push({
        week,
        subject: sub.name,
        tasks: [`Complete syllabus for ${sub.name}`, `Solve previous year papers`, `Take mock test`],
        hours: 20
      });
      week++;
    });

    const backlog = await Backlog.create({
      user: req.user.id,
      subjects: sorted.map((s, i) => ({ ...s, priority: i + 1 })),
      recoveryRoadmap: roadmap
    });

    res.status(201).json({ success: true, data: backlog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAll = async (req, res) => {
  const backlogs = await Backlog.find({ user: req.user.id }).sort('-createdAt');
  res.json({ success: true, data: backlogs });
};

exports.updateStatus = async (req, res) => {
  const backlog = await Backlog.findOne({ _id: req.params.id, user: req.user.id });
  if (!backlog) return res.status(404).json({ success: false, message: 'Not found' });

  const { subjectIndex, status } = req.body;
  if (backlog.subjects[subjectIndex]) {
    backlog.subjects[subjectIndex].status = status;
    await backlog.save();
  }

  res.json({ success: true, data: backlog });
};
