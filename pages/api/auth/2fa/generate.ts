import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../[...nextauth]';
import { prisma } from '../../../../lib/prisma';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' });
  try {

    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    // Permitir regenerar solo a admins
    const regen = req.query.regenerate === '1';
    if (regen && session.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No autorizado para regenerar 2FA' });
    }
    // Obtener o generar secreto TOTP (solo primera vez o regen autorizado)
    // @ts-ignore
    const record = await prisma.user.findUnique({ where: { email: session.user.email } }) as any;
  let base32Secret: string = record?.twoFactorSecret;
  // Generar nuevo secreto si no existe o si se solicita regeneración por admin
  if (!base32Secret || regen) {
      // Generar y guardar nuevo secreto solo al activar por primera vez
      const secretObj = speakeasy.generateSecret({ length: 20, issuer: 'AIM Exchange', name: session.user.email, encoding: 'base32' });
      base32Secret = secretObj.base32;
      // @ts-ignore
      await prisma.user.update({ where: { email: session.user.email }, data: { twoFactorSecret: base32Secret } });
    }
  // Construir URL OTPAuth con formato Issuer:Account para compatibilidad
  const issuer = 'AIM Exchange';
  const label = `${issuer}:${session.user.email}`;
  const otpauthUrl = speakeasy.otpauthURL({ secret: base32Secret, label, issuer, encoding: 'base32' });
  // DEBUG: mostrar la URL OTPAuth para verificar manualmente
  console.log('OTPAuth URL:', otpauthUrl);
  const qrCodeDataURL = await qrcode.toDataURL(otpauthUrl);
    return res.status(200).json({ qrCodeDataURL, secret: base32Secret });
  } catch (error: any) {
    console.error('2FA generate error:', error);
    return res.status(500).json({ error: error.message || 'Error interno' });
  }
}
