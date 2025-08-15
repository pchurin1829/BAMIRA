import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { prisma } from '../../../lib/prisma';
import bcrypt from 'bcrypt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const session = await getSession({ req });
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || !user.password) {
    return res.status(400).json({ error: 'Usuario no encontrado' });
  }

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) {
    return res.status(400).json({ error: 'Contraseña actual incorrecta' });
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { email: session.user.email }, data: { password: hashed } });

  res.status(200).json({ ok: true });
}
