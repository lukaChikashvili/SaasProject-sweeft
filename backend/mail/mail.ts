import nodemailer, { Transporter, SendMailOptions } from 'nodemailer'

export const transporter: Transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
     user: process.env.SMTP_USER,
     pass: process.env.SMTP_PASS
    }
 });

 interface SendEmailParams {
    toMail: string,
    subject: string,
    body: string
 }
 
 
 export const sendEmail = async ({toMail, subject, body}: SendEmailParams): Promise<void> => {
     const info: SendMailOptions = await transporter.sendMail({
         from: process.env.FROM_EMAIL,
         to: toMail,
         subject: subject,
         html: body
 
     })
 }