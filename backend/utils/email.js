const nodemailer = require('nodemailer');
const config = require('../config/env');

let transporter = null;

const getTransporter = () => {
  if (!config.smtp.user || !config.smtp.pass) return null;
  if (config.smtp.user.includes('your-email') || config.smtp.pass.includes('your-app')) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      auth: { user: config.smtp.user, pass: config.smtp.pass }
    });
  }
  return transporter;
};

exports.sendEmail = async ({ to, subject, html }) => {
  const transport = getTransporter();
  if (!transport) {
    console.log(`[Email Mock] To: ${to} | Subject: ${subject}`);
    return { mock: true };
  }
  try {
    return await transport.sendMail({ from: config.smtp.from, to, subject, html });
  } catch (err) {
    console.warn('[Email Error]', err.message);
    return { mock: true, error: err.message };
  }
};

exports.verificationEmail = (name, token) => ({
  subject: 'Verify your AcademicOS account',
  html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <h2 style="color:#6366f1;">Welcome to AcademicOS, ${name}!</h2>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${config.frontendUrl}/verify-email.html?token=${token}" 
         style="display:inline-block;padding:12px 24px;background:#6366f1;color:white;text-decoration:none;border-radius:8px;">
        Verify Email
      </a>
      <p style="color:#666;margin-top:20px;">This link expires in 24 hours.</p>
    </div>`
});

exports.resetPasswordEmail = (name, token) => ({
  subject: 'Reset your AcademicOS password',
  html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <h2 style="color:#6366f1;">Password Reset</h2>
      <p>Hi ${name}, click below to reset your password:</p>
      <a href="${config.frontendUrl}/forgot-password.html?token=${token}" 
         style="display:inline-block;padding:12px 24px;background:#6366f1;color:white;text-decoration:none;border-radius:8px;">
        Reset Password
      </a>
      <p style="color:#666;margin-top:20px;">This link expires in 10 minutes.</p>
    </div>`
});
