import type { NextApiRequest, NextApiResponse } from 'next';
import { unstable_getServerSession } from 'next-auth/next';
import { authOptions } from './[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Obtiene sesión de NextAuth
  const session = await unstable_getServerSession(req, res, authOptions);
  if (session) {
    return res.status(200).json({ user: session.user });
  }
  return res.status(401).json({ error: 'No autenticado' });
}
