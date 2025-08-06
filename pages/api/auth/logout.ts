import type { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Solo acepta POST para logout
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  // Borra la cookie de sesión
  res.setHeader('Set-Cookie', serialize('session', '', {
    path: '/',
    httpOnly: true,
    maxAge: 0,
    sameSite: 'strict',
    // secure: true, // Solo en producción
  }));
  return res.status(200).json({ message: 'Sesión cerrada' });
}
