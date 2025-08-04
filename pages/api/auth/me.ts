import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verifica la sesión del usuario usando cookies
  const user = getSession(req);
  if (user) {
    // Usuario autenticado
    res.status(200).json({ user });
  } else {
    // No autenticado
    res.status(401).json({ error: 'No autenticado' });
  }
}
