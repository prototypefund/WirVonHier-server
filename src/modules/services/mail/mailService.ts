import sgMail from '@sendgrid/mail';
import { ClientResponse } from '@sendgrid/client/src/response';
import { config } from 'config';
import { IBusiness, IUser, User } from 'persistance/models';
import { tokenService } from '..';

const dummyMailer = {
  setApiKey(key: string): string {
    return key;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  send(data: { [key: string]: string }): any {
    return `Email sent to ${data.to}`;
  },
};
const sendgrid = process.env.NODE_ENV === 'production' ? sgMail : dummyMailer;
export interface IMailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
}

export class MailService {
  constructor() {
    sendgrid.setApiKey(`${config.sendgrid.apiKey}`);
  }

  send(options: IMailOptions): Promise<[ClientResponse, {}]> {
    const { to, from, subject, html } = options;
    const data = {
      to,
      subject,
      html,
      from: `${from}@wirvonhier.net`,
    };
    return sendgrid.send(data);
    // TODO: Add Logging (also logged in sendgrid dashboard)
  }

  sendInvitationEmail(businesses: IBusiness[]): void {
    for (const business of businesses) {
      // eslint-disable-next-line no-console
      console.log('sending email to: ', business.email);
    }
  }
  sendForgotPasswordMail(user: IUser): void {
    const resetPasswordToken = tokenService.createResetPasswordToken(user);
    const data = {
      to: user.email,
      from: `WirVonHier <service@wirvonheir.net>`,
      subject: 'Passwort zurücksetzen',
      html: `https://app.wirvonhier.net/change-password?token=${resetPasswordToken}`, // needs to contain JWT for authentication.
    };
    sendgrid.send(data);
  }

  async sendPasswordChangedEmail(userId: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) return;
    const data = {
      to: user.email,
      from: `WirVonHier <service@wirvonheir.net>`,
      subject: 'Passwort erfolgreich geändert',
      html: `Your Password has been successfully changed.`,
    };
    sendgrid.send(data);
  }
}

export const mailService = new MailService();
