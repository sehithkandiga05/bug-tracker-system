const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.EMAIL_PORT || '2525'),
    auth: {
      user: process.env.EMAIL_USER || 'demo_user',
      pass: process.env.EMAIL_PASS || 'demo_pass',
    },
  });
};

const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `"Bug Tracker Automation System" <${process.env.EMAIL_USER || 'no-reply@bugtracker.system'}>`,
      to,
      subject,
      html,
    });
    console.log(`[Email Service] Email sent successfully to ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.warn(`[Email Service Warning] Failed to send email to ${to}: ${error.message}`);
    return false;
  }
};

const sendBugAssignedEmail = async (developerEmail, developerName, bugTitle, bugId) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0f172a; padding: 20px; text-align: center; color: white;">
        <h2 style="margin: 0;">🐞 Bug Assigned to You</h2>
      </div>
      <div style="padding: 24px; color: #334155;">
        <p>Hello <strong>${developerName}</strong>,</p>
        <p>You have been assigned a new bug report in the system:</p>
        <div style="background-color: #f8fafc; padding: 16px; border-left: 4px solid #3b82f6; margin: 16px 0;">
          <h3 style="margin: 0 0 8px 0; color: #1e293b;">${bugTitle}</h3>
          <p style="margin: 0; font-size: 14px; color: #64748b;">Bug ID: ${bugId}</p>
        </div>
        <p>Please review and update the status as you work on resolving it.</p>
      </div>
    </div>
  `;
  return sendEmail({ to: developerEmail, subject: `[Assigned] ${bugTitle}`, html });
};

const sendStatusUpdateEmail = async (recipientEmail, recipientName, bugTitle, oldStatus, newStatus) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0f172a; padding: 20px; text-align: center; color: white;">
        <h2 style="margin: 0;">🔄 Bug Status Updated</h2>
      </div>
      <div style="padding: 24px; color: #334155;">
        <p>Hello <strong>${recipientName}</strong>,</p>
        <p>The status of bug report <strong>"${bugTitle}"</strong> has changed:</p>
        <p style="font-size: 16px;">
          <span style="color: #64748b; text-decoration: line-through;">${oldStatus}</span> 
          &rarr; 
          <strong style="color: #10b981;">${newStatus}</strong>
        </p>
      </div>
    </div>
  `;
  return sendEmail({ to: recipientEmail, subject: `[Status Change: ${newStatus}] ${bugTitle}`, html });
};

module.exports = {
  sendEmail,
  sendBugAssignedEmail,
  sendStatusUpdateEmail,
};
