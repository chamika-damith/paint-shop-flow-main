const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

// Ensure environment variables are loaded
dotenv.config();

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  // Check if required environment variables are set
  const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName] || process.env[varName].trim() === '');
  
  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars.join(', '));
    return null;
  }

  console.log('Creating transporter with config:', {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    from: process.env.SMTP_FROM
  });

  const config = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    debug: true,
    logger: true
  };

  // Only add TLS options if not using secure connection
  if (!config.secure) {
    config.tls = {
      rejectUnauthorized: false
    };
  }

  return nodemailer.createTransport(config);
};

const transporter = createTransporter();

// Verify connection configuration
if (transporter) {
  console.log('Attempting to verify SMTP connection...');
  transporter.verify(function (error, success) {
    if (error) {
      console.log('Email service error:', error);
      console.log('Current configuration:');
      console.log(`SMTP_HOST=${process.env.SMTP_HOST || 'not set'}`);
      console.log(`SMTP_PORT=${process.env.SMTP_PORT || 'not set'}`);
      console.log(`SMTP_USER=${process.env.SMTP_USER || 'not set'}`);
      console.log(`SMTP_SECURE=${process.env.SMTP_SECURE || 'not set'}`);
      console.log(`SMTP_FROM=${process.env.SMTP_FROM || 'not set'}`);
      console.log('SMTP_PASS=<hidden>');
    } else {
      console.log('Email server is ready to send messages');
    }
  });
} else {
  console.log('Email service not configured. Please set the required environment variables.');
}

module.exports = transporter; 