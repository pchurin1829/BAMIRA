import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { verifyPassword } from '../../../lib/auth';
import { serialize } from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña requeridos' });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
  }

  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
  }

  // Crear cookie de sesión simple (puedes mejorar con JWT o sesiones seguras)
  const session = {
    id: user.id,
    email: user.email,
    nombre: user.nombre,
    rol: user.rol,
  };
  res.setHeader('Set-Cookie', serialize('session', JSON.stringify(session), {
    path: '/',
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 1 semana
  }));

  return res.status(200).json({ user: session });
}
