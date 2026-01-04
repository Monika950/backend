/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import * as nodemailer from 'nodemailer';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly transporter: nodemailer.Transporter<nodemailer.SentMessageInfo>;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false, // true = port 465, false = port 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    this.transporter
      .verify()
      .then(() => this.logger.log('Mailer connected successfully'))
      .catch((err) =>
        this.logger.error('Mailer connection failed:', err.message),
      );
  }

  async sendPasswordResetEmail(email: string, resetLink: string) {
    const mailOptions = {
      from: 'Auth-backend service',
      to: email,
      subject: 'Password Reset Request',
      html: `<p>You requested a password reset. Click the link below to reset your password:</p><p><a href="${resetLink}">Reset Password</a></p>`,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
