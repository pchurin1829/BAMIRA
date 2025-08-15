import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../[...nextauth]';
import { prisma } from '../../../../lib/prisma';
import speakeasy from 'speakeasy';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  // Verificar sesión
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const { token } = req.body;
  if (typeof token !== 'string') {
    return res.status(400).json({ error: 'Token inválido' });
  }

  // Obtener secreto desde la BD
  const userRecord = await prisma.user.findUnique({ where: { email: session.user.email } });
  const dbSecret = userRecord?.twoFactorSecret;
  if (!dbSecret) {
    return res.status(400).json({ error: '2FA no configurado' });
  }
  // Verificar TOTP (window más amplio para tolerancia)
  const valid = speakeasy.totp.verify({
    secret: dbSecret!,
    encoding: 'base32',
    token,
    window: 2
  });
  if (!valid) {
    return res.status(400).json({ error: 'Código inválido' });
  }

  try {
    // Guardar 2FA en la cuenta del usuario
    await prisma.user.update({
      where: { email: session.user.email },
      data: { twoFactorEnabled: true }
    });
    return res.status(200).json({ ok: true });
  } catch (error: any) {
    console.error('2FA verify error:', error);
    return res.status(500).json({ error: 'Error interno al activar 2FA' });
  }
}
