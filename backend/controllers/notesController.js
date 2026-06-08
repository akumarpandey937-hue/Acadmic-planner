const Note = require('../models/Note');
const path = require('path');
const { generateNotes, extractTextFromPDF } = require('../services/aiService');
const User = require('../models/User');

exports.create = async (req, res) => {
  try {
    const note = await Note.create({ user: req.user.id, ...req.body });
    res.status(201).json({ success: true, data: note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.generateFromFile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.aiCredits < 2) {
      return res.status(403).json({ success: false, message: 'Insufficient AI credits (need 2)' });
    }

    const text = await extractTextFromPDF(req.file.path);
    const title = req.body.title || req.file.originalname;
    const aiContent = await generateNotes(text, title);

    const note = await Note.create({
      user: req.user.id,
      title,
      type: 'ai-generated',
      aiContent,
      sourceFile: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      }
    });

    user.aiCredits -= 2;
    await user.save();

    res.status(201).json({ success: true, data: note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAll = async (req, res) => {
  const notes = await Note.find({ user: req.user.id }).sort('-createdAt');
  res.json({ success: true, data: notes });
};

exports.update = async (req, res) => {
  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    req.body,
    { new: true }
  );
  if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
  res.json({ success: true, data: note });
};

exports.delete = async (req, res) => {
  await Note.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  res.json({ success: true, message: 'Note deleted' });
};
