import sgMail from '@sendgrid/mail';
import { ClientResponse } from '@sendgrid/client/src/response';
import { config } from 'config';

const dummyMailer = {
  setApiKey(key: string): string {
    return key;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  send(data: { [key: string]: string }): any {
    return `Email sent to ${data.to}`;
  },
};
const isProd = process.env.NODE_ENV === 'production';
const sendgrid = isProd ? sgMail : dummyMailer;
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
      to: isProd ? to : '',
      subject,
      html,
      from: `WirVonHier <${from || 'hallo'}@wirvonhier.net>`,
    };
    return sendgrid.send(data);
    // TODO: Add Logging (also logged in sendgrid dashboard)
  }
}

export const mailService = new MailService();
