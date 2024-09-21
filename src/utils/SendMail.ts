import sendgrid from '@sendgrid/mail';

import { MailOptions } from '../types';

const { SENDGRID_API_KEY, MAIL_FROM } = process.env;
sendgrid.setApiKey(SENDGRID_API_KEY!);

class SendMail {
  static async verifyEmail({ email, OTP }: MailOptions) {
    try {
      const options = {
        to: email,
        from: MAIL_FROM!,
        subject: 'Welcome to the BookMyShow',
        html: `
          <div>
            <p>We're glad to have a user like you.</p>
            <p style="font-weight: 500">OTP: ${OTP}</p>
            <p>Hope, you'll enjoy our services.</p>

            <h4>Regards,<h4>
            <h4>BookMyShow</h4>
          </div>
        `
      };

      await sendgrid.send(options);
    } catch (err) {
      console.log(err);
    }
  }

  static async resetPasswordMail({ name, email, link }: MailOptions) {
    try {
      const options = {
        to: email,
        from: MAIL_FROM!,
        subject: 'Your password reset link. Expires in 10 minutes',
        html: `
          <div>
            <h3>Hi, ${name}</h3>
            <p>Please click <a href="${link}">here</a> to reset your password.</p>
            <p>If not, please ignore this email.</p>

            <h4>Regards,<h4>
            <h4>Workspace</h4>
          </div>
      `
      };

      await sendgrid.send(options);
    } catch (err) {
      console.log(err);
    }
  }
}

export default SendMail;
