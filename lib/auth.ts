// lib/auth.ts
import bcrypt from 'bcrypt';
import { NextApiRequest } from 'next';
import { parse } from 'cookie';

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return await bcrypt.compare(password, hashedPassword)
}

export function getSession(req: NextApiRequest) {
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  if (!cookies.session) return null;
  try {
    return JSON.parse(cookies.session);
  } catch {
    return null;
  }
}
