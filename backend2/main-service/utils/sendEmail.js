import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config(); // Ensure environment variables are loaded

const sendEmail = async (options) => {
  // 1. Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587', 10), // Ensure port is a number
    secure: parseInt(process.env.EMAIL_PORT || '587', 10) === 465, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // For Gmail, you might need to adjust TLS settings if you encounter issues
    // tls: {
    //   rejectUnauthorized: false // Only use for local development if necessary
    // }
  });

  // 2. Define the email options
  const mailOptions = {
    from: process.env.EMAIL_FROM, // Sender address (Display name <email@example.com>)
    to: options.to, // List of receivers
    subject: options.subject, // Subject line
    text: options.text, // Plain text body
    html: options.html, // HTML body (optional, provide one or the other, or both)
  };

  // 3. Actually send the email
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Email could not be sent. Please try again later or contact support.');
  }
};

export default sendEmail;