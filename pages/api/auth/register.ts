import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { hashPassword } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { nombre, email, password, rol } = req.body;
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
      rol: rol || 'user',
    },
  });

  return res.status(201).json({ user: { id: user.id, email: user.email, nombre: user.nombre, rol: user.rol } });
}
