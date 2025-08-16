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
      // При первом входе user есть; проставим роль из user
      if (user && (user as any).role) {
        token.role = (user as any).role;
        return token;
      }
      // Если роль ещё не определена (например, при входе через OAuth без Prisma Adapter),
      // подтянем её из нашей таблицы пользователей по email
      if (!token.role && token?.email) {
        try {
          const dbUser = await prisma.user.findFirst({
            where: {
              OR: [
                { email: token.email.toLowerCase() },
                { username: token.email.toLowerCase() },
              ],
            },
          });
          if (dbUser) token.role = dbUser.role;
        } catch (e) {
          console.error('JWT role fetch error:', e);
        }
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token && session.user) {
        (session.user as any).id = token.sub || '';
        (session.user as any).role = token.role;
      }
      return session;
    },
    async signIn({ user, account }: any) {
      // Для OAuth провайдеров создаём/обновляем пользователя в нашей таблице User
      if (account && account.provider !== 'credentials') {
        try {
          const email = (user.email || '').toLowerCase();
          const username = (user.name || email || 'user').toLowerCase();
          if (!email && !username) return true; // пропускаем, если данных нет

          const existing = await prisma.user.findFirst({
            where: {
              OR: [
                email ? { email } : undefined,
                username ? { username } : undefined,
              ].filter(Boolean) as any,
            },
          });

          if (existing) {
            // Обновим e-mail/имя при необходимости
            await prisma.user.update({
              where: { id: existing.id },
              data: {
                email: email || existing.email,
                username: existing.username || username,
              },
            });
            // Проставим роль в user, чтобы попала в JWT
            (user as any).role = existing.role;
          } else {
            const created = await prisma.user.create({
              data: {
                username: username || email || `user_${Date.now()}`,
                email: email || null,
                // Пароль обязателен по схеме; ставим заглушку, OAuth его не использует
                password: 'oauth',
                role: 'user',
              },
            });
            (user as any).role = created.role;
          }
        } catch (e) {
          console.error('OAuth signIn upsert error:', e);
          // Разрешаем вход даже если апсертом не удалось, чтобы не блокировать пользователей
          return true;
        }
      }
      return true;
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
