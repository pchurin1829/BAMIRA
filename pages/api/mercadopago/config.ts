import type { NextApiRequest, NextApiResponse } from 'next';
import { isMpConfigured } from '../../../lib/mercadopago';

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  return res.status(200).json({ enabled: isMpConfigured() });
}
