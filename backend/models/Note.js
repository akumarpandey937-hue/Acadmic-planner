const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, default: '' },
  subject: String,
  tags: [String],
  isPinned: { type: Boolean, default: false },
  type: { type: String, enum: ['manual', 'ai-generated'], default: 'manual' },
  aiContent: {
    summary: String,
    importantQuestions: [String],
    flashcards: [{ question: String, answer: String }],
    quiz: [{ question: String, options: [String], correctAnswer: Number }]
  },
  sourceFile: {
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number
  }
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);
