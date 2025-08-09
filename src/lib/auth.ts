/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth from 'next-auth/next';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import YandexProvider from 'next-auth/providers/yandex';
import { compare } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

const providers: any[] = [
  CredentialsProvider({
    name: 'credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;
      try {
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { username: credentials.email.toLowerCase() },
              { email: credentials.email.toLowerCase() }
            ]
          }
        });
        if (!user) return null;
        const isPasswordValid = await compare(credentials.password, user.password || '');
        if (!isPasswordValid) return null;
        return {
          id: user.id.toString(),
          email: user.email || user.username,
          name: user.username,
          role: user.role,
        };
      } catch (error) {
        console.error('Auth error:', error);
        return null;
      }
    },
  })
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }));
}
if (process.env.YANDEX_CLIENT_ID && process.env.YANDEX_CLIENT_SECRET) {
  providers.push(YandexProvider({
    clientId: process.env.YANDEX_CLIENT_ID,
    clientSecret: process.env.YANDEX_CLIENT_SECRET,
  }));
}

export const authOptions = {
  providers,
  session: { strategy: 'jwt' as const },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) token.role = user.role;
      return token;
    },
    async session({ session, token }: any) {
      if (token && session.user) {
        (session.user as any).id = token.sub || '';
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
