import NextAuth from 'next-auth/next';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Ищем пользователя по username (который является email)
        const user = await prisma.user.findUnique({
          where: { username: credentials.email.toLowerCase() },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password || ''
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id.toString(),
          email: user.email || user.username,
          name: user.username,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.sub,
          role: token.role,
        };
      }
      return session;
    },
  },
  pages: {
    signIn: '/',
    error: '/',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
