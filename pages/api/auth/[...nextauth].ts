import NextAuth, { NextAuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '../../../lib/prisma';
import { verifyPassword } from '../../../lib/auth';
import { RateLimiterMemory } from 'rate-limiter-flexible';

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
