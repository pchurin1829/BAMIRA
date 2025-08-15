import NextAuth, { NextAuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '../../../lib/prisma';
import { verifyPassword } from '../../../lib/auth';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import speakeasy from 'speakeasy';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  // Session configuration
  session: {
  strategy: 'jwt' as const,
    maxAge: 60 * 60, // 1 hour
  },
  providers: [
  CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
        token: { label: 'Código 2FA (opcional)', type: 'text' },
      },
      async authorize(credentials, req) {
        if (!credentials) {
          throw new Error('Email y contraseña son requeridos');
        }
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user) {
          throw new Error('Email o contraseña incorrectos');
        }
        const isValid = await verifyPassword(credentials.password, user.password);
        if (!isValid) {
          throw new Error('Email o contraseña incorrectos');
        }
        // Verificar 2FA si está habilitado
        const twoFactorEnabled = (user as any).twoFactorEnabled;
        if (twoFactorEnabled) {
          if (!credentials.token) {
            throw new Error('Código 2FA requerido');
          }
          const secret = (user as any).twoFactorSecret as string;
          // DEBUG: log TOTP values for diagnosis
          console.log(`2FA authorize for ${user.email}: token=${credentials.token}, secret=${secret}`);
          const expected = speakeasy.totp({ secret, encoding: 'base32' });
          console.log('2FA expected now:', expected);
          // use verifyDelta to see drift
          const delta = speakeasy.totp.verifyDelta({ secret, encoding: 'base32', token: credentials.token, window: 5 });
          console.log('2FA verifyDelta result:', delta);
          if (!delta) {
            throw new Error('Código 2FA inválido');
          }
        }
        // Return user object with id as string
        return { id: String(user.id), email: user.email, name: user.nombre, rol: user.rol };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.rol = user.rol;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.rol = token.rol;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
