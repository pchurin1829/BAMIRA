import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import nodemailer from 'nodemailer'
import crypto from 'crypto'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email } = req.body;
  // Construir transporter: ethereal en dev, SMTP real en prod
  let transporter;
  if (process.env.NODE_ENV === 'development') {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: { user: testAccount.user, pass: testAccount.pass }
    });
  } else {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(200).json({ ok: true });

  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 1000 * 60 * 60);
  await prisma.user.update({ where: { email }, data: { resetToken: token, resetTokenExpires: expires } });

  // Generar base URL según entorno
  const baseUrl = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : process.env.NEXT_PUBLIC_APP_URL;

  const link = `${baseUrl}/reset-password?token=${token}`;

  const info = await transporter.sendMail({
    to: email,
    subject: 'Restablece tu contraseña',
    html: `<p>Haz clic <a href="${link}">aquí</a> para cambiar tu contraseña. El enlace expira en 1 h.</p>`
  });

  // Mostrar URL de vista previa Ethereal en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.log('Ethereal preview URL:', nodemailer.getTestMessageUrl(info));
    console.log('Reset link:', link);
  }

  res.status(200).json({ ok: true });
}