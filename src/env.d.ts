/// <reference types="astro/client" />

/**
 * Minimale Typdeklaration fuer nodemailer. Wir nutzen nur createTransport und
 * sendMail; eine externe @types-Abhaengigkeit wird damit vermieden. Der Server
 * importiert das Paket dynamisch (src/lib/mail.server.ts).
 */
declare module "nodemailer" {
  export interface TransportAuth {
    user: string;
    pass: string;
  }

  export interface TransportOptions {
    host: string;
    port: number;
    secure?: boolean;
    auth?: TransportAuth;
  }

  export interface SendMailOptions {
    from: string;
    to: string;
    replyTo?: string;
    subject: string;
    text: string;
  }

  export interface SentMessageInfo {
    messageId: string;
  }

  export interface Transporter {
    sendMail(options: SendMailOptions): Promise<SentMessageInfo>;
    verify(): Promise<boolean>;
  }

  export function createTransport(options: TransportOptions): Transporter;

  const nodemailer: { createTransport: typeof createTransport };
  export default nodemailer;
}
