const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  presentClasses: { type: Number, default: 0 },
  totalClasses: { type: Number, default: 0 },
  semester: { type: Number },
  records: [{
    date: { type: Date, default: Date.now },
    present: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    note: String
  }]
}, { timestamps: true });

attendanceSchema.virtual('percentage').get(function () {
  if (!this.totalClasses) return 0;
  return Math.round((this.presentClasses / this.totalClasses) * 100 * 100) / 100;
});

attendanceSchema.set('toJSON', { virtuals: true });
attendanceSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
