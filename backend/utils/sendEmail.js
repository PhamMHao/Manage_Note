const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        service: 'Gmail', // or another email service
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: options.email,
        subject: options.subject,
        text: options.text || options.message, // Fallback to message if text not provided
        html: options.html // Add support for HTML emails
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;