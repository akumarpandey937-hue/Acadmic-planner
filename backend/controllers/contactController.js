const Notification = require('../models/Notification');
const User = require('../models/User');

exports.submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    const admins = await User.find({ role: 'admin' });

    if (admins.length) {
      await Notification.insertMany(admins.map(admin => ({
        user: admin._id,
        title: `Contact: ${subject}`,
        message: `From ${name} (${email}): ${message}`,
        type: 'info'
      })));
    }

    res.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
