import type { NextApiRequest, NextApiResponse } from 'next';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { prisma } from '../../../lib/prisma';
import { hashPassword } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Rate limit registration by IP
  const rateLimiter = new RateLimiterMemory({ points: 5, duration: 3600 });
  const ip = req.headers['x-forwarded-for']?.toString().split(',')[0] || req.socket.remoteAddress || '';
  try {
    await rateLimiter.consume(ip);
  } catch {
    return res.status(429).json({ error: 'Demasiados intentos. Intenta más tarde.' });
  }
  // Sanitize inputs
  const nombre = String(req.body.nombre || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  // Validación de contraseña: mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres e incluir mayúsculas, minúsculas y números' });
  }
  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return res.status(409).json({ error: 'El email ya está registrado' });
  }

  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      nombre,
      email,
      password: hashedPassword,
      rol: 'user', // Forzar siempre rol user
    },
  });

  return res.status(201).json({ user: { id: user.id, email: user.email, nombre: user.nombre, rol: user.rol } });
}
