const nodemailer = require('nodemailer');

/**
 * Send an email using Gmail SMTP
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 * @param {string} [options.text] - Email plain text content
 * @param {string} [options.from] - Sender email address (defaults to EMAIL_USER)
 */
async function sendEmail({ to, subject, html, text, from }) {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: from || process.env.EMAIL_USER,
    to,
    subject,
    html,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('❌ Gmail SMTP email error:', error);
    throw error;
  }
}

module.exports = { sendEmail };
